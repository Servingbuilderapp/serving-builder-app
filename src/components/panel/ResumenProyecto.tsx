'use client'

import React from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  AlertCircle,
  AlertTriangle,
  Info,
  Check,
  CheckCircle2,
  Circle,
  Sparkles,
  Wallet,
  FileCheck2,
  Wand2,
  Send,
} from 'lucide-react'

/* ========================================================================== */
/* Tipos de los datos que arma el servidor                                    */
/* ========================================================================== */

export type EstadoSemaforo = 'verde' | 'amarillo' | 'rojo' | 'gris'
export type EstadoEtapa = 'completado' | 'en_proceso' | 'pendiente' | 'bloqueado'

export type DatosResumen = {
  proyecto: { id: string; nombre: string; estado: string } | null
  progresoGeneral: number
  pasos: { total: number; completados: number }
  pasoActual: { orden: number; nombre: string } | null
  convocatoria: {
    nombre: string
    entidad: string | null
    fechaCierre: string | null
    diasRestantes: number | null
  } | null
  documentos: { completos: number; total: number } | null
  encaje: { actual: number; potencial: number | null } | null
  proximoPaso: { titulo: string; detalle: string } | null
  semaforos: { etiqueta: string; estado: EstadoSemaforo }[]
  ruta: { nombre: string; estado: EstadoEtapa }[]
  recomendacionIA: string | null
  progresoAreas: { nombre: string; valor: number }[]
  ejesRueda: { nombre: string; puntaje: number }[]
  convocatoriasTop: {
    nombre: string
    entidad: string | null
    afinidad: number | null
    cierre: string | null
    dias: number | null
    estado: string
    semaforos: EstadoSemaforo[]
  }[]
  alertas: { tipo: 'critica' | 'atencion' | 'info'; titulo: string; detalle: string; fecha?: string }[]
  actividades: { texto: string; cuando: string }[]
  pendientes: { texto: string; prioridad: 'alta' | 'media'; fecha?: string }[]
}

/* ========================================================================== */
/* Piezas reutilizables                                                       */
/* ========================================================================== */

const SOMBRA_TARJETA =
  'shadow-[0_1px_2px_rgba(11,42,74,0.06),0_8px_24px_-14px_rgba(11,42,74,0.20)]'

