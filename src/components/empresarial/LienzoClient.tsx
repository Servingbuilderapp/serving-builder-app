'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CONDICIONES, etiquetaCondicion, type Condicion } from '@/lib/empresarial/formulacion'
import { BLOQUES, alertasLienzo, itemLienzoVacio, lecturaLienzo, revisarLienzo, type Bloque, type ItemLienzo } from '@/lib/empresarial/lienzo'

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

/** Lugar de cada bloque en el dibujo (pantalla grande, 10 columnas). En celular van uno debajo del otro. */
const LUGAR_DIBUJO: Record<Bloque, string> = {
  aliados: 'lg:col-span-2 lg:row-span-2 lg:order-1',
  actividades: 'lg:col-span-2 lg:order-2',
  propuesta: 'lg:col-span-2 lg:row-span-2 lg:order-3',
  relacion: 'lg:col-span-2 lg:order-4',
  clientes: 'lg:col-span-2 lg:row-span-2 lg:order-5',
  recursos: 'lg:col-span-2 lg:order-6',
  canales: 'lg:col-span-2 lg:order-7',
  costos: 'lg:col-span-5 lg:order-8',
  ingresos: 'lg:col-span-5 lg:order-9',
}
/** En celular se lee en el orden de trabajo (de quién compra a cuánto cuesta). */
const ORDEN_CELULAR: Bloque[] = ['clientes', 'propuesta', 'canales', 'relacion', 'ingresos', 'recursos', 'actividades', 'aliados', 'costos']

interface Props {
  proyecto: { id: string; nombre: string }
  itemsIniciales: ItemLienzo[]
  yaGuardado: boolean
}

