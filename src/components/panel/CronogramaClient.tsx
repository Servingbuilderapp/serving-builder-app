'use client'

import React from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Minus,
  Save,
} from 'lucide-react'
import { guardarCronograma } from '@/app/(dashboard)/admin/proyectos/[id]/cronograma/actions'

/* ==========================================================================
   Cronograma. Pantalla INTERNA del equipo.

   Una barra por actividad de la cadena de valor. Se pinta sobre los meses
   del proyecto: se hace clic en un mes para estirar o recortar la barra, o
   se escriben los meses a mano.
   ========================================================================== */

export type BarraVista = {
  cadenaValorId: string
  actividadIndice: number
  clave: string
  objetivoNumero: number
  objetivoTexto: string
  /** Meses que la cadena de valor le asignó a este objetivo. */
  duracionObjetivo: number
  rutaCritica: boolean
  actividadNumero: number
  actividadTexto: string
  /** Administrar y supervisar: acompañan todo el proyecto. */
  transversal: boolean
  mesInicio: number
  mesFin: number
  entregable: string
  yaGuardada: boolean
}

type Props = {
  proyectoId: string
  nombreProyecto: string
  nombreCliente: string
  duracionTotalMeses: string
  fechaInicio: string
  notas: string
  barras: BarraVista[]
}

/** Tope duro de meses. Tiene que coincidir con el de actions.ts. */
const MESES_MAXIMO = 60

const SOMBRA = 'shadow-[0_1px_2px_rgba(11,42,74,0.06),0_8px_24px_-14px_rgba(11,42,74,0.20)]'
const TINTA = 'text-[#0B2A4A]'
const TINTA_SUAVE = 'text-[#5B6B84]'
const TINTA_TENUE = 'text-[#7C8CA5]'
const BORDE = 'border-[#E4EAF3]'

const CAMPO =
  'w-full rounded-lg border border-[#E4EAF3] bg-white px-2.5 py-2 text-[13px] leading-snug text-[#0B2A4A] placeholder:text-[#A9B6C8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/25'

/** Un color por objetivo, para que cada bloque se distinga de un vistazo. */
const COLORES = [
  { barra: 'bg-[#2563EB]', suave: 'bg-[#DBE8FB]', texto: 'text-[#1D4ED8]' },
  { barra: 'bg-[#0D9488]', suave: 'bg-[#CCF0EC]', texto: 'text-[#0B7C72]' },
  { barra: 'bg-[#7C3AED]', suave: 'bg-[#E7DDFB]', texto: 'text-[#6D28D9]' },
  { barra: 'bg-[#DB2777]', suave: 'bg-[#FBD9E9]', texto: 'text-[#BE1D66]' },
  { barra: 'bg-[#D97706]', suave: 'bg-[#FBE7C6]', texto: 'text-[#B45309]' },
]

const colorDe = (numero: number) => COLORES[(numero - 1) % COLORES.length]

const entero = (valor: string, porDefecto: number): number => {
  const n = Math.round(Number(String(valor).trim()))
  return Number.isFinite(n) ? n : porDefecto
}

