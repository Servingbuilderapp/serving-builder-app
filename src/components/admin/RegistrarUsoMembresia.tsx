'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CLAVES_BENEFICIO, ETIQUETA_BENEFICIO, type ClaveBeneficio } from '@/lib/membresias'

export function RegistrarUsoMembresia({ membresiaId }: { membresiaId: string }) {
  const router = useRouter()
  const [beneficio, setBeneficio] = useState<ClaveBeneficio>('nota_concepto')
  const [loading, setLoading] = useState(false)

  const registrar = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/membresias/registrar-uso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membresiaId, beneficio }),
      })
      if (!res.ok) {
        const datos = await res.json().catch(() => ({}))
        alert(datos.error || 'Hubo un problema, intenta de nuevo.')
        return
      }
      router.refresh()
    } catch {
      alert('Hubo un problema, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={beneficio}
        onChange={(e) => setBeneficio(e.target.value as ClaveBeneficio)}
        className="rounded-lg bg-[#4C2032] border border-white/10 px-2 py-1.5 text-xs text-[#F3E7DC]"
      >
        {CLAVES_BENEFICIO.map((c) => (
          <option key={c} value={c}>{ETIQUETA_BENEFICIO[c]}</option>
        ))}
      </select>
      <button
        onClick={registrar}
        disabled={loading}
        className="px-3 py-1.5 rounded-lg bg-[#C9A46B] text-[#3B1727] text-xs font-bold disabled:opacity-50 whitespace-nowrap"
      >
        {loading ? 'Anotando...' : 'Anotar 1 uso'}
      </button>
    </div>
  )
}
