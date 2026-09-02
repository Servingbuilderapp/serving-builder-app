'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle2, ChevronDown, FileText, Send, Sparkles } from 'lucide-react'

/* -------------------------------------------------------------------------- */

export type Requisito = {
  id: string
  requisito: string
  tipo: string
  obligatorio: boolean
  cumplido: boolean
  responsable: string | null
  nota: string | null
}

export type Postulacion = {
  id: string
  biblioteca_id: string | null
  convocatoria_nombre: string
  entidad: string | null
  fecha_cierre: string | null
  estado: string
  puntaje_tecnica: number | null
  puntaje_impacto: number | null
  puntaje_capacidades: number | null
  puntaje_sostenibilidad: number | null
  puntaje_replicabilidad: number | null
  puntaje_total: number | null
  veredicto: string | null
  corrida: number
  mejoras_json: unknown
  adaptaciones_json: unknown
  carta_intencion: string | null
  alertas: string | null
  requisitos: Requisito[]
}

export type ConvocatoriaOpcion = {
  id: string
  nombre: string
  entidad: string | null
  fecha_cierre: string | null
}

/* -------------------------------------------------------------------------- */

const SOMBRA = 'shadow-[0_1px_2px_rgba(11,42,74,0.06),0_8px_24px_-14px_rgba(11,42,74,0.20)]'

const CRITERIOS = [
  { clave: 'puntaje_tecnica', nombre: 'Propuesta técnica', tope: 30 },
  { clave: 'puntaje_impacto', nombre: 'Impacto', tope: 30 },
  { clave: 'puntaje_capacidades', nombre: 'Capacidades locales', tope: 15 },
  { clave: 'puntaje_sostenibilidad', nombre: 'Sostenibilidad', tope: 15 },
  { clave: 'puntaje_replicabilidad', nombre: 'Replicabilidad', tope: 10 },
] as const

const COLOR_ESTADO: Record<string, string> = {
  Preparando: 'bg-[#FBF0DF] text-[#8A5307]',
  'Lista para radicar': 'bg-[#E7EDFB] text-[#1D4ED8]',
  Radicada: 'bg-[#E4F2EB] text-[#186A46]',
  Adjudicada: 'bg-[#E4F2EB] text-[#186A46]',
  Rechazada: 'bg-[#FAE7E7] text-[#9B2C2C]',
  Descartada: 'bg-[#EEF2F8] text-[#7C8CA5]',
}

function comoLista(valor: unknown): string[] {
  if (!Array.isArray(valor)) return []
  return valor
    .map((v) => (typeof v === 'string' ? v : v && typeof v === 'object' ? Object.values(v).filter((x) => typeof x === 'string').join(' — ') : ''))
    .filter(Boolean) as string[]
}

function fecha(valor: string | null) {
  if (!valor) return 'sin fecha de cierre'
  const d = new Date(valor)
  if (Number.isNaN(d.getTime())) return valor
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}

/* -------------------------------------------------------------------------- */

