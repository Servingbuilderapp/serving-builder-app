'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CONDICIONES, etiquetaCondicion, type Condicion } from '@/lib/empresarial/formulacion'
import {
  CATEGORIAS,
  COLOR_NIVEL,
  RESPUESTAS,
  alertasRiesgos,
  contarPorNivel,
  itemRiesgoVacio,
  lecturaRiesgos,
  nivelDe,
  ordenarRiesgos,
  revisarRiesgos,
  tituloCategoria,
  type Categoria,
  type ItemRiesgo,
  type Respuesta,
  type RiesgoOrdenado,
} from '@/lib/empresarial/riesgos'

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
const CREMA = '#54142B'

/** Mapa de calor 5 × 5: probabilidad hacia la derecha, impacto hacia arriba. Cada riesgo es un círculo numerado. */
export function MapaCalor({ riesgos }: { riesgos: RiesgoOrdenado[] }) {
  const W = 420
  const H = 404
  const x0 = 50
  const y0 = 12
  const c = 68 // lado de cada casilla
  const celdas: React.ReactNode[] = []
  for (let imp = 5; imp >= 1; imp--) {
    for (let prob = 1; prob <= 5; prob++) {
      const nivel = nivelDe(imp * prob)
      celdas.push(<rect key={`${prob}-${imp}`} x={x0 + (prob - 1) * c} y={y0 + (5 - imp) * c} width={c - 2} height={c - 2} rx="6" fill={COLOR_NIVEL[nivel]} fillOpacity="0.38" />)
    }
  }
  // Varios riesgos en una misma casilla se reparten dentro de ella.
  const porCasilla = new Map<string, RiesgoOrdenado[]>()
  for (const r of riesgos) {
    const k = `${Number(r.item.probabilidad)}-${Number(r.item.impacto)}`
    porCasilla.set(k, [...(porCasilla.get(k) ?? []), r])
  }
  const puntos: React.ReactNode[] = []
  porCasilla.forEach((lista, k) => {
    const [prob, imp] = k.split('-').map(Number)
    const cx = x0 + (prob - 1) * c + (c - 2) / 2
    const cy = y0 + (5 - imp) * c + (c - 2) / 2
    lista.forEach((r, i) => {
      const dx = lista.length === 1 ? 0 : ((i % 2) - 0.5) * 26
      const dy = lista.length <= 2 ? 0 : (Math.floor(i / 2) - 0.5) * 24
      puntos.push(
        <g key={r.item.id}>
          <circle cx={cx + dx} cy={cy + dy} r="12" fill={CREMA} />
          <text x={cx + dx} y={cy + dy + 4.5} textAnchor="middle" fontSize="13" fontWeight="800" fill="#FBF7F0">
            {r.numero}
          </text>
        </g>,
      )
    })
  })
  const titulo = 'Mapa de calor de riesgos: probabilidad y impacto'
  return (
    <figure aria-label={titulo} className="mx-auto max-w-[460px]">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={titulo}>
        {celdas}
        {puntos}
        {[1, 2, 3, 4, 5].map((n) => (
          <g key={n} fontSize="13" fill={CREMA} fontWeight="700">
            <text x={x0 + (n - 1) * c + c / 2 - 1} y={y0 + 5 * c + 16} textAnchor="middle">{n}</text>
            <text x={x0 - 12} y={y0 + (5 - n) * c + c / 2 + 4} textAnchor="middle">{n}</text>
          </g>
        ))}
        <text x={x0 + (5 * c) / 2} y={H - 4} textAnchor="middle" fontSize="14" fontWeight="700" fill={CREMA}>
          Qué tan probable es →
        </text>
        <text transform={`translate(12 ${y0 + (5 * c) / 2}) rotate(-90)`} textAnchor="middle" fontSize="14" fontWeight="700" fill={CREMA}>
          Cuánto dolería →
        </text>
      </svg>
      <figcaption className="mt-1 text-center text-xs text-ca-vino/75">
        Arriba a la derecha están los riesgos más graves. {riesgos.map((r) => `${r.numero}: probabilidad ${r.item.probabilidad}, impacto ${r.item.impacto}`).join(' · ')}.
      </figcaption>
    </figure>
  )
}

