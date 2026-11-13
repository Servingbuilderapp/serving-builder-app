'use client'

import React from 'react'
import { CONDICIONES, type Condicion } from '@/lib/empresarial/formulacion'
import { compacto } from '@/components/empresarial/Graficos'
import type { Alerta } from '@/lib/empresarial/calculadoras'

export const RELIEVE_BOTON =
  'shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200'
export const RELIEVE_TARJETA = 'shadow-[0_1px_2px_rgba(84,20,43,0.06),0_10px_28px_-14px_rgba(84,20,43,0.22)]'
export const CAMPO_ENTRADA =
  'mt-2 w-full rounded-xl border border-ca-oro/40 bg-ca-fondo px-4 py-3 text-ca-vino placeholder:text-ca-vino/65 focus:outline-none focus:ring-2 focus:ring-ca-oro-claro'
export const CAMPO_CELDA =
  'w-full min-w-[96px] rounded-lg border border-ca-oro/40 bg-ca-fondo px-2 py-2 text-right text-ca-vino focus:outline-none focus:ring-2 focus:ring-ca-oro-claro'
export const BOTON_ORO = `h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-ca-oro-claro to-ca-oro text-ca-vino-hondo font-extrabold disabled:opacity-50 disabled:cursor-not-allowed ${RELIEVE_BOTON}`
export const BOTON_SUAVE = `h-11 px-4 inline-flex items-center justify-center gap-2 rounded-xl border border-ca-oro/50 bg-ca-tarjeta text-ca-vino font-semibold ${RELIEVE_BOTON}`

const COLOR_ALERTA: Record<string, string> = {
  Crítica: 'border-ca-rojo/70 bg-ca-rojo/10',
  Importante: 'border-ca-oro/70 bg-ca-fondo',
  Preventiva: 'border-ca-oro/50 bg-ca-fondo',
  Informativa: 'border-ca-oro/45 bg-ca-fondo',
}

export const SOLO_DECIMAL = (v: string) => {
  const limpio = v.replace(/[^\d.]/g, '')
  const [entero, ...resto] = limpio.split('.')
  return (entero.slice(0, 13) + (resto.length ? '.' + resto.join('').slice(0, 2) : '')).replace(/^\./, '0.')
}

export function SelectorCondicion({ valor, onCambio, etiqueta }: { valor: Condicion; onCambio: (c: Condicion) => void; etiqueta: string }) {
  return (
    <label className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ca-vino/75">
      <span>¿Qué tan seguro es este dato?</span>
      <select
        aria-label={`Condición del dato: ${etiqueta}`}
        value={valor}
        onChange={(e) => onCambio(e.target.value as Condicion)}
        className="h-9 rounded-lg border border-ca-oro/50 bg-ca-tarjeta px-2 text-ca-vino"
      >
        {CONDICIONES.map((c) => (
          <option key={c.valor} value={c.valor}>
            {c.etiqueta}
          </option>
        ))}
      </select>
    </label>
  )
}

export function Seccion({ titulo, ayuda, children }: { titulo: string; ayuda: string; children: React.ReactNode }) {
  return (
    <section className={`mt-6 rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-5 lg:p-6 ${RELIEVE_TARJETA}`}>
      <h2 className="text-xl font-extrabold">{titulo}</h2>
      <p className="mt-1 text-sm text-ca-vino/75">{ayuda}</p>
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  )
}

export function Alertas({ alertas }: { alertas: Alerta[] }) {
  if (alertas.length === 0) return null
  return (
    <ul className="space-y-3">
      {alertas.map((a, i) => (
        <li key={i} className={`rounded-xl border p-3 text-sm ${COLOR_ALERTA[a.nivel]}`}>
          <span className="font-extrabold">{a.nivel}: </span>
          {a.texto}
        </li>
      ))}
    </ul>
  )
}

export function Cifra({ etiqueta, valor, fuerte }: { etiqueta: string; valor: string; fuerte?: boolean }) {
  return (
    <div className={`rounded-xl p-4 ${fuerte ? 'bg-ca-vino text-ca-tarjeta' : 'bg-ca-fondo'}`}>
      <div className={`text-xs ${fuerte ? 'text-ca-tarjeta/80' : 'text-ca-vino/75'}`}>{etiqueta}</div>
      <div className={`mt-1 text-xl font-extrabold ${fuerte ? 'text-ca-oro-claro' : 'text-ca-vino'}`}>{valor}</div>
    </div>
  )
}

/** Barras del saldo de caja mes a mes. Arriba de la línea = hay dinero; abajo, en rojo = falta. */
export function BarrasSaldo({ saldos, titulo, primero = 1, unidad = 'mes' }: { saldos: number[]; titulo: string; primero?: number; unidad?: string }) {
  const max = Math.max(1, ...saldos.map((s) => Math.abs(s)))
  const hasta = Math.max(...saldos, 0)
  const desde = Math.min(...saldos, 0)
  const rango = Math.max(1, hasta - desde)
  const alto = 180
  const ancho = 640
  const ceroY = 10 + (hasta / rango) * alto
  const paso = ancho / saldos.length
  return (
    <figure>
      <svg viewBox={`0 0 ${ancho} ${alto + 60}`} role="img" aria-label={titulo} className="w-full">
        <line x1="0" x2={ancho} y1={ceroY} y2={ceroY} stroke="#54142B" strokeOpacity="0.5" />
        {saldos.map((s, i) => {
          const h = (Math.abs(s) / rango) * alto
          const y = s >= 0 ? ceroY - h : ceroY
          return (
            <g key={i}>
              <rect x={i * paso + 6} y={y} width={paso - 12} height={Math.max(1, h)} rx="3" fill={s >= 0 ? '#B08D57' : '#B3261E'} />
              <text x={i * paso + paso / 2} y={alto + 46} textAnchor="middle" fontSize="12" fill="#54142B">
                {i + primero}
              </text>
              {max > 0 && (
                <text x={i * paso + paso / 2} y={s >= 0 ? y - 3 : y + h + 12} textAnchor="middle" fontSize="9" fill="#54142B">
                  {compacto(s)}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <figcaption className="text-center text-xs text-ca-vino/75">{titulo} (número de {unidad} abajo)</figcaption>
    </figure>
  )
}