export function LienzoClient({ proyecto, itemsIniciales, yaGuardado }: Props) {
  const [items, setItems] = useState<ItemLienzo[]>(itemsIniciales)
  const [idsGuardados, setIdsGuardados] = useState<string[]>(itemsIniciales.map((x) => x.id))
  const [guardado, setGuardado] = useState(yaGuardado)
  const [sucio, setSucio] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const botonOro = `h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-ca-oro-claro to-ca-oro text-ca-vino-hondo font-extrabold disabled:opacity-50 disabled:cursor-not-allowed ${RELIEVE_BOTON}`
  const botonSuave = `h-11 px-4 inline-flex items-center justify-center gap-2 rounded-xl border border-ca-oro/50 bg-ca-tarjeta text-ca-vino font-semibold ${RELIEVE_BOTON}`

  const lectura = useMemo(() => lecturaLienzo(items), [items])
  const alertas = useMemo(() => alertasLienzo(items), [items])
  const revision = useMemo(() => revisarLienzo(items), [items])
  const faltan = revision.filter((x) => x.obligatorio && !x.cumple)
  const hayDatos = items.some((i) => i.texto.trim())

  const cambiar = (id: string, x: Partial<ItemLienzo>) => {
    setItems((p) => p.map((i) => (i.id === id ? { ...i, ...x } : i)))
    setSucio(true)
  }
  const agregar = (bloque: Bloque) => {
    setItems((p) => [...p, itemLienzoVacio(bloque)])
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
      contador[i.bloque] = (contador[i.bloque] ?? 0) + 1
      return {
        anterior: i.id,
        fila: {
          id: i.id.startsWith('nuevo-') ? crypto.randomUUID() : i.id,
          proyecto_id: proyecto.id,
          bloque: i.bloque,
          texto: i.texto.trim(),
          fuente: i.fuente.trim() || null,
          condicion: i.condicion,
          orden: contador[i.bloque],
        },
      }
    })
    if (filas.length > 0) {
      const { error } = await supabase.from('sfpe_lienzo_items').upsert(filas.map((x) => x.fila), { onConflict: 'id' })
      if (error) {
        setGuardando(false)
        return setAviso({ tipo: 'error', texto: 'No pudimos guardar el Lienzo de Negocio. Intenta de nuevo.' })
      }
    }
    const nuevos = filas.map((x) => x.fila.id)
    const borrar = idsGuardados.filter((id) => !nuevos.includes(id))
    if (borrar.length > 0) await supabase.from('sfpe_lienzo_items').delete().in('id', borrar)
    const mapa = new Map(filas.map((x) => [x.anterior, x.fila.id]))
    setItems(conTexto.map((i) => ({ ...i, id: mapa.get(i.id) ?? i.id })))
    setIdsGuardados(nuevos)
    setGuardado(true)
    setSucio(false)
    setGuardando(false)
    setAviso({ tipo: 'ok', texto: 'Lienzo de Negocio guardado.' })
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino">
      <div className="max-w-[1000px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <Link href={`/empresarial/camino?proyecto=${proyecto.id}`} className="inline-flex items-center gap-2 text-sm text-ca-vino/75 hover:text-ca-vino-hondo">
          <ArrowLeft className="h-4 w-4" /> Volver a mi camino
        </Link>

        <div className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-ca-oro-texto">Lienzo de Negocio · {proyecto.nombre}</div>
        <h1 className="mt-3 text-3xl lg:text-4xl font-extrabold">¿Cómo funciona tu negocio, en una sola hoja?</h1>
        <p className="mt-3 text-ca-vino/80 leading-relaxed">
          Un negocio se puede contar en nueve piezas: para quién es, qué ofreces, cómo les llegas, cómo los conservas, cómo ganas dinero, con qué cuentas, qué haces cada día, con quién te apoyas y qué te cuesta. Escribe en cada una con tus palabras. Abajo verás tu lienzo armado y avisos si algo no encaja entre sí.
        </p>

        <h2 className="mt-8 text-2xl font-extrabold">1. Llena los nueve bloques</h2>
        <div className="mt-4 grid gap-5 lg:grid-cols-2">
          {BLOQUES.map((b) => {
            const propios = items.filter((i) => i.bloque === b.clave)
            return (
              <section key={b.clave} className={`rounded-2xl border bg-ca-tarjeta p-5 ${RELIEVE_TARJETA}`} style={{ borderColor: b.color + '99' }}>
                <div className="flex items-center gap-3">
                  <span aria-hidden className="inline-block h-10 w-2 rounded-full" style={{ background: b.color }} />
                  <h3 className="text-lg font-extrabold leading-tight">
                    {b.numero}. {b.titulo}
                  </h3>
                </div>
                <p className="mt-3 text-sm text-ca-vino/80">{b.pista}</p>
                <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-ca-vino/75">
                  {b.preguntas.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-ca-vino/75">Ejemplo: {b.ejemplo}</p>

                <ul className="mt-4 space-y-3">
                  {propios.map((i, n) => (
                    <li key={i.id} className="rounded-xl bg-ca-fondo p-3">
                      <div className="flex items-start gap-2">
                        <div className="w-full">
                          <label className="sr-only" htmlFor={`en-${i.id}`}>
                            {b.titulo} {n + 1}
                          </label>
                          <textarea id={`en-${i.id}`} rows={2} value={i.texto} placeholder="Escríbelo con tus palabras" onChange={(e) => cambiar(i.id, { texto: e.target.value })} className={CAMPO_INTERNO} />
                        </div>
                        <button type="button" aria-label={`Quitar ${b.titulo} ${n + 1}`} onClick={() => quitar(i.id)} className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ca-oro/40 text-ca-vino/80 hover:text-ca-vino-hondo">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <label className="text-xs text-ca-vino/75">
                          ¿De dónde sale?
                          <input value={i.fuente} placeholder="Venta, conversación, precio…" onChange={(e) => cambiar(i.id, { fuente: e.target.value })} className={CAMPO_INTERNO} />
                        </label>
                        <label className="text-xs text-ca-vino/75">
                          ¿Qué tan seguro es?
                          <select aria-label={`Condición: ${b.titulo} ${n + 1}`} value={i.condicion} onChange={(e) => cambiar(i.id, { condicion: e.target.value as Condicion })} className={CAMPO_INTERNO}>
                            {CONDICIONES.map((c) => (
                              <option key={c.valor} value={c.valor}>
                                {c.etiqueta}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-3">
                  <button type="button" className={botonSuave} onClick={() => agregar(b.clave)}>
                    <Plus className="h-4 w-4" /> Agregar
                  </button>
                </div>
              </section>
            )
          })}
        </div>

        <section className={`mt-8 rounded-2xl border border-ca-oro/60 bg-ca-fondo p-5 lg:p-6 ${RELIEVE_TARJETA}`}>
          <h2 className="text-2xl font-extrabold">2. Tu lienzo</h2>
          {!hayDatos ? (
            <p className="mt-2 text-sm text-ca-vino/75">Escribe al menos un elemento para ver tu lienzo.</p>
          ) : (
            <>
              <div role="group" aria-label="Lienzo de Negocio: los nueve bloques con lo que escribiste" className="mt-4 grid gap-3 lg:grid-cols-10">
                {[...ORDEN_CELULAR].map((clave) => {
                  const b = BLOQUES.find((x) => x.clave === clave)!
                  const llenos = items.filter((i) => i.bloque === clave && i.texto.trim())
                  return (
                    <div key={clave} className={`rounded-xl border bg-ca-tarjeta p-3 ${LUGAR_DIBUJO[clave]}`} style={{ borderColor: b.color + 'AA', borderTopWidth: 4, borderTopColor: b.color }}>
                      <div className="text-xs font-extrabold uppercase tracking-wider text-ca-vino">
                        {b.numero}. {b.titulo}
                      </div>
                      {llenos.length === 0 ? (
                        <p className="mt-2 text-xs italic text-ca-vino/65">Vacío por ahora</p>
                      ) : (
                        <ul className="mt-2 space-y-1.5">
                          {llenos.map((i) => (
                            <li key={i.id} className="rounded-lg bg-ca-fondo px-2 py-1.5 text-xs leading-snug">
                              {i.texto}
                              {(i.condicion === 'supuesto' || i.condicion === 'pendiente') && <span className="ml-1 font-bold text-ca-oro-texto">({etiquetaCondicion(i.condicion)})</span>}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {lectura.map((l) => (
                  <div key={l.titulo} className="rounded-xl bg-ca-tarjeta p-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-ca-oro-texto">{l.titulo}</div>
                    <p className="mt-1 text-sm">{l.texto}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-ca-vino/75">Es una forma de ordenar lo que escribiste. No es una evaluación del negocio ni un pronóstico.</p>
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
            {guardando ? 'Guardando…' : 'Guardar Lienzo de Negocio'}
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
