import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  PostulacionesClient,
  type Postulacion,
  type ConvocatoriaOpcion,
  type Requisito,
} from '@/components/admin/PostulacionesClient'

export const dynamic = 'force-dynamic'

const CORREO_ADMIN = 'servingbuilderapp@gmail.com'

/** Motor 4 — pantalla interna del equipo para preparar y radicar postulaciones. */
export default async function PostulacionesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email?.toLowerCase() !== CORREO_ADMIN) redirect('/dashboard')

  const { data: proyecto } = await supabase
    .from('proyectos_clientes_serving')
    .select('id, nombre_iniciativa')
    .eq('id', id)
    .maybeSingle()

  if (!proyecto) redirect('/admin/proyectos')

  const { data: postulaciones } = await supabase
    .from('postulaciones')
    .select(
      'id, biblioteca_id, convocatoria_nombre, entidad, fecha_cierre, estado, puntaje_tecnica, puntaje_impacto, puntaje_capacidades, puntaje_sostenibilidad, puntaje_replicabilidad, puntaje_total, veredicto, corrida, mejoras_json, adaptaciones_json, carta_intencion, alertas'
    )
    .eq('proyecto_id', id)
    .order('fecha_cierre', { ascending: true, nullsFirst: false })

  const ids = (postulaciones || []).map((p) => p.id)

  type FilaRequisito = Requisito & { postulacion_id: string }

  const { data: requisitos } = ids.length
    ? await supabase
        .from('postulacion_requisitos')
        .select('id, postulacion_id, requisito, tipo, obligatorio, cumplido, responsable, nota')
        .in('postulacion_id', ids)
        .order('orden', { ascending: true })
    : { data: [] as FilaRequisito[] }

  const filas = (requisitos || []) as FilaRequisito[]

  const conRequisitos: Postulacion[] = (postulaciones || []).map((p) => ({
    ...(p as unknown as Omit<Postulacion, 'requisitos'>),
    requisitos: filas.filter((r) => r.postulacion_id === p.id),
  }))

  const { data: convocatorias } = await supabase
    .from('biblioteca_convocatorias')
    .select('id, nombre, entidad, fecha_cierre')
    .order('fecha_cierre', { ascending: true, nullsFirst: false })
    .limit(300)

  return (
    <PostulacionesClient
      proyectoId={String(proyecto.id)}
      nombreProyecto={String(proyecto.nombre_iniciativa || 'Proyecto sin nombre')}
      postulaciones={conRequisitos}
      convocatorias={(convocatorias || []) as ConvocatoriaOpcion[]}
    />
  )
}
