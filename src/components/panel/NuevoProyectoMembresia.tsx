'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

/** Abre un proyecto nuevo (descuenta 1 del cupo del mes) y lleva al miembro a llenarlo. */
export function NuevoProyectoMembresia({ sinCupo }: { sinCupo: boolean }) {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const crear = async () => {
    setCargando(true)
    setError(null)
    try {
      const res = await fetch('/api/membresias/proyectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'crear', nombre }),
      })
      const datos = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(datos.error || 'No se pudo crear el proyecto.')
        return
      }
      router.push(`/mis-proyectos/${datos.id}`)
    } catch {
      setError('No se pudo crear el proyecto.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-[13.5px] font-bold text-[#F3E7DC]">Nombre de tu proyecto nuevo</label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          maxLength={150}
          className="mt-1 w-full rounded-xl border border-white/10 bg-[#3B1727] px-3 py-2 text-[13.5px] text-[#F3E7DC] placeholder:text-[#F3E7DC]/30"
          placeholder="Puede ser un nombre provisional; el título final lo defines en el paso 1."
        />
      </div>
      {error && <p className="text-[13px] text-[#E0917E]">{error}</p>}
      <button
        onClick={crear}
        disabled={cargando || sinCupo || !nombre.trim()}
        className="rounded-xl bg-[#C9A46B] px-5 py-2.5 text-[13.5px] font-bold text-[#3B1727] disabled:opacity-50"
      >
        {cargando ? 'Creando…' : sinCupo ? 'Sin cupo este mes' : 'Empezar este proyecto (usa 1 del cupo)'}
      </button>
    </div>
  )
}
