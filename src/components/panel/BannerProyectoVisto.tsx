import React from 'react'
import Link from 'next/link'
import type { ProyectoVisto } from '@/lib/proyectoVisto'
import { calcularSiguientePaso } from '@/lib/siguientePaso'

/**
 * Arriba de las pantallas del cliente: dice con qué proyecto se está trabajando
 * y, debajo, el SIGUIENTE PASO ("¿qué hago ahora?"). Cuando el equipo de Serving
 * mira el proyecto de un cliente, lo avisa ("vista del equipo, solo lectura") y
 * ofrece volver a la ficha.
 */
export async function BannerProyectoVisto({ vista }: { vista: ProyectoVisto }) {
  if (!vista.proyectoId) return null

  const paso = await calcularSiguientePaso(vista)
  // Si el equipo está mirando al cliente, los botones llevan al mismo proyecto.
  const destino = (href: string) => (vista.vistaEquipo ? `${href}?proyecto=${vista.proyectoId}` : href)

  return (
    <div className="mx-4 mt-4 lg:mx-6 space-y-2">
      <div className="rounded-xl border border-[#B08D57]/40 bg-[#4C2032] px-4 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[#F3E7DC]">
        <span className="text-[11px] font-black uppercase tracking-wider text-[#B08D57]">Proyecto</span>
        <span className="text-sm font-bold">{vista.nombreProyecto || 'Sin nombre'}</span>
        {vista.vistaEquipo ? (
          <>
            <span className="text-xs text-[#F3E7DC]/70">
              Vista del equipo, solo lectura{vista.nombreCliente ? ` · cliente: ${vista.nombreCliente}` : ''}
            </span>
            <Link
              href={`/admin/proyectos/${vista.proyectoId}`}
              className="ml-auto text-xs font-bold text-[#B08D57] hover:underline"
            >
              Volver a la ficha
            </Link>
          </>
        ) : null}
      </div>

      {paso ? (
        <div
          className={`rounded-xl border bg-[#4C2032] px-4 py-3 text-[#F3E7DC] flex flex-wrap items-center gap-x-4 gap-y-2 ${
            paso.accion ? 'border-[#C9A46B]' : 'border-[#B08D57]/40'
          }`}
        >
          <div className="min-w-[220px] flex-1">
            <div className="text-[11px] font-black uppercase tracking-wider text-[#B08D57]">
              {vista.vistaEquipo ? 'Siguiente paso del cliente' : paso.accion ? 'Tu turno' : 'Siguiente paso'}
            </div>
            <div className="text-sm font-extrabold">{paso.titulo}</div>
            <p className="text-xs text-[#F3E7DC]/75 mt-0.5">{paso.texto}</p>
          </div>
          {paso.accion ? (
            <Link
              href={destino(paso.accion.href)}
              className="shrink-0 px-4 py-2 rounded-full bg-gradient-to-b from-[#C9A46B] to-[#B08D57] text-[#3A1420] text-xs font-bold hover:brightness-110"
            >
              {paso.accion.texto}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
