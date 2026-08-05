import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MarcarPagadoButton } from '@/components/admin/MarcarPagadoButton'

export const dynamic = 'force-dynamic'

export default async function AdminProyectosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email?.toLowerCase() !== 'servingbuilderapp@gmail.com') {
    redirect('/dashboard')
  }

  const { data: proyectos } = await supabase
    .from('proyectos_clientes_serving')
    .select('id, nombre_cliente, correo_cliente, telefono_whatsapp, nombre_iniciativa, plan_pago, monto_solicitado_cop, monto_solicitado_usd, estado_actual, pasarela_pago, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-color-base-content">Proyectos de Clientes</h1>
        <p className="text-color-base-content/60 text-sm mt-1">
          Confirma el pago de cada proyecto para activar su estructuración.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-color-base-content/10">
        <table className="w-full text-sm">
          <thead className="bg-color-base-content/5">
            <tr className="text-left">
              <th className="p-3 font-black text-xs uppercase tracking-wider">Cliente</th>
              <th className="p-3 font-black text-xs uppercase tracking-wider">Proyecto</th>
              <th className="p-3 font-black text-xs uppercase tracking-wider">Plan</th>
              <th className="p-3 font-black text-xs uppercase tracking-wider">Monto</th>
              <th className="p-3 font-black text-xs uppercase tracking-wider">Estado</th>
              <th className="p-3 font-black text-xs uppercase tracking-wider">Acción</th>
            </tr>
          </thead>
          <tbody>
            {(proyectos || []).map((p) => (
              <tr key={p.id} className="border-t border-color-base-content/5">
                <td className="p-3">
                  <div className="font-bold">{p.nombre_cliente}</div>
                  <div className="text-color-base-content/50 text-xs">{p.correo_cliente}</div>
                  <div className="text-color-base-content/50 text-xs">{p.telefono_whatsapp}</div>
                </td>
                <td className="p-3">{p.nombre_iniciativa}</td>
                <td className="p-3">{p.plan_pago}</td>
                <td className="p-3">
                  {p.monto_solicitado_cop
                    ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p.monto_solicitado_cop)
                    : p.monto_solicitado_usd
                    ? `$${p.monto_solicitado_usd} USD`
                    : '-'}
                </td>
                <td className="p-3">
                  <span className={
                    p.estado_actual === 'pagado'
                      ? 'px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold'
                      : 'px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold'
                  }>
                    {p.estado_actual}
                  </span>
                </td>
                <td className="p-3">
                  {p.estado_actual !== 'pagado' && (
                    <MarcarPagadoButton proyectoId={p.id} />
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
