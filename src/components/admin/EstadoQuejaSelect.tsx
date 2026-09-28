'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

const ESTILO_POR_ESTADO: Record<string, string> = {
  Abierto: 'bg-[#C0604A]/15 border-[#C0604A]/50 text-[#E0917E]',
  'En Proceso': 'bg-[#C99A3D]/15 border-[#C99A3D]/50 text-[#E0B868]',
  Resuelto: 'bg-[#7A8B6F]/15 border-[#7A8B6F]/50 text-[#9BB18D]',
}

export function EstadoQuejaSelect({ quejaId, estadoActual }: { quejaId: string; estadoActual: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [estado, setEstado] = useState(estadoActual)

  const handleChange = async (nuevoEstado: string) => {
    const anterior = estado
    setEstado(nuevoEstado)
    setLoading(true)
    try {
      const res = await fetch('/api/soporte/actualizar-estado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quejaId, estado: nuevoEstado }),
      })
      if (!res.ok) throw new Error('Error al actualizar')
      router.refresh()
    } catch {
      setEstado(anterior)
      alert('Hubo un problema, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <select
      value={estado}
      disabled={loading}
      onChange={(e) => handleChange(e.target.value)}
      className={`px-3 py-1.5 rounded-lg font-bold text-[11px] uppercase outline-none cursor-pointer border disabled:opacity-50 ${ESTILO_POR_ESTADO[estado] || ESTILO_POR_ESTADO['Abierto']}`}
    >
      <option value="Abierto" className="bg-[#3B1727] text-[#F3E7DC]">Abierto</option>
      <option value="En Proceso" className="bg-[#3B1727] text-[#F3E7DC]">En Proceso</option>
      <option value="Resuelto" className="bg-[#3B1727] text-[#F3E7DC]">Resuelto</option>
    </select>
  )
}
