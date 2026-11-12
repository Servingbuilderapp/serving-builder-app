'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  CRITERIOS,
  DECISIONES,
  ESTADO_POR_DECISION,
  atractivoYViabilidad,
  avisosDeCautela,
  bandaDe,
  calcularPuntaje,
  criteriosCalificados,
  prioridadSugerida,
  type Calificaciones,
  type ClaveDecision,
} from '@/lib/empresarial/evaluacion'

const RELIEVE_BOTON =
  'shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200'
const RELIEVE_TARJETA = 'shadow-[0_1px_2px_rgba(84,20,43,0.06),0_10px_28px_-14px_rgba(84,20,43,0.22)]'

interface Oportunidad {
  id: string
  nombre: string
  categoria: string | null
  cliente_o_beneficiario: string | null
  valor_generado: string | null
  estado: string
  puntaje_preliminar: number | null
}

interface Decision {
  id: string
  oportunidad_id: string
  decision: string
  motivo: string
  decidida_en: string
}

interface Evaluacion {
  calificaciones: Record<string, number>
  justificaciones: Record<string, string>
}

interface Props {
  proyecto: { id: string; nombre: string }
  oportunidadesIniciales: Oportunidad[]
  evaluacionesIniciales: Record<string, Evaluacion>
  decisionesIniciales: Decision[]
}

const campoClase =
  'mt-1 w-full rounded-xl border border-ca-oro/40 bg-ca-fondo px-4 py-3 text-ca-vino placeholder:text-ca-vino/65 focus:outline-none focus:ring-2 focus:ring-ca-oro-claro'

const nombreDecision = (clave: string) => DECISIONES.find((d) => d.clave === clave)?.nombre ?? clave

