'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export function MarcarPagadoButton({ proyectoId }: { proyectoId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (!confirm('¿Confirmas que el pago de este proyecto ya se recibió?')) return
    setLoading(true)
    try {
      const res = await fetch('/api/proyectos/marcar-pagado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proyectoId }),
      })
      if (!res.ok) throw new Error('Error al marcar como pagado')
      router.refresh()
    } catch (err) {
      alert('Hubo un problema, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
    >
      {loading ? 'Guardando...' : 'Marcar como pagado'}
    </button>
  )
}
