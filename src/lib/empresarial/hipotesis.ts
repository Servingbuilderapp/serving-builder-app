/**
 * Hipótesis, experimentos y evidencias (Camino A, paso 4) — reglas simples, sin IA.
 * Una oportunidad es una idea. Una hipótesis es algo que creemos y todavía NO hemos comprobado.
 * Solo la evidencia permite decir que una hipótesis está "validada".
 */

export const TIPOS_HIPOTESIS = [
  { valor: 'problema', etiqueta: 'El problema es real', ayuda: 'Que de verdad le pasa a alguien y le importa.' },
  { valor: 'cliente', etiqueta: 'Sobre quién lo necesita', ayuda: 'Quién es y cuántos son.' },
  { valor: 'solucion', etiqueta: 'La solución funciona', ayuda: 'Que lo que propones sí resuelve el problema.' },
  { valor: 'valor', etiqueta: 'Genera valor', ayuda: 'Que el beneficio es suficiente para que lo quieran.' },
  { valor: 'comercial', etiqueta: 'Pagarían o comprarían', ayuda: 'Que alguien pagaría y cuánto.' },
  { valor: 'operativa', etiqueta: 'Podemos hacerlo', ayuda: 'Que tienes los recursos y el equipo para hacerlo.' },
] as const

export type TipoHipotesis = (typeof TIPOS_HIPOTESIS)[number]['valor']

export const IMPORTANCIAS = [
  { valor: 'baja', etiqueta: 'Baja' },
  { valor: 'media', etiqueta: 'Media' },
  { valor: 'alta', etiqueta: 'Alta' },
  { valor: 'crítica', etiqueta: 'Crítica' },
] as const

export const ESTADOS_HIPOTESIS = [
  { valor: 'pendiente', etiqueta: 'Por comprobar' },
  { valor: 'validada', etiqueta: 'Validada' },
  { valor: 'parcialmente_validada', etiqueta: 'Validada en parte' },
  { valor: 'no_validada', etiqueta: 'No se cumplió' },
  { valor: 'no_concluyente', etiqueta: 'Sin conclusión' },
] as const

export type EstadoHipotesis = (typeof ESTADOS_HIPOTESIS)[number]['valor']

/** Estados que afirman que algo SÍ se comprobó: exigen evidencia. */
export const ESTADOS_QUE_EXIGEN_EVIDENCIA: EstadoHipotesis[] = ['validada', 'parcialmente_validada']

export const NIVELES_EVIDENCIA = [
  { valor: 'E0', etiqueta: 'E0 · Sin evidencia', ayuda: 'Solo es una idea o una sensación.' },
  { valor: 'E1', etiqueta: 'E1 · Lo dice la persona', ayuda: 'Una declaración tuya o de alguien, sin soporte.' },
  { valor: 'E2', etiqueta: 'E2 · Testimonio o registro', ayuda: 'Entrevistas, encuestas, fotos, registros propios.' },
  { valor: 'E3', etiqueta: 'E3 · Documento o dato verificable', ayuda: 'Facturas, contratos, cartas de intención, datos con fuente.' },
  { valor: 'E4', etiqueta: 'E4 · Revisado por un tercero', ayuda: 'Alguien independiente lo revisó o lo certificó.' },
] as const

export type NivelEvidencia = (typeof NIVELES_EVIDENCIA)[number]['valor']

export const TIPOS_EVIDENCIA = [
  { valor: 'entrevista', etiqueta: 'Entrevista' },
  { valor: 'observacion', etiqueta: 'Observación' },
  { valor: 'declaracion', etiqueta: 'Declaración' },
  { valor: 'registro', etiqueta: 'Registro o datos propios' },
  { valor: 'documento', etiqueta: 'Documento' },
  { valor: 'reporte', etiqueta: 'Reporte o informe' },
  { valor: 'foto', etiqueta: 'Foto' },
  { valor: 'certificado', etiqueta: 'Certificado' },
  { valor: 'enlace', etiqueta: 'Enlace' },
  { valor: 'fuente_externa', etiqueta: 'Fuente externa' },
] as const

export type TipoEvidencia = (typeof TIPOS_EVIDENCIA)[number]['valor']

export const TIPOS_EXPERIMENTO = [
  'Entrevistas a posibles clientes',
  'Encuesta',
  'Observación en terreno',
  'Prototipo o muestra',
  'Prueba piloto pequeña',
  'Preventa o carta de intención',
  'Revisión de datos o fuentes',
] as const

/** Tipos de experimento donde participan personas: se pide declarar que tienen permiso. */
export const EXPERIMENTOS_CON_PERSONAS = [
  'Entrevistas a posibles clientes',
  'Encuesta',
  'Observación en terreno',
  'Prueba piloto pequeña',
  'Preventa o carta de intención',
]