export function PostulacionesClient({
  proyectoId,
  nombreProyecto,
  postulaciones,
  convocatorias,
}: {
  proyectoId: string
  nombreProyecto: string
  postulaciones: Postulacion[]
  convocatorias: ConvocatoriaOpcion[]
}) {
  const router = useRouter()
  const [convocatoriaId, setConvocatoriaId] = useState('')
  const [trabajando, setTrabajando] = useState<string | null>(null)
  const [aviso, setAviso] = useState<{ tono: 'ok' | 'mal'; texto: string } | null>(null)
  const [abierta, setAbierta] = useState<string | null>(postulaciones[0]?.id || null)

  const llamar = async (cuerpo: Record<string, unknown>, etiqueta: string) => {
    setTrabajando(etiqueta)
    setAviso(null)
    try {
      const res = await fetch('/api/postulacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
      })
      const datos = await res.json()
      if (!res.ok || datos?.ok === false) {
        setAviso({ tono: 'mal', texto: datos?.error || datos?.mensaje || 'No se pudo completar.' })
        return
      }
      setAviso({ tono: 'ok', texto: datos?.mensaje || 'Listo.' })
      router.refresh()
    } catch {
      setAviso({ tono: 'mal', texto: 'Se cayó la conexión. Intenta otra vez.' })
    } finally {
      setTrabajando(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 p-4 lg:p-6">
      <header className="space-y-1">
        <h1 className="text-[19px] font-extrabold uppercase tracking-tight text-[#0B2A4A]">
          Postulaciones
        </h1>
        <p className="text-[13px] text-[#7C8CA5]">{nombreProyecto}</p>
      </header>

      {/* preparar una nueva ---------------------------------------------- */}
      <div className={`rounded-2xl border border-[#E4EAF3] bg-white p-5 ${SOMBRA}`}>
        <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#0B2A4A]">
          Preparar una postulación
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[#5B6B84]">
          Escoge la convocatoria y el motor arma los requisitos, las adaptaciones, la carta de
          intención y la evaluación sobre cien. Se puede volver a correr las veces que haga falta:
          cada corrida debería subir el puntaje.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <select
            value={convocatoriaId}
            onChange={(e) => setConvocatoriaId(e.target.value)}
            className="h-11 flex-1 rounded-lg border border-[#DCE4F0] bg-white px-3 text-[13.5px] text-[#0B2A4A] outline-none focus:border-[#1D4ED8]"
          >
            <option value="">Escoge una convocatoria de la biblioteca…</option>
            {convocatorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
                {c.entidad ? ` — ${c.entidad}` : ''}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={!convocatoriaId || trabajando !== null}
            onClick={() => llamar({ accion: 'preparar', proyectoId, convocatoriaId }, 'preparar')}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] px-6 text-[13px] font-semibold text-white disabled:opacity-45"
          >
            <Sparkles className="h-4 w-4" />
            {trabajando === 'preparar' ? 'Trabajando…' : 'Preparar'}
          </button>
        </div>

        {convocatorias.length === 0 ? (
          <p className="mt-3 text-[12.5px] text-[#8A5307]">
            La biblioteca de convocatorias está vacía. Corre primero la búsqueda de convocatorias.
          </p>
        ) : null}

        {aviso ? (
          <p
            className={`mt-3 rounded-lg px-3 py-2 text-[13px] ${
              aviso.tono === 'ok' ? 'bg-[#E4F2EB] text-[#186A46]' : 'bg-[#FAE7E7] text-[#9B2C2C]'
            }`}
          >
            {aviso.texto}
          </p>
        ) : null}
      </div>

      {/* listado ---------------------------------------------------------- */}
      {postulaciones.length === 0 ? (
        <div className={`rounded-2xl border border-dashed border-[#DCE4F0] bg-[#F8FAFD] p-10 text-center ${SOMBRA}`}>
          <FileText className="mx-auto h-6 w-6 text-[#94A3B8]" />
          <p className="mt-3 text-[13.5px] text-[#5B6B84]">
            Este proyecto todavía no tiene ninguna postulación preparada.
          </p>
        </div>
      ) : (
        postulaciones.map((p) => {
          const desplegada = abierta === p.id
          const mejoras = comoLista(p.mejoras_json)
          const adaptaciones = comoLista(p.adaptaciones_json)
          const cumplidos = p.requisitos.filter((r) => r.cumplido).length

          return (
            <div key={p.id} className={`overflow-hidden rounded-2xl border border-[#E4EAF3] bg-white ${SOMBRA}`}>
              <button
                type="button"
                onClick={() => setAbierta(desplegada ? null : p.id)}
                className="flex w-full items-start gap-3 px-5 py-4 text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] font-bold text-[#0B2A4A]">{p.convocatoria_nombre}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        COLOR_ESTADO[p.estado] || 'bg-[#EEF2F8] text-[#7C8CA5]'
                      }`}
                    >
                      {p.estado}
                    </span>
                  </div>
                  <p className="mt-1 text-[12.5px] text-[#7C8CA5]">
                    {p.entidad || 'Sin entidad'} · cierra el {fecha(p.fecha_cierre)} · corrida {p.corrida}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <div className="text-right">
                    <div className="text-[20px] font-extrabold tabular-nums text-[#0B2A4A]">
                      {p.puntaje_total ?? '—'}
                      <span className="text-[12px] font-semibold text-[#94A3B8]">/100</span>
                    </div>
                    {p.veredicto ? (
                      <div className="text-[11px] text-[#7C8CA5]">{p.veredicto}</div>
                    ) : null}
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-[#94A3B8] transition-transform ${desplegada ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {desplegada ? (
                <div className="space-y-5 border-t border-[#EEF2F8] px-5 py-5">
                  {/* puntaje por criterio */}
                  <div className="space-y-2">
                    {CRITERIOS.map((c) => {
                      const valor = (p[c.clave] as number | null) ?? 0
                      return (
                        <div key={c.clave} className="flex items-center gap-3">
                          <span className="w-[150px] shrink-0 text-[12.5px] text-[#5B6B84]">{c.nombre}</span>
                          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#EEF2F8]">
                            <div
                              className="h-full rounded-full bg-[#1D4ED8]"
                              style={{ width: `${Math.round((valor / c.tope) * 100)}%` }}
                            />
                          </div>
                          <span className="w-12 shrink-0 text-right text-[12px] tabular-nums text-[#94A3B8]">
                            {valor}/{c.tope}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {p.alertas ? (
                    <div className="flex items-start gap-2.5 rounded-xl border border-[#F0DCBB] bg-[#FDF8F0] p-4">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#8A5307]" />
                      <p className="text-[13px] leading-relaxed text-[#5B6B84]">{p.alertas}</p>
                    </div>
                  ) : null}

                  {mejoras.length > 0 ? (
                    <div>
                      <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#0B2A4A]">
                        Qué hay que corregir para subir el puntaje
                      </h3>
                      <ul className="mt-2 space-y-1.5">
                        {mejoras.map((m, i) => (
                          <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-[#5B6B84]">
                            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#1D4ED8]" />
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {adaptaciones.length > 0 ? (
                    <div>
                      <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#0B2A4A]">
                        Qué se adaptó del proyecto base
                      </h3>
                      <ul className="mt-2 space-y-1.5">
                        {adaptaciones.map((a, i) => (
                          <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-[#5B6B84]">
                            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#94A3B8]" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {p.requisitos.length > 0 ? (
                    <div>
                      <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#0B2A4A]">
                        Requisitos ({cumplidos} de {p.requisitos.length} listos)
                      </h3>
                      <ul className="mt-2 divide-y divide-[#F2F5FA]">
                        {p.requisitos.map((r) => (
                          <li key={r.id} className="flex items-start gap-3 py-2">
                            <span
                              className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full ${
                                r.cumplido ? 'bg-[#186A46]' : 'border-2 border-[#DCE4F0]'
                              }`}
                              style={{ height: 18, width: 18 }}
                            >
                              {r.cumplido ? <CheckCircle2 className="h-3 w-3 text-white" /> : null}
                            </span>
                            <div className="min-w-0 flex-1">
                              <span className="text-[13px] text-[#0B2A4A]">{r.requisito}</span>
                              {!r.obligatorio ? (
                                <span className="ml-2 text-[11px] text-[#94A3B8]">(opcional)</span>
                              ) : null}
                              {r.nota ? (
                                <p className="mt-0.5 text-[12px] text-[#7C8CA5]">{r.nota}</p>
                              ) : null}
                            </div>
                            {r.responsable ? (
                              <span className="shrink-0 text-[11.5px] text-[#94A3B8]">{r.responsable}</span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {p.carta_intencion ? (
                    <details className="rounded-xl border border-[#E4EAF3] bg-[#F8FAFD] p-4">
                      <summary className="cursor-pointer text-[12.5px] font-semibold text-[#1D4ED8]">
                        Ver la carta de intención
                      </summary>
                      <p className="mt-3 whitespace-pre-wrap text-[13px] leading-relaxed text-[#5B6B84]">
                        {p.carta_intencion}
                      </p>
                    </details>
                  ) : null}

                  <div className="flex flex-wrap gap-3 border-t border-[#EEF2F8] pt-4">
                    {p.biblioteca_id ? (
                      <button
                        type="button"
                        disabled={trabajando !== null}
                        onClick={() =>
                          llamar(
                            { accion: 'preparar', proyectoId, convocatoriaId: p.biblioteca_id },
                            `reevaluar-${p.id}`
                          )
                        }
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#DCE4F0] bg-white px-4 text-[13px] font-semibold text-[#1D4ED8] disabled:opacity-45"
                      >
                        <Sparkles className="h-4 w-4" />
                        {trabajando === `reevaluar-${p.id}` ? 'Evaluando…' : 'Volver a evaluar'}
                      </button>
                    ) : null}

                    {p.estado === 'Lista para radicar' ? (
                      <button
                        type="button"
                        disabled={trabajando !== null}
                        onClick={() => llamar({ accion: 'radicar', postulacionId: p.id }, `radicar-${p.id}`)}
                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-b from-[#1F7D55] to-[#186A46] px-5 text-[13px] font-semibold text-white disabled:opacity-45"
                      >
                        <Send className="h-4 w-4" />
                        {trabajando === `radicar-${p.id}` ? 'Registrando…' : 'Registrar radicación'}
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          )
        })
      )}
    </div>
  )
}
