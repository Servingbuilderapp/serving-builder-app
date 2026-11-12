'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CONDICIONES, etiquetaCondicion, type Condicion } from '@/lib/empresarial/formulacion'
import { BarrasH, Venn4 } from '@/components/empresarial/Graficos'
import {
  PREGUNTAS,
  alertasIkigai,
  conteoPorRegion,
  cumple,
  faltaPara,
  itemIkigaiVacio,
  lectura,
  mascara,
  nombreRegion,
  revisarIkigai,
  type ItemIkigai,
} from '@/lib/empresarial/ikigai'

const RELIEVE_BOTON =
  'shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200'
const RELIEVE_TARJETA = 'shadow-[0_1px_2px_rgba(11,42,74,0.06),0_10px_28px_-14px_rgba(11,42,74,0.22)]'
const CAMPO_INTERNO =
  'mt-1 w-full rounded-lg border border-[#B08D57]/40 bg-[#3B1727] px-3 py-2 text-[#F3E7DC] placeholder:text-[#F3E7DC]/40 focus:outline-none focus:ring-2 focus:ring-[#C9A46B]'
const COLOR_ALERTA: Record<string, string> = {
  Crítica: 'border-[#B3261E]/70 bg-[#B3261E]/15',
  Importante: 'border-[#C9A46B]/70 bg-[#2E0E1A]',
  Preventiva: 'border-[#B08D57]/50 bg-[#2E0E1A]',
  Informativa: 'border-[#B08D57]/30 bg-[#2E0E1A]',
}

interface Props {
  proyecto: { id: string; nombre: string }
  itemsIniciales: ItemIkigai[]
  yaGuardado: boolean
}

