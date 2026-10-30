import React from 'react'
import { resolverProyectoVisto } from '@/lib/proyectoVisto'
import { BannerProyectoVisto } from '@/components/panel/BannerProyectoVisto'
import { PendientesCliente, PendientesSinProyecto } from '@/components/panel/PendientesCliente'
import { cargarPendientesCliente } from '@/lib/cargarPendientesCliente'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { SugerenciasCambio, type SugerenciaVista } from '@/components/panel/SugerenciasCambio'

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
export default async function PendientesPage({
  searchParams,
}: {
  searchParams?: Promise<{ proyecto?: string }>
}) {
  const params = searchParams ? await searchParams : undefined
  const vista = await resolverProyectoVisto(params?.proyecto)

  if (!vista.proyectoId) return <PendientesSinProyecto />

  const { data: proyecto } = await vista.db
    .from('proyectos_clientes_serving')
    .select('id, nombre_iniciativa, archivo_proyecto_nombre, archivo_proyecto_url')
    .eq('id', vista.proyectoId)
    .maybeSingle()

  if (!proyecto?.id) return <PendientesSinProyecto />

  const datos = await cargarPendientesCliente(vista.db, proyecto)

  // Sugerencias de cambio ya redactadas (tabla con permisos cerrados: se lee con la llave de servicio, el proyecto ya está verificado).
  let sugerencias: SugerenciaVista[] = []
  try {
    const { data: filas } = await supabaseAdmin
      .from('sugerencias_cambio')
      .select('id, tema, hallazgo, propuesta, estado, texto_final')
      .eq('id_proyecto', String(proyecto.id))
      .order('orden', { ascending: true })
    sugerencias = (filas || []) as SugerenciaVista[]
  } catch {
    sugerencias = []
  }

  return (
    <>
      <BannerProyectoVisto vista={vista} />
      <div className="mb-6">
        <SugerenciasCambio proyectoId={String(proyecto.id)} sugerencias={sugerencias} soloVista={vista.vistaEquipo} />
      </div>
      <PendientesCliente datos={datos} />
    </>
  )
}
