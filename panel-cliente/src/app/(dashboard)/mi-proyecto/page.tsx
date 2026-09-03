import React from 'react'
import { createClient } from '@/lib/supabase/server'
import {
  AvanceProyecto,
  AvanceSinProyecto,
  AvancePendienteDePago,
  type PasoAvance,
} from '@/components/panel/AvanceProyecto'
import Link from 'next/link'
import { Inbox } from 'lucide-react'
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

  // Cuántas preguntas están esperando respuesta del cliente. Se responden en
  // "Lo que me piden", no aquí: esta pantalla es para mirar el avance.
  const { count: preguntasPendientes } = await supabase
    .from('preguntas_pendientes_proyecto')
    .select('id', { count: 'exact', head: true })
    .eq('id_proyecto', proyectoId)
    .eq('respondida', false)

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
      {preguntasPendientes && preguntasPendientes > 0 ? (
        <div className="px-4 pb-6 lg:px-6">
          <Link
            href="/pendientes"
            className="flex items-center gap-3 rounded-2xl border border-[#FDE6C8] bg-[#FFFBF3] px-5 py-4 shadow-[0_1px_2px_rgba(11,42,74,0.06),0_8px_24px_-14px_rgba(11,42,74,0.20)] transition-transform hover:-translate-y-px"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#8A5307]">
              <Inbox className="h-4.5 w-4.5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-extrabold text-[#0B2A4A]">
                {preguntasPendientes === 1
                  ? 'Hay una pregunta esperando tu respuesta'
                  : `Hay ${preguntasPendientes} preguntas esperando tu respuesta`}
              </span>
              <span className="block text-[12.5px] text-[#5B6B84]">
                Respóndelas en «Lo que me piden» y el proyecto sigue avanzando.
              </span>
            </span>
          </Link>
        </div>
      ) : null}
    </>
  )
}
