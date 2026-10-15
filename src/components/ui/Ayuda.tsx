'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '@/context/LanguageContext'
import { AYUDAS } from '@/lib/ayudas'

/**
 * Ayuda emergente: al pasar el cursor (o tocar el "?") se explica qué es,
 * para quién sirve y qué se obtiene. Los textos viven en src/lib/ayudas.ts.
 *
 * modo 'icono'  : muestra un pequeño "?" junto al contenido (sirve en celular).
 * modo 'envolver': el propio contenido despierta la ayuda al pasar el cursor
 *                  (se usa en el menú, donde tocar ya significa navegar).
 */
export function Ayuda({
  clave,
  children,
  modo = 'icono',
  claro = true,
  className = '',
}: {
  clave: string
  children?: React.ReactNode
  modo?: 'icono' | 'envolver'
  /** true: el "?" se dibuja para fondos claros; false: para fondos oscuros. */
  claro?: boolean
  className?: string
}) {
  const { language } = useLanguage()
  const ayuda = AYUDAS[clave]
  const [abierta, setAbierta] = useState(false)
  const [pos, setPos] = useState<{ x: number; y: number; arriba: boolean }>({ x: 0, y: 0, arriba: false })
  const ancla = useRef<HTMLSpanElement>(null)

  const calcular = useCallback(() => {
    const el = ancla.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const ancho = 320
    const x = Math.min(Math.max(8, r.left + r.width / 2 - ancho / 2), window.innerWidth - ancho - 8)
    const abajo = window.innerHeight - r.bottom
    const arriba = abajo < 420 && r.top > abajo
    setPos({ x, y: arriba ? r.top - 8 : r.bottom + 8, arriba })
  }, [])

  const abrir = useCallback(() => {
    calcular()
    setAbierta(true)
  }, [calcular])
  const cerrar = useCallback(() => setAbierta(false), [])

  useEffect(() => {
    if (!abierta) return
    const alTecla = (e: KeyboardEvent) => e.key === 'Escape' && setAbierta(false)
    const alDesplazar = () => setAbierta(false)
    const alTocarFuera = (e: Event) => {
      if (ancla.current && !ancla.current.contains(e.target as Node)) setAbierta(false)
    }
    window.addEventListener('keydown', alTecla)
    window.addEventListener('scroll', alDesplazar, true)
    document.addEventListener('pointerdown', alTocarFuera)
    return () => {
      window.removeEventListener('keydown', alTecla)
      window.removeEventListener('scroll', alDesplazar, true)
      document.removeEventListener('pointerdown', alTocarFuera)
    }
  }, [abierta])

  if (!ayuda) return <>{children}</>
  const texto = language === 'es' ? ayuda.es : ayuda.en
  const en = language !== 'es'
  const etiquetas = en
    ? { a: 'What it is', b: 'Who it is for', c: 'What you get' }
    : { a: 'Qué es', b: 'Para quién sirve', c: 'Qué obtienes' }

  const panel =
    abierta
      ? createPortal(
          <div
            role="tooltip"
            style={{
              position: 'fixed',
              left: pos.x,
              top: pos.y,
              width: 320,
              transform: pos.arriba ? 'translateY(-100%)' : undefined,
              zIndex: 9999,
            }}
            className="pointer-events-none rounded-2xl border border-[#C9A46B]/60 bg-[#FBF5EE] p-4 text-left text-[13px] leading-relaxed text-[#3B1727] shadow-[0_2px_4px_rgba(20,5,10,0.25),0_18px_40px_-12px_rgba(20,5,10,0.55)]"
          >
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A5A2B]">{etiquetas.a}</p>
            <p className="mb-2">{texto.queEs}</p>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A5A2B]">{etiquetas.b}</p>
            <p className="mb-2">{texto.paraQuien}</p>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A5A2B]">{etiquetas.c}</p>
            <p>{texto.queObtienes}</p>
          </div>,
          document.body,
        )
      : null

  if (modo === 'envolver') {
    return (
      <span
        ref={ancla}
        className={`block ${className}`}
        onMouseEnter={abrir}
        onMouseLeave={cerrar}
        onFocus={abrir}
        onBlur={cerrar}
      >
        {children}
        {panel}
      </span>
    )
  }

  return (
    <span ref={ancla} className={`inline-flex items-center gap-1.5 ${className}`}>
      {children}
      <button
        type="button"
        aria-label={en ? 'More information' : 'Más información'}
        onMouseEnter={abrir}
        onMouseLeave={cerrar}
        onFocus={abrir}
        onBlur={cerrar}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (abierta) cerrar()
          else abrir()
        }}
        className={`inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border text-[11px] font-extrabold leading-none shadow-[0_1px_2px_rgba(20,5,10,0.3)] ${
          claro
            ? 'border-[#8A5A2B]/60 bg-[#F3E7DC] text-[#6B3A1F]'
            : 'border-[#C9A46B]/70 bg-[#C9A46B]/20 text-[#E0B868]'
        }`}
      >
        ?
      </button>
      {panel}
    </span>
  )
}
