'use client'

import React, { useState } from 'react'
import {
  Sparkles, ArrowRight, Loader2, Check, Building2, FileText,
  Coins, MessageSquare, Download, ChevronRight
} from 'lucide-react'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlassCard } from '@/components/ui/GlassCard'
import type { DiagnosticoResultadoV2 } from '@/app/api/diagnostico-v2/route'

const initialForm = {
  nombreEmpresa: '',
  nombreRepresentante: '',
  documentoIdentidad: '',
  email: '',
  whatsapp: '',
  ciudadPais: '',
  nombreProyecto: '',
  beneficiarios: '',
  ubicacionProyecto: '',
  problema: '',
  solucion: '',
  objetivoGeneral: '',
  objetivosEspecificos: '',
  descripcionGeneral: '',
  presupuesto: '',
  moneda: 'COP',
  fasesProyecto: '',
  tiempoEjecucion: '',
  resultadosEsperados: '',
  modeloSostenibilidad: '',
  estrategiaEscalabilidad: '',
}

type FormData = typeof initialForm

const inputClass = "w-full px-4 py-3 rounded-xl border border-color-base-300 bg-white/50 focus:bg-white focus:ring-2 focus:ring-color-primary outline-none transition-all text-sm font-medium"
const labelClass = "block text-xs font-bold uppercase tracking-wider text-color-base-content/80 mb-2"

