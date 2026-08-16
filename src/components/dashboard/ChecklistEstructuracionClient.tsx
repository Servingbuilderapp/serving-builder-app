'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertTriangle } from 'lucide-react'

interface Paso {
  id: number
  orden_secuencia: number
  nombre_paso: string
  completado: boolean
  advertencia: string | null
}

interface Props {
  proyectoId: string
  pasosIniciales: Paso[]
  porcentajeInicial: number
}

export function ChecklistEstructuracionClient({ proyectoId, pasosIniciales, porcentajeInicial }: Props) {
  const [pasos, setPasos] = useState<Paso[]>(pasosIniciales)
  const [porcentajeAvance, setPorcentajeAvance] = useState<number>(porcentajeInicial)

  useEffect(() => {
    const supabase = createClient()

    const actualizarDatos = async () => {
      const { data: avance } = await supabase
        .from('avance_estructuracion_proyecto')
        .select('paso_id, completado')
        .eq('proyecto_id', proyectoId)

      const { data: contenido } = await supabase
        .from('contenido_pasos_proyecto')
        .select('id_paso, advertencia')
        .eq('id_proyecto', proyectoId)

      const { data: nuevoPorcentaje } = await supabase
        .rpc('calcular_avance_estructuracion', { id_proyecto: proyectoId })

      const mapaAvance = new Map(avance?.map((a) => [a.paso_id, a.completado]) || [])
      const mapaAdvertencias = new Map(contenido?.map((c) => [c.id_paso, c.advertencia]) || [])

      setPasos((pasosActuales) =>
        pasosActuales.map((p) => ({
          ...p,
          completado: mapaAvance.get(p.id) || false,
          advertencia: mapaAdvertencias.get(p.id) || null,
        }))
      )
      setPorcentajeAvance(nuevoPorcentaje || 0)
    }

    const canal = supabase
      .channel(`avance-proyecto-${proyectoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'avance_estructuracion_proyecto',
          filter: `proyecto_id=eq.${proyectoId}`,
        },
        () => actualizarDatos()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contenido_pasos_proyecto',
          filter: `id_proyecto=eq.${proyectoId}`,
        },
        () => actualizarDatos()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [proyectoId])

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
          <div key={paso.id} className="py-1.5">
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  paso.completado ? 'bg-emerald-500' : 'border-2 border-color-base-content/20'
                }`}
              >
                {paso.completado && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-sm ${paso.completado ? 'text-color-base-content' : 'text-color-base-content/50'}`}>
                {paso.nombre_paso}
              </span>
              {paso.completado && paso.advertencia && (
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              )}
            </div>
            {paso.completado && paso.advertencia && (
              <p className="text-xs text-amber-600 pl-8 mt-1">{paso.advertencia}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
