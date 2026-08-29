'use client'

import { useEffect, useRef, useState } from 'react'
import { Globe, Check } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { IDIOMAS_DISPONIBLES } from '@/context/LanguageContext'
import { cn } from '@/lib/utils'

/**
 * Selector de idioma. Muestra los 9 idiomas que realmente tiene la
 * plataforma (antes solo ofrecía ES/EN, aunque los 9 diccionarios ya
 * estaban cargados, y por eso el resto quedaba inalcanzable).
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useTranslation()
  const [abierto, setAbierto] = useState(false)
  const contenedorRef = useRef<HTMLDivElement>(null)

  // Cerrar al hacer clic fuera o al presionar Escape
  useEffect(() => {
    if (!abierto) return

    const alClicFuera = (e: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false)
      }
    }
    const alEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false)
    }

    document.addEventListener('mousedown', alClicFuera)
    document.addEventListener('keydown', alEscape)
    return () => {
      document.removeEventListener('mousedown', alClicFuera)
      document.removeEventListener('keydown', alEscape)
    }
  }, [abierto])

  return (
    <div ref={contenedorRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-color-base-content/15 text-color-base-content/70 hover:text-color-base-content hover:border-color-base-content/30 transition-colors"
      >
        <Globe className="h-3.5 w-3.5" />
        <span className="text-xs font-bold uppercase tracking-wider">{language}</span>
      </button>

      {abierto && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-44 max-h-80 overflow-y-auto rounded-2xl border border-color-base-content/15 bg-color-base-100 shadow-2xl py-1.5 z-50"
        >
          {IDIOMAS_DISPONIBLES.map((idioma) => {
            const activo = idioma.codigo === language
            return (
              <button
                key={idioma.codigo}
                type="button"
                role="option"
                aria-selected={activo}
                onClick={() => {
                  setLanguage(idioma.codigo)
                  setAbierto(false)
                }}
                className={cn(
                  'w-full flex items-center justify-between gap-3 px-4 py-2 text-left text-sm transition-colors',
                  activo
                    ? 'text-color-primary font-bold'
                    : 'text-color-base-content/70 hover:text-color-base-content hover:bg-color-base-content/5'
                )}
              >
                <span>{idioma.nombre}</span>
                {activo ? (
                  <Check className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-color-base-content/30 shrink-0">
                    {idioma.codigo}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default LanguageSwitcher
