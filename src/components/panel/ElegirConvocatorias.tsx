'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, CalendarClock, Coins, ExternalLink, MapPin, Users } from 'lucide-react'

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
  lineaTematica?: string | null
  territorio?: string | null
  beneficiarios?: string | null
  razon?: string | null
}

/** Colores de la etiqueta de sector (sobre fondo vino). */
const COLOR_SECTOR: Record<string, string> = {
  salud: 'bg-[#2F8F83]/25 text-[#8FE0D4] border-[#2F8F83]/50',
  educación: 'bg-[#3F6FC0]/25 text-[#A9C4F5] border-[#3F6FC0]/50',
  'medio ambiente': 'bg-[#4C9A4C]/25 text-[#A8E0A8] border-[#4C9A4C]/50',
  'artes y cultura': 'bg-[#B0508F]/25 text-[#F0B0DA] border-[#B0508F]/50',
  'tecnología e innovación': 'bg-[#7A5AC8]/25 text-[#C9B8F5] border-[#7A5AC8]/50',
  agricultura: 'bg-[#8FA83A]/25 text-[#D6E58A] border-[#8FA83A]/50',
  'sector privado': 'bg-[#C98A3A]/25 text-[#F0CC8F] border-[#C98A3A]/50',
  'derechos y comunidades': 'bg-[#C0604A]/25 text-[#F0A898] border-[#C0604A]/50',
}
const COLOR_NEUTRO = 'bg-[#F3E7DC]/10 text-[#F3E7DC]/80 border-[#F3E7DC]/25'

function separarLinea(linea: string | null | undefined, tipo: string | null) {
  const partes = String(linea || '')
    .split('·')
    .map((x) => x.trim())
    .filter(Boolean)
  return { sector: partes[0] || null, recurso: partes[1] || tipo || null }
}

function diasParaCierre(fecha: string | null): number | null {
  if (!fecha || !/^\d{4}-\d{2}-\d{2}/.test(fecha)) return null
  const cierre = new Date(fecha.slice(0, 10) + 'T23:59:59')
  return Math.ceil((cierre.getTime() - Date.now()) / 86400000)
}

function Dato({ icono, texto }: { icono: React.ReactNode; texto: string }) {
  return (
    <div className="flex items-start gap-2 text-[12.5px] leading-snug text-[#F3E7DC]/75">
      <span className="mt-0.5 shrink-0 text-[#C9A46B]">{icono}</span>
      <span className="min-w-0">{texto}</span>
    </div>
  )
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
  const { sector, recurso } = separarLinea(convocatoria.lineaTematica, convocatoria.tipo)
  const dias = diasParaCierre(convocatoria.fechaCierre)
  const pronto = dias !== null && dias >= 0 && dias <= 30
  const colorSector = (sector && COLOR_SECTOR[sector.toLowerCase()]) || COLOR_NEUTRO

  return (
    <article
      className={`flex flex-col rounded-2xl border bg-gradient-to-b from-[#5A2438] to-[#4C2032] p-5 transition-colors ${RELIEVE_TARJETA} ${
        elegida ? 'border-[#C9A46B] ring-1 ring-[#C9A46B]/60' : 'border-[#B08D57]/35 hover:border-[#B08D57]/60'
      }`}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {sector ? (
          <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${colorSector}`}>
            {sector}
          </span>
        ) : null}
        {recurso ? (
          <span className="rounded-full border border-[#C9A46B]/50 bg-[#C9A46B]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#E8C777]">
            {recurso}
          </span>
        ) : null}
        {pronto ? (
          <span className="rounded-full border border-[#E0917E]/50 bg-[#C0604A]/25 px-2.5 py-0.5 text-[11px] font-bold text-[#F0A898]">
            Cierra pronto
          </span>
        ) : null}
      </div>

      <h3 className="mt-3 text-[15.5px] font-extrabold leading-snug tracking-tight text-[#F3E7DC]">
        {convocatoria.nombre}
      </h3>

      <div className="mt-3 space-y-2">
        {convocatoria.entidad ? <Dato icono={<Building2 className="h-3.5 w-3.5" />} texto={convocatoria.entidad} /> : null}
        <Dato
          icono={<CalendarClock className="h-3.5 w-3.5" />}
          texto={convocatoria.fechaCierre ? `Cierra: ${convocatoria.fechaCierre}` : 'Convocatoria abierta de forma permanente'}
        />
        {convocatoria.monto ? <Dato icono={<Coins className="h-3.5 w-3.5" />} texto={convocatoria.monto} /> : null}
        {convocatoria.territorio ? <Dato icono={<MapPin className="h-3.5 w-3.5" />} texto={convocatoria.territorio} /> : null}
        {convocatoria.beneficiarios ? <Dato icono={<Users className="h-3.5 w-3.5" />} texto={convocatoria.beneficiarios} /> : null}
      </div>

      {convocatoria.razon ? (
        <p className="mt-3 rounded-xl border border-[#B08D57]/25 bg-[#3B1727]/60 px-3 py-2 text-[12.5px] leading-relaxed text-[#F3E7DC]/80">
          <span className="font-bold text-[#E8C777]">Por qué te sirve: </span>
          {convocatoria.razon}
        </p>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
        {convocatoria.fuenteOficial ? (
          <a
            href={convocatoria.fuenteOficial}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#B08D57]/50 px-3 py-1.5 text-[12.5px] font-bold text-[#F3E7DC]/85 hover:border-[#C9A46B] hover:text-[#C9A46B]"
          >
            Ver convocatoria oficial <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <span />
        )}
        <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] font-extrabold text-[#F3E7DC]">
          <input
            type="checkbox"
            checked={elegida}
            onChange={(e) => onCambiar(convocatoria.id, e.target.checked)}
            className="h-5 w-5 accent-[#C9A46B] rounded border-[#B08D57] bg-[#3B1727] text-[#C9A46B] focus:ring-[#C9A46B]"
          />
          {elegida ? 'Elegida' : 'Elegir'}
        </label>
      </div>
    </article>
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
