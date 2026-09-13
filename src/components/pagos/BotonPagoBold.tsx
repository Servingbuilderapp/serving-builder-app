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
 * Versión reutilizable del botón de pago de Bold (ver también
 * `src/app/academia/BotonPagoBold.tsx`, la primera versión, que se deja
 * intacta porque ya tiene ventas reales encima).
 *
 * Sirve para cualquier producto: solo hace falta decirle a qué ruta de API
 * pedirle los datos firmados (`endpoint`) y con qué nombre de campo mandar
 * el id de la compra/proyecto/membresía (`campoId`).
 */
export function BotonPagoBold({
  endpoint,
  campoId,
  id,
  texto = 'Pagar con tarjeta, PSE o Nequi',
}: {
  endpoint: string
  campoId: string
  id: string
  texto?: string
}) {
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
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [campoId]: id }),
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
  }, [endpoint, campoId, id])

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
          {texto}
        </button>
      )}
    </div>
  )
}
