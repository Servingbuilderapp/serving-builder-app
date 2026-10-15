import { createClient } from '@/lib/supabase/server'

// Correos que entran como equipo de Serving (la base de datos todavía no tiene la columna users.role).
const CORREOS_ADMIN = ['servingbuilderapp@gmail.com', 'iagif1964@gmail.com']

/**
 * Candado para las rutas de los motores.
 *
 * Las rutas de postulación y de réplica trabajan con la llave de servicio de
 * Supabase, o sea que pasan por encima de los permisos de fila. Sin este
 * candado, cualquiera que supiera la dirección podría disparar el motor sobre
 * el proyecto de otro. Solo el equipo de Serving puede.
 */
export async function esEquipoServing(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false
    if (CORREOS_ADMIN.includes((user.email || '').toLowerCase().trim())) return true

    const { data: perfil } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle<{ role: string | null }>()

    return perfil?.role === 'admin'
  } catch {
    return false
  }
}
