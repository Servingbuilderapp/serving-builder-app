'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, AlertTriangle, Lock } from 'lucide-react'

interface Props {
  proyectoId: string
  listoParaEncajeInicial: boolean
  criticosIniciales: number
  noCriticosIniciales: number
}

export function EstadoProyectoClient({ proyectoId, listoParaEncajeInicial, criticosIniciales, noCriticosIniciales }: Props) {
  const [listoParaEncaje, setListoParaEncaje] = useState(listoParaEncajeInicial)
  const [criticos, setCriticos] = useState(criticosIniciales)
  const [noCriticos, setNoCriticos] = useState(noCriticosIniciales)

  useEffect(() => {
    const supabase = createClient()

    const actualizarDatos = async () => {
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

      setListoParaEncaje(proyecto?.listo_para_encaje ?? false)
      setCriticos((pendientes || []).filter((p) => p.critico).length)
      setNoCriticos((pendientes || []).filter((p) => !p.critico).length)
    }

    const canal = supabase
      .channel(`estado-proyecto-${proyectoId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'preguntas_pendientes_proyecto', filter: `id_proyecto=eq.${proyectoId}` },
        () => actualizarDatos()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'proyectos_clientes_serving', filter: `id=eq.${proyectoId}` },
        () => actualizarDatos()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [proyectoId])

  const totalPendientes = criticos + noCriticos

  let estilo = { bg: 'bg-emerald-50', border: 'border-emerald-300', texto: 'text-emerald-800', icono: 'text-emerald-600' }
  let mensaje = 'Tu proyecto está completo. Ya puedes buscar convocatorias y hacer el encaje.'
  let Icono = CheckCircle2

  if (totalPendientes > 0 && criticos === 0) {
    estilo = { bg: 'bg-amber-50', border: 'border-amber-300', texto: 'text-amber-800', icono: 'text-amber-600' }
    mensaje = `Ya puedes buscar convocatorias. Aún faltan ${noCriticos} dato${noCriticos === 1 ? '' : 's'} por completar (no bloquean nada).`
    Icono = AlertTriangle
  } else if (criticos > 0) {
    estilo = { bg: 'bg-red-50', border: 'border-red-300', texto: 'text-red-800', icono: 'text-red-600' }
    mensaje = `Puedes seguir buscando convocatorias, pero faltan ${criticos} dato${criticos === 1 ? '' : 's'} clave antes de poder hacer el encaje con una convocatoria específica.`
    Icono = Lock
  }

  return (
    <div className={`p-5 rounded-2xl border ${estilo.bg} ${estilo.border} flex items-start gap-3`}>
      <Icono className={`w-5 h-5 shrink-0 mt-0.5 ${estilo.icono}`} />
      <p className={`text-sm font-bold ${estilo.texto}`}>{mensaje}</p>
    </div>
  )
}
