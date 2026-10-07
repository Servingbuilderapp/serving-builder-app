import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CreditCard } from 'lucide-react'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { MarcarMembresiaPagadaButton } from '@/components/admin/MarcarMembresiaPagadaButton'
import { RegistrarUsoMembresia } from '@/components/admin/RegistrarUsoMembresia'
import { resumenDeUso, type ResumenUso } from '@/lib/membresiasUso'
import { ETIQUETA_BENEFICIO } from '@/lib/membresias'

export const dynamic = 'force-dynamic'

const NOMBRE_NIVEL: Record<string, string> = {
  explorador: 'Explorador',
  constructor: 'Constructor',
  arquitecto: 'Arquitecto',
}

type EstadoInfo = { etiqueta: string; clase: string }

function estadoInfo(estado: string): EstadoInfo {
  switch (estado) {
    case 'activa':
      return { etiqueta: 'Activa', clase: 'bg-[#7A8B6F]/20 text-[#9BB18D]' }
    case 'vencida':
      return { etiqueta: 'Vencida', clase: 'bg-[#C0604A]/20 text-[#E0917E]' }
    case 'cancelada':
      return { etiqueta: 'Cancelada', clase: 'bg-color-base-content/10 text-color-base-content/50' }
    default:
      return { etiqueta: estado, clase: 'bg-[#C99A3D]/20 text-[#E0B868]' }
  }
}

function diasHasta(fecha: string | null): number | null {
  if (!fecha) return null
  const ms = new Date(fecha).getTime() - Date.now()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

export default async function AdminMembresiasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email?.toLowerCase() !== 'servingbuilderapp@gmail.com') {
    redirect('/dashboard')
  }

  const { data: membresias } = await supabase
    .from('membresias_clientes')
    .select('id, nombre_cliente, correo_cliente, telefono_whatsapp, pais, nivel, ciclo, monto_usd, monto_cop, estado, fecha_inicio, fecha_proximo_pago, created_at')
    .order('created_at', { ascending: false })

  const lista = membresias || []

  // Uso del mes de cada membresía activa (tabla con candado: se lee con llave de servicio).
  const servicio = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const usoPor = new Map<string, ResumenUso>()
  await Promise.all(
    lista
      .filter((m) => m.estado === 'activa')
      .map(async (m) => {
        usoPor.set(m.id, await resumenDeUso(servicio, { id: m.id, nivel: m.nivel, fecha_inicio: m.fecha_inicio }))
      })
  )

  const totalActivas = lista.filter((m) => m.estado === 'activa').length
  const totalVencidas = lista.filter((m) => m.estado === 'vencida').length
  const totalPorVencer = lista.filter((m) => {
    const dias = diasHasta(m.fecha_proximo_pago)
    return m.estado === 'activa' && dias !== null && dias >= 0 && dias <= 7
  }).length

  return (
    <div className="space-y-8 pb-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-color-base-content tracking-tight">
          Pagos y Membresías
        </h1>
        <p className="text-color-base-content/60 text-sm mt-2 max-w-3xl">
          Confirma el pago de cada membresía cuando llegue el comprobante por WhatsApp. Es cobro recurrente manual: cuando venza, vuelve a llegar el comprobante y se confirma de nuevo.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#3B1727]/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-[10px] font-black text-color-base-content/45 uppercase tracking-widest">Activas</span>
          <span className="text-2xl font-black text-[#9BB18D] tabular-nums">{totalActivas}</span>
        </div>
        <div className="bg-[#3B1727]/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-[10px] font-black text-color-base-content/45 uppercase tracking-widest">Vencen en 7 días</span>
          <span className={`text-2xl font-black tabular-nums ${totalPorVencer > 0 ? 'text-[#E0B868]' : 'text-color-base-content'}`}>
            {totalPorVencer}
          </span>
        </div>
        <div className="bg-[#3B1727]/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-[10px] font-black text-color-base-content/45 uppercase tracking-widest">Vencidas</span>
          <span className={`text-2xl font-black tabular-nums ${totalVencidas > 0 ? 'text-[#E0917E]' : 'text-color-base-content'}`}>
            {totalVencidas}
          </span>
        </div>
      </div>

      <div className="bg-[#3B1727] border border-color-base-content/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-color-base-content/10 bg-[#4C2032]">
                <th className="px-6 py-4 text-xs font-bold text-color-base-content/40 uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-4 text-xs font-bold text-color-base-content/40 uppercase tracking-widest">Nivel</th>
                <th className="px-6 py-4 text-xs font-bold text-color-base-content/40 uppercase tracking-widest">Ciclo</th>
                <th className="px-6 py-4 text-xs font-bold text-color-base-content/40 uppercase tracking-widest">Monto</th>
                <th className="px-6 py-4 text-xs font-bold text-color-base-content/40 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-color-base-content/40 uppercase tracking-widest">Próximo pago</th>
                <th className="px-6 py-4 text-xs font-bold text-color-base-content/40 uppercase tracking-widest">Beneficios del mes</th>
                <th className="px-6 py-4 text-xs font-bold text-color-base-content/40 uppercase tracking-widest text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {lista.map((m) => {
                const estado = estadoInfo(m.estado)
                const iniciales = (m.nombre_cliente || '??').split(' ').filter(Boolean).slice(0, 2).map((s: string) => s[0]).join('').toUpperCase()
                return (
                  <tr key={m.id} className="hover:bg-color-base-content/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-linear-to-br from-color-primary/20 to-color-accent-pink/20 border border-color-base-content/10 flex items-center justify-center text-color-primary font-black shadow-lg shrink-0">
                          <span>{iniciales}</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-color-base-content truncate">{m.nombre_cliente}</span>
                          <span className="text-xs text-color-base-content/40 truncate">{m.correo_cliente}</span>
                          <span className="text-xs text-color-base-content/40">{m.telefono_whatsapp} · {m.pais}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-color-base-content/80">{NOMBRE_NIVEL[m.nivel] || m.nivel}</td>
                    <td className="px-6 py-4 text-sm text-color-base-content/80 capitalize">{m.ciclo}</td>
                    <td className="px-6 py-4 text-sm text-color-base-content/80 whitespace-nowrap">
                      {m.monto_cop
                        ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(m.monto_cop)
                        : `$${m.monto_usd} USD`}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${estado.clase}`}>
                        {estado.etiqueta}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-color-base-content/60 whitespace-nowrap">
                      {m.fecha_proximo_pago ? new Date(m.fecha_proximo_pago).toLocaleDateString('es-CO') : '-'}
                    </td>
                    <td className="px-6 py-4 text-xs text-color-base-content/70">
                      {usoPor.get(m.id)
                        ? usoPor.get(m.id)!.lineas
                            .filter((l) => l.limite !== 0)
                            .map((l) => (
                              <div key={l.clave} className="whitespace-nowrap">
                                {ETIQUETA_BENEFICIO[l.clave]}:{' '}
                                <span className="font-bold text-color-base-content">
                                  {l.limite === null ? `${l.usados} (sin límite)` : `${l.usados}/${l.limite}`}
                                </span>
                              </div>
                            ))
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {m.estado !== 'activa' ? (
                        <MarcarMembresiaPagadaButton membresiaId={m.id} />
                      ) : (
                        <RegistrarUsoMembresia membresiaId={m.id} />
                      )}
                    </td>
                  </tr>
                )
              })}
              {lista.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm text-color-base-content/40 italic">
                    <CreditCard className="h-5 w-5 mx-auto mb-2 opacity-40" />
                    Todavía no hay membresías registradas.
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
