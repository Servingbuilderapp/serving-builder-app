'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  FRECUENCIAS,
  NIVELES_CERTEZA,
  camposFaltantes,
  causasATexto,
  textoACausas,
  type NivelCerteza,
  type Problema,
} from '@/lib/empresarial/problemas'

const RELIEVE_BOTON =
  'shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200'
const RELIEVE_TARJETA = 'shadow-[0_1px_2px_rgba(11,42,74,0.06),0_10px_28px_-14px_rgba(11,42,74,0.22)]'

interface OportunidadCorta {
  id: string
  nombre: string
  problema_id: string | null
}

interface Props {
  proyecto: { id: string; nombre: string }
  problemasIniciales: Problema[]
  oportunidadesIniciales: OportunidadCorta[]
}

const campoClase =
  'mt-1 w-full rounded-xl border border-[#B08D57]/40 bg-[#2E0E1A] px-4 py-3 text-[#F3E7DC] placeholder:text-[#F3E7DC]/40 focus:outline-none focus:ring-2 focus:ring-[#C9A46B]'

const COLUMNAS =
  'id, titulo, descripcion, afectados, ubicacion, frecuencia, consecuencias, causas, nivel_certeza, hallazgo_id, creada_en'

type TextoClave = 'titulo' | 'descripcion' | 'afectados' | 'ubicacion' | 'consecuencias'

