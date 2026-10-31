'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Clock,
  Coins,
  ExternalLink,
  MapPin,
  PartyPopper,
  Search,
  Users,
  XCircle,
} from 'lucide-react'
import {
  COLOR_NEUTRO,
  COLOR_SECTOR,
  Dato,
  diasParaCierre,
  separarLinea,
} from '@/components/panel/ElegirConvocatorias'
import type { VeredictoElegibilidad } from '@/lib/elegibilidad'
import { BotonQuieroPostular } from '@/components/panel/BotonQuieroPostular'

/* ========================================================================== */
/* Tipos                                                                      */
/* ========================================================================== */

export type EncajeCliente = {
  resumen: string | null
  encajeActual: string | null
  /** Cuánto encaja hoy y cuánto podría encajar tras los ajustes, en %. */
  hoyPct?: number | null
  potencialPct?: number | null
  encajePotencial: string | null
  semaforo: string | null
  puntaje: number | null
  recomendaciones: string | null
  checklist: string[]
  documentacionFaltante: string | null
}

/**
 * Estados que puede tener una postulación, tal como los maneja el Motor 4
 * (tabla `postulaciones`). Se traducen a lenguaje simple para el cliente en
 * `ESTADOS_POSTULACION` más abajo.
 */
export type EstadoPostulacion =
  | 'Preparando'
  | 'Lista para radicar'
  | 'Radicada'
  | 'Adjudicada'
  | 'Rechazada'
  | 'Descartada'

export type PostulacionCliente = {
  estado: EstadoPostulacion
  fechaRadicacion: string | null
  puntaje: number | null
} | null

export type ConvocatoriaCliente = {
  id: string
  nombre: string
  entidad: string | null
  tipo: string | null
  fechaCierre: string | null
  monto: string | null
  fuenteOficial: string | null
  lineaTematica?: string | null
  territorio?: string | null
  beneficiarios?: string | null
  /** ¿Puede postular? null = no hay datos de la biblioteca para decirlo. */
  elegibilidad?: VeredictoElegibilidad | null
  encaje: EncajeCliente | null
  /** null = todavía no arrancó ningún trámite de postulación para esta convocatoria. */
  postulacion: PostulacionCliente
  /** Id en la biblioteca: lo necesita el botón «Quiero postular». */
  bibliotecaId?: string | null
  /** El cliente la dejó «en espera» (ni postula ni descarta todavía). */
  enEspera?: boolean
  /** El cliente ya usó su cupo semanal y pidió permiso para esta. */
  permisoPedido?: boolean
}

/* ========================================================================== */
/* Estilo del panel                                                           */
/* ========================================================================== */

const RELIEVE_TARJETA =
  'shadow-[0_1px_2px_rgba(20,5,10,0.28),0_8px_24px_-14px_rgba(20,5,10,0.55)]'

const SEMAFOROS: Record<string, { fondo: string; texto: string; borde: string; nombre: string }> = {
  verde: {
    fondo: 'bg-[#7A8B6F]/15',
    texto: 'text-[#A9BC9C]',
    borde: 'border-[#7A8B6F]/40',
    nombre: 'Encaja bien',
  },
  amarillo: {
    fondo: 'bg-[#C99A3D]/15',
    texto: 'text-[#E0B868]',
    borde: 'border-[#C99A3D]/40',
    nombre: 'Encaja con ajustes',
  },
  rojo: {
    fondo: 'bg-[#C0604A]/15',
    texto: 'text-[#E0917E]',
    borde: 'border-[#C0604A]/40',
    nombre: 'Encaje difícil',
  },
}

function estiloSemaforo(valor: string | null) {
  const clave = String(valor || '').toLowerCase()
  if (clave.includes('verde')) return SEMAFOROS.verde
  if (clave.includes('amarillo') || clave.includes('naranja')) return SEMAFOROS.amarillo
  if (clave.includes('rojo')) return SEMAFOROS.rojo
  return null
}

/* -------------------------------------------------------------------------- */
/* Estado de la postulación — en palabras simples, no en jerga del sistema    */
/* -------------------------------------------------------------------------- */

type EstiloPostulacion = {
  fondo: string
  texto: string
  borde: string
  titulo: string
  Icono: typeof Clock
}

