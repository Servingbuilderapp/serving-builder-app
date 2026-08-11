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
