'use client'

import React, { useState } from 'react'
import {
  Check,
  Sparkles,
  MessageSquare,
  FileCheck2,
  Coins,
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
  MODALIDADES_ESTRUCTURACION,
  PlanEstructuracionMapeado,
  RangoCapitalId
} from '@/lib/estructuracionMapping'

export interface PlanSeleccionado {
  id: RangoCapitalId
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
  // Modalidad sugerida a partir de lo que respondió en el diagnóstico.
  const montoInput = diagnosticoContext?.montoObjetivo || ''
  const modalidadSugerida = clasificarRangoCapital(montoInput)

  // Mientras el cliente no toque nada, manda la sugerencia del diagnóstico.
  // Apenas escoge una modalidad a mano, manda su elección. Si el diagnóstico
  // cambia, se vuelve a soltar para que la sugerencia nueva tome el mando.
  const [eleccionManual, setEleccionManual] = useState<RangoCapitalId | null>(null)
  const [montoVisto, setMontoVisto] = useState(montoInput)

  if (montoVisto !== montoInput) {
    setMontoVisto(montoInput)
    setEleccionManual(null)
  }

  const selectedPlanId: RangoCapitalId = eleccionManual ?? modalidadSugerida.id
  const setSelectedPlanId = setEleccionManual

  const currentPlanObj =
    MODALIDADES_ESTRUCTURACION.find((m) => m.id === selectedPlanId) ??
    MODALIDADES_ESTRUCTURACION[0]

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
    <div className="w-full max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Encabezado */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-color-primary/10 border border-color-primary/20 text-color-primary text-xs font-black uppercase tracking-widest">
          <Sparkles className="h-4 w-4" />
          Honorarios & Modalidades de Estructuración
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-color-base-content uppercase italic tracking-tight">
          Asegura tus Fondos con <span className="text-gradient-magma">Estructuración Profesional</span>
        </h2>
        <p className="text-sm md:text-base text-color-base-content/80 max-w-3xl mx-auto font-medium leading-relaxed">
          Hay dos modalidades. No compiten entre sí: cada una está hecha para un
          tipo distinto de convocatoria. Escoge la que corresponda a la puerta a
          la que vas a tocar.
        </p>

        {/* Modalidad sugerida por el diagnóstico */}
        <div className="inline-flex flex-col sm:flex-row items-center gap-3 px-6 py-3.5 rounded-2xl bg-color-primary/10 border border-color-primary/30 text-xs font-bold text-color-base-content shadow-sm">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-color-primary" />
            <span>Modalidad sugerida por tu diagnóstico:</span>
          </div>
          <span className="text-color-primary bg-white px-3 py-1 rounded-full font-black uppercase tracking-wider border border-color-primary/30">
            {modalidadSugerida.nombre}
          </span>
        </div>
      </div>

      {/* Las dos modalidades */}
      <div className="grid md:grid-cols-2 gap-6 items-stretch">
        {MODALIDADES_ESTRUCTURACION.map((plan) => {
          const activa = selectedPlanId === plan.id
          const sugerida = modalidadSugerida.id === plan.id

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`relative rounded-3xl p-7 transition-all duration-300 cursor-pointer flex flex-col justify-between border ${
                activa
                  ? 'bg-white border-color-primary shadow-2xl ring-2 ring-color-primary/40 scale-[1.02]'
                  : 'bg-white/70 border-color-base-300 hover:border-color-primary/40 shadow-md'
              }`}
            >
              {sugerida && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-color-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                  ★ Sugerida para tu proyecto
                </div>
              )}

              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-color-primary bg-color-primary/10 px-2.5 py-1 rounded-full border border-color-primary/20">
                    {plan.rangoCapitalText}
                  </span>
                  <div
                    className={`w-5 h-5 shrink-0 rounded-full border flex items-center justify-center ${
                      activa
                        ? 'bg-color-primary border-color-primary text-white'
                        : 'border-color-base-300'
                    }`}
                  >
                    {activa && <Check className="h-3 w-3" />}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-color-base-content uppercase italic">
                    {plan.nombre}
                  </h3>
                  <p className="text-xs text-color-base-content/70 font-semibold mt-1.5 leading-relaxed">
                    {plan.subtitulo}
                  </p>
                </div>

                <div className="py-3 border-y border-color-base-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-color-base-content/60 block">
                    Honorarios de Estructuración
                  </span>
                  <span className="text-3xl font-black text-color-base-content">
                    {plan.honorariosEstructuracion}
                  </span>
                  <p className="text-[11px] text-color-primary font-bold mt-1">
                    {plan.duracionEntrega}
                  </p>
                </div>

                <ul className="space-y-2.5 text-xs font-medium text-color-base-content/80">
                  {plan.incluye.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-color-accent-pink shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="p-3 rounded-xl bg-color-base-100 border border-color-base-300 text-[11px] text-color-base-content font-semibold">
                  🛡️ {plan.garantiaAcompanamiento}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desglose técnico de la modalidad escogida */}
      <GlassCard className="p-6 md:p-8 bg-white/90 border border-color-primary/20 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-color-base-200 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-color-primary" />
            <h3 className="text-lg font-black text-color-base-content uppercase italic">
              Qué incluye: {currentPlanObj.nombre}
            </h3>
          </div>
          <span className="text-xs font-bold text-color-primary bg-color-primary/10 px-3 py-1.5 rounded-full border border-color-primary/20">
            Honorarios de Estructuración: {currentPlanObj.honorariosEstructuracion}
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-color-base-100 border border-color-base-300 space-y-2.5">
            <div className="flex items-center gap-2 text-color-primary font-black text-xs uppercase tracking-wider">
              <FileText className="h-4 w-4" />
              Componente Técnico
            </div>
            <p className="text-xs text-color-base-content/80 font-medium leading-relaxed">
              {currentPlanObj.desgloseTecnico.componenteTecnico}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-color-base-100 border border-color-base-300 space-y-2.5">
            <div className="flex items-center gap-2 text-color-primary font-black text-xs uppercase tracking-wider">
              <Coins className="h-4 w-4" />
              Componente Financiero
            </div>
            <p className="text-xs text-color-base-content/80 font-medium leading-relaxed">
              {currentPlanObj.desgloseTecnico.componenteFinanciero}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-color-base-100 border border-color-base-300 space-y-2.5">
            <div className="flex items-center gap-2 text-color-primary font-black text-xs uppercase tracking-wider">
              <Scale className="h-4 w-4" />
              Componente Legal
            </div>
            <p className="text-xs text-color-base-content/80 font-medium leading-relaxed">
              {currentPlanObj.desgloseTecnico.componenteLegal}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Formalización */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-[#0B2A4A] text-white p-8 rounded-3xl shadow-2xl border border-color-primary/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-white bg-color-primary px-3 py-1 rounded-full">
            Formalización
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
