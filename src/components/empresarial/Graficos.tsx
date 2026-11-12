import React from 'react'

/**
 * Gráficos propios de la plataforma (sin librerías externas).
 * Reglas: cada gráfico dibuja solo cifras que la persona ya escribió o que salen de una cuenta con ellas;
 * todo gráfico trae su texto equivalente (lista de valores) para quien no ve la imagen.
 */

export const PALETA = ['#C9A46B', '#7FB6A4', '#8FA8D8', '#E3A59B', '#B79BD6', '#D9C27A']
const ORO = '#C9A46B'
const ROJO = '#FF8A80'
const CREMA = '#F3E7DC'

/** Número corto para ejes: 1,2 M · 850 mil. */
export function compacto(n: number): string {
  const a = Math.abs(n)
  const signo = n < 0 ? '-' : ''
  if (a >= 1_000_000_000) return `${signo}${(a / 1_000_000_000).toFixed(1).replace('.', ',')} MM`
  if (a >= 1_000_000) return `${signo}${(a / 1_000_000).toFixed(1).replace('.', ',')} M`
  if (a >= 1_000) return `${signo}${Math.round(a / 1_000)} mil`
  return `${signo}${Math.round(a)}`
}

/* -------------------------------------------------------------------------- */
/* Embudo: etapas que se van reduciendo (TAM → SAM → SOM)                      */
/* -------------------------------------------------------------------------- */
export interface EtapaEmbudo {
  etiqueta: string
  valor: string
  detalle?: string
}

