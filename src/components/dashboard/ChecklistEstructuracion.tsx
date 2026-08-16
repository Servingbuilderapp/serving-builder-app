import { createClient } from '@/lib/supabase/server'
import { ChecklistEstructuracionClient } from './ChecklistEstructuracionClient'

interface Paso {
  id: number
  orden_secuencia: number
  nombre_paso: string
  completado: boolean
  advertencia: string | null
}

export async function ChecklistEstructuracion({ proyectoId }: { proyectoId: string }) {
  const supabase = await createClient()

  const { data: pasosOficiales } = await supabase
    .from('pasos_estructuracion')
    .select('id, orden_secuencia, nombre_paso')
    .order('orden_secuencia', { ascending: true })

  const { data: avance } = await supabase
    .from('avance_estructuracion_proyecto')
    .select('paso_id, completado')
    .eq('proyecto_id', proyectoId)

  const { data: contenido } = await supabase
    .from('contenido_pasos_proyecto')
    .select('id_paso, advertencia')
    .eq('id_proyecto', proyectoId)

  const { data: porcentaje } = await supabase
    .rpc('calcular_avance_estructuracion', { id_proyecto: proyectoId })

  const mapaAvance = new Map(avance?.map(a => [a.paso_id, a.completado]) || [])
  const mapaAdvertencias = new Map(contenido?.map(c => [c.id_paso, c.advertencia]) || [])

  const pasos: Paso[] = (pasosOficiales || []).map(p => ({
    id: p.id,
    orden_secuencia: p.orden_secuencia,
    nombre_paso: p.nombre_paso,
    completado: mapaAvance.get(p.id) || false,
    advertencia: mapaAdvertencias.get(p.id) || null,
  }))

  return (
    <ChecklistEstructuracionClient
      proyectoId={proyectoId}
      pasosIniciales={pasos}
      porcentajeInicial={porcentaje || 0}
    />
  )
}
