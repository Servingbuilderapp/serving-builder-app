'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MATRICES, ORDEN_GRUPOS, TOTAL_COMPLETO, TOTAL_SENCILLO, estadoMatriz, type AccesoCatalogo } from '@/lib/empresarial/catalogo'
import { PLANES, type ClavePlan } from '@/lib/empresarial/membresia'

const RELIEVE_BOTON = 'shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200'
const RELIEVE_TARJETA = 'shadow-[0_1px_2px_rgba(84,20,43,0.06),0_10px_28px_-14px_rgba(84,20,43,0.22)]'

interface Props {
  proyectoId: string | null
  activo: boolean
  plan: ClavePlan | null
  diasRestantes: number
}

export function HerramientasClient({ proyectoId, activo, plan, diasRestantes }: Props) {
  const acceso: AccesoCatalogo = { activo, plan }
  const botonOro = `inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-b from-ca-oro-claro to-ca-oro px-4 text-sm font-extrabold text-ca-vino-hondo ${RELIEVE_BOTON}`
  const botonSuave = `inline-flex h-10 items-center justify-center rounded-xl border border-ca-oro/50 bg-ca-tarjeta px-4 text-sm font-semibold text-ca-vino ${RELIEVE_BOTON}`

  let estado: string
  if (!activo) estado = 'Tu acceso terminó. Elige un plan para volver a usar tus herramientas.'
  else if (plan === null) estado = `Estás en tu mes de proyecto (${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'}). Ahora puedes usar las ${TOTAL_SENCILLO} herramientas del plan Sencillo.`
  else if (plan === 'sencillo') estado = `Tu plan Sencillo incluye ${TOTAL_SENCILLO} herramientas. El plan Completo suma las otras ${TOTAL_COMPLETO - TOTAL_SENCILLO}.`
  else estado = `Tu plan ${PLANES.completo.nombre} incluye las ${TOTAL_COMPLETO} herramientas.`

  const con = (ruta: string) => (proyectoId ? `${ruta}?proyecto=${proyectoId}` : ruta)

  return (
    <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino">
      <div className="max-w-[1000px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <Link href={proyectoId ? `/empresarial/camino?proyecto=${proyectoId}` : '/empresarial'} className="inline-flex items-center gap-2 text-sm text-ca-vino/75 hover:text-ca-vino-hondo">
          <ArrowLeft className="h-4 w-4" /> {proyectoId ? 'Volver a mi camino' : 'Volver a mis proyectos'}
        </Link>
        <div className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-ca-oro-texto">Mis herramientas</div>
        <h1 className="mt-3 text-3xl lg:text-4xl font-extrabold">Las {TOTAL_COMPLETO} matrices, por tema</h1>
        <p className="mt-3 text-ca-vino/80 leading-relaxed">{estado}</p>
        <div className="mt-4">
          <Link href="/empresarial/membresia" className={botonSuave}>
            Ver mi plan
          </Link>
        </div>

        <div className="mt-8 space-y-8">
          {ORDEN_GRUPOS.map((g) => {
            const lista = MATRICES.filter((m) => m.grupo === g)
            if (lista.length === 0) return null
            return (
              <section key={g}>
                <h2 className="text-xl font-extrabold">{g}</h2>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                  {lista.map((m) => {
                    const e = estadoMatriz(m, acceso)
                    return (
                      <li key={m.clave} className={`flex flex-col justify-between rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-4 ${RELIEVE_TARJETA}`}>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-extrabold leading-tight">{m.titulo}</h3>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${m.plan === 'sencillo' ? 'bg-ca-oro-claro text-ca-vino-hondo' : 'border border-ca-oro/60 text-ca-vino/80'}`}>
                              {m.plan === 'sencillo' ? 'Sencillo' : 'Completo'}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-ca-vino/80">{m.ayuda}</p>
                        </div>
                        <div className="mt-3">
                          {e === 'abrir' && m.ruta && (
                            <Link href={con(m.ruta)} className={botonOro}>
                              Abrir
                            </Link>
                          )}
                          {e === 'muy_pronto' && <span className="text-sm font-semibold text-ca-vino/75">Muy pronto</span>}
                          {e === 'en_plan_completo' && (
                            <Link href="/empresarial/membresia" className="text-sm font-semibold underline text-ca-vino/80">
                              Viene en el plan Completo
                            </Link>
                          )}
                          {e === 'sin_acceso' && (
                            <Link href="/empresarial/membresia" className="text-sm font-semibold underline text-ca-vino/80">
                              Elige un plan para abrirla
                            </Link>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
      </div>
    </main>
  )
}
