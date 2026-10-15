'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AceptarCortesia() {
  const router = useRouter()
  const [marcado, setMarcado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  async function aceptar() {
    setEnviando(true)
    setError('')
    try {
      const res = await fetch('/api/cortesia/aceptar', { method: 'POST' })
      const datos = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(datos?.error || 'No se pudo guardar.')
      router.push('/pendientes')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar.')
      setEnviando(false)
    }
  }

  return (
    <div className="mt-5 space-y-3">
      <label className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-[#F3E7DC]">
        <input type="checkbox" checked={marcado} onChange={(e) => setMarcado(e.target.checked)} className="mt-1 h-4 w-4 accent-[#C9A46B]" />
        He leído y acepto estas condiciones.
      </label>
      {error && <p className="text-[13px] font-semibold text-[#F0A8A8]">{error}</p>}
      <button
        type="button"
        disabled={!marcado || enviando}
        onClick={aceptar}
        className="rounded-xl bg-[#C9A46B] px-5 py-2.5 text-[14px] font-bold text-[#3B1727] shadow-[0_1px_2px_rgba(20,5,10,0.4)] disabled:opacity-50"
      >
        {enviando ? 'Guardando…' : 'Aceptar y empezar'}
      </button>
    </div>
  )
}
