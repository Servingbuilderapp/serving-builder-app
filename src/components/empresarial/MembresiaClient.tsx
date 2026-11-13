'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { BotonPagoBold } from '@/components/pagos/BotonPagoBold'
import { PLANES, type ClavePlan } from '@/lib/empresarial/membresia'

interface Props {
  membresiaId: string
  plan: ClavePlan | null
  activo: boolean
  diasRestantes: number
  enPeriodoInicial: boolean
  accesoHasta: string
  pagoEnProceso: boolean
}

const RELIEVE_TARJETA = 'shadow-[0_10px_24px_-8px_rgba(84,20,43,0.35),inset_0_1px_0_rgba(255,255,255,0.7)]'

const INCLUYE: Record<ClavePlan, string[]> = {
  sencillo: [
    'Unas 10 matrices esenciales para decidir y arrancar',
    'Radar del Entorno, Mapa de Presiones, Lienzo de Negocio y Termómetro de Riesgos',
    'Tu documento final y tu tablero de escenarios',
  ],
  completo: [
    'Todas las matrices (unas 26)',
    'Matrices de finanzas, ventas, productividad y crecimiento',
    'Todo lo del plan Sencillo',
  ],
}

const pesos = (n: number) => `$${n.toLocaleString('es-CO')}`

export function MembresiaClient({ membresiaId, plan, activo, diasRestantes, enPeriodoInicial, accesoHasta, pagoEnProceso }: Props) {
  const [elegido, setElegido] = useState<ClavePlan | null>(null)
  const fecha = new Date(accesoHasta).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })

  let estado: string
  if (!activo) estado = 'Tu acceso terminó. Estás en modo lectura: puedes ver y descargar tu documento.'
  else if (enPeriodoInicial) estado = `Tienes ${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'} para hacer tu proyecto (hasta el ${fecha}).`
  else estado = `Tu plan ${PLANES[plan as ClavePlan].nombre} está activo hasta el ${fecha} (${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'}).`

  return (
    <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino px-5 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-extrabold">Mi plan</h1>
        <p className="mt-3 text-lg">{estado}</p>

        {pagoEnProceso && (
          <p className="mt-4 rounded-xl border border-ca-oro/60 bg-ca-tarjeta px-4 py-3 text-sm">
            Estamos confirmando tu pago con Bold. En un momento tu plan queda activo; si no cambia, recarga la página.
          </p>
        )}

        <p className="mt-6 text-ca-vino/80">
          {enPeriodoInicial
            ? 'Para seguir usando todas las herramientas después de este mes, elige un plan mensual.'
            : 'Puedes renovar o cambiar de plan cuando quieras. Cada pago suma 30 días.'}
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {(Object.keys(PLANES) as ClavePlan[]).map((clave) => {
            const p = PLANES[clave]
            const esActual = plan === clave && activo
            return (
              <article
                key={clave}
                className={`relative rounded-2xl border-2 bg-gradient-to-b from-[#FBF7F0] to-[#EADBC6] p-6 ${
                  esActual ? 'border-ca-oro' : 'border-ca-oro/45'
                } ${RELIEVE_TARJETA}`}
              >
                {esActual && (
                  <span className="absolute right-4 top-4 rounded-full bg-ca-oro-claro px-3 py-1 text-xs font-bold text-ca-vino-hondo">Tu plan</span>
                )}
                <h2 className="text-xl font-extrabold">{p.nombre}</h2>
                <p className="mt-1 text-sm text-ca-vino/80">{p.descripcion}</p>
                <p className="mt-4 text-3xl font-extrabold">
                  {pesos(p.precioCop)} <span className="text-base font-semibold text-ca-vino/70">al mes</span>
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  {INCLUYE[clave].map((t) => (
                    <li key={t} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-ca-oro-texto" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  {elegido === clave ? (
                    <BotonPagoBold
                      endpoint="/api/empresarial/membresia/iniciar"
                      campoId="membresiaId"
                      id={membresiaId}
                      extra={{ plan: clave }}
                      texto={`Pagar ${pesos(p.precioCop)} (1 mes)`}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setElegido(clave)}
                      className="w-full rounded-xl bg-ca-oro-claro px-6 py-3 text-sm font-bold text-ca-vino-hondo shadow-[0_6px_14px_-4px_rgba(84,20,43,0.45),inset_0_1px_0_rgba(255,255,255,0.5)] hover:brightness-105"
                    >
                      {esActual ? 'Renovar este plan' : `Elegir ${p.nombre}`}
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>

        <p className="mt-6 text-sm text-ca-vino/70">
          Pagas con tarjeta, PSE o Nequi. Cuando falten pocos días te lo recordamos aquí, dentro de la plataforma.
        </p>
        <Link href="/empresarial" className="mt-6 inline-block text-sm underline">
          Volver a mis proyectos
        </Link>
      </div>
    </main>
  )
}
