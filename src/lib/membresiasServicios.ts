import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient, type SupabaseClient } from '@supabase/supabase-js'
import { membresiaVigente } from '@/lib/membresiasConsumo'
import { esEquipoServing } from '@/lib/guardiaEquipo'
import { SERVICIOS_POR_NIVEL, type NivelMembresia } from '@/lib/membresias'

export type ContextoMiembro = {
  correo: string
  nombre: string
  esEquipo: boolean
  vigente?: { id: string; nivel: string; estado: string; fecha_inicio: string | null; fecha_proximo_pago: string | null }
  servicios: { sesionesPorMes: number; comunidad: boolean; acompanamientoSemanal: boolean }
  servicio: SupabaseClient
}

/** Quién está entrando, si tiene membresía vigente y qué servicios le tocan. El equipo entra a todo. */
export async function contextoMiembro(): Promise<ContextoMiembro> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const correo = (user?.email || '').toLowerCase()
  const servicio = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  const { vigente } = correo ? await membresiaVigente(servicio, correo) : { vigente: undefined }
  const esEquipo = await esEquipoServing()
  const nivel = (vigente?.nivel || '') as NivelMembresia['slug']
  const servicios = esEquipo
    ? { sesionesPorMes: 99, comunidad: true, acompanamientoSemanal: true }
    : SERVICIOS_POR_NIVEL[nivel] || { sesionesPorMes: 0, comunidad: false, acompanamientoSemanal: false }
  const nombre = (user?.user_metadata?.full_name as string | undefined) || correo.split('@')[0] || 'Miembro'
  return { correo, nombre, esEquipo, vigente, servicios, servicio }
}
