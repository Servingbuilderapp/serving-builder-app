'use client'

import React, { useState } from 'react'
import Link from 'next/link'

type Punto = { que: string; detalle: string }

export type ConvocatoriaDelAbanico = {
  replicaId: string
  nombre: string
  entidad: string | null
  cierre: string | null
  monto: string | null
  enlace: string | null
  nucleo: Punto[]
  adaptaciones: Punto[]
  obligados: Punto[]
  riesgos: string | null
}

/**
 * El cliente escoge a cuáles de las convocatorias preparadas quiere entrar. Todas vienen
 * marcadas; desmarca las que no le interesen. Para cada una puede ver qué se conserva de su
 * proyecto, qué se adapta y qué obliga a cambiar esa convocatoria.
 */
export function ElegirAbanico({
  abanicoId,
  convocatorias,
}: {
  abanicoId: string
  convocatorias: ConvocatoriaDelAbanico[]
}) {
  const [elegidas, setElegidas] = useState<Set<string>>(new Set(convocatorias.map((c) => c.replicaId)))
  const [abiertas, setAbiertas] = useState<Set<string>>(new Set())
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [listo, setListo] = useState(false)

  const alternar = (conjunto: Set<string>, id: string): Set<string> => {
    const nuevo = new Set(conjunto)
    if (nuevo.has(id)) nuevo.delete(id)
    else nuevo.add(id)
    return nuevo
  }

  const confirmar = async () => {
    setEnviando(true)
    setError(null)
    try {
      const res = await fetch('/api/abanico/confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ abanicoId, replicaIds: [...elegidas] }),
      })
      const datos = await res.json()
      if (!res.ok) throw new Error(datos?.error || 'No se pudo guardar tu elección.')
      setListo(true)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  if (listo) {
    return (
      <div className="rounded-xl border border-[#C9A46B] bg-[#4C2032] p-5 text-sm text-[#F3E7DC]">
        <p className="font-extrabold text-[#C9A46B]">✔ Listo, confirmaste tu abanico.</p>
        <p className="mt-1 text-[#F3E7DC]/80">
          Ya estamos preparando tus postulaciones para las {elegidas.size} convocatorias que escogiste. Las verás con su
          análisis en{' '}
          <Link href="/mis-convocatorias" className="font-bold text-[#B08D57] underline">
            Mis convocatorias
          </Link>
          .
        </p>
      </div>
    )
  }

  const Lista = ({ titulo, puntos }: { titulo: string; puntos: Punto[] }) =>
    puntos.length === 0 ? null : (
      <div className="mt-2">
        <div className="text-[11px] font-black uppercase tracking-wider text-[#B08D57]">{titulo}</div>
        <ul className="mt-1 space-y-1 text-xs text-[#F3E7DC]/75">
          {puntos.map((p, i) => (
            <li key={`${p.que}-${i}`}>
              <strong className="text-[#F3E7DC]/90">{p.que}.</strong> {p.detalle}
            </li>
          ))}
        </ul>
      </div>
    )

  return (
    <div>
      <p className="text-sm text-[#F3E7DC]/75">
        Escoge a cuáles de estas convocatorias quieres entrar. Todas vienen marcadas: desmarca las que no te interesen.
      </p>

      <div className="mt-4 space-y-3">
        {convocatorias.map((c) => {
          const marcada = elegidas.has(c.replicaId)
          const abierta = abiertas.has(c.replicaId)
          return (
            <div
              key={c.replicaId}
              className={`rounded-xl border p-4 ${marcada ? 'border-[#C9A46B] bg-[#4C2032]' : 'border-[#B08D57]/30 bg-[#3B1727] opacity-80'}`}
            >
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={marcada}
                  onChange={() => setElegidas((e) => alternar(e, c.replicaId))}
                  className="mt-1 h-4 w-4 accent-[#C9A46B]"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-extrabold text-[#F3E7DC]">{c.nombre}</span>
                  <span className="block text-xs text-[#F3E7DC]/65">{c.entidad || 'Entidad por confirmar'}</span>
                  <span className="mt-1 flex flex-wrap gap-x-4 text-xs text-[#F3E7DC]/75">
                    <span>Cierre: {c.cierre || 'sin fecha confirmada'}</span>
                    {c.monto ? <span>Monto: {c.monto}</span> : null}
                  </span>
                </span>
              </label>

              <button
                type="button"
                onClick={() => setAbiertas((a) => alternar(a, c.replicaId))}
                className="mt-2 text-xs font-bold text-[#B08D57] hover:underline"
              >
                {abierta ? 'Ocultar lo que cambia' : 'Ver qué cambia en tu proyecto'}
              </button>
              {c.enlace ? (
                <a href={c.enlace} target="_blank" rel="noreferrer" className="ml-4 text-xs font-bold text-[#B08D57] hover:underline">
                  Ver la convocatoria
                </a>
              ) : null}

              {abierta ? (
                <div className="mt-2 border-t border-[#B08D57]/25 pt-2">
                  <Lista titulo="Se adapta" puntos={c.adaptaciones} />
                  <Lista titulo="La convocatoria obliga a cambiar" puntos={c.obligados} />
                  <Lista titulo="Se conserva igual" puntos={c.nucleo} />
                  {c.riesgos ? (
                    <div className="mt-2">
                      <div className="text-[11px] font-black uppercase tracking-wider text-[#B08D57]">Ten en cuenta</div>
                      <p className="mt-1 text-xs text-[#F3E7DC]/75">{c.riesgos}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      {error ? <p className="mt-3 text-xs font-bold text-[#E0917E]">{error}</p> : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={confirmar}
          disabled={enviando || elegidas.size === 0}
          className="rounded-full bg-gradient-to-b from-[#C9A46B] to-[#B08D57] px-6 py-2.5 text-sm font-bold text-[#3A1420] hover:brightness-110 disabled:opacity-50"
        >
          {enviando ? 'Guardando…' : `Confirmar mi abanico (${elegidas.size})`}
        </button>
        <span className="text-xs text-[#F3E7DC]/60">Al confirmar, preparamos tus postulaciones a las que dejaste marcadas.</span>
      </div>
    </div>
  )
}
