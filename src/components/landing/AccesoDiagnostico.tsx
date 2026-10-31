'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'

/**
 * Los botones del website que llevan "por dentro" (membresías, Academia, estructuración,
 * planes) se habilitan después de hacer el diagnóstico gratuito (decisión del dueño,
 * 30 oct 2026). La información sigue a la vista: solo el botón queda apagado, con el aviso
 * "Se habilitará después de tu diagnóstico".
 *
 * Quedan habilitados para: quien ya inició sesión y quien terminó un diagnóstico en este
 * navegador (se recuerda con una marca local). No es un candado de seguridad: sirve para
 * guiar al visitante, no para esconder información.
 */

const CLAVE = 'diagnostico_hecho'
const EVENTO = 'diagnostico-hecho'

function leerMarca(): boolean {
  try {
    return window.localStorage.getItem(CLAVE) === '1'
  } catch {
    return false
  }
}

/** Se llama cuando el cliente ve el resultado completo de su diagnóstico. */
export function marcarDiagnosticoHecho() {
  try {
    window.localStorage.setItem(CLAVE, '1')
    window.dispatchEvent(new Event(EVENTO))
  } catch {
    /* sin almacenamiento local: el botón seguirá apagado en este navegador */
  }
}

const AccesoContexto = createContext(false)

export function ProveedorAcceso({ user, children }: { user: unknown; children: React.ReactNode }) {
  const [hecho, setHecho] = useState(false)

  useEffect(() => {
    const actualizar = () => setHecho(leerMarca())
    actualizar()
    window.addEventListener('storage', actualizar)
    window.addEventListener(EVENTO, actualizar)
    return () => {
      window.removeEventListener('storage', actualizar)
      window.removeEventListener(EVENTO, actualizar)
    }
  }, [])

  return <AccesoContexto.Provider value={Boolean(user) || hecho}>{children}</AccesoContexto.Provider>
}

/**
 * Enlace con aspecto de botón. Si todavía no se habilitó, se ve apagado, no se puede
 * pulsar y muestra el aviso debajo. `siempre` lo deja habilitado (por ejemplo, el propio
 * diagnóstico).
 */
export function EnlaceConAcceso({
  href,
  className,
  children,
  siempre = false,
  avisoClase = 'text-[#F3E7DC]/70',
}: {
  href: string
  className: string
  children: React.ReactNode
  siempre?: boolean
  avisoClase?: string
}) {
  const habilitado = useContext(AccesoContexto)
  const { t } = useTranslation()

  if (habilitado || siempre) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    )
  }

  return (
    <div className="flex flex-col items-stretch gap-1.5">
      <span role="link" aria-disabled="true" className={`${className} opacity-50 pointer-events-none select-none`}>
        {children}
      </span>
      <span className={`text-[11px] text-center leading-snug ${avisoClase}`}>{t('w.acceso.aviso')}</span>
    </div>
  )
}
