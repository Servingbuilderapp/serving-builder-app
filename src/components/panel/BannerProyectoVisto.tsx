import React from 'react'
import Link from 'next/link'
import type { ProyectoVisto } from '@/lib/proyectoVisto'

/**
 * Franja delgada arriba de las pantallas del cliente: dice con qué proyecto se
 * está trabajando. Cuando el equipo de Serving mira el proyecto de un cliente,
 * lo avisa ("vista del equipo, solo lectura") y ofrece volver a la ficha.
 */
export function BannerProyectoVisto({ vista }: { vista: ProyectoVisto }) {
  if (!vista.proyectoId) return null

  return (
    <div className="mx-4 mt-4 lg:mx-6 rounded-xl border border-[#B08D57]/40 bg-[#4C2032] px-4 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[#F3E7DC]">
      <span className="text-[11px] font-black uppercase tracking-wider text-[#B08D57]">Proyecto</span>
      <span className="text-sm font-bold">{vista.nombreProyecto || 'Sin nombre'}</span>
      {vista.vistaEquipo ? (
        <>
          <span className="text-xs text-[#F3E7DC]/70">
            Vista del equipo, solo lectura{vista.nombreCliente ? ` · cliente: ${vista.nombreCliente}` : ''}
          </span>
          <Link
            href={`/dashboard/proyectos/${vista.proyectoId}`}
            className="ml-auto text-xs font-bold text-[#B08D57] hover:underline"
          >
            Volver a la ficha
          </Link>
        </>
      ) : null}
    </div>
  )
}