export function IkigaiClient({ proyecto, itemsIniciales, yaGuardado }: Props) {
  const [items, setItems] = useState<ItemIkigai[]>(itemsIniciales.length > 0 ? itemsIniciales : [itemIkigaiVacio(), itemIkigaiVacio(), itemIkigaiVacio()])
  const [idsGuardados, setIdsGuardados] = useState<string[]>(itemsIniciales.map((x) => x.id))
  const [guardado, setGuardado] = useState(yaGuardado)
  const [sucio, setSucio] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const botonOro = `h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#C9A46B] to-[#B08D57] text-[#3A1420] font-extrabold disabled:opacity-50 disabled:cursor-not-allowed ${RELIEVE_BOTON}`
  const botonSuave = `h-11 px-4 inline-flex items-center justify-center gap-2 rounded-xl border border-[#B08D57]/50 bg-[#3B1727] text-[#F3E7DC] font-semibold ${RELIEVE_BOTON}`

  const conteos = useMemo(() => conteoPorRegion(items), [items])
  const lect = useMemo(() => lectura(items), [items])
  const alertas = useMemo(() => alertasIkigai(items), [items])
  const revision = useMemo(() => revisarIkigai(items), [items])
  const faltan = revision.filter((x) => x.obligatorio && !x.cumple)
  const llenos = items.filter((i) => i.texto.trim())
  const hayDatos = llenos.some((i) => mascara(i) > 0)

  const cambiar = (id: string, x: Partial<ItemIkigai>) => {
    setItems((p) => p.map((i) => (i.id === id ? { ...i, ...x } : i)))
    setSucio(true)
  }

  async function guardar() {
    setAviso(null)
    setGuardando(true)
    const supabase = createClient()
    const conTexto = items.filter((i) => i.texto.trim())
    const filas = conTexto.map((i, n) => ({
      anterior: i.id,
      fila: {
        id: i.id.startsWith('nuevo-') ? crypto.randomUUID() : i.id,
        proyecto_id: proyecto.id,
        texto: i.texto.trim(),
        ama: i.ama,
        bueno: i.bueno,
        necesita: i.necesita,
        pagan: i.pagan,
        fuente: i.fuente.trim() || null,
        condicion: i.condicion,
        orden: n + 1,
      },
    }))
    if (filas.length > 0) {
      const { error } = await supabase.from('sfpe_ikigai_items').upsert(filas.map((x) => x.fila), { onConflict: 'id' })
      if (error) {
        setGuardando(false)
        return setAviso({ tipo: 'error', texto: 'No pudimos guardar el Ikigai. Intenta de nuevo.' })
      }
    }
    const nuevos = filas.map((x) => x.fila.id)
    const borrar = idsGuardados.filter((id) => !nuevos.includes(id))
    if (borrar.length > 0) await supabase.from('sfpe_ikigai_items').delete().in('id', borrar)
    const mapa = new Map(filas.map((x) => [x.anterior, x.fila.id]))
    setItems(conTexto.map((i) => ({ ...i, id: mapa.get(i.id) ?? i.id })))
    setIdsGuardados(nuevos)
    setGuardado(true)
    setSucio(false)
    setGuardando(false)
    setAviso({ tipo: 'ok', texto: 'Ikigai guardado.' })
  }

  // Zonas con ideas, de la más completa a la menos completa.
  const zonas = useMemo(() => {
    const por = new Map<number, ItemIkigai[]>()
    for (const i of llenos) {
      const m = mascara(i)
      if (m === 0) continue
      por.set(m, [...(por.get(m) ?? []), i])
    }
    const cuenta = (m: number) => PREGUNTAS.filter((p) => m & p.bit).length
    return [...por.entries()].sort((a, b) => cuenta(b[0]) - cuenta(a[0]))
  }, [llenos])

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2E0E1A] via-[#3B1727] to-[#54142B] text-[#F3E7DC]">
      <div className="max-w-[900px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <Link href={`/empresarial/camino?proyecto=${proyecto.id}`} className="inline-flex items-center gap-2 text-sm text-[#F3E7DC]/70 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Volver a mi camino
        </Link>

        <div className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-[#C9A46B]">Ikigai · {proyecto.nombre}</div>
        <h1 className="mt-3 text-3xl lg:text-4xl font-extrabold">¿Dónde se encuentran lo que amas y lo que el mundo paga?</h1>
        <p className="mt-3 text-[#F3E7DC]/80 leading-relaxed">
          El Ikigai es un punto de encuentro de cuatro preguntas. Una buena idea de proyecto suele cumplir las cuatro: la amas, la haces bien, el mundo la necesita y alguien pagaría por ella.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {PREGUNTAS.map((p) => (
            <div key={p.clave} className="rounded-xl border bg-[#2E0E1A] p-3 text-sm" style={{ borderColor: p.color + '88' }}>
              <div className="font-extrabold" style={{ color: p.color }}>
                {p.titulo}
              </div>
              <div className="mt-0.5">{p.pregunta}</div>
              <ul className="mt-1 list-disc pl-5 text-xs text-[#F3E7DC]/65">
                {p.pistas.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <section className={`mt-8 rounded-2xl border border-[#B08D57]/35 bg-[#3B1727] p-5 lg:p-6 ${RELIEVE_TARJETA}`}>
          <h2 className="text-xl font-extrabold">1. Escribe tus ideas</h2>
          <p className="mt-1 text-sm text-[#F3E7DC]/70">
            Una idea es algo que podrías hacer o vender. Ejemplo: “Pan de masa madre para cafeterías”. Después marca las preguntas que cumple. Sé honesto: marca solo lo que sea cierto hoy.
          </p>
          <ul className="mt-4 space-y-4">
            {items.map((i, n) => (
              <li key={i.id} className="rounded-xl bg-[#2E0E1A] p-4">
                <div className="flex items-start gap-2">
                  <div className="w-full">
                    <label className="block text-sm font-semibold" htmlFor={`k-${i.id}`}>
                      Idea {n + 1}
                    </label>
                    <input id={`k-${i.id}`} value={i.texto} placeholder="Algo que podrías hacer o vender" onChange={(e) => cambiar(i.id, { texto: e.target.value })} className={CAMPO_INTERNO} />
                  </div>
                  <button
                    type="button"
                    aria-label={`Quitar la idea ${n + 1}`}
                    onClick={() => {
                      setItems((p) => p.filter((x) => x.id !== i.id))
                      setSucio(true)
                    }}
                    className="mt-6 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#B08D57]/40 text-[#F3E7DC]/80 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <fieldset className="mt-3">
                  <legend className="text-xs text-[#F3E7DC]/65">¿Cuáles de estas cuatro cumple?</legend>
                  <div className="mt-1 grid gap-2 sm:grid-cols-2">
                    {PREGUNTAS.map((p) => (
                      <label key={p.clave} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm" style={{ background: i[p.clave] ? p.color + '33' : '#3B1727', border: `1px solid ${i[p.clave] ? p.color : '#B08D5755'}` }}>
                        <input type="checkbox" checked={i[p.clave]} onChange={(e) => cambiar(i.id, { [p.clave]: e.target.checked } as Partial<ItemIkigai>)} className="h-4 w-4 accent-[#C9A46B]" />
                        {p.titulo}
                      </label>
                    ))}
                  </div>
                </fieldset>
                {(i.necesita || i.pagan) && (
                  <div className="mt-3">
                    <label className="block text-sm font-semibold" htmlFor={`kf-${i.id}`}>
                      ¿Cómo sabes que lo necesitan o que pagarían?
                    </label>
                    <input id={`kf-${i.id}`} value={i.fuente} placeholder="Un cliente, un pedido, un dato, una conversación…" onChange={(e) => cambiar(i.id, { fuente: e.target.value })} className={CAMPO_INTERNO} />
                    <label className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#F3E7DC]/70">
                      <span>¿Qué tan seguro es?</span>
                      <select aria-label={`Condición de la idea ${n + 1}`} value={i.condicion} onChange={(e) => cambiar(i.id, { condicion: e.target.value as Condicion })} className="h-9 rounded-lg border border-[#B08D57]/50 bg-[#3B1727] px-2 text-[#F3E7DC]">
                        {CONDICIONES.map((c) => (
                          <option key={c.valor} value={c.valor}>
                            {c.etiqueta}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={`mt-4 ${botonSuave}`}
            onClick={() => {
              setItems((p) => [...p, itemIkigaiVacio()])
              setSucio(true)
            }}
          >
            <Plus className="h-4 w-4" /> Agregar otra idea
          </button>
        </section>

        <section className={`mt-6 rounded-2xl border border-[#C9A46B]/60 bg-[#2E0E1A] p-5 lg:p-6 ${RELIEVE_TARJETA}`}>
          <h2 className="text-xl font-extrabold">2. Tu Ikigai</h2>
          {!hayDatos ? (
            <p className="mt-2 text-sm text-[#F3E7DC]/70">Escribe una idea y marca al menos una pregunta para ver el diagrama.</p>
          ) : (
            <>
              <div className="mt-3 grid gap-6 lg:grid-cols-2 lg:items-center">
                <Venn4
                  titulo="Diagrama de cuatro círculos con tus ideas"
                  titulos={[PREGUNTAS[0].titulo, PREGUNTAS[1].titulo, PREGUNTAS[2].titulo, PREGUNTAS[3].titulo]}
                  colores={[PREGUNTAS[0].color, PREGUNTAS[1].color, PREGUNTAS[2].color, PREGUNTAS[3].color]}
                  conteos={conteos}
                />
                <div>
                  <h3 className="font-extrabold">Cuántas ideas cumplen cada pregunta</h3>
                  <BarrasH
                    titulo="Ideas por pregunta"
                    formato={(n) => `${n} de ${llenos.length}`}
                    barras={PREGUNTAS.map((p) => ({ etiqueta: p.titulo, valor: llenos.filter((i) => i[p.clave]).length }))}
                  />
                  {lect && (
                    <div className="mt-4 rounded-xl bg-[#3B1727] p-4 text-sm">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#C9A46B]">Lo que se ve</div>
                      <p className="mt-1">{lect.texto}</p>
                    </div>
                  )}
                </div>
              </div>

              <h3 className="mt-6 font-extrabold">Dónde cayó cada idea</h3>
              <ul className="mt-2 space-y-2 text-sm">
                {zonas.map(([m, xs]) => (
                  <li key={m} className="rounded-xl bg-[#3B1727] p-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#C9A46B]">{nombreRegion(m)}</div>
                    <ul className="mt-1 space-y-0.5">
                      {xs.map((x) => (
                        <li key={x.id}>
                          {x.texto}
                          {cumple(x).length < 4 && <span className="text-xs text-[#F3E7DC]/60"> — te falta: {faltaPara(x).join(', ')}</span>}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-[#F3E7DC]/55">El diagrama ordena lo que tú marcaste; no mide el éxito de una idea. Compruébala con clientes reales.</p>
            </>
          )}
        </section>

        {alertas.length > 0 && (
          <section className="mt-6 space-y-3" aria-label="Alertas">
            {alertas.map((a, i) => (
              <div key={i} role="note" className={`rounded-2xl border p-4 text-sm ${COLOR_ALERTA[a.nivel]}`}>
                <span className="mr-2 text-xs font-bold uppercase tracking-wider text-[#C9A46B]">{a.nivel}</span>
                {a.texto}
              </div>
            ))}
          </section>
        )}

        <section className={`mt-6 rounded-2xl border border-[#B08D57]/35 bg-[#3B1727] p-5 ${RELIEVE_TARJETA}`}>
          <h2 className="text-xl font-extrabold">Revisión</h2>
          <p className="mt-1 text-sm text-[#F3E7DC]/70">
            {faltan.length === 0 ? 'Tienes lo necesario para seguir. Los recomendados puedes completarlos después.' : `Falta${faltan.length === 1 ? '' : 'n'} ${faltan.length} ${faltan.length === 1 ? 'parte necesaria' : 'partes necesarias'}.`}
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {revision.map((x) => (
              <li key={x.clave} className="flex items-start gap-3 rounded-xl bg-[#2E0E1A] px-4 py-3">
                <span aria-hidden className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${x.cumple ? 'bg-[#C9A46B] text-[#3A1420]' : 'border border-[#B08D57]/60 text-[#F3E7DC]/60'}`}>
                  {x.cumple ? '✓' : '·'}
                </span>
                <span>
                  <span className="block">
                    {x.texto} <span className="text-xs text-[#F3E7DC]/55">({x.obligatorio ? 'necesario' : 'recomendado'})</span>
                  </span>
                  {!x.cumple && <span className="block text-xs text-[#F3E7DC]/65">{x.ayuda}</span>}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-[#F3E7DC]/55">Dato marcado como “{etiquetaCondicion('supuesto')}” o “{etiquetaCondicion('pendiente')}”: compruébalo antes de presentarlo como hecho.</p>
        </section>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button type="button" onClick={guardar} disabled={guardando} className={botonOro}>
            {guardando ? 'Guardando…' : 'Guardar Ikigai'}
          </button>
          {guardado && !sucio && (
            <Link href={`/empresarial/camino?proyecto=${proyecto.id}`} className={botonSuave}>
              Volver a mi camino
            </Link>
          )}
          {sucio && !guardando && <span className="text-sm text-[#C9A46B]">Tienes cambios sin guardar.</span>}
        </div>
        {aviso && (
          <div role={aviso.tipo === 'error' ? 'alert' : 'status'} className={`mt-4 rounded-2xl border p-4 text-sm ${aviso.tipo === 'error' ? 'border-[#B3261E]/60 bg-[#B3261E]/15' : 'border-[#C9A46B]/60 bg-[#2E0E1A]'}`}>
            {aviso.texto}
          </div>
        )}
      </div>
    </main>
  )
}
