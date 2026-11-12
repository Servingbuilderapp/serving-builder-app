'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CONDICIONES, etiquetaCondicion, type Condicion } from '@/lib/empresarial/formulacion'
import { RadarEntorno } from '@/components/empresarial/Graficos'
import { FACTORES, alertasEntorno, calcularRadar, itemEntornoVacio, lecturaRadar, revisarEntorno, type Efecto, type Factor, type ItemEntorno } from '@/lib/empresarial/entorno'

const RELIEVE_BOTON =
  'shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200'
const RELIEVE_TARJETA = 'shadow-[0_1px_2px_rgba(84,20,43,0.06),0_10px_28px_-14px_rgba(84,20,43,0.22)]'
const CAMPO_INTERNO =
  'mt-1 w-full rounded-lg border border-ca-oro/40 bg-ca-tarjeta px-3 py-2 text-ca-vino placeholder:text-ca-vino/65 focus:outline-none focus:ring-2 focus:ring-ca-oro-claro'
const COLOR_ALERTA: Record<string, string> = {
  Importante: 'border-ca-oro/70 bg-ca-fondo',
  Preventiva: 'border-ca-oro/50 bg-ca-fondo',
  Informativa: 'border-ca-oro/45 bg-ca-fondo',
}

interface Props {
  proyecto: { id: string; nombre: string }
  itemsIniciales: ItemEntorno[]
  yaGuardado: boolean
}