export interface Hipotesis {
  id: string
  oportunidad_id: string
  tipo: TipoHipotesis
  enunciado: string
  importancia: string | null
  riesgo_si_falsa: string | null
  estado: EstadoHipotesis
  fecha_limite: string | null
  creada_en: string
}

export interface Experimento {
  id: string
  hipotesis_id: string
  tipo: string
  objetivo: string | null
  metodo: string | null
  muestra: string | null
  resultado: string | null
  conclusion: string | null
  declara_consentimiento: boolean
  inicia_en: string | null
  termina_en: string | null
  creada_en: string
}

export interface Evidencia {
  id: string
  oportunidad_id: string | null
  hipotesis_id: string | null
  experimento_id: string | null
  enlace: string | null
  fuente: string | null
  tipo: TipoEvidencia
  nivel: NivelEvidencia
  descripcion: string | null
  estado_revision: 'pendiente' | 'revisada' | 'rechazada'
  creada_en: string
}

/** Una evidencia rechazada no cuenta. */
export const evidenciasQueCuentan = (ev: Evidencia[]) => ev.filter((e) => e.estado_revision !== 'rechazada')

/** ¿Puede esta hipótesis pasar a "validada" o "validada en parte"? Solo con evidencia real (E1 o más). */
export function puedeAfirmar(ev: Evidencia[]): boolean {
  return evidenciasQueCuentan(ev).some((e) => e.nivel !== 'E0')
}

/** El nivel más alto de evidencia que respalda una hipótesis. */
export function mejorNivel(ev: Evidencia[]): NivelEvidencia {
  const orden = ['E0', 'E1', 'E2', 'E3', 'E4']
  const validas = evidenciasQueCuentan(ev)
  if (validas.length === 0) return 'E0'
  return validas.reduce((m, e) => (orden.indexOf(e.nivel) > orden.indexOf(m) ? e.nivel : m), 'E0' as NivelEvidencia)
}

/* ------------------------------------------------------------------ */
/* Hipótesis sugeridas desde la ficha de la oportunidad                */
/* ------------------------------------------------------------------ */

export interface OportunidadFicha {
  nombre: string
  descripcion: string | null
  cliente_o_beneficiario: string | null
  solucion_propuesta: string | null
  valor_generado: string | null
}

export interface HipotesisSugerida {
  tipo: TipoHipotesis
  enunciado: string
  importancia: 'alta' | 'crítica'
  riesgo_si_falsa: string
}

/**
 * Reglas: de cada dato de la ficha que la persona ya escribió, sale una hipótesis para comprobarlo.
 * Siempre se sugiere al menos la del problema y la comercial, porque son las más riesgosas.
 * No repite tipos que ya tienen una hipótesis con el mismo enunciado.
 */
export function sugerirHipotesis(o: OportunidadFicha, existentes: Pick<Hipotesis, 'enunciado'>[]): HipotesisSugerida[] {
  const hecho = new Set(existentes.map((h) => h.enunciado.trim().toLowerCase()))
  const quien = o.cliente_o_beneficiario?.trim() || 'las personas a quienes va dirigida'
  const lista: HipotesisSugerida[] = [
    {
      tipo: 'problema',
      enunciado: o.descripcion?.trim()
        ? `Es verdad que ocurre esto, y le importa a ${quien}: ${o.descripcion.trim()}`
        : `El problema que resuelve “${o.nombre}” es real y le importa a ${quien}.`,
      importancia: 'crítica',
      riesgo_si_falsa: 'Estarías construyendo algo que nadie necesita.',
    },
  ]
  if (o.cliente_o_beneficiario?.trim()) {
    lista.push({
      tipo: 'cliente',
      enunciado: `${o.cliente_o_beneficiario.trim()} existen en cantidad suficiente y se pueden alcanzar.`,
      importancia: 'alta',
      riesgo_si_falsa: 'El mercado podría ser demasiado pequeño o inalcanzable.',
    })
  }
  if (o.solucion_propuesta?.trim()) {
    lista.push({
      tipo: 'solucion',
      enunciado: `Esta solución resuelve el problema: ${o.solucion_propuesta.trim()}`,
      importancia: 'alta',
      riesgo_si_falsa: 'La solución no resolvería lo que importa y habría que cambiarla.',
    })
  }
  if (o.valor_generado?.trim()) {
    lista.push({
      tipo: 'valor',
      enunciado: `El beneficio es real y suficiente: ${o.valor_generado.trim()}`,
      importancia: 'alta',
      riesgo_si_falsa: 'El beneficio podría ser menor del esperado.',
    })
  }
  lista.push({
    tipo: 'comercial',
    enunciado: `Hay personas dispuestas a pagar por “${o.nombre}”.`,
    importancia: 'crítica',
    riesgo_si_falsa: 'Podría haber interés pero no ingresos.',
  })
  return lista.filter((h) => !hecho.has(h.enunciado.trim().toLowerCase()))
}
