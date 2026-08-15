import { createClient } from '@/lib/supabase/server'
import { ChecklistEstructuracionClient } from './ChecklistEstructuracionClient'

interface Paso {
  id: number
  orden_secuencia: number
  nombre_paso: string
  completado: boolean
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

  const { data: porcentaje } = await supabase
    .rpc('calcular_avance_estructuracion', { id_proyecto: proyectoId })

  const mapaAvance = new Map(avance?.map(a => [a.paso_id, a.completado]) || [])
  const pasos: Paso[] = (pasosOficiales || []).map(p => ({
    id: p.id,
    orden_secuencia: p.orden_secuencia,
    nombre_paso: p.nombre_paso,
    completado: mapaAvance.get(p.id) || false,
  }))

  return (
    <ChecklistEstructuracionClient
      proyectoId={proyectoId}
      pasosIniciales={pasos}
      porcentajeInicial={porcentaje || 0}
    />
  )
}
