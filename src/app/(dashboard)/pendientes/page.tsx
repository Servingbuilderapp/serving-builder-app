import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { PendientesCliente, PendientesSinProyecto } from '@/components/panel/PendientesCliente'
import { cargarPendientesCliente } from '@/lib/cargarPendientesCliente'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * "Lo que me piden" — la pantalla del CLIENTE donde destraba su propio proyecto.
 *
 * Reúne en un solo sitio lo que depende de él: preguntas del motor, pasos que
 * quedaron débiles, documentos pedidos y lo que ya subió. Los datos se arman
 * en `cargarPendientesCliente`, que también usa la pantalla del equipo
 * "Ver lo que ve el cliente", para que las dos muestren lo mismo.
 */
export default async function PendientesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const correo = user?.email || ''

  const { data: proyecto } = await supabase
    .from('proyectos_clientes_serving')
    .select('id, nombre_iniciativa, archivo_proyecto_nombre, archivo_proyecto_url')
    .eq('correo_cliente', correo)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!proyecto?.id) return <PendientesSinProyecto />

  const datos = await cargarPendientesCliente(supabase, proyecto)

  return <PendientesCliente datos={datos} />
}
