import { createClient } from '@/lib/supabase/server'
import { EstadoProyectoClient } from './EstadoProyectoClient'

export async function EstadoProyecto({ proyectoId }: { proyectoId: string }) {
  const supabase = await createClient()

  const { data: proyecto } = await supabase
    .from('proyectos_clientes_serving')
    .select('listo_para_encaje')
    .eq('id', proyectoId)
    .maybeSingle()

  const { data: pendientes } = await supabase
    .from('preguntas_pendientes_proyecto')
    .select('critico')
    .eq('id_proyecto', proyectoId)
    .eq('respondida', false)

  const criticos = (pendientes || []).filter((p) => p.critico).length
  const noCriticos = (pendientes || []).filter((p) => !p.critico).length

  return (
    <EstadoProyectoClient
      proyectoId={proyectoId}
      listoParaEncajeInicial={proyecto?.listo_para_encaje ?? false}
      criticosIniciales={criticos}
      noCriticosIniciales={noCriticos}
    />
  )
}
