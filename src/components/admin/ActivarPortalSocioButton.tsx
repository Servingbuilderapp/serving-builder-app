'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Enciende o apaga el portal propio de un socio de marca blanca.
 * Reemplaza al botón de mantenimiento: marca blanca ya no maneja precios
 * dentro de la plataforma.
 */
export function ActivarPortalSocioButton({ socioId, activo }: { socioId: string; activo: boolean }) {
  const router = useRouter()
  const [guardando, setGuardando] = useState(false)

  const handleClick = async () => {
    setGuardando(true)
    try {
      const res = await fetch('/api/admin/socios/estado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ socioId, activo: !activo }),
      })
      if (!res.ok) throw new Error('Error al cambiar el estado')
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
      {guardando ? 'Guardando...' : activo ? 'Apagar portal' : 'Encender portal'}
    </button>
  )
}
