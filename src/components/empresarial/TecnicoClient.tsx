'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowDown, ArrowLeft, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CONDICIONES, etiquetaCondicion, type Condicion } from '@/lib/empresarial/formulacion'
import { num } from '@/lib/empresarial/mercadoDemanda'
import {
  EJEMPLOS_SPEC,
  ESTADOS_SOLUCION,
  TIPOS_SOLUCION,
  alertasTecnico,
  datosSinRespaldoTecnico,
  especificacionVacia,
  formatoMinutos,
  pasoVacio,
  revisarTecnico,
  tiempoTotalMin,
  type CampoTecnico,
  type Especificacion,
  type Paso,
  type Tecnico,
} from '@/lib/empresarial/tecnico'

const RELIEVE_BOTON =
  'shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200'
const RELIEVE_TARJETA = 'shadow-[0_1px_2px_rgba(11,42,74,0.06),0_10px_28px_-14px_rgba(11,42,74,0.22)]'
const CAMPO_ENTRADA =
  'mt-2 w-full rounded-xl border border-[#B08D57]/40 bg-[#2E0E1A] px-4 py-3 text-[#F3E7DC] placeholder:text-[#F3E7DC]/40 focus:outline-none focus:ring-2 focus:ring-[#C9A46B]'
const CAMPO_INTERNO =
  'mt-1 w-full rounded-lg border border-[#B08D57]/40 bg-[#3B1727] px-3 py-2 text-[#F3E7DC] placeholder:text-[#F3E7DC]/40 focus:outline-none focus:ring-2 focus:ring-[#C9A46B]'
const COLOR_ALERTA: Record<string, string> = {
  Crítica: 'border-[#B3261E]/70 bg-[#B3261E]/15',
  Importante: 'border-[#C9A46B]/70 bg-[#2E0E1A]',
  Preventiva: 'border-[#B08D57]/50 bg-[#2E0E1A]',
  Informativa: 'border-[#B08D57]/30 bg-[#2E0E1A]',
}
const SOLO_DECIMAL = (v: string) => {
  const limpio = v.replace(/[^\d.]/g, '')
  const [entero, ...resto] = limpio.split('.')
  return (entero.slice(0, 8) + (resto.length ? '.' + resto.join('').slice(0, 2) : '')).replace(/^\./, '0.')
}

interface Props {
  proyecto: { id: string; nombre: string }
  inicial: Tecnico
  specsIniciales: Especificacion[]
  pasosIniciales: Paso[]
  yaGuardado: boolean
  referencia: { producto: string; unidadPrecio: string }
}

function SelectorCondicion({ valor, onCambio, etiqueta }: { valor: Condicion; onCambio: (c: Condicion) => void; etiqueta: string }) {
  return (
    <label className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#F3E7DC]/70">
      <span>¿Qué tan seguro es este dato?</span>
      <select
        aria-label={`Condición del dato: ${etiqueta}`}
        value={valor}
        onChange={(e) => onCambio(e.target.value as Condicion)}
        className="h-9 rounded-lg border border-[#B08D57]/50 bg-[#3B1727] px-2 text-[#F3E7DC]"
      >
        {CONDICIONES.map((c) => (
          <option key={c.valor} value={c.valor}>
            {c.etiqueta}
          </option>
        ))}
      </select>
      <span className="text-[#F3E7DC]/55">{CONDICIONES.find((c) => c.valor === valor)?.ayuda}</span>
    </label>
  )
}

function Seccion({ titulo, ayuda, children }: { titulo: string; ayuda: string; children: React.ReactNode }) {
  return (
    <section className={`mt-6 rounded-2xl border border-[#B08D57]/35 bg-[#3B1727] p-5 lg:p-6 ${RELIEVE_TARJETA}`}>
      <h2 className="text-xl font-extrabold">{titulo}</h2>
      <p className="mt-1 text-sm text-[#F3E7DC]/70">{ayuda}</p>
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  )
}

