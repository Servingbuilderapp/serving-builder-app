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

const RELIEVE_TARJETA =
  'shadow-[0_1px_2px_rgba(20,5,10,0.28),0_8px_24px_-14px_rgba(20,5,10,0.55)]'

/** Botón dorado con relieve fuerte: brillo arriba, escalón abajo que se
 * aplana al hacer clic — igual al de Estructuración, para que combinen. */
const BOTON_DORADO =
  'bg-gradient-to-b from-[#E8C777] via-[#C9A46B] to-[#9C7A3E] text-[#2E0E1A] border border-[#7A5A2E]/60 ' +
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_4px_0_#7A5A2E,0_12px_20px_-6px_rgba(20,5,10,0.55)] ' +
  'hover:brightness-105 hover:-translate-y-0.5 ' +
  'active:translate-y-[3px] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_1px_0_#7A5A2E,0_4px_10px_-4px_rgba(20,5,10,0.5)] ' +
  'disabled:translate-y-0 disabled:hover:translate-y-0 disabled:brightness-90 disabled:shadow-none ' +
  'transition-all duration-150'

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
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border bg-[#4C2032] px-5 py-4 transition-colors ${RELIEVE_TARJETA} ${
        elegida ? 'border-[#C9A46B]' : 'border-[#6E4A50] hover:border-[#B08D57]/60'
      }`}
    >
      <input
        type="checkbox"
        checked={elegida}
        onChange={(e) => onCambiar(convocatoria.id, e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 rounded border-[#B08D57] bg-[#3B1727] text-[#C9A46B] focus:ring-[#C9A46B]"
      />

      <div className="min-w-0 flex-1">
        <h3 className="text-[15px] font-extrabold leading-snug tracking-tight text-[#F3E7DC]">
          {convocatoria.nombre}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-[#F3E7DC]/70">
          {convocatoria.entidad ? (
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-[#F3E7DC]/50" />
              {convocatoria.entidad}
            </span>
          ) : null}
          {convocatoria.fechaCierre ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5 text-[#F3E7DC]/50" />
              Cierra: {convocatoria.fechaCierre}
            </span>
          ) : null}
          {convocatoria.monto ? (
            <span className="inline-flex items-center gap-1.5">
              <Coins className="h-3.5 w-3.5 text-[#F3E7DC]/50" />
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
            className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#F3E7DC]/70 underline underline-offset-2 hover:text-[#C9A46B]"
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
    <div className="min-h-full bg-[#54142B] px-4 py-6 lg:px-6">
      <header className="mb-5">
        <h1 className="text-[19px] font-extrabold tracking-tight text-[#F3E7DC]">
          Elige tus convocatorias
        </h1>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[#F3E7DC]/70">
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
        <p className="mt-4 rounded-xl border border-[#C0604A]/40 bg-[#C0604A]/12 px-3.5 py-2.5 text-[13px] font-bold text-[#E0917E]">
          {error}
        </p>
      ) : null}

      <div className="mt-5">
        <button
          type="button"
          onClick={confirmar}
          disabled={enviando || elegidas.size === 0}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13.5px] font-extrabold disabled:opacity-70 ${BOTON_DORADO}`}
        >
          {enviando
            ? 'Guardando tu elección…'
            : `Confirmar ${elegidas.size > 0 ? `(${elegidas.size})` : ''}`}
        </button>
      </div>
    </div>
  )
}
