import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MarcarMembresiaPagadaButton } from '@/components/admin/MarcarMembresiaPagadaButton'

export const dynamic = 'force-dynamic'

const NOMBRE_NIVEL: Record<string, string> = {
  explorador: 'Explorador',
  constructor: 'Constructor',
  arquitecto: 'Arquitecto',
}

export default async function AdminMembresiasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email?.toLowerCase() !== 'servingbuilderapp@gmail.com') {
    redirect('/dashboard')
  }

  const { data: membresias } = await supabase
    .from('membresias_clientes')
    .select('id, nombre_cliente, correo_cliente, telefono_whatsapp, pais, nivel, ciclo, monto_usd, monto_cop, estado, fecha_proximo_pago, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-color-base-content">Membresías</h1>
        <p className="text-color-base-content/60 text-sm mt-1">
          Confirma el pago de cada membresía cuando llegue el comprobante por WhatsApp.
          Es cobro recurrente manual: cuando venza, vuelve a llegar el comprobante y se
          confirma de nuevo.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-color-base-content/10">
        <table className="w-full text-sm">
          <thead className="bg-color-base-content/5">
            <tr className="text-left">
              <th className="p-3 font-black text-xs uppercase tracking-wider">Cliente</th>
              <th className="p-3 font-black text-xs uppercase tracking-wider">Nivel</th>
              <th className="p-3 font-black text-xs uppercase tracking-wider">Ciclo</th>
              <th className="p-3 font-black text-xs uppercase tracking-wider">Monto</th>
              <th className="p-3 font-black text-xs uppercase tracking-wider">Estado</th>
              <th className="p-3 font-black text-xs uppercase tracking-wider">Próximo pago</th>
              <th className="p-3 font-black text-xs uppercase tracking-wider">Acción</th>
            </tr>
          </thead>
          <tbody>
            {(membresias || []).map((m) => (
              <tr key={m.id} className="border-t border-color-base-content/5">
                <td className="p-3">
                  <div className="font-bold">{m.nombre_cliente}</div>
                  <div className="text-color-base-content/50 text-xs">{m.correo_cliente}</div>
                  <div className="text-color-base-content/50 text-xs">{m.telefono_whatsapp} · {m.pais}</div>
                </td>
                <td className="p-3">{NOMBRE_NIVEL[m.nivel] || m.nivel}</td>
                <td className="p-3 capitalize">{m.ciclo}</td>
                <td className="p-3">
                  {m.monto_cop
                    ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(m.monto_cop)
                    : `$${m.monto_usd} USD`}
                </td>
                <td className="p-3">
                  <span className={
                    m.estado === 'activa'
                      ? 'px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold'
                      : m.estado === 'vencida'
                      ? 'px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold'
                      : m.estado === 'cancelada'
                      ? 'px-2 py-1 rounded-full bg-gray-200 text-gray-600 text-xs font-bold'
                      : 'px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold'
                  }>
                    {m.estado}
                  </span>
                </td>
                <td className="p-3 text-xs text-color-base-content/60">
                  {m.fecha_proximo_pago
                    ? new Date(m.fecha_proximo_pago).toLocaleDateString('es-CO')
                    : '-'}
                </td>
                <td className="p-3">
                  {m.estado !== 'activa' && (
                    <MarcarMembresiaPagadaButton membresiaId={m.id} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
