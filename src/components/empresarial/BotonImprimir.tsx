'use client'

import React from 'react'
import { Printer } from 'lucide-react'

export function BotonImprimir() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#C9A46B] to-[#B08D57] text-[#3A1420] font-extrabold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200"
    >
      <Printer className="h-4 w-4" /> Imprimir o guardar como PDF
    </button>
  )
}
