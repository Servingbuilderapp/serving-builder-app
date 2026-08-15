'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Paso {
  id: number
  orden_secuencia: number
  nombre_paso: string
  completado: boolean
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

      const { data: nuevoPorcentaje } = await supabase
        .rpc('calcular_avance_estructuracion', { id_proyecto: proyectoId })

      const mapaAvance = new Map(avance?.map((a) => [a.paso_id, a.completado]) || [])

      setPasos((pasosActuales) =>
        pasosActuales.map((p) => ({
          ...p,
          completado: mapaAvance.get(p.id) || false,
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
        (payload) => {
          console.log('🔴 Cambio recibido por Realtime:', payload)
          actualizarDatos()
        }
      )
      .subscribe((status) => {
        console.log('🔵 Estado de la conexión Realtime:', status)
      })

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
          <div key={paso.id} className="flex items-center gap-3 py-1.5">
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
          </div>
        ))}
      </div>
    </div>
  )
}
