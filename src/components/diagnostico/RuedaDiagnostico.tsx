'use client'

import React from 'react'

export interface EjeDiagnostico {
  /** Nombre corto del eje, ej: "Claridad de la Idea" */
  label: string
  /** Puntaje de 0 a 10 */
  score: number
  /** Frase corta y clara de qué hacer para mejorar este eje */
  recomendacion?: string
}

interface RuedaDiagnosticoProps {
  titulo?: string
  ejes: EjeDiagnostico[]
  /** Tamaño del dibujo en píxeles (ancho = alto) */
  size?: number
}

/**
 * Rueda de Diagnóstico: gráfico radial (tipo "rueda") que muestra varios
 * ejes de evaluación de 0 a 10, coloreado con el mismo sistema semántico
 * de toda la plataforma: rojo = bajo/riesgo, ámbar = medio/atención,
 * verde = alto/logrado. Debajo del dibujo siempre se muestra una lista
 * en texto plano con el puntaje y qué mejorar en cada eje, para que
 * cualquier persona (no solo alguien visual) entienda qué hacer.
 */
export function RuedaDiagnostico({ titulo, ejes, size = 380 }: RuedaDiagnosticoProps) {
  const n = ejes.length
  const center = size / 2
  const maxRadius = size * 0.36
  const angleStep = (2 * Math.PI) / n

  // Color según el puntaje: 0-3.9 rojo, 4-6.9 ámbar, 7-10 verde
  const colorForScore = (score: number) => {
    if (score < 4) return 'var(--color-accent-red)'
    if (score < 7) return 'var(--color-accent-warm)'
    return 'var(--color-accent-pink)' // verde de progreso en nuestro sistema
  }

  const pointFor = (index: number, radius: number) => {
    // Empieza arriba (−90°) y avanza en sentido horario
    const angle = -Math.PI / 2 + index * angleStep
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    }
  }

  // Polígono de los puntajes reales
  const dataPoints = ejes.map((eje, i) => {
    const r = (Math.max(0, Math.min(10, eje.score)) / 10) * maxRadius
    return pointFor(i, r)
  })
  const dataPath = dataPoints.map(p => `${p.x},${p.y}`).join(' ')

  // Anillos de fondo: uno por cada 2 puntos de la escala (2, 4, 6, 8, 10)
  const rings = [0.2, 0.4, 0.6, 0.8, 1]

  const promedio = ejes.length
    ? ejes.reduce((acc, e) => acc + e.score, 0) / ejes.length
    : 0

  return (
    <div className="w-full flex flex-col items-center gap-8">
      {titulo && (
        <h3 className="text-xl md:text-2xl font-bold text-color-base-content text-center">
          {titulo}
        </h3>
      )}

      <div
        className="relative glass-card p-6 rounded-3xl overflow-hidden"
        style={{
          boxShadow: '0 0 40px color-mix(in srgb, var(--color-accent-violet) 20%, transparent)',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ background: 'linear-gradient(to right, var(--color-accent-violet), var(--color-accent-magenta, var(--color-accent-violet)))' }}
        />
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Área de puntajes reales, con degradado violeta-magenta vívido + brillo */}
          <defs>
            <linearGradient id="ruedaFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-accent-violet)" stopOpacity={0.7} />
              <stop offset="100%" stopColor="var(--color-accent-magenta, var(--color-accent-violet))" stopOpacity={0.7} />
            </linearGradient>
            <radialGradient id="ruedaGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-accent-violet)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-accent-violet)" stopOpacity={0} />
            </radialGradient>
            <filter id="ruedaSombra" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="var(--color-accent-violet)" floodOpacity="0.5" />
            </filter>
            <filter id="puntoBrillo" x="-100%" y="-100%" width="300%" height="300%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodOpacity="0.9" />
            </filter>
          </defs>

          {/* Resplandor de fondo detrás de toda la rueda */}
          <circle cx={center} cy={center} r={maxRadius * 1.15} fill="url(#ruedaGlow)" />

          {/* Anillos guía: círculos concéntricos reales (formato rueda) */}
          {rings.map((frac, ri) => (
            <circle
              key={ri}
              cx={center}
              cy={center}
              r={maxRadius * frac}
              fill="none"
              stroke="var(--color-base-300)"
              strokeOpacity={0.85}
              strokeWidth={1.25}
            />
          ))}

          {/* Marco exterior grueso de la rueda */}
          <circle
            cx={center}
            cy={center}
            r={maxRadius}
            fill="none"
            stroke="var(--color-accent-violet)"
            strokeOpacity={0.55}
            strokeWidth={3}
          />

          {/* Rayos: una línea del centro a la periferia por cada dimensión */}
          {ejes.map((_, i) => {
            const p = pointFor(i, maxRadius)
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={p.x}
                y2={p.y}
                stroke="var(--color-base-300)"
                strokeOpacity={0.9}
                strokeWidth={1.25}
              />
            )
          })}

          {/* Números de la escala (2, 4, 6, 8, 10) sobre el rayo superior */}
          {rings.map((frac, ri) => (
            <text
              key={`escala-${ri}`}
              x={center + 9}
              y={center - maxRadius * frac}
              textAnchor="start"
              dominantBaseline="middle"
              fontSize={9}
              fontWeight={700}
              fill="var(--color-base-content)"
              opacity={0.45}
            >
              {Math.round(frac * 10)}
            </text>
          ))}

          <polygon
            points={dataPath}
            fill="url(#ruedaFill)"
            stroke="var(--color-accent-magenta, var(--color-accent-violet))"
            strokeWidth={3.5}
            filter="url(#ruedaSombra)"
          />

          {/* Puntos de cada eje, coloreados según su puntaje individual, con halo brillante */}
          {dataPoints.map((p, i) => (
            <g key={i} filter="url(#puntoBrillo)">
              <circle
                cx={p.x}
                cy={p.y}
                r={9}
                fill={colorForScore(ejes[i].score)}
                stroke="var(--color-base-100)"
                strokeWidth={3}
              />
            </g>
          ))}

          {/* Etiquetas de cada eje */}
          {ejes.map((eje, i) => {
            const p = pointFor(i, maxRadius + 26)
            return (
              <text
                key={i}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={11}
                fontWeight={700}
                fill="var(--color-base-content)"
                opacity={0.75}
              >
                {eje.label}
              </text>
            )
          })}

          {/* Puntaje promedio en el centro, con degradado de texto */}
          <defs>
            <linearGradient id="textoPromedio" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-accent-violet)" />
              <stop offset="100%" stopColor="var(--color-accent-magenta, var(--color-accent-violet))" />
            </linearGradient>
          </defs>
          <text
            x={center}
            y={center - 6}
            textAnchor="middle"
            fontSize={34}
            fontWeight={900}
            fill="url(#textoPromedio)"
          >
            {promedio.toFixed(1)}
          </text>
          <text
            x={center}
            y={center + 16}
            textAnchor="middle"
            fontSize={10}
            fontWeight={700}
            letterSpacing={1.5}
            fill="var(--color-base-content)"
            opacity={0.5}
          >
            PROMEDIO / 10
          </text>
        </svg>
      </div>

      {/* Lista en texto plano: puntaje + qué mejorar, eje por eje */}
      <div className="w-full max-w-xl space-y-3">
        {ejes.map((eje, i) => (
          <div
            key={i}
            className="flex items-start gap-4 glass-card rounded-2xl p-4"
          >
            <div
              className="shrink-0 h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm text-white"
              style={{ backgroundColor: colorForScore(eje.score) }}
            >
              {eje.score.toFixed(0)}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-color-base-content">{eje.label}</p>
              {eje.recomendacion && (
                <p className="text-xs text-color-base-content/60 leading-relaxed">
                  {eje.recomendacion}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
