import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Cpu, Radar, Target, AlertTriangle } from 'lucide-react'

export const dynamic = 'force-dynamic'

function diasDesde(fecha: string | null): number | null {
  if (!fecha) return null
  const ms = Date.now() - new Date(fecha).getTime()
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))
}

export default async function AdminMotoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email?.toLowerCase() !== 'servingbuilderapp@gmail.com') {
    redirect('/dashboard')
  }

  const { data: proyectosListos } = await supabase
    .from('proyectos_clientes_serving')
    .select('id, nombre_cliente, nombre_iniciativa, fecha_ultimo_lote_convocatorias')
    .eq('listo_para_encaje', true)
    .order('fecha_ultimo_lote_convocatorias', { ascending: true, nullsFirst: true })

  const { data: candidatas } = await supabase
    .from('convocatorias_candidatas_proyecto')
    .select('id_proyecto')
    .eq('seleccionada', true)

  const { data: encajes } = await supabase
    .from('encajes_convocatoria_proyecto')
    .select('id_proyecto')

  const lista = proyectosListos || []

  const candidatasPorProyecto = new Map<string, number>()
  ;(candidatas || []).forEach((c) => {
    candidatasPorProyecto.set(c.id_proyecto, (candidatasPorProyecto.get(c.id_proyecto) || 0) + 1)
  })

  const encajesPorProyecto = new Map<string, number>()
  ;(encajes || []).forEach((e) => {
    encajesPorProyecto.set(e.id_proyecto, (encajesPorProyecto.get(e.id_proyecto) || 0) + 1)
  })

  const totalListos = lista.length
  const totalNuncaCorrio = lista.filter((p) => !p.fecha_ultimo_lote_convocatorias).length
  const totalCandidatas = candidatas?.length || 0
  const totalEncajes = encajes?.length || 0

  return (
    <div className="space-y-8 pb-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-color-base-content tracking-tight">
          Motores de IA
        </h1>
        <p className="text-color-base-content/60 text-sm mt-2 max-w-3xl">
          Estado del Motor 2 (busca convocatorias) y el Motor 3 (hace el encaje) para cada proyecto ya estructurado.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#3B1727]/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-[10px] font-black text-color-base-content/45 uppercase tracking-widest">Proyectos listos</span>
          <span className="text-2xl font-black text-color-base-content tabular-nums">{totalListos}</span>
        </div>
        <div className="bg-[#3B1727]/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-[10px] font-black text-color-base-content/45 uppercase tracking-widest">Nunca corrió Motor 2</span>
          <span className={`text-2xl font-black tabular-nums ${totalNuncaCorrio > 0 ? 'text-[#E0917E]' : 'text-color-base-content'}`}>
            {totalNuncaCorrio}
          </span>
        </div>
        <div className="bg-[#3B1727]/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-[10px] font-black text-color-base-content/45 uppercase tracking-widest">Convocatorias encontradas</span>
          <span className="text-2xl font-black text-color-primary tabular-nums">{totalCandidatas}</span>
        </div>
