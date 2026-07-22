'use client'

import React, { useState } from 'react'
import {
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Building2,
  Sparkles,
  ArrowRight,
  Sliders,
  Award
} from 'lucide-react'
import { calcularHonorariosEstructuracion, ResultadoHonorarios, parseMontoCOP } from '@/lib/financiero'

interface ResumenPagoEstructuracionProps {
  opcionFondo?: string
  montoSolicitadoInicial?: number | string
  onMontoChange?: (calculo: ResultadoHonorarios) => void
  onFormalizarPlan?: (calculo: ResultadoHonorarios) => void
  className?: string
}

export function ResumenPagoEstructuracion({
  opcionFondo = 'fondo_emprender',
  montoSolicitadoInicial = 80000000,
  onMontoChange,
  onFormalizarPlan,
  className = ''
}: ResumenPagoEstructuracionProps) {
  const [esFondoEmprender, setEsFondoEmprender] = useState(
    opcionFondo.toLowerCase().includes('emprender') || opcionFondo === 'fondo_emprender'
  )

  const [montoInput, setMontoInput] = useState<number>(parseMontoCOP(montoSolicitadoInicial) || 80000000)

  // Cálculo dinámico con la función de utilidad
  const calculo = calcularHonorariosEstructuracion(montoInput)

  const formatCOP = (num: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(num)
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10)
    setMontoInput(val)
    onMontoChange?.(calcularHonorariosEstructuracion(val))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseMontoCOP(e.target.value)
    setMontoInput(val)
    onMontoChange?.(calcularHonorariosEstructuracion(val))
  }

  return (
    <div className={`w-full bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 ${className}`}>
      {/* Selector de Fondo (Fondo Emprender vs Otros Fondos) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-color-primary dark:text-teal-400 bg-color-primary/10 dark:bg-teal-500/10 px-3 py-1 rounded-full border border-color-primary/20 dark:border-teal-500/30">
            LIQUIDADOR DE HONORARIOS DE ESTRUCTURACIÓN
          </span>
          <h3 className="text-xl md:text-2xl font-black uppercase italic text-slate-900 dark:text-white mt-1">
            Resumen de Honorarios de Estructuración
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Tarifario oficial de Arquitectura Digital según el capital solicitado a convocatorias públicas e internacionales.
          </p>
        </div>

        {/* Toggle Fondo Emprender */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setEsFondoEmprender(true)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              esFondoEmprender
                ? 'bg-color-primary text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Fondo Emprender SENA
          </button>
          <button
            type="button"
            onClick={() => setEsFondoEmprender(false)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              !esFondoEmprender
                ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Otros Fondos / Internacional
          </button>
        </div>
      </div>

      {/* Control interactivo de Capital Solicitado */}
      <div className="space-y-4 bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-color-primary" />
            Monto Solicitado al Fondo (COP):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={formatCOP(montoInput)}
              onChange={handleInputChange}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-black text-right w-44 focus:ring-2 focus:ring-color-primary outline-none"
            />
          </div>
        </div>

        {/* Range Slider con Tramos */}
        <input
          type="range"
          min={15000000}
          max={450000000}
          step={5000000}
          value={montoInput}
          onChange={handleSliderChange}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-color-primary"
        />

        {/* Acceso Rápido a Rangos */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Demostración de Rangos:</span>
          <button
            type="button"
            onClick={() => setMontoInput(25000000)}
            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-color-primary transition-all"
          >
            &lt; $30M (Revisión)
          </button>
          <button
            type="button"
            onClick={() => setMontoInput(40000000)}
            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-color-primary transition-all"
          >
            $30M-$49.9M (A Éxito)
          </button>
          <button
            type="button"
            onClick={() => setMontoInput(80000000)}
            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-color-primary transition-all"
          >
            $50M-$120M ($9M)
          </button>
          <button
            type="button"
            onClick={() => setMontoInput(180000000)}
            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-color-primary transition-all"
          >
            $121M-$299M ($12M)
          </button>
          <button
            type="button"
            onClick={() => setMontoInput(350000000)}
            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-color-primary transition-all"
          >
            &gt;= $300M ($17M)
          </button>
        </div>
      </div>

      {/* Card Principal de Honorarios Calculados */}
      <div className={`p-6 rounded-3xl border transition-all ${
        calculo.tipoHonorarios === 'exito'
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
          : calculo.tipoHonorarios === 'revision'
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200'
          : 'bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white border-color-primary/40 shadow-2xl'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/20 dark:bg-slate-800 border border-white/30">
                {esFondoEmprender ? 'Aplica Convocatoria Fondo Emprender' : 'Convocatoria Estándar / Internacional'}
              </span>
              {calculo.esModalidadExito && (
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500 text-white shadow-sm">
                  100% Modalidad a Éxito
                </span>
              )}
            </div>

            <h4 className="text-xl md:text-2xl font-black uppercase italic tracking-tight">
              {calculo.honorariosTexto}
            </h4>

            <p className="text-xs md:text-sm font-medium opacity-90 max-w-xl leading-relaxed">
              {calculo.descripcion}
            </p>
          </div>

          {/* Valor Destacado */}
          <div className="text-right shrink-0 bg-white/10 dark:bg-slate-800/80 p-5 rounded-2xl border border-white/20 dark:border-slate-700">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 block mb-1">
              Valor de Honorarios
            </span>
            <span className="text-2xl md:text-3xl font-black block tracking-tight">
              {calculo.valorDisplay}
            </span>
            <span className="text-[10px] font-bold text-emerald-400 mt-1 block">
              Garantía de Acompañamiento Incluida
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4 text-color-primary shrink-0" />
            <span>Sin cobros ocultos • Contratación oficial de Honorarios de Estructuración con Hábeas Data</span>
          </div>

          <button
            type="button"
            onClick={() => onFormalizarPlan?.(calculo)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-color-primary hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
          >
            Formalizar Honorarios
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
