import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { esEquipoServing } from '@/lib/guardiaEquipo'
import { cargarPendientesCliente } from '@/lib/cargarPendientesCliente'
import { PendientesCliente } from '@/components/panel/PendientesCliente'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * "Ver lo que ve el cliente" — solo para el equipo de Serving.
 *
 * "Lo que me piden" muestra el proyecto de quien tiene la sesión abierta, así
 * que desde la cuenta del equipo nunca se veía lo de un cliente real. Aquí el
 * equipo escoge un proyecto y ve la MISMA pantalla que ve ese cliente, con los
 * mismos datos, pero en modo solo lectura: ningún botón envía nada.
 */
export default async function VerComoClientePage({
  searchParams,
}: {
  searchParams: Promise<{ proyecto?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await esEquipoServing())) redirect('/dashboard')

  const { proyecto: proyectoElegido } = await searchParams

  /* --- vista de un cliente ------------------------------------------------ */

  if (proyectoElegido) {
    const { data: proyecto } = await supabaseAdmin
      .from('proyectos_clientes_serving')
      .select('id, nombre_cliente, correo_cliente, nombre_iniciativa, archivo_proyecto_nombre, archivo_proyecto_url')
      .eq('id', proyectoElegido)
      .maybeSingle()

    if (!proyecto) {
      return (
        <div className="space-y-4">
          <Link href="/admin/ver-como-cliente" className="inline-flex items-center gap-1.5 text-sm font-bold text-color-primary">
            <ArrowLeft className="h-4 w-4" /> Volver a la lista
          </Link>
          <p className="text-sm text-color-base-content/70">No encontramos ese proyecto.</p>
        </div>
      )
    }

    const datos = await cargarPendientesCliente(supabaseAdmin, proyecto)

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/ver-como-cliente" className="inline-flex items-center gap-1.5 text-sm font-bold text-color-primary">
            <ArrowLeft className="h-4 w-4" /> Volver a la lista
          </Link>
        </div>
        <div className="rounded-2xl border border-[#C99A3D]/40 bg-[#C99A3D]/12 px-4 py-3 text-[13px] leading-relaxed text-[#E0B868]">
          <strong>Estás viendo la pantalla de {proyecto.nombre_cliente || 'un cliente'}</strong>
          {proyecto.correo_cliente ? ` (${proyecto.correo_cliente})` : ''}. Es solo para mirar: los
          botones están apagados y nada de lo que toques le llega al cliente.
        </div>
        <div className="overflow-hidden rounded-2xl">
          <PendientesCliente datos={datos} soloVista />
        </div>
      </div>
    )
  }

  /* --- lista de proyectos ------------------------------------------------- */

  const { data: proyectos } = await supabaseAdmin
    .from('proyectos_clientes_serving')
    .select('id, nombre_cliente, correo_cliente, nombre_iniciativa, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  const lista = (proyectos || []) as {
    id: string
    nombre_cliente: string | null
    correo_cliente: string | null
    nombre_iniciativa: string | null
  }[]

  const ids = lista.map((p) => String(p.id))

  const { data: sinResponder } = ids.length
    ? await supabaseAdmin
        .from('preguntas_pendientes_proyecto')
        .select('id_proyecto')
        .in('id_proyecto', ids)
        .eq('respondida', false)
    : { data: [] as { id_proyecto: string }[] }

  const { data: conAviso } = ids.length
    ? await supabaseAdmin
        .from('contenido_pasos_proyecto')
        .select('id_proyecto, advertencia')
        .in('id_proyecto', ids)
        .not('advertencia', 'is', null)
    : { data: [] as { id_proyecto: string; advertencia: string | null }[] }

  const preguntasPor = new Map<string, number>()
  for (const f of sinResponder || []) {
    const k = String(f.id_proyecto)
    preguntasPor.set(k, (preguntasPor.get(k) || 0) + 1)
  }
  const avisosPor = new Map<string, number>()
  for (const f of conAviso || []) {
    if (!String(f.advertencia || '').trim()) continue
    const k = String(f.id_proyecto)
    avisosPor.set(k, (avisosPor.get(k) || 0) + 1)
  }

  // Primero los que tienen algo pendiente.
  const ordenada = [...lista].sort((a, b) => {
    const pa = (preguntasPor.get(String(a.id)) || 0) + (avisosPor.get(String(a.id)) || 0)
    const pb = (preguntasPor.get(String(b.id)) || 0) + (avisosPor.get(String(b.id)) || 0)
    return pb - pa
  })

  return (
    <div className="space-y-6 pb-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-color-base-content">
          Ver lo que ve el cliente
        </h1>
        <p className="max-w-3xl text-sm text-color-base-content/60">
          Escoge un proyecto y verás la pantalla &quot;Lo que me piden&quot; tal como la ve ese
          cliente. Es solo para mirar: no se puede enviar nada desde aquí.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-color-base-content/10 bg-[#3B1727]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-color-base-content/10 bg-[#4C2032]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-color-base-content/40">Cliente</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-color-base-content/40">Proyecto</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-color-base-content/40">Preguntas sin responder</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-color-base-content/40">Pasos por reforzar</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-color-base-content/40">Ver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ordenada.map((p) => {
                const preguntas = preguntasPor.get(String(p.id)) || 0
                const avisos = avisosPor.get(String(p.id)) || 0
                return (
                  <tr key={p.id} className="align-top transition-colors hover:bg-color-base-content/5">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-color-base-content">{p.nombre_cliente || '—'}</div>
                      <div className="text-xs text-color-base-content/40">{p.correo_cliente}</div>
                    </td>
                    <td className="max-w-[260px] truncate px-6 py-4 text-sm text-color-base-content">{p.nombre_iniciativa || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-black tabular-nums ${preguntas > 0 ? 'text-[#E0917E]' : 'text-color-base-content/50'}`}>
                        {preguntas}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-black tabular-nums ${avisos > 0 ? 'text-[#E0B868]' : 'text-color-base-content/50'}`}>
                        {avisos}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/ver-como-cliente?proyecto=${p.id}`}
                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-color-primary/25 bg-color-primary/15 px-3 py-1.5 text-xs font-bold text-color-primary transition-all hover:bg-color-primary/25"
                      >
                        <Eye className="h-3.5 w-3.5" /> Ver lo que ve
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {ordenada.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-color-base-content/50">
                    Todavía no hay proyectos.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
