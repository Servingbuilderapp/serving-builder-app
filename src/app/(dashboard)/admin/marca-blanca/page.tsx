import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { CrearSocioForm } from '@/components/admin/CrearSocioForm'
import { AsignarSocioSelect } from '@/components/admin/AsignarSocioSelect'
import { CrearUsuarioSocioForm } from '@/components/admin/CrearUsuarioSocioForm'

export const dynamic = 'force-dynamic'

/**
 * Vista de canal de marca blanca — la ve el equipo de Serving, y aquí sí
 * se ven TODOS los socios juntos (a diferencia de /socio, que cada socio
 * ve solo lo suyo).
 *
 * Desde acá el equipo:
 *   1. Crea los socios reales (nombre, marca, contacto).
 *   2. Asigna cada proyecto marcado como 'marca_blanca' a un socio
 *      concreto — eso es lo que separa de verdad los datos de un socio
 *      de los de otro (la etiqueta canal_origen solo dice "es de marca
 *      blanca", no de cuál).
 *
 * Sigue sin acciones sobre el proyecto en sí (estructuración, pagos) —
 * para eso está /admin/proyectos.
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
      'id, nombre_cliente, nombre_iniciativa, plan_pago, monto_solicitado_cop, monto_solicitado_usd, estado_actual, listo_para_encaje, fecha_limite_entrega, socio_id, created_at'
    )
    .eq('canal_origen', 'marca_blanca')
    .order('created_at', { ascending: false })

  // Los socios se leen con la llave de servicio (no con la del usuario que
  // entró) porque la tabla socios solo la puede tocar el servidor — igual
  // que el resto de tablas sensibles del proyecto.
  const { data: socios } = await supabaseAdmin
    .from('socios')
    .select('id, nombre, activo')
    .order('nombre', { ascending: true })

  const listaSocios = socios || []

  const ahora = new Date()
  const lista = proyectos || []

  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-color-base-content">Marca blanca</h1>
        <p className="text-color-base-content/60 text-sm mt-1">
          Proyectos marcados como canal de marca blanca. Para actuar sobre un
          proyecto (estructuración, pagos), entra a{' '}
          <Link href="/admin/proyectos" className="text-color-primary hover:underline">
            Proyectos de clientes
          </Link>
          .
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-black uppercase tracking-wider text-color-base-content/50">Socios</h2>
        {listaSocios.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {listaSocios.map((s) => (
              <span
                key={s.id}
                className="px-3 py-1.5 rounded-full bg-color-base-content/5 border border-color-base-content/10 text-sm font-semibold"
              >
                {s.nombre}
                {!s.activo ? <span className="text-color-base-content/40 font-normal"> (inactivo)</span> : null}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-color-base-content/60">Todavía no has creado ningún socio.</p>
        )}
        <div className="flex flex-wrap gap-2">
          <CrearSocioForm />
          <CrearUsuarioSocioForm socios={listaSocios.filter((s) => s.activo)} />
        </div>
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
                <th className="p-3 font-black text-xs uppercase tracking-wider">Socio</th>
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
                    <td className="p-3">
                      <AsignarSocioSelect proyectoId={String(p.id)} socioIdActual={p.socio_id} socios={listaSocios} />
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
