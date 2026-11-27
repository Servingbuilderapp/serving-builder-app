'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { ArrowLeft, Check, Loader2, Printer } from 'lucide-react'
import { BotonPagoBold } from '@/components/pagos/BotonPagoBold'

const RELIEVE_TARJETA = 'shadow-[0_1px_2px_rgba(84,20,43,0.06),0_10px_28px_-14px_rgba(84,20,43,0.22)]'
const pesos = (n: number) => `$${n.toLocaleString('es-CO')}`

export interface MuestraVista {
  nombre_sugerido: string
  resumen: string
  oportunidad: string
  lo_que_falta: string[]
}

export interface EntradaVista {
  proyectoId: string
  nombre: string
  muestra: MuestraVista | null
  tramoNombre: string | null
  precioBase: number | null
  precioTotal: number | null
  pagado: boolean
  documento: string | null
}

/** Llama a una ruta de la IA una sola vez y, al terminar, vuelve a leer la pantalla. */
function useTarea(ruta: string, proyectoId: string, activa: boolean) {
  const router = useRouter()
  const yaLanzada = useRef(false)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    if (!activa || yaLanzada.current) return
    yaLanzada.current = true
    setError('')
    fetch(ruta, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proyecto_id: proyectoId }),
    })
      .then(async (r) => {
        const j = (await r.json().catch(() => ({}))) as { error?: string }
        if (!r.ok) throw new Error(j.error || 'No se pudo completar. Intenta de nuevo.')
        router.refresh()
      })
      .catch((e: Error) => setError(e.message))
  }, [activa, ruta, proyectoId, router, intento])

  const reintentar = () => {
    yaLanzada.current = false
    setIntento((n) => n + 1)
  }
  return { error, reintentar }
}

function Esperando({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <section className={`mt-10 text-center rounded-3xl border border-ca-oro/45 bg-ca-tarjeta p-8 md:p-10 ${RELIEVE_TARJETA}`}>
      <Loader2 className="mx-auto h-10 w-10 animate-spin text-ca-oro-texto" />
      <h1 className="mt-5 text-2xl font-extrabold">{titulo}</h1>
      <p className="mt-3 text-ca-vino/80">{texto}</p>
    </section>
  )
}

function ConError({ mensaje, reintentar }: { mensaje: string; reintentar: () => void }) {
  return (
    <section className={`mt-10 text-center rounded-3xl border border-ca-oro/45 bg-ca-tarjeta p-8 ${RELIEVE_TARJETA}`}>
      <p className="text-ca-rojo font-semibold">{mensaje}</p>
      <button
        type="button"
        onClick={reintentar}
        className="mt-5 h-12 px-6 rounded-xl bg-gradient-to-b from-ca-oro-claro to-ca-oro text-ca-vino-hondo font-extrabold shadow-md"
      >
        Intentar de nuevo
      </button>
    </section>
  )
}