export function Embudo({ etapas, titulo }: { etapas: EtapaEmbudo[]; titulo: string }) {
  const anchos = etapas.map((_, i) => 100 - (i * 56) / Math.max(1, etapas.length - 1))
  return (
    <figure aria-label={titulo} className="mt-5">
      <div className="mx-auto flex max-w-[560px] flex-col items-center gap-1.5">
        {etapas.map((e, i) => (
          <div
            key={e.etiqueta}
            className="flex flex-col items-center justify-center px-3 py-3 text-center text-[#2E0E1A] shadow-md"
            style={{
              width: `${anchos[i]}%`,
              background: `linear-gradient(180deg, ${PALETA[i % PALETA.length]}, ${PALETA[i % PALETA.length]}CC)`,
              clipPath: 'polygon(0 0, 100% 0, 96% 100%, 4% 100%)',
              borderRadius: 6,
            }}
          >
            <span className="text-[11px] font-extrabold uppercase tracking-wider">{e.etiqueta}</span>
            <span className="text-lg font-extrabold leading-tight">{e.valor}</span>
            {e.detalle && <span className="text-[11px] font-semibold">{e.detalle}</span>}
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-center text-xs text-[#F3E7DC]/55">La forma es ilustrativa, no está a escala: los valores reales están escritos en cada franja.</figcaption>
    </figure>
  )
}

/* -------------------------------------------------------------------------- */
/* Dona: de qué está hecho un total                                            */
/* -------------------------------------------------------------------------- */
export interface PorcionDona {
  etiqueta: string
  valor: number
}

export function Dona({ porciones, centro, subcentro, formato, titulo }: { porciones: PorcionDona[]; centro: string; subcentro: string; formato: (n: number) => string; titulo: string }) {
  const util = porciones.filter((p) => p.valor > 0)
  const total = util.reduce((a, p) => a + p.valor, 0)
  if (total <= 0) return null
  const R = 70
  const C = 2 * Math.PI * R
  const inicios = util.map((_, i) => util.slice(0, i).reduce((a, p) => a + (p.valor / total) * C, 0))
  return (
    <figure aria-label={titulo} className="flex flex-wrap items-center justify-center gap-6">
      <svg viewBox="0 0 200 200" className="h-48 w-48 shrink-0" role="img" aria-label={titulo}>
        <g transform="rotate(-90 100 100)">
          <circle cx="100" cy="100" r={R} fill="none" stroke="#3B1727" strokeWidth="30" />
          {util.map((p, i) => {
            const largo = (p.valor / total) * C
            return (
              <circle
                key={p.etiqueta + i}
                cx="100"
                cy="100"
                r={R}
                fill="none"
                stroke={PALETA[i % PALETA.length]}
                strokeWidth="30"
                strokeDasharray={`${Math.max(0, largo - 1.5)} ${C - Math.max(0, largo - 1.5)}`}
                strokeDashoffset={-inicios[i]}
              />
            )
          })}
        </g>
        <text x="100" y="97" textAnchor="middle" fill={CREMA} fontSize="15" fontWeight="800">
          {centro}
        </text>
        <text x="100" y="115" textAnchor="middle" fill={CREMA} fillOpacity="0.65" fontSize="9">
          {subcentro}
        </text>
      </svg>
      <ul className="space-y-1.5 text-sm">
        {util.map((p, i) => (
          <li key={p.etiqueta + i} className="flex items-center gap-2">
            <span aria-hidden className="h-3 w-3 shrink-0 rounded-sm" style={{ background: PALETA[i % PALETA.length] }} />
            <span>
              {p.etiqueta}: <span className="font-extrabold">{formato(p.valor)}</span>{' '}
              <span className="text-xs text-[#F3E7DC]/60">({Math.round((p.valor / total) * 100)} %)</span>
            </span>
          </li>
        ))}
      </ul>
    </figure>
  )
}

/* -------------------------------------------------------------------------- */
/* Barras horizontales, con valores negativos en rojo                          */
/* -------------------------------------------------------------------------- */
export interface BarraH {
  etiqueta: string
  valor: number
  destacada?: boolean
}

export function BarrasH({ barras, formato, titulo }: { barras: BarraH[]; formato: (n: number) => string; titulo: string }) {
  const max = Math.max(1, ...barras.map((b) => Math.abs(b.valor)))
  const hayNeg = barras.some((b) => b.valor < 0)
  return (
    <figure aria-label={titulo} className="mt-2 space-y-2">
      {barras.map((b) => {
        const pct = (Math.abs(b.valor) / max) * (hayNeg ? 50 : 100)
        const neg = b.valor < 0
        return (
          <div key={b.etiqueta} className="text-sm">
            <div className="mb-0.5 flex items-center justify-between gap-3">
              <span className={b.destacada ? 'font-extrabold' : ''}>{b.etiqueta}</span>
              <span className="font-extrabold" style={{ color: neg ? ROJO : ORO }}>
                {formato(b.valor)}
              </span>
            </div>
            <div className="relative h-4 rounded-full bg-[#3B1727]">
              {hayNeg && <span aria-hidden className="absolute left-1/2 top-0 h-full w-px bg-[#F3E7DC]/40" />}
              <span
                aria-hidden
                className="absolute top-0 h-full rounded-full shadow"
                style={{
                  width: `${Math.max(pct, 0.8)}%`,
                  left: hayNeg ? (neg ? `${50 - pct}%` : '50%') : 0,
                  background: neg ? `linear-gradient(90deg, #B3261E, ${ROJO})` : `linear-gradient(90deg, #B08D57, ${ORO})`,
                  outline: b.destacada ? `2px solid ${CREMA}` : 'none',
                }}
              />
            </div>
          </div>
        )
      })}
    </figure>
  )
}

/* -------------------------------------------------------------------------- */
/* Punto de equilibrio: ingresos contra costos según las unidades vendidas     */
/* -------------------------------------------------------------------------- */
export function LineaEquilibrio({
  precio,
  costoVariable,
  costosFijos,
  unidadesActuales,
  equilibrio,
  formatoUnidades,
  titulo,
}: {
  precio: number
  costoVariable: number
  costosFijos: number
  unidadesActuales: number | null
  equilibrio: number | null
  formatoUnidades: (n: number) => string
  titulo: string
}) {
  const xmax = Math.max((equilibrio ?? 0) * 1.7, (unidadesActuales ?? 0) * 1.3, 10)
  const ing = (x: number) => precio * x
  const cos = (x: number) => costosFijos + costoVariable * x
  const ymax = Math.max(ing(xmax), cos(xmax), 1)
  const W = 640
  const H = 300
  const m = { l: 62, r: 16, t: 16, b: 38 }
  const px = (x: number) => m.l + (x / xmax) * (W - m.l - m.r)
  const py = (y: number) => H - m.b - (y / ymax) * (H - m.t - m.b)
  const lin = (f: (x: number) => number) => `${px(0)},${py(f(0))} ${px(xmax)},${py(f(xmax))}`
  const ticksY = [0, 0.25, 0.5, 0.75, 1].map((t) => t * ymax)
  const ticksX = [0, 0.25, 0.5, 0.75, 1].map((t) => t * xmax)
  return (
    <figure aria-label={titulo} className="mt-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={titulo}>
        {ticksY.map((t) => (
          <g key={t}>
            <line x1={m.l} x2={W - m.r} y1={py(t)} y2={py(t)} stroke="#F3E7DC" strokeOpacity="0.12" />
            <text x={m.l - 6} y={py(t) + 3} textAnchor="end" fill={CREMA} fillOpacity="0.65" fontSize="10">
              {compacto(t)}
            </text>
          </g>
        ))}
        {ticksX.map((t) => (
          <text key={t} x={px(t)} y={H - m.b + 15} textAnchor="middle" fill={CREMA} fillOpacity="0.65" fontSize="10">
            {formatoUnidades(Math.round(t))}
          </text>
        ))}
        <text x={(m.l + W - m.r) / 2} y={H - 4} textAnchor="middle" fill={CREMA} fillOpacity="0.6" fontSize="10">
          Unidades vendidas al mes
        </text>
        <polyline points={lin(cos)} fill="none" stroke="#8FA8D8" strokeWidth="3" strokeLinecap="round" />
        <polyline points={lin(ing)} fill="none" stroke={ORO} strokeWidth="3" strokeLinecap="round" />
        {unidadesActuales !== null && unidadesActuales > 0 && (
          <g>
            <line x1={px(unidadesActuales)} x2={px(unidadesActuales)} y1={m.t} y2={H - m.b} stroke={CREMA} strokeOpacity="0.55" strokeDasharray="4 4" />
            <text x={px(unidadesActuales) + 4} y={m.t + 10} fill={CREMA} fontSize="10">
              Tu plan
            </text>
          </g>
        )}
        {equilibrio !== null && (
          <g>
            <circle cx={px(equilibrio)} cy={py(ing(equilibrio))} r="6" fill="#2E0E1A" stroke={CREMA} strokeWidth="3" />
            <text x={px(equilibrio)} y={py(ing(equilibrio)) - 12} textAnchor="middle" fill={CREMA} fontSize="11" fontWeight="800">
              Equilibrio
            </text>
          </g>
        )}
      </svg>
      <div className="mt-1 flex flex-wrap justify-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-1 w-5 rounded" style={{ background: ORO }} /> Ingresos
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-1 w-5 rounded" style={{ background: '#8FA8D8' }} /> Costos totales (fijos + por unidad)
        </span>
      </div>
      <figcaption className="mt-1 text-center text-xs text-[#F3E7DC]/55">Donde se cruzan las dos líneas, no ganas ni pierdes. A la derecha de ese punto ganas; a la izquierda, pierdes.</figcaption>
    </figure>
  )
}
