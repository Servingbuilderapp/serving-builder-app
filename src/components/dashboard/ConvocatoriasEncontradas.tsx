import { createClient } from '@/lib/supabase/server'
import { ConvocatoriasEncontradasClient } from './ConvocatoriasEncontradasClient'

export async function ConvocatoriasEncontradas({ proyectoId }: { proyectoId: string }) {
  const supabase = await createClient()

  const { data: convocatorias } = await supabase
    .from('convocatorias_candidatas_proyecto')
    .select('*')
    .eq('id_proyecto', proyectoId)
    .eq('seleccionada', true)
    .order('lote', { ascending: false })
    .order('creado_en', { ascending: false })

  const { data: encajes } = await supabase
    .from('encajes_convocatoria_proyecto')
    .select('*')
    .eq('id_proyecto', proyectoId)

  const mapaEncajes = new Map((encajes || []).map((e) => [e.id_convocatoria, e]))

  const convocatoriasConEncaje = (convocatorias || []).map((c) => ({
    ...c,
    encaje: mapaEncajes.get(c.id) || null,
  }))

  if (convocatoriasConEncaje.length === 0) {
    return null
  }

  return <ConvocatoriasEncontradasClient proyectoId={proyectoId} convocatoriasIniciales={convocatoriasConEncaje} />
}
