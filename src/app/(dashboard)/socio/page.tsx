import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { obtenerSocioDeUsuario } from '@/lib/guardiaSocio'

export const dynamic = 'force-dynamic'

/**
 * Panel simplificado del socio de marca blanca.
 *
 * A diferencia de /admin/marca-blanca (que ve el equipo de Serving y
 * junta a TODOS los socios), esta pantalla solo muestra los proyectos
 * del socio que inició sesión — nunca los de Serving ni los de otro
 * socio. La separación se hace filtrando siempre por socio_id, nunca
 * mostrando la tabla completa.
 *
 * A propósito es de solo lectura y sin el detalle técnico de cada
 * proyecto (nada de árbol, objetivos, presupuesto): el socio ve
 * resultados (cuántos proyectos, en qué etapa, si hay atraso), nunca
 * la lógica interna de cómo trabaja el motor.
 */

type Etapa = 'Pendiente de pago' | 'En estructuración' | 'Buscando convocatorias'

function calcularEtapa(estadoActual: string | null, listoParaEncaje: boolean | null): Etapa {
  if (estadoActual !== 'pagado') return 'Pendiente de pago'
  if (listoParaEncaje) return 'Buscando convocatorias'
  return 'En estructuración'
}

export default async function SocioPage() {
  const infoSocio = await obtenerSocioDeUsuario()

  if (!infoSocio.esSocio) {
    redirect('/dashboard')
  }

  const supabase = await createClient()
  const { data: proyectos } = await supabase
    .from('proyectos_clientes_serving')
    .select('id, nombre_cliente, nombre_iniciativa, estado_actual, listo_para_encaje, fecha_limite_entrega, created_at')
    .eq('socio_id', infoSocio.socioId)
    .order('created_at', { ascending: false })

  const ahora = new Date()
  const lista = proyectos || []

  const activos = lista.filter((p) => p.estado_actual === 'pagado').length
  const atrasados = lista.filter((p) => {
    const fechaLimite = p.fecha_limite_entrega ? new Date(p.fecha_limite_entrega) : null
    return !!fechaLimite && !p.listo_para_encaje && fechaLimite < ahora
  }).length

  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-color-base-content">Panel de {infoSocio.nombreSocio}</h1>
        <p className="text-color-base-content/60 text-sm mt-1">
          Estado de tus proyectos. Para cualquier pregunta sobre un proyecto puntual, escríbenos por WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-color-base-content/10 p-5">
          <div className="text-3xl font-bold text-color-base-content">{lista.length}</div>
          <div className="text-sm text-color-base-content/60 mt-1">Proyectos totales</div>
        </div>
        <div className="rounded-2xl border border-color-base-content/10 p-5">
          <div className="text-3xl font-bold text-color-primary">{activos}</div>
          <div className="text-sm text-color-base-content/60 mt-1">Activos (pagados)</div>
        </div>
        <div className="rounded-2xl border border-color-base-content/10 p-5">
          <div className={`text-3xl font-bold ${atrasados > 0 ? 'text-red-600' : 'text-color-base-content'}`}>
            {atrasados}
          </div>
          <div className="text-sm text-color-base-content/60 mt-1">Con alerta de atraso</div>
        </div>
      </div>

      {lista.length === 0 ? (
        <div className="rounded-2xl border border-color-base-content/10 p-8 text-center text-sm text-color-base-content/60">
          Todavía no tienes proyectos asignados.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-color-base-content/10">
          <table className="w-full text-sm">
            <thead className="bg-color-base-content/5">
              <tr className="text-left">
                <th className="p-3 font-black text-xs uppercase tracking-wider">Cliente</th>
                <th className="p-3 font-black text-xs uppercase tracking-wider">Proyecto</th>
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
                    <td className="p-3">{p.nombre_iniciativa}</td>
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
