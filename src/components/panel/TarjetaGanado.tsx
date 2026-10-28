import React from 'react'
import type { ProyectoVisto } from '@/lib/proyectoVisto'

/**
 * "Has ganado $X": el total de dinero que este proyecto ha ganado en convocatorias
 * adjudicadas, con la lista de cuáles. Solo aparece cuando hay al menos una
 * adjudicada. Si el equipo todavía no ha escrito el monto, lo dice con claridad.
 */

type Fila = { convocatoria_nombre: string | null; monto_adjudicado_cop: number | null }

function pesos(valor: number): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor)
}

export async function TarjetaGanado({ vista }: { vista: ProyectoVisto }) {
  if (!vista.proyectoId) return null

  const { data, error } = await vista.db
    .from('postulaciones')
    .select('convocatoria_nombre, monto_adjudicado_cop')
    .eq('proyecto_id', vista.proyectoId)
    .eq('estado', 'Adjudicada')

  // Si la columna del monto todavía no existe, no se muestra la tarjeta (no se rompe nada).
  if (error || !data || data.length === 0) return null

  const filas = data as Fila[]
  const total = filas.reduce((suma, f) => suma + (f.monto_adjudicado_cop || 0), 0)
  const sinMonto = filas.filter((f) => !f.monto_adjudicado_cop).length

  return (
    <div className="mx-4 mt-2 lg:mx-6 rounded-xl border border-[#C9A46B] bg-[#4C2032] px-4 py-3 text-[#F3E7DC]">
      <div className="text-[11px] font-black uppercase tracking-wider text-[#B08D57]">
        {vista.vistaEquipo ? 'Lo que ha ganado este proyecto' : 'Lo que has ganado'}
      </div>
      <div className="text-2xl font-extrabold text-[#C9A46B]">{total > 0 ? pesos(total) : 'Monto por confirmar'}</div>
      <ul className="mt-2 space-y-1 text-xs text-[#F3E7DC]/80">
        {filas.map((f, i) => (
          <li key={`${f.convocatoria_nombre}-${i}`}>
            <strong>{f.convocatoria_nombre || 'Convocatoria'}</strong> ·{' '}
            {f.monto_adjudicado_cop ? pesos(f.monto_adjudicado_cop) : 'monto por confirmar'}
          </li>
        ))}
      </ul>
      {sinMonto > 0 && total > 0 ? (
        <p className="mt-2 text-[11px] text-[#F3E7DC]/60">
          Hay {sinMonto} convocatoria(s) adjudicada(s) cuyo monto aún no está confirmado; el total puede subir.
        </p>
      ) : null}
    </div>
  )
}
