'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, CalendarClock, Coins, ExternalLink } from 'lucide-react'

/**
 * "Parada 1" (26 sep 2026) — el cliente elige cuáles convocatorias quiere
 * seguir antes de que el Motor 3 (encaje) arranque con ellas. Esta pantalla
 * es esa elección: se le muestra al cliente lo que quedó pendiente
 * (`eleccion_cliente = null`) y él marca una o varias.
 *
 * Al confirmar, llama a /api/elegir-convocatoria, que guarda su elección y
 * dispara el Motor 3 solo para las que marcó. Si no elige nada en 3 días,
 * /api/revisar-eleccion-convocatorias-vencida elige por él — este componente
 * no necesita saber nada de eso, solo ofrecer la elección mientras el
 * cliente esté a tiempo.
 */

const SOMBRA_TARJETA =
  'shadow-[0_1px_2px_rgba(11,42,74,0.06),0_8px_24px_-14px_rgba(11,42,74,0.20)]'

export type ConvocatoriaPendiente = {
  id: string
  nombre: string
  entidad: string | null
  tipo: string | null
  fechaCierre: string | null
  monto: string | null
  fuenteOficial: string | null
}

function TarjetaPendiente({
  convocatoria,
  elegida,
  onCambiar,
}: {
  convocatoria: ConvocatoriaPendiente
  elegida: boolean
  onCambiar: (id: string, valor: boolean) => void
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border bg-white px-5 py-4 transition-colors ${SOMBRA_TARJETA} ${
        elegida ? 'border-[#1D4ED8]' : 'border-[#E4EAF3] hover:border-[#C7DBFB]'
      }`}
    >
      <input
        type="checkbox"
        checked={elegida}
        onChange={(e) => onCambiar(convocatoria.id, e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 rounded border-[#C7DBFB] text-[#1D4ED8] focus:ring-[#1D4ED8]"
      />

      <div className="min-w-0 flex-1">
        <h3 className="text-[15px] font-extrabold leading-snug tracking-tight text-[#0B2A4A]">
          {convocatoria.nombre}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-[#5B6B84]">
          {convocatoria.entidad ? (
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-[#94A3B8]" />
              {convocatoria.entidad}
            </span>
          ) : null}
          {convocatoria.fechaCierre ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5 text-[#94A3B8]" />
              Cierra: {convocatoria.fechaCierre}
            </span>
          ) : null}
          {convocatoria.monto ? (
            <span className="inline-flex items-center gap-1.5">
              <Coins className="h-3.5 w-3.5 text-[#94A3B8]" />
              {convocatoria.monto}
            </span>
          ) : null}
        </div>

        {convocatoria.fuenteOficial ? (
          <a
            href={convocatoria.fuenteOficial}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#5B6B84] underline underline-offset-2 hover:text-[#1D4ED8]"
          >
            Ver la convocatoria <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
    </label>
  )
}

export function ElegirConvocatorias({
  proyectoId,
  convocatorias,
}: {
  proyectoId: string
  convocatorias: ConvocatoriaPendiente[]
}) {
  const router = useRouter()
  const [elegidas, setElegidas] = useState<Set<string>>(new Set())
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cambiarEleccion = (id: string, valor: boolean) => {
    setElegidas((actual) => {
      const nuevo = new Set(actual)
      if (valor) nuevo.add(id)
      else nuevo.delete(id)
      return nuevo
    })
  }

  const confirmar = async () => {
    if (elegidas.size === 0) {
      setError('Marca al menos una convocatoria antes de confirmar.')
      return
    }

    setEnviando(true)
    setError(null)

    try {
      const respuesta = await fetch('/api/elegir-convocatoria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_proyecto: proyectoId,
          ids_elegidas: [...elegidas],
        }),
      })

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        setError(datos?.error || 'No se pudo guardar tu elección. Intenta de nuevo.')
        setEnviando(false)
        return
      }

      router.refresh()
    } catch {
      setError('No se pudo conectar con el servidor. Intenta de nuevo.')
      setEnviando(false)
    }
  }

  return (
    <div className="px-4 py-6 lg:px-6">
      <header className="mb-5">
        <h1 className="text-[19px] font-extrabold tracking-tight text-[#0B2A4A]">
          Elige tus convocatorias
        </h1>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[#5B6B84]">
          Encontramos estas oportunidades para tu proyecto. Marca una o varias — solo a esas les
          calculamos el encaje en detalle. Si no eliges en 3 días, el equipo elige por ti las que
          mejor encajan.
        </p>
      </header>

      <div className="space-y-3">
        {convocatorias.map((c) => (
          <TarjetaPendiente
            key={c.id}
            convocatoria={c}
            elegida={elegidas.has(c.id)}
            onCambiar={cambiarEleccion}
          />
        ))}
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-[#F6C9C4] bg-[#FDECEA] px-3.5 py-2.5 text-[13px] font-bold text-[#B42318]">
          {error}
        </p>
      ) : null}

      <div className="mt-5">
        <button
          type="button"
          onClick={confirmar}
          disabled={enviando || elegidas.size === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-[13.5px] font-bold text-white shadow-[0_8px_20px_-8px_rgba(29,78,216,0.55)] transition-colors hover:bg-[#1741B8] disabled:cursor-not-allowed disabled:bg-[#B9C7E8] disabled:shadow-none"
        >
          {enviando
            ? 'Guardando tu elección…'
            : `Confirmar ${elegidas.size > 0 ? `(${elegidas.size})` : ''}`}
        </button>
      </div>
    </div>
  )
}
