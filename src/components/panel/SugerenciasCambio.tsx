'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lightbulb, Check } from 'lucide-react'

export type SugerenciaVista = {
  id: string
  tema: string
  hallazgo: string
  propuesta: string
  estado: 'pendiente' | 'aceptada' | 'editada' | 'descartada'
  texto_final: string | null
}

/**
 * «Sugerencias para fortalecer tu proyecto»: el documento de cambios ya redactado.
 * El cliente lo usa tal cual, lo corrige o lo deja como está. Si todavía no existen,
 * las prepara solas la primera vez que se abre (una sola vez por proyecto).
 */
export function SugerenciasCambio({
  proyectoId,
  sugerencias,
  soloVista = false,
}: {
  proyectoId: string
  sugerencias: SugerenciaVista[]
  soloVista?: boolean
}) {
  const router = useRouter()
  const [preparando, setPreparando] = useState(false)
  const [errorPrep, setErrorPrep] = useState<string | null>(null)
  const yaIntento = useRef(false)

  useEffect(() => {
    if (soloVista || sugerencias.length > 0 || yaIntento.current) return
    yaIntento.current = true
    setPreparando(true)
    fetch('/api/sugerencias-cambio/generar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_proyecto: proyectoId }),
    })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(d.error || 'No se pudieron preparar')
        if ((d.creadas || 0) > 0) router.refresh()
      })
      .catch((e) => setErrorPrep(e.message))
      .finally(() => setPreparando(false))
  }, [proyectoId, sugerencias.length, soloVista, router])

  const visibles = sugerencias.filter((s) => s.propuesta || s.estado !== 'descartada')
  const pendientes = visibles.filter((s) => s.estado === 'pendiente')

  if (visibles.length === 0) {
    return preparando ? (
      <section className="rounded-2xl border border-[#B08D57]/40 bg-white/70 p-5 text-sm text-[#5A3A2E]">
        Estamos preparando tus sugerencias para fortalecer el proyecto…
      </section>
    ) : errorPrep ? (
      <section className="rounded-2xl border border-[#C0604A]/40 bg-white/70 p-5 text-xs text-[#8A3B2D]">{errorPrep}</section>
    ) : null
  }

  return (
    <section className="rounded-2xl border border-[#B08D57]/50 bg-white/80 p-5 shadow-sm space-y-4">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 shrink-0 rounded-full bg-[#C9A46B]/25 flex items-center justify-center text-[#8C3654]">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-[#3A1420]">Sugerencias para fortalecer tu proyecto</h2>
          <p className="text-xs text-[#5A3A2E]/80 mt-0.5">
            Revisamos tu proyecto y te dejamos cada cambio ya escrito. Úsalo tal cual, corrígelo a tu manera o déjalo como está.
            {pendientes.length > 0 ? ` Te faltan ${pendientes.length} por revisar.` : ' Ya las revisaste todas.'}
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {visibles.map((s) => (
          <Tarjeta key={s.id} s={s} soloVista={soloVista} />
        ))}
      </div>
    </section>
  )
}

function Tarjeta({ s, soloVista }: { s: SugerenciaVista; soloVista: boolean }) {
  const router = useRouter()
  const [texto, setTexto] = useState(s.texto_final || s.propuesta)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editando, setEditando] = useState(false)

  const enviar = async (accion: 'aceptar' | 'editar' | 'descartar') => {
    setGuardando(true)
    setError(null)
    try {
      const r = await fetch('/api/sugerencias-cambio/responder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: s.id, accion, texto }),
      })
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'No se pudo guardar')
      router.refresh()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setGuardando(false)
    }
  }

  const respondida = s.estado !== 'pendiente'
  const etiqueta = s.estado === 'aceptada' ? 'Usaste la sugerencia' : s.estado === 'editada' ? 'La corregiste' : 'La dejaste como está'

  return (
    <div className="rounded-xl border border-[#B08D57]/30 bg-[#FBF5EC] p-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-black uppercase tracking-wider text-[#8C3654]">{s.tema}</div>
        {respondida ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3E7A4F]">
            <Check className="h-3.5 w-3.5" /> {etiqueta}
          </span>
        ) : null}
      </div>
      <p className="text-sm font-semibold text-[#3A1420]">{s.hallazgo}</p>
      {respondida && s.estado !== 'descartada' ? (
        <p className="text-xs text-[#5A3A2E] whitespace-pre-wrap rounded-lg bg-white/70 p-3">{s.texto_final}</p>
      ) : !respondida ? (
        <>
          <div className="text-[11px] font-bold text-[#5A3A2E]/70">Así quedaría, ya redactado:</div>
          {editando ? (
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={6}
              disabled={soloVista}
              className="w-full rounded-lg border border-[#B08D57]/50 bg-white p-3 text-sm text-[#3A1420] focus:outline-none focus:ring-2 focus:ring-[#C9A46B]"
            />
          ) : (
            <p className="text-sm text-[#3A1420] whitespace-pre-wrap rounded-lg bg-white/80 p-3">{s.propuesta}</p>
          )}
          {texto.includes('[COMPLETAR') || s.propuesta.includes('[COMPLETAR') ? (
            <p className="text-[11px] font-semibold text-[#8A5A12]">Donde dice [COMPLETAR…] falta un dato que solo tú sabes: corrígelo antes de usarlo.</p>
          ) : null}
          {soloVista ? null : (
            <div className="flex flex-wrap gap-2 pt-1">
              {editando ? (
                <button
                  type="button"
                  disabled={guardando}
                  onClick={() => enviar('editar')}
                  className="rounded-full bg-gradient-to-b from-[#C9A46B] to-[#B08D57] px-4 py-1.5 text-xs font-bold text-[#3A1420] shadow disabled:opacity-60"
                >
                  Guardar mi versión
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={guardando}
                    onClick={() => enviar('aceptar')}
                    className="rounded-full bg-gradient-to-b from-[#C9A46B] to-[#B08D57] px-4 py-1.5 text-xs font-bold text-[#3A1420] shadow disabled:opacity-60"
                  >
                    Usar esta versión
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditando(true)}
                    className="rounded-full border border-[#B08D57] px-4 py-1.5 text-xs font-bold text-[#5A3A2E] hover:bg-[#C9A46B]/15"
                  >
                    Corregirla
                  </button>
                </>
              )}
              <button
                type="button"
                disabled={guardando}
                onClick={() => enviar('descartar')}
                className="rounded-full px-3 py-1.5 text-xs font-bold text-[#5A3A2E]/70 hover:underline"
              >
                Dejarlo como está
              </button>
            </div>
          )}
          {error ? <p className="text-xs text-[#8A3B2D]">{error}</p> : null}
        </>
      ) : null}
    </div>
  )
}
