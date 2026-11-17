'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CONDICIONES, etiquetaCondicion, type Condicion } from '@/lib/empresarial/formulacion'
import type { NumeroGrupo } from '@/lib/empresarial/cliente'
import {
  HORIZONTES,
  PARTES_META,
  alertasMeta,
  itemMetaVacio,
  lecturaMeta,
  nombreHorizonte,
  resultadosMeta,
  revisarMeta,
  type ItemMeta,
  type ParteMeta,
} from '@/lib/empresarial/metas'

const RELIEVE_BOTON = 'shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200'
const RELIEVE_TARJETA = 'shadow-[0_1px_2px_rgba(84,20,43,0.06),0_10px_28px_-14px_rgba(84,20,43,0.22)]'
const CAMPO_INTERNO =
  'mt-1 w-full rounded-lg border border-ca-oro/40 bg-ca-tarjeta px-3 py-2 text-ca-vino placeholder:text-ca-vino/65 focus:outline-none focus:ring-2 focus:ring-ca-oro-claro'
const COLOR_ALERTA: Record<string, string> = {
  Importante: 'border-ca-oro/70 bg-ca-fondo',
  Preventiva: 'border-ca-oro/50 bg-ca-fondo',
  Informativa: 'border-ca-oro/45 bg-ca-fondo',
}
const VINO = '#54142B'
const DORADO = '#C9A44A'
const VINO_CLARO = '#8A3A57'

function Barra({ titulo, valor, color }: { titulo: string; valor: number; color: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-semibold">{titulo}</span>
        <span className="font-extrabold">{valor} de 100</span>
      </div>
      <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-ca-suave" role="img" aria-label={`${titulo}: ${valor} de 100`}>
        <div className="h-full rounded-full" style={{ width: `${valor}%`, background: color }} />
      </div>
    </div>
  )
}

interface Props {
  proyecto: { id: string; nombre: string }
  itemsIniciales: ItemMeta[]
  yaGuardado: boolean
}

