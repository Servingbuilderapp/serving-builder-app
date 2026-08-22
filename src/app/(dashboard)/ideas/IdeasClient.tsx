'use client'

import React, { useState } from 'react'
import { Sparkles, Loader2, Lightbulb, ArrowRight, Download, ChevronDown, ChevronUp, Compass, Layers, HeartHandshake } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import {
  PREGUNTAS_REINVENCION,
  TECNOLOGIAS_EMERGENTES,
  NECESIDADES_HUMANAS,
  FORMAS_DE_SATISFACCION
} from '@/lib/ideas/matrices-data'
import type { IdeasResultado } from '@/app/api/ideas/generar/route'

type Herramienta = 'reinvencion' | 'convergencia' | 'necesidades' | null

export default function IdeasClient() {
  const [descripcionIdea, setDescripcionIdea] = useState('')
  const [sectorActual, setSectorActual] = useState('')

  const [herramientaAbierta, setHerramientaAbierta] = useState<Herramienta>(null)

  const [reinvencion, setReinvencion] = useState({ eliminar: '', reducir: '', incrementar: '', crear: '' })
  const [tecnologiaSeleccionada, setTecnologiaSeleccionada] = useState('')
  const [necesidadSeleccionada, setNecesidadSeleccionada] = useState('')
  const [formaSeleccionada, setFormaSeleccionada] = useState('')

  const [cargando, setCargando] = useState(false)
  const [cargandoDocumento, setCargandoDocumento] = useState(false)
  const [resultado, setResultado] = useState<IdeasResultado | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [documentosRestantes, setDocumentosRestantes] = useState<number | null>(null)

  const puedeGenerar = descripcionIdea.trim().length >= 5 && !cargando

  const generar = async (documentoFinal: boolean) => {
    if (!puedeGenerar) return
    setError(null)
    documentoFinal ? setCargandoDocumento(true) : setCargando(true)

    try {
      const res = await fetch('/api/ideas/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcionIdea,
          sectorActual: sectorActual || undefined,
          matrizReinvencion: Object.values(reinvencion).some(Boolean) ? reinvencion : undefined,
          tecnologiaSeleccionada: tecnologiaSeleccionada
            ? TECNOLOGIAS_EMERGENTES.find(t => t.id === tecnologiaSeleccionada)?.nombre
            : undefined,
          necesidadSeleccionada: necesidadSeleccionada
            ? NECESIDADES_HUMANAS.find(n => n.id === necesidadSeleccionada)?.nombre
            : undefined,
          formaSeleccionada: formaSeleccionada
            ? FORMAS_DE_SATISFACCION.find(f => f.id === formaSeleccionada)?.nombre
            : undefined,
          generarDocumentoFinal: documentoFinal
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Ocurrió un error, intenta de nuevo')
        return
      }

      setResultado(data)
      if (typeof data.documentosRestantesSemana === 'number') {
        setDocumentosRestantes(data.documentosRestantesSemana)
      }

      if (documentoFinal) {
        // Pequeña espera para que el DOM pinte el documento antes de imprimir
        setTimeout(() => window.print(), 400)
      }
    } catch (e: any) {
      setError('No se pudo conectar con el generador de ideas. Intenta de nuevo.')
    } finally {
      setCargando(false)
      setCargandoDocumento(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto w-full space-y-10 py-12 px-6 print:hidden-when-empty">
      {/* Header */}
      <div className="text-center space-y-4 mb-8 print:hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-color-primary/10 border border-color-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-color-primary">
          <Sparkles className="h-3 w-3" />
          GRATIS — SIN LÍMITE DE CONVERSACIÓN
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-color-base-content tracking-tight uppercase italic">
          App de <span className="text-color-primary">Ideas</span>
        </h1>
        <p className="text-color-base-content/60 max-w-2xl mx-auto font-medium">
          Cuéntanos tu idea o tu negocio. Explora las 3 herramientas para encontrar ángulos nuevos, y descarga tu documento de idea clara y estructurada (1 cada 15 días).
        </p>
      </div>

      {/* Conversación con la IA */}
      <GlassCard className="p-8 border-color-base-content/10 space-y-6 print:hidden">
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-[0.2em] text-color-base-content/60 ml-1">
            Cuéntanos tu idea o tu negocio
          </label>
          <textarea
            value={descripcionIdea}
            onChange={(e) => setDescripcionIdea(e.target.value)}
            placeholder="Ej: Tengo un pequeño negocio de café en Bogotá y quiero encontrar una forma de crecer usando tecnología..."
            rows={4}
            className="w-full bg-color-base-content/5 border border-color-base-content/10 rounded-2xl px-6 py-4 text-color-base-content focus:outline-none focus:border-color-primary/50 transition-all font-medium placeholder:text-color-base-content/30 resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-[0.2em] text-color-base-content/60 ml-1">
            Sector o industria actual (opcional)
          </label>
          <input
            type="text"
            value={sectorActual}
            onChange={(e) => setSectorActual(e.target.value)}
            placeholder="Ej: Agricultura, Educación, Comercio..."
            className="w-full h-14 bg-color-base-content/5 border border-color-base-content/10 rounded-2xl px-6 text-color-base-content focus:outline-none focus:border-color-primary/50 transition-all font-medium placeholder:text-color-base-content/30"
          />
        </div>

        {/* Las 3 herramientas */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-color-base-content/40 ml-1">
            Herramientas para explorar tu idea (opcional)
          </p>

          <HerramientaAcordeon
            icono={<Compass className="h-5 w-5" />}
            titulo="Matriz de Reinvención"
            subtitulo="4 preguntas para repensar el negocio"
            abierta={herramientaAbierta === 'reinvencion'}
            onToggle={() => setHerramientaAbierta(herramientaAbierta === 'reinvencion' ? null : 'reinvencion')}
          >
            <div className="grid md:grid-cols-2 gap-4">
              {PREGUNTAS_REINVENCION.map((p) => (
                <div key={p.id} className="space-y-1.5">
                  <label className="block text-xs font-bold text-color-base-content/70">{p.pregunta}</label>
                  <p className="text-[11px] text-color-base-content/40 mb-1">{p.ayuda}</p>
                  <input
                    type="text"
                    value={(reinvencion as any)[p.id]}
                    onChange={(e) => setReinvencion({ ...reinvencion, [p.id]: e.target.value })}
                    className="w-full h-11 bg-color-base-content/5 border border-color-base-content/10 rounded-xl px-4 text-sm text-color-base-content focus:outline-none focus:border-color-primary/50"
                  />
                </div>
              ))}
            </div>
          </HerramientaAcordeon>

          <HerramientaAcordeon
            icono={<Layers className="h-5 w-5" />}
            titulo="Mapa de Convergencia Tecnológica"
            subtitulo="Cruza tu sector con una tecnología emergente"
            abierta={herramientaAbierta === 'convergencia'}
            onToggle={() => setHerramientaAbierta(herramientaAbierta === 'convergencia' ? null : 'convergencia')}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {TECNOLOGIAS_EMERGENTES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTecnologiaSeleccionada(tecnologiaSeleccionada === t.id ? '' : t.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all border ${
                    tecnologiaSeleccionada === t.id
                      ? 'bg-color-primary/20 border-color-primary/50 text-color-base-content'
                      : 'bg-color-base-content/5 border-color-base-content/10 text-color-base-content/60 hover:border-color-primary/30'
                  }`}
                >
                  <span>{t.icono}</span>
                  <span>{t.nombre}</span>
                </button>
              ))}
            </div>
          </HerramientaAcordeon>

          <HerramientaAcordeon
            icono={<HeartHandshake className="h-5 w-5" />}
            titulo="Brújula de Necesidades Humanas"
            subtitulo="Ancla tu idea en una necesidad humana real"
            abierta={herramientaAbierta === 'necesidades'}
            onToggle={() => setHerramientaAbierta(herramientaAbierta === 'necesidades' ? null : 'necesidades')}
          >
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-color-base-content/70 mb-2">¿Qué necesidad humana busca satisfacer tu idea?</p>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {NECESIDADES_HUMANAS.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => setNecesidadSeleccionada(necesidadSeleccionada === n.id ? '' : n.id)}
                      className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-[11px] font-bold transition-all border ${
                        necesidadSeleccionada === n.id
                          ? 'bg-color-primary/20 border-color-primary/50 text-color-base-content'
                          : 'bg-color-base-content/5 border-color-base-content/10 text-color-base-content/60 hover:border-color-primary/30'
                      }`}
                    >
                      <span className="text-lg">{n.icono}</span>
                      <span>{n.nombre}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-color-base-content/70 mb-2">¿De qué forma se satisface?</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {FORMAS_DE_SATISFACCION.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFormaSeleccionada(formaSeleccionada === f.id ? '' : f.id)}
                      title={f.ayuda}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        formaSeleccionada === f.id
                          ? 'bg-color-primary/20 border-color-primary/50 text-color-base-content'
                          : 'bg-color-base-content/5 border-color-base-content/10 text-color-base-content/60 hover:border-color-primary/30'
                      }`}
                    >
                      {f.nombre}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </HerramientaAcordeon>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400 font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <GlowButton
            onClick={() => generar(false)}
            disabled={!puedeGenerar}
            className="flex-1 h-14 text-xs gap-2"
          >
            {cargando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                GENERANDO IDEAS...
              </>
            ) : (
              <>
                GENERAR IDEAS
                <Lightbulb className="h-4 w-4" />
              </>
            )}
          </GlowButton>

          <GlowButton
            variant="ghost"
            onClick={() => generar(true)}
            disabled={!puedeGenerar || cargandoDocumento}
            className="flex-1 h-14 text-xs gap-2"
          >
            {cargandoDocumento ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                CREANDO DOCUMENTO...
              </>
            ) : (
              <>
                DESCARGAR DOCUMENTO FINAL (PDF)
                <Download className="h-4 w-4" />
              </>
            )}
          </GlowButton>
        </div>

        {documentosRestantes !== null && (
          <p className="text-center text-[11px] text-color-base-content/40 font-medium">
            {documentosRestantes > 0
              ? 'Tienes 1 documento descargable disponible en estos 15 días.'
              : 'Ya usaste tu documento descargable de estos 15 días.'}
          </p>
        )}
      </GlassCard>

      {/* Resultado: ideas */}
      {resultado && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-8 duration-700 print:hidden">
          <div className="text-center">
            <span className="text-[10px] font-black text-color-primary uppercase tracking-[0.4em]">Ideas Generadas para Ti</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resultado.ideas?.map((idea, idx) => (
              <GlassCard key={idx} className="p-6 border-color-base-content/10 bg-color-base-content/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-9 w-9 rounded-xl bg-color-primary/10 flex items-center justify-center text-color-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black text-color-base-content/30">IDEA #{idx + 1}</span>
                </div>
                <h4 className="text-base font-black text-color-base-content uppercase italic tracking-tight mb-2">{idea.titulo}</h4>
                <p className="text-xs text-color-base-content/60 leading-relaxed mb-3">{idea.descripcion}</p>
                <p className="text-[11px] text-color-base-content/50 leading-relaxed mb-3"><strong className="text-color-base-content/70">Por qué funciona:</strong> {idea.porQueFunciona}</p>
                <div className="flex items-start gap-2 text-color-accent-blue pt-2 border-t border-color-base-content/10">
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span className="text-[11px] font-bold">{idea.primerPaso}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Documento final imprimible (solo visible al imprimir / exportar a PDF) */}
      {resultado?.notaConceptoMarkdown && (
        <div className="hidden print:block bg-white text-slate-900 p-10">
          <h1 className="text-2xl font-black mb-6">Documento de Idea de Proyecto</h1>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{resultado.notaConceptoMarkdown}</pre>
        </div>
      )}
    </div>
  )
}

function HerramientaAcordeon({
  icono, titulo, subtitulo, abierta, onToggle, children
}: {
  icono: React.ReactNode
  titulo: string
  subtitulo: string
  abierta: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-color-base-content/10 bg-color-base-content/[0.02] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-color-base-content/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-color-primary/10 flex items-center justify-center text-color-primary shrink-0">
            {icono}
          </div>
          <div>
            <p className="text-sm font-black text-color-base-content">{titulo}</p>
            <p className="text-[11px] text-color-base-content/40">{subtitulo}</p>
          </div>
        </div>
        {abierta ? <ChevronUp className="h-4 w-4 text-color-base-content/40 shrink-0" /> : <ChevronDown className="h-4 w-4 text-color-base-content/40 shrink-0" />}
      </button>
      {abierta && (
        <div className="px-5 pb-5 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  )
}
