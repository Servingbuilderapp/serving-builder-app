'use client'

import React, { useState } from 'react'
import { FileCheck2, Download, ArrowRight, Sparkles, CheckCircle2, Award, Eye, FileText, X, ShieldCheck } from 'lucide-react'
import { GlowButton } from '@/components/ui/GlowButton'
import { IdiomaSeguimiento, traduccionesSeguimiento } from '@/lib/seguimientoTranslations'

interface GeneradorReporteMaestroProps {
  idioma: IdiomaSeguimiento
  onAvanzarBloque4: () => void
}

export function GeneradorReporteMaestro({ idioma, onAvanzarBloque4 }: GeneradorReporteMaestroProps) {
  const t = traduccionesSeguimiento[idioma]
  const [descargando, setDescargando] = useState(false)
  const [verPrevisualizacion, setVerPrevisualizacion] = useState(false)

  const handleDescargar = () => {
    setDescargando(true)
    setTimeout(() => {
      setDescargando(false)
      if (typeof window !== 'undefined') {
        window.print()
      }
    }, 800)
  }

  return (
    <>
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-8 border border-color-primary/30 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-color-primary bg-color-primary/20 px-3 py-1 rounded-full border border-color-primary/30">
              BLOQUE 3: ENTREGABLE FINAL DE ESTRUCTURACIÓN TÉCNICA
            </span>
            <h3 className="text-2xl md:text-3xl font-black italic uppercase">
              {t.reporteMaestroTitle}
            </h3>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
              Ficha Técnica compilada bajo Metodología General Ajustada (MGA), Marco Lógico, Matriz de Riesgos y Presupuesto oficial con respaldo de Honorarios de Estructuración y Garantía de Acompañamiento.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setVerPrevisualizacion(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-all"
            >
              <Eye className="h-4 w-4 text-emerald-400" />
              Previsualizar Ficha MGA
            </button>

            <button
              onClick={handleDescargar}
              disabled={descargando}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all"
            >
              <Download className="h-4 w-4 text-white" />
              {descargando ? 'Generando PDF...' : 'Exportar Ficha Oficial (PDF)'}
            </button>

            <GlowButton
              onClick={onAvanzarBloque4}
              className="w-full sm:w-auto px-8 py-3.5 text-xs font-black tracking-widest gap-2 bg-gradient-to-r from-color-primary to-teal-500"
            >
              {t.avanzarBloque4}
              <ArrowRight className="h-4 w-4" />
            </GlowButton>
          </div>
        </div>
      </div>

      {/* Modal Previsualizador de Entregables Exportables */}
      {verPrevisualizacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl border border-slate-300 flex flex-col">
            {/* Header Modal */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-color-primary/20 border border-color-primary/40 flex items-center justify-center text-color-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-black uppercase tracking-wider">
                    Ficha Técnica Compilada MGA - Previsualización Oficial
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    Documento de radicación formal para convocatorias SENA, Fondo Emprender y APC Colombia.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setVerPrevisualizacion(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Previsualización */}
            <div className="p-8 overflow-y-auto space-y-6 text-xs text-slate-800 font-sans">
              <div className="border-b border-slate-200 pb-4 flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase text-color-primary tracking-widest block">
                    Arquitectura Digital • División de Estructuración Técnica
                  </span>
                  <h2 className="text-xl font-black uppercase mt-1">Dossier Maestro MGA & Matriz de Marco Lógico</h2>
                  <p className="text-slate-500 font-medium">Código de Proyecto: MGA-2026-COL-0091 • Estado: Listo para Radicación</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black uppercase bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300">
                    Aprobado para Postulación
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <strong className="text-slate-500 text-[10px] uppercase tracking-wider block">Resumen de Ejecución</strong>
                  <p className="font-bold text-slate-900 mt-0.5">Estructuración Integral MGA con Garantía Extendida</p>
                </div>
                <div>
                  <strong className="text-slate-500 text-[10px] uppercase tracking-wider block">Honorarios de Estructuración Formalizados</strong>
                  <p className="font-bold text-color-primary mt-0.5">Cubiertos bajo contrato digital comercial</p>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-black uppercase text-xs text-slate-900 border-l-4 border-color-primary pl-2">
                  1. Árbol de Objetivos & Marco Lógico MGA
                </h5>
                <p className="text-slate-600 leading-relaxed">
                  El proyecto resuelve la ineficiencia operativa mediante la instalación de infraestructura especializada y licenciamiento modular. Matriz de Marco Lógico articulada a nivel de Fin, Propósito, Componentes y Actividades con KPIs 100% audíbles.
                </p>
              </div>

              <div className="space-y-3">
                <h5 className="font-black uppercase text-xs text-slate-900 border-l-4 border-teal-500 pl-2">
                  2. Estructura Presupuestal Financiable
                </h5>
                <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 font-mono text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span>Monto Solicitado al Fondo:</span>
                    <span className="font-bold">$120.000.000 COP</span>
                  </div>
                  <div className="flex justify-between text-teal-700">
                    <span>Contrapartida del Proponente:</span>
                    <span className="font-bold">$25.000.000 COP</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold border-t border-slate-300 pt-1 mt-1">
                    <span>TOTAL PRESUPUESTO PROYECTADO MGA:</span>
                    <span>$145.000.000 COP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setVerPrevisualizacion(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all"
              >
                Cerrar Previsualización
              </button>
              <button
                onClick={handleDescargar}
                className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-color-primary text-white hover:brightness-110 transition-all shadow-md"
              >
                Imprimir / Guardar en PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
