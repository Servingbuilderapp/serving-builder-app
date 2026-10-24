import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FichaProyecto, type AreaFicha } from '@/components/panel/FichaProyecto'
import { MODALIDADES_ESTRUCTURACION } from '@/lib/estructuracionMapping'

export const dynamic = 'force-dynamic'

const CORREO_ADMIN = 'servingbuilderapp@gmail.com'

const ESTADOS: Record<string, string> = {
  pendiente_pago: 'Pendiente de pago',
  pagado: 'Listo para iniciar',
  estructurando_ia: 'En estructuración',
  en_estructuracion: 'En estructuración',
  estructurado: 'Estructurado',
}

/** Ficha del proyecto: la portada de las pantallas internas del equipo. */
export default async function FichaProyectoPage({
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

  let permitido = (user.email || '').toLowerCase().trim() === CORREO_ADMIN

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
    .select(
      'id, nombre_iniciativa, nombre_cliente, correo_cliente, estado_actual, plan_pago, created_at'
    )
    .eq('id', id)
    .maybeSingle<{
      id: string
      nombre_iniciativa: string | null
      nombre_cliente: string | null
      correo_cliente: string | null
      estado_actual: string | null
      plan_pago: string | null
      created_at: string | null
    }>()

  if (!proyecto?.id) redirect('/admin/proyectos')

  const proyectoId = String(proyecto.id)
  const cuenta = { count: 'exact' as const, head: true }

  const [problemas, objetivos, presupuesto, cronograma, postulaciones, replicas, avance, objIds] =
    await Promise.all([
      supabase.from('problemas_proyecto').select('id', cuenta).eq('proyecto_id', proyectoId),
      supabase.from('objetivos_proyecto').select('id', cuenta).eq('proyecto_id', proyectoId),
      supabase.from('presupuesto_items').select('id', cuenta).eq('proyecto_id', proyectoId),
      supabase.from('cronograma_actividades').select('id', cuenta).eq('proyecto_id', proyectoId),
      supabase.from('postulaciones').select('id', cuenta).eq('proyecto_id', proyectoId),
      supabase.from('replicas').select('id', cuenta).eq('proyecto_origen_id', proyectoId),
      supabase.rpc('calcular_avance_estructuracion', { id_proyecto: proyectoId }),
      supabase.from('objetivos_proyecto').select('id').eq('proyecto_id', proyectoId),
    ])

  // La cadena de valor no guarda el proyecto: cuelga de los objetivos.
  const listaIds = (objIds.data || []).map((o) => o.id)
  const cadena = listaIds.length
    ? await supabase
        .from('cadena_valor_actividades')
        .select('id', cuenta)
        .in('objetivo_especifico_id', listaIds)
    : { count: 0 }

  const areas: AreaFicha[] = [
    { nombre: 'Árbol de problemas', ruta: 'arbol', cantidad: problemas.count ?? 0, unidad: 'renglones del árbol' },
    { nombre: 'Objetivos', ruta: 'objetivos', cantidad: objetivos.count ?? 0, unidad: 'objetivos escritos' },
    { nombre: 'Cadena de valor', ruta: 'cadena-valor', cantidad: cadena.count ?? 0, unidad: 'objetivos con cadena' },
    { nombre: 'Presupuesto', ruta: 'presupuesto', cantidad: presupuesto.count ?? 0, unidad: 'ítems presupuestados' },
    { nombre: 'Cronograma', ruta: 'cronograma', cantidad: cronograma.count ?? 0, unidad: 'actividades programadas' },
    { nombre: 'Postulaciones', ruta: 'postulaciones', cantidad: postulaciones.count ?? 0, unidad: 'convocatorias en curso' },
    { nombre: 'Réplicas', ruta: 'replicas', cantidad: replicas.count ?? 0, unidad: 'réplicas pensadas' },
  ]

  const estado = String(proyecto.estado_actual || '')

  return (
    <FichaProyecto
      datos={{
        proyectoId,
        nombreCliente: proyecto.nombre_cliente || 'Sin nombre',
        correoCliente: proyecto.correo_cliente || 'Sin correo',
        modalidad:
          MODALIDADES_ESTRUCTURACION.find((m) => m.id === String(proyecto.plan_pago || ''))?.nombre ||
          'Sin modalidad registrada',
        creado: proyecto.created_at
          ? new Date(proyecto.created_at).toLocaleDateString('es-CO', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          : 'Sin fecha',
        estado: ESTADOS[estado] || estado || 'Sin estado',
        porcentaje: typeof avance.data === 'number' ? avance.data : 0,
        areas,
      }}
    />
  )
}
