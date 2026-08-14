import { createClient } from '@/lib/supabase/server'

interface Paso {
  id: number
  orden_secuencia: number
  nombre_paso: string
  completado: boolean
}

export async function ChecklistEstructuracion({ proyectoId }: { proyectoId: string }) {
  const supabase = await createClient()

  // Traemos los 42 pasos oficiales, en el orden real de trabajo
  const { data: pasosOficiales } = await supabase
    .from('pasos_estructuracion')
    .select('id, orden_secuencia, nombre_paso')
    .order('orden_secuencia', { ascending: true })

  // Traemos cuáles de esos pasos ya están completados para ESTE proyecto específico
  const { data: avance } = await supabase
    .from('avance_estructuracion_proyecto')
    .select('paso_id, completado')
    .eq('proyecto_id', proyectoId)

  // Traemos el % de avance ya calculado
  const { data: porcentaje } = await supabase
    .rpc('calcular_avance_estructuracion', { id_proyecto: proyectoId })

  const mapaAvance = new Map(avance?.map(a => [a.paso_id, a.completado]) || [])

  const pasos: Paso[] = (pasosOficiales || []).map(p => ({
    id: p.id,
    orden_secuencia: p.orden_secuencia,
    nombre_paso: p.nombre_paso,
    completado: mapaAvance.get(p.id) || false,
  }))

  const porcentajeAvance = porcentaje || 0

  return (
    <div className="p-8 rounded-3xl border border-color-base-content/10 bg-color-base-content/5 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-color-base-content">Estructuración de tu proyecto</h3>
          <span className="text-2xl font-black text-gradient-magma">{porcentajeAvance}%</span>
        </div>
        <div className="w-full h-3 bg-color-base-content/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-magma rounded-full transition-all duration-500"
            style={{ width: `${porcentajeAvance}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {pasos.map((paso) => (
          <div
            key={paso.id}
            className="flex items-center gap-3 py-1.5"
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                paso.completado
                  ? 'bg-emerald-500'
                  : 'border-2 border-color-base-content/20'
              }`}
            >
              {paso.completado && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span
              className={`text-sm ${
                paso.completado
                  ? 'text-color-base-content'
                  : 'text-color-base-content/50'
              }`}
            >
              {paso.nombre_paso}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
