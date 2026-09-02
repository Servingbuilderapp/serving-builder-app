import React from 'react'
import { createClient } from '@/lib/supabase/server'
import {
  AvanceProyecto,
  AvanceSinProyecto,
  AvancePendienteDePago,
  type PasoAvance,
} from '@/components/panel/AvanceProyecto'
import { PreguntasPendientesProyecto } from '@/components/dashboard/PreguntasPendientesProyecto'
import { MODALIDADES_ESTRUCTURACION } from '@/lib/estructuracionMapping'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * "Avance de mi proyecto" — la pantalla del CLIENTE dentro del panel.
 *
 * Antes esta entrada del menú llevaba a /estructuracion, que es la página de
 * venta: un cliente que ya había contratado volvía a caer en el selector de
 * modalidades, como si nunca hubiera pagado. Aquí se lee su proyecto real de la
 * base de datos y se muestra en qué punto va.
 */
export default async function MiProyectoPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const correo = user?.email || ''

  const { data: proyecto } = await supabase
    .from('proyectos_clientes_serving')
    .select('id, nombre_iniciativa, estado_actual, plan_pago')
    .eq('correo_cliente', correo)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!proyecto) return <AvanceSinProyecto />

  const nombreProyecto = String(proyecto.nombre_iniciativa || 'Tu proyecto')
  const estado = String(proyecto.estado_actual || '').toLowerCase()

  // Mientras no esté confirmado el pago no hay estructuración que mostrar.
  const activo = estado === 'pagado' || estado === 'en_estructuracion' || estado === 'estructurado'
  if (!activo) return <AvancePendienteDePago nombreProyecto={nombreProyecto} />

  const proyectoId = String(proyecto.id)

  const [{ data: pasosOficiales }, { data: avance }, { data: contenido }, { data: porcentaje }] =
    await Promise.all([
      supabase
        .from('pasos_estructuracion')
        .select('id, orden_secuencia, nombre_paso')
        .order('orden_secuencia', { ascending: true }),
      supabase
        .from('avance_estructuracion_proyecto')
        .select('paso_id, completado')
        .eq('proyecto_id', proyectoId),
      supabase
        .from('contenido_pasos_proyecto')
        .select('id_paso, advertencia')
        .eq('id_proyecto', proyectoId),
      supabase.rpc('calcular_avance_estructuracion', { id_proyecto: proyectoId }),
    ])

  const mapaAvance = new Map((avance || []).map((a) => [a.paso_id, a.completado]))
  const mapaAdvertencias = new Map((contenido || []).map((c) => [c.id_paso, c.advertencia]))

  const pasos: PasoAvance[] = (pasosOficiales || []).map((p) => ({
    id: p.id,
    orden: p.orden_secuencia,
    nombre: p.nombre_paso,
    completado: Boolean(mapaAvance.get(p.id)),
    advertencia: (mapaAdvertencias.get(p.id) as string | null) || null,
  }))

  const modalidad =
    MODALIDADES_ESTRUCTURACION.find((m) => m.id === String(proyecto.plan_pago || ''))?.nombre ||
    null

  return (
    <>
      <AvanceProyecto
        datos={{
          proyecto: { id: proyectoId, nombre: nombreProyecto, estado, modalidad },
          pasos,
          porcentaje: typeof porcentaje === 'number' ? porcentaje : 0,
        }}
      />
      <div className="px-4 pb-6 lg:px-6">
        <PreguntasPendientesProyecto proyectoId={proyectoId} />
      </div>
    </>
  )
}
