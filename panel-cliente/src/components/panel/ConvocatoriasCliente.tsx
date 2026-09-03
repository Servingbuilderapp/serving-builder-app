'use client'

import React, { useState } from 'react'
import { Building2, CalendarClock, ChevronDown, Coins, ExternalLink, Search } from 'lucide-react'

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

export type ConvocatoriaCliente = {
  id: string
  nombre: string
  entidad: string | null
  tipo: string | null
  fechaCierre: string | null
  monto: string | null
  fuenteOficial: string | null
  encaje: EncajeCliente | null
}

/* ========================================================================== */
/* Estilo del panel                                                           */
/* ========================================================================== */

const SOMBRA_TARJETA =
  'shadow-[0_1px_2px_rgba(11,42,74,0.06),0_8px_24px_-14px_rgba(11,42,74,0.20)]'

const SEMAFOROS: Record<string, { fondo: string; texto: string; borde: string; nombre: string }> = {
  verde: {
    fondo: 'bg-[#E8F6F0]',
    texto: 'text-[#186A46]',
    borde: 'border-[#B9E3D0]',
    nombre: 'Encaja bien',
  },
  amarillo: {
    fondo: 'bg-[#FEF3C7]',
    texto: 'text-[#8A5307]',
    borde: 'border-[#FADFA2]',
    nombre: 'Encaja con ajustes',
  },
  rojo: {
    fondo: 'bg-[#FDECEA]',
    texto: 'text-[#B42318]',
    borde: 'border-[#F6C9C4]',
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

function Barra({ puntaje }: { puntaje: number }) {
  const color = puntaje >= 70 ? '#186A46' : puntaje >= 40 ? '#B07A16' : '#B42318'
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
          Encaje
        </span>
        <span className="text-[15px] font-extrabold" style={{ color }}>
          {puntaje}
          <span className="text-[11px] font-bold text-[#94A3B8]"> /100</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#EEF2F8]">
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
      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">{titulo}</h4>
      <p className="mt-1.5 whitespace-pre-line text-[13px] leading-relaxed text-[#334155]">{texto}</p>
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
    <div className={`rounded-2xl border border-[#E4EAF3] bg-white ${SOMBRA_TARJETA}`}>
      <div className="px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-extrabold leading-snug tracking-tight text-[#0B2A4A]">
              {convocatoria.nombre}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-[#5B6B84]">
              {convocatoria.entidad ? (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-[#94A3B8]" />
                  {convocatoria.entidad}
                </span>
              ) : null}
              {convocatoria.fechaCierre ? (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5 text-[#94A3B8]" />
                  Cierra: {convocatoria.fechaCierre}
                </span>
              ) : null}
              {convocatoria.monto ? (
                <span className="inline-flex items-center gap-1.5">
                  <Coins className="h-3.5 w-3.5 text-[#94A3B8]" />
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
            <span className="shrink-0 rounded-full border border-[#E4EAF3] bg-[#F8FAFD] px-3 py-1 text-[11.5px] font-bold text-[#7C8CA5]">
              En análisis
            </span>
          )}
        </div>

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
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE4F0] bg-[#F8FAFD] px-3 py-1.5 text-[12.5px] font-bold text-[#1D4ED8] transition-colors hover:bg-[#EFF6FF]"
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
              className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#5B6B84] underline underline-offset-2 hover:text-[#1D4ED8]"
            >
              Ver la convocatoria <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
      </div>

      {abierta && encaje ? (
        <div className="space-y-4 border-t border-[#EEF2F8] bg-[#FBFDFF] px-5 py-4">
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
              <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Para preparar la postulación
              </h4>
              <ul className="mt-2 space-y-1.5">
                {encaje.checklist.map((punto, i) => (
                  <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-[#334155]">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#1D4ED8]" />
                    {punto}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {encaje.documentacionFaltante ? (
            <div className="rounded-xl border border-[#FDE6C8] bg-[#FFFBF3] px-3.5 py-3">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#8A5307]">
                Documentación que falta
              </h4>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#5B4327]">
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
    <div className="px-4 py-6 lg:px-6">
      <header className="mb-5">
        <h1 className="text-[19px] font-extrabold tracking-tight text-[#0B2A4A]">
          Mis convocatorias
        </h1>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[#5B6B84]">
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
    <div className="px-4 py-10 lg:px-6">
      <div
        className={`mx-auto max-w-xl rounded-2xl border border-[#E4EAF3] bg-white p-8 text-center ${SOMBRA_TARJETA}`}
      >
        <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#1D4ED8]">
          <Search className="h-5 w-5" />
        </span>
        <h1 className="text-[17px] font-extrabold text-[#0B2A4A]">{titulo}</h1>
        <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-[#5B6B84]">{texto}</p>
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
