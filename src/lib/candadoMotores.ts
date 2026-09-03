import { createHash } from 'crypto'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { esEquipoServing } from '@/lib/guardiaEquipo'

/**
 * CANDADO DE LOS MOTORES
 *
 * Los motores cuestan plata: cada vez que uno arranca, se le paga a Google por
 * el trabajo de la inteligencia artificial. Sin candado, cualquiera que conozca
 * la dirección puede ponerlos a correr desde fuera y gastar el cupo — o el
 * dinero — sin que nadie se entere.
 *
 * Aquí se decide quién tiene derecho a encender un motor. Hay cuatro llaves:
 *
 *   1. La llave interna: cuando un motor llama al siguiente. Los motores se
 *      llaman entre ellos desde el servidor, sin sesión de nadie, así que
 *      firman la llamada con una huella que solo el servidor puede calcular.
 *   2. La llave del reloj: la búsqueda semanal automática de convocatorias.
 *   3. El equipo de Serving.
 *   4. El dueño del proyecto, y solo sobre su propio proyecto.
 *
 * Quien no tenga ninguna de las cuatro, no pasa.
 */

const CABECERA_INTERNA = 'x-motor-interno'

/**
 * Huella que identifica una llamada hecha por la propia plataforma.
 *
 * Se calcula a partir de la llave de servicio de la base de datos, que solo
 * existe en el servidor. Se manda la huella y nunca la llave, así que aunque
 * alguien viera la cabecera no podría deducir nada.
 */
function firmaInterna(): string | null {
  const semilla = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!semilla) return null
  return createHash('sha256').update(`motor:${semilla}`).digest('hex')
}

/**
 * Cabeceras que debe llevar toda llamada de un motor a otro.
 * Se usa así:  headers: { 'Content-Type': 'application/json', ...cabecerasInternas() }
 */
export function cabecerasInternas(): Record<string, string> {
  const firma = firmaInterna()
  return firma ? { [CABECERA_INTERNA]: firma } : {}
}

function esLlamadaInterna(request: NextRequest): boolean {
  const firma = firmaInterna()
  if (!firma) return false
  return request.headers.get(CABECERA_INTERNA) === firma
}

/**
 * El reloj semanal de Vercel. Para que funcione hay que tener creada la
 * variable CRON_SECRET en Vercel; sin ella, la búsqueda masiva queda cerrada a
 * propósito, porque es la llamada más cara de toda la plataforma.
 */
function esElRelojSemanal(request: NextRequest): boolean {
  const secreto = process.env.CRON_SECRET
  if (!secreto) return false
  return request.headers.get('authorization') === `Bearer ${secreto}`
}

/**
 * ¿Quien está llamando tiene derecho a encender el motor?
 *
 * Si se pasa `proyectoId`, además del equipo se acepta al dueño de ese
 * proyecto. Si no se pasa (por ejemplo la búsqueda masiva, que toca todos los
 * proyectos), solo pasan la llave interna, el reloj y el equipo.
 */
export async function motorAutorizado(
  request: NextRequest,
  proyectoId?: string | null,
): Promise<boolean> {
  if (esLlamadaInterna(request)) return true
  if (esElRelojSemanal(request)) return true

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false
    if (await esEquipoServing()) return true
    if (!proyectoId) return false

    const { data: proyecto } = await supabase
      .from('proyectos_clientes_serving')
      .select('correo_cliente')
      .eq('id', proyectoId)
      .maybeSingle<{ correo_cliente: string | null }>()

    return (
      (proyecto?.correo_cliente || '').toLowerCase().trim() ===
      (user.email || '').toLowerCase().trim()
    )
  } catch {
    // Ante la duda, no se abre.
    return false
  }
}
