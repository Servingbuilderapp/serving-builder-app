'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MotorEstructuracionTecnica } from '@/components/estructuracion/MotorEstructuracionTecnica'

export function MgaClientView() {
  return (
    <div className="max-w-7xl mx-auto relative z-10 space-y-8">
      {/* Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/estructuracion"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-color-base-content/60 hover:text-color-base-content transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          VOLVER A ESTRUCTURACIÓN (BLOQUE 2)
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-color-primary to-teal-500 text-white font-black text-sm">
            A
          </div>
          <span className="font-black tracking-tight text-sm uppercase italic">
            ARQUITECTURA<span className="text-color-primary">DIGITAL</span>
          </span>
        </div>
      </div>

      {/* Hero Section del Motor MGA */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-color-primary bg-color-primary/10 px-4 py-1.5 rounded-full border border-color-primary/20">
          BLOQUE 3 • MOTOR MGA & FORMULARIOS SENA
        </span>
        <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tight">
          Marco Lógico Automatizado & Fichas Presupuestales
        </h1>
        <p className="text-xs md:text-sm text-color-base-content/70 font-medium leading-relaxed">
          Generación inteligente del Árbol de Problemas, Árbol de Objetivos, Matriz de Riesgos y Cronograma de Inversión bajo la Metodología General Ajustada (MGA) exigida en Colombia por el Fondo Emprender SENA y convocatorias internacionales.
        </p>
      </div>

      {/* Componente Principal del Motor Técnico */}
      <MotorEstructuracionTecnica
        proyectoNombre="Proyecto de Innovación & Estructuración MGA"
        onAvanzarBloque4={() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/estructuracion/convocatorias'
          }
        }}
      />
    </div>
  )
}
