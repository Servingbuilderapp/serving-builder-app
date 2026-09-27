'use client'

import React, { useState } from 'react'
import { ChevronRight, Loader2, Plus, Sparkles } from 'lucide-react'
import { CAMPO_DESTINO } from '@/lib/plantillasReplica'
import { TIPOS_REPLICA, type TipoReplica } from '@/lib/tiposReplica'

const BOTON_DORADO =
  'bg-gradient-to-b from-[#E8C777] via-[#C9A46B] to-[#9C7A3E] text-[#2E0E1A] border border-[#7A5A2E]/60 ' +
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_4px_0_#7A5A2E,0_12px_20px_-6px_rgba(20,5,10,0.55)] ' +
  'hover:brightness-105 hover:-translate-y-0.5 ' +
  'active:translate-y-[3px] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_1px_0_#7A5A2E,0_4px_10px_-4px_rgba(20,5,10,0.5)] ' +
  'disabled:translate-y-0 disabled:hover:translate-y-0 disabled:brightness-90 disabled:shadow-none ' +
  'transition-all duration-150'

const CAMPO =
  'w-full rounded-lg border border-[#6E4A50] bg-[#3B1727] px-3 py-2.5 text-[13px] text-[#F3E7DC] outline-none transition-colors placeholder:text-[#F3E7DC]/40 focus:border-[#B08D57]'

export type VarianteReplica = {
  id: string
  tipo: string
  destino: string | null
  estado: string
}

const COLOR_ESTADO: Record<string, string> = {
  Planeada: 'bg-[#C99A3D]/15 text-[#E0B868]',
  'Proyecto creado': 'bg-[#B08D57]/15 text-[#C9A46B]',
  Postulada: 'bg-[#7A8B6F]/15 text-[#A9BC9C]',
  Descartada: 'bg-[#F3E7DC]/10 text-[#F3E7DC]/60',
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
    <div className="mt-3 border-t border-[#6E4A50] pt-3">
      {variantes.length > 0 ? (
        <ul className="mb-2.5 space-y-1.5">
          {variantes.map((v) => (
            <li key={v.id} className="flex items-center justify-between gap-2 text-[12px]">
              <span className="min-w-0 truncate text-[#F3E7DC]/85">
                <span className="font-semibold capitalize">{v.tipo}</span>
                {v.destino ? <span className="text-[#F3E7DC]/60"> — {v.destino}</span> : null}
              </span>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold ${COLOR_ESTADO[v.estado] || 'bg-[#F3E7DC]/10 text-[#F3E7DC]/60'}`}>
                {v.estado}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {!puedeProcesar ? (
        <p className="text-[12px] text-[#F3E7DC]/50">
          Estamos procesando tu documento. Cuando esté listo vas a poder pedir tus réplicas aquí.
        </p>
      ) : yaTieneUna ? (
        <p className="text-[12px] text-[#F3E7DC]/50">
          Esta modalidad incluye una repostulación, y ya la pediste. Si necesitas otra, escríbenos.
        </p>
      ) : !abierto ? (
        <div>
          <button
            type="button"
            onClick={() => setAbierto(true)}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#C9A46B]"
          >
            <Plus className="h-3.5 w-3.5" /> Pedir una réplica
          </button>
          {variantes.length === 0 ? (
            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-[#F3E7DC]/50">
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

          {error ? <p className="text-[12px] font-semibold text-[#E0917E]">{error}</p> : null}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={pedir}
              disabled={enviando || !tipo}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12.5px] font-extrabold disabled:opacity-70 ${BOTON_DORADO}`}
            >
              {enviando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {enviando ? 'Enviando…' : 'Pedir esta réplica'}
            </button>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              disabled={enviando}
              className="text-[12px] font-semibold text-[#F3E7DC]/70"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
