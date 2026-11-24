/**
 * "TRAE TU PROYECTO LISTO" — el miembro sube un proyecto que ya tiene hecho.
 * Queda una constancia de que el proyecto es suyo: quién lo declaró, cuándo,
 * desde qué conexión y la huella digital (SHA-256) del archivo exacto que subió.
 *
 * No se necesitan columnas nuevas: los datos van dentro de `respuestas` con
 * claves que empiezan con "_" (las que el editor paso a paso nunca usa).
 */

export const CLAVE_ORIGEN = '_origen'
export const CLAVE_ARCHIVO_RUTA = '_archivo_ruta'
export const CLAVE_ARCHIVO_NOMBRE = '_archivo_nombre'
export const CLAVE_ARCHIVO_BYTES = '_archivo_bytes'
export const CLAVE_ARCHIVO_HUELLA = '_archivo_huella'
export const CLAVE_DECLARACION = '_declaracion'

export const ORIGEN_TRAIDO = 'trae_listo'
export const BUCKET_PROYECTOS = 'documentos-proyectos'
export const CARPETA_LISTOS = 'membresias-listos'
export const MAX_BYTES_PROYECTO_LISTO = 30 * 1024 * 1024
export const EXTENSIONES_PERMITIDAS = ['pdf', 'doc', 'docx']

export const TEXTO_DECLARACION_AUTORIA =
  'Declaro que este proyecto es de mi autoría o de la organización que represento, que tengo derecho a presentarlo, que no copia obras de terceros ni infringe derechos de autor, y que me hago responsable de su contenido. Autorizo a Serving Proyectos Estratégicos SAS a usarlo únicamente para postularlo a las convocatorias que yo escoja.'

export type DeclaracionAutoria = {
  texto: string
  declarante: string
  correo: string
  aceptada_en: string
  ip: string
  navegador: string
  archivo_nombre: string
  archivo_bytes: number
  archivo_huella_sha256: string
}

export function esProyectoTraido(respuestas: Record<string, string> | null | undefined): boolean {
  return respuestas?.[CLAVE_ORIGEN] === ORIGEN_TRAIDO
}

export function leerDeclaracion(respuestas: Record<string, string> | null | undefined): DeclaracionAutoria | null {
  const bruto = respuestas?.[CLAVE_DECLARACION]
  if (!bruto) return null
  try {
    return JSON.parse(bruto) as DeclaracionAutoria
  } catch {
    return null
  }
}

/** Parte de la ruta del archivo que identifica al dueño (solo letras y números). */
export function carpetaDeCorreo(correo: string): string {
  return correo.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 80)
}

export function nombreSeguroArchivo(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .slice(-90)
}

/** Cuántas convocatorias puede postular el miembro por cada proyecto. Es la regla de la membresía: no se abre. */
export const MAX_POSTULACIONES_POR_PROYECTO = 3
export const CLAVE_POSTULACIONES = '_postulaciones'

export type PostulacionRegistrada = {
  id: string | null
  texto: string
  fuente_oficial: string | null
  requisitos: string | null
  mecanismo: string | null
  registrada_en: string
}

export function leerPostulaciones(respuestas: Record<string, string> | null | undefined): PostulacionRegistrada[] {
  const bruto = respuestas?.[CLAVE_POSTULACIONES]
  if (!bruto) return []
  try {
    const lista = JSON.parse(bruto)
    return Array.isArray(lista) ? (lista as PostulacionRegistrada[]) : []
  } catch {
    return []
  }
}
