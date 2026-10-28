import React from 'react'
import { LAS_SIETE_COSAS_CLAVE } from '@/lib/sieteCosasClave'

/**
 * Las 7 cosas clave de todo proyecto, siempre a la vista en el Resumen (plegadas,
 * para no estorbar). Es la misma lista que el cliente vio al firmar. Si algo
 * no lo tiene, no pasa nada: el sistema le propone una respuesta y él la confirma.
 */
export function SieteCosasClave() {
  return (
    <details className="mx-4 mt-2 lg:mx-6 rounded-xl border border-[#B08D57]/40 bg-[#4C2032] px-4 py-3 text-[#F3E7DC]">
      <summary className="cursor-pointer text-sm font-extrabold">
        Las 7 cosas clave de tu proyecto
        <span className="ml-2 text-xs font-medium text-[#F3E7DC]/70">(toca para verlas)</span>
      </summary>
      <p className="mt-2 text-xs text-[#F3E7DC]/75">
        Son lo que necesitamos para estructurar tu proyecto. Si alguna no la tienes, no pasa nada: te
        proponemos una respuesta y tú solo la confirmas.
      </p>
      <ol className="mt-2 space-y-2 text-sm">
        {LAS_SIETE_COSAS_CLAVE.map((cosa, i) => (
          <li key={cosa.titulo} className="flex gap-2">
            <span className="shrink-0 font-black text-[#B08D57]">{i + 1}.</span>
            <span>
              <strong>{cosa.titulo}</strong>
              <span className="block text-xs text-[#F3E7DC]/70">{cosa.ejemplo}</span>
            </span>
          </li>
        ))}
      </ol>
    </details>
  )
}
