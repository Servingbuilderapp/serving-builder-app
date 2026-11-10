/**
 * Cálculo del diagnóstico empresarial (perfiles A, C y D).
 *
 * Es una función pura: las mismas respuestas dan siempre el mismo resultado.
 * La inteligencia artificial NO calcula nada: redacta, pero los números salen de aquí.
 *
 * Reglas (Documento Maestro y Manual de Diagnóstico):
 *  - Las respuestas "No aplica" se sacan del cálculo.
 *  - "No sé", "No tengo la información" y "Prefiero no responder" nunca cuentan como cero:
 *    no puntúan y solo bajan la cobertura.
 *  - Una dimensión con menos de 50 % de cobertura se marca "información insuficiente".
 *  - Puntaje de dimensión = Σ(respuesta × peso) / Σ(pesos puntuables), de 1 a 5.
 *  - Índice general = promedio de las dimensiones evaluables según su peso, de 1 a 5.
 *  - Se pasa a escala 0–100: ((índice − 1) / 4) × 100.
 *  - Con menos de 40 % de cobertura general no se calcula resultado;
 *    de 40 a 59,99 % es provisional.
 *  - Las preguntas con peso 0 (por ejemplo, las de texto libre del perfil A) no
 *    suman ni restan: no afectan ni el puntaje ni la cobertura.
 */

export type EstadoRespuesta = 'respondida' | 'no_aplica' | 'no_se' | 'sin_informacion' | 'prefiere_no'

export interface PreguntaCalculo {
  id: string
  dimension_id: string
  peso: number
}

export interface DimensionCalculo {
  id: string
  codigo: string
  peso: number
}

export interface RespuestaCalculo {
  pregunta_id: string
  estado_respuesta: EstadoRespuesta
  valor: number | null
}

export type Confianza = 'provisional' | 'media' | 'alta'

export interface PuntajeDimension {
  dimension_id: string
  puntaje_1_5: number | null
  puntaje_100: number | null
  cobertura: number
  informacion_suficiente: boolean
}

export interface ResultadoDiagnostico {
  dimensiones: PuntajeDimension[]
  /** Índice de 1 a 5 (null si no se puede calcular). */
  indice_1_5: number | null
  /** Índice en escala 0–100 (null si no se puede calcular). */
  puntaje_100: number | null
  cobertura: number
  confianza: Confianza | null
  banda: string | null
  /** false cuando la cobertura general es menor a 40 %. */
  calculable: boolean
}

export const COBERTURA_MINIMA_DIMENSION = 50
export const COBERTURA_MINIMA_RESULTADO = 40
export const COBERTURA_RESULTADO_DEFINITIVO = 60
export const COBERTURA_ALTA = 85

const BANDAS: [number, number, string][] = [
  [0, 20, 'Inicial'],
  [20, 40, 'Básico'],
  [40, 60, 'En desarrollo'],
  [60, 80, 'Consolidado'],
  [80, 100.01, 'Avanzado'],
]

export function bandaDeMadurez(puntaje100: number): string {
  const banda = BANDAS.find(([desde, hasta]) => puntaje100 >= desde && puntaje100 < hasta)
  return banda ? banda[2] : 'Avanzado'
}

const redondear = (n: number, decimales = 2) => {
  const f = 10 ** decimales
  return Math.round(n * f) / f
}

export function calcularDiagnostico(
  dimensiones: DimensionCalculo[],
  preguntas: PreguntaCalculo[],
  respuestas: RespuestaCalculo[],
): ResultadoDiagnostico {
  const respuestaPorPregunta = new Map(respuestas.map((r) => [r.pregunta_id, r]))

  let pesoAplicableTotal = 0
  let pesoPuntuableTotal = 0
  const dimensionesCalculadas: PuntajeDimension[] = []

  let sumaIndice = 0
  let sumaPesosDimension = 0

  for (const dim of dimensiones) {
    const delaDimension = preguntas.filter((p) => p.dimension_id === dim.id)

    let pesoAplicable = 0
    let pesoPuntuable = 0
    let sumaPonderada = 0

    for (const p of delaDimension) {
      const r = respuestaPorPregunta.get(p.id)
      if (r?.estado_respuesta === 'no_aplica') continue // se saca del cálculo

      pesoAplicable += p.peso
      if (r?.estado_respuesta === 'respondida' && r.valor !== null) {
        pesoPuntuable += p.peso
        sumaPonderada += r.valor * p.peso
      }
    }

    pesoAplicableTotal += pesoAplicable
    pesoPuntuableTotal += pesoPuntuable

    const cobertura = pesoAplicable > 0 ? (pesoPuntuable / pesoAplicable) * 100 : 0
    const suficiente = cobertura >= COBERTURA_MINIMA_DIMENSION && pesoPuntuable > 0
    const puntaje15 = suficiente ? sumaPonderada / pesoPuntuable : null

    if (suficiente && puntaje15 !== null) {
      sumaIndice += puntaje15 * dim.peso
      sumaPesosDimension += dim.peso
    }

    dimensionesCalculadas.push({
      dimension_id: dim.id,
      puntaje_1_5: puntaje15 === null ? null : redondear(puntaje15),
      puntaje_100: puntaje15 === null ? null : redondear(((puntaje15 - 1) / 4) * 100),
      cobertura: redondear(cobertura),
      informacion_suficiente: suficiente,
    })
  }

  const coberturaGeneral = pesoAplicableTotal > 0 ? (pesoPuntuableTotal / pesoAplicableTotal) * 100 : 0
  const calculable = coberturaGeneral >= COBERTURA_MINIMA_RESULTADO && sumaPesosDimension > 0

  if (!calculable) {
    return {
      dimensiones: dimensionesCalculadas,
      indice_1_5: null,
      puntaje_100: null,
      cobertura: redondear(coberturaGeneral),
      confianza: null,
      banda: null,
      calculable: false,
    }
  }

  const indice = sumaIndice / sumaPesosDimension
  const puntaje100 = ((indice - 1) / 4) * 100
  const confianza: Confianza =
    coberturaGeneral >= COBERTURA_ALTA
      ? 'alta'
      : coberturaGeneral >= COBERTURA_RESULTADO_DEFINITIVO
        ? 'media'
        : 'provisional'

  return {
    dimensiones: dimensionesCalculadas,
    indice_1_5: redondear(indice),
    puntaje_100: redondear(puntaje100),
    cobertura: redondear(coberturaGeneral),
    confianza,
    banda: bandaDeMadurez(puntaje100),
    calculable: true,
  }
}
