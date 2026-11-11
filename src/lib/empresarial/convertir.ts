/**
 * Convertir una oportunidad en proyecto (Camino A, paso 4, parte 5) — reglas simples, sin IA.
 * Una oportunidad pasa a formulación solo cuando está lo bastante clara y comprobada.
 * Hay requisitos OBLIGATORIOS (sin ellos no se puede) y RECOMENDADOS (se puede, con aviso).
 */

export interface FichaConversion {
  estado: string
  cliente_o_beneficiario: string | null
  solucion_propuesta: string | null
  valor_generado: string | null
  proyecto_derivado_id: string | null
}

export interface HipotesisConversion {
  tipo: string
  estado: string
}

export interface RequisitoConversion {
  clave: string
  texto: string
  cumple: boolean
  obligatorio: boolean
  /** Qué hacer si no se cumple. */
  ayuda: string
}

const MIN_PUNTAJE_RECOMENDADO = 60

const lleno = (s: string | null) => Boolean(s && s.trim())
const afirmada = (estado: string) => estado === 'validada' || estado === 'parcialmente_validada'

export function revisarRequisitos(
  ficha: FichaConversion,
  hipotesis: HipotesisConversion[],
  puntaje: number | null,
): RequisitoConversion[] {
  const tipoValidado = (tipo: string) => {
    const deTipo = hipotesis.filter((h) => h.tipo === tipo)
    return deTipo.length > 0 && deTipo.some((h) => h.estado === 'validada')
  }
  return [
    {
      clave: 'ficha',
      texto: 'La ficha tiene para quién genera valor, la solución y el beneficio.',
      cumple: lleno(ficha.cliente_o_beneficiario) && lleno(ficha.solucion_propuesta) && lleno(ficha.valor_generado),
      obligatorio: true,
      ayuda: 'Completa la ficha en “Mis oportunidades”.',
    },
    {
      clave: 'hipotesis',
      texto: 'Al menos una hipótesis está validada, con evidencia.',
      cumple: hipotesis.some((h) => afirmada(h.estado)),
      obligatorio: true,
      ayuda: 'Valida una hipótesis en “Validar esta oportunidad”.',
    },
    {
      clave: 'evaluacion',
      texto: `Fue evaluada y sacó ${MIN_PUNTAJE_RECOMENDADO} puntos o más.`,
      cumple: puntaje !== null && puntaje >= MIN_PUNTAJE_RECOMENDADO,
      obligatorio: false,
      ayuda: puntaje === null ? 'Califícala en “Evaluar y comparar”.' : 'Su puntaje es bajo; revisa si vale la pena.',
    },
    {
      clave: 'problema',
      texto: 'Está validado que el problema es real.',
      cumple: tipoValidado('problema'),
      obligatorio: false,
      ayuda: 'Valida la hipótesis del problema.',
    },
    {
      clave: 'comercial',
      texto: 'Está validado que alguien pagaría o compraría.',
      cumple: tipoValidado('comercial'),
      obligatorio: false,
      ayuda: 'Valida la hipótesis comercial; sin esto el proyecto puede no tener ingresos.',
    },
  ]
}

export type EstadoConversion = 'ya_convertida' | 'descartada' | 'bloqueada' | 'con_avisos' | 'lista'

/** Resume en qué punto está una oportunidad frente a la conversión. */
export function estadoConversion(ficha: FichaConversion, requisitos: RequisitoConversion[]): EstadoConversion {
  if (ficha.proyecto_derivado_id) return 'ya_convertida'
  if (ficha.estado === 'Descartada') return 'descartada'
  if (requisitos.some((r) => r.obligatorio && !r.cumple)) return 'bloqueada'
  if (requisitos.some((r) => !r.obligatorio && !r.cumple)) return 'con_avisos'
  return 'lista'
}
