'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export type OpcionConvocatoria = { id: string; etiqueta: string }

/** "Postulen por mí": el miembro elige la convocatoria y el equipo de Serving se encarga. */
export function PostularProyecto({ proyectoId, opciones }: { proyectoId: string; opciones: OpcionConvocatoria[] }) {
  const router = useRouter()
  const [convocatoriaId, setConvocatoriaId] = useState('')
  const [otra, setOtra] = useState('')
  const [comentario, setComentario] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enviar = async () => {
    setCargando(true)
    setError(null)
    try {
      const res = await fetch('/api/membresias/postular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proyectoId, convocatoriaId, convocatoriaTexto: otra, comentario }),
      })
      const datos = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(datos.error || 'No se pudo enviar la solicitud.')
        return
      }
      router.refresh()
    } catch {
      setError('No se pudo enviar la solicitud.')
    } finally {
      setCargando(false)
    }
  }

  const campo = 'mt-1 w-full rounded-xl border border-white/10 bg-[#54142B] px-3 py-2 text-[13px] text-[#F3E7DC] placeholder:text-[#F3E7DC]/30'

  return (
    <div className="mt-3 space-y-3 rounded-xl bg-[#3B1727] p-3">
      <p className="text-[13.5px] font-bold text-[#F3E7DC]">Postulen por mí</p>
      <div>
        <label className="text-[12px] text-[#F3E7DC]/60">¿A qué convocatoria quieres postular?</label>
        <select value={convocatoriaId} onChange={(e) => setConvocatoriaId(e.target.value)} className={campo}>
          <option value="">Elige una de la biblioteca…</option>
          {opciones.map((o) => <option key={o.id} value={o.id}>{o.etiqueta}</option>)}
        </select>
      </div>
      <div>
        <label className="text-[12px] text-[#F3E7DC]/60">O escribe cuál es, si no está en la lista</label>
        <input value={otra} onChange={(e) => setOtra(e.target.value)} maxLength={300} className={campo} />
      </div>
      <div>
        <label className="text-[12px] text-[#F3E7DC]/60">Algo que debamos saber (opcional)</label>
        <textarea rows={2} value={comentario} onChange={(e) => setComentario(e.target.value)} maxLength={1000} className={campo} />
      </div>
      {error && <p className="text-[13px] text-[#E0917E]">{error}</p>}
      <button
        onClick={enviar}
        disabled={cargando || (!convocatoriaId && !otra.trim())}
        className="rounded-xl bg-[#C9A46B] px-4 py-2 text-[13px] font-bold text-[#3B1727] disabled:opacity-50"
      >
        {cargando ? 'Enviando…' : 'Pedir que lo postulen'}
      </button>
    </div>
  )
}
