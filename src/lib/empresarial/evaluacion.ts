/**
 * Evaluación preliminar de una oportunidad (Camino A) — 9 criterios, 100 puntos.
 * Reglas fijas, sin IA. Puntaje = Σ(calificación × peso) / 5. Cada calificación va de 1 a 5.
 * Un puntaje alto NO prueba que exista demanda: solo ordena qué conviene validar primero.
 */

export interface Criterio {
  clave: string
  nombre: string
  peso: number
  pregunta: string
  /** Qué significa cada nivel, de 1 a 5. */
  guia: [string, string, string, string, string]
}

export const CRITERIOS: Criterio[] = [
  {
    clave: 'relevancia',
    nombre: 'Qué tan importante es el problema',
    peso: 20,
    pregunta: '¿Qué tan importante es el problema o la necesidad que atiende?',
    guia: [
      'Poco definido y sin evidencia',
      'Identificado, pero de importancia limitada o incierta',
      'Relevante para un grupo que se puede identificar',
      'Frecuente y con consecuencias que se pueden demostrar',
      'Muy importante, documentado y con afectados identificados',
    ],
  },
  {
    clave: 'demanda',
    nombre: 'Interés de quienes la usarían',
    peso: 15,
    pregunta: '¿Hay interés real de personas o empresas en que esto se resuelva?',
    guia: [
      'No hay señales de interés',
      'Interés supuesto, sin comprobar',
      'Algunas señales aisladas (conversaciones, comentarios)',
      'Señales claras (entrevistas, solicitudes, pedidos)',
      'Interés comprobado (compras, cartas de intención, lista de espera)',
    ],
  },
  {
    clave: 'diferencial',
    nombre: 'Qué tan distinta o mejor es la solución',
    peso: 15,
    pregunta: '¿En qué se diferencia de lo que ya existe?',
    guia: [
      'Igual a lo que ya existe',
      'Diferencia pequeña',
      'Mejora reconocible en algún aspecto',
      'Diferencia clara y valorada',
      'Diferencia fuerte y difícil de copiar',
    ],
  },
  {
    clave: 'tecnica',
    nombre: 'Se puede hacer técnicamente',
    peso: 10,
    pregunta: '¿Se sabe cómo hacerla con tecnología y conocimientos al alcance?',
    guia: [
      'No se sabe cómo hacerla',
      'Muy incierto, requiere mucha investigación',
      'Posible, con retos importantes',
      'Viable con lo que hoy se conoce',
      'Muy viable, ya se ha hecho algo parecido',
    ],
  },
  {
    clave: 'financiera',
    nombre: 'Se puede pagar y sostener',
    peso: 10,
    pregunta: '¿Los ingresos o ahorros esperados cubrirían lo que cuesta?',
    guia: [
      'No hay idea de costos ni ingresos',
      'Parece que cuesta más de lo que deja',
      'Podría cubrirse, falta hacer cuentas',
      'Cuentas iniciales favorables',
      'Cuentas claras y favorables',
    ],
  },
  {
    clave: 'capacidades',
    nombre: 'Tienes lo necesario para hacerla',
    peso: 10,
    pregunta: '¿Cuentas con las personas, el conocimiento y los recursos?',
    guia: [
      'Falta casi todo',
      'Falta mucho',
      'Hay la mitad; el resto se puede conseguir',
      'Hay la mayoría',
      'Cuentas con todo lo esencial',
    ],
  },
  {
    clave: 'acceso',
    nombre: 'Llegas a quien la necesita',
    peso: 10,
    pregunta: '¿Puedes llegar a los clientes o beneficiarios?',
    guia: [
      'No sabes quiénes son ni cómo llegar',
      'Sabes quiénes son, pero no cómo llegar',
      'Tienes algunos contactos',
      'Tienes un canal para llegar',
      'Ya trabajas con ellos o tienes acceso directo',
    ],
  },
  {
    clave: 'impacto',
    nombre: 'Impacto y duración en el tiempo',
    peso: 5,
    pregunta: '¿Deja un beneficio que dure y que se pueda mantener?',
    guia: [
      'Beneficio mínimo o pasajero',
      'Beneficio limitado',
      'Beneficio moderado',
      'Beneficio importante y sostenible',
      'Beneficio grande, medible y duradero',
    ],
  },
  {
    clave: 'alineacion',
    nombre: 'Encaja con lo que quieres lograr',
    peso: 5,
    pregunta: '¿Va en la misma dirección que tus metas y tu estrategia?',
    guia: [
      'No tiene relación',
      'Relación débil',
      'Relación parcial',
      'Bien alineada',
      'Totalmente alineada con tus metas',
    ],
  },
]

export type Calificaciones = Record<string, number | undefined>

/** Calificaciones ya puestas / total de criterios. */
export function criteriosCalificados(c: Calificaciones): number {
  return CRITERIOS.filter((k) => typeof c[k.clave] === 'number').length
}

