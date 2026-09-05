import { createHash, timingSafeEqual } from 'crypto'

/**
 * Firma de las llamadas internas al Motor 1.
 *
 * arrancarEstructuracion.ts dispara /api/estructurar-proyecto desde el propio
 * servidor, sin sesión de nadie. Esta firma es lo que le permite a la ruta
 * reconocer esa llamada: solo se puede calcular teniendo la llave de servicio
 * de Supabase, que ya vive en el servidor. Así no hace falta configurar
 * ninguna variable nueva en Vercel.
 *
 * Va atada al proyecto, para que una firma filtrada no sirva para otro.
 */

export const CABECERA_INTERNA = 'x-serving-motor'

export function firmaInterna(proyectoId: string): string {
  const llave = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return createHash('sha256').update(`motor-1:${llave}:${proyectoId}`).digest('hex')
}

export function cabeceraInterna(proyectoId: string): Record<string, string> {
  return { [CABECERA_INTERNA]: firmaInterna(proyectoId) }
}

export function firmasIguales(a: string, b: string): boolean {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}
