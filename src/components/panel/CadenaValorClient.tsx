'use client'

import React from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Loader2, Minus, Save, Sparkles } from 'lucide-react'
import { arrancaConInfinitivo } from '@/lib/espejoObjetivos'
import { guardarCadenaValor } from '@/app/(dashboard)/admin/proyectos/[id]/cadena-valor/actions'

/* ==========================================================================
   Cadena de valor. Pantalla INTERNA del equipo.

   Una fila por objetivo específico: producto, unidad de medida, meta,
   responsable, duración y SEIS actividades — cuatro propias más administrar
   y supervisar el proyecto — todas escritas en infinitivo.
   ========================================================================== */

export type FilaCadena = {
  objetivoId: string
  numero: number
  objetivoTexto: string
  /** Actividades que ya vienen del árbol de objetivos, para proponerlas. */
  sugerencias: string[]
  producto: string
  unidadMedida: string
  meta: string
  responsable: string
  duracionMeses: string
  rutaCritica: boolean
  actividades: string[]
}

type Props = {
  proyectoId: string
  nombreProyecto: string
  nombreCliente: string
  objetivoGeneral: string
  filas: FilaCadena[]
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

const CUANTAS_ACTIVIDADES = 6
const ACTIVIDADES_FIJAS = ['Administrar el proyecto', 'Supervisar el proyecto']
/** Las dos últimas casillas son siempre administración y supervisión. */
const PRIMERA_FIJA = CUANTAS_ACTIVIDADES - ACTIVIDADES_FIJAS.length

const CAMPO =
  'w-full rounded-lg border border-[#6E4A50] bg-[#3B1727] px-2.5 py-2 text-[13px] leading-snug text-[#F3E7DC] placeholder:text-[#F3E7DC]/40 focus:outline-none focus:ring-2 focus:ring-[#C9A46B]/25'

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

/** Deja siempre seis casillas, con administración y supervisión al final. */
function seisActividades(guardadas: string[], sugerencias: string[]): string[] {
  const salida = [...guardadas]

  if (salida.length === 0) {
    for (let i = 0; i < PRIMERA_FIJA; i += 1) salida.push(sugerencias[i] || '')
    return [...salida, ...ACTIVIDADES_FIJAS]
  }

  while (salida.length < CUANTAS_ACTIVIDADES) {
    const posicion = salida.length
    salida.push(posicion >= PRIMERA_FIJA ? ACTIVIDADES_FIJAS[posicion - PRIMERA_FIJA] : '')
  }
  return salida.slice(0, CUANTAS_ACTIVIDADES)
}

export function CadenaValorClient({
  proyectoId,
  nombreProyecto,
  nombreCliente,
  objetivoGeneral,
  filas,
}: Props) {
  const [datos, setDatos] = React.useState<FilaCadena[]>(() =>
    filas.map((f) => ({ ...f, actividades: seisActividades(f.actividades, f.sugerencias) })),
  )
  const [aviso, setAviso] = React.useState<{ ok: boolean; texto: string } | null>(null)
  const [guardando, empezarGuardado] = React.useTransition()

  const cambiar = (objetivoId: string, cambios: Partial<FilaCadena>) => {
    setAviso(null)
    setDatos((prev) => prev.map((f) => (f.objetivoId === objetivoId ? { ...f, ...cambios } : f)))
  }

  const cambiarActividad = (objetivoId: string, posicion: number, valor: string) => {
    setAviso(null)
    setDatos((prev) =>
      prev.map((f) => {
        if (f.objetivoId !== objetivoId) return f
        const actividades = [...f.actividades]
        actividades[posicion] = valor
        return { ...f, actividades }
      }),
    )
  }

  const traerDelArbol = (objetivoId: string) => {
    setAviso(null)
    setDatos((prev) =>
      prev.map((f) => {
        if (f.objetivoId !== objetivoId) return f
        const actividades = [...f.actividades]
        let cursor = 0
        for (let i = 0; i < PRIMERA_FIJA; i += 1) {
          if ((actividades[i] || '').trim()) continue
          const sugerida = f.sugerencias[cursor]
          cursor += 1
          if (sugerida) actividades[i] = sugerida
        }
        return { ...f, actividades }
      }),
    )
  }

  const revision = React.useMemo(() => {
    const conProducto = datos.filter(
      (f) => f.producto.trim() && f.unidadMedida.trim() && Number(f.meta) > 0,
    )
    const conResponsable = datos.filter(
      (f) => f.responsable.trim() && Number(f.duracionMeses) > 0,
    )
    const conSeis = datos.filter(
      (f) => f.actividades.filter((a) => a.trim()).length === CUANTAS_ACTIVIDADES,
    )
    const todasLasActividades = datos.flatMap((f) => f.actividades.filter((a) => a.trim()))
    const enInfinitivo = todasLasActividades.filter((a) => arrancaConInfinitivo(a))

    return [
      {
        texto: `Cada objetivo tiene producto, unidad y meta (${conProducto.length} de ${datos.length})`,
        bien: datos.length > 0 && conProducto.length === datos.length,
      },
      {
        texto: `Cada objetivo tiene responsable y duración (${conResponsable.length} de ${datos.length})`,
        bien: datos.length > 0 && conResponsable.length === datos.length,
      },
      {
        texto: `Cada objetivo tiene sus seis actividades (${conSeis.length} de ${datos.length})`,
        bien: datos.length > 0 && conSeis.length === datos.length,
      },
      {
        texto: `Las actividades arrancan en infinitivo (${enInfinitivo.length} de ${todasLasActividades.length})`,
        bien:
          todasLasActividades.length > 0 && enInfinitivo.length === todasLasActividades.length,
      },
      {
        texto: 'Al menos un objetivo va en la ruta crítica',
        bien: datos.some((f) => f.rutaCritica),
      },
    ]
  }, [datos])

  const alGuardar = () => {
    setAviso(null)
    empezarGuardado(async () => {
      const r = await guardarCadenaValor(
        proyectoId,
        datos.map((f) => ({
          objetivoId: f.objetivoId,
          producto: f.producto,
          unidadMedida: f.unidadMedida,
          meta: f.meta,
          responsable: f.responsable,
          duracionMeses: f.duracionMeses,
          rutaCritica: f.rutaCritica,
          actividades: f.actividades,
        })),
      )
      setAviso({ ok: r.ok, texto: r.mensaje })
    })
  }

  /* ---------------------------------------------------------------------- */

  if (datos.length === 0) {
    return (
      <div className="min-h-full bg-[#54142B] mx-auto max-w-2xl px-4 py-16">
        <Tarjeta className="p-8 text-center">
          <h1 className={`text-xl font-extrabold ${TINTA}`}>Todavía no hay objetivos específicos</h1>
          <p className={`mt-3 text-[14px] leading-relaxed ${TINTA_SUAVE}`}>
            La cadena de valor se arma sobre los objetivos específicos: cada uno aporta un producto
            con su meta. Primero hay que escribir el árbol de objetivos.
          </p>
          <Link
            href={`/admin/proyectos/${proyectoId}/objetivos`}
            className={`mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-extrabold ${BOTON_DORADO}`}
          >
            Ir al árbol de objetivos <ArrowRight className="h-4 w-4" />
          </Link>
        </Tarjeta>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[#54142B] mx-auto max-w-[1180px] px-4 py-6 sm:px-6">
      <header className="mb-5">
        <Link
          href={`/admin/proyectos/${proyectoId}/objetivos`}
          className={`mb-2 inline-flex items-center gap-1.5 text-[12px] font-semibold ${TINTA_SUAVE} hover:text-[#C9A46B]`}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver al árbol de objetivos
        </Link>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className={`text-[19px] font-extrabold uppercase tracking-tight ${TINTA}`}>
            Cadena de valor
          </h1>
          <span className="rounded-full bg-[#3B1727] border border-[#6E4A50] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#C9A46B]">
            Interno
          </span>
        </div>
        <p className={`text-[13px] ${TINTA_TENUE}`}>
          {nombreProyecto}
          {nombreCliente ? ` · ${nombreCliente}` : ''} · qué produce cada objetivo y con qué se mide
        </p>
      </header>

      {objetivoGeneral ? (
        <div className={`mb-4 rounded-xl border ${BORDE} bg-[#3B1727] px-4 py-3`}>
          <Etiqueta>Objetivo general</Etiqueta>
          <p className={`text-[13.5px] leading-snug ${TINTA}`}>{objetivoGeneral}</p>
        </div>
      ) : null}

      {aviso ? (
        <div
          className={`mb-4 rounded-xl border px-4 py-3 text-[13px] font-medium ${
            aviso.ok
              ? 'border-[#7A8B6F]/40 bg-[#7A8B6F]/15 text-[#A9BC9C]'
              : 'border-[#C0604A]/40 bg-[#C0604A]/15 text-[#E0917E]'
          }`}
          role="status"
        >
          {aviso.text}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          {datos.map((fila) => (
            <Tarjeta key={fila.objetivoId} className="p-4 sm:p-5">
              <div className="mb-3 flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[#3B1727] border border-[#6E4A50] text-[12px] font-bold text-[#C9A46B]">
                  {fila.numero}
                </span>
                <div className="min-w-0">
                  <Etiqueta>Objetivo específico</Etiqueta>
                  <p className={`text-[13.5px] leading-snug ${TINTA}`}>{fila.objetivoTexto}</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Etiqueta>Producto · qué entrega este objetivo</Etiqueta>
                  <input
                    value={fila.producto}
                    onChange={(e) => cambiar(fila.objetivoId, { producto: e.target.value })}
                    placeholder="Ej.: Servicio de asistencia técnica entregado"
                    className={CAMPO}
                  />
                </div>
                <div>
                  <Etiqueta>Unidad de medida</Etiqueta>
                  <input
                    value={fila.unidadMedida}
                    onChange={(e) => cambiar(fila.objetivoId, { unidadMedida: e.target.value })}
                    placeholder="Ej.: personas capacitadas"
                    maxLength={100}
                    className={CAMPO}
                  />
                </div>
                <div>
                  <Etiqueta>Meta · cuántas</Etiqueta>
                  <input
                    value={fila.meta}
                    onChange={(e) => cambiar(fila.objetivoId, { meta: e.target.value })}
                    inputMode="decimal"
                    placeholder="Ej.: 300"
                    className={CAMPO}
                  />
                </div>
                <div>
                  <Etiqueta>Responsable</Etiqueta>
                  <input
                    value={fila.responsable}
                    onChange={(e) => cambiar(fila.objetivoId, { responsable: e.target.value })}
                    placeholder="Ej.: Coordinador técnico"
                    maxLength={255}
                    className={CAMPO}
                  />
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Etiqueta>Duración en meses</Etiqueta>
                    <input
                      value={fila.duracionMeses}
                      onChange={(e) => cambiar(fila.objetivoId, { duracionMeses: e.target.value })}
                      inputMode="numeric"
                      placeholder="Ej.: 6"
                      className={CAMPO}
                    />
                  </div>
                  <label className="mb-2 flex cursor-pointer items-center gap-2 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={fila.rutaCritica}
                      onChange={(e) => cambiar(fila.objetivoId, { rutaCritica: e.target.checked })}
                      className="h-4 w-4 rounded border-[#6E4A50] text-[#C9A46B] focus:ring-[#C9A46B]/25"
                    />
                    <span className={`text-[12px] font-semibold ${TINTA_SUAVE}`}>Ruta crítica</span>
                  </label>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[#6E4A50] bg-[#3B1727] p-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${TINTA}`}>
                    Seis actividades · todas en infinitivo
                  </span>
                  {fila.sugerencias.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => traerDelArbol(fila.objetivoId)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C9A46B] hover:underline"
                    >
                      <Sparkles className="h-3 w-3" /> Traer del árbol de objetivos
                    </button>
                  ) : null}
                </div>

                <div className="space-y-2">
                  {fila.actividades.map((actividad, posicion) => {
                    const esFija = posicion >= PRIMERA_FIJA
                    const escrita = actividad.trim().length > 0
                    const malArranque = escrita && !arrancaConInfinitivo(actividad)
                    return (
                      <div key={posicion} className="flex items-start gap-2">
                        <span
                          className={`mt-2 flex h-5 w-5 flex-none items-center justify-center rounded-full text-[10px] font-bold ${
                            esFija ? 'bg-[#54142B] text-[#F3E7DC]/60' : 'bg-[#B08D57]/15 text-[#C9A46B]'
                          }`}
                        >
                          {posicion + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <input
                            value={actividad}
                            onChange={(e) =>
                              cambiarActividad(fila.objetivoId, posicion, e.target.value)
                            }
                            placeholder={
                              esFija
                                ? ACTIVIDADES_FIJAS[posicion - PRIMERA_FIJA]
                                : 'Ej.: Capacitar a los productores en…'
                            }
                            className={CAMPO}
                          />
                          {malArranque ? (
                            <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[#E0B868]">
                              <AlertTriangle className="h-3 w-3" /> No arranca con un verbo en
                              infinitivo
                            </p>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Tarjeta>
          ))}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={alGuardar}
              disabled={guardando}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-extrabold disabled:opacity-70 ${BOTON_DORADO}`}
            >
              {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {guardando ? 'Guardando…' : 'Guardar la cadena de valor'}
            </button>
            <p className={`max-w-md text-[12px] ${TINTA_TENUE}`}>
              Una fila se guarda solo cuando está completa. Si le falta un dato queda pendiente y no
              se inventa nada para rellenarla.
            </p>
          </div>
        </div>

        <aside className="space-y-4">
          <Tarjeta className="p-4">
            <h2 className={`mb-3 text-[13px] font-bold uppercase tracking-wider ${TINTA}`}>
              Revisión de la cadena
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

          <Tarjeta className="p-4">
            <h2 className={`mb-2 text-[13px] font-bold uppercase tracking-wider ${TINTA}`}>
              Cómo se lee
            </h2>
            <p className={`text-[12.5px] leading-snug ${TINTA_SUAVE}`}>
              Cada objetivo específico entrega un producto, el producto se mide con una unidad y una
              meta, y para lograrlo hay seis actividades: cuatro propias del objetivo más
              administrar y supervisar el proyecto.
            </p>
            <Link
              href={`/admin/proyectos/${proyectoId}/presupuesto`}
              className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold text-[#C9A46B] hover:underline"
            >
              Ir al presupuesto <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Tarjeta>
        </aside>
      </div>
    </div>
  )
}