export function TecnicoClient({ proyecto, inicial, specsIniciales, pasosIniciales, yaGuardado, referencia }: Props) {
  const [tc, setTc] = useState<Tecnico>(inicial)
  const [specs, setSpecs] = useState<Especificacion[]>(specsIniciales)
  const [pasos, setPasos] = useState<Paso[]>(pasosIniciales)
  const [idsSpecs, setIdsSpecs] = useState<string[]>(specsIniciales.map((x) => x.id))
  const [idsPasos, setIdsPasos] = useState<string[]>(pasosIniciales.map((x) => x.id))
  const [guardado, setGuardado] = useState(yaGuardado)
  const [sucio, setSucio] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const botonOro = `h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#C9A46B] to-[#B08D57] text-[#3A1420] font-extrabold disabled:opacity-50 disabled:cursor-not-allowed ${RELIEVE_BOTON}`
  const botonSuave = `h-11 px-4 inline-flex items-center justify-center gap-2 rounded-xl border border-[#B08D57]/50 bg-[#3B1727] text-[#F3E7DC] font-semibold ${RELIEVE_BOTON}`
  const botonIcono = 'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#B08D57]/40 text-[#F3E7DC]/80 hover:text-white disabled:opacity-30'

  const alertas = useMemo(() => alertasTecnico(tc, specs, pasos), [tc, specs, pasos])
  const revision = useMemo(() => revisarTecnico(tc, specs, pasos), [tc, specs, pasos])
  const faltan = revision.filter((r) => r.obligatorio && !r.cumple)
  const faltanRec = revision.filter((r) => !r.obligatorio && !r.cumple)
  const sinRespaldo = datosSinRespaldoTecnico(tc, specs, pasos)
  const total = tiempoTotalMin(pasos.filter((p) => p.nombre.trim()))

  const cambiar = (campo: keyof Omit<Tecnico, 'condiciones'>, valor: string) => {
    setTc((p) => ({ ...p, [campo]: valor }))
    setSucio(true)
  }
  const cambiarCond = (campo: CampoTecnico, c: Condicion) => {
    setTc((p) => ({ ...p, condiciones: { ...p.condiciones, [campo]: c } }))
    setSucio(true)
  }
  const cambiarSpec = (id: string, x: Partial<Especificacion>) => {
    setSpecs((p) => p.map((s) => (s.id === id ? { ...s, ...x } : s)))
    setSucio(true)
  }
  const cambiarPaso = (id: string, x: Partial<Paso>) => {
    setPasos((p) => p.map((s) => (s.id === id ? { ...s, ...x } : s)))
    setSucio(true)
  }
  const mover = (id: string, delta: -1 | 1) => {
    setPasos((p) => {
      const i = p.findIndex((x) => x.id === id)
      const j = i + delta
      if (i < 0 || j < 0 || j >= p.length) return p
      const copia = [...p]
      ;[copia[i], copia[j]] = [copia[j], copia[i]]
      return copia
    })
    setSucio(true)
  }

  async function guardar() {
    setAviso(null)
    setGuardando(true)
    const supabase = createClient()

    const { error: e1 } = await supabase.from('sfpe_tecnico').upsert(
      {
        proyecto_id: proyecto.id,
        tipo_solucion: tc.tipo_solucion || null,
        nombre_solucion: tc.nombre_solucion.trim() || null,
        descripcion: tc.descripcion.trim() || null,
        unidad_comercializacion: tc.unidad_comercializacion.trim() || null,
        estado_solucion: tc.estado_solucion || null,
        calidad_esperada: tc.calidad_esperada.trim() || null,
        restricciones: tc.restricciones.trim() || null,
        condiciones: tc.condiciones,
        actualizada_en: new Date().toISOString(),
      },
      { onConflict: 'proyecto_id' },
    )
    if (e1) {
      setGuardando(false)
      return setAviso({ tipo: 'error', texto: 'No pudimos guardar la ficha de la solución. Intenta de nuevo.' })
    }

    const conSpec = specs.filter((x) => x.caracteristica.trim())
    const filasS = conSpec.map((x, i) => ({
      anterior: x.id,
      fila: {
        id: x.id.startsWith('nuevo-') ? crypto.randomUUID() : x.id,
        proyecto_id: proyecto.id,
        caracteristica: x.caracteristica.trim(),
        especificacion: x.especificacion.trim() || null,
        unidad: x.unidad.trim() || null,
        criterio: x.criterio.trim() || null,
        condicion: x.condicion,
        orden: i + 1,
      },
    }))
    const conPaso = pasos.filter((x) => x.nombre.trim())
    const filasP = conPaso.map((x, i) => ({
      anterior: x.id,
      fila: {
        id: x.id.startsWith('nuevo-') ? crypto.randomUUID() : x.id,
        proyecto_id: proyecto.id,
        nombre: x.nombre.trim(),
        responsable: x.responsable.trim() || null,
        duracion_min: num(x.duracion_min),
        entrada: x.entrada.trim() || null,
        salida: x.salida.trim() || null,
        recursos: x.recursos.trim() || null,
        condicion: x.condicion,
        orden: i + 1,
      },
    }))

    if (filasS.length > 0) {
      const { error } = await supabase.from('sfpe_tecnico_specs').upsert(filasS.map((x) => x.fila), { onConflict: 'id' })
      if (error) {
        setGuardando(false)
        return setAviso({ tipo: 'error', texto: 'Se guardó la ficha, pero no pudimos guardar las especificaciones. Intenta de nuevo.' })
      }
    }
    if (filasP.length > 0) {
      const { error } = await supabase.from('sfpe_tecnico_pasos').upsert(filasP.map((x) => x.fila), { onConflict: 'id' })
      if (error) {
        setGuardando(false)
        return setAviso({ tipo: 'error', texto: 'Se guardó lo demás, pero no pudimos guardar los pasos del proceso. Intenta de nuevo.' })
      }
    }
    const nuevosS = filasS.map((x) => x.fila.id)
    const nuevosP = filasP.map((x) => x.fila.id)
    const borrarS = idsSpecs.filter((id) => !nuevosS.includes(id))
    const borrarP = idsPasos.filter((id) => !nuevosP.includes(id))
    if (borrarS.length > 0) await supabase.from('sfpe_tecnico_specs').delete().in('id', borrarS)
    if (borrarP.length > 0) await supabase.from('sfpe_tecnico_pasos').delete().in('id', borrarP)

    const mS = new Map(filasS.map((x) => [x.anterior, x.fila.id]))
    const mP = new Map(filasP.map((x) => [x.anterior, x.fila.id]))
    setSpecs(conSpec.map((x) => ({ ...x, id: mS.get(x.id) ?? x.id })))
    setPasos(conPaso.map((x) => ({ ...x, id: mP.get(x.id) ?? x.id })))
    setIdsSpecs(nuevosS)
    setIdsPasos(nuevosP)
    setGuardado(true)
    setSucio(false)
    setGuardando(false)
    setAviso({ tipo: 'ok', texto: 'Solución y proceso guardados.' })
  }

  const campoLargo = (campo: CampoTecnico, etiqueta: string, ayuda: string, filas = 3) => (
    <div>
      <label className="block font-semibold" htmlFor={`t-${campo}`}>
        {etiqueta}
      </label>
      <p className="text-xs text-[#F3E7DC]/60">{ayuda}</p>
      <textarea id={`t-${campo}`} rows={filas} value={tc[campo]} onChange={(e) => cambiar(campo, e.target.value)} className={CAMPO_ENTRADA} />
      <SelectorCondicion valor={tc.condiciones[campo] ?? 'aportado'} onCambio={(c) => cambiarCond(campo, c)} etiqueta={etiqueta} />
    </div>
  )

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2E0E1A] via-[#3B1727] to-[#54142B] text-[#F3E7DC]">
      <div className="max-w-[900px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <Link href={`/empresarial/camino?proyecto=${proyecto.id}`} className="inline-flex items-center gap-2 text-sm text-[#F3E7DC]/70 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Volver a mi camino
        </Link>

        <div className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-[#C9A46B]">Estudio técnico · {proyecto.nombre}</div>
        <h1 className="mt-3 text-3xl lg:text-4xl font-extrabold">¿Qué vas a entregar y cómo?</h1>
        <p className="mt-3 text-[#F3E7DC]/80 leading-relaxed">
          Aquí describes con precisión lo que recibe el cliente y los pasos con los que lo produces o lo prestas. No se inventan valores
          técnicos: si algo aún no lo sabes, lo marcas como pendiente o supuesto. La capacidad, el personal y los equipos vienen en la
          siguiente pantalla.
        </p>

        {(referencia.producto || referencia.unidadPrecio) && (
          <section className={`mt-6 rounded-2xl border border-[#B08D57]/35 bg-[#3B1727] p-5 ${RELIEVE_TARJETA}`}>
            <h2 className="text-lg font-extrabold">Lo que ya definiste en el estudio de mercado</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {referencia.producto && <li className="rounded-xl bg-[#2E0E1A] p-3">Ofreces: {referencia.producto}</li>}
              {referencia.unidadPrecio && (
                <li className="rounded-xl bg-[#2E0E1A] p-3">Tu precio es {referencia.unidadPrecio}. La unidad en que vendes debe ser la misma.</li>
              )}
            </ul>
          </section>
        )}

        <Seccion titulo="1. Ficha de la solución" ayuda="Qué es exactamente lo que vendes.">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block font-semibold" htmlFor="t-tipo">
                Qué tipo de solución es
              </label>
              <select id="t-tipo" value={tc.tipo_solucion} onChange={(e) => cambiar('tipo_solucion', e.target.value)} className={CAMPO_ENTRADA}>
                <option value="">Elige una…</option>
                {TIPOS_SOLUCION.map((x) => (
                  <option key={x.valor} value={x.valor}>
                    {x.etiqueta}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold" htmlFor="t-estado">
                En qué estado está
              </label>
              <select id="t-estado" value={tc.estado_solucion} onChange={(e) => cambiar('estado_solucion', e.target.value)} className={CAMPO_ENTRADA}>
                <option value="">Elige una…</option>
                {ESTADOS_SOLUCION.map((x) => (
                  <option key={x.valor} value={x.valor}>
                    {x.etiqueta}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold" htmlFor="t-nombre">
                Nombre
              </label>
              <input id="t-nombre" value={tc.nombre_solucion} onChange={(e) => cambiar('nombre_solucion', e.target.value)} className={CAMPO_ENTRADA} />
            </div>
            <div>
              <label className="block font-semibold" htmlFor="t-unidad">
                En qué unidad se vende
              </label>
              <input
                id="t-unidad"
                value={tc.unidad_comercializacion}
                placeholder="Por almuerzo, por hora, por licencia…"
                onChange={(e) => cambiar('unidad_comercializacion', e.target.value)}
                className={CAMPO_ENTRADA}
              />
            </div>
          </div>
          {campoLargo('descripcion', 'Qué es y para qué sirve', 'En palabras simples, qué recibe el cliente y qué problema le resuelve.', 4)}
          {campoLargo('calidad_esperada', 'Qué calidad se espera (opcional)', 'El nivel mínimo que no vas a bajar.', 3)}
          {campoLargo('restricciones', 'Qué la limita (opcional)', 'Permisos, normas, tecnología, materiales difíciles de conseguir.', 3)}
        </Seccion>

        <Seccion
          titulo="2. Características y especificaciones"
          ayuda={`Cómo es, medido. ${tc.tipo_solucion ? `Para esta solución: ${EJEMPLOS_SPEC[tc.tipo_solucion]}` : 'Elige el tipo de solución arriba para ver ejemplos.'} Si aún no conoces un valor, déjalo como pendiente o supuesto.`}
        >
          {specs.length === 0 && <p className="text-sm text-[#F3E7DC]/60">Todavía no hay ninguna.</p>}
          <ul className="space-y-4">
            {specs.map((x, i) => (
              <li key={x.id} className="rounded-xl bg-[#2E0E1A] p-4">
                <div className="flex items-start gap-2">
                  <div className="grid w-full gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-sm font-semibold" htmlFor={`s-${x.id}-c`}>
                        Característica
                      </label>
                      <input id={`s-${x.id}-c`} value={x.caracteristica} placeholder="Duración, peso, usuarios…" onChange={(e) => cambiarSpec(x.id, { caracteristica: e.target.value })} className={CAMPO_INTERNO} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold" htmlFor={`s-${x.id}-e`}>
                        Valor
                      </label>
                      <input id={`s-${x.id}-e`} value={x.especificacion} onChange={(e) => cambiarSpec(x.id, { especificacion: e.target.value })} className={CAMPO_INTERNO} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold" htmlFor={`s-${x.id}-u`}>
                        Unidad
                      </label>
                      <input id={`s-${x.id}-u`} value={x.unidad} placeholder="Minutos, kg, personas…" onChange={(e) => cambiarSpec(x.id, { unidad: e.target.value })} className={CAMPO_INTERNO} />
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={`Quitar la característica ${i + 1}`}
                    className={`mt-6 ${botonIcono}`}
                    onClick={() => {
                      setSpecs((p) => p.filter((s) => s.id !== x.id))
                      setSucio(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-semibold" htmlFor={`s-${x.id}-k`}>
                    Cómo sabes que se cumple
                  </label>
                  <input id={`s-${x.id}-k`} value={x.criterio} onChange={(e) => cambiarSpec(x.id, { criterio: e.target.value })} className={CAMPO_INTERNO} />
                </div>
                <SelectorCondicion valor={x.condicion} onCambio={(c) => cambiarSpec(x.id, { condicion: c })} etiqueta={`característica ${i + 1}`} />
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={botonSuave}
            onClick={() => {
              setSpecs((p) => [...p, especificacionVacia()])
              setSucio(true)
            }}
          >
            <Plus className="h-4 w-4" /> Agregar característica
          </button>
        </Seccion>

        <Seccion
          titulo="3. Los pasos del proceso"
          ayuda="Desde que llega lo necesario hasta que el cliente recibe. Pon los pasos en orden; usa las flechas para moverlos. La duración es el tiempo para una unidad."
        >
          {pasos.length === 0 && <p className="text-sm text-[#F3E7DC]/60">Todavía no hay ningún paso.</p>}
          <ol className="space-y-4">
            {pasos.map((x, i) => (
              <li key={x.id} className="rounded-xl bg-[#2E0E1A] p-4">
                <div className="flex items-start gap-2">
                  <span aria-hidden className="mt-7 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#C9A46B] text-sm font-extrabold text-[#C9A46B]">
                    {i + 1}
                  </span>
                  <div className="grid w-full gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold" htmlFor={`p-${x.id}-n`}>
                        Qué se hace
                      </label>
                      <input id={`p-${x.id}-n`} value={x.nombre} placeholder="Preparar, cocinar, empacar, entregar…" onChange={(e) => cambiarPaso(x.id, { nombre: e.target.value })} className={CAMPO_INTERNO} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold" htmlFor={`p-${x.id}-d`}>
                        Minutos por unidad
                      </label>
                      <input id={`p-${x.id}-d`} inputMode="decimal" value={x.duracion_min} onChange={(e) => cambiarPaso(x.id, { duracion_min: SOLO_DECIMAL(e.target.value) })} className={CAMPO_INTERNO} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button type="button" aria-label={`Subir el paso ${i + 1}`} disabled={i === 0} onClick={() => mover(x.id, -1)} className={botonIcono}>
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" aria-label={`Bajar el paso ${i + 1}`} disabled={i === pasos.length - 1} onClick={() => mover(x.id, 1)} className={botonIcono}>
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Quitar el paso ${i + 1}`}
                      className={botonIcono}
                      onClick={() => {
                        setPasos((p) => p.filter((s) => s.id !== x.id))
                        setSucio(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold" htmlFor={`p-${x.id}-r`}>
                      Quién lo hace
                    </label>
                    <input id={`p-${x.id}-r`} value={x.responsable} onChange={(e) => cambiarPaso(x.id, { responsable: e.target.value })} className={CAMPO_INTERNO} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold" htmlFor={`p-${x.id}-c`}>
                      Con qué (equipos, insumos)
                    </label>
                    <input id={`p-${x.id}-c`} value={x.recursos} onChange={(e) => cambiarPaso(x.id, { recursos: e.target.value })} className={CAMPO_INTERNO} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold" htmlFor={`p-${x.id}-e`}>
                      Qué recibe para empezar
                    </label>
                    <input id={`p-${x.id}-e`} value={x.entrada} onChange={(e) => cambiarPaso(x.id, { entrada: e.target.value })} className={CAMPO_INTERNO} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold" htmlFor={`p-${x.id}-s`}>
                      Qué entrega al terminar
                    </label>
                    <input id={`p-${x.id}-s`} value={x.salida} onChange={(e) => cambiarPaso(x.id, { salida: e.target.value })} className={CAMPO_INTERNO} />
                  </div>
                </div>
                <SelectorCondicion valor={x.condicion} onCambio={(c) => cambiarPaso(x.id, { condicion: c })} etiqueta={`paso ${i + 1}`} />
              </li>
            ))}
          </ol>
          <button
            type="button"
            className={botonSuave}
            onClick={() => {
              setPasos((p) => [...p, pasoVacio()])
              setSucio(true)
            }}
          >
            <Plus className="h-4 w-4" /> Agregar paso
          </button>
          {total > 0 && (
            <div className="rounded-xl border border-dashed border-[#C9A46B]/60 bg-[#2E0E1A] p-3 text-sm">
              Cada unidad pasa por todos los pasos en unos{' '}
              <span className="font-extrabold text-[#C9A46B]">{formatoMinutos(total)}</span>. Con esto, en la siguiente pantalla se calcula cuánto puedes producir.
            </div>
          )}
        </Seccion>

        {alertas.length > 0 && (
          <section className="mt-6 space-y-3" aria-label="Alertas">
            {alertas.map((a, i) => (
              <div key={i} role={a.nivel === 'Crítica' ? 'alert' : 'note'} className={`rounded-2xl border p-4 text-sm ${COLOR_ALERTA[a.nivel]}`}>
                <span className="mr-2 text-xs font-bold uppercase tracking-wider text-[#C9A46B]">{a.nivel}</span>
                {a.texto}
              </div>
            ))}
          </section>
        )}

        <section className={`mt-6 rounded-2xl border border-[#B08D57]/35 bg-[#3B1727] p-5 ${RELIEVE_TARJETA}`}>
          <h2 className="text-xl font-extrabold">Revisión</h2>
          <p className="mt-1 text-sm text-[#F3E7DC]/70">
            {faltan.length === 0
              ? 'Tienes lo necesario para seguir. Los recomendados puedes completarlos después.'
              : `Falta${faltan.length === 1 ? '' : 'n'} ${faltan.length} ${faltan.length === 1 ? 'parte necesaria' : 'partes necesarias'}.`}
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {revision.map((r) => (
              <li key={r.clave} className="flex items-start gap-3 rounded-xl bg-[#2E0E1A] px-4 py-3">
                <span
                  aria-hidden
                  className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                    r.cumple ? 'bg-[#C9A46B] text-[#3A1420]' : 'border border-[#B08D57]/60 text-[#F3E7DC]/60'
                  }`}
                >
                  {r.cumple ? '✓' : '·'}
                </span>
                <span>
                  <span className="block">
                    {r.texto} <span className="text-xs text-[#F3E7DC]/55">({r.obligatorio ? 'necesario' : 'recomendado'})</span>
                  </span>
                  {!r.cumple && <span className="block text-xs text-[#F3E7DC]/65">{r.ayuda}</span>}
                </span>
              </li>
            ))}
          </ul>
          {sinRespaldo > 0 && (
            <p className="mt-3 rounded-xl bg-[#2E0E1A] p-3 text-sm">
              {sinRespaldo} {sinRespaldo === 1 ? 'dato está marcado' : 'datos están marcados'} como “{etiquetaCondicion('supuesto')}” o “{etiquetaCondicion('pendiente')}”. Confírmalos antes de producir.
            </p>
          )}
          {faltanRec.length > 0 && faltan.length === 0 && <p className="mt-3 text-xs text-[#F3E7DC]/60">Quedan {faltanRec.length} detalles recomendados.</p>}
        </section>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button type="button" onClick={guardar} disabled={guardando} className={botonOro}>
            {guardando ? 'Guardando…' : 'Guardar solución y proceso'}
          </button>
          {guardado && !sucio && (
            <Link href={`/empresarial/financiero?proyecto=${proyecto.id}`} className={botonSuave}>
              Seguir: financiero básico
            </Link>
          )}
          {sucio && !guardando && <span className="text-sm text-[#C9A46B]">Tienes cambios sin guardar.</span>}
        </div>
        {aviso && (
          <div
            role={aviso.tipo === 'error' ? 'alert' : 'status'}
            className={`mt-4 rounded-2xl border p-4 text-sm ${aviso.tipo === 'error' ? 'border-[#B3261E]/60 bg-[#B3261E]/15' : 'border-[#C9A46B]/60 bg-[#2E0E1A]'}`}
          >
            {aviso.texto}
          </div>
        )}
        <p className="mt-6 text-xs text-[#F3E7DC]/55">
          Esto es una guía para ordenar tu información técnica; no reemplaza la revisión de un profesional ni garantiza resultados.
        </p>
      </div>
    </main>
  )
}
