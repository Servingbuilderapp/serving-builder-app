'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CONDICIONES, etiquetaCondicion, type Condicion } from '@/lib/empresarial/formulacion'
import { BarrasH, PlanoPosicion } from '@/components/empresarial/Graficos'
import {
  CRUCES,
  GUIAS,
  alertasDofa,
  calcularBalance,
  itemDofaVacio,
  lecturaPosicion,
  revisarDofa,
  type Cuadrante,
  type ItemDofa,
  type TipoDofa,
} from '@/lib/empresarial/dofa'

export interface Sugerencia {
  cuadrante: Cuadrante
  texto: string
}

const RELIEVE_BOTON =
  'shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200'
const RELIEVE_TARJETA = 'shadow-[0_1px_2px_rgba(84,20,43,0.06),0_10px_28px_-14px_rgba(84,20,43,0.22)]'
const CAMPO_INTERNO =
  'mt-1 w-full rounded-lg border border-ca-oro/40 bg-ca-tarjeta px-3 py-2 text-ca-vino placeholder:text-ca-vino/65 focus:outline-none focus:ring-2 focus:ring-ca-oro-claro'
const COLOR_ALERTA: Record<string, string> = {
  Crítica: 'border-ca-rojo/70 bg-ca-rojo/10',
  Importante: 'border-ca-oro/70 bg-ca-fondo',
  Preventiva: 'border-ca-oro/50 bg-ca-fondo',
  Informativa: 'border-ca-oro/45 bg-ca-fondo',
}

interface Props {
  proyecto: { id: string; nombre: string }
  itemsIniciales: ItemDofa[]
  yaGuardado: boolean
  sugerencias: Sugerencia[]
}