export function ProyectoHechoResultado({ e, enProceso }: { e: EntradaVista; enProceso: boolean }) {
  const router = useRouter()
  const necesitaMuestra = !e.muestra
  const necesitaDocumento = e.pagado && !e.documento

  const muestra = useTarea('/api/empresarial/proyecto-hecho/muestra', e.proyectoId, necesitaMuestra)
  const formular = useTarea('/api/empresarial/proyecto-hecho/formular', e.proyectoId, necesitaDocumento)

  // Mientras Bold confirma el pago, se vuelve a leer cada pocos segundos.
  const esperandoPago = enProceso && !e.pagado
  useEffect(() => {
    if (!esperandoPago) return
    const t = setInterval(() => router.refresh(), 5000)
    return () => clearInterval(t)
  }, [esperandoPago, router])

  const volver = (
    <Link href="/empresarial" className="inline-flex items-center gap-2 text-sm text-ca-vino/75 hover:text-ca-vino-hondo print:hidden">
      <ArrowLeft className="h-4 w-4" /> Mis proyectos
    </Link>
  )

  let contenido: React.ReactNode

  if (necesitaMuestra) {
    contenido = muestra.error ? (
      <ConError mensaje={muestra.error} reintentar={muestra.reintentar} />
    ) : (
      <Esperando titulo="La IA está leyendo tu información" texto="Tarda cerca de un minuto. No cierres esta página." />
    )
  } else if (necesitaDocumento) {
    contenido = formular.error ? (
      <ConError mensaje={formular.error} reintentar={formular.reintentar} />
    ) : (
      <Esperando titulo="Pago recibido. La IA está formulando tu proyecto" texto="Tarda unos minutos. Te avisamos por correo cuando esté listo, y también queda aquí." />
    )
  } else if (e.documento) {
    contenido = (
      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="inline-flex items-center gap-2 rounded-full bg-ca-oro-claro px-3 py-1 text-xs font-bold uppercase tracking-wider text-ca-vino-hondo">
            <Check className="h-3.5 w-3.5" /> Proyecto entregado
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-ca-oro-claro to-ca-oro text-ca-vino-hondo font-extrabold shadow-md hover:shadow-lg"
          >
            <Printer className="h-4 w-4" /> Imprimir o guardar como PDF
          </button>
        </div>
        <article className={`mt-5 rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-6 md:p-10 leading-relaxed ${RELIEVE_TARJETA} [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:mb-6 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-extrabold [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_strong]:font-bold`}>
          <ReactMarkdown>{e.documento}</ReactMarkdown>
        </article>
        <p className="mt-4 text-xs text-ca-vino/75 print:hidden">
          Las cifras y supuestos marcados como &ldquo;por validar&rdquo; hay que confirmarlos antes de invertir dinero. Las herramientas del camino te ayudan a hacerlo.
        </p>
      </section>
    )
  } else if (esperandoPago) {
    contenido = <Esperando titulo="Confirmando tu pago con Bold" texto="En un momento queda confirmado y la IA empieza a formular tu proyecto." />
  } else if (e.muestra && e.precioBase && e.precioTotal) {
    const m = e.muestra
    contenido = (
      <section className="mt-8 space-y-6">
        <div className="text-center">
          <div className="text-sm font-bold uppercase tracking-[0.25em] text-ca-oro-texto">Tu adelanto gratis</div>
          <h1 className="mt-3 text-3xl font-extrabold text-balance">{m.nombre_sugerido || e.nombre}</h1>
        </div>

        <div className={`rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-6 ${RELIEVE_TARJETA}`}>
          <h2 className="text-lg font-extrabold">Qué entendió la IA</h2>
          <p className="mt-2">{m.resumen}</p>
          <h2 className="mt-5 text-lg font-extrabold">Por qué puede funcionar</h2>
          <p className="mt-2">{m.oportunidad}</p>
          {m.lo_que_falta.length > 0 && (
            <>
              <h2 className="mt-5 text-lg font-extrabold">Lo que resuelve tu proyecto completo</h2>
              <ul className="mt-2 space-y-2">
                {m.lo_que_falta.map((t) => (
                  <li key={t} className="flex gap-2">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-ca-oro-texto" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className={`rounded-2xl border border-ca-oro/60 bg-ca-suave p-6 text-center ${RELIEVE_TARJETA}`}>
          <h2 className="text-xl font-extrabold">Recibe tu proyecto formulado completo</h2>
          <p className="mt-2 text-sm text-ca-vino/80">
            Resumen ejecutivo, mercado, propuesta de valor, modelo de negocio, plan de arranque, DOFA, riesgos, visión financiera y metas. Pago único.
          </p>
          <div className="mt-4 text-sm text-ca-vino/80">{e.tramoNombre}</div>
          <div className="mt-1 text-3xl font-extrabold">{pesos(e.precioBase)} <span className="text-base font-semibold text-ca-vino/70">más IVA</span></div>
          <div className="mt-1 text-sm text-ca-vino/75">Total a pagar: {pesos(e.precioTotal)}</div>
          <div className="mt-5 max-w-sm mx-auto">
            <BotonPagoBold
              endpoint="/api/empresarial/proyecto-hecho/pagar"
              campoId="proyectoId"
              id={e.proyectoId}
              texto={`Pagar ${pesos(e.precioTotal)}`}
            />
          </div>
        </div>
      </section>
    )
  } else {
    contenido = <ConError mensaje="No pudimos mostrar tu proyecto. Recarga la página." reintentar={() => router.refresh()} />
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino">
      <div className="max-w-[820px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        {volver}
        {contenido}
      </div>
    </main>
  )
}
