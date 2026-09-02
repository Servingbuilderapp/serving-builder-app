'use client'

import React, { useState } from 'react'
import {
  Video,
  FileText,
  HelpCircle,
  CheckCircle2,
  Lock,
  AlertTriangle,
  Upload,
  Link as LinkIcon,
  ArrowRight,
  ShieldAlert,
  Loader2
} from 'lucide-react'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlassCard } from '@/components/ui/GlassCard'

export interface DayZeroData {
  videoUrl: string
  videoFilename?: string
  documentoUrl: string
  documentoFilename: string
  respuestas22: Record<string, string>
  completado: boolean
}

interface DayZeroFormProps {
  onCompleted: (data: DayZeroData) => void
}

// Estructura preliminar de las 22 preguntas dividida en 4 módulos clave
const PREGUNTAS_22 = [
  // Módulo 1: Información General del Proyecto (1-5)
  { id: 'p1', num: 1, text: '¿Cuál es la denominación oficial o nombre comercial del proyecto o emprendimiento?' },
  { id: 'p2', num: 2, text: '¿En qué municipio, departamento y región principal operará la iniciativa?' },
  { id: 'p3', num: 3, text: '¿Cuál es la actividad económica principal (CIIU) o sector primario de impacto?' },
  { id: 'p4', num: 4, text: '¿Cuenta con registro de Cámara de Comercio o RUT activo actualmente? Adjunte el número de Identificación Tributaria.' },
  { id: 'p5', num: 5, text: '¿Quiénes integran el equipo emprendedor o directivo y cuáles son sus roles principales?' },

  // Módulo 2: Diagnóstico y Problema a Resolver (6-10)
  { id: 'p6', num: 6, text: '¿Cuál es la problemática central, necesidad insatisfecha o falla de mercado que aborda el proyecto?' },
  { id: 'p7', num: 7, text: '¿Quiénes son los beneficiarios directos e indirectos (población objetivo y perfil sociodemográfico)?' },
  { id: 'p8', num: 8, text: '¿Qué evidencias o datos cuantitativos justifican la magnitud de la problemática en la zona?' },
  { id: 'p9', num: 9, text: '¿Existen soluciones actuales en el mercado y por qué resultan insuficientes o costosas?' },
  { id: 'p10', num: 10, text: '¿Cuál es el impacto social, económico o ambiental directo que se busca generar en 12 meses?' },

  // Módulo 3: Solución, Producto y Metodología (11-16)
  { id: 'p11', num: 11, text: 'Describe detalladamente el producto, servicio o modelo de intervención propuesto.' },
  { id: 'p12', num: 12, text: '¿Cuál es la propuesta de valor diferenciadora respecto a competidores o alternativas existentes?' },
  { id: 'p13', num: 13, text: '¿En qué estado de desarrollo se encuentra el producto o servicio (Idea, Prototipo, MVP, En Comercialización)?' },
  { id: 'p14', num: 14, text: '¿Qué tecnología, patente, propiedad intelectual o metodología clave requiere la ejecución?' },
  { id: 'p15', num: 15, text: 'Detalla el proceso operativo o la cadena de valor paso a paso desde el insumo hasta el usuario final.' },
  { id: 'p16', num: 16, text: '¿Cuáles son los principales riesgos (operativos, regulatorios, ambientales) y el plan de mitigación?' },

  // Módulo 4: Presupuesto, Modelo Financiero y Sostenibilidad (17-22)
  { id: 'p17', num: 17, text: '¿Cuál es el monto total de inversión requerido para la fase actual de estructuración?' },
  { id: 'p18', num: 18, text: 'Desglosa los rubros principales de gasto (Equipos, Personal técnico, Insumos, Licencias, Marketing).' },
  { id: 'p19', num: 19, text: '¿Cómo generará ingresos el proyecto o cómo se garantizará la sostenibilidad financiera post-fondo?' },
  { id: 'p20', num: 20, text: '¿Qué contrapartida en dinero o especie (equipos, espacio, tiempo) puede aportar el emprendedor?' },
  { id: 'p21', num: 21, text: '¿Cuáles son las metas comerciales o de cobertura previstas para el primer año de operaciones?' },
  { id: 'p22', num: 22, text: '¿Ha participado o sido beneficiario previamente de otros fondos gubernamentales o internacionales?' }
]