export function MetasClient({ proyecto, itemsIniciales, yaGuardado }: Props) {
  const [items, setItems] = useState<ItemMeta[]>(itemsIniciales)
  const [idsGuardados, setIdsGuardados] = useState<string[]>(itemsIniciales.map((x) => x.id))
  const [grupo, setGrupo] = useState<NumeroGrupo>(1)
  const [guardado, setGuardado] = useState(yaGuardado)
  const [sucio, setSucio] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const botonOro = `h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-ca-oro-claro to-ca-oro text-ca-vino-hondo font-extrabold disabled:opacity-50 disabled:cursor-not-allowed ${RELIEVE_BOTON}`
  const botonSuave = `h-11 px-4 inline-flex items-center justify-center gap-2 rounded-xl border border-ca-oro/50 bg-ca-tarjeta text-ca-vino font-semibold ${RELIEVE_BOTON}`

  const res = useMemo(() => resultadosMeta(items), [items])
  const lectura = useMemo(() => lecturaMeta(items), [items])
  const alertas = useMemo(() => alertasMeta(items), [items])
  const revision = useMemo(() => revisarMeta(items), [items])
  const faltan = revision.filter((x) => x.obligatorio && !x.cumple)

  const cambiar = (id: string, x: Partial<ItemMeta>) => {
    setItems((p) => p.map((i) => (i.id === id ? { ...i, ...x } : i)))
    setSucio(true)
  }
  const agregar = (parte: ParteMeta) => {
    setItems((p) => [...p, itemMetaVacio(grupo, parte)])
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
      const k = `${i.grupo}-${i.parte}`
      contador[k] = (contador[k] ?? 0) + 1
      return {
        anterior: i.id,
        fila: {
          id: i.id.startsWith('nuevo-') ? crypto.randomUUID() : i.id,
          proyecto_id: proyecto.id,
          grupo: i.grupo,
          parte: i.parte,
          texto: i.texto.trim(),
          peso: Number(i.peso) || 3,
          fuente: i.fuente.trim() || null,
          condicion: i.condicion,
          orden: contador[k],
        },
      }
    })
    if (filas.length > 0) {
      const { error } = await supabase.from('sfpe_metas_items').upsert(filas.map((x) => x.fila), { onConflict: 'id' })
      if (error) {
        setGuardando(false)
        return setAviso({ tipo: 'error', texto: 'No pudimos guardar el Tablero de Metas. Intenta de nuevo.' })
      }
    }
    const nuevos = filas.map((x) => x.fila.id)
    const borrar = idsGuardados.filter((id) => !nuevos.includes(id))
    if (borrar.length > 0) await supabase.from('sfpe_metas_items').delete().in('id', borrar)
    const mapaIds = new Map(filas.map((x) => [x.anterior, x.fila.id]))
    setItems(conTexto.map((i) => ({ ...i, id: mapaIds.get(i.id) ?? i.id })))
    setIdsGuardados(nuevos)
    setGuardado(true)
    setSucio(false)
    setGuardando(false)
    setAviso({ tipo: 'ok', texto: 'Tablero de Metas guardado.' })
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino">
      <div className="max-w-[1000px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <Link href={`/empresarial/camino?proyecto=${proyecto.id}`} className="inline-flex items-center gap-2 text-sm text-ca-vino/75 hover:text-ca-vino-hondo">
          <ArrowLeft className="h-4 w-4" /> Volver a mi camino
        </Link>

        <div className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-ca-oro-texto">Tablero de Metas · {proyecto.nombre}</div>
        <h1 className="mt-3 text-3xl lg:text-4xl font-extrabold">¿Qué quieres lograr y cómo lo sabrás?</h1>
        <p className="mt-3 text-ca-vino/80 leading-relaxed">
          Para cada plazo (3, 6 y 12 meses) escribe qué quieres lograr, cómo lo vas a medir, de dónde partes, qué haces primero y qué te puede frenar. A cada cosa dale un peso de 1 a 5. Las barras de abajo se calculan solas con lo que escribas.
        </p>

        <h2 className="mt-8 text-2xl font-extrabold">1. Escribe tus metas</h2>
        <div role="tablist" aria-label="Plazos" className="mt-4 flex flex-wrap gap-2">
          {HORIZONTES.map((h) => (
            <button
              key={h.grupo}
              type="button"
              role="tab"
              aria-selected={grupo === h.grupo}
              onClick={() => setGrupo(h.grupo)}
              className={`h-11 rounded-xl border px-4 text-sm font-bold ${RELIEVE_BOTON} ${grupo === h.grupo ? 'border-ca-oro bg-ca-oro-claro text-ca-vino-hondo' : 'border-ca-oro/50 bg-ca-tarjeta text-ca-vino'}`}
            >
              {h.nombre}
              <span className="ml-2 text-xs font-semibold opacity-75">({items.filter((i) => i.grupo === h.grupo && i.texto.trim()).length})</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-ca-vino/75">Empieza por los primeros 3 meses: es lo que vas a hacer primero. Máximo 3 metas por plazo.</p>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {PARTES_META.map((parte) => {
            const propios = items.filter((i) => i.grupo === grupo && i.parte === parte.clave)
            return (
              <section key={parte.clave} className={`rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-5 ${RELIEVE_TARJETA}`}>
                <h3 className="text-lg font-extrabold leading-tight">{parte.titulo}</h3>
                <p className="mt-2 text-sm text-ca-vino/80">{parte.pista}</p>
                <p className="mt-1 text-xs text-ca-vino/75">Ejemplo: {parte.ejemplo}</p>
                <ul className="mt-4 space-y-3">
                  {propios.map((i, n) => (
                    <li key={i.id} className="rounded-xl bg-ca-fondo p-3">
                      <div className="flex items-start gap-2">
                        <div className="w-full">
                          <label className="sr-only" htmlFor={`mt-${i.id}`}>
                            {parte.titulo} {n + 1}
                          </label>
                          <textarea id={`mt-${i.id}`} rows={2} value={i.texto} placeholder="Con tus palabras" onChange={(e) => cambiar(i.id, { texto: e.target.value })} className={CAMPO_INTERNO} />
                        </div>
                        <button type="button" aria-label={`Quitar ${parte.titulo} ${n + 1}`} onClick={() => quitar(i.id)} className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ca-oro/40 text-ca-vino/80 hover:text-ca-vino-hondo">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <label className="text-xs text-ca-vino/75">
                          {parte.pesoPregunta}
                          <select value={i.peso} onChange={(e) => cambiar(i.id, { peso: e.target.value })} className={CAMPO_INTERNO}>
                            <option value="1">1 · Casi nada</option>
                            <option value="2">2 · Poco</option>
                            <option value="3">3 · Medio</option>
                            <option value="4">4 · Mucho</option>
                            <option value="5">5 · Muchísimo</option>
                          </select>
                        </label>
                        <label className="text-xs text-ca-vino/75">
                          ¿Qué tan seguro es?
                          <select aria-label={`Condición: ${parte.titulo} ${n + 1}`} value={i.condicion} onChange={(e) => cambiar(i.id, { condicion: e.target.value as Condicion })} className={CAMPO_INTERNO}>
                            {CONDICIONES.map((c) => (
                              <option key={c.valor} value={c.valor}>
                                {c.etiqueta}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <label className="mt-2 block text-xs text-ca-vino/75">
                        ¿De dónde sale?
                        <input value={i.fuente} placeholder="Mis cuentas, un registro, una conversación…" onChange={(e) => cambiar(i.id, { fuente: e.target.value })} className={CAMPO_INTERNO} />
                      </label>
                    </li>
                  ))}
                </ul>
                <div className="mt-3">
                  <button type="button" className={botonSuave} onClick={() => agregar(parte.clave)}>
                    <Plus className="h-4 w-4" /> Agregar
                  </button>
                </div>
              </section>
            )
          })}
        </div>

        <section className={`mt-8 rounded-2xl border border-ca-oro/60 bg-ca-fondo p-5 lg:p-6 ${RELIEVE_TARJETA}`}>
          <h2 className="text-2xl font-extrabold">2. Tu tablero</h2>
          {res.length === 0 ? (
            <p className="mt-2 text-sm text-ca-vino/75">Escribe al menos una cosa de un plazo para ver tus barras.</p>
          ) : (
            <>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {res.map((r) => (
                  <div key={r.grupo} className="rounded-xl bg-ca-tarjeta p-4">
                    <div className="text-base font-extrabold">{nombreHorizonte(r.grupo)}</div>
                    <div className="mt-3 space-y-4">
                      <Barra titulo="Qué tan claras son" valor={r.claras} color={VINO} />
                      <Barra titulo="Qué tan listo estás para arrancar" valor={r.listas} color={DORADO} />
                      <Barra titulo="Qué tan despejado está el camino" valor={r.despejado} color={VINO_CLARO} />
                    </div>
                    <p className="mt-3 text-xs text-ca-vino/75">Lo claras sale de “Cómo vas a medirlo” y “De dónde partes”. Lo listo sale de “Qué haces primero”. Lo despejado sale de “Qué te puede frenar”: cuanto más fuertes los frenos, más baja la barra.</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-3">
                {lectura.map((l) => (
                  <div key={l.titulo} className="rounded-xl bg-ca-tarjeta p-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-ca-oro-texto">{l.titulo}</div>
                    <p className="mt-1 text-sm">{l.texto}</p>
                  </div>
                ))}
                <p className="text-xs text-ca-vino/75">Es una forma de ordenar lo que escribiste. No predice si vas a lograr tus metas.</p>
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
            {guardando ? 'Guardando…' : 'Guardar Tablero de Metas'}
          </button>
          {guardado && !sucio && (
            <Link href={`/empresarial/herramientas?proyecto=${proyecto.id}`} className={botonSuave}>
              Seguir: mis herramientas
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
