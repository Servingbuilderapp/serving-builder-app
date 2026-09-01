/**
 * Regla del espejo.
 *
 * El árbol de objetivos es el árbol de problemas dicho en positivo: se copia
 * el enunciado tal cual y solo se cambia la palabra de polaridad del principio.
 * Nada más. No se reescribe la frase, no se adorna y no se inventa contenido:
 * lo que propone esta función es un borrador que el equipo revisa y corrige.
 *
 * Si el enunciado no empieza por una palabra de polaridad conocida, se
 * devuelve vacío en vez de inventar algo. Es preferible que el estructurador
 * lo escriba a mano antes que dejar una frase rara dentro del proyecto.
 */

const OPUESTOS: Record<string, string> = {
  // menos de lo que debería haber
  bajo: 'alto',
  baja: 'alta',
  bajos: 'altos',
  bajas: 'altas',
  escaso: 'suficiente',
  escasa: 'suficiente',
  escasos: 'suficientes',
  escasas: 'suficientes',
  insuficiente: 'suficiente',
  insuficientes: 'suficientes',
  poco: 'suficiente',
  poca: 'suficiente',
  pocos: 'suficientes',
  pocas: 'suficientes',
  limitado: 'amplio',
  limitada: 'amplia',
  limitados: 'amplios',
  limitadas: 'amplias',
  reducido: 'amplio',
  reducida: 'amplia',
  debil: 'fuerte',
  débil: 'fuerte',
  debiles: 'fuertes',
  débiles: 'fuertes',
  nulo: 'pleno',
  nula: 'plena',

  // más de lo que debería haber
  alto: 'bajo',
  alta: 'baja',
  altos: 'bajos',
  altas: 'bajas',
  excesivo: 'adecuado',
  excesiva: 'adecuada',
  elevado: 'adecuado',
  elevada: 'adecuada',

  // calidad
  deficiente: 'adecuado',
  deficientes: 'adecuados',
  inadecuado: 'adecuado',
  inadecuada: 'adecuada',
  inadecuados: 'adecuados',
  inadecuadas: 'adecuadas',
  malo: 'bueno',
  mala: 'buena',
  malos: 'buenos',
  malas: 'buenas',
  precario: 'adecuado',
  precaria: 'adecuada',
  precarias: 'adecuadas',
  precarios: 'adecuados',

  // sustantivos que nombran la ausencia
  ausencia: 'existencia',
  inexistencia: 'existencia',
  falta: 'disponibilidad',
  carencia: 'disponibilidad',
  debilidad: 'fortaleza',
  debilidades: 'fortalezas',
  desconocimiento: 'conocimiento',
  desarticulacion: 'articulación',
  desarticulación: 'articulación',
  dificultad: 'facilidad',
  dificultades: 'facilidades',
  perdida: 'recuperación',
  pérdida: 'recuperación',
  perdidas: 'recuperación',
  pérdidas: 'recuperación',
  deterioro: 'mejoramiento',
  desigualdad: 'equidad',
  exclusion: 'inclusión',
  exclusión: 'inclusión',
}

/** Verbos que se ofrecen para abrir el objetivo general. */
export const VERBOS_OBJETIVO = [
  'Mejorar',
  'Fortalecer',
  'Incrementar',
  'Ampliar',
  'Reducir',
  'Promover',
  'Establecer',
  'Garantizar',
] as const

function mayusculaInicial(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

/**
 * Devuelve el enunciado en positivo cambiando solo la primera palabra.
 * Devuelve cadena vacía si no reconoce esa primera palabra.
 */
export function espejoPositivo(enunciado: string): string {
  const limpio = (enunciado || '').trim()
  if (!limpio) return ''

  const partes = limpio.split(/\s+/)
  const primera = partes[0]
  const clave = primera.toLowerCase().replace(/[.,;:]$/, '')

  // "No hay X" -> "Hay X"
  if (clave === 'no' && partes[1]) {
    return mayusculaInicial(partes.slice(1).join(' '))
  }

  const opuesto = OPUESTOS[clave]
  if (!opuesto) return ''

  return mayusculaInicial([opuesto, ...partes.slice(1)].join(' '))
}

/**
 * Propuesta para el objetivo general: el problema central en positivo y
 * abierto con un verbo en infinitivo, como lo pide la metodología.
 */
export function espejoObjetivoGeneral(problemaCentral: string, verbo: string): string {
  const limpio = (problemaCentral || '').trim()
  if (!limpio) return ''

  const partes = limpio.split(/\s+/)
  const clave = partes[0].toLowerCase().replace(/[.,;:]$/, '')

  // Si arranca con una palabra de polaridad, esa palabra se cae y el verbo
  // ocupa su lugar: "Bajo acceso a…" -> "Mejorar el acceso a…"
  const resto = OPUESTOS[clave] ? partes.slice(1) : partes
  if (resto.length === 0) return ''

  const cuerpo = resto.join(' ')
  return `${verbo} ${cuerpo.charAt(0).toLowerCase()}${cuerpo.slice(1)}`
}

/** ¿El texto arranca con un verbo en infinitivo? (termina en ar, er o ir) */
export function arrancaConInfinitivo(texto: string): boolean {
  const primera = (texto || '').trim().split(/\s+/)[0] || ''
  return /^[a-záéíóúñ]{4,}(ar|er|ir)$/i.test(primera)
}
