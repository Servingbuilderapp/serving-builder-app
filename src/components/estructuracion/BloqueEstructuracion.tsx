'use client'

import React, { useState } from 'react'
import { PlanSelector, PlanSeleccionado } from './PlanSelector'
import { ContratoDigitalModal, ContratoFirmado } from './ContratoDigitalModal'
import { DayZeroForm, DayZeroData } from './DayZeroForm'
import { EstructuracionProgress } from './EstructuracionProgress'
import { MotorEstructuracionTecnica } from './MotorEstructuracionTecnica'
import { DashboardSeguimiento } from './DashboardSeguimiento'
import { LayoutGrid, FileText, Cpu, CheckCircle2 } from 'lucide-react'

export interface BloqueEstructuracionProps {
  initialPlanSlug?: string
  initialStep?: 1 | 2 | 3 | 4 | 5
  diagnosticoContext?: any
}

export function BloqueEstructuracion({ initialPlanSlug, initialStep = 1, diagnosticoContext }: BloqueEstructuracionProps) {
  // Step 1: Seleccionar Plan (Bloque 2)
  // Step 2: Firmar Contrato Digital & Habeas Data (Bloque 2)
  // Step 3: Day Zero (Video + Doc + 22 preguntas) (Bloque 2)
  // Step 4: Motor de Estructuración Técnica (Bloque 3)
  // Step 5: Dashboard de Seguimiento & Semáforo (Bloque 4)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(initialStep)

  const [selectedPlan, setSelectedPlan] = useState<PlanSeleccionado | null>(null)
  const [contratoFirmado, setContratoFirmado] = useState<ContratoFirmado | null>(null)
  const [dayZeroData, setDayZeroData] = useState<DayZeroData | null>(null)

  const handlePlanSelect = (plan: PlanSeleccionado) => {
    setSelectedPlan(plan)
    setCurrentStep(2)
  }

  const handleContratoFirmado = (contrato: ContratoFirmado) => {
    setContratoFirmado(contrato)
    setCurrentStep(3)
  }

  const handleDayZeroCompleted = (data: DayZeroData) => {
    setDayZeroData(data)
    setCurrentStep(4)
  }

  return (
    <div id="estructuracion-flow" className="w-full py-6 space-y-6">
      {/* Navigation tabs between Block 2, Block 3 (Engine), and Block 4 (Grants) */}
      <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-100 p-1.5 rounded-2xl max-w-2xl mx-auto border border-slate-200">
        <button
          onClick={() => setCurrentStep(selectedPlan ? (dayZeroData ? 3 : 2) : 1)}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            currentStep <= 3 ? 'bg-color-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          BLOQUE 2: DAY ZERO
        </button>
        <button
          onClick={() => setCurrentStep(4)}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            currentStep === 4 ? 'bg-color-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="h-3.5 w-3.5" />
          BLOQUE 3: MOTOR TÉCNICO
        </button>
        <button
          onClick={() => setCurrentStep(5)}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            currentStep === 5 ? 'bg-color-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          BLOQUE 4: CONVOCATORIAS
        </button>
      </div>

      {currentStep === 1 && (
        <PlanSelector diagnosticoContext={diagnosticoContext} onSelectPlan={handlePlanSelect} />
      )}

      {currentStep === 2 && selectedPlan && (
        <ContratoDigitalModal
          plan={selectedPlan}
          onContratoFirmado={handleContratoFirmado}
          onBack={() => setCurrentStep(1)}
        />
      )}

      {currentStep === 3 && (
        <DayZeroForm onCompleted={handleDayZeroCompleted} />
      )}

      {currentStep === 4 && (
        <div className="space-y-6">
          {selectedPlan && <EstructuracionProgress plan={selectedPlan} />}
          <MotorEstructuracionTecnica onAvanzarBloque4={() => setCurrentStep(5)} />
        </div>
      )}

      {currentStep === 5 && (
        <DashboardSeguimiento />
      )}
    </div>
  )
}
