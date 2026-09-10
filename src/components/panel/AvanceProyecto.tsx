'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  MessageSquare,
} from 'lucide-react'
import { WHATSAPP_SERVING } from '@/lib/estructuracionMapping'
import { Aviso } from '@/components/ui/Aviso'

/* ========================================================================== */
/* Tipos                                                                      */
/* ========================================================================== */

export type PasoAvance = {
  id: number
  orden: number
  nombre: string
  completado: boolean
  advertencia: string | null
}

export type DatosAvance = {
  proyecto: { id: string; nombre: string; estado: string; modalidad: string | null }
  pasos: PasoAvance[]
  porcentaje: number
}

/* ========================================================================== */
/* Estilo del panel (vino/dorado, igual que el resto del panel del cliente)   */
/* ========================================================================== */

/** Botón de acento dorado, mismo lenguaje visual que GlowButton, para usarlo en un <a>. */
const BOTON_DORADO =
  'bg-gradient-to-b from-[#C39F68] to-[#A8804B] text-[#3A1420] border border-[#8A6636] shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_8px_20px_-10px_rgba(0,0,0,0.5)] hover:from-[#CDAC79] hover:to-[#B08D57]'

function Tarjeta({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`glass-card ${className}`}>{children}</div>
}

/**
 * Las cuatro etapas del acompañamiento. Se agrupan por el orden de los pasos,
 * pero NUNCA se muestra el número de pasos: la metodología puede crecer o
 * reducirse y ningún texto debe quedar desactualizado.
 */
const ETAPAS = [
  { nombre: 'Diagnóstico', desde: 1, hasta: 19, color: '#8C93A6' },
  { nombre: 'Objetivos y solución', desde: 20, hasta: 26, color: '#8C3654' },
  { nombre: 'Ejecución', desde: 27, hasta: 37, color: '#C99A3D' },
  { nombre: 'Cierre', desde: 38, hasta: 42, color: '#7A8B6F' },
] as const

/* ========================================================================== */

