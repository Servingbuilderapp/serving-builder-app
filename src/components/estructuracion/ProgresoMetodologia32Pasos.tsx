'use client'

import React, { useState } from 'react'
import { CheckCircle2, Circle, Clock, ChevronDown, ChevronUp, Layers, Sparkles } from 'lucide-react'
import { IdiomaSeguimiento, traduccionesSeguimiento } from '@/lib/seguimientoTranslations'

interface PasoMetodologia {
  num: number
  faseNum: 1 | 2 | 3 | 4 | 5
  titulo: string
  completado: boolean
  enProceso?: boolean
}

interface ProgresoMetodologia32PasosProps {
  pasosCompletadosCount: number // Ej. 14 de 32
  idioma: IdiomaSeguimiento
}

export function ProgresoMetodologia32Pasos({ pasosCompletadosCount, idioma }: ProgresoMetodologia32PasosProps) {
  const t = traduccionesSeguimiento[idioma]
  const [faseAbierta, setFaseAbierta] = useState<number | null>(2) // Fase 2 abierta por defecto

  // Lista detallada de los 32 Pasos de Estructuración Técnica de Arquitectura Digital
  const LISTA_32_PASOS: PasoMetodologia[] = [
    // Fase 1: Diagnóstico & Antecedentes (Pasos 1-6)
    { num: 1, faseNum: 1, titulo: 'Validación de Day Zero y Requisitos Iniciales', completado: true },
    { num: 2, faseNum: 1, titulo: 'Estudio de Antecedentes y Contexto Territorial', completado: true },
    { num: 3, faseNum: 1, titulo: 'Análisis de la Población Beneficiaria y Caracterización', completado: true },
    { num: 4, faseNum: 1, titulo: 'Formulación del Árbol de Problemas (Problema Central y Causas)', completado: true },
    { num: 5, faseNum: 1, titulo: 'Formulación del Árbol de Objetivos (Objetivo General y Específicos)', completado: true },
    { num: 6, faseNum: 1, titulo: 'Análisis de Involucrados y Aliados Estratégicos', completado: true },

    // Fase 2: Marco Lógico & Problematización (Pasos 7-13)
    { num: 7, faseNum: 2, titulo: 'Construcción de la Matriz de Marco Lógico (MML)', completado: true },
    { num: 8, faseNum: 2, titulo: 'Definición de Indicadores de Resultado e Impacto', completado: true },
    { num: 9, faseNum: 2, titulo: 'Definición de Medios de Verificación y Fuentes de Información', completado: true },
    { num: 10, faseNum: 2, titulo: 'Identificación de Supuestos y Gestión de Riesgos', completado: true },
    { num: 11, faseNum: 2, titulo: 'Estructuración de Alternativas de Solución', completado: true },
    { num: 12, faseNum: 2, titulo: 'Selección de la Alternativa Óptima de Inversión', completado: false, enProceso: true },
    { num: 13, faseNum: 2, titulo: 'Formulación del Componente de Innovación y Diferenciación', completado: false },

    // Fase 3: Estudio Técnico & Operativo (Pasos 14-20)
    { num: 14, faseNum: 3, titulo: 'Localización Física y Cobertura Geográfica del Proyecto', completado: false },
    { num: 15, faseNum: 3, titulo: 'Ingeniería del Proyecto y Especificaciones Técnicas', completado: false },
    { num: 16, faseNum: 3, titulo: 'Plan de Operaciones y Cronograma de Actividades (Gantt)', completado: false },
    { num: 17, faseNum: 3, titulo: 'Definición de Insumos, Maquinaria y Talento Humano Requerido', completado: false },
    { num: 18, faseNum: 3, titulo: 'Estudio de Licencias, Permisos y Normatividad Vigente', completado: false },
    { num: 19, faseNum: 3, titulo: 'Plan de Gestión Ambiental y Sostenibilidad', completado: false },
    { num: 20, faseNum: 3, titulo: 'Plan de Comercialización y Estrategia de Mercado', completado: false },

    // Fase 4: Análisis Financiero & MGA (Pasos 21-27)
    { num: 21, faseNum: 4, titulo: 'Presupuesto Detallado de Inversión Inicial (CAPEX)', completado: false },
    { num: 22, faseNum: 4, titulo: 'Proyección de Costos Operativos y Mantenimiento (OPEX)', completado: false },
    { num: 23, faseNum: 4, titulo: 'Modelación de Ingresos y Flujo de Caja Proyectado a 5 Años', completado: false },
    { num: 24, faseNum: 4, titulo: 'Cálculo de Indicadores Financieros (VPN, TIR, R B/C)', completado: false },
    { num: 25, faseNum: 4, titulo: 'Matriz de Cofinanciación y Aportes de Contrapartida', completado: false },
    { num: 26, faseNum: 4, titulo: 'Diligenciamiento de la Metodología General Ajustada (MGA)', completado: false },
    { num: 27, faseNum: 4, titulo: 'Análisis de Sensibilidad y Evaluación del Punto de Equilibrio', completado: false },

    // Fase 5: Documento Final & Radicación (Pasos 28-32)
    { num: 28, faseNum: 5, titulo: 'Consolidación de Anexos Técnicos y Documentos Soporte', completado: false },
    { num: 29, faseNum: 5, titulo: 'Revisión y Control de Calidad por Comité Técnico Senior', completado: false },
    { num: 30, faseNum: 5, titulo: 'Expedición del Documento de Estructuración Finalizado', completado: false },
    { num: 31, faseNum: 3, titulo: 'Carga de Documentación en Plataforma Oficial de Convocatoria', completado: false },
    { num: 32, faseNum: 5, titulo: 'Radicación Definitiva y Expedición de Radicado de Postulación', completado: false }
  ]

  const porcentajeAvance = Math.round((pasosCompletadosCount / 32) * 100)

  const FASES = [
    { num: 1, label: t.fases.fase1, rango: [1, 6] },
    { num: 2, label: t.fases.fase2, rango: [7, 13] },
    { num: 3, label: t.fases.fase3, rango: [14, 20] },
    { num: 4, label: t.fases.fase4, rango: [21, 27] },
    { num: 5, label: t.fases.fase5, rango: [28, 32] }
  ]

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-color-base-300 shadow-md space-y-6">
      {/* Dynamic Progress Meter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-color-base-200 pb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-color-primary bg-color-primary/10 px-3 py-1 rounded-full border border-color-primary/20">
            METODOLOGÍA DE ARQUITECTURA DIGITAL
          </span>
          <h3 className="text-xl md:text-2xl font-black text-color-base-content uppercase italic mt-2">
            {t.progressTitle}
          </h3>
          <p className="text-xs text-color-base-content/70 font-semibold mt-1">
            <strong className="text-color-primary">{pasosCompletadosCount}</strong> de 32 {t.stepsCompleted}
          </p>
        </div>

        <div className="flex items-center gap-4 min-w-[200px]">
          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-xs font-black text-color-base-content">
              <span>{t.overallProgress}</span>
              <span className="text-color-primary">{porcentajeAvance}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-color-primary to-teal-500 transition-all duration-1000"
                style={{ width: `${porcentajeAvance}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Accordion de Fases */}
      <div className="space-y-3">
        {FASES.map(fase => {
          const pasosDeEstaFase = LISTA_32_PASOS.filter(p => p.num >= fase.rango[0] && p.num <= fase.rango[1])
          const completadosEnFase = pasosDeEstaFase.filter(p => p.num <= pasosCompletadosCount).length
          const isOpen = faseAbierta === fase.num

          return (
            <div key={fase.num} className="border border-color-base-200 rounded-2xl overflow-hidden bg-slate-50">
              <button
                onClick={() => setFaseAbierta(isOpen ? null : fase.num)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                    completadosEnFase === pasosDeEstaFase.length ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {fase.num}
                  </div>
                  <h4 className="font-extrabold text-sm text-color-base-content">
                    {fase.label}
                  </h4>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-color-base-content/70">
                    {completadosEnFase}/{pasosDeEstaFase.length}
                  </span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                </div>
              </button>

              {isOpen && (
                <div className="p-4 bg-white border-t border-color-base-200 space-y-2">
                  {pasosDeEstaFase.map(paso => {
                    const isDone = paso.num <= pasosCompletadosCount
                    const isInProgress = paso.num === pasosCompletadosCount + 1

                    return (
                      <div
                        key={paso.num}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium ${
                          isDone
                            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                            : isInProgress
                            ? 'bg-amber-50/60 border-amber-300 text-amber-950'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          ) : isInProgress ? (
                            <Clock className="h-4 w-4 text-amber-600 animate-pulse shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-slate-300 shrink-0" />
                          )}
                          <span>
                            <strong>Paso {paso.num}:</strong> {paso.titulo}
                          </span>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isDone ? 'bg-emerald-100 text-emerald-800' : isInProgress ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {isDone ? 'Completado' : isInProgress ? 'En Proceso' : 'Pendiente'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
