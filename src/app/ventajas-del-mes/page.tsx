import React from 'react'
import Link from 'next/link'
import { headers } from 'next/headers'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { ArrowRight, CalendarDays, Share2 } from 'lucide-react'

/**
 * Página pública y gratuita: "Tus ventajas este mes".
 *
 * Muestra las convocatorias de la biblioteca que cierran este mes y las que
 * siguen abiertas todo el año. Está pensada para compartirla por enlace en
 * WhatsApp, historias, Instagram y LinkedIn. No lleva precios de Serving.
 */
export const dynamic = 'force-dynamic'
export const revalidate = 0

const TELEFONO_WHATSAPP = '573123335966'

const SOMBRA_TARJETA =
  'shadow-[0_1px_2px_rgba(20,5,10,0.28),0_8px_24px_-14px_rgba(20,5,10,0.55)]'

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

type Ficha = {
  id: string
  nombre: string | null
  entidad: string | null
  fecha_cierre: string | null
  abierta_todo_el_anio: boolean | null
  monto: string | null
}

function diaCorto(f: string) {
  return new Date(f + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })
}

function Tarjeta({ c, etiqueta }: { c: Ficha; etiqueta: string }) {
  return (
    <li className={`rounded-2xl border border-[#B08D57]/35 bg-gradient-to-b from-[#4C2032] to-[#3B1727] p-5 ${SOMBRA_TARJETA}`}>
      <p className="text-[15px] font-extrabold leading-snug text-[#F3E7DC]">
        {c.nombre || 'Convocatoria sin nombre'}
      </p>
      <p className="mt-0.5 text-[13px] text-[#F3E7DC]/60">{c.entidad || 'Entidad sin dato'}</p>
      <p className="mt-2 text-[13px] font-semibold text-[#E0B868]">{etiqueta}</p>
      {c.monto ? <p className="mt-0.5 text-[12.5px] text-[#F3E7DC]/65">Monto: {c.monto}</p> : null}
    </li>
  )
}

export default async function VentajasDelMesPage() {
  const hoy = new Date()
  const hoyTxt = hoy.toISOString().slice(0, 10)
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
  const finMesTxt = `${finMes.getFullYear()}-${String(finMes.getMonth() + 1).padStart(2, '0')}-${String(finMes.getDate()).padStart(2, '0')}`
  const nombreMes = MESES[hoy.getMonth()]

  const servicio = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  const columnas = 'id, nombre, entidad, fecha_cierre, abierta_todo_el_anio, monto'

  const [cierranEsteMes, abiertasTodoElAnio] = await Promise.all([
    servicio
      .from('biblioteca_convocatorias')
      .select(columnas)
      .gte('fecha_cierre', hoyTxt)
      .lte('fecha_cierre', finMesTxt)
      .order('fecha_cierre', { ascending: true })
      .limit(30),
    servicio
      .from('biblioteca_convocatorias')
      .select(columnas)
      .or('abierta_todo_el_anio.eq.true,estado_convocatoria.ilike.%todo el a%,tipo.eq.permanente')
      .order('nombre', { ascending: true })
      .limit(9),
  ])

  const cierres = ((cierranEsteMes.data || []) as Ficha[]).filter((c) => !c.abierta_todo_el_anio)
  const permanentes = (abiertasTodoElAnio.data || []) as Ficha[]

  // Enlace de esta misma página, para compartirla.
  const h = await headers()
  const host = h.get('x-forwarded-host') || h.get('host') || ''
  const protocolo = h.get('x-forwarded-proto') || 'https'
  const enlace = host ? `${protocolo}://${host}/ventajas-del-mes` : ''
  const textoCompartir = `Tus ventajas este mes: las convocatorias de ${nombreMes} que puedes aprovechar. ${enlace}`

  return (
    <main className="min-h-screen bg-[#54142B] text-[#F3E7DC]">
      <section className="relative overflow-hidden border-b-2 border-[#B08D57]/45 bg-gradient-to-r from-[#3B1727] via-[#2E0E1A] to-[#54142B]">
        <div className="mx-auto max-w-5xl px-5 py-14 lg:px-8 lg:py-20 text-center">
          <div className="mb-3 flex items-center justify-center gap-2.5">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#B08D57]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C9A46B]">
              Ventajas de {nombreMes}
            </span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#B08D57]" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Tus ventajas este mes</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#F3E7DC]/75 md:text-lg">
            Las convocatorias que Centinela encontró para ti: las que cierran en {nombreMes} y las que
            siguen abiertas todo el año. Mira cuál se ajusta a tu idea y empieza a prepararte con ventaja.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/diagnostico"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-gradient-to-b from-[#C9A46B] to-[#B08D57] px-6 text-sm font-semibold text-[#3A1420] shadow-lg"
            >
              Diagnóstico gratuito
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={`https://wa.me/${TELEFONO_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center rounded-lg border border-[#B08D57]/35 bg-[#3B1727] px-6 text-sm font-semibold text-[#F3E7DC] hover:bg-[#4C2032]"
            >
              Hablar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
        <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
          <CalendarDays className="h-6 w-6 text-[#C9A46B]" />
          Cierran en {nombreMes}
        </h2>
        {cierres.length > 0 ? (
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {cierres.map((c) => (
              <Tarjeta key={c.id} c={c} etiqueta={`Cierra el ${diaCorto(c.fecha_cierre as string)}`} />
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-[14px] text-[#F3E7DC]/70">
            Este mes todavía no tenemos fechas de cierre confirmadas. Mira las que siguen abiertas todo el año.
          </p>
        )}

        {permanentes.length > 0 ? (
          <>
            <h2 className="mt-12 text-2xl font-extrabold tracking-tight">Abiertas todo el año</h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {permanentes.map((c) => (
                <Tarjeta key={c.id} c={c} etiqueta="Abierta todo el año" />
              ))}
            </ul>
          </>
        ) : null}

        <div className={`mt-12 rounded-2xl border border-[#B08D57]/45 bg-gradient-to-r from-[#4C2032] to-[#3B1727] p-6 text-center ${SOMBRA_TARJETA}`}>
          <p className="flex items-center justify-center gap-2 text-[15px] font-extrabold">
            <Share2 className="h-4 w-4 text-[#C9A46B]" />
            Comparte estas ventajas
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(textoCompartir)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center rounded-lg bg-gradient-to-b from-[#C9A46B] to-[#B08D57] px-5 text-[13px] font-semibold text-[#3A1420]"
            >
              Por WhatsApp
            </a>
            {enlace ? (
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(enlace)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center rounded-lg border border-[#B08D57]/35 bg-[#3B1727] px-5 text-[13px] font-semibold hover:bg-[#4C2032]"
              >
                En LinkedIn
              </a>
            ) : null}
          </div>
          {enlace ? <p className="mt-3 break-all text-[12px] text-[#F3E7DC]/55">{enlace}</p> : null}
        </div>
      </section>
    </main>
  )
}
