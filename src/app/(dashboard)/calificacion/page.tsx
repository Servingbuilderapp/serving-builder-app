import React from 'react'
import { createClient } from '@/lib/supabase/server'
import {
  CalificacionFinal,
  CalificacionFinalSinProyecto,
  CalificacionFinalSinEvaluar,
  type HallazgoParaMostrar,
} from '@/components/panel/CalificacionFinal'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * "Calificación final" — la pantalla del CLIENTE con la nota que le puso el
 * evaluador automático de estructuración: puntaje sobre 100, si quedó
 * aprobado, y el detalle de lo revisado. Solo muestra lo que el evaluador ya
 * calculó y guardó en `evaluaciones_estructuracion` — no inventa nada nuevo.
 *
 * Si el proyecto quedó aprobado, aquí mismo el cliente puede decir "sí,
 * busquemos convocatorias" (tiene 3 días; si no dice nada, el reloj de
 * /api/revisar-aprobaciones-vencidas arranca la búsqueda solo).
 */
export default async function CalificacionPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const correo = user?.email || ''

  const { data: proyecto } = await supabase
    .from('proyectos_clientes_serving')
    .select(
      'id, nombre_iniciativa, evaluacion_aprobada, evaluacion_aprobada_en, busqueda_convocatorias_iniciada',
    )
    .eq('correo_cliente', correo)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!proyecto) return <CalificacionFinalSinProyecto />

  const nombreProyecto = String(proyecto.nombre_iniciativa || 'Tu proyecto')
  const proyectoId = String(proyecto.id)

  const { data: evaluacion } = await supabase
    .from('evaluaciones_estructuracion')
    .select('puntaje, veredicto, hallazgos_json')
    .eq('proyecto_id', proyectoId)
    .order('corrida', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!evaluacion) return <CalificacionFinalSinEvaluar nombreProyecto={nombreProyecto} />

  const hallazgos: HallazgoParaMostrar[] = (Array.isArray(evaluacion.hallazgos_json)
    ? evaluacion.hallazgos_json
    : []
  ).map((h: any) => ({
    categoria: String(h?.categoria || 'otro'),
    descripcion: String(h?.descripcion || ''),
    critico: h?.critico === true,
  }))

  return (
    <CalificacionFinal
      datos={{
        idProyecto: proyectoId,
        nombreProyecto,
        puntaje: Number(evaluacion.puntaje) || 0,
        veredicto: evaluacion.veredicto === 'aprobado' ? 'aprobado' : 'con_observaciones',
        hallazgos,
        busquedaIniciada: Boolean(proyecto.busqueda_convocatorias_iniciada),
        aprobadoEnISO: proyecto.evaluacion_aprobada_en || null,
      }}
    />
  )
}
