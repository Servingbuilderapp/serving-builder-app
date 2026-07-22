'use client'

import React, { useState } from 'react'
import { Globe, Layers, Lock, FileCheck2, Sparkles } from 'lucide-react'
import { IdiomaSeguimiento, traduccionesSeguimiento } from '@/lib/seguimientoTranslations'
import { ProgresoMetodologia32Pasos } from './ProgresoMetodologia32Pasos'
import { ModuloAutomatizacionMGA } from './ModuloAutomatizacionMGA'
import { VeaDataRepository } from './VeaDataRepository'
import { GeneradorReporteMaestro } from './GeneradorReporteMaestro'

interface MotorEstructuracionTecnicaProps {
  proyectoNombre?: string
  onAvanzarBloque4: () => void
}

export function MotorEstructuracionTecnica({
  proyectoNombre = 'Proyecto EcoInnovación Digital',
  onAvanzarBloque4
}: MotorEstructuracionTecnicaProps) {
  const [idioma, setIdioma] = useState<IdiomaSeguimiento>('es')
  const t = traduccionesSeguimiento[idioma]

  return (
    <div className="w-full max-w-5xl mx-auto my-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Header con Selector de Idioma */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-color-base-300 shadow-sm">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-color-primary bg-color-primary/10 px-3 py-1 rounded-full border border-color-primary/20">
            BLOQUE 3: MOTOR DE ESTRUCTURACIÓN TÉCNICA
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-color-base-content uppercase italic mt-1">
            {t.bloque3Title}
          </h2>
          <p className="text-xs text-color-base-content/70 font-semibold mt-0.5">
            Proyecto: <strong className="text-color-primary">{proyectoNombre}</strong>
          </p>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start sm:self-auto">
          <Globe className="h-4 w-4 text-slate-500 ml-2 mr-1" />
          <button
            onClick={() => setIdioma('es')}
            className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
              idioma === 'es' ? 'bg-color-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ES
          </button>
          <button
            onClick={() => setIdioma('en')}
            className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
              idioma === 'en' ? 'bg-color-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setIdioma('pt')}
            className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
              idioma === 'pt' ? 'bg-color-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            PT
          </button>
        </div>
      </div>

      {/* 1. BARRA DE PROGRESO EN TIEMPO REAL DE LOS 32 PASOS */}
      <ProgresoMetodologia32Pasos pasosCompletadosCount={18} idioma={idioma} />

      {/* 2. MÓDULO DE AUTOMATIZACIÓN MGA & MARCO LÓGICO */}
      <ModuloAutomatizacionMGA idioma={idioma} />

      {/* 3. REPOSITORIO SEGURO VEA DATA */}
      <VeaDataRepository idioma={idioma} />

      {/* 4. GENERADOR DE REPORTE MAESTRO Y PASE AL BLOQUE 4 */}
      <GeneradorReporteMaestro idioma={idioma} onAvanzarBloque4={onAvanzarBloque4} />
    </div>
  )
}