export function DayZeroForm({ onCompleted }: DayZeroFormProps) {
  // Entregable 1: Video Pitch
  const [videoUrl, setVideoUrl] = useState('')
  const [videoValid, setVideoValid] = useState(false)

  // Entregable 2: Documento
  const [documentoFilename, setDocumentoFilename] = useState('')

  // Entregable 3: Formulario de 22 Preguntas
  const [respuestas, setRespuestas] = useState<Record<string, string>>({})

  // Estado general
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationError, setValidationError] = useState('')

  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url)
    // Validación básica de URL válida
    if (url.trim().length > 10 && (url.includes('http') || url.includes('vimeo') || url.includes('youtu') || url.includes('loom'))) {
      setVideoValid(true)
    } else {
      setVideoValid(false)
    }
  }

  const handleFileUploadMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDocumentoFilename(file.name)
    }
  }

  const handleRespuestaChange = (id: string, val: string) => {
    setRespuestas(prev => ({ ...prev, [id]: val }))
  }

  // Conteo de preguntas respondidas
  const preguntasRespondidasCount = Object.values(respuestas).filter(r => r && r.trim().length > 5).length
  const form22Completo = preguntasRespondidasCount >= 22

  // Conteo total de requerimientos completados (0/3, 1/3, 2/3, 3/3)
  const req1VideoOk = videoValid
  const req2DocOk = Boolean(documentoFilename)
  const req3FormOk = form22Completo

  const totalReqsOk = (req1VideoOk ? 1 : 0) + (req2DocOk ? 1 : 0) + (req3FormOk ? 1 : 0)
  const canSubmit = totalReqsOk === 3

  const handleSubmitDayZero = async () => {
    if (!canSubmit) {
      setValidationError('El sistema NO puede iniciar el proceso hasta que los 3 entregables del Day Zero estén completados al 100%.')
      return
    }

    setIsSubmitting(true)
    try {
      const data: DayZeroData = {
        videoUrl,
        documentoUrl: videoUrl,
        documentoFilename,
        respuestas22: respuestas,
        completado: true
      }
      onCompleted(data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto my-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Banner de Day Zero */}
      <GlassCard className="p-8 border border-color-primary/30 bg-gradient-to-r from-slate-900 via-[#0B2A4A] to-slate-900 text-white shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-color-primary bg-color-primary/20 px-3 py-1 rounded-full border border-color-primary/40">
              DAY ZERO: FASE OBLIGATORIA DE CARGA
            </span>
            <h2 className="text-2xl md:text-4xl font-black italic uppercase mt-2">
              Puerta de Enlace <span className="text-color-primary font-black">Day Zero</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl mt-1">
              El plazo de <strong className="text-white">entrega en 5 días hábiles</strong> empieza a contar únicamente cuando completes los 3 entregables de aquí abajo.
            </p>
          </div>

          {/* Progress Badge */}
          <div className="flex flex-col items-center justify-center p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 min-w-[150px]">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Entregables Day Zero
            </span>
            <span className="text-4xl font-black text-color-primary my-1">
              {totalReqsOk}/3
            </span>
            <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
              canSubmit ? 'bg-emerald-500 text-white' : 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
            }`}>
              {canSubmit ? 'LISTO PARA ACTIVAR 30 DÍAS' : 'REQUERIMIENTOS PENDIENTES'}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* REQUISITO 1: VIDEO PITCH (MÁX 3 MINUTOS) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-color-base-300 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-color-base-200 pb-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
              req1VideoOk ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {req1VideoOk ? <CheckCircle2 className="h-5 w-5" /> : '1'}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-color-base-content flex items-center gap-2">
                <Video className="h-4 w-4 text-color-primary" />
                Requisito 1: Video Pitch del Proyecto (Máximo 3 Minutos)
              </h3>
              <p className="text-xs text-color-base-content/70 font-medium">
                Graba o comparte un enlace de video (Loom, YouTube, Vimeo o Google Drive) presentando la idea y al equipo.
              </p>
            </div>
          </div>

          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            req1VideoOk ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
          }`}>
            {req1VideoOk ? 'Completado' : 'Pendiente'}
          </span>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-color-base-content/80">
            Enlace / URL del Video (Loom, YouTube, Vimeo, MP4) *
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-color-base-content/40" />
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=... o https://www.loom.com/share/..."
                value={videoUrl}
                onChange={e => handleVideoUrlChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-color-base-300 bg-slate-50 focus:bg-white text-xs font-medium focus:ring-2 focus:ring-color-primary outline-none"
              />
            </div>
          </div>
          {videoUrl && !videoValid && (
            <p className="text-[11px] text-amber-600 font-medium">
              Por favor ingresa una URL válida de video (ej. https://loom.com/share/... o YouTube).
            </p>
          )}
        </div>
      </div>

      {/* REQUISITO 2: DOCUMENTO ACTUAL DEL PROYECTO */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-color-base-300 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-color-base-200 pb-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
              req2DocOk ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {req2DocOk ? <CheckCircle2 className="h-5 w-5" /> : '2'}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-color-base-content flex items-center gap-2">
                <FileText className="h-4 w-4 text-color-primary" />
                Requisito 2: Documentación Actual del Proyecto
              </h3>
              <p className="text-xs text-color-base-content/70 font-medium">
                Adjunta cualquier archivo existente (PDF, Word o PowerPoint con el anteproyecto, borrador o pitch deck).
              </p>
            </div>
          </div>

          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            req2DocOk ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
          }`}>
            {req2DocOk ? 'Completado' : 'Pendiente'}
          </span>
        </div>

        <div className="border-2 border-dashed border-color-base-300 rounded-2xl p-6 text-center bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer relative">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx"
            onChange={handleFileUploadMock}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <Upload className="h-8 w-8 text-color-primary mx-auto mb-2" />
          {documentoFilename ? (
            <div className="text-xs font-bold text-emerald-700 bg-emerald-50 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              Archivo adjuntado: {documentoFilename}
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold text-color-base-content">
                Haz clic aquí para seleccionar o arrastra tu archivo (PDF, DOCX, PPTX)
              </p>
              <p className="text-[10px] text-color-base-content/60 mt-1">
                Tamaño máximo: 25MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* REQUISITO 3: FORMULARIO DE 22 PREGUNTAS */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-color-base-300 shadow-md space-y-6">
        <div className="flex items-center justify-between border-b border-color-base-200 pb-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
              req3FormOk ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {req3FormOk ? <CheckCircle2 className="h-5 w-5" /> : '3'}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-color-base-content flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-color-primary" />
                Requisito 3: Formulario de 22 Preguntas de Diagnóstico & Contexto
              </h3>
              <p className="text-xs text-color-base-content/70 font-medium">
                Progreso actual: <strong className="text-color-primary">{preguntasRespondidasCount}/22 respondidas</strong>.
              </p>
            </div>
          </div>

          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            req3FormOk ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
          }`}>
            {req3FormOk ? 'Completado' : 'Incompleto'}
          </span>
        </div>

        {/* Formulario de 22 Preguntas */}
        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
          {PREGUNTAS_22.map(p => (
            <div key={p.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Pregunta {p.num} de 22: {p.text} *
              </label>
              <textarea
                rows={2}
                placeholder="Escribe tu respuesta clara y sintética aquí..."
                value={respuestas[p.id] || ''}
                onChange={e => handleRespuestaChange(p.id, e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-color-primary outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Alerta si el sistema está bloqueado */}
      {!canSubmit && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 font-medium">
            <strong>Atención:</strong> El sistema de estructuración de <strong>Arquitectura Digital</strong> no inicia la producción ni empieza a contar el plazo de 5 días hábiles hasta que los 3 entregables de arriba estén al 100% completados.
          </p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <GlowButton
          disabled={!canSubmit || isSubmitting}
          onClick={handleSubmitDayZero}
          className={`px-10 py-4 text-xs font-black tracking-widest gap-2 ${
            canSubmit ? 'bg-gradient-to-r from-color-primary to-teal-500' : 'opacity-50 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              VALIDANDO DAY ZERO...
            </>
          ) : (
            <>
              ACTIVAR PROCESO DE ESTRUCTURACIÓN (30 DÍAS)
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </GlowButton>
      </div>
    </div>
  )
}
