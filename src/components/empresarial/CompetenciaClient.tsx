'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CONDICIONES, etiquetaCondicion, type Condicion } from '@/lib/empresarial/formulacion'
import { formatoDinero, num } from '@/lib/empresarial/mercadoDemanda'
import {
  METODOS_PRECIO,
  TIPOS_CANAL,
  TIPOS_COMPETIDOR,
  alertasCompetencia,
  canalVacio,
  competidorVacio,
  datosSinRespaldoCompetencia,
  margen,
  revisarCompetencia,
  type Canal,
  type CampoPrecio,
  type Competidor,
  type Precio,
} from '@/lib/empresarial/mercadoCompetencia'

const RELIEVE_BOTON =
  'shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200'
const RELIEVE_TARJETA = 'shadow-[0_1px_2px_rgba(84,20,43,0.06),0_10px_28px_-14px_rgba(84,20,43,0.22)]'
const CAMPO_ENTRADA =
  'mt-2 w-full rounded-xl border border-ca-oro/40 bg-ca-fondo px-4 py-3 text-ca-vino placeholder:text-ca-vino/65 focus:outline-none focus:ring-2 focus:ring-ca-oro-claro'
const CAMPO_INTERNO =
  'mt-1 w-full rounded-lg border border-ca-oro/40 bg-ca-tarjeta px-3 py-2 text-ca-vino placeholder:text-ca-vino/65 focus:outline-none focus:ring-2 focus:ring-ca-oro-claro'

const COLOR_ALERTA: Record<string, string> = {
  Crítica: 'border-ca-rojo/70 bg-ca-rojo/10',
  Importante: 'border-ca-oro/70 bg-ca-fondo',
  Preventiva: 'border-ca-oro/50 bg-ca-fondo',
  Informativa: 'border-ca-oro/45 bg-ca-fondo',
}

const SOLO_DECIMAL = (v: string) => {
  const limpio = v.replace(/[^\d.]/g, '')
  const [entero, ...resto] = limpio.split('.')
  return (entero.slice(0, 13) + (resto.length ? '.' + resto.join('').slice(0, 2) : '')).replace(/^\./, '0.')
}

interface Props {
  proyecto: { id: string; nombre: string; moneda: string | null }
  precioInicial: Precio
  competidoresIniciales: Competidor[]
  canalesIniciales: Canal[]
  yaGuardado: boolean
  producto: string
}

function SelectorCondicion({ valor, onCambio, etiqueta }: { valor: Condicion; onCambio: (c: Condicion) => void; etiqueta: string }) {
  return (
    <label className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ca-vino/75">
      <span>¿Qué tan seguro es este dato?</span>
      <select
        aria-label={`Condición del dato: ${etiqueta}`}
        value={valor}
        onChange={(e) => onCambio(e.target.value as Condicion)}
        className="h-9 rounded-lg border border-ca-oro/50 bg-ca-tarjeta px-2 text-ca-vino"
      >
        {CONDICIONES.map((c) => (
          <option key={c.valor} value={c.valor}>
            {c.etiqueta}
          </option>
        ))}
      </select>
      <span className="text-ca-vino/75">{CONDICIONES.find((c) => c.valor === valor)?.ayuda}</span>
    </label>
  )
}

function Seccion({ titulo, ayuda, children }: { titulo: string; ayuda: string; children: React.ReactNode }) {
  return (
    <section className={`mt-6 rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-5 lg:p-6 ${RELIEVE_TARJETA}`}>
      <h2 className="text-xl font-extrabold">{titulo}</h2>
      <p className="mt-1 text-sm text-ca-vino/75">{ayuda}</p>
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  )
}

