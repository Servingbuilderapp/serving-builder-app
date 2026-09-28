import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Eye, Search } from 'lucide-react'
import { MarcarPagadoButton } from '@/components/admin/MarcarPagadoButton'
import { MarcarCanalButton } from '@/components/admin/MarcarCanalButton'

export const dynamic = 'force-dynamic'

type EstadoInfo = { etiqueta: string; clase: string }

// Traduce los distintos nombres técnicos de estado_actual a una etiqueta
// humana y a un color con sentido (verde = pagado, ámbar = en curso,
// dorado = ya casi termina). Ver [[arquitectura-digital-panel]] para la
// lista completa de estados que usa la cadena automática.
function estadoInfo(estado: string | null): EstadoInfo {
  const verde = 'bg-[#7A8B6F]/20 text-[#9BB18D]'
  const ambar = 'bg-[#C99A3D]/20 text-[#E0B868]'
  const dorado = 'bg-color-primary/20 text-color-primary'
  const neutro = 'bg-color-base-content/10 text-color-base-content/60'

  switch (estado) {
    case 'pagado':
    case 'pago_aprobado':
      return { etiqueta: 'Pago confirmado', clase: verde }
    case 'en_estructuracion':
    case 'estructurando_ia':
      return { etiqueta: 'En estructuración', clase: ambar }
    case 'estructurado':
    case 'en_encaje':
      return { etiqueta: 'Buscando convocatoria', clase: dorado }
    case 'postulado':
      return { etiqueta: 'Postulado', clase: dorado }
    default:
      return { etiqueta: estado || 'Sin pago', clase: neutro }
  }
}

function diasDesde(fecha: string | null): number | null {
  if (!fecha) return null
  const ms = Date.now() - new Date(fecha).getTime()
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))
}