function Tarjeta({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-2xl border border-[#E4EAF3] bg-white ${SOMBRA_TARJETA} ${className}`}>
      {children}
    </div>
  )
}

function TituloBloque({ texto, enlace }: { texto: string; enlace?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#0B2A4A]">{texto}</h2>
      {enlace ? (
        <span className="text-[12px] font-semibold text-[#1D4ED8] inline-flex items-center gap-1 opacity-60">
          {enlace} <ArrowRight className="h-3 w-3" />
        </span>
      ) : null}
    </div>
  )
}

function colorSemaforo(estado: EstadoSemaforo) {
  return {
    verde: 'bg-emerald-500',
    amarillo: 'bg-amber-400',
    rojo: 'bg-rose-500',
    gris: 'bg-slate-300',
  }[estado]
}

function textoSemaforo(estado: EstadoSemaforo) {
  return { verde: 'VERDE', amarillo: 'AMARILLO', rojo: 'ROJO', gris: 'SIN DATO' }[estado]
}

function claseTextoSemaforo(estado: EstadoSemaforo) {
  return {
    verde: 'text-emerald-600',
    amarillo: 'text-amber-600',
    rojo: 'text-rose-600',
    gris: 'text-slate-400',
  }[estado]
}

/** Círculo de progreso */
function Anillo({ valor }: { valor: number }) {
  const radio = 34
  const circunferencia = 2 * Math.PI * radio
  const avance = Math.max(0, Math.min(100, valor))
  return (
    <div className="relative h-[70px] w-[70px] shrink-0">
      <svg viewBox="0 0 80 80" className="h-[70px] w-[70px] -rotate-90">
        <circle cx="40" cy="40" r={radio} fill="none" stroke="#E8EEF7" strokeWidth="8" />
        <circle
          cx="40"
          cy="40"
          r={radio}
          fill="none"
          stroke="url(#degradadoAnillo)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(circunferencia * avance) / 100} ${circunferencia}`}
        />
        <defs>
          <linearGradient id="degradadoAnillo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[17px] font-extrabold text-[#0B2A4A]">{avance}%</span>
      </div>
    </div>
  )
}

/** Rueda de diagnóstico compacta */
export function escalaRueda(ejes: { puntaje: number }[]): number {
  return ejes.some((e) => e.puntaje > 10) ? 100 : 10
}

function Rueda({ ejes }: { ejes: { nombre: string; puntaje: number }[] }) {
  if (ejes.length < 3) return null
  const cx = 170
  const cy = 128
  const radioMax = 74
  // Los motores guardan el puntaje unas veces de 1 a 10 y otras de 1 a 100.
  // Se deduce de los datos para que la telaraña no salga siempre al tope.
  const tope = escalaRueda(ejes)
  const puntos = ejes.map((eje, i) => {
    const angulo = (Math.PI * 2 * i) / ejes.length - Math.PI / 2
    const r = (Math.max(0, Math.min(tope, eje.puntaje)) / tope) * radioMax
    return {
      x: cx + Math.cos(angulo) * r,
      y: cy + Math.sin(angulo) * r,
      ex: cx + Math.cos(angulo) * radioMax,
      ey: cy + Math.sin(angulo) * radioMax,
      lx: cx + Math.cos(angulo) * (radioMax + 30),
      ly: cy + Math.sin(angulo) * (radioMax + 30),
      ...eje,
    }
  })
  const poligono = puntos.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <svg viewBox="0 0 340 256" className="w-full mx-auto">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <circle
          key={f}
          cx={cx}
          cy={cy}
          r={radioMax * f}
          fill="none"
          stroke="#E4EAF3"
          strokeWidth="1"
        />
      ))}
      {puntos.map((p) => (
        <line key={`r-${p.nombre}`} x1={cx} y1={cy} x2={p.ex} y2={p.ey} stroke="#E4EAF3" strokeWidth="1" />
      ))}
      <polygon points={poligono} fill="#1D4ED8" fillOpacity="0.18" stroke="#1D4ED8" strokeWidth="2" />
      {puntos.map((p) => (
        <circle key={`p-${p.nombre}`} cx={p.x} cy={p.y} r="3.5" fill="#1D4ED8" />
      ))}
      {puntos.map((p) => (
        <text
          key={`t-${p.nombre}`}
          x={p.lx}
          y={p.ly}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-[#475569]"
          style={{ fontSize: 8.5, fontWeight: 600 }}
        >
          <tspan x={p.lx} dy="-4">
            {p.nombre}
          </tspan>
          <tspan x={p.lx} dy="11" className="fill-[#0B2A4A]" style={{ fontWeight: 800 }}>
            {tope === 100 ? Math.round(p.puntaje) : p.puntaje.toFixed(1)}
          </tspan>
        </text>
      ))}
    </svg>
  )
}

const MESES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre',
]

/**
 * Fechas en lenguaje humano: "15 de octubre de 2026" en vez de "2026-10-15".
 * Si el texto no es una fecha reconocible se devuelve tal cual.
 */
function fechaBonita(valor: string | null): string | null {
  if (!valor) return null
  const partes = valor.slice(0, 10).split('-')
  if (partes.length !== 3) return valor
  const anio = Number(partes[0])
  const mes = Number(partes[1])
  const dia = Number(partes[2])
  if (!anio || !mes || !dia || mes < 1 || mes > 12) return valor
  return `${dia} de ${MESES[mes - 1]} de ${anio}`
}

