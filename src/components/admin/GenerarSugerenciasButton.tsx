'use client'

import React, { useState } from 'react'

export function GenerarSugerenciasButton({ proyectoId }: { proyectoId: string }) {
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const generar = async () => {
    setCargando(true)
    setMensaje('')
    try {
      const res = await fetch('/api/generar-sugerencias-proyecto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_proyecto: proyectoId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'No se pudo generar.')
      setMensaje(
        data.revisadas === 0
          ? 'No hay preguntas pendientes sin sugerencia.'
          : `Listo: ${data.con_sugerencia} de ${data.revisadas} preguntas quedaron con sugerencia.`
      )
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : 'No se pudo generar.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={generar}
        disabled={cargando}
        className="px-3 py-1.5 rounded-lg bg-[#C9A46B] text-[#2E0E1A] text-xs font-bold hover:brightness-105 disabled:opacity-50"
      >
        {cargando ? 'Generando…' : 'Generar sugerencias para las preguntas pendientes'}
      </button>
      {mensaje ? <span className="text-xs font-semibold text-[#F3E7DC]/80">{mensaje}</span> : null}
    </div>
  )
}
