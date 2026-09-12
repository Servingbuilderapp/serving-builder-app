'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Menu, NotebookPen, X } from 'lucide-react'
import { GlowButton } from '@/components/ui/GlowButton'
import { cn } from '@/lib/utils'
import type { TemaFormulacion } from '@/lib/academia/academiaContenidoFormulacion'

type Slide = {
  globalIndex: number
  temaIndex: number
  temaTitulo: string
  temaNumero: number
  parteLetra: string
  parteTitulo: string
  titulo: string
  puntos?: string[]
  texto?: string[]
  ejemplo?: string
  checklist?: string[]
}

function construirSlides(temas: TemaFormulacion[]): Slide[] {
  const slides: Slide[] = []
  let globalIndex = 0
  temas.forEach((tema, temaIndex) => {
    tema.partes.forEach((parte) => {
      parte.diapositivas.forEach((d) => {
        slides.push({
          globalIndex,
          temaIndex,
          temaTitulo: tema.titulo,
          temaNumero: tema.numero,
          parteLetra: parte.letra,
          parteTitulo: parte.titulo,
          titulo: d.titulo,
          puntos: d.puntos,
          texto: d.texto,
          ejemplo: d.ejemplo,
          checklist: d.checklist,
        })
        globalIndex++
      })
    })
  })
  return slides
}