function Vacio({ texto }: { texto: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[#DCE4F0] bg-[#F8FAFD] px-4 py-6 text-center text-[12.5px] text-[#7C8CA5]">
      {texto}
    </div>
  )
}

/* ========================================================================== */

export function ResumenProyecto({ datos }: { datos: DatosResumen }) {
  const {
    proyecto,
    progresoGeneral,
    pasoActual,
    convocatoria,
    documentos,
    encaje,
    proximoPaso,
    semaforos,
    ruta,
    recomendacionIA,
    progresoAreas,
    ejesRueda,
    convocatoriasTop,
    alertas,
    actividades,
    pendientes,
  } = datos

  if (!proyecto) {
    return (
      <div className="p-6 lg:p-8">
        <Tarjeta className="p-10 text-center max-w-xl mx-auto">
          <h1 className="text-xl font-extrabold text-[#0B2A4A]">Todavía no tienes un proyecto activo</h1>
          <p className="mt-3 text-[14px] text-[#5B6B84] leading-relaxed">
            Cuando contrates una modalidad de estructuración, aquí verás el centro de control de tu
            proyecto: avance, convocatorias, encaje y el siguiente paso a dar.
          </p>
          <Link
            href="/contratar"
            className="mt-6 inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-gradient-to-b from-[#143E77] to-[#0C2E5C] text-white text-sm font-semibold"
          >
            Ver las modalidades <ArrowRight className="h-4 w-4" />
          </Link>
        </Tarjeta>
      </div>
    )
  }

  const etiquetaProgreso =
    progresoGeneral >= 90 ? 'Excelente avance' : progresoGeneral >= 60 ? 'Buen avance' : 'En marcha'

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div>
        <h1 className="text-[19px] font-extrabold uppercase tracking-tight text-[#0B2A4A]">
          Resumen del proyecto
        </h1>
        <p className="text-[13px] text-[#7C8CA5]">Visión general del estado actual</p>
      </div>

      {/* ============ TARJETAS SUPERIORES ============ */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Tarjeta className="p-4 sm:col-span-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-3">
            Progreso general
          </div>
          <div className="flex items-center gap-3">
            <Anillo valor={progresoGeneral} />
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-[#0B2A4A]">{etiquetaProgreso}</div>
              <div className="text-[12px] text-[#7C8CA5] leading-snug">
                del recorrido de tu proyecto ya está listo
              </div>
            </div>
          </div>
        </Tarjeta>

        <Tarjeta className="p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
            Etapa actual
          </div>
          <div className="text-[15px] font-extrabold text-[#0B2A4A] leading-snug">
            {pasoActual ? 'Estructuración' : 'Sin iniciar'}
          </div>
          {pasoActual ? (
            <>
              <div className="text-[12px] text-[#7C8CA5] mt-1">Trabajando ahora en</div>
              <div className="text-[12.5px] font-semibold text-[#0B2A4A] mt-1 line-clamp-2">
                {pasoActual.nombre}
              </div>
            </>
          ) : (
            <div className="text-[12px] text-[#7C8CA5] mt-1">Aún no comienza la estructuración</div>
          )}
        </Tarjeta>

        <Tarjeta className="p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
            Convocatoria activa
          </div>
          {convocatoria ? (
            <>
              <div className="text-[13.5px] font-extrabold text-[#0B2A4A] leading-snug line-clamp-2">
                {convocatoria.nombre}
              </div>
              {convocatoria.fechaCierre ? (
                <div className="text-[12px] text-[#7C8CA5] mt-1">
                  Cierra el {fechaBonita(convocatoria.fechaCierre)}
                </div>
              ) : null}
              {convocatoria.diasRestantes !== null ? (
                <div
                  className={`text-[12.5px] font-bold mt-1 ${
                    convocatoria.diasRestantes <= 15 ? 'text-amber-600' : 'text-[#0B2A4A]'
                  }`}
                >
                  {convocatoria.diasRestantes} días restantes
                </div>
              ) : null}
            </>
          ) : (
            <div className="text-[12.5px] text-[#7C8CA5]">Todavía no hay una seleccionada</div>
          )}
        </Tarjeta>

        <Tarjeta className="p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
            Documentos
          </div>
          {documentos ? (
            <>
              <div className="text-[22px] font-extrabold text-[#0B2A4A] leading-none">
                {documentos.completos} / {documentos.total}
              </div>
              <div className="text-[12px] text-[#7C8CA5] mt-1.5">Documentos listos</div>
              {documentos.total - documentos.completos > 0 ? (
                <div className="text-[12.5px] font-bold text-amber-600 mt-0.5">
                  {documentos.total - documentos.completos} pendientes
                </div>
              ) : null}
            </>
          ) : (
            <div className="text-[12.5px] text-[#7C8CA5]">Se define al elegir convocatoria</div>
          )}
        </Tarjeta>

        <Tarjeta className="p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
            Encaje actual
          </div>
          {encaje ? (
            <>
              <div className="text-[24px] font-extrabold text-emerald-600 leading-none">
                {encaje.actual}%
              </div>
              <div className="text-[12px] text-[#7C8CA5] mt-1.5">Encaje con convocatoria</div>
              {encaje.potencial !== null ? (
                <div className="text-[12.5px] text-[#0B2A4A] mt-0.5">
                  Potencial <span className="font-bold">{encaje.potencial}%</span>
                </div>
              ) : null}
            </>
          ) : (
            <div className="text-[12.5px] text-[#7C8CA5]">Se calcula tras elegir convocatoria</div>
          )}
        </Tarjeta>

        <Tarjeta className="p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
            Próximo paso
          </div>
          {proximoPaso ? (
            <>
              <div className="text-[14px] font-extrabold text-[#0B2A4A] leading-snug">
                {proximoPaso.titulo}
              </div>
              <div className="text-[12px] text-[#7C8CA5] mt-1 line-clamp-3">{proximoPaso.detalle}</div>
            </>
          ) : (
            <div className="text-[12.5px] text-[#7C8CA5]">Sin acciones pendientes</div>
          )}
        </Tarjeta>

        <Tarjeta className="p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-3">
            Semáforos principales
          </div>
          <div className="space-y-1.5">
            {semaforos.map((s) => (
              <div key={s.etiqueta} className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${colorSemaforo(s.estado)}`} />
                <span className="text-[12.5px] text-[#475569]">{s.etiqueta}</span>
                <span className={`ml-auto text-[10px] font-bold ${claseTextoSemaforo(s.estado)}`}>
                  {textoSemaforo(s.estado)}
                </span>
              </div>
            ))}
          </div>
        </Tarjeta>
      </div>

      {/* ============ CUERPO ============ */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-5">
          {/* Ruta del proyecto */}
          <Tarjeta className="p-5">
            <TituloBloque texto="Ruta del proyecto" enlace="Ver mapa completo" />
            <div className="relative overflow-x-auto">
              <div className="flex items-start justify-between gap-1 min-w-[640px]">
                {ruta.map((etapa, i) => {
                  const completado = etapa.estado === 'completado'
                  const enProceso = etapa.estado === 'en_proceso'
                  return (
                    <React.Fragment key={etapa.nombre}>
                      <div className="flex flex-col items-center gap-2 shrink-0 w-[74px]">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center text-[12px] font-bold ${
                            completado
                              ? 'bg-emerald-500 text-white'
                              : enProceso
                                ? 'bg-[#1D4ED8] text-white ring-4 ring-[#1D4ED8]/15'
                                : 'bg-[#E8EEF7] text-[#94A3B8]'
                          }`}
                        >
                          {completado ? <Check className="h-4 w-4" /> : i + 1}
                        </div>
                        <div
                          className={`text-[11px] text-center leading-tight ${
                            enProceso ? 'font-bold text-[#0B2A4A]' : 'text-[#7C8CA5]'
                          }`}
                        >
                          {etapa.nombre}
                        </div>
                      </div>
                      {i < ruta.length - 1 ? (
                        <div
                          className={`h-0.5 flex-1 mt-4 rounded ${
                            completado ? 'bg-emerald-400' : 'bg-[#E8EEF7]'
                          }`}
                        />
                      ) : null}
                    </React.Fragment>
                  )
                })}
              </div>
            </div>
          </Tarjeta>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Recomendación de IA */}
            <Tarjeta className="p-5">
              <TituloBloque texto="Recomendación" />
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#1D4ED8] to-[#7C3AED] flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <p className="text-[13px] text-[#475569] leading-relaxed">
                  {recomendacionIA || 'Cuando avance la estructuración aparecerán aquí las recomendaciones.'}
                </p>
              </div>
              {proximoPaso ? (
                <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#CBD5E1] bg-white px-4 py-2 text-[12.5px] font-semibold text-[#0B2A4A]">
                  {proximoPaso.titulo} <ArrowRight className="h-3.5 w-3.5" />
                </div>
              ) : null}
            </Tarjeta>

            {/* Progreso por áreas */}
            <Tarjeta className="p-5">
              <TituloBloque texto="Progreso por áreas" />
              <div className="space-y-2.5">
                {progresoAreas.map((area) => (
                  <div key={area.nombre} className="flex items-center gap-3">
                    <div className="w-[130px] shrink-0 text-[12px] text-[#475569] truncate">
                      {area.nombre}
                    </div>
                    <div className="flex-1 h-2 rounded-full bg-[#E8EEF7] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          area.valor >= 90
                            ? 'bg-emerald-500'
                            : area.valor >= 50
                              ? 'bg-[#1D4ED8]'
                              : area.valor > 0
                                ? 'bg-amber-400'
                                : 'bg-transparent'
                        }`}
                        style={{ width: `${Math.max(0, Math.min(100, area.valor))}%` }}
                      />
                    </div>
                    <div className="w-10 shrink-0 text-right text-[12px] font-bold text-[#0B2A4A]">
                      {area.valor}%
                    </div>
                  </div>
                ))}
              </div>
            </Tarjeta>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Rueda */}
            <Tarjeta className="p-5">
              <TituloBloque texto="Rueda de diagnóstico" />
              {ejesRueda.length >= 3 ? (
                <>
                  <div className="text-[11px] text-[#94A3B8] -mt-2 mb-2">
                    Calificación de 1 a {escalaRueda(ejesRueda)}
                  </div>
                  <Rueda ejes={ejesRueda} />
                </>
              ) : (
                <Vacio texto="La rueda aparece cuando el diagnóstico del proyecto esté procesado." />
              )}
            </Tarjeta>

            {/* Convocatorias */}
            <Tarjeta className="p-5">
              <TituloBloque texto="Convocatorias encontradas" enlace="Ver todas" />
              {convocatoriasTop.length ? (
                <div className="space-y-3">
                  {convocatoriasTop.map((c, i) => (
                    <div key={`${c.nombre}-${i}`} className="rounded-xl border border-[#E4EAF3] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[13px] font-bold text-[#0B2A4A] leading-snug line-clamp-2">
                            {i + 1}. {c.nombre}
                          </div>
                          {c.entidad ? (
                            <div className="text-[11.5px] text-[#7C8CA5] mt-0.5 truncate">{c.entidad}</div>
                          ) : null}
                        </div>
                        {c.afinidad !== null ? (
                          <div className="text-[15px] font-extrabold text-emerald-600 shrink-0">
                            {c.afinidad}%
                          </div>
                        ) : null}
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="text-[11.5px] text-[#7C8CA5]">
                          {c.cierre ? `Cierra el ${fechaBonita(c.cierre)}` : 'Sin fecha'}
                          {c.dias !== null ? ` · ${c.dias} días` : ''}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {c.estado}
                          </span>
                          {c.semaforos.map((s, j) => (
                            <span key={j} className={`h-2 w-2 rounded-full ${colorSemaforo(s)}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Vacio texto="Todavía no hay convocatorias encontradas para este proyecto." />
              )}
            </Tarjeta>
          </div>
        </div>

        {/* ============ COLUMNA DERECHA ============ */}
        <div className="lg:col-span-4 space-y-5">
          <Tarjeta className="p-5">
            <TituloBloque texto="Alertas importantes" enlace="Ver todas" />
            {alertas.length ? (
              <div className="space-y-3">
                {alertas.map((a, i) => {
                  const Icono =
                    a.tipo === 'critica' ? AlertCircle : a.tipo === 'atencion' ? AlertTriangle : Info
                  const color =
                    a.tipo === 'critica'
                      ? 'text-rose-500'
                      : a.tipo === 'atencion'
                        ? 'text-amber-500'
                        : 'text-[#1D4ED8]'
                  return (
                    <div key={i} className="flex gap-2.5">
                      <Icono className={`h-4 w-4 shrink-0 mt-0.5 ${color}`} />
                      <div className="min-w-0 flex-1">
                        <div className="text-[12.5px] font-semibold text-[#0B2A4A] leading-snug">
                          {a.titulo}
                        </div>
                        <div className="text-[11.5px] text-[#7C8CA5] leading-snug">{a.detalle}</div>
                      </div>
                      {a.fecha ? (
                        <div className="text-[11px] text-rose-500 font-semibold shrink-0">{a.fecha}</div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ) : (
              <Vacio texto="No hay alertas por ahora." />
            )}
          </Tarjeta>

          <Tarjeta className="p-5">
            <TituloBloque texto="Últimas actividades" enlace="Ver historial" />
            {actividades.length ? (
              <div className="space-y-2.5">
                {actividades.map((a, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <div className="text-[12.5px] text-[#334155] flex-1 truncate">{a.texto}</div>
                    <div className="text-[11px] text-[#94A3B8] shrink-0">{a.cuando}</div>
                  </div>
                ))}
              </div>
            ) : (
              <Vacio texto="Aún no hay actividad registrada." />
            )}
          </Tarjeta>

          <Tarjeta className="p-5">
            <TituloBloque texto="Actividades pendientes" enlace="Ver todas" />
            {pendientes.length ? (
              <div className="space-y-2.5">
                {pendientes.map((p, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <Circle className="h-4 w-4 text-[#CBD5E1] shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] text-[#334155] leading-snug">{p.texto}</div>
                      <span
                        className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          p.prioridad === 'alta'
                            ? 'bg-rose-50 text-rose-600'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        Prioridad {p.prioridad}
                      </span>
                    </div>
                    {p.fecha ? (
                      <div className="text-[11px] text-[#94A3B8] shrink-0">{p.fecha}</div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <Vacio texto="No tienes tareas pendientes." />
            )}
          </Tarjeta>
        </div>
      </div>

      {/* ============ PIE: SIGUIENTES ACCIONES ============ */}
      <Tarjeta className="p-5 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="lg:w-64 shrink-0">
            <h2 className="text-[17px] font-extrabold text-[#0B2A4A]">¿Listo para continuar?</h2>
            <p className="text-[12.5px] text-[#7C8CA5] mt-1 leading-snug">
              Sigue avanzando paso a paso hacia la postulación de tu proyecto.
            </p>
          </div>
          <div className="flex-1 flex items-center justify-center gap-3 flex-wrap">
            {[
              { icono: Wallet, texto: 'Validar presupuesto' },
              { icono: FileCheck2, texto: 'Completar documentos' },
              { icono: Wand2, texto: 'Adaptar proyecto' },
              { icono: Send, texto: 'Postular' },
            ].map(({ icono: Icono, texto }, i, arr) => (
              <React.Fragment key={texto}>
                <div className="flex flex-col items-center gap-2 w-[92px]">
                  <div className="h-11 w-11 rounded-xl border border-[#E4EAF3] bg-[#F8FAFD] flex items-center justify-center">
                    <Icono className="h-5 w-5 text-[#1D4ED8]" />
                  </div>
                  <div className="text-[11px] text-center text-[#475569] leading-tight">{texto}</div>
                </div>
                {i < arr.length - 1 ? (
                  <ArrowRight className="h-4 w-4 text-[#CBD5E1] hidden sm:block" />
                ) : null}
              </React.Fragment>
            ))}
          </div>
          <Link
            href="/estructuracion"
            className="shrink-0 h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#143E77] to-[#0C2E5C] text-white text-[14px] font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Continuar ahora <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Tarjeta>
    </div>
  )
}
