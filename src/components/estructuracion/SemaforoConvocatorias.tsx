'use client'

import React, { useState } from 'react'
import { AlertCircle, Clock, ExternalLink, FileText, CheckCircle2, Filter, ShieldAlert } from 'lucide-react'
import { IdiomaSeguimiento, traduccionesSeguimiento } from '@/lib/seguimientoTranslations'

export type ColorSemaforo = 'verde' | 'amarillo' | 'rojo' | 'negro'

export interface ConvocatoriaAsignada {
  id: string
  nombre: string
  entidad: string
  monto: string
  fechaCierre: string // YYYY-MM-DD
  tdr: string
  urlOficial: string
  categoria: string
  requisitosClave: string[]
}

interface SemaforoConvocatoriasProps {
  convocatorias: ConvocatoriaAsignada[]
  idioma: IdiomaSeguimiento
}

export function SemaforoConvocatorias({ convocatorias, idioma }: SemaforoConvocatoriasProps) {
  const t = traduccionesSeguimiento[idioma]
  const [filtroColor, setFiltroColor] = useState<ColorSemaforo | 'todos'>('todos')

  // Función para calcular los días faltantes y el color del semáforo
  const calcularEstadoSemaforo = (fechaCierreStr: string) => {
    const hoy = new Date()
    const cierre = new Date(fechaCierreStr)
    const diffTime = cierre.getTime() - hoy.getTime()
    const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    let color: ColorSemaforo = 'verde'
    if (diasRestantes <= 0) {
      color = 'negro'
    } else if (diasRestantes <= 8) {
      color = 'rojo'
    } else if (diasRestantes <= 20) {
      color = 'amarillo'
    } else {
      color = 'verde'
    }

    return { diasRestantes, color }
  }

  const getSemaforoBadge = (color: ColorSemaforo, dias: number) => {
    switch (color) {
      case 'verde':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-black">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            🟢 {dias} {t.diasRestantes} (Holgado)
          </span>
        )
      case 'amarillo':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
            🟡 {dias} {t.diasRestantes} (Atención)
          </span>
        )
      case 'rojo':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 border border-red-300 text-red-900 text-xs font-black">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-ping" />
            🔴 {dias} {t.diasRestantes} (¡MÁXIMA URGENCIA!)
          </span>
        )
      case 'negro':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-slate-200 text-xs font-black border border-slate-700">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
            ⚫ {t.cerradaMsg}
          </span>
        )
    }
  }

  const convocatoriasCalculadas = convocatorias.map(c => {
    const estado = calcularEstadoSemaforo(c.fechaCierre)
    return { ...c, ...estado }
  })

  const convocatoriasFiltradas = convocatoriasCalculadas.filter(c => {
    if (filtroColor === 'todos') return true
    return c.color === filtroColor
  })

  return (
    <div className="space-y-6">
      {/* Filtro por Semáforo */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-color-base-300 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-black text-color-base-content uppercase tracking-wider">
          <Filter className="h-4 w-4 text-color-primary" />
          {t.convocatoriasTitle}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setFiltroColor('todos')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filtroColor === 'todos' ? 'bg-color-primary text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t.allStatuses} ({convocatoriasCalculadas.length})
          </button>
          <button
            onClick={() => setFiltroColor('verde')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filtroColor === 'verde' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            🟢 {t.semaforoGreen.split(' ')[1]}
          </button>
          <button
            onClick={() => setFiltroColor('amarillo')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filtroColor === 'amarillo' ? 'bg-amber-500 text-white shadow-sm' : 'bg-amber-50 text-amber-900 border border-amber-200'
            }`}
          >
            🟡 {t.semaforoYellow.split(' ')[1]}
          </button>
          <button
            onClick={() => setFiltroColor('rojo')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filtroColor === 'rojo' ? 'bg-red-600 text-white shadow-sm' : 'bg-red-50 text-red-900 border border-red-200'
            }`}
          >
            🔴 {t.semaforoRed.split(' ')[1]}
          </button>
          <button
            onClick={() => setFiltroColor('negro')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filtroColor === 'negro' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-700 border border-slate-300'
            }`}
          >
            ⚫ {t.semaforoBlack.split(' ')[1]}
          </button>
        </div>
      </div>

      {/* Grid de Convocatorias */}
      <div className="grid md:grid-cols-2 gap-6">
        {convocatoriasFiltradas.map(conv => (
          <div
            key={conv.id}
            className={`p-6 rounded-3xl bg-white border transition-all duration-300 shadow-md hover:shadow-xl space-y-4 flex flex-col justify-between ${
              conv.color === 'rojo'
                ? 'border-red-300 bg-red-50/10'
                : conv.color === 'amarillo'
                ? 'border-amber-300 bg-amber-50/10'
                : conv.color === 'verde'
                ? 'border-emerald-300 bg-emerald-50/10'
                : 'border-slate-300 bg-slate-100/50 opacity-70'
            }`}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-color-primary bg-color-primary/10 px-2.5 py-0.5 rounded-full">
                  {conv.categoria}
                </span>
                {getSemaforoBadge(conv.color, conv.diasRestantes)}
              </div>

              <div>
                <h4 className="text-lg font-black text-color-base-content leading-tight">
                  {conv.nombre}
                </h4>
                <span className="text-xs font-bold text-color-base-content/60">
                  {conv.entidad}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                  {t.montoFinanciable}
                </span>
                <span className="text-base font-black text-color-primary">
                  {conv.monto}
                </span>
              </div>

              {/* TDR Section */}
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-color-base-content flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-color-primary" />
                  {t.tdrTitle}
                </h5>
                <p className="text-xs text-color-base-content/80 font-medium leading-relaxed bg-white/80 p-3 rounded-xl border border-color-base-200">
                  {conv.tdr}
                </p>
              </div>

              {/* Requisitos clave */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-color-base-content/70 uppercase tracking-wider">
                  Requisitos Verificados:
                </span>
                <ul className="space-y-1">
                  {conv.requisitosClave.map((req, i) => (
                    <li key={i} className="text-[11px] font-semibold text-color-base-content/80 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Link Oficial a las Bases */}
            <div className="pt-3 border-t border-color-base-200">
              <a
                href={conv.urlOficial}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
              >
                {t.verBasesOficiales}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
