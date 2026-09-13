'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

type DatosBoton = {
  apiKey: string
  orderId: string
  amount: number
  currency: 'COP' | 'USD'
  integritySignature: string
  description: string
  redirectionUrl: string
}

type BoldCheckoutInstance = {
  open: () => void
}

declare global {
  interface Window {
    BoldCheckout?: new (config: {
      orderId: string
      currency: string
      amount: string
      apiKey: string
      integritySignature: string
      description: string
      redirectionUrl: string
      renderMode?: string
    }) => BoldCheckoutInstance
  }
}

/**
 * Botón de pago de Bold (cobro automático con tarjeta, PSE, Nequi, etc.).
 *
 * OJO: la primera versión de este archivo insertaba un <script
 * data-bold-button> por JavaScript, esperando que la librería de Bold
 * (cargada una sola vez en `layout.tsx`) lo detectara solo. Eso NO
 * funciona: la librería solo escanea la página al cargar, y este botón se
 * arma varios segundos después (cuando termina de responder
 * /api/academia/bold/iniciar) — por eso nunca aparecía nada.
 *
 * La forma correcta, según la documentación de Bold para integraciones
 * dinámicas/personalizadas, es usar la función `new BoldCheckout({...})`
 * que la misma librería deja disponible en `window`, y llamar a
 * `checkout.open()` desde un botón normal de React cuando la persona le
 * da clic. `renderMode: 'embedded'` hace que el pago se abra en una
 * ventana encima del sitio, sin sacar a la persona de la página.
 */
export function BotonPagoBold({ compraId }: { compraId: string }) {
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)
  const [listo, setListo] = useState(false)
  const checkoutRef = useRef<BoldCheckoutInstance | null>(null)

  useEffect(() => {
    let cancelado = false

    async function prepararCheckout() {
      setCargando(true)
      setError('')
      try {
        const res = await fetch('/api/academia/bold/iniciar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ compraId }),
        })
        const datos: DatosBoton & { error?: string } = await res.json()
        if (!res.ok) throw new Error(datos.error || 'No se pudo preparar el pago con Bold')

        // La librería de Bold (el <script> de layout.tsx) puede tardar un
        // instante en dejar lista la función `BoldCheckout` en window.
        let intentos = 0
        while (!window.BoldCheckout && intentos < 40 && !cancelado) {
          await new Promise((resolve) => setTimeout(resolve, 250))
          intentos++
        }
        if (cancelado) return
        if (!window.BoldCheckout) {
          throw new Error('No se pudo cargar el botón de Bold. Recarga la página e intenta de nuevo.')
        }

        checkoutRef.current = new window.BoldCheckout({
          orderId: datos.orderId,
          currency: datos.currency,
          amount: String(datos.amount),
          apiKey: datos.apiKey,
          integritySignature: datos.integritySignature,
          description: datos.description,
          redirectionUrl: datos.redirectionUrl,
          renderMode: 'embedded',
        })
        setListo(true)
      } catch (err) {
        if (!cancelado) setError(err instanceof Error ? err.message : 'No se pudo preparar el pago con Bold')
      } finally {
        if (!cancelado) setCargando(false)
      }
    }

    prepararCheckout()
    return () => {
      cancelado = true
    }
  }, [compraId])

  return (
    <div>
      {cargando && (
        <p className="text-xs text-color-base-content/50 flex items-center gap-1.5">
          <Loader2 className="h-3 w-3 animate-spin" /> Preparando el botón de pago...
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {listo && (
        <button
          type="button"
          onClick={() => checkoutRef.current?.open()}
          className="w-full rounded-xl px-6 py-3 font-bold text-sm bg-[#111111] text-white hover:bg-black transition-colors"
        >
          Pagar con tarjeta, PSE o Nequi
        </button>
      )}
    </div>
  )
}
