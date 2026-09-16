'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

type SocioOpcion = { id: string; nombre: string }

/**
 * Selector para decir de qué socio es un proyecto de marca blanca. Es lo
 * que de verdad separa los datos de un socio de los de otro — la
 * etiqueta canal_origen solo dice "es de marca blanca", no de cuál socio.
 */
export function AsignarSocioSelect({
  proyectoId,
  socioIdActual,
  socios,
}: {
  proyectoId: string
  socioIdActual: string | null
  socios: SocioOpcion[]
}) {
  const router = useRouter()
  const [guardando, setGuardando] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const socioId = e.target.value || null
    setGuardando(true)
    try {
      const res = await fetch('/api/admin/asignar-socio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proyectoId, socioId }),
      })
      if (!res.ok) throw new Error('Error al asignar')
      router.refresh()
    } catch {
      alert('Hubo un problema, intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <select
      defaultValue={socioIdActual || ''}
      onChange={handleChange}
      disabled={guardando}
      className="rounded-lg border border-color-base-content/15 px-2 py-1 text-xs bg-color-base-200 disabled:opacity-50"
    >
      <option value="">Sin socio</option>
      {socios.map((s) => (
        <option key={s.id} value={s.id}>
          {s.nombre}
        </option>
      ))}
    </select>
  )
}
