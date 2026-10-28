import React from 'react'
import { resolverProyectoVisto } from '@/lib/proyectoVisto'
import { BannerProyectoVisto } from '@/components/panel/BannerProyectoVisto'
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

  return (
    <>
      <BannerProyectoVisto vista={vista} />
      <PendientesCliente datos={datos} />
    </>
  )
}
