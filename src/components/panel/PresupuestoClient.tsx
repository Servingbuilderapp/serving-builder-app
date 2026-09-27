'use client'

import React from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Loader2,
  Minus,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import { guardarPresupuesto } from '@/app/(dashboard)/admin/proyectos/[id]/presupuesto/actions'

/* ==========================================================================
   Presupuesto. Pantalla INTERNA del equipo.

   Cada ítem de gasto cuelga de UNA actividad de la cadena de valor. Los
   totales se calculan solos y se comparan contra el tope de la convocatoria
   y contra la contrapartida mínima que exija.
   ========================================================================== */

export type ActividadOpcion = {
  cadenaValorId: string
  actividadIndice: number
  clave: string
  objetivoNumero: number
  objetivoTexto: string
  actividadNumero: number
  actividadTexto: string
}

export type ItemVista = {
  id: string
  cadenaValorId: string
  actividadIndice: number
  clave: string
  rubro: string
  descripcion: string
  especificaciones: string
  justificacion: string
  unidad: string
  cantidad: string
  valorUnitario: string
  fuente: string
  orden: number
}

export type ReglasVista = {
  moneda: string
  montoMaximo: string
  contrapartidaMinimaPct: string
  imprevistosPct: string
  rubrosNoFinanciables: string
  notas: string
}

type Props = {
  proyectoId: string
  nombreProyecto: string
  nombreCliente: string
  actividades: ActividadOpcion[]
  items: ItemVista[]
  reglas: ReglasVista
}

const RELIEVE_TARJETA =
  'shadow-[0_1px_2px_rgba(20,5,10,0.28),0_8px_24px_-14px_rgba(20,5,10,0.55)]'

const BOTON_DORADO =
  'bg-gradient-to-b from-[#E8C777] via-[#C9A46B] to-[#9C7A3E] text-[#2E0E1A] border border-[#7A5A2E]/60 ' +
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_4px_0_#7A5A2E,0_12px_20px_-6px_rgba(20,5,10,0.55)] ' +
  'hover:brightness-105 hover:-translate-y-0.5 ' +
  'active:translate-y-[3px] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_1px_0_#7A5A2E,0_4px_10px_-4px_rgba(20,5,10,0.5)] ' +
  'disabled:translate-y-0 disabled:hover:translate-y-0 disabled:brightness-90 disabled:shadow-none ' +
  'transition-all duration-150'

const TINTA = 'text-[#F3E7DC]'
const TINTA_SUAVE = 'text-[#F3E7DC]/70'
const TINTA_TENUE = 'text-[#F3E7DC]/50'
const BORDE = 'border-[#6E4A50]'

const CAMPO =
  'w-full rounded-lg border border-[#6E4A50] bg-[#3B1727] px-2.5 py-2 text-[13px] leading-snug text-[#F3E7DC] placeholder:text-[#F3E7DC]/40 focus:outline-none focus:ring-2 focus:ring-[#C9A46B]/25'

/** Los rubros del método. El nombre visible va en español corriente. */
const RUBROS: { valor: string; nombre: string }[] = [
  { valor: 'TALENTO_HUMANO', nombre: 'Talento humano' },
  { valor: 'EQUIPOS_Y_SOFTWARE', nombre: 'Equipos y software' },
  { valor: 'MATERIALES_E_INSUMOS', nombre: 'Materiales e insumos' },
  { valor: 'CAPACITACION', nombre: 'Capacitación' },
  { valor: 'GASTOS_DE_VIAJE', nombre: 'Gastos de viaje' },
  { valor: 'OTROS', nombre: 'Otros' },
]

const MONEDAS = ['COP', 'USD', 'EUR']

function aNumero(texto: string): number {
  const n = Number(String(texto).replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

function formatearPlata(valor: number, moneda: string): string {
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: moneda || 'COP',
      maximumFractionDigits: 0,
    }).format(valor)
  } catch {
    return `${moneda} ${Math.round(valor).toLocaleString('es-CO')}`
  }
}