/** Puntaje sobre 100. Devuelve null si falta algún criterio (no se inventa un puntaje parcial). */
export function calcularPuntaje(c: Calificaciones): number | null {
  let suma = 0
  for (const k of CRITERIOS) {
    const v = c[k.clave]
    if (typeof v !== 'number') return null
    suma += v * k.peso
  }
  return Math.round((suma / 5) * 100) / 100
}

export interface Banda {
  nombre: string
  texto: string
}

export function bandaDe(puntaje: number): Banda {
  if (puntaje < 40) return { nombre: 'Débil', texto: 'Está poco definida o es insuficiente. Conviene precisarla antes de seguir.' }
  if (puntaje < 60) return { nombre: 'Necesita ajustes', texto: 'Requiere ajustes e investigación antes de invertir esfuerzo.' }
  if (puntaje < 75) return { nombre: 'Interesante', texto: 'Es interesante, pero debe validarse con personas reales.' }
  if (puntaje < 90) return { nombre: 'Prioritaria', texto: 'Es prioritaria para pasar a una validación más a fondo.' }
  return { nombre: 'Alto potencial', texto: 'Tiene alto potencial preliminar. Aun así, falta comprobarlo.' }
}

/** Avisos de cautela: calificar alto sin sustento no vale. */
export function avisosDeCautela(c: Calificaciones, justificaciones: Record<string, string | undefined>): string[] {
  const avisos: string[] = []
  const sinMotivo = (clave: string) => !(justificaciones[clave] ?? '').trim()
  if ((c.demanda ?? 0) >= 4 && sinMotivo('demanda')) {
    avisos.push('Calificaste alto el interés de los usuarios, pero no escribiste en qué te basas. Sin evidencia, es mejor calificar más bajo.')
  }
  if ((c.capacidades ?? 5) <= 2) {
    avisos.push('Te faltan capacidades: anótalo como una brecha que hay que cubrir (personas, conocimiento o recursos).')
  }
  if ((c.acceso ?? 5) <= 2) {
    avisos.push('Todavía no llegas a quienes la necesitan: piensa primero cómo acercarte a ellos (conversaciones, aliados, redes).')
  }
  return avisos
}

export const DECISIONES = [
  { clave: 'priorizar', nombre: 'Priorizar', ayuda: 'Es de las primeras que voy a trabajar.' },
  { clave: 'validar', nombre: 'Validar', ayuda: 'Primero comprobar con personas reales.' },
  { clave: 'reformular', nombre: 'Reformular', ayuda: 'La idea sirve, pero hay que cambiarla.' },
  { clave: 'combinar', nombre: 'Combinar con otra', ayuda: 'Se junta con otra oportunidad.' },
  { clave: 'aplazar', nombre: 'Aplazar', ayuda: 'No ahora; la retomo después.' },
  { clave: 'descartar', nombre: 'Descartar', ayuda: 'No la voy a desarrollar. Queda el historial.' },
  { clave: 'observar', nombre: 'Mantener en observación', ayuda: 'La dejo quieta y la sigo mirando.' },
] as const

export type ClaveDecision = (typeof DECISIONES)[number]['clave']

/** Estado de la oportunidad que corresponde a cada decisión. null = el estado no cambia. */
export const ESTADO_POR_DECISION: Record<ClaveDecision, string | null> = {
  priorizar: 'Priorizada',
  validar: 'En validación',
  reformular: null,
  combinar: null,
  aplazar: null,
  descartar: 'Descartada',
  observar: null,
}

const CLAVES_ATRACTIVO = ['relevancia', 'demanda', 'diferencial', 'impacto', 'alineacion']
const CLAVES_VIABILIDAD = ['tecnica', 'financiera', 'capacidades', 'acceso']

/** Atractivo (qué tan valiosa parece) y viabilidad (qué tan posible parece), cada uno sobre 100. */
export function atractivoYViabilidad(c: Calificaciones): { atractivo: number; viabilidad: number } {
  const sobre100 = (claves: string[]) => {
    const lista = CRITERIOS.filter((k) => claves.includes(k.clave))
    const peso = lista.reduce((s, k) => s + k.peso, 0)
    const suma = lista.reduce((s, k) => s + (c[k.clave] ?? 0) * k.peso, 0)
    return Math.round((suma / (5 * peso)) * 100)
  }
  return { atractivo: sobre100(CLAVES_ATRACTIVO), viabilidad: sobre100(CLAVES_VIABILIDAD) }
}

/** Prioridad sugerida: mezcla el puntaje con lo que se tiene a la mano. Es una guía, no una orden. */
export function prioridadSugerida(c: Calificaciones, puntaje: number): string {
  const viable = ((c.tecnica ?? 0) + (c.financiera ?? 0) + (c.capacidades ?? 0) + (c.acceso ?? 0)) / 4
  if (puntaje >= 75 && viable >= 3.5) return 'Alta: atractiva y posible de hacer'
  if (puntaje >= 75) return 'Media: atractiva, pero faltan recursos o acceso'
  if (puntaje >= 60 && viable >= 3) return 'Media: validar pronto'
  if (puntaje >= 40) return 'Baja por ahora: ajustar e investigar'
  return 'Muy baja: precisar la idea'
}
