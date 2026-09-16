import { createClient } from '@/lib/supabase/server'

/**
 * Candado para el panel del socio de marca blanca.
 *
 * Un socio (por ejemplo un gremio) puede tener varias personas con login,
 * pero TODAS deben ver únicamente los proyectos marcados con su propio
 * socio_id — nunca los de Serving ni los de otro socio.
 *
 * Esta función dice si el usuario que entró es de un socio, y de cuál.
 * Se usa en /socio (la pantalla del socio) y debe usarse en cualquier
 * ruta futura que le devuelva datos a un socio.
 */
export async function obtenerSocioDeUsuario(): Promise<
  | { esSocio: true; socioId: string; nombreSocio: string }
  | { esSocio: false; socioId: null; nombreSocio: null }
> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { esSocio: false, socioId: null, nombreSocio: null }

    const { data: perfil } = await supabase
      .from('users')
      .select('role, socio_id, socios(nombre)')
      .eq('id', user.id)
      .maybeSingle<{ role: string | null; socio_id: string | null; socios: { nombre: string } | null }>()

    if (perfil?.role !== 'socio' || !perfil.socio_id) {
      return { esSocio: false, socioId: null, nombreSocio: null }
    }

    return {
      esSocio: true,
      socioId: perfil.socio_id,
      nombreSocio: perfil.socios?.nombre || 'Socio',
    }
  } catch {
    return { esSocio: false, socioId: null, nombreSocio: null }
  }
}
