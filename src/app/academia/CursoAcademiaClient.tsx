'use client'

import React, { useMemo, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react'
import { GlowButton } from '@/components/ui/GlowButton'
import { cn } from '@/lib/utils'
import type { Bloque } from '@/lib/academia/academiaContenido'

type Pagina = {
  bloqueIndex: number
  bloqueTitulo: string
  tipo: 'intro' | 'unidad' | 'casos' | 'errores' | 'recomendaciones' | 'autoevaluacion' | 'puntosClave' | 'glosario'
  titulo: string
  unidadIndex?: number
}

function construirPaginas(bloques: Bloque[]): Pagina[] {
  const paginas: Pagina[] = []
  bloques.forEach((bloque, bloqueIndex) => {
    paginas.push({ bloqueIndex, bloqueTitulo: bloque.titulo, tipo: 'intro', titulo: 'Introducción' })
    bloque.unidades.forEach((unidad, unidadIndex) => {
      paginas.push({
        bloqueIndex,
        bloqueTitulo: bloque.titulo,
        tipo: 'unidad',
        titulo: `${unidad.numero} ${unidad.titulo}`,
        unidadIndex,
      })
    })
    if (bloque.casosDeEstudio?.length) {
      paginas.push({ bloqueIndex, bloqueTitulo: bloque.titulo, tipo: 'casos', titulo: 'Casos de estudio' })
    }
    if (bloque.erroresComunes) {
      paginas.push({ bloqueIndex, bloqueTitulo: bloque.titulo, tipo: 'errores', titulo: bloque.erroresComunes.titulo })
    }
    if (bloque.recomendaciones?.length || bloque.cierre?.length) {
      paginas.push({ bloqueIndex, bloqueTitulo: bloque.titulo, tipo: 'recomendaciones', titulo: 'Recomendaciones y cierre' })
    }
    if (bloque.autoevaluacion?.length) {
      paginas.push({ bloqueIndex, bloqueTitulo: bloque.titulo, tipo: 'autoevaluacion', titulo: 'Autoevaluación' })
    }
    if (bloque.puntosClave?.length) {
      paginas.push({ bloqueIndex, bloqueTitulo: bloque.titulo, tipo: 'puntosClave', titulo: 'Puntos clave' })
    }
    if (bloque.glosario?.length) {
      paginas.push({ bloqueIndex, bloqueTitulo: bloque.titulo, tipo: 'glosario', titulo: 'Glosario' })
    }
  })
  return paginas
}

export function CursoAcademiaClient({ nombreCurso, bloques }: { nombreCurso: string; bloques: Bloque[] }) {
  const paginas = useMemo(() => construirPaginas(bloques), [bloques])
  const [paginaIndex, setPaginaIndex] = useState(0)
  const [bloquesAbiertos, setBloquesAbiertos] = useState<Set<number>>(new Set([0]))
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)

  const pagina = paginas[paginaIndex]
  const bloque = bloques[pagina.bloqueIndex]

  const irA = (index: number) => {
    setPaginaIndex(index)
    setMenuMovilAbierto(false)
  }

  const toggleBloque = (i: number) => {
    setBloquesAbiertos((prev) => {
      const nuevo = new Set(prev)
      if (nuevo.has(i)) nuevo.delete(i)
      else nuevo.add(i)
      return nuevo
    })
  }

  const sidebar = (
    <nav className="space-y-1">
      {bloques.map((b, bi) => (
        <div key={b.id}>
          <button
            type="button"
            onClick={() => toggleBloque(bi)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-xs font-black uppercase tracking-wider text-color-base-content/70 hover:text-color-base-content"
          >
            <span>Bloque {b.numero} · {b.titulo}</span>
            <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 transition-transform', bloquesAbiertos.has(bi) && 'rotate-180')} />
          </button>
          {bloquesAbiertos.has(bi) && (
            <ul className="pl-3 pb-2 space-y-0.5">
              {paginas.map((p, pi) => {
                if (p.bloqueIndex !== bi) return null
                const activo = pi === paginaIndex
                return (
                  <li key={pi}>
                    <button
                      type="button"
                      onClick={() => irA(pi)}
                      className={cn(
                        'w-full text-left px-3 py-1.5 rounded-lg text-[13px] transition-colors',
                        activo
                          ? 'bg-color-primary/15 font-semibold text-color-primary'
                          : 'text-color-base-content/60 hover:bg-color-primary/10 hover:text-color-base-content'
                      )}
                    >
                      {p.titulo}
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

          <div className="glass-card p-6 md:p-9 space-y-6">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-color-primary mb-1">
                Bloque {bloque.numero} · {bloque.titulo}
              </p>
              <h1 className="text-xl md:text-2xl font-black text-color-base-content">{pagina.titulo}</h1>
              {pagina.tipo === 'intro' && bloque.subtitulo && (
                <p className="text-color-base-content/60 text-sm mt-1">{bloque.subtitulo}</p>
              )}
            </div>

            <ContenidoPagina pagina={pagina} bloque={bloque} />

            <div className="flex items-center justify-between pt-4 border-t border-color-base-content/10">
              <GlowButton
                type="button"
                variant="ghost"
                onClick={() => irA(Math.max(0, paginaIndex - 1))}
                disabled={paginaIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" /> Anterior
              </GlowButton>
              <span className="text-xs text-color-base-content/50">
                {paginaIndex + 1} / {paginas.length}
              </span>
              <GlowButton
                type="button"
                onClick={() => irA(Math.min(paginas.length - 1, paginaIndex + 1))}
                disabled={paginaIndex === paginas.length - 1}
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

function ContenidoPagina({ pagina, bloque }: { pagina: Pagina; bloque: Bloque }) {
  if (pagina.tipo === 'intro') {
    return (
      <div className="space-y-3 text-color-base-content/85 text-[15px] leading-relaxed">
        {bloque.introduccion.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    )
  }

  if (pagina.tipo === 'unidad' && pagina.unidadIndex !== undefined) {
    const unidad = bloque.unidades[pagina.unidadIndex]
    return (
      <div className="space-y-5">
        <div className="space-y-3 text-color-base-content/85 text-[15px] leading-relaxed">
          {unidad.parrafos.map((p, i) => <p key={i}>{p}</p>)}
        </div>

        {unidad.subtemas?.map((sub, i) => (
          <div key={i} className="space-y-2">
            <h3 className="text-sm font-black text-color-base-content">{sub.titulo}</h3>
            <div className="space-y-2 text-color-base-content/80 text-sm leading-relaxed">
              {sub.parrafos.map((p, j) => <p key={j}>{p}</p>)}
            </div>
            {sub.lista?.length ? (
              <ul className="list-disc pl-5 space-y-1 text-sm text-color-base-content/80">
                {sub.lista.map((item, j) => <li key={j}>{item}</li>)}
              </ul>
            ) : null}
          </div>
        ))}

        {unidad.checklist && (
          <div className="rounded-xl border border-color-primary/25 bg-color-primary/5 p-4 space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-color-primary">{unidad.checklist.titulo}</p>
            <ul className="space-y-1.5">
              {unidad.checklist.items.map((item, i) => (
                <li key={i} className="text-sm text-color-base-content/80 flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-color-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {unidad.preguntas?.length ? (
          <div className="rounded-xl bg-color-base-content/5 p-4 space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-color-base-content/60">Preguntas de reflexión</p>
            <ul className="space-y-1.5">
              {unidad.preguntas.map((p, i) => (
                <li key={i} className="text-sm text-color-base-content/80">{p}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    )
  }

  if (pagina.tipo === 'casos') {
    return (
      <div className="space-y-6">
        {bloque.casosDeEstudio?.map((caso, i) => (
          <div key={i} className="space-y-2">
            <h3 className="text-sm font-black text-color-base-content">{caso.titulo}</h3>
            <div className="space-y-2 text-color-base-content/80 text-sm leading-relaxed">
              {caso.parrafos.map((p, j) => <p key={j}>{p}</p>)}
            </div>
            {caso.preguntas?.length ? (
              <ul className="list-disc pl-5 space-y-1 text-sm text-color-base-content/80">
                {caso.preguntas.map((p, j) => <li key={j}>{p}</li>)}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    )
  }

  if (pagina.tipo === 'errores' && bloque.erroresComunes) {
    return (
      <ul className="space-y-2">
        {bloque.erroresComunes.items.map((item, i) => (
          <li key={i} className="text-sm text-color-base-content/80 flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#C0604A] shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    )
  }

  if (pagina.tipo === 'recomendaciones') {
    return (
      <div className="space-y-5">
        {bloque.recomendaciones?.length ? (
          <ul className="space-y-1.5">
            {bloque.recomendaciones.map((r, i) => (
              <li key={i} className="text-sm text-color-base-content/80 flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-color-primary shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        ) : null}
        {bloque.cierre?.length ? (
          <div className="space-y-2 text-color-base-content/85 text-[15px] leading-relaxed italic">
            {bloque.cierre.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        ) : null}
      </div>
    )
  }

  if (pagina.tipo === 'autoevaluacion') {
    return (
      <ul className="space-y-2">
        {bloque.autoevaluacion?.map((p, i) => (
          <li key={i} className="text-sm text-color-base-content/80 flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-color-primary shrink-0" />
            {p}
          </li>
        ))}
      </ul>
    )
  }

  if (pagina.tipo === 'puntosClave') {
    return (
      <ul className="space-y-2">
        {bloque.puntosClave.map((p, i) => (
          <li key={i} className="text-sm text-color-base-content/80 flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-color-primary shrink-0" />
            {p}
          </li>
        ))}
      </ul>
    )
  }

  if (pagina.tipo === 'glosario') {
    return (
      <dl className="space-y-3">
        {bloque.glosario.map((g, i) => (
          <div key={i}>
            <dt className="text-sm font-black text-color-base-content">{g.termino}</dt>
            <dd className="text-sm text-color-base-content/75 leading-relaxed">{g.definicion}</dd>
          </div>
        ))}
      </dl>
    )
  }

  return null
}
