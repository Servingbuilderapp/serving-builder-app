'use client'

import React, { useState } from 'react'
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Clock,
  Coins,
  ExternalLink,
  PartyPopper,
  Search,
  XCircle,
} from 'lucide-react'

/* ========================================================================== */
/* Tipos                                                                      */
/* ========================================================================== */

export type EncajeCliente = {
  resumen: string | null
  encajeActual: string | null
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
  encaje: EncajeCliente | null
  /** null = todavía no arrancó ningún trámite de postulación para esta convocatoria. */
  postulacion: PostulacionCliente
}

/* ========================================================================== */
/* Estilo del panel                                                           */
/* ========================================================================== */

const RELIEVE_TARJETA =
  'shadow-[0_1px_2px_rgba(20,5,10,0.28),0_8px_24px_-14px_rgba(20,5,10,0.55)]'

const TINTA = 'text-[#F3E7DC]'
const TINTA_SUAVE = 'text-[#F3E7DC]/70'
const TINTA_TENUE = 'text-[#F3E7DC]/50'
const BORDE = 'border-[#6E4A50]'

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
    fondo: 'bg-[#3B1727]',
    texto: 'text-[#C9A46B]',
    borde: 'border-[#6E4A50]',
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
    fondo: 'bg-[#3B1727]',
    texto: TINTA_TENUE,
    borde: BORDE,
    titulo: 'Se descartó esta convocatoria',
    Icono: XCircle,
  },
}

const SIN_POSTULAR: EstiloPostulacion = {
  fondo: 'bg-[#3B1727]',
  texto: TINTA_TENUE,
  borde: BORDE,
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
  const color = puntaje >= 70 ? '#A9BC9C' : puntaje >= 40 ? '#E0B868' : '#E0917E'
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between">
        <span className={`text-[11px] font-bold uppercase tracking-[0.12em] ${TINTA_TENUE}`}>
          Encaje
        </span>
        <span className="text-[15px] font-extrabold" style={{ color }}>
          {puntaje}
          <span className={`text-[11px] font-bold ${TINTA_TENUE}`}> /100</span>
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
      <h4 className={`text-[11px] font-bold uppercase tracking-[0.12em] ${TINTA_TENUE}`}>{titulo}</h4>
      <p className={`mt-1.5 whitespace-pre-line text-[13px] leading-relaxed ${TINTA_SUAVE}`}>{texto}</p>
    </div>
  )
}

/* ========================================================================== */
/* Tarjeta de una convocatoria                                                */
/* ========================================================================== */

function TarjetaConvocatoria({ convocatoria }: { convocatoria: ConvocatoriaCliente }) {
  const [abierta, setAbierta] = useState(false)
  const encaje = convocatoria.encaje
  const semaforo = estiloSemaforo(encaje?.semaforo || null)
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
    <div className={`rounded-2xl border ${BORDE} bg-[#4C2032] ${RELIEVE_TARJETA}`}>
      <div className="px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className={`text-[15px] font-extrabold leading-snug tracking-tight ${TINTA}`}>
              {convocatoria.nombre}
            </h3>

            <div className={`mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] ${TINTA_SUAVE}`}>
              {convocatoria.entidad ? (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className={`h-3.5 w-3.5 ${TINTA_TENUE}`} />
                  {convocatoria.entidad}
                </span>
              ) : null}
              {convocatoria.fechaCierre ? (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className={`h-3.5 w-3.5 ${TINTA_TENUE}`} />
                  Cierra: {convocatoria.fechaCierre}
                </span>
              ) : null}
              {convocatoria.monto ? (
                <span className="inline-flex items-center gap-1.5">
                  <Coins className={`h-3.5 w-3.5 ${TINTA_TENUE}`} />
                  {convocatoria.monto}
                </span>
              ) : null}
            </div>
          </div>

          {semaforo ? (
            <span
              className={`shrink-0 rounded-full border px-3 py-1 text-[11.5px] font-bold ${semaforo.fondo} ${semaforo.texto} ${semaforo.borde}`}
            >
              {semaforo.nombre}
            </span>
          ) : (
            <span className={`shrink-0 rounded-full border ${BORDE} bg-[#3B1727] px-3 py-1 text-[11.5px] font-bold ${TINTA_TENUE}`}>
              En análisis
            </span>
          )}
        </div>

        <EstadoPostulacionBanner postulacion={convocatoria.postulacion} />

        {typeof encaje?.puntaje === 'number' ? (
          <div className="mt-4 max-w-xs">
            <Barra puntaje={encaje.puntaje} />
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {hayDetalle ? (
            <button
              type="button"
              onClick={() => setAbierta((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-lg border ${BORDE} bg-[#3B1727] px-3 py-1.5 text-[12.5px] font-bold text-[#C9A46B] transition-colors hover:bg-[#4C2032]`}
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
              className={`inline-flex items-center gap-1.5 text-[12.5px] font-bold ${TINTA_SUAVE} underline underline-offset-2 hover:text-[#C9A46B]`}
            >
              Ver la convocatoria <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
      </div>

      {abierta && encaje ? (
        <div className={`space-y-4 border-t ${BORDE} bg-[#3B1727] px-5 py-4`}>
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
              <h4 className={`text-[11px] font-bold uppercase tracking-[0.12em] ${TINTA_TENUE}`}>
                Para preparar la postulación
              </h4>
              <ul className="mt-2 space-y-1.5">
                {encaje.checklist.map((punto, i) => (
                  <li key={i} className={`flex gap-2 text-[13px] leading-relaxed ${TINTA_SUAVE}`}>
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9A46B]" />
                    {punto}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {encaje.documentacionFaltante ? (
            <div className="rounded-xl border border-[#C99A3D]/40 bg-[#C99A3D]/10 px-3.5 py-3">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#E0B868]">
                Documentación que falta
              </h4>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#E0B868]/90">
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

export function ConvocatoriasCliente({ convocatorias }: { convocatorias: ConvocatoriaCliente[] }) {
  const conEncaje = convocatorias.filter((c) => typeof c.encaje?.puntaje === 'number').length

  return (
    <div className="min-h-full bg-[#54142B] px-4 py-6 lg:px-6">
      <header className="mb-5">
        <h1 className={`text-[19px] font-extrabold tracking-tight ${TINTA}`}>
          Mis convocatorias
        </h1>
        <p className={`mt-1 max-w-2xl text-[13.5px] leading-relaxed ${TINTA_SUAVE}`}>
          Las oportunidades de financiación que el equipo encontró para tu proyecto, con qué tan
          bien encaja cada una.
          {conEncaje > 0 ? ` ${conEncaje} ya tienen análisis de encaje.` : ''}
        </p>
      </header>

      <div className="space-y-3">
        {convocatorias.map((c) => (
          <TarjetaConvocatoria key={c.id} convocatoria={c} />
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
        className={`mx-auto max-w-xl rounded-2xl border ${BORDE} bg-[#4C2032] p-8 text-center ${RELIEVE_TARJETA}`}
      >
        <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3B1727] text-[#C9A46B]">
          <Search className="h-5 w-5" />
        </span>
        <h1 className={`text-[17px] font-extrabold ${TINTA}`}>{titulo}</h1>
        <p className={`mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed ${TINTA_SUAVE}`}>{texto}</p>
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
