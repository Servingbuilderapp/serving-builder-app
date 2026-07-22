'use client'

import React, { useState, useEffect } from 'react'
import {
  Check,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  MessageSquare,
  FileCheck2,
  Building2,
  Globe2,
  Coins,
  ChevronRight,
  Sliders,
  Award,
  Layers,
  FileText,
  Scale
} from 'lucide-react'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlassCard } from '@/components/ui/GlassCard'
import {
  clasificarRangoCapital,
  generarUrlWhatsappBloque2,
  PlanEstructuracionMapeado,
  RangoCapitalId
} from '@/lib/estructuracionMapping'

export interface PlanSeleccionado {
  id: RangoCapitalId | 'esencial' | 'integral' | 'internacional'
  nombre: string
  precioTotalDisplay: string
  pagoInicial: string
  detalles: string
  garantia: string
  modulosIncluidos: string[]
}

export interface DiagnosticoContextProps {
  nombre?: string
  empresa?: string
  email?: string
  whatsapp?: string
  montoObjetivo?: string
  scoreGlobal?: number
  fondosEmparejados?: string[]
}

interface PlanSelectorProps {
  diagnosticoContext?: DiagnosticoContextProps
  onSelectPlan: (plan: PlanSeleccionado) => void
}

export function PlanSelector({ diagnosticoContext, onSelectPlan }: PlanSelectorProps) {
  // Clasificación automática según rango de capital del diagnóstico
  const montoInput = diagnosticoContext?.montoObjetivo || '$80M - $180M COP'
  const planMapeadoAuto = clasificarRangoCapital(montoInput)

  const [selectedPlanId, setSelectedPlanId] = useState<RangoCapitalId>(planMapeadoAuto.id)

  // Actualizar si cambia el contexto de diagnóstico
  useEffect(() => {
    if (diagnosticoContext?.montoObjetivo) {
      const mapped = clasificarRangoCapital(diagnosticoContext.montoObjetivo)
      setSelectedPlanId(mapped.id)
    }
  }, [diagnosticoContext?.montoObjetivo])

  // Tres planes oficiales según rangos de financiación institucional
  const planInicial = clasificarRangoCapital('Hasta $30.000.000 COP')
  const planCrecimiento = clasificarRangoCapital('$30.000.000 a $73.000.000 COP')
  const planAvanzado = clasificarRangoCapital('$73.000.000 a $300.000.000 COP')

  const currentPlanObj =
    selectedPlanId === 'inicial'
      ? planInicial
      : selectedPlanId === 'avanzado'
      ? planAvanzado
      : planCrecimiento

  const whatsappUrl = generarUrlWhatsappBloque2({
    nombre: diagnosticoContext?.nombre || 'Cliente',
    empresa: diagnosticoContext?.empresa || 'Proyecto',
    email: diagnosticoContext?.email || 'contacto@proyecto.com',
    whatsapp: diagnosticoContext?.whatsapp || '',
    scorePreparacion: diagnosticoContext?.scoreGlobal || 85,
    montoObjetivo: montoInput,
    planMapeado: currentPlanObj
  })

  const convertToPlanSeleccionado = (plan: PlanEstructuracionMapeado): PlanSeleccionado => ({
    id: plan.id,
    nombre: plan.nombre,
    precioTotalDisplay: plan.honorariosEstructuracion,
    pagoInicial: plan.honorariosEstructuracion,
    detalles: plan.subtitulo,
    garantia: plan.garantiaAcompanamiento,
    modulosIncluidos: plan.incluye
  })

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Contextual & Notificación de Plan Asignado */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-color-primary/10 border border-color-primary/20 text-color-primary text-xs font-black uppercase tracking-widest">
          <Sparkles className="h-4 w-4" />
          Bloque 2: Honorarios & Selección de Planes de Estructuración
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-color-base-content uppercase italic tracking-tight">
          Asegura tus Fondos con <span className="text-gradient-magma">Estructuración Profesional</span>
        </h2>
        <p className="text-sm md:text-base text-color-base-content/80 max-w-3xl mx-auto font-medium leading-relaxed">
          Nuestros <strong className="text-color-primary">Honorarios de Estructuración</strong> están adaptados al mercado institucional y convocatorias nacionales e internacionales (<strong className="text-color-primary">$7M a $17M COP</strong>) según el rango de financiación de tu proyecto.
        </p>

        {/* Banner de Clasificación Automática */}
        <div className="inline-flex flex-col sm:flex-row items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-color-primary/15 via-emerald-500/10 to-teal-500/15 border border-color-primary/30 text-xs font-bold text-color-base-content shadow-sm">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-color-primary animate-pulse" />
            <span>Plan Asignado por Diagnóstico:</span>
          </div>
          <span className="text-emerald-800 bg-white px-3 py-1 rounded-full font-black uppercase tracking-wider border border-emerald-300">
            {currentPlanObj.nombre} ({currentPlanObj.rangoCapitalText})
          </span>
        </div>
      </div>

      {/* Selector de Planes en 3 Columnas por Rango de Financiación */}
      <div className="grid lg:grid-cols-3 gap-6 items-stretch">
        {/* PLAN INICIAL (HASTA $30M COP) */}
        <div
          onClick={() => setSelectedPlanId('inicial')}
          className={`relative rounded-3xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
            selectedPlanId === 'inicial'
              ? 'bg-white border-teal-500 shadow-2xl ring-2 ring-teal-500/40 scale-[1.02]'
              : 'bg-white/70 border-color-base-300 hover:border-teal-500/30 shadow-md'
          }`}
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                HASTA $30.000.000 COP
              </span>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  selectedPlanId === 'inicial' ? 'bg-teal-600 border-teal-600 text-white' : 'border-color-base-300'
                }`}
              >
                {selectedPlanId === 'inicial' && <Check className="h-3 w-3" />}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-color-base-content uppercase italic">
                {planInicial.nombre}
              </h3>
              <p className="text-xs text-color-base-content/70 font-semibold mt-1">
                {planInicial.subtitulo}
              </p>
            </div>

            <div className="py-2 border-y border-color-base-200">
              <span className="text-xs font-bold uppercase tracking-wider text-color-base-content/60 block">
                Honorarios de Estructuración
              </span>
              <span className="text-3xl font-black text-color-base-content">
                {planInicial.honorariosEstructuracion}
              </span>
              <p className="text-[11px] text-teal-700 font-bold mt-1">
                {planInicial.duracionEntrega}
              </p>
            </div>

            <ul className="space-y-2.5 text-xs font-medium text-color-base-content/80">
              {planInicial.incluye.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-[11px] text-teal-900 font-semibold">
              🛡️ {planInicial.garantiaAcompanamiento}
            </div>
          </div>
        </div>

        {/* PLAN CRECIMIENTO ($30M A $73M COP - HASTA $180M) - DESTACADO */}
        <div
          onClick={() => setSelectedPlanId('crecimiento')}
          className={`relative rounded-3xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
            selectedPlanId === 'crecimiento'
              ? 'bg-gradient-to-b from-white via-emerald-50/50 to-emerald-100/40 border-color-primary shadow-2xl ring-2 ring-color-primary/50 scale-[1.04] z-10'
              : 'bg-white/70 border-color-base-300 hover:border-color-primary/40 shadow-md'
          }`}
        >
          {planMapeadoAuto.id === 'crecimiento' && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-color-primary to-teal-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg whitespace-nowrap">
              ★ RECOMENDADO PARA TU PROYECTO
            </div>
          )}

          <div className="space-y-5 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-color-primary bg-color-primary/10 px-2.5 py-1 rounded-full border border-color-primary/20">
                $30M A $73M COP (STANDÁR SENA)
              </span>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  selectedPlanId === 'crecimiento' ? 'bg-color-primary border-color-primary text-white' : 'border-color-base-300'
                }`}
              >
                {selectedPlanId === 'crecimiento' && <Check className="h-3 w-3" />}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-color-base-content uppercase italic">
                {planCrecimiento.nombre}
              </h3>
              <p className="text-xs text-color-base-content/70 font-semibold mt-1">
                {planCrecimiento.subtitulo}
              </p>
            </div>

            <div className="py-2 border-y border-color-base-200">
              <span className="text-xs font-bold uppercase tracking-wider text-color-base-content/60 block">
                Honorarios de Estructuración
              </span>
              <span className="text-3xl font-black text-color-base-content">
                {planCrecimiento.honorariosEstructuracion}
              </span>
              <p className="text-[11px] text-emerald-700 font-bold mt-1">
                {planCrecimiento.duracionEntrega}
              </p>
            </div>

            <ul className="space-y-2.5 text-xs font-medium text-color-base-content/80">
              {planCrecimiento.incluye.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-color-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 font-semibold">
              🛡️ {planCrecimiento.garantiaAcompanamiento}
            </div>
          </div>
        </div>

        {/* PLAN AVANZADO ($73M A $300M+ COP O USD) */}
        <div
          onClick={() => setSelectedPlanId('avanzado')}
          className={`relative rounded-3xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
            selectedPlanId === 'avanzado'
              ? 'bg-white border-cyan-500 shadow-2xl ring-2 ring-cyan-500/40 scale-[1.02]'
              : 'bg-white/70 border-color-base-300 hover:border-cyan-500/30 shadow-md'
          }`}
        >
          {planMapeadoAuto.id === 'avanzado' && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg whitespace-nowrap">
              ★ RECOMENDADO PARA TU PROYECTO
            </div>
          )}

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-200">
                $73M A $300M+ COP / USD
              </span>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  selectedPlanId === 'avanzado' ? 'bg-cyan-600 border-cyan-600 text-white' : 'border-color-base-300'
                }`}
              >
                {selectedPlanId === 'avanzado' && <Check className="h-3 w-3" />}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-color-base-content uppercase italic">
                {planAvanzado.nombre}
              </h3>
              <p className="text-xs text-color-base-content/70 font-semibold mt-1">
                {planAvanzado.subtitulo}
              </p>
            </div>

            <div className="py-2 border-y border-color-base-200">
              <span className="text-xs font-bold uppercase tracking-wider text-color-base-content/60 block">
                Honorarios de Estructuración
              </span>
              <span className="text-3xl font-black text-color-base-content">
                {planAvanzado.honorariosEstructuracion}
              </span>
              <p className="text-[11px] text-cyan-700 font-bold mt-1">
                {planAvanzado.duracionEntrega}
              </p>
            </div>

            <ul className="space-y-2.5 text-xs font-medium text-color-base-content/80">
              {planAvanzado.incluye.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-[11px] text-cyan-950 font-semibold">
              🛡️ {planAvanzado.garantiaAcompanamiento}
            </div>
          </div>
        </div>
      </div>

      {/* Desglose Técnico Institucional por Componente (MGA/SENA, Financiero y Legal) */}
      <GlassCard className="p-6 md:p-8 bg-white/90 border border-color-primary/20 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-color-base-200 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-color-primary" />
            <h3 className="text-lg font-black text-color-base-content uppercase italic">
              Desglose Técnico de la Estructuración: {currentPlanObj.nombre}
            </h3>
          </div>
          <span className="text-xs font-bold text-color-primary bg-color-primary/10 px-3 py-1.5 rounded-full border border-color-primary/20">
            Honorarios de Estructuración: {currentPlanObj.honorariosEstructuracion}
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Componente Técnico */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center gap-2 text-color-primary font-black text-xs uppercase tracking-wider">
              <FileText className="h-4 w-4 text-color-primary" />
              1. Componente Técnico (MGA / SENA)
            </div>
            <p className="text-xs text-color-base-content/80 font-medium leading-relaxed">
              {currentPlanObj.desgloseTecnico.componenteTecnico}
            </p>
          </div>

          {/* Componente Financiero */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-700 font-black text-xs uppercase tracking-wider">
              <Coins className="h-4 w-4 text-emerald-600" />
              2. Componente Financiero
            </div>
            <p className="text-xs text-color-base-content/80 font-medium leading-relaxed">
              {currentPlanObj.desgloseTecnico.componenteFinanciero}
            </p>
          </div>

          {/* Componente Legal */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center gap-2 text-cyan-700 font-black text-xs uppercase tracking-wider">
              <Scale className="h-4 w-4 text-cyan-600" />
              3. Componente Legal
            </div>
            <p className="text-xs text-color-base-content/80 font-medium leading-relaxed">
              {currentPlanObj.desgloseTecnico.componenteLegal}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Pasarela de Conversión Comercial Directa vía WhatsApp o Contrato Digital */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-8 rounded-3xl shadow-2xl border border-color-primary/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-color-primary bg-color-primary/20 px-3 py-1 rounded-full border border-color-primary/30">
            PASARELA COMERCIAL & FORMALIZACIÓN BLOQUE 2
          </span>
          <h4 className="text-2xl font-black italic uppercase">
            Formalizar {currentPlanObj.nombre} ({currentPlanObj.honorariosEstructuracion})
          </h4>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            Contacta de inmediato a nuestro equipo técnico por WhatsApp con los datos consolidados de tu diagnóstico o procede directamente a la firma digital del contrato.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-3 shrink-0">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-color-primary text-white font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-color-primary/30 transition-all text-center"
          >
            <MessageSquare className="h-4 w-4" />
            FORMALIZAR VÍA WHATSAPP
          </a>

          <GlowButton
            onClick={() => onSelectPlan(convertToPlanSeleccionado(currentPlanObj))}
            className="py-3.5 px-6 text-xs font-black tracking-widest gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20"
          >
            <FileCheck2 className="h-4 w-4" />
            FIRMAR CONTRATO DIGITAL
          </GlowButton>
        </div>
      </div>
    </div>
  )
}