function Tarjeta({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border ${BORDE} bg-white ${SOMBRA} ${className}`}>{children}</div>
}

function Etiqueta({ children }: { children: React.ReactNode }) {
  return (
    <span className={`mb-1 block text-[10px] font-bold uppercase tracking-wider ${TINTA_TENUE}`}>
      {children}
    </span>
  )
}

export function CronogramaClient({
  proyectoId,
  nombreProyecto,
  nombreCliente,
  duracionTotalMeses,
  fechaInicio,
  notas,
  barras,
}: Props) {
  const [duracion, setDuracion] = React.useState(duracionTotalMeses)
  const [inicio, setInicio] = React.useState(fechaInicio)
  const [nota, setNota] = React.useState(notas)
  const [lineas, setLineas] = React.useState<BarraVista[]>(barras)
  const [aviso, setAviso] = React.useState<{ ok: boolean; texto: string } | null>(null)
  const [guardando, empezarGuardado] = React.useTransition()

  const totalMeses = Math.max(1, Math.min(MESES_MAXIMO, entero(duracion, 12)))
  const meses = React.useMemo(
    () => Array.from({ length: totalMeses }, (_, i) => i + 1),
    [totalMeses],
  )

  const cambiarBarra = (clave: string, cambios: Partial<BarraVista>) => {
    setAviso(null)
    setLineas((prev) => prev.map((l) => (l.clave === clave ? { ...l, ...cambios } : l)))
  }

  /**
   * Clic sobre un mes: si cae antes de la barra la estira hacia atrás, si
   * cae después la estira hacia adelante, y si cae dentro deja la barra en
   * ese solo mes. Siempre se puede deshacer volviendo a hacer clic.
   */
  const clicEnMes = (linea: BarraVista, mes: number) => {
    setAviso(null)
    if (mes < linea.mesInicio) {
      cambiarBarra(linea.clave, { mesInicio: mes })
    } else if (mes > linea.mesFin) {
      cambiarBarra(linea.clave, { mesFin: mes })
    } else {
      cambiarBarra(linea.clave, { mesInicio: mes, mesFin: mes })
    }
  }

  const revision = React.useMemo(() => {
    const fueraDeRango = lineas.filter((l) => l.mesFin > totalMeses || l.mesInicio > totalMeses)
    const conEntregable = lineas.filter((l) => l.entregable.trim().length > 0)
    const arrancaEnUno = lineas.some((l) => l.mesInicio === 1)

    const mesesCubiertos = new Set<number>()
    for (const l of lineas) {
      for (let m = Math.max(1, l.mesInicio); m <= Math.min(totalMeses, l.mesFin); m += 1) {
        mesesCubiertos.add(m)
      }
    }

    // La cadena de valor dice cuántos meses dura cada objetivo: el
    // cronograma no debería contradecirla.
    const desajustes: string[] = []
    const porObjetivo = new Map<number, BarraVista[]>()
    for (const l of lineas) {
      porObjetivo.set(l.objetivoNumero, [...(porObjetivo.get(l.objetivoNumero) || []), l])
    }
    for (const [numero, suyas] of porObjetivo) {
      const propias = suyas.filter((s) => !s.transversal)
      if (propias.length === 0) continue
      const desde = Math.min(...propias.map((s) => s.mesInicio))
      const hasta = Math.max(...propias.map((s) => s.mesFin))
      const ocupa = hasta - desde + 1
      const declarado = propias[0].duracionObjetivo
      if (ocupa > declarado) desajustes.push(`objetivo ${numero}`)
    }

    return [
      {
        texto: 'Todas las actividades caben dentro de la duración del proyecto',
        bien: lineas.length > 0 && fueraDeRango.length === 0,
      },
      { texto: 'Alguna actividad arranca en el mes 1', bien: arrancaEnUno },
      {
        texto: `No quedan meses vacíos (${mesesCubiertos.size} de ${totalMeses} con actividad)`,
        bien: totalMeses > 0 && mesesCubiertos.size === totalMeses,
      },
      {
        texto:
          desajustes.length === 0
            ? 'El tiempo coincide con lo que dice la cadena de valor'
            : `El tiempo se pasa de lo declarado en la cadena de valor (${desajustes.join(', ')})`,
        bien: desajustes.length === 0,
      },
      {
        texto: `Cada actividad dice con qué se verifica (${conEntregable.length} de ${lineas.length})`,
        bien: lineas.length > 0 && conEntregable.length === lineas.length,
      },
    ]
  }, [lineas, totalMeses])

  const alGuardar = () => {
    setAviso(null)
    empezarGuardado(async () => {
      const r = await guardarCronograma(
        proyectoId,
        duracion,
        inicio,
        nota,
        lineas.map((l) => ({
          cadenaValorId: l.cadenaValorId,
          actividadIndice: l.actividadIndice,
          mesInicio: l.mesInicio,
          mesFin: l.mesFin,
          entregable: l.entregable,
        })),
      )
      setAviso({ ok: r.ok, texto: r.mensaje })
    })
  }

  /* ---------------------------------------------------------------------- */

  if (lineas.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Tarjeta className="p-8 text-center">
          <h1 className={`text-xl font-extrabold ${TINTA}`}>Todavía no hay actividades</h1>
          <p className={`mt-3 text-[14px] leading-relaxed ${TINTA_SUAVE}`}>
            El cronograma ubica en el tiempo las actividades de la cadena de valor. Primero hay que
            escribirlas allá.
          </p>
          <Link
            href={`/admin/proyectos/${proyectoId}/cadena-valor`}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] px-4 py-2.5 text-[13px] font-bold text-white"
          >
            Ir a la cadena de valor <ArrowRight className="h-4 w-4" />
          </Link>
        </Tarjeta>
      </div>
    )
  }

  const porObjetivo = new Map<number, BarraVista[]>()
  for (const l of lineas) {
    porObjetivo.set(l.objetivoNumero, [...(porObjetivo.get(l.objetivoNumero) || []), l])
  }

  const anchoMes = totalMeses > 18 ? 28 : 36

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6">
      <header className="mb-5">
        <Link
          href={`/admin/proyectos/${proyectoId}/presupuesto`}
          className={`mb-2 inline-flex items-center gap-1.5 text-[12px] font-semibold ${TINTA_SUAVE} hover:text-[#1D4ED8]`}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver al presupuesto
        </Link>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className={`text-[19px] font-extrabold uppercase tracking-tight ${TINTA}`}>
            Cronograma
          </h1>
          <span className="rounded-full bg-[#0B2A4A] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            Interno
          </span>
        </div>
        <p className={`text-[13px] ${TINTA_TENUE}`}>
          {nombreProyecto}
          {nombreCliente ? ` · ${nombreCliente}` : ''} · cada actividad mes a mes
        </p>
      </header>

      {aviso ? (
        <div
          className={`mb-4 rounded-xl border px-4 py-3 text-[13px] font-medium ${
            aviso.ok
              ? 'border-[#9FD9BC] bg-[#DCF3E6] text-[#186A46]'
              : 'border-[#F0AFAF] bg-[#FBE3E3] text-[#9B2C2C]'
          }`}
          role="status"
        >
          {aviso.texto}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-4">
          <Tarjeta className="p-4 sm:p-5">
            <h2 className={`mb-3 text-[13px] font-bold uppercase tracking-wider ${TINTA}`}>
              Duración del proyecto
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Etiqueta>Cuántos meses dura</Etiqueta>
                <input
                  value={duracion}
                  onChange={(e) => {
                    setAviso(null)
                    setDuracion(e.target.value)
                  }}
                  inputMode="numeric"
                  placeholder="12"
                  className={CAMPO}
                />
              </div>
              <div>
                <Etiqueta>Fecha prevista de inicio</Etiqueta>
                <input
                  type="date"
                  value={inicio}
                  onChange={(e) => {
                    setAviso(null)
                    setInicio(e.target.value)
                  }}
                  className={CAMPO}
                />
              </div>
              <div>
                <Etiqueta>Notas del equipo</Etiqueta>
                <input
                  value={nota}
                  onChange={(e) => {
                    setAviso(null)
                    setNota(e.target.value)
                  }}
                  placeholder="Ej.: no se puede ejecutar en diciembre"
                  className={CAMPO}
                />
              </div>
            </div>
          </Tarjeta>

          <Tarjeta className="p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className={`text-[13px] font-bold uppercase tracking-wider ${TINTA}`}>
                Las actividades en el tiempo
              </h2>
              <p className={`text-[12px] ${TINTA_TENUE}`}>
                Haz clic en un mes para estirar la barra; si haces clic dentro, la deja en ese mes.
              </p>
            </div>

            <div className="overflow-x-auto">
              <div style={{ minWidth: 260 + totalMeses * anchoMes }}>
                {/* Encabezado de meses */}
                <div className="flex items-end gap-2 pb-1">
                  <div className="w-[260px] flex-none" />
                  <div className="flex gap-[2px]">
                    {meses.map((m) => (
                      <div
                        key={m}
                        style={{ width: anchoMes - 2 }}
                        className={`text-center text-[10px] font-bold ${TINTA_TENUE}`}
                      >
                        {m}
                      </div>
                    ))}
                  </div>
                </div>

                {[...porObjetivo.entries()].map(([numeroObjetivo, suyas]) => {
                  const color = colorDe(numeroObjetivo)
                  return (
                    <section key={numeroObjetivo} className="mb-4">
                      <div className="mb-1.5 flex items-center gap-2">
                        <span
                          className={`flex h-5 w-5 flex-none items-center justify-center rounded-full ${color.suave} text-[10px] font-bold ${color.texto}`}
                        >
                          {numeroObjetivo}
                        </span>
                        <span className={`truncate text-[12.5px] font-semibold ${TINTA}`}>
                          {suyas[0].objetivoTexto}
                        </span>
                        {suyas[0].rutaCritica ? (
                          <span className="flex-none rounded-full bg-[#FCEFD2] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#8A5307]">
                            Ruta crítica
                          </span>
                        ) : null}
                      </div>

                      <div className="space-y-1">
                        {suyas.map((linea) => (
                          <div key={linea.clave} className="flex items-center gap-2">
                            <div className="flex w-[260px] flex-none items-center gap-1.5">
                              <span
                                className={`flex h-4 w-4 flex-none items-center justify-center rounded-full ${color.suave} text-[9px] font-bold ${color.texto}`}
                              >
                                {linea.actividadNumero}
                              </span>
                              <span
                                className={`min-w-0 flex-1 truncate text-[12px] ${
                                  linea.transversal ? TINTA_TENUE : TINTA_SUAVE
                                }`}
                                title={linea.actividadTexto}
                              >
                                {linea.actividadTexto}
                              </span>
                              <span className={`flex-none text-[10px] font-bold ${TINTA_TENUE}`}>
                                {linea.mesInicio}–{linea.mesFin}
                              </span>
                            </div>

                            <div className="flex gap-[2px]">
                              {meses.map((m) => {
                                const dentro = m >= linea.mesInicio && m <= linea.mesFin
                                return (
                                  <button
                                    key={m}
                                    type="button"
                                    onClick={() => clicEnMes(linea, m)}
                                    title={`Mes ${m}`}
                                    style={{ width: anchoMes - 2 }}
                                    className={`h-5 rounded-[3px] transition ${
                                      dentro
                                        ? `${color.barra} hover:opacity-80`
                                        : 'bg-[#EEF2F8] hover:bg-[#DDE6F3]'
                                    }`}
                                  />
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )
                })}
              </div>
            </div>
          </Tarjeta>

          {/* Entregable de cada actividad */}
          <Tarjeta className="p-4 sm:p-5">
            <h2 className={`mb-1 text-[13px] font-bold uppercase tracking-wider ${TINTA}`}>
              Con qué se verifica cada actividad
            </h2>
            <p className={`mb-3 text-[12px] ${TINTA_TENUE}`}>
              El medio de verificación: el documento, la lista de asistencia o el registro que
              demuestra que la actividad se hizo.
            </p>
            <div className="space-y-2">
              {lineas.map((linea) => (
                <div
                  key={linea.clave}
                  className="grid gap-2 rounded-xl border border-[#EEF2F8] bg-[#FAFCFF] p-2.5 md:grid-cols-2"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full ${
                        colorDe(linea.objetivoNumero).suave
                      } text-[9px] font-bold ${colorDe(linea.objetivoNumero).texto}`}
                    >
                      {linea.objetivoNumero}
                    </span>
                    <span className={`text-[12.5px] leading-snug ${TINTA}`}>
                      {linea.actividadTexto}
                      <span className={`ml-1 text-[11px] font-semibold ${TINTA_TENUE}`}>
                        (mes {linea.mesInicio} a {linea.mesFin})
                      </span>
                    </span>
                  </div>
                  <input
                    value={linea.entregable}
                    onChange={(e) => cambiarBarra(linea.clave, { entregable: e.target.value })}
                    placeholder="Ej.: listas de asistencia y registro fotográfico"
                    className={CAMPO}
                  />
                </div>
              ))}
            </div>
          </Tarjeta>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={alGuardar}
              disabled={guardando}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_6px_16px_-8px_rgba(29,78,216,0.9)] transition hover:-translate-y-px disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {guardando ? 'Guardando…' : 'Guardar el cronograma'}
            </button>
            <p className={`max-w-md text-[12px] ${TINTA_TENUE}`}>
              Si acortas la duración del proyecto, las barras que se salían se recortan al último
              mes al guardar.
            </p>
          </div>
        </div>

        <aside className="space-y-4">
          <Tarjeta className="p-4">
            <h2 className={`mb-3 text-[13px] font-bold uppercase tracking-wider ${TINTA}`}>
              Revisión del cronograma
            </h2>
            <ul className="space-y-2">
              {revision.map((p) => (
                <li key={p.texto} className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full ${
                      p.bien ? 'bg-[#DCF3E6] text-[#186A46]' : 'bg-[#FCEFD2] text-[#8A5307]'
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

          {lineas.some((l) => l.mesFin > totalMeses) ? (
            <Tarjeta className="p-4">
              <p className="flex items-start gap-1.5 text-[12px] font-medium text-[#8A5307]">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none" />
                Hay actividades que terminan después del mes {totalMeses}. Al guardar se recortan.
              </p>
            </Tarjeta>
          ) : null}

          <Tarjeta className="p-4">
            <h2 className={`mb-2 text-[13px] font-bold uppercase tracking-wider ${TINTA}`}>
              Cómo se lee
            </h2>
            <p className={`text-[12.5px] leading-snug ${TINTA_SUAVE}`}>
              Cada barra es una actividad de la cadena de valor. Administrar y supervisar el proyecto
              acompañan todos los meses; las demás se concentran en el tramo de su objetivo.
            </p>
          </Tarjeta>
        </aside>
      </div>
    </div>
  )
}
