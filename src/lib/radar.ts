/**
 * RADAR — la anatomía de los términos de referencia.
 *
 * Una convocatoria no se lee de corrido: se lee por partes, y son siempre las
 * mismas siete. Este archivo es el único sitio donde están escritas, para que
 * la ficha, el formulario de carga y el motor de encaje hablen del mismo
 * vocabulario.
 *
 * El orden importa: la elegibilidad va de primera porque es una PUERTA, no un
 * punto. Si el proyecto no es elegible —ni él ni ningún aliado suyo— no hay
 * nada más que mirar.
 */

/** Las siete partes en que se lee un pliego. */
export const ANATOMIA_TDR = [
  {
    clave: 'elegibilidad',
    titulo: 'Quién está habilitado',
    ayuda: 'Qué figura jurídica pide: ONG, fundación, empresa, universidad, persona natural, consorcio.',
  },
  {
    clave: 'geografia',
    titulo: 'Dónde',
    ayuda: 'Países elegibles y sector. Es la segunda puerta: si el país no está, no hay postulación.',
  },
  {
    clave: 'objetivo',
    titulo: 'El objetivo real',
    ayuda: 'Para qué entrega el dinero de verdad esta convocatoria, no lo que dice el título.',
  },
  {
    clave: 'evaluacion',
    titulo: 'Con qué califica',
    ayuda: 'Los criterios de evaluación y su peso. Es lo que hay que responder en el proyecto.',
  },
  {
    clave: 'dinero',
    titulo: 'Monto y contrapartida',
    ayuda: 'Cuánto entregan y cuánto hay que poner. La contrapartida se ofrece aunque no la pidan: habla de compromiso.',
  },
  {
    clave: 'cronograma',
    titulo: 'Los hitos',
    ayuda: 'Cuándo abre, cuándo cierra, cuándo dan resultados y cuánto dura el proyecto.',
  },
  {
    clave: 'habilitantes',
    titulo: 'Requisitos habilitantes',
    ayuda: 'Los documentos y condiciones sin los cuales ni siquiera reciben la postulación.',
  },
] as const

/** Figuras que puede exigir un pliego como postulante. */
export const TIPOS_POSTULANTE = [
  'ong',
  'fundacion',
  'esal',
  'empresa',
  'empresa_social',
  'universidad',
  'centro_investigacion',
  'entidad_publica',
  'persona_natural',
  'consorcio',
  'cooperativa',
] as const

export type TipoPostulante = (typeof TIPOS_POSTULANTE)[number]

/** Cada cuánto vuelve a abrir. Alimenta el calendario predictivo. */
export const PERIODICIDADES = [
  'anual',
  'semestral',
  'trimestral',
  'permanente',
  'unica',
  'irregular',
] as const

/** Clases de documento que puede traer una convocatoria. */
export const CLASES_DOCUMENTO = [
  'terminos_referencia',
  'anexo',
  'formato',
  'guia',
  'otro',
] as const

export const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
] as const

/**
 * La clave que impide que la misma convocatoria entre dos veces escrita de
 * otra manera: nombre y entidad sin tildes, sin mayúsculas y sin dobles
 * espacios. Es la misma regla que ya usa la biblioteca.
 */
export function claveDeConvocatoria(nombre: string, entidad: string): string {
  const limpiar = (t: string) =>
    (t || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .replace(/\s+/g, '-')

  return `${limpiar(nombre)}--${limpiar(entidad)}`.replace(/^-+|-+$/g, '')
}

/**
 * Convierte lo que el equipo escribe en una casilla ("Colombia, Perú, Ecuador")
 * en la lista que guarda la base de datos. Acepta comas y saltos de línea.
 */
export function aLista(texto: string | null | undefined): string[] {
  if (!texto) return []
  return texto
    .split(/[,\n;]+/)
    .map((t) => t.trim())
    .filter(Boolean)
}

/** Días que faltan para una fecha. Negativo si ya pasó. Null si no hay fecha. */
export function diasHasta(fecha: string | null | undefined): number | null {
  if (!fecha) return null
  const destino = new Date(fecha)
  if (Number.isNaN(destino.getTime())) return null
  const hoy = new Date()
  const unDia = 1000 * 60 * 60 * 24
  return Math.ceil((destino.setHours(0, 0, 0, 0) - hoy.setHours(0, 0, 0, 0)) / unDia)
}

/**
 * El semáforo del cierre, con el protocolo de última milla ya metido: el
 * formulario final se diligencia al menos 20 días antes del cierre, así que
 * por debajo de eso ya no es "queda tiempo", es "corriendo".
 */
export function semaforoCierre(fecha: string | null | undefined) {
  const dias = diasHasta(fecha)
  if (dias === null) return { estado: 'sin_fecha' as const, dias: null, texto: 'Sin fecha de cierre' }
  if (dias < 0) return { estado: 'cerrada' as const, dias, texto: 'Ya cerró' }
  if (dias <= 7) return { estado: 'critico' as const, dias, texto: `Cierra en ${dias} día${dias === 1 ? '' : 's'}` }
  if (dias <= 20) return { estado: 'corriendo' as const, dias, texto: `Cierra en ${dias} días` }
  return { estado: 'holgado' as const, dias, texto: `Cierra en ${dias} días` }
}
