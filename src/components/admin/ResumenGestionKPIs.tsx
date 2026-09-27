import React from 'react'
import { FileSearch, Users, ShieldAlert, UserMinus, Send, Wrench } from 'lucide-react'

interface ResumenGestionKPIsProps {
  diagnosticosCount: number
  clientesTotal: number
  clientesPagados: number
  proyectosConPostulacion: number
  quejasAbiertas: number
  tasaDesercion: number
  clientesEsteMes: number
  clientesMesAnterior: number
}

/**
 * Resumen ejecutivo de "Gestión del Portal": indicadores reales para decidir
 * (no solo para mirar) — de dónde vienen las cifras:
 *  - diagnosticosCount        -> tabla `diagnosticos` (leads del diagnóstico gratuito)
 *  - clientesTotal / pagados  -> tabla `proyectos_clientes_serving` (estado_actual)
 *  - proyectosConPostulacion  -> proyectos con al menos una fila en `postulaciones`
 *  - quejasAbiertas           -> tabla `quejas_fallos_ia` (estado != 'Resuelto')
 *  - tasaDesercion            -> proyectos con estado_comercial en ('Descartado','No Asistió')
 *                                 sobre el total que ya tiene estado_comercial asignado
 *  - clientesEsteMes / mesAnterior -> `proyectos_clientes_serving.created_at`
 */
export function ResumenGestionKPIs({
  diagnosticosCount,
  clientesTotal,
  clientesPagados,
  proyectosConPostulacion,
  quejasAbiertas,
  tasaDesercion,
  clientesEsteMes,
  clientesMesAnterior,
}: ResumenGestionKPIsProps) {
  const deltaClientes = clientesEsteMes - clientesMesAnterior
  const tendenciaTexto =
    clientesMesAnterior === 0
      ? `${clientesEsteMes} este mes`
      : deltaClientes >= 0
      ? `↑ ${deltaClientes} más que el mes anterior`
      : `↓ ${Math.abs(deltaClientes)} menos que el mes anterior`

  const etapas = [
    { nombre: 'Diagnóstico gratis', valor: diagnosticosCount },
    { nombre: 'Contratado', valor: clientesTotal },
    { nombre: 'Pago confirmado', valor: clientesPagados },
    { nombre: 'Con postulación', valor: proyectosConPostulacion },
  ]
  const maxEtapa = Math.max(1, ...etapas.map((e) => e.valor))

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h2 className="text-xl font-black text-[#F3E7DC] tracking-tight">
          Indicadores de gestión
        </h2>
        <span className="text-[11px] text-[#F3E7DC]/45 uppercase tracking-widest font-bold">
          datos en vivo · Supabase
        </span>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KpiTile
          icon={FileSearch}
          label="Diagnósticos"
          valor={diagnosticosCount}
          iconColor="#B08D57"
        />
        <KpiTile
          icon={Users}
          label="Clientes nuevos"
          valor={clientesEsteMes}
          nota={tendenciaTexto}
          notaColor={deltaClientes >= 0 ? '#9BB18D' : '#E0917E'}
          iconColor="#B08D57"
        />
        <KpiTile
          icon={UserMinus}
          label="Deserción"
          valor={`${tasaDesercion}%`}
          nota="de quienes ya tuvieron seguimiento comercial"
          iconColor={tasaDesercion > 20 ? '#E0917E' : '#E0B868'}
        />
        <KpiTile
          icon={ShieldAlert}
          label="Quejas abiertas"
          valor={quejasAbiertas}
          iconColor={quejasAbiertas > 0 ? '#E0917E' : '#9BB18D'}
        />
        <KpiTile
          icon={Send}
          label="Con postulación"
          valor={proyectosConPostulacion}
          iconColor="#B08D57"
        />
      </div>

      {/* Embudo real */}
      <div className="bg-[#3B1727]/80 border border-white/10 rounded-2xl p-6">
        <h3 className="text-sm font-black text-[#F3E7DC] uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Wrench className="w-4 h-4 text-[#B08D57]" /> Embudo del cliente
        </h3>
        <div className="space-y-3.5">
          {etapas.map((etapa) => {
            const pct = Math.max(4, Math.round((etapa.valor / maxEtapa) * 100))
            return (
              <div key={etapa.nombre} className="flex items-center gap-3">
                <span className="w-40 shrink-0 text-xs text-[#F3E7DC]/60 font-semibold">
                  {etapa.nombre}
                </span>
                <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#C9A46B] to-[#B08D57] transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs font-black text-[#F3E7DC] tabular-nums">
                  {etapa.valor}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function KpiTile({
  icon: Icon,
  label,
  valor,
  nota,
  notaColor,
  iconColor,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  label: string
  valor: number | string
  nota?: string
  notaColor?: string
  iconColor: string
}) {
  return (
    <div className="bg-[#3B1727]/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" style={{ color: iconColor }} />
        <span className="text-[10px] font-black text-[#F3E7DC]/45 uppercase tracking-widest">
          {label}
        </span>
      </div>
      <span className="text-2xl font-black text-[#F3E7DC] tabular-nums">{valor}</span>
      {nota && (
        <span className="text-[11px] font-semibold" style={{ color: notaColor || 'rgba(243,231,220,0.55)' }}>
          {nota}
        </span>
      )}
    </div>
  )
}
