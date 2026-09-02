import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TIPOS_REPLICA } from '@/lib/motorReplica'
import {
  ReplicasClient,
  type Replica,
  type ConvocatoriaOpcion,
} from '@/components/admin/ReplicasClient'

export const dynamic = 'force-dynamic'

const CORREO_ADMIN = 'servingbuilderapp@gmail.com'

/** Pantalla interna del equipo para pensar y crear réplicas de un proyecto. */
export default async function ReplicasPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: replicas } = await supabase
    .from('replicas')
    .select(
      'id, tipo, destino, estado, riesgos, nucleo_json, adaptaciones_json, obligados_json, proyecto_replica_id'
    )
    .eq('proyecto_origen_id', id)
    .order('creada_en', { ascending: false })

  const { data: convocatorias } = await supabase
    .from('biblioteca_convocatorias')
    .select('id, nombre, entidad')
    .order('nombre', { ascending: true })
    .limit(300)

  return (
    <ReplicasClient
      proyectoId={String(proyecto.id)}
      nombreProyecto={String(proyecto.nombre_iniciativa || 'Proyecto sin nombre')}
      replicas={(replicas || []) as Replica[]}
      tipos={[...TIPOS_REPLICA]}
      convocatorias={(convocatorias || []) as ConvocatoriaOpcion[]}
    />
  )
}
