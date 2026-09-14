import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Vista simplificada de canal — solo los proyectos marcados como
 * 'marca_blanca' (ver /admin/proyectos, botón "Marcar como marca blanca").
 *
 * Es de solo lectura, sin acciones: cuánto proyectos hay, en qué etapa va
 * cada uno, y si alguno está atrasado. No reemplaza el detalle completo de
 * cada proyecto — para eso están los enlaces de /admin/proyectos.
 *
 * Esto NO separa datos por socio todavía (cualquiera del equipo Serving
 * que entra aquí ve todos los proyectos de marca blanca, sin importar de
 * qué socio serían). Esa separación (multi-tenant) es un paso aparte, ver
 * `marca-blanca-socio-volumen-2026-09-13.md`.
 */

type Etapa = 'Pendiente de pago' | 'En estructuración' | 'Buscando convocatorias'

function calcularEtapa(estadoActual: string | null, listoParaEncaje: boolean | null): Etapa {
  if (estadoActual !== 'pagado') return 'Pendiente de pago'
  if (listoParaEncaje) return 'Buscando convocatorias'
  return 'En estructuración'
}

export default async function AdminMarcaBlancaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email?.toLowerCase() !== 'servingbuilderapp@gmail.com') {
    redirect('/dashboard')
  }

  const { data: proyectos } = await supabase
    .from('proyectos_clientes_serving')
    .select(
      'id, nombre_cliente, nombre_iniciativa, plan_pago, monto_solicitado_cop, monto_solicitado_usd, estado_actual, listo_para_encaje, fecha_limite_entrega, created_at'
    )
    .eq('canal_origen', 'marca_blanca')
    .order('created_at', { ascending: false })

  const ahora = new Date()
  const lista = proyectos || []

  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-color-base-content">Marca blanca</h1>
        <p className="text-color-base-content/60 text-sm mt-1">
          Proyectos marcados como canal de marca blanca. Solo lectura — para actuar
          sobre un proyecto, entra a{' '}
          <Link href="/admin/proyectos" className="text-color-primary hover:underline">
            Proyectos de clientes
          </Link>
          .
        </p>
      </div>

      {lista.length === 0 ? (
        <div className="rounded-2xl border border-color-base-content/10 p-8 text-center text-sm text-color-base-content/60">
          Todavía no hay ningún proyecto marcado como marca blanca. Se marcan desde{' '}
          <Link href="/admin/proyectos" className="text-color-primary hover:underline">
            Proyectos de clientes
          </Link>
          , con el botón &quot;Marcar como marca blanca&quot;.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-color-base-content/10">
          <table className="w-full text-sm">
            <thead className="bg-color-base-content/5">
              <tr className="text-left">
                <th className="p-3 font-black text-xs uppercase tracking-wider">Cliente</th>
                <th className="p-3 font-black text-xs uppercase tracking-wider">Proyecto</th>
                <th className="p-3 font-black text-xs uppercase tracking-wider">Plan</th>
                <th className="p-3 font-black text-xs uppercase tracking-wider">Monto</th>
                <th className="p-3 font-black text-xs uppercase tracking-wider">Etapa</th>
                <th className="p-3 font-black text-xs uppercase tracking-wider">Alerta</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => {
                const etapa = calcularEtapa(p.estado_actual, p.listo_para_encaje)
                const fechaLimite = p.fecha_limite_entrega ? new Date(p.fecha_limite_entrega) : null
                const atrasado = !!fechaLimite && !p.listo_para_encaje && fechaLimite < ahora

                return (
                  <tr key={p.id} className="border-t border-color-base-content/5">
                    <td className="p-3 font-bold">{p.nombre_cliente}</td>
                    <td className="p-3">
                      <Link href={`/admin/proyectos/${p.id}/arbol`} className="hover:underline">
                        {p.nombre_iniciativa}
                      </Link>
                    </td>
                    <td className="p-3">{p.plan_pago}</td>
                    <td className="p-3">
                      {p.monto_solicitado_cop
                        ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p.monto_solicitado_cop)
                        : p.monto_solicitado_usd
                        ? `$${p.monto_solicitado_usd} USD`
                        : '-'}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-full bg-color-primary/10 text-color-primary text-xs font-bold whitespace-nowrap">
                        {etapa}
                      </span>
                    </td>
                    <td className="p-3">
                      {atrasado ? (
                        <span className="px-2 py-1 rounded-full bg-red-500/15 text-red-600 text-xs font-bold whitespace-nowrap">
                          Atrasado — venció {fechaLimite!.toLocaleDateString('es-CO')}
                        </span>
                      ) : (
                        <span className="text-color-base-content/40 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