export function CompetenciaClient({ proyecto, precioInicial, competidoresIniciales, canalesIniciales, yaGuardado, producto }: Props) {
  const [pr, setPr] = useState<Precio>(precioInicial)
  const [comps, setComps] = useState<Competidor[]>(competidoresIniciales)
  const [cans, setCans] = useState<Canal[]>(canalesIniciales)
  const [idsComps, setIdsComps] = useState<string[]>(competidoresIniciales.map((c) => c.id))
  const [idsCans, setIdsCans] = useState<string[]>(canalesIniciales.map((c) => c.id))
  const [guardado, setGuardado] = useState(yaGuardado)
  const [sucio, setSucio] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const botonOro = `h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-ca-oro-claro to-ca-oro text-ca-vino-hondo font-extrabold disabled:opacity-50 disabled:cursor-not-allowed ${RELIEVE_BOTON}`
  const botonSuave = `h-11 px-4 inline-flex items-center justify-center gap-2 rounded-xl border border-ca-oro/50 bg-ca-tarjeta text-ca-vino font-semibold ${RELIEVE_BOTON}`

  const alertas = useMemo(() => alertasCompetencia(pr, comps, cans), [pr, comps, cans])
  const revision = useMemo(() => revisarCompetencia(pr, comps, cans), [pr, comps, cans])
  const faltan = revision.filter((r) => r.obligatorio && !r.cumple)
  const faltanRec = revision.filter((r) => !r.obligatorio && !r.cumple)
  const sinRespaldo = datosSinRespaldoCompetencia(pr, comps, cans)
  const mg = margen(pr)

  const cambiarPrecio = (campo: keyof Omit<Precio, 'condiciones'>, valor: string) => {
    setPr((p) => ({ ...p, [campo]: valor }))
    setSucio(true)
  }
  const cambiarCond = (campo: CampoPrecio, c: Condicion) => {
    setPr((p) => ({ ...p, condiciones: { ...p.condiciones, [campo]: c } }))
    setSucio(true)
  }
  const cambiarComp = (id: string, x: Partial<Competidor>) => {
    setComps((p) => p.map((c) => (c.id === id ? { ...c, ...x } : c)))
    setSucio(true)
  }
  const cambiarCanal = (id: string, x: Partial<Canal>) => {
    setCans((p) => p.map((c) => (c.id === id ? { ...c, ...x } : c)))
    setSucio(true)
  }

  async function guardar() {
    setAviso(null)
    setGuardando(true)
    const supabase = createClient()

    const { error: e1 } = await supabase.from('sfpe_mercado_precio').upsert(
      {
        proyecto_id: proyecto.id,
        precio: num(pr.precio),
        unidad_precio: pr.unidad_precio.trim() || null,
        costo_unitario: num(pr.costo_unitario),
        metodo: pr.metodo || null,
        justificacion: pr.justificacion.trim() || null,
        disposicion_pago: pr.disposicion_pago.trim() || null,
        condiciones: pr.condiciones,
        actualizada_en: new Date().toISOString(),
      },
      { onConflict: 'proyecto_id' },
    )
    if (e1) {
      setGuardando(false)
      return setAviso({ tipo: 'error', texto: 'No pudimos guardar el precio. Intenta de nuevo.' })
    }

    const conNombre = comps.filter((c) => c.nombre.trim())
    const filasC = conNombre.map((c, i) => ({
      anterior: c.id,
      fila: {
        id: c.id.startsWith('nuevo-') ? crypto.randomUUID() : c.id,
        proyecto_id: proyecto.id,
        nombre: c.nombre.trim(),
        tipo: c.tipo,
        ubicacion: c.ubicacion.trim() || null,
        producto: c.producto.trim() || null,
        precio: num(c.precio),
        unidad_precio: c.unidad_precio.trim() || null,
        fortalezas: c.fortalezas.trim() || null,
        debilidades: c.debilidades.trim() || null,
        fuente: c.fuente.trim() || null,
        fecha_consulta: c.fecha_consulta || null,
        condicion: c.condicion,
        orden: i + 1,
      },
    }))
    const conDesc = cans.filter((c) => c.descripcion.trim())
    const filasK = conDesc.map((c, i) => ({
      anterior: c.id,
      fila: {
        id: c.id.startsWith('nuevo-') ? crypto.randomUUID() : c.id,
        proyecto_id: proyecto.id,
        tipo: c.tipo,
        descripcion: c.descripcion.trim(),
        costo_adquisicion: c.costo_adquisicion.trim() || null,
        conversion: c.conversion.trim() || null,
        condicion: c.condicion,
        orden: i + 1,
      },
    }))

    if (filasC.length > 0) {
      const { error } = await supabase.from('sfpe_mercado_competidores').upsert(filasC.map((x) => x.fila), { onConflict: 'id' })
      if (error) {
        setGuardando(false)
        return setAviso({ tipo: 'error', texto: 'Se guardó el precio, pero no pudimos guardar la competencia. Intenta de nuevo.' })
      }
    }
    if (filasK.length > 0) {
      const { error } = await supabase.from('sfpe_mercado_canales').upsert(filasK.map((x) => x.fila), { onConflict: 'id' })
      if (error) {
        setGuardando(false)
        return setAviso({ tipo: 'error', texto: 'Se guardó lo demás, pero no pudimos guardar los canales. Intenta de nuevo.' })
      }
    }
    const nuevosC = filasC.map((x) => x.fila.id)
    const nuevosK = filasK.map((x) => x.fila.id)
    const borrarC = idsComps.filter((id) => !nuevosC.includes(id))
    const borrarK = idsCans.filter((id) => !nuevosK.includes(id))
    if (borrarC.length > 0) await supabase.from('sfpe_mercado_competidores').delete().in('id', borrarC)
    if (borrarK.length > 0) await supabase.from('sfpe_mercado_canales').delete().in('id', borrarK)

    const mapaC = new Map(filasC.map((x) => [x.anterior, x.fila.id]))
    const mapaK = new Map(filasK.map((x) => [x.anterior, x.fila.id]))
    setComps(conNombre.map((c) => ({ ...c, id: mapaC.get(c.id) ?? c.id })))
    setCans(conDesc.map((c) => ({ ...c, id: mapaK.get(c.id) ?? c.id })))
    setIdsComps(nuevosC)
    setIdsCans(nuevosK)
    setGuardado(true)
    setSucio(false)
    setGuardando(false)
    setAviso({ tipo: 'ok', texto: 'Competencia, precios y canales guardados.' })
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino">
      <div className="max-w-[900px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <Link href={`/empresarial/mercado/demanda?proyecto=${proyecto.id}`} className="inline-flex items-center gap-2 text-sm text-ca-vino/75 hover:text-ca-vino-hondo">
          <ArrowLeft className="h-4 w-4" /> Volver a demanda y tamaño
        </Link>

        <div className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-ca-oro-texto">Estudio de mercado · {proyecto.nombre}</div>
        <h1 className="mt-3 text-3xl lg:text-4xl font-extrabold">¿Con quién compites, a qué precio y cómo llegas?</h1>
        <p className="mt-3 text-ca-vino/80 leading-relaxed">
          Anota lo que tus clientes usan hoy, define tu precio con una razón y elige por dónde vas a llegar a ellos. No se inventan competidores
          ni precios: cada dato lleva su fuente y la fecha en que lo consultaste.
          {producto ? ` Tu oferta: ${producto}.` : ''}
        </p>

        <Seccion
          titulo="1. Qué usan hoy tus clientes"
          ayuda="Siempre hay alternativas: otra empresa, un producto que lo reemplaza, que el cliente lo haga solo, o algo informal o gratuito. Anota las que de verdad conozcas."
        >
          {comps.length === 0 && <p className="text-sm text-ca-vino/75">Todavía no hay ninguna.</p>}
          <ul className="space-y-5">
            {comps.map((c, i) => (
              <li key={c.id} className="rounded-xl bg-ca-fondo p-4">
                <div className="flex items-start gap-2">
                  <div className="grid w-full gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold" htmlFor={`c-${c.id}-n`}>
                        Nombre
                      </label>
                      <input id={`c-${c.id}-n`} value={c.nombre} onChange={(e) => cambiarComp(c.id, { nombre: e.target.value })} className={CAMPO_INTERNO} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold" htmlFor={`c-${c.id}-t`}>
                        Qué tipo es
                      </label>
                      <select id={`c-${c.id}-t`} value={c.tipo} onChange={(e) => cambiarComp(c.id, { tipo: e.target.value })} className={CAMPO_INTERNO}>
                        {TIPOS_COMPETIDOR.map((t) => (
                          <option key={t.valor} value={t.valor}>
                            {t.etiqueta}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setComps((p) => p.filter((x) => x.id !== c.id))
                      setSucio(true)
                    }}
                    aria-label={`Quitar la alternativa ${i + 1}`}
                    className="mt-6 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ca-oro/40 text-ca-vino/80 hover:text-ca-vino-hondo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold" htmlFor={`c-${c.id}-p`}>
                      Qué ofrece
                    </label>
                    <input id={`c-${c.id}-p`} value={c.producto} onChange={(e) => cambiarComp(c.id, { producto: e.target.value })} className={CAMPO_INTERNO} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold" htmlFor={`c-${c.id}-u`}>
                      Dónde está
                    </label>
                    <input id={`c-${c.id}-u`} value={c.ubicacion} onChange={(e) => cambiarComp(c.id, { ubicacion: e.target.value })} className={CAMPO_INTERNO} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold" htmlFor={`c-${c.id}-pr`}>
                      Cuánto cobra
                    </label>
                    <input
                      id={`c-${c.id}-pr`}
                      inputMode="decimal"
                      value={c.precio}
                      onChange={(e) => cambiarComp(c.id, { precio: SOLO_DECIMAL(e.target.value) })}
                      className={CAMPO_INTERNO}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold" htmlFor={`c-${c.id}-un`}>
                      Por qué unidad
                    </label>
                    <input
                      id={`c-${c.id}-un`}
                      value={c.unidad_precio}
                      placeholder="Por almuerzo, por mes, por proyecto…"
                      onChange={(e) => cambiarComp(c.id, { unidad_precio: e.target.value })}
                      className={CAMPO_INTERNO}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold" htmlFor={`c-${c.id}-f`}>
                      En qué es fuerte
                    </label>
                    <textarea id={`c-${c.id}-f`} rows={2} value={c.fortalezas} onChange={(e) => cambiarComp(c.id, { fortalezas: e.target.value })} className={CAMPO_INTERNO} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold" htmlFor={`c-${c.id}-d`}>
                      En qué es débil
                    </label>
                    <textarea id={`c-${c.id}-d`} rows={2} value={c.debilidades} onChange={(e) => cambiarComp(c.id, { debilidades: e.target.value })} className={CAMPO_INTERNO} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold" htmlFor={`c-${c.id}-fu`}>
                      De dónde sacaste estos datos
                    </label>
                    <input
                      id={`c-${c.id}-fu`}
                      value={c.fuente}
                      placeholder="Página web, visita, cotización, llamada…"
                      onChange={(e) => cambiarComp(c.id, { fuente: e.target.value })}
                      className={CAMPO_INTERNO}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold" htmlFor={`c-${c.id}-fe`}>
                      Fecha en que lo consultaste
                    </label>
                    <input
                      id={`c-${c.id}-fe`}
                      type="date"
                      value={c.fecha_consulta}
                      onChange={(e) => cambiarComp(c.id, { fecha_consulta: e.target.value })}
                      className={CAMPO_INTERNO}
                    />
                  </div>
                </div>
                <SelectorCondicion valor={c.condicion} onCambio={(x) => cambiarComp(c.id, { condicion: x })} etiqueta={`alternativa ${i + 1}`} />
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              setComps((p) => [...p, competidorVacio()])
              setSucio(true)
            }}
            className={botonSuave}
          >
            <Plus className="h-4 w-4" /> Agregar alternativa
          </button>
        </Seccion>

        <Seccion titulo="2. Tu precio" ayuda="El precio que piensas cobrar y por qué. Debe tener una razón, no solo un número.">
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="block font-semibold" htmlFor="p-precio">
                Precio
              </label>
              <input id="p-precio" inputMode="decimal" value={pr.precio} onChange={(e) => cambiarPrecio('precio', SOLO_DECIMAL(e.target.value))} className={CAMPO_ENTRADA} />
            </div>
            <div>
              <label className="block font-semibold" htmlFor="p-unidad">
                Por qué unidad
              </label>
              <input id="p-unidad" value={pr.unidad_precio} placeholder="Por almuerzo, por mes…" onChange={(e) => cambiarPrecio('unidad_precio', e.target.value)} className={CAMPO_ENTRADA} />
            </div>
            <div>
              <label className="block font-semibold" htmlFor="p-costo">
                Costo por unidad (aprox.)
              </label>
              <input id="p-costo" inputMode="decimal" value={pr.costo_unitario} onChange={(e) => cambiarPrecio('costo_unitario', SOLO_DECIMAL(e.target.value))} className={CAMPO_ENTRADA} />
            </div>
          </div>
          {mg !== null && (
            <div className="rounded-xl border border-dashed border-ca-oro/60 bg-ca-fondo p-3 text-sm">
              Cada unidad te deja {formatoDinero((num(pr.precio) ?? 0) - (num(pr.costo_unitario) ?? 0), proyecto.moneda)}, es decir{' '}
              <span className="font-extrabold text-ca-oro-texto">{Math.round(mg * 100)} %</span> del precio.
            </div>
          )}
          <div>
            <label className="block font-semibold" htmlFor="p-metodo">
              Cómo fijaste el precio
            </label>
            <select id="p-metodo" value={pr.metodo} onChange={(e) => cambiarPrecio('metodo', e.target.value)} className={CAMPO_ENTRADA}>
              <option value="">Elige una…</option>
              {METODOS_PRECIO.map((m) => (
                <option key={m.valor} value={m.valor}>
                  {m.etiqueta}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold" htmlFor="p-just">
              Por qué ese precio
            </label>
            <textarea id="p-just" rows={3} value={pr.justificacion} onChange={(e) => cambiarPrecio('justificacion', e.target.value)} className={CAMPO_ENTRADA} />
            <SelectorCondicion valor={pr.condiciones.justificacion ?? 'aportado'} onCambio={(c) => cambiarCond('justificacion', c)} etiqueta="Por qué ese precio" />
          </div>
          <div>
            <label className="block font-semibold" htmlFor="p-disp">
              Qué muestra que tus clientes pagarían ese precio
            </label>
            <p className="text-xs text-ca-vino/75">Preventas, pedidos, conversaciones. Lo que dicen que pagarían no es lo mismo que lo que pagan.</p>
            <textarea id="p-disp" rows={3} value={pr.disposicion_pago} onChange={(e) => cambiarPrecio('disposicion_pago', e.target.value)} className={CAMPO_ENTRADA} />
            <SelectorCondicion valor={pr.condiciones.disposicion_pago ?? 'aportado'} onCambio={(c) => cambiarCond('disposicion_pago', c)} etiqueta="Disposición de pago" />
          </div>
        </Seccion>

        <Seccion titulo="3. Cómo les llegas" ayuda="Los caminos por los que vas a conseguir clientes. Mejor pocos y bien pensados.">
          {cans.length === 0 && <p className="text-sm text-ca-vino/75">Todavía no hay ningún canal.</p>}
          <ul className="space-y-5">
            {cans.map((c, i) => (
              <li key={c.id} className="rounded-xl bg-ca-fondo p-4">
                <div className="flex items-start gap-2">
                  <div className="w-full">
                    <label className="block text-sm font-semibold" htmlFor={`k-${c.id}-t`}>
                      Tipo de canal
                    </label>
                    <select id={`k-${c.id}-t`} value={c.tipo} onChange={(e) => cambiarCanal(c.id, { tipo: e.target.value })} className={CAMPO_INTERNO}>
                      {TIPOS_CANAL.map((t) => (
                        <option key={t.valor} value={t.valor}>
                          {t.etiqueta}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCans((p) => p.filter((x) => x.id !== c.id))
                      setSucio(true)
                    }}
                    aria-label={`Quitar el canal ${i + 1}`}
                    className="mt-6 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ca-oro/40 text-ca-vino/80 hover:text-ca-vino-hondo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-semibold" htmlFor={`k-${c.id}-d`}>
                    A quién le llega y cómo
                  </label>
                  <textarea id={`k-${c.id}-d`} rows={2} value={c.descripcion} onChange={(e) => cambiarCanal(c.id, { descripcion: e.target.value })} className={CAMPO_INTERNO} />
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold" htmlFor={`k-${c.id}-c`}>
                      Cuánto cuesta conseguir un cliente
                    </label>
                    <input id={`k-${c.id}-c`} value={c.costo_adquisicion} onChange={(e) => cambiarCanal(c.id, { costo_adquisicion: e.target.value })} className={CAMPO_INTERNO} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold" htmlFor={`k-${c.id}-v`}>
                      De cada 100 que contactas, cuántos compran
                    </label>
                    <input id={`k-${c.id}-v`} value={c.conversion} onChange={(e) => cambiarCanal(c.id, { conversion: e.target.value })} className={CAMPO_INTERNO} />
                  </div>
                </div>
                <SelectorCondicion valor={c.condicion} onCambio={(x) => cambiarCanal(c.id, { condicion: x })} etiqueta={`canal ${i + 1}`} />
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              setCans((p) => [...p, canalVacio()])
              setSucio(true)
            }}
            className={botonSuave}
          >
            <Plus className="h-4 w-4" /> Agregar canal
          </button>
        </Seccion>

        {alertas.length > 0 && (
          <section className="mt-6 space-y-3" aria-label="Alertas">
            {alertas.map((a, i) => (
              <div key={i} role={a.nivel === 'Crítica' ? 'alert' : 'note'} className={`rounded-2xl border p-4 text-sm ${COLOR_ALERTA[a.nivel]}`}>
                <span className="mr-2 text-xs font-bold uppercase tracking-wider text-ca-oro-texto">{a.nivel}</span>
                {a.texto}
              </div>
            ))}
          </section>
        )}

        <section className={`mt-6 rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-5 ${RELIEVE_TARJETA}`}>
          <h2 className="text-xl font-extrabold">Revisión</h2>
          <p className="mt-1 text-sm text-ca-vino/75">
            {faltan.length === 0
              ? 'Tienes lo necesario para seguir. Los recomendados puedes completarlos después.'
              : `Falta${faltan.length === 1 ? '' : 'n'} ${faltan.length} ${faltan.length === 1 ? 'parte necesaria' : 'partes necesarias'}.`}
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {revision.map((r) => (
              <li key={r.clave} className="flex items-start gap-3 rounded-xl bg-ca-fondo px-4 py-3">
                <span
                  aria-hidden
                  className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                    r.cumple ? 'bg-ca-oro-claro text-ca-vino-hondo' : 'border border-ca-oro/60 text-ca-vino/75'
                  }`}
                >
                  {r.cumple ? '✓' : '·'}
                </span>
                <span>
                  <span className="block">
                    {r.texto} <span className="text-xs text-ca-vino/75">({r.obligatorio ? 'necesario' : 'recomendado'})</span>
                  </span>
                  {!r.cumple && <span className="block text-xs text-ca-vino/75">{r.ayuda}</span>}
                </span>
              </li>
            ))}
          </ul>
          {sinRespaldo > 0 && (
            <p className="mt-3 rounded-xl bg-ca-fondo p-3 text-sm">
              {sinRespaldo} {sinRespaldo === 1 ? 'dato está marcado' : 'datos están marcados'} como “{etiquetaCondicion('supuesto')}” o “{etiquetaCondicion('pendiente')}”.
              Compruébalos antes de tratarlos como hechos.
            </p>
          )}
          {faltanRec.length > 0 && faltan.length === 0 && <p className="mt-3 text-xs text-ca-vino/75">Quedan {faltanRec.length} detalles recomendados.</p>}
        </section>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button type="button" onClick={guardar} disabled={guardando} className={botonOro}>
            {guardando ? 'Guardando…' : 'Guardar competencia y precios'}
          </button>
          {guardado && !sucio && (
            <Link href={`/empresarial/dofa?proyecto=${proyecto.id}`} className={botonSuave}>
              Seguir: análisis DOFA
            </Link>
          )}
          {sucio && !guardando && <span className="text-sm text-ca-oro-texto">Tienes cambios sin guardar.</span>}
        </div>
        {aviso && (
          <div
            role={aviso.tipo === 'error' ? 'alert' : 'status'}
            className={`mt-4 rounded-2xl border p-4 text-sm ${aviso.tipo === 'error' ? 'border-ca-rojo/60 bg-ca-rojo/10' : 'border-ca-oro/60 bg-ca-fondo'}`}
          >
            {aviso.texto}
          </div>
        )}
        <p className="mt-6 text-xs text-ca-vino/75">
          Esto es una guía para ordenar tu información; no garantiza ventas ni resultados. El precio y el costo se afinan en el estudio financiero.
        </p>
      </div>
    </main>
  )
}
