'use client'

import React, { useState } from 'react'
import Link from 'next/link'

/**
 * "Elegir esta": el cliente escoge una convocatoria de la lista de Coincidencias y la
 * plataforma arranca el análisis de encaje. Después de elegir, el botón se convierte
 * en un aviso con enlace a Mis convocatorias, donde aparece el resultado.
 */
export function BotonElegirCoincidencia({
  proyectoId,
  bibliotecaId,
  yaElegida,
}: {
  proyectoId: string
  bibliotecaId: string
  yaElegida: boolean
}) {
  const [estado, setEstado] = useState<'libre' | 'enviando' | 'elegida'>(yaElegida ? 'elegida' : 'libre')
  const [error, setError] = useState<string | null>(null)

  const elegir = async () => {
    setEstado('enviando')
    setError(null)
    try {
      const respuesta = await fetch('/api/elegir-desde-coincidencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_proyecto: proyectoId, id_biblioteca: bibliotecaId }),
      })
      const datos = await respuesta.json()
      if (!respuesta.ok) throw new Error(datos?.error || 'No se pudo guardar tu elección.')
      setEstado('elegida')
    } catch (e) {
      setError((e as Error).message)
      setEstado('libre')
    }
  }

  if (estado === 'elegida') {
    return (
      <div className="mt-2 text-xs">
        <span className="font-bold text-[#C9A46B]">✔ Elegida.</span>{' '}
        <span className="text-[#F3E7DC]/70">Estamos analizando el encaje; el resultado aparece en </span>
        <Link href="/mis-convocatorias" className="font-bold text-[#B08D57] underline">
          Mis convocatorias
        </Link>
        <span className="text-[#F3E7DC]/70">.</span>
      </div>
    )
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={elegir}
        disabled={estado === 'enviando'}
        className="rounded-full bg-gradient-to-b from-[#C9A46B] to-[#B08D57] px-4 py-1.5 text-xs font-bold text-[#3A1420] hover:brightness-110 disabled:opacity-50"
      >
        {estado === 'enviando' ? 'Guardando…' : 'Elegir esta'}
      </button>
      {error ? <p className="mt-1 text-xs font-bold text-[#E0917E]">{error}</p> : null}
    </div>
  )
}
