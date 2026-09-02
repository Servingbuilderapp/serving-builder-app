import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  EstructuracionClient,
  type PasoEstructuracion,
} from '@/components/panel/EstructuracionClient'

export const dynamic = 'force-dynamic'

const CORREO_ADMIN = 'servingbuilderapp@gmail.com'

/**
 * "Estructuración" del proyecto (equipo Serving).
 *
 * El Motor 1 guarda en `contenido_pasos_proyecto` el texto de cada paso, pero
 * hasta ahora ninguna pantalla lo mostraba. Esta lo saca a la luz para que el
 * equipo pueda leerlo y corregirlo antes de que se use en las convocatorias.
 */
export default async function PaginaEstructuracionInterna({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const esCorreoAdmin = (user.email || '').toLowerCase().trim() === CORREO_ADMIN
  let permitido = esCorreoAdmin

  if (!permitido) {
    const { data: perfil } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle<{ role: string | null }>()
    permitido = perfil?.role === 'admin'
  }

  if (!permitido) redirect('/dashboard')

  const { data: proyecto } = await supabase
    .from('proyectos_clientes_serving')
    .select('id, nombre_iniciativa, nombre_cliente, correo_cliente')
    .eq('id', id)
    .maybeSingle<{
      id: string
      nombre_iniciativa: string | null
      nombre_cliente: string | null
      correo_cliente: string | null
    }>()

  if (!proyecto?.id) redirect('/admin/proyectos')

  const [pasosRes, contenidoRes, avanceRes] = await Promise.all([
    supabase
      .from('pasos_estructuracion')
      .select('id, orden_secuencia, nombre_paso')
      .order('orden_secuencia', { ascending: true }),
    supabase
      .from('contenido_pasos_proyecto')
      .select('id_paso, contenido, advertencia')
      .eq('id_proyecto', proyecto.id),
    supabase
      .from('avance_estructuracion_proyecto')
      .select('paso_id, completado')
      .eq('proyecto_id', proyecto.id),
  ])

  const mapaContenido = new Map(
    (contenidoRes.data || []).map((c) => [
      Number(c.id_paso),
      {
        contenido: c.contenido ? String(c.contenido) : '',
        advertencia: c.advertencia ? String(c.advertencia) : null,
      },
    ]),
  )
  const mapaAvance = new Map(
    (avanceRes.data || []).map((a) => [Number(a.paso_id), a.completado === true]),
  )

  const pasos: PasoEstructuracion[] = (pasosRes.data || []).map((p) => {
    const guardado = mapaContenido.get(Number(p.id))
    return {
      id: Number(p.id),
      orden: Number(p.orden_secuencia ?? 0),
      nombre: String(p.nombre_paso || 'Paso sin nombre'),
      completado: Boolean(mapaAvance.get(Number(p.id))),
      contenido: guardado?.contenido || '',
      advertencia: guardado?.advertencia || null,
    }
  })

  return (
    <EstructuracionClient
      proyectoId={String(proyecto.id)}
      nombreProyecto={proyecto.nombre_iniciativa || 'Proyecto sin nombre'}
      nombreCliente={proyecto.nombre_cliente || proyecto.correo_cliente || ''}
      pasosIniciales={pasos}
    />
  )
}