export function EvaluarClient({ proyecto, oportunidadesIniciales, evaluacionesIniciales, decisionesIniciales }: Props) {
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>(oportunidadesIniciales)
  const [evaluaciones, setEvaluaciones] = useState<Record<string, Evaluacion>>(evaluacionesIniciales)
  const [decisiones, setDecisiones] = useState<Decision[]>(decisionesIniciales)
  const [error, aviso] = useState<string | null>(null)
  const [guardando, setGuardando] = useState<string | null>(null)
  // Lo que la persona está escribiendo ahora (todavía sin guardar).
  const [borradores, setBorradores] = useState<Record<string, Evaluacion>>({})
  const [formDecision, setFormDecision] = useState<Record<string, { decision: ClaveDecision | ''; motivo: string }>>({})

  const botonOro = `h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-ca-oro-claro to-ca-oro text-ca-vino-hondo font-extrabold disabled:opacity-50 disabled:cursor-not-allowed ${RELIEVE_BOTON}`
  const tarjeta = `rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-5 ${RELIEVE_TARJETA}`

  const borradorDe = (id: string): Evaluacion =>
    borradores[id] ?? evaluaciones[id] ?? { calificaciones: {}, justificaciones: {} }

  function calificar(id: string, clave: string, valor: number) {
    const b = borradorDe(id)
    setBorradores((p) => ({ ...p, [id]: { ...b, calificaciones: { ...b.calificaciones, [clave]: valor } } }))
  }

  function justificar(id: string, clave: string, texto: string) {
    const b = borradorDe(id)
    setBorradores((p) => ({ ...p, [id]: { ...b, justificaciones: { ...b.justificaciones, [clave]: texto } } }))
  }

  async function guardarEvaluacion(o: Oportunidad) {
    const b = borradorDe(o.id)
    const puntaje = calcularPuntaje(b.calificaciones)
    if (puntaje === null) return aviso('Falta calificar algún criterio.')
    aviso(null)
    setGuardando(o.id)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: ev, error: e1 } = await supabase
      .from('sfpe_evaluaciones_oportunidad')
      .insert({ proyecto_id: proyecto.id, oportunidad_id: o.id, puntaje_total: puntaje, evaluador_id: user?.id ?? null })
      .select('id')
      .single()
    if (e1 || !ev) {
      setGuardando(null)
      return aviso('No pudimos guardar la evaluación. Intenta de nuevo.')
    }

    const filas = CRITERIOS.map((k) => ({
      proyecto_id: proyecto.id,
      evaluacion_id: ev.id,
      criterio: k.clave,
      peso: k.peso,
      calificacion: b.calificaciones[k.clave],
      justificacion: (b.justificaciones[k.clave] ?? '').trim() || null,
    }))
    const { error: e2 } = await supabase.from('sfpe_evaluacion_criterios').insert(filas)
    if (e2) {
      await supabase.from('sfpe_evaluaciones_oportunidad').delete().eq('id', ev.id)
      setGuardando(null)
      return aviso('No pudimos guardar las calificaciones. Intenta de nuevo.')
    }

    await supabase.from('sfpe_oportunidades').update({ puntaje_preliminar: puntaje, actualizada_en: new Date().toISOString() }).eq('id', o.id)
    setGuardando(null)
    setEvaluaciones((p) => ({ ...p, [o.id]: b }))
    setOportunidades((p) => p.map((x) => (x.id === o.id ? { ...x, puntaje_preliminar: puntaje } : x)))
  }

  async function guardarDecision(o: Oportunidad) {
    const f = formDecision[o.id]
    if (!f?.decision) return aviso('Elige qué vas a hacer con esta oportunidad.')
    if (!f.motivo.trim()) return aviso('Escribe el motivo de tu decisión.')
    aviso(null)
    setGuardando('d' + o.id)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { data, error: e } = await supabase
      .from('sfpe_decisiones')
      .insert({
        proyecto_id: proyecto.id,
        oportunidad_id: o.id,
        decision: f.decision,
        motivo: f.motivo.trim(),
        responsable_id: user?.id ?? null,
      })
      .select('id, oportunidad_id, decision, motivo, decidida_en')
      .single()
    if (e || !data) {
      setGuardando(null)
      return aviso('No pudimos guardar la decisión. Intenta de nuevo.')
    }
    const nuevoEstado = ESTADO_POR_DECISION[f.decision]
    if (nuevoEstado) {
      await supabase
        .from('sfpe_oportunidades')
        .update({ estado: nuevoEstado, actualizada_en: new Date().toISOString() })
        .eq('id', o.id)
      setOportunidades((p) => p.map((x) => (x.id === o.id ? { ...x, estado: nuevoEstado } : x)))
    }
    setGuardando(null)
    setDecisiones((p) => [data as Decision, ...p])
    setFormDecision((p) => ({ ...p, [o.id]: { decision: '', motivo: '' } }))
  }

  const evaluadas = useMemo(() => {
    return oportunidades
      .map((o) => {
        const ev = evaluaciones[o.id]
        const puntaje = ev ? calcularPuntaje(ev.calificaciones) : null
        return { o, ev, puntaje }
      })
      .filter((x): x is { o: Oportunidad; ev: Evaluacion; puntaje: number } => x.ev !== undefined && x.puntaje !== null)
      .sort((a, b) => b.puntaje - a.puntaje)
  }, [oportunidades, evaluaciones])

  const sinEvaluar = oportunidades.filter((o) => !evaluaciones[o.id])

  return (
    <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino">
      <div className="max-w-[900px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <Link
          href={`/empresarial/oportunidades?proyecto=${proyecto.id}`}
          className="inline-flex items-center gap-2 text-sm text-ca-vino/75 hover:text-ca-vino-hondo"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a mis oportunidades
        </Link>

        <div className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-ca-oro-texto">
          Evaluar y comparar · {proyecto.nombre}
        </div>
        <h1 className="mt-3 text-3xl lg:text-4xl font-extrabold">¿Cuál conviene trabajar primero?</h1>
        <p className="mt-3 text-ca-vino/80 leading-relaxed">
          Califica cada oportunidad en 9 aspectos, de 1 a 5. Te damos un puntaje sobre 100 para poder compararlas. El
          puntaje es una guía para ordenar: no prueba que haya clientes ni que vaya a funcionar. Eso se comprueba después.
        </p>

        {error && (
          <div role="alert" className="mt-6 rounded-2xl border border-ca-rojo/60 bg-ca-rojo/10 p-4 text-sm">
            {error}
          </div>
        )}

        {oportunidades.length === 0 && (
          <p className={`mt-10 text-sm text-ca-vino/80 ${tarjeta}`}>
            Aún no tienes oportunidades para evaluar. Vuelve a la pantalla anterior, convierte una sugerencia o agrega la tuya.
          </p>
        )}

        {/* 1. CALIFICAR */}
        {oportunidades.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-extrabold">1. Califica tus oportunidades</h2>
            <p className="mt-1 text-sm text-ca-vino/75">Abre una, califica los 9 aspectos y guarda. Puedes volver a calificar cuando sepas más.</p>
            <div className="mt-4 space-y-4">
              {oportunidades.map((o) => {
                const b = borradorDe(o.id)
                const hechos = criteriosCalificados(b.calificaciones)
                const puntaje = calcularPuntaje(b.calificaciones)
                const banda = puntaje !== null ? bandaDe(puntaje) : null
                const avisos = avisosDeCautela(b.calificaciones, b.justificaciones)
                return (
                  <details key={o.id} className={tarjeta}>
                    <summary className="cursor-pointer list-none">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="font-bold">{o.nombre}</div>
                        <span className="rounded-full bg-ca-fondo border border-ca-oro/40 px-3 py-1 text-xs font-semibold">
                          {evaluaciones[o.id] ? `Última evaluación: ${o.puntaje_preliminar ?? '—'} / 100` : 'Sin evaluar'}
                        </span>
                      </div>
                    </summary>

                    <div className="mt-5 space-y-6">
                      {CRITERIOS.map((k, i) => {
                        const v = b.calificaciones[k.clave]
                        return (
                          <div key={k.clave} className="rounded-xl border border-ca-oro/40 bg-ca-fondo/60 p-4">
                            <div className="font-semibold">
                              {i + 1}. {k.nombre}
                            </div>
                            <div className="text-xs text-ca-vino/75">{k.pregunta}</div>
                            <div className="mt-3 flex gap-2" role="group" aria-label={k.nombre}>
                              {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                  key={n}
                                  type="button"
                                  aria-pressed={v === n}
                                  onClick={() => calificar(o.id, k.clave, n)}
                                  className={`h-11 w-11 rounded-xl font-extrabold border ${RELIEVE_BOTON} ${
                                    v === n
                                      ? 'bg-gradient-to-b from-ca-oro-claro to-ca-oro text-ca-vino-hondo border-ca-oro'
                                      : 'bg-ca-tarjeta border-ca-oro/40 text-ca-vino'
                                  }`}
                                >
                                  {n}
                                </button>
                              ))}
                            </div>
                            <p className="mt-2 text-xs text-ca-vino/75 min-h-[1rem]">
                              {v ? `${v}: ${k.guia[v - 1]}` : '1 = muy bajo · 5 = muy alto. Elige un número.'}
                            </p>
                            <label className="mt-3 block text-xs font-semibold">
                              ¿En qué te basas? (opcional)
                              <input
                                className={campoClase}
                                value={b.justificaciones[k.clave] ?? ''}
                                onChange={(e) => justificar(o.id, k.clave, e.target.value)}
                              />
                            </label>
                          </div>
                        )
                      })}

                      <div className="rounded-xl border border-ca-oro/50 bg-ca-fondo p-4">
                        {puntaje === null || banda === null ? (
                          <p className="text-sm">Llevas {hechos} de 9 aspectos. Faltan {9 - hechos} para ver el puntaje.</p>
                        ) : (
                          <>
                            <div className="text-3xl font-extrabold text-ca-oro-texto">{puntaje} / 100</div>
                            <div className="mt-1 font-semibold">{banda.nombre}</div>
                            <p className="text-sm text-ca-vino/80">{banda.texto}</p>
                          </>
                        )}
                        {avisos.map((a) => (
                          <p key={a} className="mt-2 text-sm text-ca-vino/90">
                            • {a}
                          </p>
                        ))}
                      </div>

                      <button
                        type="button"
                        className={botonOro}
                        disabled={puntaje === null || guardando === o.id}
                        onClick={() => guardarEvaluacion(o)}
                      >
                        {guardando === o.id ? 'Guardando…' : 'Guardar evaluación'}
                      </button>
                    </div>
                  </details>
                )
              })}
            </div>
          </section>
        )}

        {/* 2. COMPARAR */}
        {oportunidades.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-extrabold">2. Compara y decide</h2>
            <p className="mt-1 text-sm text-ca-vino/75">
              De mayor a menor puntaje. Ojo: una oportunidad puede ser muy atractiva y aun así no ser la primera, si hoy
              te faltan recursos o acceso a los clientes.
            </p>

            {evaluadas.length === 0 ? (
              <p className={`mt-4 text-sm text-ca-vino/80 ${tarjeta}`}>
                Cuando guardes la primera evaluación, aquí aparecerá la comparación.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {evaluadas.map(({ o, ev, puntaje }, idx) => {
                  const banda = bandaDe(puntaje)
                  const av = atractivoYViabilidad(ev.calificaciones as Calificaciones)
                  const ultima = decisiones.find((d) => d.oportunidad_id === o.id)
                  const f = formDecision[o.id] ?? { decision: '' as const, motivo: '' }
                  return (
                    <div key={o.id} className={tarjeta}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-bold text-ca-oro-texto">Lugar {idx + 1}</div>
                          <div className="font-bold">{o.nombre}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-extrabold text-ca-oro-texto">{puntaje} / 100</div>
                          <div className="text-xs font-semibold">{banda.nombre}</div>
                        </div>
                      </div>

                      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-xs text-ca-vino/75">Para quién</dt>
                          <dd>{o.cliente_o_beneficiario || 'Sin completar en la ficha'}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-ca-vino/75">Valor esperado</dt>
                          <dd>{o.valor_generado || 'Sin completar en la ficha'}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-ca-vino/75">Qué tan atractiva / qué tan posible</dt>
                          <dd>
                            Atractivo {av.atractivo} · Viabilidad {av.viabilidad}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-ca-vino/75">Prioridad sugerida</dt>
                          <dd>{prioridadSugerida(ev.calificaciones as Calificaciones, puntaje)}</dd>
                        </div>
                      </dl>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="rounded-full bg-ca-fondo border border-ca-oro/40 px-3 py-1">{o.estado}</span>
                        {ultima && (
                          <span className="rounded-full bg-ca-fondo border border-ca-oro/40 px-3 py-1">
                            Decisión: {nombreDecision(ultima.decision)}
                          </span>
                        )}
                      </div>
                      {ultima && <p className="mt-2 text-xs text-ca-vino/75">Motivo: {ultima.motivo}</p>}

                      <div className="mt-4 border-t border-ca-oro/40 pt-4 space-y-3">
                        <label className="block text-sm font-semibold">
                          ¿Qué vas a hacer con ella?
                          <select
                            className={campoClase}
                            value={f.decision}
                            onChange={(e) =>
                              setFormDecision((p) => ({ ...p, [o.id]: { ...f, decision: e.target.value as ClaveDecision | '' } }))
                            }
                          >
                            <option value="">Elige una</option>
                            {DECISIONES.map((d) => (
                              <option key={d.clave} value={d.clave}>
                                {d.nombre} — {d.ayuda}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block text-sm font-semibold">
                          ¿Por qué?
                          <textarea
                            rows={2}
                            className={campoClase}
                            value={f.motivo}
                            onChange={(e) => setFormDecision((p) => ({ ...p, [o.id]: { ...f, motivo: e.target.value } }))}
                          />
                        </label>
                        <button
                          type="button"
                          className={botonOro}
                          disabled={guardando === 'd' + o.id}
                          onClick={() => guardarDecision(o)}
                        >
                          {guardando === 'd' + o.id ? 'Guardando…' : 'Guardar decisión'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {sinEvaluar.length > 0 && (
              <p className="mt-4 text-sm text-ca-vino/75">
                Sin evaluar todavía: {sinEvaluar.map((o) => o.nombre).join(', ')}.
              </p>
            )}
          </section>
        )}

        <p className="mt-12 text-center text-sm text-ca-vino/75">
          Descartar o aplazar no borra nada: la oportunidad y tus decisiones quedan guardadas con su motivo.
        </p>
      </div>
    </main>
  )
}
