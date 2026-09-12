import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MarcarAcademiaPagadaButton } from '@/components/admin/MarcarAcademiaPagadaButton'

export const dynamic = 'force-dynamic'

const NOMBRE_CURSO: Record<string, string> = {
  estructuracion: 'Entendiendo la Estructuración de Proyectos',
  formulacion: 'Entendiendo la Formulación de Proyectos',
}

export default async function AdminAcademiaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email?.toLowerCase() !== 'servingbuilderapp@gmail.com') {
    redirect('/dashboard')
  }

  const { data: compras } = await supabase
    .from('academia_compras')
    .select('id, nombre_cliente, correo_cliente, telefono_whatsapp, pais, curso, monto_usd, monto_cop, estado, fecha_pago, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-color-base-content">Academia</h1>
        <p className="text-color-base-content/60 text-sm mt-1">
          Confirma el pago de cada compra cuando llegue el comprobante por WhatsApp.
          Es pago único: una vez confirmada, la persona tiene acceso de por vida a ese curso.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-color-base-content/10">
        <table className="w-full text-sm">
          <thead className="bg-color-base-content/5">
            <tr className="text-left">
              <th className="p-3 font-black text-xs uppercase tracking-wider">Cliente</th>
              <th className="p-3 font-black text-xs uppercase tracking-wider">Curso</th>
              <th className="p-3 font-black text-xs uppercase tracking-wider">Monto</th>
              <th className="p-3 font-black text-xs uppercase tracking-wider">Estado</th>
              <th className="p-3 font-black text-xs uppercase tracking-wider">Fecha de pago</th>
              <th className="p-3 font-black text-xs uppercase tracking-wider">Acción</th>
            </tr>
          </thead>
          <tbody>
            {(compras || []).map((c) => (
              <tr key={c.id} className="border-t border-color-base-content/5">
                <td className="p-3">
                  <div className="font-bold">{c.nombre_cliente}</div>
                  <div className="text-color-base-content/50 text-xs">{c.correo_cliente}</div>
                  <div className="text-color-base-content/50 text-xs">{c.telefono_whatsapp} · {c.pais}</div>
                </td>
                <td className="p-3">{NOMBRE_CURSO[c.curso] || c.curso}</td>
                <td className="p-3">
                  {c.monto_cop
                    ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(c.monto_cop)
                    : `$${c.monto_usd} USD`}
                </td>
                <td className="p-3">
                  <span className={
                    c.estado === 'pagado'
                      ? 'px-2 py-1 rounded-full bg-[#7A8B6F]/20 text-[#9BB18D] text-xs font-bold'
                      : 'px-2 py-1 rounded-full bg-[#C99A3D]/20 text-[#E0B868] text-xs font-bold'
                  }>
                    {c.estado}
                  </span>
                </td>
                <td className="p-3 text-xs text-color-base-content/60">
                  {c.fecha_pago
                    ? new Date(c.fecha_pago).toLocaleDateString('es-CO')
                    : '-'}
                </td>
                <td className="p-3">
                  {c.estado !== 'pagado' && (
                    <MarcarAcademiaPagadaButton compraId={c.id} />
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
