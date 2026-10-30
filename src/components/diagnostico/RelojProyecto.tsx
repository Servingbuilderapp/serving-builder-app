import React from 'react'
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import { ETAPAS_RELOJ, etapaPorNivel } from '@/lib/relojProyecto'

/**
 * EL RELOJ DEL PROYECTO — dibuja las cuatro etapas de madurez como las cuatro marcas de un
 * reloj (12, 3, 6 y 9) y una manecilla que apunta a la etapa donde está el proyecto.
 * Mide MADUREZ, no tiempo. Debajo del dibujo, siempre en texto: qué etapa es, de dónde suele
 * venir el dinero y qué le recomendamos, para que lo entienda quien no mira el gráfico.
 */

const ANCHO = 460
const ALTO = 340
const CX = ANCHO / 2
const CY = ALTO / 2
const RADIO = 98

function punto(nivel: number, radio: number) {
  // Etapa 1 arriba (12), 2 a la derecha (3), 3 abajo (6), 4 a la izquierda (9).
  const angulo = -Math.PI / 2 + (nivel - 1) * (Math.PI / 2)
  return { x: CX + radio * Math.cos(angulo), y: CY + radio * Math.sin(angulo) }
}

export function RelojProyecto({
  nivel,
  justificacion,
  nombreProyecto,
}: {
  nivel: number
  justificacion?: string
  nombreProyecto?: string
}) {
  const etapa = etapaPorNivel(nivel)
  if (!etapa) return null

  const punta = punto(etapa.nivel, RADIO - 14)
  const mensajeAnalista = `Hola Arquitectura Digital, hice mi diagnóstico gratuito${
    nombreProyecto ? ` para "${nombreProyecto}"` : ''
  } y salí en la etapa de ${etapa.nombre.toLowerCase()}. Quiero orientación de la analista financiera.`
  const enlaceAnalista = `https://wa.me/573123335966?text=${encodeURIComponent(mensajeAnalista)}`

  return (
    <div className="rounded-3xl bg-[#3B1727] border border-[#B08D57]/45 p-6 md:p-8 space-y-6 text-[#F3E7DC]">
      <div className="space-y-1 text-center md:text-left">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C9A46B]">El reloj de tu proyecto</span>
        <p className="text-xs text-[#F3E7DC]/75">Mide la madurez de tu proyecto, no el tiempo que te queda.</p>
      </div>

      <div className="grid md:grid-cols-[minmax(0,400px)_1fr] gap-6 items-center">
        <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="mx-auto w-full max-w-[440px]" role="img" aria-label={`Etapa ${etapa.nivel} de 4: ${etapa.nombre}`}>
          <circle cx={CX} cy={CY} r={RADIO} fill="none" stroke="currentColor" strokeWidth="2" className="text-[#B08D57]/50" />
          <circle cx={CX} cy={CY} r={RADIO - 8} fill="none" stroke="currentColor" strokeWidth="1" className="text-[#B08D57]/25" />

          {ETAPAS_RELOJ.map((e) => {
            const marca = punto(e.nivel, RADIO)
            const texto = punto(e.nivel, RADIO + 22)
            const activa = e.nivel === etapa.nivel
            const ancla = e.nivel === 2 ? 'start' : e.nivel === 4 ? 'end' : 'middle'
            return (
              <g key={e.nivel}>
                <circle
                  cx={marca.x}
                  cy={marca.y}
                  r={activa ? 9 : 6}
                  className={activa ? 'fill-current text-[#C9A46B]' : 'fill-current text-[#B08D57]/60'}
                />
                <text
                  x={e.nivel === 2 ? texto.x - 8 : e.nivel === 4 ? texto.x + 8 : texto.x}
                  y={e.nivel === 1 ? texto.y - 2 : e.nivel === 3 ? texto.y + 10 : texto.y + 4}
                  textAnchor={ancla}
                  className={`${activa ? 'fill-current text-[#C9A46B]' : 'fill-current text-[#F3E7DC]/70'}`}
                  style={{ fontSize: 13, fontWeight: activa ? 800 : 600 }}
                >
                  {e.nivel}. {e.nombre}
                </text>
              </g>
            )
          })}

          <line x1={CX} y1={CY} x2={punta.x} y2={punta.y} stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-[#C9A46B]" />
          <circle cx={CX} cy={CY} r={7} className="fill-current text-[#C9A46B]" />
        </svg>

        <div className="space-y-4">
          <div>
            <h4 className="text-2xl font-black text-[#F3E7DC]">
              Etapa {etapa.nivel}: {etapa.nombre}
            </h4>
            <p className="text-sm text-[#F3E7DC]/85 mt-1">{etapa.descripcion}</p>
            {justificacion ? <p className="text-xs text-[#F3E7DC]/75 mt-2 italic">{justificacion}</p> : null}
          </div>

          <dl className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-black/20 border border-[#B08D57]/30 p-3">
              <dt className="font-black uppercase tracking-wider text-[#C9A46B]">Evidencia de tu proyecto</dt>
              <dd className="mt-1 text-[#F3E7DC]/90 font-semibold">{etapa.evidencia}</dd>
            </div>
            <div className="rounded-xl bg-black/20 border border-[#B08D57]/30 p-3">
              <dt className="font-black uppercase tracking-wider text-[#C9A46B]">¿A dónde dirigirte? Las fuentes que mejor te encajan</dt>
              <dd className="mt-1 text-[#F3E7DC]/90 font-semibold">{etapa.fuentes.join(' · ')}</dd>
            </div>
          </dl>

          <div className="rounded-xl border border-[#B08D57]/40 p-4 space-y-2">
            <p className="text-[11px] font-black uppercase tracking-wider text-[#C9A46B]">
              Posibilidades con subvenciones y cooperación, según tu diagnóstico: {etapa.posibilidadesSubvencion}
            </p>
            <p className="text-sm text-[#F3E7DC]/90 leading-relaxed">{etapa.recomendacion}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {etapa.nivel === 1 ? (
                <>
                  <Link href="/membresia" className="inline-flex items-center px-4 py-2 rounded-xl border border-[#C9A46B] text-[#F3E7DC] font-black text-[11px] uppercase tracking-wider hover:bg-[#C9A46B]/15">
                    Ver membresías
                  </Link>
                  <Link href="/academia" className="inline-flex items-center px-4 py-2 rounded-xl border border-[#C9A46B] text-[#F3E7DC] font-black text-[11px] uppercase tracking-wider hover:bg-[#C9A46B]/15">
                    Conocer la Academia
                  </Link>
                </>
              ) : (
                <Link href="/contratar" className="inline-flex items-center px-4 py-2 rounded-xl border border-[#C9A46B] text-[#F3E7DC] font-black text-[11px] uppercase tracking-wider hover:bg-[#C9A46B]/15">
                  Quiero estructurar mi proyecto
                </Link>
              )}
            </div>
          </div>

          {etapa.ofrecerAnalistaFinanciera ? (
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={enlaceAnalista}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-b from-[#C9A46B] to-[#B08D57] text-[#3A1420] font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-lg"
              >
                <MessageSquare className="h-4 w-4" /> Quiero hablar con la analista financiera
              </a>
              <span className="text-[11px] text-[#F3E7DC]/65">Es opcional: si quieres, te conectamos.</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
