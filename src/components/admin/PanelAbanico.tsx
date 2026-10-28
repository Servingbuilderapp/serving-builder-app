import React from 'react'
import Link from 'next/link'

/**
 * Aviso para el equipo: el Abanico es automático. No hay botón que pulsar.
 * El cliente paga con Bold, la plataforma arma sola las convocatorias y el cliente escoge.
 * Aquí solo se enseña cómo ver lo que el cliente ve.
 */
export function PanelAbanico({ proyectoId }: { proyectoId: string }) {
  return (
    <div className="rounded-2xl border border-[#C9A46B] bg-[#3B1727] p-5">
      <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#C9A46B]">Abanico</h2>
      <p className="mt-1.5 text-[13px] leading-relaxed text-[#F3E7DC]/70">
        El abanico es automático: el cliente paga con Bold, la plataforma arma sola las convocatorias que mejor le
        quedan y el cliente escoge a cuáles quiere entrar. Nadie del equipo tiene que pulsar nada.
      </p>
      <Link
        href={`/mi-abanico?proyecto=${proyectoId}`}
        className="mt-3 inline-flex text-[13px] font-bold text-[#C9A46B] underline"
      >
        Ver el abanico como lo ve el cliente
      </Link>
    </div>
  )
}