export default async function AdminProyectosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email?.toLowerCase() !== 'servingbuilderapp@gmail.com') {
    redirect('/dashboard')
  }

  const { data: proyectos } = await supabase
    .from('proyectos_clientes_serving')
    .select('id, nombre_cliente, correo_cliente, telefono_whatsapp, nombre_iniciativa, plan_pago, monto_solicitado_cop, monto_solicitado_usd, estado_actual, pasarela_pago, canal_origen, created_at')
    .order('created_at', { ascending: false })

  const listaProyectos = proyectos || []
  const totalProyectos = listaProyectos.length
  const totalPagados = listaProyectos.filter((p) => ['pagado', 'pago_aprobado'].includes(p.estado_actual || '')).length
  const totalEstancados = listaProyectos.filter((p) => {
    const dias = diasDesde(p.created_at)
    return dias !== null && dias > 5 && p.estado_actual !== 'postulado'
  }).length

  return (
    <div className="space-y-8 pb-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-color-base-content tracking-tight">
          Seguimiento de Clientes y Proyectos
        </h1>
        <p className="text-color-base-content/60 text-sm mt-2 max-w-3xl">
          En qué paso va cada cliente, si ya pagó, y quién lleva demasiado tiempo estancado en el mismo paso.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#3B1727]/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-[10px] font-black text-color-base-content/45 uppercase tracking-widest">Proyectos totales</span>
          <span className="text-2xl font-black text-color-base-content tabular-nums">{totalProyectos}</span>
        </div>
        <div className="bg-[#3B1727]/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-[10px] font-black text-color-base-content/45 uppercase tracking-widest">Con pago confirmado</span>
          <span className="text-2xl font-black text-[#9BB18D] tabular-nums">{totalPagados}</span>
        </div>
        <div className="bg-[#3B1727]/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
          <span className="text-[10px] font-black text-color-base-content/45 uppercase tracking-widest">Estancados (+5 días)</span>
          <span className={`text-2xl font-black tabular-nums ${totalEstancados > 0 ? 'text-[#E0917E]' : 'text-color-base-content'}`}>
            {totalEstancados}
          </span>
        </div>
      </div>

      <div className="bg-[#3B1727] border border-color-base-content/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-color-base-content/10 bg-[#4C2032]">
                <th className="px-6 py-4 text-xs font-bold text-color-base-content/40 uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-4 text-xs font-bold text-color-base-content/40 uppercase tracking-widest">Proyecto</th>
                <th className="px-6 py-4 text-xs font-bold text-color-base-content/40 uppercase tracking-widest">Monto</th>
                <th className="px-6 py-4 text-xs font-bold text-color-base-content/40 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-color-base-content/40 uppercase tracking-widest">Tiempo</th>
                <th className="px-6 py-4 text-xs font-bold text-color-base-content/40 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {listaProyectos.map((p) => {
                const telefonoLimpio = (p.telefono_whatsapp || '').replace(/[^0-9]/g, '')
                const mensajeAdmin = `Hola ${p.nombre_cliente}, te escribimos de Arquitectura Digital sobre el Portal Réplica para tu proyecto "${p.nombre_iniciativa}".`
                const linkPortalReplica = telefonoLimpio
                  ? `https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(mensajeAdmin)}`
                  : null

                const estado = estadoInfo(p.estado_actual)
                const dias = diasDesde(p.created_at)
                const estancado = dias !== null && dias > 5 && p.estado_actual !== 'postulado'
                const iniciales = (p.nombre_cliente || '??').split(' ').filter(Boolean).slice(0, 2).map((s: string) => s[0]).join('').toUpperCase()

                return (
                  <tr key={p.id} className="hover:bg-color-base-content/5 transition-colors group align-top">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-linear-to-br from-color-primary/20 to-color-accent-pink/20 border border-color-base-content/10 flex items-center justify-center text-color-primary font-black shadow-lg shrink-0">
                          <span>{iniciales}</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-color-base-content truncate">{p.nombre_cliente}</span>
                          <span className="text-xs text-color-base-content/40 truncate">{p.correo_cliente}</span>
                          <span className="text-xs text-color-base-content/40">{p.telefono_whatsapp}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-color-base-content max-w-[220px] truncate">{p.nombre_iniciativa}</div>
                      <div className="mt-1">
                        {p.canal_origen === 'marca_blanca' ? (
                          <span className="px-2 py-0.5 rounded-full bg-color-primary/15 text-color-primary text-[10px] font-bold whitespace-nowrap">
                            Marca blanca
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-color-base-content/10 text-color-base-content/50 text-[10px] font-bold whitespace-nowrap">
                            Directo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-color-base-content/80 whitespace-nowrap">
                      {p.monto_solicitado_cop
                        ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p.monto_solicitado_cop)
                        : p.monto_solicitado_usd
                        ? `$${p.monto_solicitado_usd} USD`
                        : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${estado.clase}`}>
                        {estado.etiqueta}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold whitespace-nowrap ${estancado ? 'text-[#E0917E]' : 'text-color-base-content/40'}`}>
                        {dias === null ? '-' : dias === 0 ? 'Hoy' : `hace ${dias} día${dias === 1 ? '' : 's'}`}
                      </span>
                      {estancado && (
                        <div className="text-[10px] text-[#E0917E] font-bold uppercase tracking-wide mt-0.5">Estancado</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-end gap-2">
                        <Link href={`/admin/proyectos/${p.id}`}>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-color-primary/15 border border-color-primary/25 text-color-primary text-xs font-bold hover:bg-color-primary/25 transition-all whitespace-nowrap">
                            <Eye className="h-3.5 w-3.5" /> Abrir proyecto
                          </button>
                        </Link>
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {p.estado_actual !== 'pagado' && (
                            <MarcarPagadoButton proyectoId={p.id} />
                          )}
                          <MarcarCanalButton
                            proyectoId={p.id}
                            canalActual={p.canal_origen === 'marca_blanca' ? 'marca_blanca' : 'directo'}
                          />
                          {linkPortalReplica && (
                            <a
                              href={linkPortalReplica}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-full bg-color-base-content/10 text-color-base-content/60 text-xs font-bold hover:bg-color-base-content/20 whitespace-nowrap"
                            >
                              Portal Réplica
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {listaProyectos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-color-base-content/40 italic">
                    <Search className="h-5 w-5 mx-auto mb-2 opacity-40" />
                    Todavía no hay proyectos de clientes.
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