export function DofaClient({ proyecto, itemsIniciales, yaGuardado, sugerencias }: Props) {
  const [items, setItems] = useState<ItemDofa[]>(
    itemsIniciales.length > 0 ? itemsIniciales : (GUIAS.map((g) => itemDofaVacio(g.clave)) as ItemDofa[]),
  )
  const [idsGuardados, setIdsGuardados] = useState<string[]>(itemsIniciales.map((x) => x.id))
  const [guardado, setGuardado] = useState(yaGuardado)
  const [sucio, setSucio] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const botonOro = `h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-ca-oro-claro to-ca-oro text-ca-vino-hondo font-extrabold disabled:opacity-50 disabled:cursor-not-allowed ${RELIEVE_BOTON}`
  const botonSuave = `h-11 px-4 inline-flex items-center justify-center gap-2 rounded-xl border border-ca-oro/50 bg-ca-tarjeta text-ca-vino font-semibold ${RELIEVE_BOTON}`

  const balance = useMemo(() => calcularBalance(items), [items])
  const lectura = useMemo(() => lecturaPosicion(balance), [balance])
  const alertas = useMemo(() => alertasDofa(items), [items])
  const revision = useMemo(() => revisarDofa(items), [items])
  const faltan = revision.filter((x) => x.obligatorio && !x.cumple)

  const cambiar = (id: string, x: Partial<ItemDofa>) => {
    setItems((p) => p.map((i) => (i.id === id ? { ...i, ...x } : i)))
    setSucio(true)
  }
  const agregar = (c: TipoDofa, texto = '', fuente = '', condicion: Condicion = 'estimado') => {
    setItems((p) => [...p, itemDofaVacio(c, texto, fuente, condicion)])
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
      contador[i.cuadrante] = (contador[i.cuadrante] ?? 0) + 1
      const esEstrategia = i.cuadrante.startsWith('estrategia_')
      return {
        anterior: i.id,
        fila: {
          id: i.id.startsWith('nuevo-') ? crypto.randomUUID() : i.id,
          proyecto_id: proyecto.id,
          cuadrante: i.cuadrante,
          texto: i.texto.trim(),
          impacto: esEstrategia ? null : Number(i.impacto) || 3,
          fuente: i.fuente.trim() || null,
          condicion: i.condicion,
          orden: contador[i.cuadrante],
        },
      }
    })
    if (filas.length > 0) {
      const { error } = await supabase.from('sfpe_dofa_items').upsert(filas.map((x) => x.fila), { onConflict: 'id' })
      if (error) {
        setGuardando(false)
        return setAviso({ tipo: 'error', texto: 'No pudimos guardar el análisis. Intenta de nuevo.' })
      }
    }
    const nuevos = filas.map((x) => x.fila.id)
    const borrar = idsGuardados.filter((id) => !nuevos.includes(id))
    if (borrar.length > 0) await supabase.from('sfpe_dofa_items').delete().in('id', borrar)
    const mapa = new Map(filas.map((x) => [x.anterior, x.fila.id]))
    setItems(conTexto.map((i) => ({ ...i, id: mapa.get(i.id) ?? i.id })))
    setIdsGuardados(nuevos)
    setGuardado(true)
    setSucio(false)
    setGuardando(false)
    setAviso({ tipo: 'ok', texto: 'Análisis DOFA guardado.' })
  }

  const textoEn = (c: Cuadrante) => items.filter((i) => i.cuadrante === c && i.texto.trim())
  const yaUsada = (txt: string) => items.some((i) => i.texto.trim() === txt)

  return (
    <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino">
      <div className="max-w-[1000px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <Link href={`/empresarial/camino?proyecto=${proyecto.id}`} className="inline-flex items-center gap-2 text-sm text-ca-vino/75 hover:text-ca-vino-hondo">
          <ArrowLeft className="h-4 w-4" /> Volver a mi camino
        </Link>

        <div className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-ca-oro-texto">Análisis DOFA · {proyecto.nombre}</div>
        <h1 className="mt-3 text-3xl lg:text-4xl font-extrabold">¿Con qué cuentas y qué te rodea?</h1>
        <p className="mt-3 text-ca-vino/80 leading-relaxed">
          El DOFA separa lo que depende de ti (fortalezas y debilidades) de lo que pasa afuera (oportunidades y amenazas). Escribe cada cosa, dale un peso de 1 a 5 según cuánto importa, y el sistema dibuja dónde está tu proyecto y qué te conviene hacer.
        </p>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-ca-fondo p-3">
            <span className="font-extrabold text-ca-oro-texto">Dentro de ti:</span> lo que puedes cambiar tú. Fortalezas y debilidades.
          </div>
          <div className="rounded-xl bg-ca-fondo p-3">
            <span className="font-extrabold text-ca-oro-texto">Afuera:</span> lo que no controlas, solo puedes prepararte. Oportunidades y amenazas.
          </div>
        </div>

        <h2 className="mt-8 text-2xl font-extrabold">1. Escribe lo que ves</h2>
        <div className="mt-4 grid gap-5 lg:grid-cols-2">
          {GUIAS.map((g) => {
            const propios = items.filter((i) => i.cuadrante === g.clave)
            const sug = sugerencias.filter((x) => x.cuadrante === g.clave && !yaUsada(x.texto))
            return (
              <section key={g.clave} className={`rounded-2xl border bg-ca-tarjeta p-5 ${RELIEVE_TARJETA}`} style={{ borderColor: g.color + '99' }}>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-xl font-extrabold text-ca-vino-hondo" style={{ background: g.color }}>
                    {g.letra}
                  </span>
                  <div>
                    <h3 className="text-lg font-extrabold leading-tight">{g.titulo}</h3>
                    <div className="text-xs text-ca-vino/75">{g.donde}</div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-ca-vino/80">{g.pista}</p>
                <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-ca-vino/75">
                  {g.preguntas.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-ca-vino/75">Ejemplo: {g.ejemplo}</p>

                <ul className="mt-4 space-y-3">
                  {propios.map((i, n) => (
                    <li key={i.id} className="rounded-xl bg-ca-fondo p-3">
                      <div className="flex items-start gap-2">
                        <div className="w-full">
                          <label className="sr-only" htmlFor={`d-${i.id}`}>
                            {g.titulo} {n + 1}
                          </label>
                          <textarea id={`d-${i.id}`} rows={2} value={i.texto} placeholder="Escríbelo con tus palabras" onChange={(e) => cambiar(i.id, { texto: e.target.value })} className={CAMPO_INTERNO} />
                        </div>
                        <button type="button" aria-label={`Quitar ${g.titulo} ${n + 1}`} onClick={() => quitar(i.id)} className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ca-oro/40 text-ca-vino/80 hover:text-ca-vino-hondo">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-3">
                        <label className="text-xs text-ca-vino/75">
                          ¿Cuánto importa?
                          <select value={i.impacto} onChange={(e) => cambiar(i.id, { impacto: e.target.value })} className={CAMPO_INTERNO}>
                            <option value="1">1 · Poco</option>
                            <option value="2">2</option>
                            <option value="3">3 · Medio</option>
                            <option value="4">4</option>
                            <option value="5">5 · Mucho</option>
                          </select>
                        </label>
                        <label className="text-xs text-ca-vino/75 sm:col-span-2">
                          ¿De dónde sale?
                          <input value={i.fuente} placeholder="Un dato, un cliente, un documento…" onChange={(e) => cambiar(i.id, { fuente: e.target.value })} className={CAMPO_INTERNO} />
                        </label>
                      </div>
                      <label className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ca-vino/75">
                        <span>¿Qué tan seguro es?</span>
                        <select aria-label={`Condición: ${g.titulo} ${n + 1}`} value={i.condicion} onChange={(e) => cambiar(i.id, { condicion: e.target.value as Condicion })} className="h-9 rounded-lg border border-ca-oro/50 bg-ca-tarjeta px-2 text-ca-vino">
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
                <button type="button" className={`mt-3 ${botonSuave}`} onClick={() => agregar(g.clave)}>
                  <Plus className="h-4 w-4" /> Agregar
                </button>

                {sug.length > 0 && (
                  <div className="mt-4 rounded-xl border border-dashed border-ca-oro/50 p-3">
                    <div className="text-xs font-bold text-ca-oro-texto">Salen de tu estudio de competencia. Toca para usar:</div>
                    <ul className="mt-2 space-y-1.5">
                      {sug.slice(0, 4).map((x) => (
                        <li key={x.texto}>
                          <button type="button" onClick={() => agregar(g.clave, x.texto, 'Estudio de competencia', 'aportado')} className="w-full rounded-lg bg-ca-fondo px-3 py-2 text-left text-xs hover:bg-ca-suave">
                            + {x.texto}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )
          })}
        </div>

        <section className={`mt-8 rounded-2xl border border-ca-oro/60 bg-ca-fondo p-5 lg:p-6 ${RELIEVE_TARJETA}`}>
          <h2 className="text-2xl font-extrabold">2. Lo que dice tu análisis</h2>
          {balance.interno === null || balance.externo === null ? (
            <p className="mt-2 text-sm text-ca-vino/75">Escribe al menos un elemento dentro de ti y uno afuera para ver tu posición.</p>
          ) : (
            <>
              <div className="mt-4 grid gap-6 lg:grid-cols-2 lg:items-center">
                <PlanoPosicion interno={balance.interno} externo={balance.externo} titulo="Plano de tu posición: lo que depende de ti contra el entorno" />
                <div>
                  <h3 className="font-extrabold">Peso total de cada cuadrante</h3>
                  <BarrasH
                    titulo="Peso total por cuadrante"
                    formato={(n) => `${n} puntos`}
                    barras={[
                      { etiqueta: 'Fortalezas', valor: balance.F },
                      { etiqueta: 'Debilidades', valor: balance.D },
                      { etiqueta: 'Oportunidades', valor: balance.O },
                      { etiqueta: 'Amenazas', valor: balance.A },
                    ]}
                  />
                  {lectura && (
                    <div className="mt-4 rounded-xl bg-ca-tarjeta p-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-ca-oro-texto">Posición {lectura.nombre}</div>
                      <p className="mt-1 text-sm">{lectura.texto}</p>
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-4 text-xs text-ca-vino/75">Es una forma de ordenar lo que escribiste y los pesos que le diste. No es una medición ni un pronóstico.</p>
            </>
          )}
        </section>

        <h2 className="mt-8 text-2xl font-extrabold">3. ¿Qué vas a hacer?</h2>
        <p className="mt-1 text-sm text-ca-vino/75">Cruza lo que escribiste. Una estrategia es una acción concreta, no un deseo.</p>
        <div className="mt-4 grid gap-5 lg:grid-cols-2">
          {CRUCES.map((c) => {
            const propias = items.filter((i) => i.cuadrante === c.clave)
            return (
              <section key={c.clave} className={`rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-5 ${RELIEVE_TARJETA}`}>
                <h3 className="text-lg font-extrabold">{c.titulo}</h3>
                <p className="mt-1 text-sm text-ca-vino/75">{c.pregunta}</p>
                <div className="mt-2 space-y-1 text-xs text-ca-vino/75">
                  {c.usa.map((u) => {
                    const lista = textoEn(u).sort((a, b) => Number(b.impacto) - Number(a.impacto)).slice(0, 3)
                    return (
                      <div key={u}>
                        <span className="font-bold text-ca-oro-texto">{GUIAS.find((g) => g.clave === u)?.titulo}:</span> {lista.length ? lista.map((x) => x.texto).join(' · ') : 'aún no hay'}
                      </div>
                    )
                  })}
                </div>
                <ul className="mt-3 space-y-2">
                  {propias.map((i, n) => (
                    <li key={i.id} className="flex items-start gap-2">
                      <label className="sr-only" htmlFor={`e-${i.id}`}>
                        Estrategia {n + 1} de {c.titulo}
                      </label>
                      <textarea id={`e-${i.id}`} rows={2} value={i.texto} placeholder={`Ejemplo: ${c.ejemplo}`} onChange={(e) => cambiar(i.id, { texto: e.target.value })} className={CAMPO_INTERNO} />
                      <button type="button" aria-label={`Quitar estrategia ${n + 1}`} onClick={() => quitar(i.id)} className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ca-oro/40 text-ca-vino/80 hover:text-ca-vino-hondo">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
                <button type="button" className={`mt-3 ${botonSuave}`} onClick={() => agregar(c.clave)}>
                  <Plus className="h-4 w-4" /> Agregar estrategia
                </button>
              </section>
            )
          })}
        </div>

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
            {guardando ? 'Guardando…' : 'Guardar análisis DOFA'}
          </button>
          {guardado && !sucio && (
            <Link href={`/empresarial/tecnico?proyecto=${proyecto.id}`} className={botonSuave}>
              Seguir: estudio técnico
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