export function ProblemasClient({ proyecto, problemasIniciales, oportunidadesIniciales }: Props) {
  const [problemas, setProblemas] = useState<Problema[]>(problemasIniciales)
  const [oportunidades, setOportunidades] = useState<OportunidadCorta[]>(oportunidadesIniciales)
  // Las causas se escriben una por línea; se guardan aparte como texto mientras se edita.
  const [causasTexto, setCausasTexto] = useState<Record<string, string>>(() =>
    Object.fromEntries(problemasIniciales.map((p) => [p.id, causasATexto(p.causas)])),
  )
  const [error, aviso] = useState<string | null>(null)
  const [guardando, setGuardando] = useState<string | null>(null)
  const [nuevoTitulo, setNuevoTitulo] = useState('')

  const botonOro = `h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#C9A46B] to-[#B08D57] text-[#3A1420] font-extrabold disabled:opacity-50 disabled:cursor-not-allowed ${RELIEVE_BOTON}`
  const botonSuave = `h-12 px-5 inline-flex items-center justify-center gap-2 rounded-xl border border-[#B08D57]/50 bg-[#3B1727] text-[#F3E7DC] font-semibold disabled:opacity-40 ${RELIEVE_BOTON}`

  async function agregar() {
    if (!nuevoTitulo.trim()) return aviso('Escribe en una frase cuál es el problema.')
    aviso(null)
    setGuardando('nuevo')
    const supabase = createClient()
    const { data, error: e } = await supabase
      .from('sfpe_problemas')
      .insert({ proyecto_id: proyecto.id, titulo: nuevoTitulo.trim(), nivel_certeza: 'hipotesis' })
      .select(COLUMNAS)
      .single()
    setGuardando(null)
    if (e || !data) return aviso('No pudimos guardar el problema. Intenta de nuevo.')
    const p = { ...data, causas: [] } as Problema
    setProblemas((prev) => [p, ...prev])
    setCausasTexto((prev) => ({ ...prev, [p.id]: '' }))
    setNuevoTitulo('')
  }

  function cambiar(id: string, clave: TextoClave | 'frecuencia' | 'nivel_certeza', valor: string) {
    setProblemas((prev) => prev.map((p) => (p.id === id ? { ...p, [clave]: valor } : p)))
  }

  async function guardar(p: Problema) {
    aviso(null)
    setGuardando(p.id)
    const causas = textoACausas(causasTexto[p.id] ?? '')
    const supabase = createClient()
    const { error: e } = await supabase
      .from('sfpe_problemas')
      .update({
        titulo: p.titulo.trim() || 'Sin título',
        descripcion: p.descripcion,
        afectados: p.afectados,
        ubicacion: p.ubicacion,
        frecuencia: p.frecuencia || null,
        consecuencias: p.consecuencias,
        causas,
        nivel_certeza: p.nivel_certeza || null,
      })
      .eq('id', p.id)
    setGuardando(null)
    if (e) return aviso('No pudimos guardar los cambios. Intenta de nuevo.')
    setProblemas((prev) => prev.map((x) => (x.id === p.id ? { ...x, causas } : x)))
  }

  async function relacionar(oportunidadId: string, problemaId: string | null) {
    aviso(null)
    setGuardando(oportunidadId)
    const supabase = createClient()
    const { error: e } = await supabase
      .from('sfpe_oportunidades')
      .update({ problema_id: problemaId, actualizada_en: new Date().toISOString() })
      .eq('id', oportunidadId)
    setGuardando(null)
    if (e) return aviso('No pudimos relacionar la oportunidad. Intenta de nuevo.')
    setOportunidades((prev) => prev.map((o) => (o.id === oportunidadId ? { ...o, problema_id: problemaId } : o)))
  }

  const CAMPOS: { clave: TextoClave; etiqueta: string; ayuda: string; largo?: boolean }[] = [
    { clave: 'descripcion', etiqueta: 'Qué pasa exactamente', ayuda: 'Cuéntalo con ejemplos, como se lo contarías a un amigo.', largo: true },
    { clave: 'afectados', etiqueta: 'A quién le pasa', ayuda: 'Clientes, tu equipo, una comunidad, tú mismo…' },
    { clave: 'ubicacion', etiqueta: 'Dónde ocurre', ayuda: 'Ciudad, región, tipo de lugar.' },
    { clave: 'consecuencias', etiqueta: 'Qué consecuencias tiene', ayuda: 'Qué pierden o sufren quienes lo viven.', largo: true },
  ]

  const sinProblema = oportunidades.filter((o) => !o.problema_id)

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2E0E1A] via-[#3B1727] to-[#54142B] text-[#F3E7DC]">
      <div className="max-w-[900px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <Link
          href={`/empresarial/oportunidades?proyecto=${proyecto.id}`}
          className="inline-flex items-center gap-2 text-sm text-[#F3E7DC]/70 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a mis oportunidades
        </Link>

        <div className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-[#C9A46B]">
          Problemas · {proyecto.nombre}
        </div>
        <h1 className="mt-3 text-3xl lg:text-4xl font-extrabold">¿Qué problema real quieres resolver?</h1>
        <p className="mt-3 text-[#F3E7DC]/80 leading-relaxed">
          Un buen proyecto casi siempre nace de un problema que alguien vive de verdad. Aquí lo describes con claridad y
          dices qué tan seguro estás. Un mismo problema puede tener varias oportunidades para resolverlo.
        </p>

        {error && (
          <div role="alert" className="mt-6 rounded-2xl border border-[#B3261E]/60 bg-[#B3261E]/15 p-4 text-sm">
            {error}
          </div>
        )}

        {/* AGREGAR */}
        <section className="mt-10">
          <h2 className="text-xl font-extrabold">Agregar un problema</h2>
          <div className={`mt-4 rounded-2xl border border-[#B08D57]/35 bg-[#3B1727] p-5 space-y-4 ${RELIEVE_TARJETA}`}>
            <label className="block text-sm font-semibold">
              El problema, en una frase
              <input
                className={campoClase}
                value={nuevoTitulo}
                placeholder="Por ejemplo: las tiendas pequeñas pierden fruta por mal almacenamiento"
                onChange={(e) => setNuevoTitulo(e.target.value)}
              />
            </label>
            <button type="button" className={botonOro} disabled={guardando === 'nuevo'} onClick={agregar}>
              {guardando === 'nuevo' ? 'Guardando…' : 'Guardar problema'}
            </button>
          </div>
        </section>

        {/* MIS PROBLEMAS */}
        <section className="mt-12">
          <h2 className="text-xl font-extrabold">Mis problemas</h2>
          {problemas.length === 0 ? (
            <p className={`mt-4 rounded-2xl border border-[#B08D57]/35 bg-[#3B1727] p-5 text-sm text-[#F3E7DC]/80 ${RELIEVE_TARJETA}`}>
              Aún no tienes problemas guardados. Agrega uno arriba, o conviértelos desde las sugerencias de tu descubrimiento en
              la pantalla de oportunidades.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {problemas.map((p) => {
                const falta = camposFaltantes({ ...p, causas: textoACausas(causasTexto[p.id] ?? '') })
                const relacionadas = oportunidades.filter((o) => o.problema_id === p.id)
                const certeza = NIVELES_CERTEZA.find((n) => n.valor === p.nivel_certeza)
                return (
                  <details key={p.id} className={`rounded-2xl border border-[#B08D57]/35 bg-[#3B1727] p-5 ${RELIEVE_TARJETA}`}>
                    <summary className="cursor-pointer list-none">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="font-bold">{p.titulo}</div>
                        <div className="flex flex-wrap gap-2 text-xs font-semibold">
                          {certeza && (
                            <span className="rounded-full bg-gradient-to-b from-[#C9A46B] to-[#B08D57] text-[#3A1420] px-3 py-1">
                              {certeza.etiqueta}
                            </span>
                          )}
                          <span className="rounded-full bg-[#2E0E1A] border border-[#B08D57]/40 px-3 py-1">
                            {relacionadas.length} {relacionadas.length === 1 ? 'oportunidad' : 'oportunidades'}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-[#F3E7DC]/65">
                        {falta.length > 0 ? `Falta contar: ${falta.join(', ')}. Ábrelo para completarlo.` : 'Ficha completa. Ábrela para revisarla.'}
                      </p>
                    </summary>

                    <div className="mt-5 space-y-4">
                      <label className="block text-sm font-semibold">
                        El problema, en una frase
                        <input className={campoClase} value={p.titulo} onChange={(e) => cambiar(p.id, 'titulo', e.target.value)} />
                      </label>
                      {CAMPOS.map((c) => (
                        <label key={c.clave} className="block text-sm font-semibold">
                          {c.etiqueta}
                          <span className="block text-xs font-normal text-[#F3E7DC]/60">{c.ayuda}</span>
                          {c.largo ? (
                            <textarea
                              rows={3}
                              className={campoClase}
                              value={p[c.clave] ?? ''}
                              onChange={(e) => cambiar(p.id, c.clave, e.target.value)}
                            />
                          ) : (
                            <input className={campoClase} value={p[c.clave] ?? ''} onChange={(e) => cambiar(p.id, c.clave, e.target.value)} />
                          )}
                        </label>
                      ))}
                      <label className="block text-sm font-semibold">
                        Cada cuánto ocurre
                        <select className={campoClase} value={p.frecuencia ?? ''} onChange={(e) => cambiar(p.id, 'frecuencia', e.target.value)}>
                          <option value="">Elige una</option>
                          {FRECUENCIAS.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block text-sm font-semibold">
                        Por qué ocurre (una causa por línea)
                        <span className="block text-xs font-normal text-[#F3E7DC]/60">Puedes poner varias. Escribe una en cada renglón.</span>
                        <textarea
                          rows={3}
                          className={campoClase}
                          value={causasTexto[p.id] ?? ''}
                          onChange={(e) => setCausasTexto((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        />
                      </label>

                      <fieldset>
                        <legend className="text-sm font-semibold">¿Qué tan seguro estás de que este problema es real?</legend>
                        <div className="mt-2 grid gap-2 sm:grid-cols-3">
                          {NIVELES_CERTEZA.map((n) => {
                            const activo = p.nivel_certeza === n.valor
                            return (
                              <button
                                key={n.valor}
                                type="button"
                                aria-pressed={activo}
                                onClick={() => cambiar(p.id, 'nivel_certeza', n.valor as NivelCerteza)}
                                className={`rounded-xl border px-4 py-3 text-left text-sm ${RELIEVE_BOTON} ${
                                  activo
                                    ? 'border-[#C9A46B] bg-gradient-to-b from-[#C9A46B] to-[#B08D57] text-[#3A1420]'
                                    : 'border-[#B08D57]/40 bg-[#2E0E1A]'
                                }`}
                              >
                                <span className="block font-bold">{n.etiqueta}</span>
                                <span className={`block text-xs ${activo ? 'text-[#3A1420]/80' : 'text-[#F3E7DC]/65'}`}>{n.ayuda}</span>
                              </button>
                            )
                          })}
                        </div>
                      </fieldset>

                      <button type="button" className={botonOro} disabled={guardando === p.id} onClick={() => guardar(p)}>
                        {guardando === p.id ? 'Guardando…' : 'Guardar problema'}
                      </button>

                      {/* OPORTUNIDADES RELACIONADAS */}
                      <div className="border-t border-[#B08D57]/25 pt-5">
                        <div className="text-sm font-bold">Oportunidades para resolver este problema</div>
                        {relacionadas.length === 0 ? (
                          <p className="mt-2 text-sm text-[#F3E7DC]/70">Todavía ninguna. Relaciona una de las que ya tienes.</p>
                        ) : (
                          <ul className="mt-2 space-y-2">
                            {relacionadas.map((o) => (
                              <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#2E0E1A] px-4 py-3 text-sm">
                                <span>{o.nombre}</span>
                                <button
                                  type="button"
                                  className="text-xs underline text-[#F3E7DC]/75 hover:text-white disabled:opacity-40"
                                  disabled={guardando === o.id}
                                  onClick={() => relacionar(o.id, null)}
                                >
                                  Quitar relación
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                        {sinProblema.length > 0 && (
                          <label className="mt-3 block text-sm font-semibold">
                            Relacionar otra oportunidad
                            <select
                              className={campoClase}
                              value=""
                              disabled={guardando !== null}
                              onChange={(e) => e.target.value && relacionar(e.target.value, p.id)}
                            >
                              <option value="">Elige una oportunidad</option>
                              {sinProblema.map((o) => (
                                <option key={o.id} value={o.id}>
                                  {o.nombre}
                                </option>
                              ))}
                            </select>
                          </label>
                        )}
                      </div>
                    </div>
                  </details>
                )
              })}
            </div>
          )}
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href={`/empresarial/oportunidades?proyecto=${proyecto.id}`} className={botonSuave}>
            Volver a mis oportunidades
          </Link>
        </div>

        <p className="mt-10 text-center text-sm text-[#F3E7DC]/65">
          Un problema descrito no es un problema comprobado. Por eso pedimos que digas qué tan seguro estás; en el siguiente
          paso lo pondrás a prueba con evidencias.
        </p>
      </div>
    </main>
  )
}
