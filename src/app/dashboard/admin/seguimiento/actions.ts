'use server'

import { createClient } from '@supabase/supabase-js'

export async function getCitasAction() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Traer todos los proyectos que ya tengan un estado comercial 
  // (es decir, que ya pasaron por el calendario)
  const { data, error } = await supabase
    .from('proyectos_clientes_serving')
    .select('id, nombre_cliente, correo_cliente, telefono_whatsapp, asesor_asignado, fecha_cita, hora_cita, estado_comercial, created_at, nombre_iniciativa')
    .not('estado_comercial', 'is', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error obteniendo citas:", error)
    return []
  }

  return data
}

export async function updateEstadoComercialAction(id: string, nuevoEstado: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase
    .from('proyectos_clientes_serving')
    .update({ estado_comercial: nuevoEstado })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  return true
}
