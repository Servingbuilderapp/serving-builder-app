'use client'

import React from 'react'
import { Printer } from 'lucide-react'

/**
 * Imprime o guarda el Documento final como PDF. Ese clic cuenta como que la
 * persona ya "entregó" su documento: en el servidor le suma un mes más de
 * acceso, una sola vez (si ya lo había hecho antes, no pasa nada).
 */
export function BotonImprimir() {
  const manejarClic = () => {
    fetch('/api/empresarial/membresia/documento-entregado', { method: 'POST' }).catch(() => {})
    window.print()
  }

  return (
    <button
      type="button"
      onClick={manejarClic}
      className="h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-ca-oro-claro to-ca-oro text-ca-vino-hondo font-extrabold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200"
    >
      <Printer className="h-4 w-4" /> Imprimir o guardar como PDF
    </button>
  )
}
