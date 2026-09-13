'use client'

import React, { useEffect, useRef, useState } from 'react'

type DatosBoton = {
  apiKey: string
  orderId: string
  amount: number
  currency: 'COP' | 'USD'
  integritySignature: string
  description: string
  redirectionUrl: string
}

/**
 * Botón de pago de Bold (cobro automático con tarjeta, PSE, Nequi, etc.).
 *
 * El botón de Bold no es un componente de React normal: es un <script> con
 * atributos data-* que su librería reemplaza por un botón de verdad, en el
 * lugar exacto donde está ese script en la página. La librería de Bold ya
 * se carga una sola vez para todo el sitio desde `layout.tsx` — aquí solo
 * se arma el <script> con los datos de ESTA compra en particular.
 */
export function BotonPagoBold({ compraId }: { compraId: string }) {
  const contenedorRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let cancelado = false

    async function cargarBoton() {
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
        if (cancelado || !contenedorRef.current) return

        contenedorRef.current.innerHTML = ''

        const boton = document.createElement('script')
        boton.setAttribute('data-bold-button', 'dark-L')
        boton.setAttribute('data-api-key', datos.apiKey)
        boton.setAttribute('data-order-id', datos.orderId)
        boton.setAttribute('data-currency', datos.currency)
        boton.setAttribute('data-amount', String(datos.amount))
        boton.setAttribute('data-integrity-signature', datos.integritySignature)
        boton.setAttribute('data-description', datos.description)
        boton.setAttribute('data-redirection-url', datos.redirectionUrl)
        boton.setAttribute('data-render-mode', 'embedded')

        contenedorRef.current.appendChild(boton)
      } catch (err) {
        if (!cancelado) setError(err instanceof Error ? err.message : 'No se pudo preparar el pago con Bold')
      } finally {
        if (!cancelado) setCargando(false)
      }
    }

    cargarBoton()
    return () => {
      cancelado = true
    }
  }, [compraId])

  return (
    <div>
      {cargando && <p className="text-xs text-color-base-content/50">Preparando el botón de pago...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div ref={contenedorRef} />
    </div>
  )
}
