'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

/** Botón del equipo: «Ya le escribí». Saca al cliente de la lista de pendientes por unos días. */
export function BotonYaEscribi({ proyectoId }: { proyectoId: string }) {
  const router = useRouter()
  const [estado, setEstado] = useState<'listo' | 'guardando' | 'error'>('listo')
  return (
    <button
      type="button"
      disabled={estado === 'guardando'}
      onClick={async () => {
        setEstado('guardando')
        try {
          const r = await fetch('/api/admin/ya-escribi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proyectoId }),
          })
          if (!r.ok) throw new Error('fallo')
          router.refresh()
        } catch {
          setEstado('error')
        }
      }}
      className="px-3 py-1.5 rounded-full bg-[#C9A46B]/20 border border-[#C9A46B]/40 text-[#E0B868] text-xs font-bold hover:bg-[#C9A46B]/30 whitespace-nowrap disabled:opacity-60"
    >
      {estado === 'guardando' ? 'Guardando…' : estado === 'error' ? 'No se pudo, reintenta' : 'Ya le escribí'}
    </button>
  )
}
