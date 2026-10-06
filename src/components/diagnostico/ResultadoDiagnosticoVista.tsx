'use client'

import React, { useState } from 'react'
import { ChevronRight, Download, MessageSquare } from 'lucide-react'
import { RuedaDiagnostico } from '@/components/diagnostico/RuedaDiagnostico'
import type { DiagnosticoResultadoV2 } from '@/app/api/diagnostico-v2/route'
import { descargarComoWord, guardarComoPdf } from '@/lib/descargarDocumento'

/**
 * El resultado completo del diagnóstico (rueda, sectores, mecanismos, brechas, ruta y nota
 * de concepto). Lo usan tres pantallas: el formulario (al terminar), la página donde el
 * cliente vuelve a verlo con su correo, y la pantalla del equipo.
 */
export function ResultadoDiagnosticoVista({
  resultado,
  nombreProyecto,
  mostrarCierre = true,
}: {
  resultado: DiagnosticoResultadoV2
  nombreProyecto: string
  mostrarCierre?: boolean
}) {
  const [verNotaConcepto, setVerNotaConcepto] = useState(false)

  const whatsappLink = `https://wa.me/573123335966?text=${encodeURIComponent(
    `Hola Arquitectura Digital, acabo de realizar mi diagnóstico gratuito para "${nombreProyecto}". Obtuve ${resultado.scoreGeneral}% de viabilidad y quiero avanzar con la estructuración de mi proyecto.`,
  )}`

  const descargarNotaConcepto = () => {
    descargarComoWord(
      `Nota-Concepto-${nombreProyecto || 'proyecto'}`,
      `Nota de Concepto: ${nombreProyecto || 'proyecto'}`,
      resultado.notaConceptoMarkdown,
    )
  }

  const pdfNotaConcepto = () => {
    guardarComoPdf(
      `Nota de Concepto: ${nombreProyecto || 'proyecto'}`,
      resultado.notaConceptoMarkdown,
    )
  }

  return (
          <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
            <div className="bg-gradient-to-br from-color-primary/10 via-color-primary/5 to-teal-500/10 p-6 md:p-8 rounded-3xl border border-color-primary/20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-color-primary bg-white/80 px-3 py-1 rounded-full border border-color-primary/30">
                    DIAGNÓSTICO FINALIZADO CON IA
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black text-color-base-content mt-2 uppercase italic">
                    {nombreProyecto}
                  </h3>
                  <p className="text-xs md:text-sm text-color-base-content/80 mt-1 max-w-xl">{resultado.resumenEjecutivo}</p>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-color-primary/30 shadow-xl min-w-[160px]">
                  <span className="text-[10px] font-black text-color-base-content/60 uppercase tracking-widest">Score General</span>
                  <span className="text-4xl font-black text-color-primary my-1">{resultado.scoreGeneral}%</span>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${resultado.esViable ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                    {resultado.esViable ? 'Proyecto Viable' : 'Requiere Ajustes'}
                  </span>
                </div>
              </div>
            </div>

            {resultado.ejesRueda && resultado.ejesRueda.length > 0 && (
              <div className="flex justify-center py-4">
                <RuedaDiagnostico
                  titulo="Tu Rueda de Diagnóstico"
                  ejes={resultado.ejesRueda}
                  size={340}
                />
              </div>
            )}

            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-color-base-content/80 mb-4">Tus Sectores/Nichos con Mayor Afinidad</h4>
              <div className="space-y-3">
                {resultado.sectoresSugeridos.map((s, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-color-base-content">{i === 0 && '⭐ '}{s.nombre}</span>
                      <span className="text-color-primary">{s.porcentaje}%</span>
                    </div>
                    <div className="w-full h-3 bg-color-base-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-color-primary to-teal-500 transition-all duration-1000" style={{ width: `${s.porcentaje}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-color-base-content/80 mb-4">Mecanismos de Financiamiento Recomendados</h4>
              <div className="grid md:grid-cols-3 gap-4">
                {resultado.mecanismosSugeridos.map((m, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/60 border border-color-base-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-color-base-content">{m.nombre}</span>
                      <span className="text-lg font-black text-color-primary">{m.porcentaje}%</span>
                    </div>
                    <p className="text-[11px] text-color-base-content/70">{m.descripcion}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                <h5 className="text-xs font-black uppercase tracking-wider text-amber-700">Brechas a Fortalecer</h5>
                <ul className="space-y-2">
                  {resultado.brechasCriticas.map((b, i) => (
                    <li key={i} className="text-xs font-medium text-color-base-content/80 flex items-start gap-2"><span className="text-amber-500 font-bold">•</span>{b}</li>
                  ))}
                </ul>
              </div>
              <div className="p-5 rounded-2xl bg-color-primary/5 border border-color-primary/20 space-y-3">
                <h5 className="text-xs font-black uppercase tracking-wider text-color-primary">Ruta de Acción Sugerida</h5>
                <ul className="space-y-2">
                  {resultado.pasosRecomendados.map((p, i) => (
                    <li key={i} className="text-xs font-medium text-color-base-content/80 flex items-start gap-2"><span className="text-color-primary font-bold">•</span>{p}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#3B1727] border border-color-base-300 space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-black text-color-base-content">Tu Nota Concepto (borrador para pitch deck)</h5>
                <button onClick={() => setVerNotaConcepto(!verNotaConcepto)} className="text-xs font-bold text-color-primary flex items-center gap-1">
                  {verNotaConcepto ? 'Ocultar' : 'Ver completa'} <ChevronRight className={`h-3 w-3 transition-transform ${verNotaConcepto ? 'rotate-90' : ''}`} />
                </button>
              </div>
              {verNotaConcepto && (
                <div className="max-h-96 overflow-y-auto text-xs text-color-base-content/80 whitespace-pre-line leading-relaxed border-t border-color-base-100 pt-4">
                  {resultado.notaConceptoMarkdown}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <button onClick={descargarNotaConcepto} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-color-primary hover:underline">
                  <Download className="h-4 w-4" /> Descargar en Word
                </button>
                <button onClick={pdfNotaConcepto} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-color-primary hover:underline">
                  <Download className="h-4 w-4" /> Guardar en PDF
                </button>
              </div>
            </div>

            {mostrarCierre && (
            <div className="bg-gradient-to-r from-slate-900 via-[#0B2A4A] to-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden space-y-6">
              <div className="relative z-10 max-w-2xl space-y-3">
                <h4 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight">¿Listo para estructurar tu proyecto?</h4>
                <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
                  Con tu diagnóstico en mano, elige tu plan de estructuración y empezamos a trabajar en tu formulación técnica y búsqueda de convocatorias.
                </p>
              </div>
              <div className="relative z-10 flex flex-wrap items-center gap-4">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-color-primary text-white font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition-all">
                  <MessageSquare className="h-4 w-4" /> Hablar con un asesor
                </a>
                <a href="#pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-all">
                  VER PLANES DE ESTRUCTURACIÓN <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </div>
            )}
          </div>
  )
}
