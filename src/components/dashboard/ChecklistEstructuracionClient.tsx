'use client'
import { useEffect, useMemo, useState } from 'react'
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

const CATEGORIAS = [
  { nombre: 'Diagnóstico', desde: 1, hasta: 19, color: '#1D9E75' },
  { nombre: 'Objetivos y solución', desde: 20, hasta: 26, color: '#378ADD' },
  { nombre: 'Ejecución', desde: 27, hasta: 37, color: '#BA7517' },
  { nombre: 'Cierre', desde: 38, hasta: 42, color: '#D4537E' },
]

function calcularAvancePorCategoria(pasos: Paso[]) {
  return CATEGORIAS.map((cat) => {
    const pasosCat = pasos.filter((p) => p.orden_secuencia >= cat.desde && p.orden_secuencia <= cat.hasta)
    const completados = pasosCat.filter((p) => p.completado).length
    const porcentaje = pasosCat.length > 0 ? Math.round((completados / pasosCat.length) * 100) : 0
    return { ...cat, porcentaje, completados, total: pasosCat.length }
  })
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
        { event: '*', schema: 'public', table: 'avance_estructuracion_proyecto', filter: `proyecto_id=eq.${proyectoId}` },
        () => actualizarDatos()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contenido_pasos_proyecto', filter: `id_proyecto=eq.${proyectoId}` },
        () => actualizarDatos()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [proyectoId])

  const avancePorCategoria = useMemo(() => calcularAvancePorCategoria(pasos), [pasos])

  const radio = 48
  const circunferencia = 2 * Math.PI * radio
  const offset = circunferencia - (porcentajeAvance / 100) * circunferencia

  return (
    <div className="p-8 rounded-3xl border border-color-base-content/10 bg-color-base-content/5 space-y-6">
      <h3 className="text-lg font-black text-color-base-content">Estructuración de tu proyecto</h3>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <svg width="120" height="120" viewBox="0 0 120 120" className="shrink-0">
          <circle cx="60" cy="60" r={radio} fill="none" stroke="currentColor" className="text-color-base-content/10" strokeWidth="14" />
          <circle
            cx="60" cy="60" r={radio} fill="none" stroke="#1D9E75" strokeWidth="14"
            strokeDasharray={circunferencia} strokeDashoffset={offset} strokeLinecap="round"
            transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
          <text x="60" y="67" textAnchor="middle" fontSize="24" fontWeight="600" className="fill-color-base-content">
            {porcentajeAvance}%
          </text>
        </svg>

        <div className="flex-1 w-full space-y-2.5">
          {avancePorCategoria.map((cat) => (
            <div key={cat.nombre} className="flex items-center gap-2">
              <span className="text-xs text-color-base-content/60 w-36 shrink-0">{cat.nombre}</span>
              <div className="flex-1 h-2.5 rounded-full bg-color-base-content/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${cat.porcentaje}%`, backgroundColor: cat.color }}
                />
              </div>
              <span className="text-xs text-color-base-content/50 w-8 text-right shrink-0">{cat.porcentaje}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-color-base-content/10">
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
