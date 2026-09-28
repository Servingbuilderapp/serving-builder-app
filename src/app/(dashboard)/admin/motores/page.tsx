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
        <div className="bg-[#3B1727]/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-[10px] font-black text-color-base-content/45 uppercase tracking-widest">Encajes hechos</span>
          <span className="text-2xl font-black text-color-primary tabular-nums">{totalEncajes}</span>
        </div>
      </div>

      {totalNuncaCorrio > 0 && (
        <div className="bg-[#C0604A]/10 border border-[#C0604A]/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-[#E0917E] shrink-0 mt-0.5" />
          <p className="text-sm text-[#E0917E]">
            Hay {totalNuncaCorrio} proyecto{totalNuncaCorrio === 1 ? '' : 's'} listo{totalNuncaCorrio === 1 ? '' : 's'} para buscar convocatorias que todavía no ha{totalNuncaCorrio === 1 ? '' : 'n'} tenido ni un lote. Si Gemini se quedó sin cuota, es la causa más probable.
          </p>
        </div>
      )}

      <div className="bg-[#3B1727] border border-color-base-content/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-color-base-content/10 bg-[#4C2032]">
                <th className="px-6 py-4 text-xs font-bold text-color-base-content/40 uppercase tracking-widest">Proyecto</th>
                <th className="px-6 py-4 text-xs font-bold text-color-base-content/40 uppercase tracking-widest">Último lote (Motor 2)</th>
                <th className="px-6 py-4 text-xs font-bold text-color-base-content/40 uppercase tracking-widest text-center">Convocatorias</th>
                <th className="px-6 py-4 text-xs font-bold text-color-base-content/40 uppercase tracking-widest text-center">Encajes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {lista.map((p) => {
                const dias = diasDesde(p.fecha_ultimo_lote_convocatorias)
                const nuncaCorrio = !p.fecha_ultimo_lote_convocatorias
                return (
                  <tr key={p.id} className="hover:bg-color-base-content/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-color-primary/15 border border-color-primary/25 flex items-center justify-center text-color-primary shrink-0">
                          <Cpu className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-color-base-content truncate">{p.nombre_cliente}</span>
                          <span className="text-xs text-color-base-content/40 truncate max-w-[220px]">{p.nombre_iniciativa}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {nuncaCorrio ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#C0604A]/15 text-[#E0917E] whitespace-nowrap">
                          <AlertTriangle className="h-3 w-3" /> Nunca corrió
                        </span>
                      ) : (
                        <span className="text-xs text-color-base-content/60 whitespace-nowrap">
                          hace {dias} día{dias === 1 ? '' : 's'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-color-base-content">
                        <Radar className="h-3.5 w-3.5 text-color-base-content/40" />
                        {candidatasPorProyecto.get(p.id) || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-color-base-content">
                        <Target className="h-3.5 w-3.5 text-color-base-content/40" />
                        {encajesPorProyecto.get(p.id) || 0}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {lista.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-color-base-content/40 italic">
                    <Cpu className="h-5 w-5 mx-auto mb-2 opacity-40" />
                    Todavía no hay proyectos listos para buscar convocatorias.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
