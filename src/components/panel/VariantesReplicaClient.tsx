'use client'

import React, { useState } from 'react'
import { ChevronRight, Loader2, Plus, Sparkles } from 'lucide-react'
import { CAMPO_DESTINO } from '@/lib/plantillasReplica'
import { TIPOS_REPLICA, type TipoReplica } from '@/lib/motorReplica'

const RELIEVE_BOTON =
  'shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_2px_4px_rgba(11,42,74,0.18),0_8px_18px_-10px_rgba(29,78,216,0.55)]'

const CAMPO =
  'w-full rounded-lg border border-[#DCE4F0] bg-[#FBFDFF] px-3 py-2.5 text-[13px] text-[#0F172A] outline-none transition-colors placeholder:text-[#A3B0C2] focus:border-[#1D4ED8] focus:bg-white'

export type VarianteReplica = {
  id: string
  tipo: string
  destino: string | null
  estado: string
}

const COLOR_ESTADO: Record<string, string> = {
  Planeada: 'bg-[#FBF0DF] text-[#8A5307]',
  'Proyecto creado': 'bg-[#E7EDFB] text-[#1D4ED8]',
  Postulada: 'bg-[#E4F2EB] text-[#186A46]',
  Descartada: 'bg-[#EEF2F8] text-[#7C8CA5]',
}

export function VariantesReplicaClient({
  proyectoOrigenId,
  modalidad,
  variantesIniciales,
  puedeProcesar,
}: {
  proyectoOrigenId: string
  modalidad: string | null
  variantesIniciales: VarianteReplica[]
  /** false mientras el documento todavía se está procesando. */
  puedeProcesar: boolean
}) {
  const [variantes, setVariantes] = useState<VarianteReplica[]>(variantesIniciales)
  const [abierto, setAbierto] = useState(false)
  const [tipo, setTipo] = useState<TipoReplica | ''>('')
  const [valorCampoDestino, setValorCampoDestino] = useState('')
  const [notaAdicional, setNotaAdicional] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const campoDestino = tipo ? CAMPO_DESTINO[tipo] : null
  const faltaValor = Boolean(campoDestino && !campoDestino.opcional && !valorCampoDestino.trim())

  const soloUna = modalidad === 'ya_presentado'
  const yaTieneUna = soloUna && variantes.length >= 1

  const pedir = async () => {
    if (!tipo || faltaValor) {
      setError('Elige el tipo y completa el dato que pide.')
      return
    }
    setEnviando(true)
    setError('')
    try {
      const respuesta = await fetch('/api/replica/solicitar-variante', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proyectoOrigenId, tipo, valorCampoDestino, notaAdicional }),
      })
      const datos = await respuesta.json().catch(() => ({}))
      if (!respuesta.ok) throw new Error(datos?.error || 'No se pudo pedir la réplica.')

      setVariantes((actuales) => [
        { id: `${Date.now()}`, tipo, destino: valorCampoDestino, estado: 'Proyecto creado' },
        ...actuales,
      ])
      setTipo('')
      setValorCampoDestino('')
      setNotaAdicional('')
      setAbierto(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo pedir la réplica.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="mt-3 border-t border-[#EEF2F8] pt-3">
      {variantes.length > 0 ? (
        <ul className="mb-2.5 space-y-1.5">
          {variantes.map((v) => (
            <li key={v.id} className="flex items-center justify-between gap-2 text-[12px]">
              <span className="min-w-0 truncate text-[#334155]">
                <span className="font-semibold capitalize">{v.tipo}</span>
                {v.destino ? <span className="text-[#7C8CA5]"> — {v.destino}</span> : null}
              </span>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold ${COLOR_ESTADO[v.estado] || 'bg-[#EEF2F8] text-[#7C8CA5]'}`}>
                {v.estado}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {!puedeProcesar ? (
        <p className="text-[12px] text-[#94A3B8]">
          Estamos procesando tu documento. Cuando esté listo vas a poder pedir tus réplicas aquí.
        </p>
      ) : yaTieneUna ? (
        <p className="text-[12px] text-[#94A3B8]">
          Esta modalidad incluye una repostulación, y ya la pediste. Si necesitas otra, escríbenos.
        </p>
      ) : !abierto ? (
        <div>
          <button
            type="button"
            onClick={() => setAbierto(true)}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#1D4ED8]"
          >
            <Plus className="h-3.5 w-3.5" /> Pedir una réplica
          </button>
          {variantes.length === 0 ? (
            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-[#94A3B8]">
              Puedes pedir las que necesites <ChevronRight className="h-3 w-3" />
            </p>
          ) : null}
        </div>
      ) : (
        <div className="space-y-2.5">
          <select
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value as TipoReplica)
              setValorCampoDestino('')
            }}
            className={CAMPO}
          >
            <option value="">¿Cómo la quieres presentar?</option>
            {TIPOS_REPLICA.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {campoDestino ? (
            <>
              <input
                type="text"
                value={valorCampoDestino}
                onChange={(e) => setValorCampoDestino(e.target.value)}
                placeholder={campoDestino.ejemplo}
                className={CAMPO}
              />
              <textarea
                value={notaAdicional}
                onChange={(e) => setNotaAdicional(e.target.value)}
                rows={2}
                placeholder="Nota adicional (opcional)"
                className={CAMPO}
              />
            </>
          ) : null}

          {error ? <p className="text-[12px] font-semibold text-[#B42318]">{error}</p> : null}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={pedir}
              disabled={enviando || !tipo}
              className={`inline-flex items-center gap-1.5 rounded-lg bg-[#1D4ED8] px-3.5 py-2 text-[12.5px] font-bold text-white transition-transform ${RELIEVE_BOTON} hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {enviando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {enviando ? 'Enviando…' : 'Pedir esta réplica'}
            </button>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              disabled={enviando}
              className="text-[12px] font-semibold text-[#5B6B84]"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