interface Props {
  proyecto: { id: string; nombre: string }
  itemsIniciales: ItemRiesgo[]
  yaGuardado: boolean
}

export function RiesgosClient({ proyecto, itemsIniciales, yaGuardado }: Props) {
  const [items, setItems] = useState<ItemRiesgo[]>(itemsIniciales)
  const [idsGuardados, setIdsGuardados] = useState<string[]>(itemsIniciales.map((x) => x.id))
  const [guardado, setGuardado] = useState(yaGuardado)
  const [sucio, setSucio] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const botonOro = `h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-ca-oro-claro to-ca-oro text-ca-vino-hondo font-extrabold disabled:opacity-50 disabled:cursor-not-allowed ${RELIEVE_BOTON}`
  const botonSuave = `h-11 px-4 inline-flex items-center justify-center gap-2 rounded-xl border border-ca-oro/50 bg-ca-tarjeta text-ca-vino font-semibold ${RELIEVE_BOTON}`

  const ordenados = useMemo(() => ordenarRiesgos(items), [items])
  const conteo = useMemo(() => contarPorNivel(items), [items])
  const lectura = useMemo(() => lecturaRiesgos(items), [items])
  const alertas = useMemo(() => alertasRiesgos(items), [items])
  const revision = useMemo(() => revisarRiesgos(items), [items])
  const faltan = revision.filter((x) => x.obligatorio && !x.cumple)
  const hayDatos = ordenados.length > 0

  const cambiar = (id: string, x: Partial<ItemRiesgo>) => {
    setItems((p) => p.map((i) => (i.id === id ? { ...i, ...x } : i)))
    setSucio(true)
  }
  const agregar = (categoria: Categoria) => {
    setItems((p) => [...p, itemRiesgoVacio(categoria)])
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
      contador[i.categoria] = (contador[i.categoria] ?? 0) + 1
      return {
        anterior: i.id,
        fila: {
          id: i.id.startsWith('nuevo-') ? crypto.randomUUID() : i.id,
          proyecto_id: proyecto.id,
          categoria: i.categoria,
          texto: i.texto.trim(),
          probabilidad: Number(i.probabilidad) || 3,
          impacto: Number(i.impacto) || 3,
          respuesta: i.respuesta || null,
          plan: i.plan.trim() || null,
          responsable: i.responsable.trim() || null,
          fuente: i.fuente.trim() || null,
          condicion: i.condicion,
          orden: contador[i.categoria],
        },
      }
    })
    if (filas.length > 0) {
      const { error } = await supabase.from('sfpe_riesgos_items').upsert(filas.map((x) => x.fila), { onConflict: 'id' })
      if (error) {
        setGuardando(false)
        return setAviso({ tipo: 'error', texto: 'No pudimos guardar el Termómetro de Riesgos. Intenta de nuevo.' })
      }
    }
    const nuevos = filas.map((x) => x.fila.id)
    const borrar = idsGuardados.filter((id) => !nuevos.includes(id))
    if (borrar.length > 0) await supabase.from('sfpe_riesgos_items').delete().in('id', borrar)
    const mapa = new Map(filas.map((x) => [x.anterior, x.fila.id]))
    setItems(conTexto.map((i) => ({ ...i, id: mapa.get(i.id) ?? i.id })))
    setIdsGuardados(nuevos)
    setGuardado(true)
    setSucio(false)
    setGuardando(false)
    setAviso({ tipo: 'ok', texto: 'Termómetro de Riesgos guardado.' })
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino">
      <div className="max-w-[1000px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <Link href={`/empresarial/camino?proyecto=${proyecto.id}`} className="inline-flex items-center gap-2 text-sm text-ca-vino/75 hover:text-ca-vino-hondo">
          <ArrowLeft className="h-4 w-4" /> Volver a mi camino
        </Link>

        <div className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-ca-oro-texto">Termómetro de Riesgos · {proyecto.nombre}</div>
        <h1 className="mt-3 text-3xl lg:text-4xl font-extrabold">¿Qué podría salir mal y qué harás al respecto?</h1>
        <p className="mt-3 text-ca-vino/80 leading-relaxed">
          Todo proyecto tiene riesgos. Lo que importa es verlos antes. Escribe lo que podría salir mal, dile qué tan probable es y cuánto te dolería (de 1 a 5), y anota qué harás. El mapa te muestra cuáles atender primero.
        </p>

        <h2 className="mt-8 text-2xl font-extrabold">1. Escribe tus riesgos</h2>
        <p className="mt-1 text-sm text-ca-vino/75">Agrega los que se te ocurran en cada tipo. Si en un tipo no se te ocurre ninguno, déjalo vacío.</p>
        <div className="mt-4 grid gap-5 lg:grid-cols-2">
          {CATEGORIAS.map((cat) => {
            const propios = items.filter((i) => i.categoria === cat.clave)
            return (
              <section key={cat.clave} className={`rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-5 ${RELIEVE_TARJETA}`}>
                <h3 className="text-lg font-extrabold leading-tight">{cat.titulo}</h3>
                <p className="mt-2 text-sm text-ca-vino/80">{cat.pista}</p>
                <p className="mt-1 text-xs text-ca-vino/75">Ejemplo: {cat.ejemplo}</p>

                <ul className="mt-4 space-y-3">
                  {propios.map((i, n) => {
                    const puntaje = (Number(i.probabilidad) || 3) * (Number(i.impacto) || 3)
                    const nivel = nivelDe(puntaje)
                    return (
                      <li key={i.id} className="rounded-xl bg-ca-fondo p-3">
                        <div className="flex items-start gap-2">
                          <div className="w-full">
                            <label className="sr-only" htmlFor={`en-${i.id}`}>
                              {cat.titulo} {n + 1}
                            </label>
                            <textarea id={`en-${i.id}`} rows={2} value={i.texto} placeholder="Qué podría pasar" onChange={(e) => cambiar(i.id, { texto: e.target.value })} className={CAMPO_INTERNO} />
                          </div>
                          <button type="button" aria-label={`Quitar ${cat.titulo} ${n + 1}`} onClick={() => quitar(i.id)} className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ca-oro/40 text-ca-vino/80 hover:text-ca-vino-hondo">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-2 grid gap-2 sm:grid-cols-3">
                          <label className="text-xs text-ca-vino/75">
                            ¿Qué tan probable es?
                            <select value={i.probabilidad} onChange={(e) => cambiar(i.id, { probabilidad: e.target.value })} className={CAMPO_INTERNO}>
                              <option value="1">1 · Muy raro</option>
                              <option value="2">2 · Poco probable</option>
                              <option value="3">3 · Posible</option>
                              <option value="4">4 · Probable</option>
                              <option value="5">5 · Casi seguro</option>
                            </select>
                          </label>
                          <label className="text-xs text-ca-vino/75">
                            ¿Cuánto dolería?
                            <select value={i.impacto} onChange={(e) => cambiar(i.id, { impacto: e.target.value })} className={CAMPO_INTERNO}>
                              <option value="1">1 · Casi nada</option>
                              <option value="2">2 · Poco</option>
                              <option value="3">3 · Medio</option>
                              <option value="4">4 · Mucho</option>
                              <option value="5">5 · Podría acabar el proyecto</option>
                            </select>
                          </label>
                          <div className="text-xs text-ca-vino/75">
                            Nivel
                            <div className="mt-1 flex h-[42px] items-center rounded-lg border px-3 font-extrabold text-ca-vino-hondo" style={{ borderColor: COLOR_NIVEL[nivel], background: COLOR_NIVEL[nivel] + '33' }}>
                              {nivel} · {puntaje}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          <label className="text-xs text-ca-vino/75">
                            ¿Qué piensas hacer?
                            <select value={i.respuesta} onChange={(e) => cambiar(i.id, { respuesta: e.target.value as Respuesta | '' })} className={CAMPO_INTERNO}>
                              <option value="">Aún no lo sé</option>
                              {RESPUESTAS.map((r) => (
                                <option key={r.clave} value={r.clave}>
                                  {r.etiqueta} — {r.ayuda}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="text-xs text-ca-vino/75">
                            ¿Quién se encarga?
                            <input value={i.responsable} placeholder="Una persona con nombre" onChange={(e) => cambiar(i.id, { responsable: e.target.value })} className={CAMPO_INTERNO} />
                          </label>
                        </div>
                        <label className="mt-2 block text-xs text-ca-vino/75">
                          ¿Qué harás concretamente?
                          <textarea rows={2} value={i.plan} placeholder="La acción, con sus palabras" onChange={(e) => cambiar(i.id, { plan: e.target.value })} className={CAMPO_INTERNO} />
                        </label>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          <label className="text-xs text-ca-vino/75">
                            ¿De dónde sale?
                            <input value={i.fuente} placeholder="Ya me pasó, conversación, dato…" onChange={(e) => cambiar(i.id, { fuente: e.target.value })} className={CAMPO_INTERNO} />
                          </label>
                          <label className="text-xs text-ca-vino/75">
                            ¿Qué tan seguro es?
                            <select aria-label={`Condición: ${cat.titulo} ${n + 1}`} value={i.condicion} onChange={(e) => cambiar(i.id, { condicion: e.target.value as Condicion })} className={CAMPO_INTERNO}>
                              {CONDICIONES.map((c) => (
                                <option key={c.valor} value={c.valor}>
                                  {c.etiqueta}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      </li>
                    )
                  })}
                </ul>
                <div className="mt-3">
                  <button type="button" className={botonSuave} onClick={() => agregar(cat.clave)}>
                    <Plus className="h-4 w-4" /> Agregar un riesgo
                  </button>
                </div>
              </section>
            )
          })}
        </div>

        <section className={`mt-8 rounded-2xl border border-ca-oro/60 bg-ca-fondo p-5 lg:p-6 ${RELIEVE_TARJETA}`}>
          <h2 className="text-2xl font-extrabold">2. Tu termómetro</h2>
          {!hayDatos ? (
            <p className="mt-2 text-sm text-ca-vino/75">Escribe al menos un riesgo para ver tu termómetro.</p>
          ) : (
            <>
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                {conteo.map((c) => (
                  <div key={c.nivel} className="rounded-xl border bg-ca-tarjeta p-3 text-center" style={{ borderColor: COLOR_NIVEL[c.nivel], borderTopWidth: 4 }}>
                    <div className="text-3xl font-extrabold">{c.cantidad}</div>
                    <div className="text-xs font-bold uppercase tracking-wider text-ca-vino/80">{c.nivel}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-6 lg:grid-cols-2 lg:items-center">
                <MapaCalor riesgos={ordenados} />
                <div className="space-y-3">
                  {lectura.map((l) => (
                    <div key={l.titulo} className="rounded-xl bg-ca-tarjeta p-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-ca-oro-texto">{l.titulo}</div>
                      <p className="mt-1 text-sm">{l.texto}</p>
                    </div>
                  ))}
                  <p className="text-xs text-ca-vino/75">Es una forma de ordenar lo que escribiste. No es una medición ni un pronóstico.</p>
                </div>
              </div>
              <h3 className="mt-6 text-lg font-extrabold">Del más grave al más leve</h3>
              <ol className="mt-2 space-y-2 text-sm">
                {ordenados.map((r) => (
                  <li key={r.item.id} className="flex items-start gap-3 rounded-xl bg-ca-tarjeta px-4 py-3">
                    <span aria-hidden className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ca-vino-hondo text-xs font-extrabold text-ca-tarjeta">
                      {r.numero}
                    </span>
                    <span>
                      <span className="block font-semibold">{r.item.texto}</span>
                      <span className="block text-xs text-ca-vino/75">
                        {tituloCategoria(r.item.categoria)} · {r.nivel} ({r.puntaje} de 25)
                        {r.item.respuesta ? ` · ${RESPUESTAS.find((x) => x.clave === r.item.respuesta)?.etiqueta}` : ''}
                        {r.item.responsable.trim() ? ` · Responsable: ${r.item.responsable.trim()}` : ''}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
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
            {guardando ? 'Guardando…' : 'Guardar Termómetro de Riesgos'}
          </button>
          {guardado && !sucio && (
            <Link href={`/empresarial/documento?proyecto=${proyecto.id}`} className={botonSuave}>
              Seguir: documento final
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
