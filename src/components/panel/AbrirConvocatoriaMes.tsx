'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AbrirConvocatoriaMes({ convocatoriaId, sinCupo }: { convocatoriaId: string; sinCupo: boolean }) {
  const router = useRouter()
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)

  const abrir = async () => {
    setCargando(true)
    setMensaje(null)
    try {
      const res = await fetch('/api/membresias/desbloquear-convocatoria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ convocatoriaId }),
      })
      const datos = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMensaje(datos.error || 'No se pudo abrir. Intenta de nuevo.')
        return
      }
      router.refresh()
    } catch {
      setMensaje('No se pudo abrir. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="mt-3">
      <button
        onClick={abrir}
        disabled={cargando || sinCupo}
        className="rounded-xl bg-[#C9A46B] px-4 py-2 text-[13px] font-bold text-[#3B1727] disabled:opacity-50"
      >
        {cargando ? 'Abriendo...' : sinCupo ? 'Sin cupo este mes' : 'Ver ficha completa (usa 1 del cupo)'}
      </button>
      {mensaje && <p className="mt-2 text-[12.5px] text-[#E0917E]">{mensaje}</p>}
    </div>
  )
}