export function FormulacionSlidesClient({
  nombreCurso,
  temas,
  notasIniciales,
}: {
  nombreCurso: string
  temas: TemaFormulacion[]
  notasIniciales: Record<number, string>
}) {
  const slides = useMemo(() => construirSlides(temas), [temas])
  const [slideIndex, setSlideIndex] = useState(0)
  const [temasAbiertos, setTemasAbiertos] = useState<Set<number>>(new Set([0]))
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)
  const [notaAbierta, setNotaAbierta] = useState(false)
  const [notas, setNotas] = useState<Record<number, string>>(notasIniciales)
  const [guardando, setGuardando] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const slide = slides[slideIndex]
  const notaActual = notas[slide.globalIndex] || ''

  const irA = (index: number) => {
    setSlideIndex(index)
    setMenuMovilAbierto(false)
    setNotaAbierta(false)
  }

  const toggleTema = (i: number) => {
    setTemasAbiertos((prev) => {
      const nuevo = new Set(prev)
      if (nuevo.has(i)) nuevo.delete(i)
      else nuevo.add(i)
      return nuevo
    })
  }

  const guardarNota = (globalIndex: number, texto: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setGuardando(true)
      try {
        await fetch('/api/academia/notas/guardar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ curso: 'formulacion', diapositiva: globalIndex, nota: texto }),
        })
      } catch {
        // Autoguardado: si falla, se reintenta con el próximo cambio de texto.
      } finally {
        setGuardando(false)
      }
    }, 800)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleNotaChange = (texto: string) => {
    setNotas((prev) => ({ ...prev, [slide.globalIndex]: texto }))
    guardarNota(slide.globalIndex, texto)
  }

  const progreso = ((slideIndex + 1) / slides.length) * 100

  const sidebar = (
    <nav className="space-y-1">
      {temas.map((t, ti) => (
        <div key={t.id}>
          <button
            type="button"
            onClick={() => toggleTema(ti)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-xs font-black uppercase tracking-wider text-color-base-content/70 hover:text-color-base-content"
          >
            <span>Tema {t.numero} · {t.titulo}</span>
            <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 transition-transform', temasAbiertos.has(ti) && 'rotate-180')} />
          </button>
          {temasAbiertos.has(ti) && (
            <ul className="pl-3 pb-2 space-y-0.5">
              {slides.map((s, si) => {
                if (s.temaIndex !== ti) return null
                const activo = si === slideIndex
                return (
                  <li key={si}>
                    <button
                      type="button"
                      onClick={() => irA(si)}
                      className={cn(
                        'w-full text-left px-3 py-1.5 rounded-lg text-[13px] transition-colors',
                        activo
                          ? 'bg-color-primary/15 font-semibold text-color-primary'
                          : 'text-color-base-content/60 hover:bg-color-primary/10 hover:text-color-base-content'
                      )}
                    >
                      {s.parteLetra}) {s.titulo}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen bg-color-base-100">
      <div className="max-w-6xl mx-auto flex gap-6 px-4 py-8">
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-6">
            <p className="px-3 mb-3 text-sm font-black text-color-base-content">{nombreCurso}</p>
            {sidebar}
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="lg:hidden mb-4 flex items-center justify-between">
            <p className="text-sm font-black text-color-base-content">{nombreCurso}</p>
            <button
              type="button"
              onClick={() => setMenuMovilAbierto(true)}
              className="p-2 rounded-lg border border-color-base-300"
              aria-label="Abrir índice"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>

          {menuMovilAbierto && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div className="w-72 h-full bg-color-base-200 p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-black text-color-base-content">{nombreCurso}</p>
                  <button type="button" onClick={() => setMenuMovilAbierto(false)} aria-label="Cerrar índice">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {sidebar}
              </div>
              <button
                type="button"
                aria-label="Cerrar índice"
                onClick={() => setMenuMovilAbierto(false)}
                className="flex-1 bg-black/50"
              />
            </div>
          )}

          <div className="w-full h-1.5 rounded-full bg-color-base-content/10 mb-6 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#C39F68] to-[#A8804B] transition-all"
              style={{ width: `${progreso}%` }}
            />
          </div>

          <div className="glass-card p-6 md:p-10 space-y-6 min-h-[360px]">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-color-primary mb-1">
                Tema {slide.temaNumero} · {slide.temaTitulo} — {slide.parteLetra}) {slide.parteTitulo}
              </p>
              <h1 className="text-xl md:text-2xl font-black text-color-base-content">{slide.titulo}</h1>
            </div>

            {slide.texto?.length ? (
              <div className="space-y-3 text-color-base-content/85 text-[15px] leading-relaxed">
                {slide.texto.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            ) : null}

            {slide.puntos?.length ? (
              <ul className="space-y-2">
                {slide.puntos.map((p, i) => (
                  <li key={i} className="text-sm text-color-base-content/80 flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-color-primary shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            ) : null}

            {slide.ejemplo ? (
              <div className="rounded-xl bg-color-base-content/5 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-color-base-content/60 mb-1">Ejemplo</p>
                <p className="text-sm text-color-base-content/80 leading-relaxed">{slide.ejemplo}</p>
              </div>
            ) : null}

            {slide.checklist?.length ? (
              <div className="rounded-xl border border-color-primary/25 bg-color-primary/5 p-4 space-y-2">
                <p className="text-xs font-black uppercase tracking-widest text-color-primary">Antes de seguir, revisa</p>
                <ul className="space-y-1.5">
                  {slide.checklist.map((item, i) => (
                    <li key={i} className="text-sm text-color-base-content/80 flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-color-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div>
              <button
                type="button"
                onClick={() => setNotaAbierta((v) => !v)}
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-color-primary hover:underline"
              >
                <NotebookPen className="h-3.5 w-3.5" />
                {notaAbierta ? 'Ocultar nota' : notaActual ? 'Ver / editar mi nota' : 'Tomar nota'}
              </button>
              {notaAbierta && (
                <div className="mt-2">
                  <textarea
                    value={notaActual}
                    onChange={(e) => handleNotaChange(e.target.value)}
                    placeholder="Escribe aquí lo que quieras recordar de esta diapositiva..."
                    className="w-full min-h-[100px] p-3 rounded-xl border border-color-base-300 bg-transparent text-sm"
                  />
                  <p className="text-[11px] text-color-base-content/40 mt-1">
                    {guardando ? 'Guardando...' : 'Se guarda sola mientras escribes.'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-color-base-content/10">
              <GlowButton
                type="button"
                variant="ghost"
                onClick={() => irA(Math.max(0, slideIndex - 1))}
                disabled={slideIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" /> Anterior
              </GlowButton>
              <span className="text-xs text-color-base-content/50">
                {slideIndex + 1} / {slides.length}
              </span>
              <GlowButton
                type="button"
                onClick={() => irA(Math.min(slides.length - 1, slideIndex + 1))}
                disabled={slideIndex === slides.length - 1}
              >
                Siguiente <ChevronRight className="h-4 w-4" />
              </GlowButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