export function EntornoClient({ proyecto, itemsIniciales, yaGuardado }: Props) {
  const [items, setItems] = useState<ItemEntorno[]>(itemsIniciales)
  const [idsGuardados, setIdsGuardados] = useState<string[]>(itemsIniciales.map((x) => x.id))
  const [guardado, setGuardado] = useState(yaGuardado)
  const [sucio, setSucio] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const botonOro = `h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-ca-oro-claro to-ca-oro text-ca-vino-hondo font-extrabold disabled:opacity-50 disabled:cursor-not-allowed ${RELIEVE_BOTON}`
  const botonSuave = `h-11 px-4 inline-flex items-center justify-center gap-2 rounded-xl border border-ca-oro/50 bg-ca-tarjeta text-ca-vino font-semibold ${RELIEVE_BOTON}`

  const radar = useMemo(() => calcularRadar(items), [items])
  const lectura = useMemo(() => lecturaRadar(radar), [radar])
  const alertas = useMemo(() => alertasEntorno(items), [items])
  const revision = useMemo(() => revisarEntorno(items), [items])
  const faltan = revision.filter((x) => x.obligatorio && !x.cumple)
  const hayDatos = items.some((i) => i.texto.trim())

  const cambiar = (id: string, x: Partial<ItemEntorno>) => {
    setItems((p) => p.map((i) => (i.id === id ? { ...i, ...x } : i)))
    setSucio(true)
  }
  const agregar = (factor: Factor, efecto: Efecto = 'ayuda') => {
    setItems((p) => [...p, itemEntornoVacio(factor, efecto)])
    setSucio(true)
  }
  const quitar = (id: string) => {
    setItems((p) => p.filter((x) => x.id !== id))
    setSucio(true)
  }

  async function guardar() {
    setAviso(null)
    setGuardando(true)
    const supabase = createClient()
    const conTexto = items.filter((i) => i.texto.trim())
    const contador: Record<string, number> = {}
    const filas = conTexto.map((i) => {
      contador[i.factor] = (contador[i.factor] ?? 0) + 1
      return {
        anterior: i.id,
        fila: {
          id: i.id.startsWith('nuevo-') ? crypto.randomUUID() : i.id,
          proyecto_id: proyecto.id,
          factor: i.factor,
          texto: i.texto.trim(),
          efecto: i.efecto,
          peso: Number(i.peso) || 3,
          fuente: i.fuente.trim() || null,
          condicion: i.condicion,
          orden: contador[i.factor],
        },
      }
    })
    if (filas.length > 0) {
      const { error } = await supabase.from('sfpe_entorno_items').upsert(filas.map((x) => x.fila), { onConflict: 'id' })
      if (error) {
        setGuardando(false)
        return setAviso({ tipo: 'error', texto: 'No pudimos guardar el Radar del Entorno. Intenta de nuevo.' })
      }
    }
    const nuevos = filas.map((x) => x.fila.id)
    const borrar = idsGuardados.filter((id) => !nuevos.includes(id))
    if (borrar.length > 0) await supabase.from('sfpe_entorno_items').delete().in('id', borrar)
    const mapa = new Map(filas.map((x) => [x.anterior, x.fila.id]))
    setItems(conTexto.map((i) => ({ ...i, id: mapa.get(i.id) ?? i.id })))
    setIdsGuardados(nuevos)
    setGuardado(true)
    setSucio(false)
    setGuardando(false)
    setAviso({ tipo: 'ok', texto: 'Radar del Entorno guardado.' })
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino">
      <div className="max-w-[1000px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <Link href={`/empresarial/camino?proyecto=${proyecto.id}`} className="inline-flex items-center gap-2 text-sm text-ca-vino/75 hover:text-ca-vino-hondo">
          <ArrowLeft className="h-4 w-4" /> Volver a mi camino
        </Link>

        <div className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-ca-oro-texto">Radar del Entorno · {proyecto.nombre}</div>
        <h1 className="mt-3 text-3xl lg:text-4xl font-extrabold">¿Qué pasa afuera que toca tu proyecto?</h1>
        <p className="mt-3 text-ca-vino/80 leading-relaxed">
          Tu negocio no vive solo: lo rodean decisiones del gobierno, la economía, la gente, la tecnología, el clima y las leyes. En cada frente escribe lo que te ayuda y lo que te perjudica, y dale un peso de 1 a 5 según cuánto importa. El radar te muestra por dónde te llegan las oportunidades y por dónde las amenazas, y luego puedes llevarlas a tu DOFA.
        </p>

        <h2 className="mt-8 text-2xl font-extrabold">1. Revisa los seis frentes</h2>
        <div className="mt-4 grid gap-5 lg:grid-cols-2">
          {FACTORES.map((f) => {
            const propios = items.filter((i) => i.factor === f.clave)
            return (
              <section key={f.clave} className={`rounded-2xl border bg-ca-tarjeta p-5 ${RELIEVE_TARJETA}`} style={{ borderColor: f.color + '99' }}>
                <div className="flex items-center gap-3">
                  <span aria-hidden className="inline-block h-10 w-2 rounded-full" style={{ background: f.color }} />
                  <h3 className="text-lg font-extrabold leading-tight">{f.titulo}</h3>
                </div>
                <p className="mt-3 text-sm text-ca-vino/80">{f.pista}</p>
                <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-ca-vino/75">
                  {f.preguntas.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-ca-vino/75">Ejemplo: {f.ejemplo}</p>

                <ul className="mt-4 space-y-3">
                  {propios.map((i, n) => (
                    <li key={i.id} className="rounded-xl bg-ca-fondo p-3">
                      <div className="flex items-start gap-2">
                        <div className="w-full">
                          <label className="sr-only" htmlFor={`en-${i.id}`}>
                            {f.titulo} {n + 1}
                          </label>
                          <textarea id={`en-${i.id}`} rows={2} value={i.texto} placeholder="Escríbelo con tus palabras" onChange={(e) => cambiar(i.id, { texto: e.target.value })} className={CAMPO_INTERNO} />
                        </div>
                        <button type="button" aria-label={`Quitar ${f.titulo} ${n + 1}`} onClick={() => quitar(i.id)} className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ca-oro/40 text-ca-vino/80 hover:text-ca-vino-hondo">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-3">
                        <label className="text-xs text-ca-vino/75">
                          ¿Te ayuda o te perjudica?
                          <select value={i.efecto} onChange={(e) => cambiar(i.id, { efecto: e.target.value as Efecto })} className={CAMPO_INTERNO}>
                            <option value="ayuda">Me ayuda</option>
                            <option value="perjudica">Me perjudica</option>
                          </select>
                        </label>
                        <label className="text-xs text-ca-vino/75">
                          ¿Cuánto importa?
                          <select value={i.peso} onChange={(e) => cambiar(i.id, { peso: e.target.value })} className={CAMPO_INTERNO}>
                            <option value="1">1 · Poco</option>
                            <option value="2">2</option>
                            <option value="3">3 · Medio</option>
                            <option value="4">4</option>
                            <option value="5">5 · Mucho</option>
                          </select>
                        </label>
                        <label className="text-xs text-ca-vino/75">
                          ¿De dónde sale?
                          <input value={i.fuente} placeholder="Noticia, norma, dato…" onChange={(e) => cambiar(i.id, { fuente: e.target.value })} className={CAMPO_INTERNO} />
                        </label>
                      </div>
                      <label className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ca-vino/75">
                        <span>¿Qué tan seguro es?</span>
                        <select aria-label={`Condición: ${f.titulo} ${n + 1}`} value={i.condicion} onChange={(e) => cambiar(i.id, { condicion: e.target.value as Condicion })} className="h-9 rounded-lg border border-ca-oro/50 bg-ca-tarjeta px-2 text-ca-vino">
                          {CONDICIONES.map((c) => (
                            <option key={c.valor} value={c.valor}>
                              {c.etiqueta}
                            </option>
                          ))}
                        </select>
                      </label>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className={botonSuave} onClick={() => agregar(f.clave, 'ayuda')}>
                    <Plus className="h-4 w-4" /> Algo que me ayuda
                  </button>
                  <button type="button" className={botonSuave} onClick={() => agregar(f.clave, 'perjudica')}>
                    <Plus className="h-4 w-4" /> Algo que me perjudica
                  </button>
                </div>
              </section>
            )
          })}
        </div>

        <section className={`mt-8 rounded-2xl border border-ca-oro/60 bg-ca-fondo p-5 lg:p-6 ${RELIEVE_TARJETA}`}>
          <h2 className="text-2xl font-extrabold">2. Tu radar</h2>
          {!hayDatos ? (
            <p className="mt-2 text-sm text-ca-vino/75">Escribe al menos un elemento para ver tu radar.</p>
          ) : (
            <>
              <div className="mt-4 grid gap-6 lg:grid-cols-2 lg:items-center">
                <RadarEntorno titulo="Radar del entorno: lo que ayuda y lo que perjudica en cada frente" ejes={radar.map((p) => ({ etiqueta: p.titulo, ayuda: p.ayuda, perjudica: p.perjudica }))} />
                <div className="space-y-3">
                  {lectura.map((l) => (
                    <div key={l.titulo} className="rounded-xl bg-ca-tarjeta p-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-ca-oro-texto">{l.titulo}</div>
                      <p className="mt-1 text-sm">{l.texto}</p>
                    </div>
                  ))}
                  <p className="text-xs text-ca-vino/75">Es una forma de ordenar lo que escribiste y los pesos que le diste. No es una medición ni un pronóstico.</p>
                </div>
              </div>
            </>
          )}
        </section>

        {alertas.length > 0 && (
          <section className="mt-6 space-y-3" aria-label="Alertas">
            {alertas.map((a, i) => (
              <div key={i} role="note" className={`rounded-2xl border p-4 text-sm ${COLOR_ALERTA[a.nivel]}`}>
                <span className="mr-2 text-xs font-bold uppercase tracking-wider text-ca-oro-texto">{a.nivel}</span>
                {a.texto}
              </div>
            ))}
          </section>
        )}

        <section className={`mt-6 rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-5 ${RELIEVE_TARJETA}`}>
          <h2 className="text-xl font-extrabold">Revisión</h2>
          <p className="mt-1 text-sm text-ca-vino/75">
            {faltan.length === 0 ? 'Tienes lo necesario para seguir. Los recomendados puedes completarlos después.' : `Falta${faltan.length === 1 ? '' : 'n'} ${faltan.length} ${faltan.length === 1 ? 'parte necesaria' : 'partes necesarias'}.`}
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {revision.map((x) => (
              <li key={x.clave} className="flex items-start gap-3 rounded-xl bg-ca-fondo px-4 py-3">
                <span aria-hidden className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${x.cumple ? 'bg-ca-oro-claro text-ca-vino-hondo' : 'border border-ca-oro/60 text-ca-vino/75'}`}>
                  {x.cumple ? '✓' : '·'}
                </span>
                <span>
                  <span className="block">
                    {x.texto} <span className="text-xs text-ca-vino/75">({x.obligatorio ? 'necesario' : 'recomendado'})</span>
                  </span>
                  {!x.cumple && <span className="block text-xs text-ca-vino/75">{x.ayuda}</span>}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ca-vino/75">Dato marcado como “{etiquetaCondicion('supuesto')}” o “{etiquetaCondicion('pendiente')}”: compruébalo antes de presentarlo como hecho.</p>
        </section>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button type="button" onClick={guardar} disabled={guardando} className={botonOro}>
            {guardando ? 'Guardando…' : 'Guardar Radar del Entorno'}
          </button>
          {guardado && !sucio && (
            <Link href={`/empresarial/dofa?proyecto=${proyecto.id}`} className={botonSuave}>
              Seguir: análisis DOFA
            </Link>
          )}
          {sucio && !guardando && <span className="text-sm text-ca-oro-texto">Tienes cambios sin guardar.</span>}
        </div>
        {aviso && (
          <div role={aviso.tipo === 'error' ? 'alert' : 'status'} className={`mt-4 rounded-2xl border p-4 text-sm ${aviso.tipo === 'error' ? 'border-ca-rojo/60 bg-ca-rojo/10' : 'border-ca-oro/60 bg-ca-fondo'}`}>
            {aviso.texto}
          </div>
        )}
      </div>
    </main>
  )
}
