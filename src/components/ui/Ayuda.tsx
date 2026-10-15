'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '@/context/LanguageContext'
import { AYUDAS } from '@/lib/ayudas'

/**
 * Ayuda emergente, discreta: un «?» pequeño junto al título; al pasar el cursor
 * (o tocarlo en el celular) aparece una nota breve con el texto de src/lib/ayudas.ts.
 *
 * modo 'icono'   : muestra el «?» junto al contenido (sirve en celular).
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
  /** true: el «?» se dibuja para fondos claros; false: para fondos oscuros. */
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
    const ancho = 272
    const x = Math.min(Math.max(8, r.left + r.width / 2 - ancho / 2), window.innerWidth - ancho - 8)
    const abajo = window.innerHeight - r.bottom
    const arriba = abajo < 190 && r.top > abajo
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

  const panel = abierta
    ? createPortal(
        <div
          role="tooltip"
          style={{
            position: 'fixed',
            left: pos.x,
            top: pos.y,
            width: 272,
            transform: pos.arriba ? 'translateY(-100%)' : undefined,
            zIndex: 9999,
          }}
          className="pointer-events-none rounded-xl border border-[#C9A46B]/45 bg-[#2E101D]/95 px-4 py-3 text-left text-[12.5px] font-normal normal-case leading-relaxed tracking-normal text-[#F3E7DC]/90 shadow-[0_14px_34px_-12px_rgba(0,0,0,0.65)] backdrop-blur-sm"
        >
          <span aria-hidden className="mb-2 block h-px w-8 bg-[#C9A46B]/70" />
          {texto}
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
        className={`inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold leading-none opacity-70 transition hover:opacity-100 ${
          claro
            ? 'border-[#8A5A2B]/50 text-[#6B3A1F]'
            : 'border-[#C9A46B]/60 text-[#E0B868]'
        }`}
      >
        ?
      </button>
      {panel}
    </span>
  )
}
