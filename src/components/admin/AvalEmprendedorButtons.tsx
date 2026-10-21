'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AvalEmprendedorButtons({ proyectoId }: { proyectoId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const decidir = async (decision: 'aprobar' | 'rechazar') => {
    const pregunta =
      decision === 'aprobar'
        ? '¿Apruebas esta solicitud? Se le habilita el pago al cliente.'
        : '¿Rechazas esta solicitud? El cliente no podrá pagar este plan.'
    if (!confirm(pregunta)) return
    setLoading(true)
    try {
      const res = await fetch('/api/proyectos/aval-emprendedor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proyectoId, decision }),
      })
      if (!res.ok) throw new Error('Error')
      router.refresh()
    } catch {
      alert('Hubo un problema, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-1.5">
      <button
        onClick={() => decidir('aprobar')}
        disabled={loading}
        className="px-3 py-1.5 rounded-lg bg-[#7A8B6F] text-[#1C2417] text-xs font-bold hover:bg-[#5F6E56] disabled:opacity-50"
      >
        Aprobar aval
      </button>
      <button
        onClick={() => decidir('rechazar')}
        disabled={loading}
        className="px-3 py-1.5 rounded-lg bg-color-base-content/10 text-color-base-content/70 text-xs font-bold hover:bg-color-base-content/20 disabled:opacity-50"
      >
        Rechazar
      </button>
    </div>
  )
}
