import { createClient } from '@/lib/supabase/server'
import { esEquipoServing } from '@/lib/guardiaEquipo'
import { CABECERA_INTERNA, firmaInterna, firmasIguales } from '@/lib/firmaMotor'

/**
 * Candado del Motor 1.
 *
 * /api/estructurar-proyecto trabaja con la llave de servicio de Supabase y
 * consume cuota de Gemini. Sin candado, cualquiera que supiera la dirección
 * podía dispararlo sobre el proyecto de otro y quemar la cuota del día.
 *
 * Hay dos maneras legítimas de llamarlo:
 *
 * 1. Por dentro, sin usuario: arrancarEstructuracion.ts lo dispara con after()
 *    desde el propio servidor. Esa llamada se reconoce por su firma.
 * 2. Desde el navegador, con sesión: el dueño del proyecto, o el equipo de
 *    Serving (el botón de repuesto de la pestaña «Estructuración»).
 */
export async function puedeCorrerElMotor(
  request: Request,
  proyectoId: string
): Promise<boolean> {
  const firma = request.headers.get(CABECERA_INTERNA)
  if (firma && process.env.SUPABASE_SERVICE_ROLE_KEY && firmasIguales(firma, firmaInterna(proyectoId))) {
    return true
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    const { data: proyecto } = await supabase
      .from('proyectos_clientes_serving')
      .select('id, correo_cliente')
      .eq('id', proyectoId)
      .maybeSingle<{ id: string; correo_cliente: string | null }>()

    const esDueno =
      !!proyecto &&
      (proyecto.correo_cliente || '').toLowerCase().trim() ===
        (user.email || '').toLowerCase().trim()

    if (esDueno) return true
  } catch {
    /* si la sesión no se puede leer, se cae al candado del equipo */
  }

  return esEquipoServing()
}
