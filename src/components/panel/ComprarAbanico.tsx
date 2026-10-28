'use client'

import React, { useState } from 'react'
import { BotonPagoBold } from '@/components/pagos/BotonPagoBold'

/**
 * "Armar mi abanico": el cliente pulsa, se crea su compra y aparece el botón de pago de
 * Bold. Al aprobarse el pago, todo lo demás es automático.
 */
export function ComprarAbanico({
  proyectoId,
  abanicoIdInicial,
}: {
  proyectoId: string
  abanicoIdInicial: string | null
}) {
  const [abanicoId, setAbanicoId] = useState<string | null>(abanicoIdInicial)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const crear = async () => {
    setCargando(true)
    setError(null)
    try {
      const res = await fetch('/api/abanico/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proyectoId }),
      })
      const datos = await res.json()
      if (!res.ok) throw new Error(datos?.error || 'No se pudo preparar tu compra.')
      setAbanicoId(String(datos.abanicoId))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setCargando(false)
    }
  }

  if (abanicoId) {
    return (
      <div className="mt-4">
        <p className="mb-2 text-xs text-[#F3E7DC]/70">
          Al pagar, empezamos a armar tu abanico automáticamente. Te avisamos por correo cuando esté listo.
        </p>
        <BotonPagoBold endpoint="/api/abanico/iniciar-pago" campoId="abanicoId" id={abanicoId} />
      </div>
    )
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={crear}
        disabled={cargando}
        className="rounded-full bg-gradient-to-b from-[#C9A46B] to-[#B08D57] px-6 py-2.5 text-sm font-bold text-[#3A1420] hover:brightness-110 disabled:opacity-50"
      >
        {cargando ? 'Preparando…' : 'Armar mi abanico'}
      </button>
      {error ? <p className="mt-2 text-xs font-bold text-[#E0917E]">{error}</p> : null}
    </div>
  )
}