function Tarjeta({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border ${BORDE} bg-[#4C2032] ${RELIEVE_TARJETA} ${className}`}>{children}</div>
}

function Etiqueta({ children }: { children: React.ReactNode }) {
  return (
    <span className={`mb-1 block text-[10px] font-bold uppercase tracking-wider ${TINTA_TENUE}`}>
      {children}
    </span>
  )
}

let contador = 0
const nuevaClaveLocal = () => {
  contador += 1
  return `nuevo-${contador}`
}

type ItemEnPantalla = ItemVista & { claveLocal: string }

export function PresupuestoClient({
  proyectoId,
  nombreProyecto,
  nombreCliente,
  actividades,
  items,
  reglas: reglasIniciales,
}: Props) {
  const [reglas, setReglas] = React.useState<ReglasVista>(reglasIniciales)
  const [lineas, setLineas] = React.useState<ItemEnPantalla[]>(() =>
    items.map((i) => ({ ...i, claveLocal: i.id || nuevaClaveLocal() })),
  )
  const [fichasAbiertas, setFichasAbiertas] = React.useState<Record<string, boolean>>({})
  const [aviso, setAviso] = React.useState<{ ok: boolean; texto: string } | null>(null)
  const [guardando, empezarGuardado] = React.useTransition()

  const moneda = reglas.moneda || 'COP'

  const cambiarRegla = (cambios: Partial<ReglasVista>) => {
    setAviso(null)
    setReglas((prev) => ({ ...prev, ...cambios }))
  }

  const cambiarLinea = (claveLocal: string, cambios: Partial<ItemVista>) => {
    setAviso(null)
    setLineas((prev) =>
      prev.map((l) => (l.claveLocal === claveLocal ? { ...l, ...cambios } : l)),
    )
  }

  const agregarLinea = (actividad: ActividadOpcion) => {
    setAviso(null)
    const claveLocal = nuevaClaveLocal()
    setLineas((prev) => [
      ...prev,
      {
        id: '',
        claveLocal,
        cadenaValorId: actividad.cadenaValorId,
        actividadIndice: actividad.actividadIndice,
        clave: actividad.clave,
        rubro: 'TALENTO_HUMANO',
        descripcion: '',
        especificaciones: '',
        justificacion: '',
        unidad: 'unidad',
        cantidad: '1',
        valorUnitario: '',
        fuente: 'SOLICITADO',
        orden: prev.length + 1,
      },
    ])
  }

  const quitarLinea = (claveLocal: string) => {
    setAviso(null)
    setLineas((prev) => prev.filter((l) => l.claveLocal !== claveLocal))
  }

  const alternarFicha = (claveLocal: string) => {
    setFichasAbiertas((prev) => ({ ...prev, [claveLocal]: !prev[claveLocal] }))
  }

  /* --- Cuentas ----------------------------------------------------------- */

  const cuentas = React.useMemo(() => {
    const totalDe = (l: ItemEnPantalla) => aNumero(l.cantidad) * aNumero(l.valorUnitario)

    const solicitado = lineas
      .filter((l) => l.fuente === 'SOLICITADO')
      .reduce((suma, l) => suma + totalDe(l), 0)
    const contrapartida = lineas
      .filter((l) => l.fuente === 'CONTRAPARTIDA')
      .reduce((suma, l) => suma + totalDe(l), 0)

    const imprevistosPct = aNumero(reglas.imprevistosPct)
    const imprevistos = (solicitado * imprevistosPct) / 100
    const solicitadoConImprevistos = solicitado + imprevistos
    const total = solicitadoConImprevistos + contrapartida

    const porRubro = RUBROS.map((r) => ({
      nombre: r.nombre,
      valor: lineas
        .filter((l) => l.rubro === r.valor)
        .reduce((suma, l) => suma + totalDe(l), 0),
    })).filter((r) => r.valor > 0)

    const topeTexto = reglas.montoMaximo.trim()
    const tope = topeTexto ? aNumero(topeTexto) : null
    const seExcede = tope !== null && tope > 0 && solicitadoConImprevistos > tope

    const contrapartidaPct = total > 0 ? (contrapartida / total) * 100 : 0
    const minimoPct = aNumero(reglas.contrapartidaMinimaPct)
    const faltaContrapartida = minimoPct > 0 && contrapartidaPct + 0.001 < minimoPct

    return {
      totalDe,
      solicitado,
      contrapartida,
      imprevistos,
      imprevistosPct,
      solicitadoConImprevistos,
      total,
      porRubro,
      tope,
      seExcede,
      contrapartidaPct,
      minimoPct,
      faltaContrapartida,
    }
  }, [lineas, reglas])

  const revision = React.useMemo(() => {
    const actividadesConItem = new Set(lineas.map((l) => l.clave))
    const conJustificacion = lineas.filter((l) => l.justificacion.trim().length > 0)
    const conValor = lineas.filter(
      (l) => aNumero(l.cantidad) > 0 && aNumero(l.valorUnitario) > 0,
    )

    return [
      {
        texto: `Cada actividad tiene al menos un gasto (${actividadesConItem.size} de ${actividades.length})`,
        bien: actividades.length > 0 && actividadesConItem.size === actividades.length,
      },
      {
        texto: `Cada ítem tiene cantidad y valor (${conValor.length} de ${lineas.length})`,
        bien: lineas.length > 0 && conValor.length === lineas.length,
      },
      {
        texto: `Cada ítem tiene su justificación (${conJustificacion.length} de ${lineas.length})`,
        bien: lineas.length > 0 && conJustificacion.length === lineas.length,
      },
      {
        texto: 'Los imprevistos están entre el 5 % y el 10 %',
        bien: cuentas.imprevistosPct >= 5 && cuentas.imprevistosPct <= 10,
      },
      {
        texto: 'Lo solicitado cabe dentro del tope de la convocatoria',
        bien: cuentas.tope !== null && cuentas.tope > 0 && !cuentas.seExcede,
      },
    ]
  }, [lineas, actividades, cuentas])

  const alGuardar = () => {
    setAviso(null)
    empezarGuardado(async () => {
      const r = await guardarPresupuesto(
        proyectoId,
        reglas,
        lineas.map((l, indice) => ({
          id: l.id,
          cadenaValorId: l.cadenaValorId,
          actividadIndice: l.actividadIndice,
          rubro: l.rubro,
          descripcion: l.descripcion,
          especificaciones: l.especificaciones,
          justificacion: l.justificacion,
          unidad: l.unidad,
          cantidad: l.cantidad,
          valorUnitario: l.valorUnitario,
          fuente: l.fuente,
          orden: indice + 1,
        })),
      )
      setAviso({ ok: r.ok, texto: r.mensaje })
    })
  }

  /* ---------------------------------------------------------------------- */

  if (actividades.length === 0) {
    return (
      <div className="min-h-full bg-[#54142B] px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <Tarjeta className="p-8 text-center">
            <h1 className={`text-xl font-extrabold ${TINTA}`}>Todavía no hay cadena de valor</h1>
            <p className={`mt-3 text-[14px] leading-relaxed ${TINTA_SUAVE}`}>
              El presupuesto se arma sobre las actividades: cada gasto tiene que colgar de una. Primero
              hay que llenar la cadena de valor.
            </p>
            <Link
              href={`/admin/proyectos/${proyectoId}/cadena-valor`}
              className={`mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-extrabold ${BOTON_DORADO}`}
            >
              Ir a la cadena de valor <ArrowRight className="h-4 w-4" />
            </Link>
          </Tarjeta>
        </div>
      </div>
    )
  }

  const porObjetivo = new Map<number, ActividadOpcion[]>()
  for (const a of actividades) {
    porObjetivo.set(a.objetivoNumero, [...(porObjetivo.get(a.objetivoNumero) || []), a])
  }

  return (
    <div className="min-h-full bg-[#54142B] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-[1180px]">
        <header className="mb-5">
          <Link
            href={`/admin/proyectos/${proyectoId}/cadena-valor`}
            className={`mb-2 inline-flex items-center gap-1.5 text-[12px] font-semibold ${TINTA_SUAVE} hover:text-[#C9A46B]`}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Volver a la cadena de valor
          </Link>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className={`text-[19px] font-extrabold uppercase tracking-tight ${TINTA}`}>
              Presupuesto
            </h1>
            <span className="rounded-full bg-[#3B1727] border border-[#6E4A50] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#C9A46B]">
              Interno
            </span>
          </div>
          <p className={`text-[13px] ${TINTA_TENUE}`}>
            {nombreProyecto}
            {nombreCliente ? ` · ${nombreCliente}` : ''} · cada gasto cuelga de una actividad
          </p>
        </header>

        {aviso ? (
          <div
            className={`mb-4 rounded-xl border px-4 py-3 text-[13px] font-medium ${
              aviso.ok
                ? 'border-[#7A8B6F]/40 bg-[#7A8B6F]/10 text-[#A9BC9C]'
                : 'border-[#C0604A]/40 bg-[#C0604A]/10 text-[#E0917E]'
            }`}
            role="status"
          >
            {aviso.texto}
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-4">
            {/* --- Reglas de la convocatoria --- */}
            <Tarjeta className="p-4 sm:p-5">
              <h2 className={`mb-3 text-[13px] font-bold uppercase tracking-wider ${TINTA}`}>
                Reglas de la convocatoria
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Etiqueta>Moneda</Etiqueta>
                  <select
                    value={reglas.moneda}
                    onChange={(e) => cambiarRegla({ moneda: e.target.value })}
                    className={CAMPO}
                  >
                    {MONEDAS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Etiqueta>Tope que deja pedir</Etiqueta>
                  <input
                    value={reglas.montoMaximo}
                    onChange={(e) => cambiarRegla({ montoMaximo: e.target.value })}
                    inputMode="decimal"
                    placeholder="Ej.: 180000000"
                    className={CAMPO}
                  />
                </div>
                <div>
                  <Etiqueta>Contrapartida mínima %</Etiqueta>
                  <input
                    value={reglas.contrapartidaMinimaPct}
                    onChange={(e) => cambiarRegla({ contrapartidaMinimaPct: e.target.value })}
                    inputMode="decimal"
                    placeholder="Ej.: 20"
                    className={CAMPO}
                  />
                </div>
                <div>
                  <Etiqueta>Imprevistos %</Etiqueta>
                  <input
                    value={reglas.imprevistosPct}
                    onChange={(e) => cambiarRegla({ imprevistosPct: e.target.value })}
                    inputMode="decimal"
                    placeholder="Entre 5 y 10"
                    className={CAMPO}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Etiqueta>Lo que la convocatoria NO financia</Etiqueta>
                  <textarea
                    value={reglas.rubrosNoFinanciables}
                    onChange={(e) => cambiarRegla({ rubrosNoFinanciables: e.target.value })}
                    rows={2}
                    placeholder="Ej.: compra de terrenos, pago de deudas…"
                    className={`${CAMPO} resize-none`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Etiqueta>Notas del equipo</Etiqueta>
                  <textarea
                    value={reglas.notas}
                    onChange={(e) => cambiarRegla({ notas: e.target.value })}
                    rows={2}
                    placeholder="Topes por rubro, condiciones especiales…"
                    className={`${CAMPO} resize-none`}
                  />
                </div>
              </div>
            </Tarjeta>

            {/* --- Detalle por actividad --- */}
            {[...porObjetivo.entries()].map(([numeroObjetivo, delObjetivo]) => (
              <Tarjeta key={numeroObjetivo} className="p-4 sm:p-5">
                <div className="mb-3 flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[#3B1727] text-[12px] font-bold text-[#C9A46B]">
                    {numeroObjetivo}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Etiqueta>Objetivo específico</Etiqueta>
                    <p className={`text-[13.5px] leading-snug ${TINTA}`}>
                      {delObjetivo[0].objetivoTexto}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {delObjetivo.map((actividad) => {
                    const suyas = lineas.filter((l) => l.clave === actividad.clave)
                    const subtotal = suyas.reduce((s, l) => s + cuentas.totalDe(l), 0)

                    return (
                      <div
                        key={actividad.clave}
                        className="rounded-xl border border-[#6E4A50] bg-[#3B1727] p-3"
                      >
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#C9A46B]/15 text-[10px] font-bold text-[#C9A46B]">
                              {actividad.actividadNumero}
                            </span>
                            <span className={`truncate text-[13px] font-semibold ${TINTA}`}>
                              {actividad.actividadTexto}
                            </span>
                          </div>
                          <span className={`text-[12px] font-bold ${TINTA_SUAVE}`}>
                            {formatearPlata(subtotal, moneda)}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {suyas.map((linea) => {
                            const total = cuentas.totalDe(linea)
                            const abierta = Boolean(fichasAbiertas[linea.claveLocal])
                            return (
                              <div
                                key={linea.claveLocal}
                                className="rounded-lg border border-[#6E4A50] bg-[#4C2032] p-2.5"
                              >
                                <div className="grid gap-2 sm:grid-cols-12">
                                  <div className="sm:col-span-3">
                                    <Etiqueta>Rubro</Etiqueta>
                                    <select
                                      value={linea.rubro}
                                      onChange={(e) =>
                                        cambiarLinea(linea.claveLocal, { rubro: e.target.value })
                                      }
                                      className={CAMPO}
                                    >
                                      {RUBROS.map((r) => (
                                        <option key={r.valor} value={r.valor}>
                                          {r.nombre}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="sm:col-span-5">
                                    <Etiqueta>Descripción del gasto</Etiqueta>
                                    <input
                                      value={linea.descripcion}
                                      onChange={(e) =>
                                        cambiarLinea(linea.claveLocal, {
                                          descripcion: e.target.value,
                                        })
                                      }
                                      placeholder="Ej.: Profesional agrónomo medio tiempo"
                                      className={CAMPO}
                                    />
                                  </div>
                                  <div className="sm:col-span-2">
                                    <Etiqueta>Unidad</Etiqueta>
                                    <input
                                      value={linea.unidad}
                                      onChange={(e) =>
                                        cambiarLinea(linea.claveLocal, { unidad: e.target.value })
                                      }
                                      placeholder="mes"
                                      maxLength={60}
                                      className={CAMPO}
                                    />
                                  </div>
                                  <div className="sm:col-span-1">
                                    <Etiqueta>Cant.</Etiqueta>
                                    <input
                                      value={linea.cantidad}
                                      onChange={(e) =>
                                        cambiarLinea(linea.claveLocal, { cantidad: e.target.value })
                                      }
                                      inputMode="decimal"
                                      className={CAMPO}
                                    />
                                  </div>
                                  <div className="sm:col-span-1 flex items-end justify-end">
                                    <button
                                      type="button"
                                      onClick={() => quitarLinea(linea.claveLocal)}
                                      title="Quitar este gasto"
                                      className="mb-1 rounded-lg border border-[#C0604A]/40 bg-[#3B1727] p-2 text-[#E0917E] transition hover:bg-[#C0604A]/10"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>

                                  <div className="sm:col-span-4">
                                    <Etiqueta>Valor unitario</Etiqueta>
                                    <input
                                      value={linea.valorUnitario}
                                      onChange={(e) =>
                                        cambiarLinea(linea.claveLocal, {
                                          valorUnitario: e.target.value,
                                        })
                                      }
                                      inputMode="decimal"
                                      placeholder="0"
                                      className={CAMPO}
                                    />
                                  </div>
                                  <div className="sm:col-span-4">
                                    <Etiqueta>Quién lo paga</Etiqueta>
                                    <select
                                      value={linea.fuente}
                                      onChange={(e) =>
                                        cambiarLinea(linea.claveLocal, { fuente: e.target.value })
                                      }
                                      className={CAMPO}
                                    >
                                      <option value="SOLICITADO">Se le pide a la convocatoria</option>
                                      <option value="CONTRAPARTIDA">Contrapartida</option>
                                    </select>
                                  </div>
                                  <div className="sm:col-span-4">
                                    <Etiqueta>Total del ítem</Etiqueta>
                                    <div
                                      className={`rounded-lg border ${BORDE} bg-[#3B1727] px-2.5 py-2 text-[13px] font-bold ${TINTA}`}
                                    >
                                      {formatearPlata(total, moneda)}
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => alternarFicha(linea.claveLocal)}
                                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#C9A46B] hover:underline"
                                >
                                  <ChevronDown
                                    className={`h-3 w-3 transition ${abierta ? 'rotate-180' : ''}`}
                                  />
                                  Ficha del ítem
                                  {linea.justificacion.trim() ? '' : ' · falta la justificación'}
                                </button>

                                {abierta ? (
                                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                    <div>
                                      <Etiqueta>Especificaciones técnicas</Etiqueta>
                                      <textarea
                                        value={linea.especificaciones}
                                        onChange={(e) =>
                                          cambiarLinea(linea.claveLocal, {
                                            especificaciones: e.target.value,
                                          })
                                        }
                                        rows={3}
                                        placeholder="Qué es exactamente: características, perfil, marca de referencia…"
                                        className={`${CAMPO} resize-none`}
                                      />
                                    </div>
                                    <div>
                                      <Etiqueta>Justificación</Etiqueta>
                                      <textarea
                                        value={linea.justificacion}
                                        onChange={(e) =>
                                          cambiarLinea(linea.claveLocal, {
                                            justificacion: e.target.value,
                                          })
                                        }
                                        rows={3}
                                        placeholder="Por qué este gasto es necesario para lograr la actividad"
                                        className={`${CAMPO} resize-none`}
                                      />
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            )
                          })}
                        </div>

                        <button
                          type="button"
                          onClick={() => agregarLinea(actividad)}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-[#6E4A50] bg-[#3B1727] px-3 py-1.5 text-[12px] font-bold text-[#C9A46B] transition hover:-translate-y-px"
                        >
                          <Plus className="h-3.5 w-3.5" /> Agregar un gasto a esta actividad
                        </button>
                      </div>
                    )
                  })}
                </div>
              </Tarjeta>
            ))}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={alGuardar}
                disabled={guardando}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-extrabold disabled:opacity-60 ${BOTON_DORADO}`}
              >
                {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {guardando ? 'Guardando…' : 'Guardar el presupuesto'}
              </button>
              <p className={`max-w-md text-[12px] ${TINTA_TENUE}`}>
                Un gasto sin descripción no se guarda. Los totales se calculan solos, no hay que
                escribirlos.
              </p>
            </div>
          </div>

          {/* --- Columna de totales --- */}
          <aside className="space-y-4">
            <Tarjeta className="p-4">
              <h2 className={`mb-3 text-[13px] font-bold uppercase tracking-wider ${TINTA}`}>
                Cuentas
              </h2>
              <dl className="space-y-1.5 text-[12.5px]">
                <div className="flex items-baseline justify-between gap-2">
                  <dt className={TINTA_SUAVE}>Se le pide a la convocatoria</dt>
                  <dd className={`font-bold ${TINTA}`}>
                    {formatearPlata(cuentas.solicitado, moneda)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <dt className={TINTA_SUAVE}>Imprevistos ({cuentas.imprevistosPct || 0} %)</dt>
                  <dd className={`font-bold ${TINTA}`}>
                    {formatearPlata(cuentas.imprevistos, moneda)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-2 border-t border-[#6E4A50] pt-1.5">
                  <dt className={TINTA_SUAVE}>Total solicitado</dt>
                  <dd className={`font-extrabold ${TINTA}`}>
                    {formatearPlata(cuentas.solicitadoConImprevistos, moneda)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <dt className={TINTA_SUAVE}>
                    Contrapartida ({cuentas.contrapartidaPct.toFixed(1)} %)
                  </dt>
                  <dd className={`font-bold ${TINTA}`}>
                    {formatearPlata(cuentas.contrapartida, moneda)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-2 border-t border-[#6E4A50] pt-1.5">
                  <dt className={`font-semibold ${TINTA}`}>Costo total del proyecto</dt>
                  <dd className={`font-extrabold ${TINTA}`}>
                    {formatearPlata(cuentas.total, moneda)}
                  </dd>
                </div>
              </dl>

              {cuentas.seExcede ? (
                <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-[#C0604A]/10 border border-[#C0604A]/40 px-2.5 py-2 text-[12px] font-medium text-[#E0917E]">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none" />
                  Lo solicitado se pasa del tope de la convocatoria por{' '}
                  {formatearPlata(cuentas.solicitadoConImprevistos - (cuentas.tope || 0), moneda)}.
                </p>
              ) : null}

              {cuentas.faltaContrapartida ? (
                <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-[#C99A3D]/10 border border-[#C99A3D]/40 px-2.5 py-2 text-[12px] font-medium text-[#E0B868]">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none" />
                  La convocatoria pide al menos {cuentas.minimoPct} % de contrapartida y va en{' '}
                  {cuentas.contrapartidaPct.toFixed(1)} %.
                </p>
              ) : null}
            </Tarjeta>

            {cuentas.porRubro.length > 0 ? (
              <Tarjeta className="p-4">
                <h2 className={`mb-3 text-[13px] font-bold uppercase tracking-wider ${TINTA}`}>
                  Por rubro
                </h2>
                <dl className="space-y-1.5 text-[12.5px]">
                  {cuentas.porRubro.map((r) => (
                    <div key={r.nombre} className="flex items-baseline justify-between gap-2">
                      <dt className={TINTA_SUAVE}>{r.nombre}</dt>
                      <dd className={`font-bold ${TINTA}`}>{formatearPlata(r.valor, moneda)}</dd>
                    </div>
                  ))}
                </dl>
              </Tarjeta>
            ) : null}

            <Tarjeta className="p-4">
              <h2 className={`mb-3 text-[13px] font-bold uppercase tracking-wider ${TINTA}`}>
                Revisión del presupuesto
              </h2>
              <ul className="space-y-2">
                {revision.map((p) => (
                  <li key={p.texto} className="flex items-start gap-2">
                    <span
                      className={`mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full ${
                        p.bien ? 'bg-[#7A8B6F]/15 text-[#A9BC9C]' : 'bg-[#C99A3D]/15 text-[#E0B868]'
                      }`}
                    >
                      {p.bien ? <Check className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                    </span>
                    <span className={`text-[12.5px] leading-snug ${p.bien ? TINTA_SUAVE : TINTA}`}>
                      {p.texto}
                    </span>
                  </li>
                ))}
              </ul>
            </Tarjeta>

            {reglas.rubrosNoFinanciables.trim() ? (
              <Tarjeta className="p-4">
                <h2 className={`mb-2 text-[13px] font-bold uppercase tracking-wider ${TINTA}`}>
                  Ojo, esto no lo financian
                </h2>
                <p className={`whitespace-pre-line text-[12.5px] leading-snug ${TINTA_SUAVE}`}>
                  {reglas.rubrosNoFinanciables}
                </p>
              </Tarjeta>
            ) : null}

            <Tarjeta className="p-4">
              <h2 className={`mb-2 text-[13px] font-bold uppercase tracking-wider ${TINTA}`}>
                Lo que sigue
              </h2>
              <p className={`text-[12.5px] leading-snug ${TINTA_SUAVE}`}>
                Con los gastos ya repartidos por actividad, falta ubicar cada actividad mes a mes.
              </p>
              <Link
                href={`/admin/proyectos/${proyectoId}/cronograma`}
                className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold text-[#C9A46B] hover:underline"
              >
                Ir al cronograma <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Tarjeta>
          </aside>
        </div>
      </div>
    </div>
  )
}