const ESTADOS_POSTULACION: Record<EstadoPostulacion, EstiloPostulacion> = {
  Preparando: {
    fondo: 'bg-[#B08D57]/15',
    texto: 'text-[#C9A46B]',
    borde: 'border-[#B08D57]/35',
    titulo: 'Se está preparando la postulación',
    Icono: Clock,
  },
  'Lista para radicar': {
    fondo: 'bg-[#C99A3D]/15',
    texto: 'text-[#E0B868]',
    borde: 'border-[#C99A3D]/40',
    titulo: 'Lista para radicar, en revisión final',
    Icono: Clock,
  },
  Radicada: {
    fondo: 'bg-[#7A8B6F]/15',
    texto: 'text-[#A9BC9C]',
    borde: 'border-[#7A8B6F]/40',
    titulo: 'Ya se radicó la postulación',
    Icono: CheckCircle2,
  },
  Adjudicada: {
    fondo: 'bg-[#7A8B6F]/15',
    texto: 'text-[#A9BC9C]',
    borde: 'border-[#7A8B6F]/40',
    titulo: '¡La convocatoria fue adjudicada!',
    Icono: PartyPopper,
  },
  Rechazada: {
    fondo: 'bg-[#C0604A]/15',
    texto: 'text-[#E0917E]',
    borde: 'border-[#C0604A]/40',
    titulo: 'No fue seleccionada esta vez',
    Icono: XCircle,
  },
  Descartada: {
    fondo: 'bg-[#F3E7DC]/10',
    texto: 'text-[#F3E7DC]/60',
    borde: 'border-[#B08D57]/35',
    titulo: 'Se descartó esta convocatoria',
    Icono: XCircle,
  },
}

const SIN_POSTULAR: EstiloPostulacion = {
  fondo: 'bg-[#F3E7DC]/10',
  texto: 'text-[#F3E7DC]/60',
  borde: 'border-[#B08D57]/35',
  titulo: 'Todavía no se ha postulado',
  Icono: Clock,
}

function formatearFecha(valor: string): string {
  try {
    return new Date(valor).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return valor
  }
}

function EstadoPostulacionBanner({ postulacion }: { postulacion: PostulacionCliente }) {
  const estilo = postulacion ? ESTADOS_POSTULACION[postulacion.estado] : SIN_POSTULAR
  const { Icono } = estilo

  return (
    <div
      className={`mt-3 flex items-center gap-2 rounded-xl border px-3.5 py-2.5 ${estilo.fondo} ${estilo.texto} ${estilo.borde}`}
    >
      <Icono className="h-4 w-4 shrink-0" />
      <span className="text-[13px] font-bold leading-snug">
        {estilo.titulo}
        {postulacion?.estado === 'Radicada' && postulacion.fechaRadicacion
          ? ` — el ${formatearFecha(postulacion.fechaRadicacion)}`
          : null}
      </span>
    </div>
  )
}

function Barra({ puntaje }: { puntaje: number }) {
  const color = puntaje >= 70 ? '#7A8B6F' : puntaje >= 40 ? '#C99A3D' : '#C0604A'
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#F3E7DC]/50">
          Calificación general
        </span>
        <span className="text-[15px] font-extrabold" style={{ color }}>
          {puntaje}
          <span className="text-[11px] font-bold text-[#F3E7DC]/50"> /100</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#3B1727]">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${Math.max(0, Math.min(100, puntaje))}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function Parrafo({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div>
      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#F3E7DC]/50">{titulo}</h4>
      <p className="mt-1.5 whitespace-pre-line text-[13px] leading-relaxed text-[#F3E7DC]/85">{texto}</p>
    </div>
  )
}

/* ========================================================================== */
/* Tarjeta de una convocatoria                                                */
/* ========================================================================== */

/* ========================================================================== */
/* "Qué te toca ahora": lo que el cliente debe hacer, con sus botones          */
/* ========================================================================== */

