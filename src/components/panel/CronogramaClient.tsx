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
const BORDE = 'border-[#B08D57]/35'

const CAMPO =
  'w-full rounded-lg border border-[#B08D57]/35 bg-[#3B1727] px-2.5 py-2 text-[13px] leading-snug text-[#F3E7DC] placeholder:text-[#F3E7DC]/40 focus:outline-none focus:ring-2 focus:ring-[#C9A46B]/25'

/** Un color por objetivo, para que cada bloque se distinga de un vistazo. */
const COLORES = [
  { barra: 'bg-[#C9A46B]', suave: 'bg-[#C9A46B]/15', texto: 'text-[#E0C48A]' },
  { barra: 'bg-[#7A8B6F]', suave: 'bg-[#7A8B6F]/15', texto: 'text-[#A9BC9C]' },
  { barra: 'bg-[#C0604A]', suave: 'bg-[#C0604A]/15', texto: 'text-[#E0917E]' },
  { barra: 'bg-[#5C7A99]', suave: 'bg-[#5C7A99]/15', texto: 'text-[#9DB8CE]' },
  { barra: 'bg-[#8B6F8B]', suave: 'bg-[#8B6F8B]/15', texto: 'text-[#C4A8C4]' },
]

const colorDe = (numero: number) => COLORES[(numero - 1) % COLORES.length]

const entero = (valor: string, porDefecto: number): number => {
  const n = Math.round(Number(String(valor).trim()))
  return Number.isFinite(n) ? n : porDefecto
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
      <div className="min-h-full bg-[#54142B] mx-auto max-w-2xl px-4 py-16">
        <Tarjeta className="p-8 text-center">
          <h1 className={`text-xl font-extrabold ${TINTA}`}>Todavía no hay actividades</h1>
          <p className={`mt-3 text-[14px] leading-relaxed ${TINTA_SUAVE}`}>
            El cronograma ubica en el tiempo las actividades de la cadena de valor. Primero hay que
            escribirlas allá.
          </p>
          <Link
            href={`/admin/proyectos/${proyectoId}/cadena-valor`}
            className={`mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-extrabold ${BOTON_DORADO}`}
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
    <div className="min-h-full bg-[#54142B] mx-auto max-w-[1180px] px-4 py-6 sm:px-6">
      <header className="mb-5">
        <Link
          href={`/admin/proyectos/${proyectoId}/presupuesto`}
          className={`mb-2 inline-flex items-center gap-1.5 text-[12px] font-semibold ${TINTA_SUAVE} hover:text-[#C9A46B]`}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver al presupuesto
        </Link>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className={`text-[19px] font-extrabold uppercase tracking-tight ${TINTA}`}>
            Cronograma
          </h1>
          <span className="rounded-full bg-[#3B1727] border border-[#B08D57]/35 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#C9A46B]">
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
              ? 'border-[#7A8B6F]/40 bg-[#7A8B6F]/15 text-[#A9BC9C]'
              : 'border-[#C0604A]/40 bg-[#C0604A]/15 text-[#E0917E]'
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
                          <span className="flex-none rounded-full bg-[#C99A3D]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#E0B868]">
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
                                        : 'bg-[#3B1727] hover:bg-[#54142B]'
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
                  className="grid gap-2 rounded-xl border border-[#B08D57]/35 bg-[#3B1727] p-2.5 md:grid-cols-2"
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
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-extrabold disabled:opacity-70 ${BOTON_DORADO}`}
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

          {lineas.some((l) => l.mesFin > totalMeses) ? (
            <Tarjeta className="p-4">
              <p className="flex items-start gap-1.5 text-[12px] font-medium text-[#E0B868]">
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
