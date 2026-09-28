import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CreditCard, DollarSign, Users, Shield, Lock } from 'lucide-react'
import { COBRO_COLOMBIA, COBRO_EXTERIOR, IVA, PAGO_EN_DOS_PARTES } from '@/lib/mediosDePago'
import { ESCALA_EXITO_GENERAL, ESCALA_EXITO_FONDO_EMPRENDER } from '@/lib/comisionExito'
import { MODALIDADES_ESTRUCTURACION, type PlanEstructuracionMapeado } from '@/lib/estructuracionMapping'
import type { EscalonExito } from '@/lib/comisionExito'

export const dynamic = 'force-dynamic'

export default async function AdminConfiguracionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email?.toLowerCase() !== 'servingbuilderapp@gmail.com') {
    redirect('/dashboard')
  }

  const { data: equipo } = await supabase
    .from('users')
    .select('id, first_name, last_name, email, role, created_at')
    .in('role', ['admin', 'socio'])
    .order('role', { ascending: true })

  const listaEquipo = equipo || []

  return (
    <div className="space-y-8 pb-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-color-base-content tracking-tight">
          Configuración y Control
        </h1>
        <p className="text-color-base-content/60 text-sm mt-2 max-w-3xl">
          Cómo está cobrando hoy el portal, los precios internos vigentes, y quién del equipo tiene acceso.
          Los medios de pago y los precios se cambian en el código — aquí solo se muestran para consulta rápida.
        </p>
      </div>

      {/* MEDIOS DE PAGO */}
      <div className="bg-[#3B1727] border border-color-base-content/10 rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-black text-color-base-content uppercase tracking-wider flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-color-primary" /> Medios de pago activos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#4C2032]/60 border border-white/10 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-black text-color-base-content/45 uppercase tracking-widest">Colombia</span>
            <div>
              <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${
                COBRO_COLOMBIA.modo === 'transferencia' ? 'bg-[#7A8B6F]/20 text-[#9BB18D]' : 'bg-[#C99A3D]/20 text-[#E0B868]'
              }`}>
                Modo: {COBRO_COLOMBIA.modo === 'transferencia' ? 'Transferencia directa' : 'Factura'}
              </span>
            </div>
            {COBRO_COLOMBIA.cuenta && (
              <div className="text-xs text-color-base-content/70 space-y-1 pt-2 border-t border-white/5">
                <p><span className="text-color-base-content/40">Banco:</span> {COBRO_COLOMBIA.cuenta.banco} ({COBRO_COLOMBIA.cuenta.tipo})</p>
                <p><span className="text-color-base-content/40">Cuenta:</span> {COBRO_COLOMBIA.cuenta.numero}</p>
                <p><span className="text-color-base-content/40">Titular:</span> {COBRO_COLOMBIA.cuenta.titular}</p>
                <p><span className="text-color-base-content/40">NIT:</span> {COBRO_COLOMBIA.cuenta.nit}</p>
                {COBRO_COLOMBIA.cuenta.llaves?.map((k) => (
                  <p key={k.etiqueta}><span className="text-color-base-content/40">Llave ({k.etiqueta}):</span> {k.valor}</p>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#4C2032]/60 border border-white/10 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-black text-color-base-content/45 uppercase tracking-widest">Exterior</span>
            <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${
              COBRO_EXTERIOR.paypal ? 'bg-[#7A8B6F]/20 text-[#9BB18D]' : 'bg-color-base-content/10 text-color-base-content/50'
            }`}>
              PayPal: {COBRO_EXTERIOR.paypal ? 'Activo' : 'Apagado'}
            </span>
            <p className="text-xs text-color-base-content/50 pt-2 border-t border-white/5">
              Pago en dos partes: {PAGO_EN_DOS_PARTES.activo ? `activo, ${PAGO_EN_DOS_PARTES.porcentajeAnticipo}% al firmar` : 'apagado'}
            </p>
          </div>
        </div>
      </div>

      {/* PRECIOS Y COMISIONES */}
      <div className="bg-[#3B1727] border border-color-base-content/10 rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-black text-color-base-content uppercase tracking-wider flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-color-primary" /> Precios internos y comisiones
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODALIDADES_ESTRUCTURACION.map((plan: PlanEstructuracionMapeado) => (
            <div key={plan.nombre} className="bg-[#4C2032]/60 border border-white/10 rounded-xl p-4">
              <span className="text-[10px] font-black text-color-base-content/45 uppercase tracking-widest">{plan.nombre}</span>
              <p className="text-xl font-black text-color-base-content mt-1">
                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(plan.honorariosBase)}
                <span className="text-xs text-color-base-content/40 font-normal"> + IVA</span>
              </p>
            </div>
          ))}
        </div>

        <p className="text-xs text-color-base-content/50">Tarifa de IVA vigente: {IVA.etiqueta}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <span className="text-[10px] font-black text-color-base-content/45 uppercase tracking-widest">Comisión de éxito — general</span>
            <div className="mt-2 space-y-1.5">
              {ESCALA_EXITO_GENERAL.map((e: EscalonExito) => (
                <div key={e.etiqueta} className="flex justify-between text-xs text-color-base-content/70 border-b border-white/5 pb-1">
                  <span>{e.etiqueta}</span>
                  <span className="font-bold text-color-primary">{e.porcentaje}%</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-black text-color-base-content/45 uppercase tracking-widest">Comisión de éxito — Fondo Emprender</span>
            <div className="mt-2 space-y-1.5">
              {ESCALA_EXITO_FONDO_EMPRENDER.map((e: EscalonExito) => (
                <div key={e.etiqueta} className="flex justify-between text-xs text-color-base-content/70 border-b border-white/5 pb-1">
                  <span>{e.etiqueta}</span>
                  <span className="font-bold text-color-primary">{e.porcentaje}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ACCESO DEL EQUIPO */}
      <div className="bg-[#3B1727] border border-color-base-content/10 rounded-2xl overflow-hidden">
        <div className="p-6 pb-0">
          <h2 className="text-sm font-black text-color-base-content uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-color-primary" /> Quién tiene acceso
          </h2>
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-color-base-content/10 bg-[#4C2032]">
                <th className="px-6 py-3 text-xs font-bold text-color-base-content/40 uppercase tracking-widest">Persona</th>
                <th className="px-6 py-3 text-xs font-bold text-color-base-content/40 uppercase tracking-widest">Rol</th>
                <th className="px-6 py-3 text-xs font-bold text-color-base-content/40 uppercase tracking-widest">Desde</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {listaEquipo.map((m) => (
                <tr key={m.id} className="hover:bg-color-base-content/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-color-primary/15 border border-color-primary/25 flex items-center justify-center text-color-primary shrink-0">
                        <Shield className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-color-base-content">{m.first_name} {m.last_name}</span>
                        <span className="text-xs text-color-base-content/40">{m.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                      m.role === 'admin' ? 'bg-color-primary/20 text-color-primary' : 'bg-[#7A8B6F]/20 text-[#9BB18D]'
                    }`}>
                      {m.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-color-base-content/50">
                    {m.created_at ? new Date(m.created_at).toLocaleDateString('es-CO') : '-'}
                  </td>
                </tr>
              ))}
              {listaEquipo.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-sm text-color-base-content/40 italic">
                    <Lock className="h-5 w-5 mx-auto mb-2 opacity-40" />
                    No hay administradores ni socios registrados todavía.
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
