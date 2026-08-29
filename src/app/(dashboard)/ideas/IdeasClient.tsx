'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, Loader2, Lightbulb, ArrowRight, Download, ChevronDown, ChevronUp, Compass, Layers, HeartHandshake, Clock } from 'lucide-react'
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

const MAX_TECNOLOGIAS = 2

export default function IdeasClient() {
  const [descripcionIdea, setDescripcionIdea] = useState('')
  const [sectorActual, setSectorActual] = useState('')

  const [herramientaAbierta, setHerramientaAbierta] = useState<Herramienta>(null)

  const [reinvencion, setReinvencion] = useState({ eliminar: '', reducir: '', incrementar: '', crear: '' })
  const [tecnologiasSeleccionadas, setTecnologiasSeleccionadas] = useState<string[]>([])
  const [necesidadSeleccionada, setNecesidadSeleccionada] = useState('')
  const [formaSeleccionada, setFormaSeleccionada] = useState('')

  const [cargando, setCargando] = useState(false)
  const [resultado, setResultado] = useState<IdeasResultado | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [disponible, setDisponible] = useState<boolean | null>(null)
  const [proximaFecha, setProximaFecha] = useState<string | null>(null)
  const [verificando, setVerificando] = useState(true)

  useEffect(() => {
    fetch('/api/ideas/generar')
      .then(res => res.json())
      .then(data => {
        setDisponible(data.disponible ?? true)
        setProximaFecha(data.proximaFechaDisponible || null)
      })
      .catch(() => setDisponible(true))
      .finally(() => setVerificando(false))
  }, [])

  const [pidiendoConfirmacion, setPidiendoConfirmacion] = useState(false)

  const puedeGenerar = descripcionIdea.trim().length >= 3 && !cargando && disponible === true

  const toggleTecnologia = (id: string) => {
    setTecnologiasSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : prev.length < MAX_TECNOLOGIAS ? [...prev, id] : prev
    )
  }

  const generar = async () => {
    if (!puedeGenerar) return
    setPidiendoConfirmacion(false)
    setError(null)
    setCargando(true)

    try {
      const res = await fetch('/api/ideas/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcionIdea,
          sectorActual: sectorActual || undefined,
          matrizReinvencion: Object.values(reinvencion).some(Boolean) ? reinvencion : undefined,
          tecnologiasSeleccionadas: tecnologiasSeleccionadas.length > 0
            ? tecnologiasSeleccionadas.map(id => TECNOLOGIAS_EMERGENTES.find(t => t.id === id)?.nombre || id)
            : undefined,
          necesidadSeleccionada: necesidadSeleccionada
            ? NECESIDADES_HUMANAS.find(n => n.id === necesidadSeleccionada)?.nombre
            : undefined,
          formaSeleccionada: formaSeleccionada
            ? FORMAS_DE_SATISFACCION.find(f => f.id === formaSeleccionada)?.nombre
            : undefined
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Ocurrió un error, intenta de nuevo')
        if (data.proximaFechaDisponible) {
          setDisponible(false)
          setProximaFecha(data.proximaFechaDisponible)
        }
        return
      }

      setResultado(data)
      setDisponible(false)
      setProximaFecha(data.proximaFechaDisponible || null)
      setTimeout(() => window.print(), 400)
    } catch (e: any) {
      setError('No se pudo conectar con el generador de ideas. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  const fechaFormateada = proximaFecha
    ? new Date(proximaFecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })
    : null

  return (
    <div className="max-w-5xl mx-auto w-full space-y-10 py-12 px-6">
      {/* Header */}
      <div className="text-center space-y-4 mb-8 print:hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-color-primary/10 border border-color-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-color-primary">
          <Sparkles className="h-3 w-3" />
          GRATIS — 1 GENERACIÓN CADA 15 DÍAS
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-color-base-content tracking-tight uppercase italic">
          App de <span className="text-color-primary">Ideas</span>
        </h1>
        <p className="text-color-base-content/60 max-w-2xl mx-auto font-medium">
          Cuéntanos tu idea, o cuéntanos que todavía no tienes una. Explora las 3 herramientas para darle a la IA más contexto, y genera tu documento de idea clara y estructurada.
        </p>
      </div>

      {/* Estado de disponibilidad */}
      {!verificando && disponible === false && !resultado && (
        <div className="flex items-center justify-center gap-2 text-sm text-color-base-content/50 font-medium print:hidden">
          <Clock className="h-4 w-4" />
          Ya usaste tu generación de estos 15 días{fechaFormateada ? ` — vuelve a partir del ${fechaFormateada}` : ''}.
        </div>
      )}

      {/* Formulario */}
      <GlassCard className="p-8 border-color-base-content/10 space-y-6 print:hidden">
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-[0.2em] text-color-base-content/60 ml-1">
            Cuéntanos tu idea o tu negocio (o dinos que todavía no tienes una)
          </label>
          <textarea
            value={descripcionIdea}
            onChange={(e) => setDescripcionIdea(e.target.value)}
            placeholder="Ej: Todavía no sé qué negocio montar, pero me interesa la tecnología y el campo... o cuéntanos tu idea ya definida."
            rows={4}
            className="w-full bg-color-base-content/5 border border-color-base-content/10 rounded-2xl px-6 py-4 text-color-base-content focus:outline-none focus:border-color-primary/50 transition-all font-medium placeholder:text-color-base-content/30 resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-[0.2em] text-color-base-content/60 ml-1">
            Sector o industria actual o de interés (opcional)
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
            Herramientas para darle más contexto a la IA (opcional)
          </p>

          <HerramientaAcordeon
            icono={<Compass className="h-5 w-5" />}
            titulo="Matriz de Reinvención"
            subtitulo="Si no sabes qué responder, la IA te propone algo — solo genera tu documento"
            abierta={herramientaAbierta === 'reinvencion'}
            onToggle={() => setHerramientaAbierta(herramientaAbierta === 'reinvencion' ? null : 'reinvencion')}
          >
            <ExplicacionHerramienta
              paraQue="Para mirar tu negocio (o el negocio al que quieres entrar) y decidir qué le sobra, qué le falta y qué nadie más está haciendo. Así no terminas montando lo mismo que el vecino."
              ejemplo={
                <>
                  <strong>Ejemplo — una panadería de barrio:</strong> <em>Eliminar:</em> la vitrina con 40 productos que casi nadie compra.{' '}
                  <em>Reducir:</em> las horas de madrugada. <em>Incrementar:</em> los pedidos por WhatsApp.{' '}
                  <em>Crear:</em> una suscripción mensual de pan fresco a domicilio. Con eso ya no es una panadería más: es otro negocio.
                </>
              }
            />
            <div className="grid md:grid-cols-2 gap-4">
              {PREGUNTAS_REINVENCION.map((p) => (
                <div key={p.id} className="space-y-1.5">
                  <label className="block text-xs font-bold text-color-base-content/70">{p.pregunta}</label>
                  <p className="text-[11px] text-color-base-content/40 mb-1">{p.ayuda}</p>
                  <input
                    type="text"
                    value={(reinvencion as any)[p.id]}
                    onChange={(e) => setReinvencion({ ...reinvencion, [p.id]: e.target.value })}
                    placeholder="Déjalo vacío y la IA te propone algo concreto"
                    className="w-full h-11 bg-color-base-content/5 border border-color-base-content/10 rounded-xl px-4 text-sm text-color-base-content focus:outline-none focus:border-color-primary/50 placeholder:text-color-base-content/25"
                  />
                </div>
              ))}
            </div>
          </HerramientaAcordeon>

          <HerramientaAcordeon
            icono={<Layers className="h-5 w-5" />}
            titulo="Mapa de Convergencia Tecnológica"
            subtitulo="Elige hasta 2 tecnologías para cruzar con tu sector"
            abierta={herramientaAbierta === 'convergencia'}
            onToggle={() => setHerramientaAbierta(herramientaAbierta === 'convergencia' ? null : 'convergencia')}
          >
            <ExplicacionHerramienta
              paraQue="Para cruzar tu sector con una tecnología y encontrar el negocio que todavía nadie montó en tu región. La idea nueva casi nunca está en el sector solo: está en el cruce."
              ejemplo={
                <>
                  <strong>Ejemplo — Agricultura:</strong> Agricultura × <em>Inteligencia Artificial</em> = una app que le dice al campesino
                  cuándo sembrar según el clima de su propia vereda. Agricultura × <em>Impresión 3D</em> = repuestos de maquinaria
                  agrícola impresos en el pueblo, sin esperar meses una importación. Es el mismo sector, dos negocios distintos.
                </>
              }
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {TECNOLOGIAS_EMERGENTES.map((t) => {
                const seleccionada = tecnologiasSeleccionadas.includes(t.id)
                const deshabilitada = !seleccionada && tecnologiasSeleccionadas.length >= MAX_TECNOLOGIAS
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleTecnologia(t.id)}
                    disabled={deshabilitada}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all border ${
                      seleccionada
                        ? 'bg-color-primary/20 border-color-primary/50 text-color-base-content'
                        : deshabilitada
                        ? 'bg-color-base-content/[0.02] border-color-base-content/5 text-color-base-content/20 cursor-not-allowed'
                        : 'bg-color-base-content/5 border-color-base-content/10 text-color-base-content/60 hover:border-color-primary/30'
                    }`}
                  >
                    <span>{t.icono}</span>
                    <span>{t.nombre}</span>
                  </button>
                )
              })}
            </div>
          </HerramientaAcordeon>

          <HerramientaAcordeon
            icono={<HeartHandshake className="h-5 w-5" />}
            titulo="Brújula de Necesidades Humanas"
            subtitulo="De aquí parten tus proyectos: ¿qué necesitan tus clientes?"
            abierta={herramientaAbierta === 'necesidades'}
            onToggle={() => setHerramientaAbierta(herramientaAbierta === 'necesidades' ? null : 'necesidades')}
          >
            <div className="space-y-4">
              <ExplicacionHerramienta
                paraQue="Para anclar tu idea en una necesidad real de la gente. Los proyectos que consiguen financiación no arrancan de un producto, arrancan de una necesidad humana concreta que alguien tiene hoy."
                ejemplo={
                  <>
                    <strong>Ejemplo — la misma idea cambia según lo que elijas:</strong> si eliges <em>Entendimiento + Hacer</em>, tu
                    proyecto no vende un curso: enseña a la gente a hacer algo con sus propias manos. Si eliges{' '}
                    <em>Protección + Tener</em>, tu proyecto le da algo que la resguarda (un ahorro, una vivienda, un seguro).
                    Primero eliges la necesidad, después el negocio.
                  </>
                }
              />
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
                <p className="text-xs font-bold text-color-base-content/70 mb-2">¿Dónde está tu énfasis?</p>
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

        <p className="text-center text-[11px] text-color-base-content/40 font-medium -mb-2">
          Escribir aquí y explorar las herramientas no gasta nada — solo el botón de abajo consume tu única generación de estos 15 días.
        </p>

        {pidiendoConfirmacion ? (
          <div className="space-y-3 p-5 rounded-2xl border border-color-primary/30 bg-color-primary/5">
            <p className="text-sm font-bold text-color-base-content text-center">
              ¿Ya estás conforme con lo que escribiste? Esto va a usar tu única generación de estos 15 días.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <GlowButton
                variant="ghost"
                onClick={() => setPidiendoConfirmacion(false)}
                className="flex-1 h-12 text-xs"
              >
                SEGUIR PENSANDO
              </GlowButton>
              <GlowButton
                onClick={generar}
                className="flex-1 h-12 text-xs gap-2"
              >
                SÍ, GENERAR AHORA
                <Download className="h-4 w-4" />
              </GlowButton>
            </div>
          </div>
        ) : (
        <GlowButton
          onClick={() => setPidiendoConfirmacion(true)}
          disabled={!puedeGenerar}
          className="w-full h-14 text-xs gap-2"
        >
          {cargando ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              GENERANDO TU DOCUMENTO...
            </>
          ) : disponible === false ? (
            <>
              <Clock className="h-4 w-4" />
              DISPONIBLE EL {fechaFormateada?.toUpperCase()}
            </>
          ) : (
            <>
              GENERAR MI DOCUMENTO DE IDEAS
              <Download className="h-4 w-4" />
            </>
          )}
        </GlowButton>
        )}
      </GlassCard>

      {/* Resultado */}
      {resultado && (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-8 duration-700 print:hidden">
          {resultado.sugerenciasReinvencion && (
            <ResultadoSeccion titulo="Ideas para Reinventar tu Negocio">
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries({
                  eliminar: 'Qué eliminar', reducir: 'Qué reducir', incrementar: 'Qué incrementar', crear: 'Qué crear'
                }).map(([key, label]) => (
                  <div key={key} className="p-4 rounded-xl bg-color-base-content/5 border border-color-base-content/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-color-primary mb-1">{label}</p>
                    <p className="text-xs text-color-base-content/70">{(resultado.sugerenciasReinvencion as any)[key]}</p>
                  </div>
                ))}
              </div>
            </ResultadoSeccion>
          )}

          {resultado.notaNecesidades && (
            <ResultadoSeccion titulo="Tu Punto de Partida">
              <p className="text-sm text-color-base-content/70 leading-relaxed">{resultado.notaNecesidades}</p>
            </ResultadoSeccion>
          )}

          {resultado.ideasConvergencia && resultado.ideasConvergencia.length > 0 && (
            <ResultadoSeccion titulo="Ideas de tu Combinación Elegida">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resultado.ideasConvergencia.map((idea, idx) => <IdeaCard key={idx} idea={idea} idx={idx} />)}
              </div>
            </ResultadoSeccion>
          )}

          <ResultadoSeccion titulo="Ideas Generadas para Ti">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resultado.ideas?.map((idea, idx) => <IdeaCard key={idx} idea={idea} idx={idx} />)}
            </div>
          </ResultadoSeccion>
        </div>
      )}

      {/* Documento final imprimible */}
      {resultado?.notaConceptoMarkdown && (
        <div className="hidden print:block bg-white text-slate-900 p-10">
          <h1 className="text-2xl font-black mb-6">Documento de Idea de Proyecto</h1>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{resultado.notaConceptoMarkdown}</pre>
        </div>
      )}
    </div>
  )
}

function ResultadoSeccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <span className="text-[10px] font-black text-color-primary uppercase tracking-[0.4em]">{titulo}</span>
      </div>
      {children}
    </div>
  )
}

function IdeaCard({ idea, idx }: { idea: { titulo: string; descripcion: string; porQueFunciona: string; primerPaso: string }; idx: number }) {
  return (
    <GlassCard className="p-6 border-color-base-content/10 bg-color-base-content/5">
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
  )
}

/**
 * Recuadro de introducción que aparece al abrir cada herramienta: explica en
 * lenguaje simple para qué sirve y muestra un ejemplo concreto de negocio,
 * para que nadie quede perdido viendo solo el título.
 */
function ExplicacionHerramienta({ paraQue, ejemplo }: { paraQue: string; ejemplo: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-2xl border border-color-primary/25 bg-color-primary/[0.06] p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-3.5 w-3.5 text-color-primary shrink-0" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-color-primary">¿Para qué sirve?</p>
      </div>
      <p className="text-xs text-color-base-content/70 leading-relaxed">{paraQue}</p>
      <p className="text-[11px] text-color-base-content/50 leading-relaxed border-t border-color-primary/15 pt-2">
        {ejemplo}
      </p>
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
