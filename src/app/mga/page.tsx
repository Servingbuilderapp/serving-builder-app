import React from 'react'
import { MgaClientView } from '@/components/estructuracion/MgaClientView'

export const metadata = {
  title: 'Motor MGA & Formularios SENA | Arquitectura Digital',
  description: 'Módulo de Marco Lógico Automatizado, Árbol de Objetivos, Presupuesto MGA y Formularios SENA para convocatorias de financiación en Colombia.'
}

export default function MgaPage() {
  return (
    <main className="min-h-screen bg-color-base-100 text-color-base-content py-12 px-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-color-primary/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-teal-500/10 rounded-full blur-[140px]" />
      </div>

      <MgaClientView />
    </main>
  )
}
