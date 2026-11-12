'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CONDICIONES, etiquetaCondicion, type Condicion } from '@/lib/empresarial/formulacion'
import { formatoDinero, formatoNumero, num } from '@/lib/empresarial/mercadoDemanda'
import {
  CATEGORIAS_COSTO_FIJO,
  CATEGORIAS_INVERSION,
  alertasFinanciero,
  calcular,
  formatoMeses,
  itemVacio,
  revisarFinanciero,
  utilidadCon,
  type Financiero,
  type ItemFinanciero,
  type TipoItem,
} from '@/lib/empresarial/financiero'

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
  return (entero.slice(0, 13) + (resto.length ? '.' + resto.join('').slice(0, 2) : '')).replace(/^\./, '0.')
}

interface Props {
  proyecto: { id: string; nombre: string; moneda: string | null }
  inicial: Financiero
  itemsIniciales: ItemFinanciero[]
  yaGuardado: boolean
  copiadoDeMercado: boolean
  referencia: { somAnual: number | null; unidadPrecio: string }
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

export function FinancieroClient({ proyecto, inicial, itemsIniciales, yaGuardado, copiadoDeMercado, referencia }: Props) {
  const [f, setF] = useState<Financiero>(inicial)
  const [items, setItems] = useState<ItemFinanciero[]>(itemsIniciales)
  const [idsGuardados, setIdsGuardados] = useState<string[]>(itemsIniciales.map((x) => x.id))
  const [guardado, setGuardado] = useState(yaGuardado)
  const [sucio, setSucio] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const botonOro = `h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#C9A46B] to-[#B08D57] text-[#3A1420] font-extrabold disabled:opacity-50 disabled:cursor-not-allowed ${RELIEVE_BOTON}`
  const botonSuave = `h-11 px-4 inline-flex items-center justify-center gap-2 rounded-xl border border-[#B08D57]/50 bg-[#3B1727] text-[#F3E7DC] font-semibold ${RELIEVE_BOTON}`

  const r = useMemo(() => calcular(f, items), [f, items])
  const alertas = useMemo(() => alertasFinanciero(f, items, r, { somAnual: referencia.somAnual }), [f, items, r, referencia.somAnual])
  const revision = useMemo(() => revisarFinanciero(f, items, r, alertas), [f, items, r, alertas])
  const faltan = revision.filter((x) => x.obligatorio && !x.cumple)
  const faltanRec = revision.filter((x) => !x.obligatorio && !x.cumple)
  const din = (n: number | null) => formatoDinero(n, proyecto.moneda)

  const cambiar = (campo: keyof Financiero, valor: string) => {
    setF((p) => ({ ...p, [campo]: valor }))
    setSucio(true)
  }
  const cambiarItem = (id: string, x: Partial<ItemFinanciero>) => {
    setItems((p) => p.map((i) => (i.id === id ? { ...i, ...x } : i)))
    setSucio(true)
  }

  async function guardar() {
    setAviso(null)
    setGuardando(true)
    const supabase = createClient()
    const { error: e1 } = await supabase.from('sfpe_financiero').upsert(
      {
        proyecto_id: proyecto.id,
        precio_unitario: num(f.precio_unitario),
        costo_variable_unitario: num(f.costo_variable_unitario),
        unidades_mes: num(f.unidades_mes),
        unidades_fuente: f.unidades_fuente.trim() || null,
        unidades_condicion: f.unidades_condicion,
        aporte_propio: num(f.aporte_propio),
        actualizada_en: new Date().toISOString(),
      },
      { onConflict: 'proyecto_id' },
    )
    if (e1) {
      setGuardando(false)
      return setAviso({ tipo: 'error', texto: 'No pudimos guardar las cifras. Intenta de nuevo.' })
    }
    const conTexto = items.filter((i) => i.concepto.trim())
    const contador: Record<string, number> = {}
    const filas = conTexto.map((i) => {
      contador[i.tipo] = (contador[i.tipo] ?? 0) + 1
      return {
        anterior: i.id,
        fila: {
          id: i.id.startsWith('nuevo-') ? crypto.randomUUID() : i.id,
          proyecto_id: proyecto.id,
          tipo: i.tipo,
          concepto: i.concepto.trim(),
          categoria: i.categoria || null,
          valor: num(i.valor),
          fuente: i.fuente.trim() || null,
          condicion: i.condicion,
          orden: contador[i.tipo],
        },
      }
    })
    if (filas.length > 0) {
      const { error } = await supabase.from('sfpe_financiero_items').upsert(filas.map((x) => x.fila), { onConflict: 'id' })
      if (error) {
        setGuardando(false)
        return setAviso({ tipo: 'error', texto: 'Se guardaron las cifras, pero no la inversión y los costos. Intenta de nuevo.' })
      }
    }
    const nuevos = filas.map((x) => x.fila.id)
    const borrar = idsGuardados.filter((id) => !nuevos.includes(id))
    if (borrar.length > 0) await supabase.from('sfpe_financiero_items').delete().in('id', borrar)
    const mapa = new Map(filas.map((x) => [x.anterior, x.fila.id]))
    setItems(conTexto.map((i) => ({ ...i, id: mapa.get(i.id) ?? i.id })))
    setIdsGuardados(nuevos)
    setGuardado(true)
    setSucio(false)
    setGuardando(false)
    setAviso({ tipo: 'ok', texto: 'Financiero básico guardado.' })
  }

  const lista = (tipo: TipoItem, categorias: { valor: string; etiqueta: string }[], etiquetaAgregar: string, conceptoEj: string) => {
    const propios = items.filter((i) => i.tipo === tipo)
    return (
      <div>
        {propios.length === 0 && <p className="text-sm text-[#F3E7DC]/60">Todavía no hay ninguno.</p>}
        <ul className="space-y-4">
          {propios.map((i, n) => (
            <li key={i.id} className="rounded-xl bg-[#2E0E1A] p-4">
              <div className="flex items-start gap-2">
                <div className="grid w-full gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold" htmlFor={`i-${i.id}-c`}>
                      Concepto
                    </label>
                    <input id={`i-${i.id}-c`} value={i.concepto} placeholder={conceptoEj} onChange={(e) => cambiarItem(i.id, { concepto: e.target.value })} className={CAMPO_INTERNO} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold" htmlFor={`i-${i.id}-v`}>
                      {tipo === 'inversion' ? 'Valor' : 'Valor por mes'}
                    </label>
                    <input id={`i-${i.id}-v`} inputMode="decimal" value={i.valor} onChange={(e) => cambiarItem(i.id, { valor: SOLO_DECIMAL(e.target.value) })} className={CAMPO_INTERNO} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold" htmlFor={`i-${i.id}-t`}>
                      Qué clase es
                    </label>
                    <select id={`i-${i.id}-t`} value={i.categoria} onChange={(e) => cambiarItem(i.id, { categoria: e.target.value })} className={CAMPO_INTERNO}>
                      {categorias.map((c) => (
                        <option key={c.valor} value={c.valor}>
                          {c.etiqueta}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold" htmlFor={`i-${i.id}-f`}>
                      De dónde sale el valor
                    </label>
                    <input id={`i-${i.id}-f`} value={i.fuente} placeholder="Cotización, factura, precio visto en…" onChange={(e) => cambiarItem(i.id, { fuente: e.target.value })} className={CAMPO_INTERNO} />
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={`Quitar el concepto ${n + 1}`}
                  className="mt-6 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#B08D57]/40 text-[#F3E7DC]/80 hover:text-white"
                  onClick={() => {
                    setItems((p) => p.filter((x) => x.id !== i.id))
                    setSucio(true)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <SelectorCondicion valor={i.condicion} onCambio={(c) => cambiarItem(i.id, { condicion: c })} etiqueta={`concepto ${n + 1}`} />
            </li>
          ))}
        </ul>
        <button
          type="button"
          className={`mt-3 ${botonSuave}`}
          onClick={() => {
            setItems((p) => [...p, itemVacio(tipo)])
            setSucio(true)
          }}
        >
          <Plus className="h-4 w-4" /> {etiquetaAgregar}
        </button>
        <p className="mt-3 text-sm">
          Total {tipo === 'inversion' ? 'de la inversión' : 'de costos fijos por mes'}:{' '}
          <span className="font-extrabold text-[#C9A46B]">{din(tipo === 'inversion' ? r.inversion : r.fijosMes)}</span>
        </p>
      </div>
    )
  }

  const sens = [
    { etiqueta: 'Vendes 20 % menos', fu: 0.8, fp: 1 },
    { etiqueta: 'Tal como lo escribiste', fu: 1, fp: 1 },
    { etiqueta: 'Vendes 20 % más', fu: 1.2, fp: 1 },
    { etiqueta: 'Bajas el precio 10 %', fu: 1, fp: 0.9 },
    { etiqueta: 'Subes el precio 10 %', fu: 1, fp: 1.1 },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2E0E1A] via-[#3B1727] to-[#54142B] text-[#F3E7DC]">
      <div className="max-w-[900px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <Link href={`/empresarial/camino?proyecto=${proyecto.id}`} className="inline-flex items-center gap-2 text-sm text-[#F3E7DC]/70 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Volver a mi camino
        </Link>

        <div className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-[#C9A46B]">Financiero básico · {proyecto.nombre}</div>
        <h1 className="mt-3 text-3xl lg:text-4xl font-extrabold">¿Cuánto cuesta y cuánto deja?</h1>
        <p className="mt-3 text-[#F3E7DC]/80 leading-relaxed">
          Con tus cifras calculamos cuánto dinero necesitas para empezar, cuánto debes vender para no perder y en cuánto tiempo recuperas lo
          invertido. Las cuentas las hace el sistema con lo que tú escribes; no se inventa ninguna cifra.
        </p>

        {copiadoDeMercado && !guardado && (
          <div className="mt-6 rounded-2xl border border-[#C9A46B]/60 bg-[#2E0E1A] p-4 text-sm">
            <p className="font-semibold">Traímos tu precio y tu costo por unidad del estudio de mercado.</p>
            <p className="mt-1 text-[#F3E7DC]/80">Revísalos. Hasta que guardes, nada queda registrado.</p>
          </div>
        )}

        <Seccion titulo="1. Cuánto vendes y a qué precio" ayuda={`Por cada unidad que vendes${referencia.unidadPrecio ? ` (${referencia.unidadPrecio})` : ''}.`}>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="block font-semibold" htmlFor="f-precio">
                Precio por unidad
              </label>
              <input id="f-precio" inputMode="decimal" value={f.precio_unitario} onChange={(e) => cambiar('precio_unitario', SOLO_DECIMAL(e.target.value))} className={CAMPO_ENTRADA} />
            </div>
            <div>
              <label className="block font-semibold" htmlFor="f-costo">
                Costo por unidad
              </label>
              <input id="f-costo" inputMode="decimal" value={f.costo_variable_unitario} onChange={(e) => cambiar('costo_variable_unitario', SOLO_DECIMAL(e.target.value))} className={CAMPO_ENTRADA} />
              <p className="mt-1 text-xs text-[#F3E7DC]/60">Lo que cuesta producir o prestar una unidad: insumos, empaque, comisiones.</p>
            </div>
            <div>
              <label className="block font-semibold" htmlFor="f-unid">
                Unidades que vendes al mes
              </label>
              <input id="f-unid" inputMode="decimal" value={f.unidades_mes} onChange={(e) => cambiar('unidades_mes', SOLO_DECIMAL(e.target.value))} className={CAMPO_ENTRADA} />
            </div>
          </div>
          <div>
            <label className="block font-semibold" htmlFor="f-fuente">
              ¿De dónde sale esa cantidad?
            </label>
            <p className="text-xs text-[#F3E7DC]/60">Apóyate en tu estudio de mercado y en lo que puedes atender. Una cantidad deseada no es una cantidad esperada.</p>
            <textarea id="f-fuente" rows={3} value={f.unidades_fuente} onChange={(e) => cambiar('unidades_fuente', e.target.value)} className={CAMPO_ENTRADA} />
            <SelectorCondicion
              valor={f.unidades_condicion}
              onCambio={(c) => {
                setF((p) => ({ ...p, unidades_condicion: c }))
                setSucio(true)
              }}
              etiqueta="Unidades por mes"
            />
          </div>
          {r.margenUnidad !== null && (
            <div className="rounded-xl border border-dashed border-[#C9A46B]/60 bg-[#2E0E1A] p-3 text-sm">
              Cada unidad te deja <span className="font-extrabold text-[#C9A46B]">{din(r.margenUnidad)}</span> antes de pagar los costos fijos.
            </div>
          )}
        </Seccion>

        <Seccion titulo="2. Inversión inicial" ayuda="Lo que hay que pagar una sola vez antes de empezar a vender.">
          {lista('inversion', CATEGORIAS_INVERSION, 'Agregar gasto de inversión', 'Horno industrial, adecuación del local, registro de marca…')}
          <div>
            <label className="block font-semibold" htmlFor="f-aporte">
              Dinero propio disponible para la inversión (opcional)
            </label>
            <input id="f-aporte" inputMode="decimal" value={f.aporte_propio} onChange={(e) => cambiar('aporte_propio', SOLO_DECIMAL(e.target.value))} className={CAMPO_ENTRADA} />
            {r.faltaAporte !== null && (
              <p className="mt-2 text-sm">
                {r.faltaAporte > 0 ? (
                  <>
                    Faltaría financiar <span className="font-extrabold text-[#C9A46B]">{din(r.faltaAporte)}</span>.
                  </>
                ) : (
                  'Tu dinero propio cubre la inversión.'
                )}
              </p>
            )}
          </div>
        </Seccion>

        <Seccion titulo="3. Costos fijos por mes" ayuda="Lo que pagas cada mes, vendas mucho o poco: personal, arriendo, internet, contabilidad.">
          {lista('costo_fijo', CATEGORIAS_COSTO_FIJO, 'Agregar costo fijo', 'Sueldo de la persona que cocina, arriendo, internet…')}
        </Seccion>

        <section className={`mt-6 rounded-2xl border border-[#C9A46B]/60 bg-[#2E0E1A] p-5 ${RELIEVE_TARJETA}`}>
          <h2 className="text-xl font-extrabold">Lo que dicen tus cifras</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {[
              ['Ingresos por mes', din(r.ingresosMes)],
              ['Utilidad por mes', din(r.utilidadMes)],
              ['Para no perder, debes vender al mes', r.equilibrioUnidades === null ? '—' : `${formatoNumero(Math.ceil(r.equilibrioUnidades))} unidades`],
              ['Recuperas la inversión en', formatoMeses(r.mesesRecuperacion)],
            ].map(([t, v]) => (
              <div key={t} className="rounded-xl bg-[#3B1727] p-4">
                <div className="text-xs text-[#F3E7DC]/65">{t}</div>
                <div className="mt-1 text-lg font-extrabold">{v}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-[#F3E7DC]/60">Son cuentas con tus propias cifras: valen lo que valgan tus fuentes. No son una promesa de resultados.</p>

          {r.utilidadMes !== null && (
            <div className="mt-5">
              <h3 className="font-extrabold">¿Y si cambian las cosas?</h3>
              <p className="text-xs text-[#F3E7DC]/60">Un ejercicio para ver qué tan frágil es tu proyecto. No es un pronóstico y no se guarda.</p>
              <ul className="mt-2 space-y-2 text-sm">
                {sens.map((s) => {
                  const u = utilidadCon(f, items, s.fu, s.fp)
                  return (
                    <li key={s.etiqueta} className="flex items-center justify-between gap-3 rounded-xl bg-[#3B1727] px-4 py-2">
                      <span>{s.etiqueta}</span>
                      <span className={`font-extrabold ${u !== null && u < 0 ? 'text-[#FF8A80]' : 'text-[#C9A46B]'}`}>{din(u)} al mes</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </section>

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
            {revision.map((x) => (
              <li key={x.clave} className="flex items-start gap-3 rounded-xl bg-[#2E0E1A] px-4 py-3">
                <span
                  aria-hidden
                  className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                    x.cumple ? 'bg-[#C9A46B] text-[#3A1420]' : 'border border-[#B08D57]/60 text-[#F3E7DC]/60'
                  }`}
                >
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
          {faltanRec.length > 0 && faltan.length === 0 && <p className="mt-3 text-xs text-[#F3E7DC]/60">Quedan {faltanRec.length} detalles recomendados.</p>}
          <p className="mt-3 text-xs text-[#F3E7DC]/55">Dato marcado como “{etiquetaCondicion('supuesto')}” o “{etiquetaCondicion('pendiente')}”: compruébalo antes de presentarlo como hecho.</p>
        </section>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button type="button" onClick={guardar} disabled={guardando} className={botonOro}>
            {guardando ? 'Guardando…' : 'Guardar financiero básico'}
          </button>
          {guardado && !sucio && (
            <Link href={`/empresarial/documento?proyecto=${proyecto.id}`} className={botonSuave}>
              Seguir: documento final
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
          Esto es una guía básica para ordenar tus cuentas; no reemplaza a un contador ni garantiza resultados. Un análisis financiero completo (flujo de caja, VAN, TIR) viene después.
        </p>
      </div>
    </main>
  )
}