function QueTeToca({ convocatoria }: { convocatoria: ConvocatoriaCliente }) {
  const estado = convocatoria.postulacion?.estado
  const dias = diasParaCierre(convocatoria.fechaCierre)
  const enlace = convocatoria.fuenteOficial

  // Si ya se resolvió (ganó, perdió o la descartó), no hay nada que pedirle.
  if (estado === 'Adjudicada' || estado === 'Rechazada' || estado === 'Descartada') return null

  const caja = 'mt-4 rounded-xl border border-[#C9A46B] bg-[#3B1727] p-4'
  const titulo = 'text-[11px] font-black uppercase tracking-wider text-[#C9A46B]'
  const botonPrincipal =
    'inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-[#C9A46B] to-[#B08D57] px-4 py-2 text-[12.5px] font-bold text-[#3A1420] hover:brightness-110'
  const botonSecundario =
    'inline-flex items-center gap-1.5 rounded-full border border-[#B08D57]/60 px-4 py-2 text-[12.5px] font-bold text-[#F3E7DC] hover:bg-[#4C2032]'

  const frasePlazo =
    dias === null
      ? null
      : dias < 0
        ? 'Esta convocatoria ya cerró.'
        : dias === 0
          ? 'Cierra hoy.'
          : dias <= 7
            ? `Cierra en ${dias} ${dias === 1 ? 'día' : 'días'}: no lo dejes para el final.`
            : `Te quedan ${dias} días para postular.`

  if (estado === 'Radicada') {
    return (
      <div className={caja}>
        <div className={titulo}>Qué te toca ahora</div>
        <p className="mt-1 text-[13px] text-[#F3E7DC]/85">
          Ya postulaste. Ahora toca esperar el resultado: te avisamos aquí apenas haya novedades. No tienes que hacer nada más.
        </p>
      </div>
    )
  }

  if (estado === 'Lista para radicar') {
    return (
      <div className={caja}>
        <div className={titulo}>Qué te toca ahora</div>
        <p className="mt-1 text-[13px] text-[#F3E7DC]/85">
          Tu postulación está lista. Solo falta presentarla en la página oficial de la convocatoria.
          {frasePlazo ? ` ${frasePlazo}` : ''}
        </p>
        {enlace ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={enlace} target="_blank" rel="noreferrer" className={botonPrincipal}>
              Ir a postular <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        ) : null}
      </div>
    )
  }

  // Todavía no se ha postulado: dos pasos claros, cada uno con su botón.
  return (
    <div className={caja}>
      <div className={titulo}>Qué te toca ahora</div>
      <ol className="mt-2 space-y-1.5 text-[13px] text-[#F3E7DC]/85">
        <li>
          <strong>1.</strong> Reúne y envíanos los documentos que pide esta convocatoria.
        </li>
        <li>
          <strong>2.</strong> Preséntate en la página oficial. {frasePlazo || ''}
        </li>
      </ol>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href="/pendientes" className={botonPrincipal}>
          Reunir mis documentos
        </Link>
        {enlace ? (
          <a href={enlace} target="_blank" rel="noreferrer" className={botonSecundario}>
            Ir a la página oficial <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
    </div>
  )
}

function TarjetaConvocatoria({ convocatoria, proyectoId }: { convocatoria: ConvocatoriaCliente; proyectoId?: string }) {
  const [abierta, setAbierta] = useState(false)
  const encaje = convocatoria.encaje
  const semaforo = estiloSemaforo(encaje?.semaforo || null)
  const { sector, recurso } = separarLinea(convocatoria.lineaTematica, convocatoria.tipo)
  const dias = diasParaCierre(convocatoria.fechaCierre)
  const pronto = dias !== null && dias >= 0 && dias <= 30
  const colorSector = (sector && COLOR_SECTOR[sector.toLowerCase()]) || COLOR_NEUTRO
  const hayDetalle = Boolean(
    encaje &&
      (encaje.resumen ||
        encaje.encajeActual ||
        encaje.encajePotencial ||
        encaje.recomendaciones ||
        encaje.checklist.length > 0 ||
        encaje.documentacionFaltante)
  )

  return (
    <div className={`rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] ${RELIEVE_TARJETA}`}>
      <div className="px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {sector ? (
                <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${colorSector}`}>
                  {sector}
                </span>
              ) : null}
              {recurso ? (
                <span className="rounded-full border border-[#C9A46B]/50 bg-[#C9A46B]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#E8C777]">
                  {recurso}
                </span>
              ) : null}
              {pronto ? (
                <span className="rounded-full border border-[#E0917E]/50 bg-[#C0604A]/25 px-2.5 py-0.5 text-[11px] font-bold text-[#F0A898]">
                  Cierra pronto
                </span>
              ) : null}
            </div>

            <h3 className="mt-3 text-[15.5px] font-extrabold leading-snug tracking-tight text-[#F3E7DC]">
              {convocatoria.nombre}
            </h3>

            <div className="mt-3 space-y-2">
              {convocatoria.entidad ? <Dato icono={<Building2 className="h-3.5 w-3.5" />} texto={convocatoria.entidad} /> : null}
              <Dato
                icono={<CalendarClock className="h-3.5 w-3.5" />}
                texto={convocatoria.fechaCierre ? `Cierra: ${convocatoria.fechaCierre}` : 'Convocatoria abierta de forma permanente'}
              />
              {convocatoria.monto ? <Dato icono={<Coins className="h-3.5 w-3.5" />} texto={convocatoria.monto} /> : null}
              {convocatoria.territorio ? <Dato icono={<MapPin className="h-3.5 w-3.5" />} texto={convocatoria.territorio} /> : null}
              {convocatoria.beneficiarios ? <Dato icono={<Users className="h-3.5 w-3.5" />} texto={convocatoria.beneficiarios} /> : null}
            </div>
          </div>

          {semaforo ? (
            <span
              className={`shrink-0 rounded-full border px-3 py-1 text-[11.5px] font-bold ${semaforo.fondo} ${semaforo.texto} ${semaforo.borde}`}
            >
              {semaforo.nombre}
            </span>
          ) : (
            <span className="shrink-0 rounded-full border border-[#B08D57]/35 bg-[#F3E7DC]/10 px-3 py-1 text-[11.5px] font-bold text-[#F3E7DC]/60">
              En análisis
            </span>
          )}
        </div>

        <EstadoPostulacionBanner postulacion={convocatoria.postulacion} />

        {!convocatoria.postulacion && convocatoria.encaje && convocatoria.bibliotecaId && proyectoId ? (
          <BotonQuieroPostular proyectoId={proyectoId} bibliotecaId={convocatoria.bibliotecaId} candidataId={convocatoria.id} enEspera={convocatoria.enEspera} permisoPedido={convocatoria.permisoPedido} />
        ) : null}

        <QueTeToca convocatoria={convocatoria} />

        {typeof encaje?.puntaje === 'number' ? (
          <div className="mt-4 max-w-xs">
            <Barra puntaje={encaje.puntaje} />
            {typeof encaje.hoyPct === 'number' ? (
              <p className="mt-1.5 text-[12px] leading-snug text-[#F3E7DC]/65">
                Hoy tu proyecto encaja al <strong>{encaje.hoyPct} %</strong>
                {typeof encaje.potencialPct === 'number' ? (
                  <>
                    {' '}
                    y, con los ajustes recomendados, podría llegar al <strong>{encaje.potencialPct} %</strong>
                  </>
                ) : null}
                .
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {hayDetalle ? (
            <button
              type="button"
              onClick={() => setAbierta((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#B08D57]/40 bg-[#B08D57]/10 px-3 py-1.5 text-[12.5px] font-bold text-[#C9A46B] transition-colors hover:bg-[#B08D57]/20"
            >
              {abierta ? 'Ocultar el análisis' : 'Ver el análisis'}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${abierta ? 'rotate-180' : ''}`}
              />
            </button>
          ) : null}

          {convocatoria.fuenteOficial ? (
            <a
              href={convocatoria.fuenteOficial}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#F3E7DC]/70 underline underline-offset-2 hover:text-[#C9A46B]"
            >
              Ver la convocatoria <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>

        {convocatoria.elegibilidad ? (
          <div className="mt-3 rounded-lg border border-[#B08D57]/30 bg-[#3B1727] px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#B08D57]">¿Puedes postular?</span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[12px] font-bold ${
                  convocatoria.elegibilidad.estado === 'elegible'
                    ? 'border-[#C9A46B] text-[#C9A46B]'
                    : convocatoria.elegibilidad.estado === 'falta'
                      ? 'border-[#E0917E] text-[#E0917E]'
                      : 'border-[#B08D57]/60 text-[#F3E7DC]/80'
                }`}
              >
                {convocatoria.elegibilidad.etiqueta}
              </span>
            </div>
            <ul className="mt-1.5 space-y-0.5 text-[12.5px] leading-snug text-[#F3E7DC]/70">
              {convocatoria.elegibilidad.razones.map((r) => (
                <li key={r}>• {r}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="mt-3 text-[12.5px] leading-snug text-[#F3E7DC]/65">
          <strong className="text-[#F3E7DC]/85">¿Dónde se postula?</strong>{' '}
          {convocatoria.fuenteOficial
            ? 'Entra a la página oficial y busca la sección «Postular» o «Términos de referencia». Muchas convocatorias piden registrarse antes en la plataforma de la entidad, así que hazlo con tiempo.'
            : 'Todavía no tenemos el enlace oficial de esta convocatoria. Escríbenos y te ayudamos a encontrar dónde se postula.'}
        </p>
      </div>

      {abierta && encaje ? (
        <div className="space-y-4 border-t border-[#B08D57]/35 bg-[#3B1727] px-5 py-4">
          {encaje.resumen ? <Parrafo titulo="De qué se trata" texto={encaje.resumen} /> : null}
          {encaje.encajeActual ? (
            <Parrafo titulo="Cómo estás hoy frente a ella" texto={encaje.encajeActual} />
          ) : null}
          {encaje.encajePotencial ? (
            <Parrafo titulo="Hasta dónde podrías llegar" texto={encaje.encajePotencial} />
          ) : null}
          {encaje.recomendaciones ? (
            <Parrafo titulo="Lo que recomienda el equipo" texto={encaje.recomendaciones} />
          ) : null}

          {encaje.checklist.length > 0 ? (
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#F3E7DC]/50">
                Para preparar la postulación
              </h4>
              <ul className="mt-2 space-y-1.5">
                {encaje.checklist.map((punto, i) => (
                  <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-[#F3E7DC]/85">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9A46B]" />
                    {punto}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {encaje.documentacionFaltante ? (
            <div className="rounded-xl border border-[#C99A3D]/40 bg-[#C99A3D]/12 px-3.5 py-3">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#E0B868]">
                Documentación que falta
              </h4>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#F3E7DC]/85">
                {encaje.documentacionFaltante}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

/* ========================================================================== */
/* Pantalla                                                                   */
/* ========================================================================== */

/** proyectoId solo se pasa cuando quien mira es el cliente (el equipo ve sin botones). */
export function ConvocatoriasCliente({ convocatorias, proyectoId }: { convocatorias: ConvocatoriaCliente[]; proyectoId?: string }) {
  const conEncaje = convocatorias.filter((c) => typeof c.encaje?.puntaje === 'number').length

  return (
    <div className="min-h-full bg-[#54142B] px-4 py-6 lg:px-6">
      <header className="mb-5">
        <h1 className="text-[19px] font-extrabold tracking-tight text-[#F3E7DC]">
          Mis convocatorias
        </h1>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[#F3E7DC]/70">
          Las oportunidades de financiación que el equipo encontró para tu proyecto, con qué tan
          bien encaja cada una.
          {conEncaje > 0 ? ` ${conEncaje} ya tienen análisis de encaje.` : ''}
        </p>
      </header>

      <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
        {convocatorias.map((c) => (
          <TarjetaConvocatoria key={c.id} convocatoria={c} proyectoId={proyectoId} />
        ))}
      </div>
    </div>
  )
}

/* --- estados vacíos ------------------------------------------------------ */

function Aviso({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="min-h-full bg-[#54142B] px-4 py-10 lg:px-6">
      <div
        className={`mx-auto max-w-xl rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-8 text-center ${RELIEVE_TARJETA}`}
      >
        <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#B08D57]/15 text-[#C9A46B]">
          <Search className="h-5 w-5" />
        </span>
        <h1 className="text-[17px] font-extrabold text-[#F3E7DC]">{titulo}</h1>
        <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-[#F3E7DC]/70">{texto}</p>
      </div>
    </div>
  )
}

export function ConvocatoriasSinProyecto() {
  return (
    <Aviso
      titulo="Todavía no hay proyecto"
      texto="Cuando contrates la estructuración y tu proyecto esté armado, aquí van a aparecer las convocatorias que encontremos para él."
    />
  )
}

export function ConvocatoriasEnBusqueda() {
  return (
    <Aviso
      titulo="Todavía no hay convocatorias"
      texto="La búsqueda arranca cuando tu proyecto termina de estructurarse. En cuanto encontremos oportunidades que te sirvan, van a aparecer aquí con su análisis."
    />
  )
}
