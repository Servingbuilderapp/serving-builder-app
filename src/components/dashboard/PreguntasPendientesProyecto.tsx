import { createClient } from '@/lib/supabase/server'
import { PreguntasPendientesProyectoClient } from './PreguntasPendientesProyectoClient'

export async function PreguntasPendientesProyecto({ proyectoId }: { proyectoId: string }) {
  const supabase = await createClient()

  const { data: preguntas } = await supabase
    .from('preguntas_pendientes_proyecto')
    .select('id, id_paso, pregunta, critico')
    .eq('id_proyecto', proyectoId)
    .eq('respondida', false)
    .order('critico', { ascending: false })
    .order('creado_en', { ascending: true })

  const { data: pasos } = await supabase
    .from('pasos_estructuracion')
    .select('id, nombre_paso')

  const mapaNombres = new Map((pasos || []).map((p) => [p.id, p.nombre_paso]))

  const preguntasConNombre = (preguntas || []).map((p) => ({
    id: p.id,
    idPaso: p.id_paso,
    nombrePaso: mapaNombres.get(p.id_paso) || `Paso ${p.id_paso}`,
    pregunta: p.pregunta,
    critico: p.critico || false,
  }))

  if (preguntasConNombre.length === 0) {
    return null
  }

  return <PreguntasPendientesProyectoClient proyectoId={proyectoId} preguntasIniciales={preguntasConNombre} />
}
