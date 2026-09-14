'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Botón para pasar un proyecto de canal 'directo' a 'marca_blanca' o al
 * revés. Vive en /admin/proyectos, junto a los demás botones de cada fila.
 */
export function MarcarCanalButton({
  proyectoId,
  canalActual,
}: {
  proyectoId: string
  canalActual: 'directo' | 'marca_blanca'
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const esMarcaBlanca = canalActual === 'marca_blanca'
  const nuevoCanal = esMarcaBlanca ? 'directo' : 'marca_blanca'

  const handleClick = async () => {
    const pregunta = esMarcaBlanca
      ? '¿Quitar este proyecto del canal de marca blanca?'
      : '¿Marcar este proyecto como canal de marca blanca?'
    if (!confirm(pregunta)) return
    setLoading(true)
    try {
      const res = await fetch('/api/proyectos/marcar-canal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proyectoId, canal: nuevoCanal }),
      })
      if (!res.ok) throw new Error('Error al actualizar el canal')
      router.refresh()
    } catch {
      alert('Hubo un problema, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={
        esMarcaBlanca
          ? 'px-3 py-1.5 rounded-full bg-color-base-content/10 text-color-base-content/70 text-xs font-bold hover:bg-color-base-content/20 disabled:opacity-50 whitespace-nowrap'
          : 'px-3 py-1.5 rounded-full bg-color-primary/10 text-color-primary text-xs font-bold hover:bg-color-primary/20 disabled:opacity-50 whitespace-nowrap'
      }
    >
      {loading ? 'Guardando...' : esMarcaBlanca ? 'Quitar de marca blanca' : 'Marcar como marca blanca'}
    </button>
  )
}