export function DiagnosticoGratuito() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FormData>(initialForm)
  const [resultado, setResultado] = useState<DiagnosticoResultadoV2 | null>(null)
  const [verNotaConcepto, setVerNotaConcepto] = useState(false)

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/diagnostico-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al generar el diagnóstico')
      setResultado(data)
      setStep(4)
    } catch (err: any) {
      setError(err.message || 'Hubo un problema. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const getWhatsappLink = () => {
    if (!resultado) return '#'
    const mensaje = `Hola Arquitectura Digital, acabo de realizar mi diagnóstico gratuito para "${formData.nombreProyecto}". Obtuve ${resultado.scoreGeneral}% de viabilidad y quiero avanzar con la estructuración de mi proyecto.`
    return `https://wa.me/573227008727?text=${encodeURIComponent(mensaje)}`
  }

  const descargarNotaConcepto = () => {
    if (!resultado) return
    const blob = new Blob([resultado.notaConceptoMarkdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Nota-Concepto-${formData.nombreProyecto || 'proyecto'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div id="diagnostico" className="w-full max-w-5xl mx-auto my-12 px-4">
      <GlassCard className="p-8 md:p-12 relative overflow-hidden border border-color-primary/20 shadow-2xl backdrop-blur-2xl bg-white/80">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-gradient-to-r from-color-primary via-emerald-400 to-teal-500 rounded-b-full blur-[1px]" />

        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-color-primary/10 border border-color-primary/20 text-color-primary text-xs font-black uppercase tracking-widest">
            <Sparkles className="h-4 w-4 animate-pulse" />
            Diagnóstico Gratuito con Inteligencia Artificial
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-color-base-content uppercase italic">
            Diagnóstico de <span className="text-gradient-magma">Viabilidad & Fondos</span>
          </h2>
          <p className="text-color-base-content/70 max-w-2xl mx-auto text-sm md:text-base font-medium">
            Nuestra IA analiza tu proyecto y te muestra los sectores y mecanismos de financiamiento con mayor afinidad, más una nota concepto lista para usar.
          </p>
        </div>

        {step < 4 && (
          <div className="flex items-center justify-between max-w-xl mx-auto mb-10 relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-color-base-200 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-1 bg-color-primary -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
            {[
              { num: 1, label: 'Solicitante' },
              { num: 2, label: 'Proyecto' },
              { num: 3, label: 'Viabilidad' },
              { num: 4, label: 'Resultado' },
            ].map((item) => (
              <div key={item.num} className="relative z-10 flex flex-col items-center gap-1.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all duration-300 ${
                  step >= item.num ? 'bg-color-primary text-white shadow-lg shadow-color-primary/30 scale-110' : 'bg-color-base-200 text-color-base-content/50 border border-color-base-300'
                }`}>
                  {step > item.num ? <Check className="h-4 w-4" /> : item.num}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-color-base-content/70">{item.label}</span>
              </div>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xl font-extrabold text-color-base-content flex items-center gap-2 border-b border-color-base-200 pb-3">
              <Building2 className="h-5 w-5 text-color-primary" />
              Datos del Solicitante
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Nombre de la empresa u organización *</label>
                <input required value={formData.nombreEmpresa} onChange={(e) => handleChange('nombreEmpresa', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Representante legal o persona natural a cargo *</label>
                <input required value={formData.nombreRepresentante} onChange={(e) => handleChange('nombreRepresentante', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Cédula, documento de identidad y/o NIT *</label>
                <input required value={formData.documentoIdentidad} onChange={(e) => handleChange('documentoIdentidad', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Correo electrónico *</label>
                <input required type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Celular / WhatsApp *</label>
                <input required value={formData.whatsapp} onChange={(e) => handleChange('whatsapp', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Ciudad y país de ubicación/residencia *</label>
                <input required value={formData.ciudadPais} onChange={(e) => handleChange('ciudadPais', e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <GlowButton
                disabled={!formData.nombreEmpresa || !formData.nombreRepresentante || !formData.email || !formData.whatsapp}
                onClick={() => setStep(2)}
                className="px-8 py-3 text-xs font-black tracking-widest gap-2"
              >
                SIGUIENTE: PROYECTO <ArrowRight className="h-4 w-4" />
              </GlowButton>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xl font-extrabold text-color-base-content flex items-center gap-2 border-b border-color-base-200 pb-3">
              <FileText className="h-5 w-5 text-color-primary" />
              Caracterización del Proyecto
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelClass}>Nombre del proyecto *</label>
                <input required value={formData.nombreProyecto} onChange={(e) => handleChange('nombreProyecto', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Beneficiarios directos e indirectos *</label>
                <textarea rows={2} required value={formData.beneficiarios} onChange={(e) => handleChange('beneficiarios', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Ubicación geográfica del proyecto *</label>
                <input required value={formData.ubicacionProyecto} onChange={(e) => handleChange('ubicacionProyecto', e.target.value)} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Problema o dolor que resuelve *</label>
                <textarea rows={3} required value={formData.problema} onChange={(e) => handleChange('problema', e.target.value)} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Solución propuesta *</label>
                <textarea rows={3} required value={formData.solucion} onChange={(e) => handleChange('solucion', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Objetivo general *</label>
                <textarea rows={2} required value={formData.objetivoGeneral} onChange={(e) => handleChange('objetivoGeneral', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Objetivos específicos (hasta 3-4) *</label>
                <textarea rows={2} required value={formData.objetivosEspecificos} onChange={(e) => handleChange('objetivosEspecificos', e.target.value)} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Descripción general del proyecto *</label>
                <textarea rows={3} required value={formData.descripcionGeneral} onChange={(e) => handleChange('descripcionGeneral', e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <button type="button" onClick={() => setStep(1)} className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-color-base-content/60 hover:text-color-base-content transition-colors">Volver</button>
              <GlowButton
                disabled={!formData.nombreProyecto || !formData.problema || !formData.solucion || !formData.objetivoGeneral}
                onClick={() => setStep(3)}
                className="px-8 py-3 text-xs font-black tracking-widest gap-2"
              >
                SIGUIENTE: VIABILIDAD <ArrowRight className="h-4 w-4" />
              </GlowButton>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xl font-extrabold text-color-base-content flex items-center gap-2 border-b border-color-base-200 pb-3">
              <Coins className="h-5 w-5 text-color-primary" />
              Requerimientos, Viabilidad y Sostenibilidad
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Presupuesto estimado o solicitado *</label>
                <div className="flex gap-2">
                  <input required value={formData.presupuesto} onChange={(e) => handleChange('presupuesto', e.target.value)} className={inputClass} placeholder="Ej: 80000000" />
                  <select value={formData.moneda} onChange={(e) => handleChange('moneda', e.target.value)} className={inputClass + ' w-28'}>
                    <option value="COP">COP</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Tiempo estimado de ejecución *</label>
                <input required value={formData.tiempoEjecucion} onChange={(e) => handleChange('tiempoEjecucion', e.target.value)} className={inputClass} placeholder="Ej: 12 meses" />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Fases o etapas del proyecto (si las tiene)</label>
                <textarea rows={2} value={formData.fasesProyecto} onChange={(e) => handleChange('fasesProyecto', e.target.value)} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Resultados esperados al finalizar la ejecución *</label>
                <textarea rows={3} required value={formData.resultadosEsperados} onChange={(e) => handleChange('resultadosEsperados', e.target.value)} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Modelo de sostenibilidad financiera y operativa *</label>
                <textarea rows={3} required value={formData.modeloSostenibilidad} onChange={(e) => handleChange('modeloSostenibilidad', e.target.value)} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Estrategia de escalabilidad *</label>
                <textarea rows={3} required value={formData.estrategiaEscalabilidad} onChange={(e) => handleChange('estrategiaEscalabilidad', e.target.value)} className={inputClass} />
              </div>
            </div>

            {error && <p className="text-xs text-red-500 font-bold">{error}</p>}

            <div className="flex justify-between pt-4">
              <button type="button" onClick={() => setStep(2)} className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-color-base-content/60 hover:text-color-base-content transition-colors">Volver</button>
              <GlowButton
                disabled={loading || !formData.presupuesto || !formData.tiempoEjecucion || !formData.resultadosEsperados}
                onClick={handleSubmit}
                className="px-8 py-3 text-xs font-black tracking-widest gap-2 bg-gradient-to-r from-color-primary to-teal-500"
              >
                {loading ? (<><Loader2 className="h-4 w-4 animate-spin" /> ANALIZANDO CON IA...</>) : (<>GENERAR DIAGNÓSTICO <Sparkles className="h-4 w-4" /></>)}
              </GlowButton>
            </div>
          </div>
        )}

        {step === 4 && resultado && (
          <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
            <div className="bg-gradient-to-br from-color-primary/10 via-emerald-500/5 to-teal-500/10 p-6 md:p-8 rounded-3xl border border-color-primary/20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-color-primary bg-white/80 px-3 py-1 rounded-full border border-color-primary/30">
                    DIAGNÓSTICO FINALIZADO CON IA
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black text-color-base-content mt-2 uppercase italic">
                    {formData.nombreProyecto}
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

            <div className="p-6 rounded-3xl bg-white border border-color-base-200 space-y-4">
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
              <button onClick={descargarNotaConcepto} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-color-primary hover:underline">
                <Download className="h-4 w-4" /> Descargar Nota Concepto
              </button>
            </div>

            <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden space-y-6">
              <div className="relative z-10 max-w-2xl space-y-3">
                <h4 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight">¿Listo para estructurar tu proyecto?</h4>
                <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
                  Con tu diagnóstico en mano, elige tu plan de estructuración y empezamos a trabajar en tu formulación técnica y búsqueda de convocatorias.
                </p>
              </div>
              <div className="relative z-10 flex flex-wrap items-center gap-4">
                <a href={getWhatsappLink()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-color-primary text-white font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition-all">
                  <MessageSquare className="h-4 w-4" /> Hablar con un asesor
                </a>
                <a href="#pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-all">
                  VER PLANES DE ESTRUCTURACIÓN <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}