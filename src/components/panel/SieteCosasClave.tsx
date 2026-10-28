import React from 'react'
import type { ProyectoVisto } from '@/lib/proyectoVisto'
import { estadoSieteCosas, type EstadoCosaClave } from '@/lib/sieteCosasClave'

/**
 * Las 7 cosas clave de todo proyecto, en el Resumen (plegadas, para no estorbar),
 * con su estado real: ✔ ya la tenemos · ✎ por reforzar · ✖ falta · ○ todavía no
 * llega. Es la misma lista que el cliente vio al firmar. Si algo no lo tiene, no
 * pasa nada: el sistema le propone una respuesta y él la confirma.
 */

const MARCA: Record<EstadoCosaClave, { simbolo: string; etiqueta: string }> = {
  lista: { simbolo: '✔', etiqueta: 'Lista' },
  reforzar: { simbolo: '✎', etiqueta: 'Por reforzar' },
  falta: { simbolo: '✖', etiqueta: 'Falta' },
  pendiente: { simbolo: '○', etiqueta: 'Pendiente' },
}

export async function SieteCosasClave({ vista }: { vista: ProyectoVisto }) {
  const cosas = await estadoSieteCosas(vista)
  if (!cosas) return null

  const listas = cosas.filter((c) => c.estado === 'lista').length

  return (
    <details className="mx-4 mt-2 lg:mx-6 rounded-xl border border-[#B08D57]/40 bg-[#4C2032] px-4 py-3 text-[#F3E7DC]">
      <summary className="cursor-pointer text-sm font-extrabold">
        Las 7 cosas clave de tu proyecto
        <span className="ml-2 text-xs font-medium text-[#F3E7DC]/70">
          {listas} de 7 listas · toca para verlas
        </span>
      </summary>
      <p className="mt-2 text-xs text-[#F3E7DC]/75">
        Son lo que necesitamos para estructurar tu proyecto. Si alguna no la tienes, no pasa nada: te
        proponemos una respuesta y tú solo la confirmas.
      </p>
      <ol className="mt-3 space-y-3 text-sm">
        {cosas.map((cosa, i) => {
          const marca = MARCA[cosa.estado]
          return (
            <li key={cosa.titulo} className="flex gap-3">
              <span
                className="mt-0.5 w-6 shrink-0 text-center text-base font-black text-[#C9A46B]"
                title={marca.etiqueta}
                aria-label={marca.etiqueta}
              >
                {marca.simbolo}
              </span>
              <span>
                <strong>
                  {i + 1}. {cosa.titulo}
                </strong>
                <span className="ml-2 text-[11px] font-black uppercase tracking-wider text-[#B08D57]">
                  {marca.etiqueta}
                </span>
                <span className="block text-xs text-[#F3E7DC]/75">{cosa.detalle}</span>
                {cosa.estado === 'lista' ? null : (
                  <span className="block text-xs text-[#F3E7DC]/55">{cosa.ejemplo}</span>
                )}
              </span>
            </li>
          )
        })}
      </ol>
    </details>
  )
}
