import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ShieldAlert, MessageCircle } from 'lucide-react'
import { EstadoQuejaSelect } from '@/components/admin/EstadoQuejaSelect'

export const dynamic = 'force-dynamic'

export default async function AdminSoportePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email?.toLowerCase() !== 'servingbuilderapp@gmail.com') {
    redirect('/dashboard')
  }

  const { data: quejas } = await supabase
    .from('quejas_fallos_ia')
    .select('id, nombre_cliente, tipo, descripcion, estado, created_at')
    .order('created_at', { ascending: false })

  const lista = quejas || []
  const totalAbiertas = lista.filter((q) => q.estado === 'Abierto').length
  const totalEnProceso = lista.filter((q) => q.estado === 'En Proceso').length
  const totalResueltas = lista.filter((q) => q.estado === 'Resuelto').length

  return (
    <div className="space-y-8 pb-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-color-base-content tracking-tight">
          Soporte
        </h1>
        <p className="text-color-base-content/60 text-sm mt-2 max-w-3xl">
          Buzón de dudas y problemas de clientes: quejas, y avisos cuando algo falla en el motor de IA.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#3B1727]/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-[10px] font-black text-color-base-content/45 uppercase tracking-widest">Abiertas</span>
          <span className={`text-2xl font-black tabular-nums ${totalAbiertas > 0 ? 'text-[#E0917E]' : 'text-color-base-content'}`}>
            {totalAbiertas}
          </span>
        </div>
        <div className="bg-[#3B1727]/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-[10px] font-black text-color-base-content/45 uppercase tracking-widest">En proceso</span>
          <span className="text-2xl font-black text-[#E0B868] tabular-nums">{totalEnProceso}</span>
        </div>
        <div className="bg-[#3B1727]/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-[10px] font-black text-color-base-content/45 uppercase tracking-widest">Resueltas</span>
          <span className="text-2xl font-black text-[#9BB18D] tabular-nums">{totalResueltas}</span>
        </div>
      </div>

      <div className="bg-[#3B1727] border border-color-base-content/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-color-base-content/10 bg-[#4C2032]">
                <th className="px-6 py-4 text-xs font-bold text-color-base-content/40 uppercase tracking-widest w-1/5">Cliente</th>
                <th className="px-6 py-4 text-xs font-bold text-color-base-content/40 uppercase tracking-widest w-1/6">Tipo</th>
                <th className="px-6 py-4 text-xs font-bold text-color-base-content/40 uppercase tracking-widest">Descripción</th>
                <th className="px-6 py-4 text-xs font-bold text-color-base-content/40 uppercase tracking-widest text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {lista.map((q) => (
                <tr key={q.id} className="hover:bg-color-base-content/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-color-primary/15 border border-color-primary/25 flex items-center justify-center text-color-primary shrink-0">
                        <MessageCircle className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold text-color-base-content">{q.nombre_cliente}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${
                        q.tipo === 'Fallo Motor IA'
                          ? 'bg-[#C0604A]/15 text-[#E0917E]'
                          : 'bg-[#C99A3D]/15 text-[#E0B868]'
                      }`}
                    >
                      {q.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-color-base-content/70 max-w-md">
                    {q.descripcion}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <EstadoQuejaSelect quejaId={q.id} estadoActual={q.estado} />
                  </td>
                </tr>
              ))}
              {lista.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-color-base-content/40 italic">
                    <ShieldAlert className="h-5 w-5 mx-auto mb-2 opacity-40" />
                    No hay quejas ni fallos reportados.
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
