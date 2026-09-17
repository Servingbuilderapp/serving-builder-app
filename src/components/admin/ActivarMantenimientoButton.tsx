'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Marca que un socio ya pagó su mantenimiento del mes. Extiende su fecha
 * 30 días (desde hoy o desde la fecha que ya tenía, la que sea más
 * adelante) — es lo que mantiene su enlace propio funcionando.
 */
export function ActivarMantenimientoButton({ socioId }: { socioId: string }) {
  const router = useRouter()
  const [guardando, setGuardando] = useState(false)

  const handleClick = async () => {
    setGuardando(true)
    try {
      const res = await fetch('/api/admin/socios/activar-mantenimiento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ socioId }),
      })
      if (!res.ok) throw new Error('Error al activar')
      router.refresh()
    } catch {
      alert('Hubo un problema, intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={guardando}
      className="px-3 py-1.5 rounded-full bg-color-primary/10 text-color-primary text-xs font-bold hover:bg-color-primary/20 disabled:opacity-50 whitespace-nowrap"
    >
      {guardando ? 'Guardando...' : '+ 30 días de mantenimiento'}
    </button>
  )
}
