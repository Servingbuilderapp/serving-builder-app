'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TEXTO_LEGAL_CORTESIA } from '@/lib/textoContrato'

export function AceptarCortesia() {
  const router = useRouter()
  const [marcado, setMarcado] = useState(false)
  const [autorizaDatos, setAutorizaDatos] = useState(false)
  const [textoLeido, setTextoLeido] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  async function aceptar() {
    setEnviando(true)
    setError('')
    try {
      const res = await fetch('/api/cortesia/aceptar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autorizaDatos }),
      })
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
      <div className="space-y-2 rounded-xl border border-[#B08D57]/35 bg-[#3B1727] p-3">
        <p className="text-[12px] font-extrabold uppercase tracking-wider text-[#E0B868]">
          Autorización de datos personales y términos del servicio
        </p>
        <div
          onScroll={(e) => {
            const el = e.currentTarget
            if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) setTextoLeido(true)
          }}
          className="max-h-56 overflow-y-auto whitespace-pre-line pr-2 text-[12px] leading-relaxed text-[#F3E7DC]/80"
        >
          {TEXTO_LEGAL_CORTESIA}
        </div>
        {!textoLeido && (
          <p className="text-[11.5px] font-bold text-[#E0B868]">Baja hasta el final del texto para poder aceptar.</p>
        )}
      </div>
      <label className={`flex items-start gap-2.5 text-[13.5px] leading-relaxed text-[#F3E7DC] ${textoLeido ? '' : 'opacity-50'}`}>
        <input
          type="checkbox"
          disabled={!textoLeido}
          checked={autorizaDatos}
          onChange={(e) => setAutorizaDatos(e.target.checked)}
          className="mt-1 h-4 w-4 accent-[#C9A46B]"
        />
        Autorizo el tratamiento de mis datos personales, como se explica arriba.
      </label>
      <label className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-[#F3E7DC]">
        <input type="checkbox" checked={marcado} onChange={(e) => setMarcado(e.target.checked)} className="mt-1 h-4 w-4 accent-[#C9A46B]" />
        He leído y acepto estas condiciones.
      </label>
      {error && <p className="text-[13px] font-semibold text-[#F0A8A8]">{error}</p>}
      <button
        type="button"
        disabled={!marcado || !autorizaDatos || enviando}
        onClick={aceptar}
        className="rounded-xl bg-[#C9A46B] px-5 py-2.5 text-[14px] font-bold text-[#3B1727] shadow-[0_1px_2px_rgba(20,5,10,0.4)] disabled:opacity-50"
      >
        {enviando ? 'Guardando…' : 'Aceptar y empezar'}
      </button>
    </div>
  )
}