export function AvanceProyecto({ datos }: { datos: DatosAvance }) {
  const [pasos, setPasos] = useState<PasoAvance[]>(datos.pasos)
  const [porcentaje, setPorcentaje] = useState<number>(datos.porcentaje)
  const [soloPorReforzar, setSoloPorReforzar] = useState(false)
  const [abiertas, setAbiertas] = useState<string[]>([])

  const proyectoId = datos.proyecto.id

  /* --- se refresca solo mientras el motor trabaja ------------------------ */
  const refrescar = useCallback(async () => {
    const supabase = createClient()

    const [{ data: avance }, { data: contenido }, { data: nuevoPorcentaje }] = await Promise.all([
      supabase
        .from('avance_estructuracion_proyecto')
        .select('paso_id, completado')
        .eq('proyecto_id', proyectoId),
      supabase
        .from('contenido_pasos_proyecto')
        .select('id_paso, advertencia')
        .eq('id_proyecto', proyectoId),
      supabase.rpc('calcular_avance_estructuracion', { id_proyecto: proyectoId }),
    ])

    const mapaAvance = new Map((avance || []).map((a) => [a.paso_id, a.completado]))
    const mapaAdvertencias = new Map((contenido || []).map((c) => [c.id_paso, c.advertencia]))

    setPasos((actuales) =>
      actuales.map((p) => ({
        ...p,
        completado: Boolean(mapaAvance.get(p.id)),
        advertencia: (mapaAdvertencias.get(p.id) as string | null) || null,
      }))
    )
    setPorcentaje(typeof nuevoPorcentaje === 'number' ? nuevoPorcentaje : 0)
  }, [proyectoId])

  useEffect(() => {
    const supabase = createClient()
    const canal = supabase
      .channel(`avance-cliente-${proyectoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'avance_estructuracion_proyecto',
          filter: `proyecto_id=eq.${proyectoId}`,
        },
        () => { void refrescar() }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contenido_pasos_proyecto',
          filter: `id_proyecto=eq.${proyectoId}`,
        },
        () => { void refrescar() }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(canal)
    }
  }, [proyectoId, refrescar])

  /* --- cálculos ---------------------------------------------------------- */
  const etapas = useMemo(
    () =>
      ETAPAS.map((etapa) => {
        const dentro = pasos.filter((p) => p.orden >= etapa.desde && p.orden <= etapa.hasta)
        const hechos = dentro.filter((p) => p.completado).length
        return {
          ...etapa,
          porcentaje: dentro.length ? Math.round((hechos / dentro.length) * 100) : 0,
        }
      }),
    [pasos]
  )

  const pasoActual = useMemo(() => pasos.find((p) => !p.completado) || null, [pasos])
  const porReforzar = useMemo(() => pasos.filter((p) => p.completado && p.advertencia), [pasos])
  const visibles = soloPorReforzar ? porReforzar : pasos

  const radio = 46
  const circunferencia = 2 * Math.PI * radio
  const offset = circunferencia - (porcentaje / 100) * circunferencia

  const renglon = (paso: PasoAvance) => (
    <li
      key={paso.id}
      className={`border-b border-color-base-300/40 px-5 py-3 last:border-b-0 ${
        pasoActual && paso.id === pasoActual.id ? 'bg-color-primary/10' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
            paso.completado ? 'bg-[#7A8B6F]' : 'border-2 border-color-base-300'
          }`}
        >
          {paso.completado ? <Check className="h-3 w-3 text-white" strokeWidth={3.5} /> : null}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-[13.5px] ${
                paso.completado
                  ? 'text-color-base-content'
                  : pasoActual && paso.id === pasoActual.id
                    ? 'font-semibold text-color-primary'
                    : 'text-color-base-content/45'
              }`}
            >
              {paso.nombre}
            </span>
            {pasoActual && paso.id === pasoActual.id ? (
              <span className="shrink-0 rounded-full bg-color-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#3A1420]">
                Aquí vamos
              </span>
            ) : null}
            {paso.completado && paso.advertencia ? (
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[#C99A3D]" />
            ) : null}
          </div>
          {paso.completado && paso.advertencia ? (
            <p className="mt-1 text-[12.5px] leading-relaxed text-[#C99A3D]">{paso.advertencia}</p>
          ) : null}
        </div>
      </div>
    </li>
  )

  const mensajeWhatsapp = encodeURIComponent(
    `Hola Arquitectura Digital, soy cliente del proyecto "${datos.proyecto.nombre}" y quisiera hablar con mi estructurador sobre el avance.`
  )

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* encabezado ------------------------------------------------------- */}
      <header className="space-y-1">
        <h1 className="text-[19px] font-extrabold uppercase tracking-tight text-color-base-content">
          Avance de mi proyecto
        </h1>
        <p className="text-[13px] text-color-base-content/60">
          {datos.proyecto.nombre}
          {datos.proyecto.modalidad ? ` · ${datos.proyecto.modalidad}` : ''}
        </p>
      </header>

      {/* avance general --------------------------------------------------- */}
      <Tarjeta className="p-5 lg:p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative shrink-0">
            <svg viewBox="0 0 120 120" className="h-[112px] w-[112px] -rotate-90">
              <circle cx="60" cy="60" r={radio} fill="none" stroke="#6E4A50" strokeWidth="13" />
              <circle
                cx="60"
                cy="60"
                r={radio}
                fill="none"
                stroke="#B08D57"
                strokeWidth="13"
                strokeLinecap="round"
                strokeDasharray={circunferencia}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[24px] font-extrabold text-color-base-content">{porcentaje}%</span>
            </div>
          </div>

          <div className="flex-1 w-full space-y-2.5">
            {etapas.map((etapa) => (
              <div key={etapa.nombre} className="flex items-center gap-3">
                <span className="w-[150px] shrink-0 text-[12.5px] text-color-base-content/70">{etapa.nombre}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-color-base-300/30">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${etapa.porcentaje}%`, backgroundColor: etapa.color }}
                  />
                </div>
                <span className="w-9 shrink-0 text-right text-[12px] tabular-nums text-color-base-content/45">
                  {etapa.porcentaje}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-color-base-300/40 pt-4">
          <Clock className="h-4 w-4 shrink-0 text-color-primary" />
          <span className="text-[13px] text-color-base-content/70">
            {pasoActual ? (
              <>
                Ahora mismo tu equipo está en{' '}
                <strong className="font-semibold text-color-base-content">{pasoActual.nombre}</strong>
              </>
            ) : (
              <strong className="font-semibold text-[#7A8B6F]">
                Tu proyecto quedó completo. Ya puede entrar a búsqueda de convocatorias.
              </strong>
            )}
          </span>
        </div>
      </Tarjeta>

      {/* aviso de pasos flojos -------------------------------------------- */}
      {porReforzar.length > 0 ? (
        <Aviso
          tipo="alerta"
          titulo={
            porReforzar.length === 1
              ? 'Hay un punto que conviene reforzar'
              : `Hay ${porReforzar.length} puntos que conviene reforzar`
          }
        >
          Tu proyecto está completo y sigue avanzando: esto no detiene nada. Pero en esos puntos la
          información que nos diste todavía queda corta, y en una convocatoria real se nota. Abajo,
          en cada uno, te decimos qué falta.{' '}
          <button
            type="button"
            onClick={() => setSoloPorReforzar(!soloPorReforzar)}
            className="font-semibold underline underline-offset-2"
          >
            {soloPorReforzar ? 'Ver todo el recorrido' : 'Ver solo lo que hay que reforzar'}
          </button>
        </Aviso>
      ) : null}

      {/* recorrido --------------------------------------------------------- */}
      <Tarjeta className="overflow-hidden">
        <div className="border-b border-color-base-300/40 px-5 py-4">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-color-base-content">
            {soloPorReforzar ? 'Puntos por reforzar' : 'El recorrido de tu proyecto'}
          </h2>
        </div>

        {visibles.length === 0 ? (
          <p className="px-5 py-8 text-center text-[13px] text-color-base-content/60">
            Todavía no hay nada que mostrar aquí.
          </p>
        ) : soloPorReforzar ? (
          <ul>{visibles.map((paso) => renglon(paso))}</ul>
        ) : (
          ETAPAS.map((etapa) => {
            const dentro = visibles.filter((p) => p.orden >= etapa.desde && p.orden <= etapa.hasta)
            if (dentro.length === 0) return null

            const tieneElActual = Boolean(
              pasoActual && pasoActual.orden >= etapa.desde && pasoActual.orden <= etapa.hasta
            )
            const tocada = abiertas.includes(etapa.nombre)
            // Por defecto solo se despliega la etapa en la que va el equipo:
            // así no se ve una lista larguísima de renglones seguidos.
            const abierta = tocada ? !tieneElActual : tieneElActual
            const hechos = dentro.filter((p) => p.completado).length
            const terminada = hechos === dentro.length

            return (
              <div key={etapa.nombre}>
                <button
                  type="button"
                  onClick={() =>
                    setAbiertas((actuales) =>
                      actuales.includes(etapa.nombre)
                        ? actuales.filter((n) => n !== etapa.nombre)
                        : [...actuales, etapa.nombre]
                    )
                  }
                  className="flex w-full items-center gap-2 border-b border-color-base-300/40 bg-color-base-200/40 px-5 py-3 text-left hover:bg-color-primary/10"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: etapa.color }} />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-color-base-content/70">
                    {etapa.nombre}
                  </span>
                  <span
                    className={`ml-auto shrink-0 text-[11.5px] font-semibold ${
                      terminada ? 'text-[#7A8B6F]' : tieneElActual ? 'text-color-primary' : 'text-color-base-content/45'
                    }`}
                  >
                    {terminada ? 'Lista' : tieneElActual ? 'En curso' : 'Pendiente'}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-color-base-content/45 transition-transform ${
                      abierta ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {abierta ? <ul>{dentro.map((paso) => renglon(paso))}</ul> : null}
              </div>
            )
          })
        )}
      </Tarjeta>

      {/* ayuda ------------------------------------------------------------- */}
      <Tarjeta className="flex flex-col items-start justify-between gap-3 p-5 sm:flex-row sm:items-center">
        <p className="text-[13px] text-color-base-content/70">
          ¿Tienes dudas o quieres actualizar información de tu proyecto?
        </p>
        <a
          href={`https://wa.me/${WHATSAPP_SERVING}?text=${mensajeWhatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-5 text-[13px] font-semibold ${BOTON_DORADO}`}
        >
          <MessageSquare className="h-4 w-4" />
          Hablar con mi estructurador
        </a>
      </Tarjeta>
    </div>
  )
}

/* ========================================================================== */
/* Estados en los que todavía no hay avance que mostrar                       */
/* ========================================================================== */

export function AvanceSinProyecto() {
  return (
    <div className="p-6 lg:p-8">
      <Tarjeta className="mx-auto max-w-xl p-10 text-center">
        <h1 className="text-xl font-extrabold text-color-base-content">Todavía no tienes un proyecto activo</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-color-base-content/70">
          Cuando contrates tu estructuración, aquí vas a ver el recorrido completo de tu proyecto y
          en qué punto va tu equipo, actualizado en vivo.
        </p>
        <Link
          href="/estructuracion"
          className={`mt-6 inline-flex h-11 items-center gap-2 rounded-lg px-6 text-sm font-semibold ${BOTON_DORADO}`}
        >
          Ver las modalidades <ArrowRight className="h-4 w-4" />
        </Link>
      </Tarjeta>
    </div>
  )
}

export function AvancePendienteDePago({ nombreProyecto }: { nombreProyecto: string }) {
  const mensaje = encodeURIComponent(
    `Hola Arquitectura Digital, ya envié el comprobante de pago del proyecto "${nombreProyecto}" y quisiera confirmar la activación.`
  )

  return (
    <div className="p-6 lg:p-8">
      <Tarjeta className="mx-auto max-w-xl p-10 text-center">
        <h1 className="text-xl font-extrabold text-color-base-content">Estamos confirmando tu pago</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-color-base-content/70">
          Tu proyecto <strong className="text-color-base-content">{nombreProyecto}</strong> ya quedó
          registrado. En cuanto confirmemos el pago, tu equipo arranca la estructuración y este
          recorrido empieza a llenarse solo.
        </p>
        <a
          href={`https://wa.me/${WHATSAPP_SERVING}?text=${mensaje}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-6 inline-flex h-11 items-center gap-2 rounded-lg px-6 text-sm font-semibold ${BOTON_DORADO}`}
        >
          <MessageSquare className="h-4 w-4" />
          Enviar mi comprobante
        </a>
      </Tarjeta>
    </div>
  )
}
