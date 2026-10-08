import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Target } from 'lucide-react'
import { membresiaVigente } from '@/lib/membresiasConsumo'
import { resumenDeUso } from '@/lib/membresiasUso'
import { AbrirConvocatoriaMes } from '@/components/panel/AbrirConvocatoriaMes'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SOMBRA_TARJETA =
  'shadow-[0_1px_2px_rgba(20,5,10,0.28),0_8px_24px_-14px_rgba(20,5,10,0.55)]'

type Ficha = {
  id: string
  nombre: string | null
  entidad: string | null
  fecha_cierre: string | null
  fecha_cierre_texto: string | null
  monto: string | null
  linea_tematica: string | null
  territorio: string | null
  requisitos: string | null
  mecanismo_postulacion: string | null
  fuente_oficial: string | null
}

function fechaCorta(f: string | null, texto: string | null) {
  if (f) return new Date(f + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
  return texto || 'Sin fecha'
}

export default async function ConvocatoriasDelMesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const correo = (user?.email || '').toLowerCase()

  const servicio = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { vigente } = correo ? await membresiaVigente(servicio, correo) : { vigente: undefined }

  if (!vigente) {
    return (
      <div className="min-h-full bg-[#54142B] px-4 py-6 lg:px-6">
        <h1 className="text-[19px] font-extrabold tracking-tight text-[#F3E7DC]">Convocatorias del mes</h1>
        <div className={`mx-auto mt-6 max-w-xl rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-8 text-center ${SOMBRA_TARJETA}`}>
          <h2 className="text-[15px] font-extrabold text-[#F3E7DC]">Esta sección es para miembros</h2>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-[#F3E7DC]/60">
            Con una membresía activa ves cada mes las convocatorias abiertas y abres la ficha completa de las que te interesan.
          </p>
          <Link href="/membresia" className="mt-4 inline-flex rounded-xl bg-[#C9A46B] px-4 py-2.5 text-[13px] font-bold text-[#3B1727]">
            Ver las membresías
          </Link>
        </div>
      </div>
    )
  }

  const uso = await resumenDeUso(servicio, vigente)
  const linea = uso.lineas.find((l) => l.clave === 'convocatorias')
  const limite = linea?.limite ?? 0
  const restante = linea?.restante ?? null
  const sinCupo = restante !== null && restante <= 0

  const { data: abiertasMes } = await servicio
    .from('membresias_consumos')
    .select('nota')
    .eq('membresia_id', vigente.id)
    .eq('beneficio', 'convocatorias')
    .gte('created_at', uso.desde.toISOString())
    .lt('created_at', uso.hasta.toISOString())
  const abiertas = new Set(
    (abiertasMes || [])
      .map((f: { nota: string | null }) => f.nota || '')
      .filter((n: string) => n.startsWith('conv:'))
      .map((n: string) => n.slice(5)),
  )

  const hoy = new Date().toISOString().slice(0, 10)
  const { data: fichas } = await servicio
    .from('biblioteca_convocatorias')
    .select('id, nombre, entidad, fecha_cierre, fecha_cierre_texto, monto, linea_tematica, territorio, requisitos, mecanismo_postulacion, fuente_oficial')
    .or(`fecha_cierre.is.null,fecha_cierre.gte.${hoy}`)
    .order('fecha_cierre', { ascending: true, nullsFirst: false })
    .limit(60)
  const lista = (fichas || []) as Ficha[]

  return (
    <div className="min-h-full bg-[#54142B] px-4 py-6 lg:px-6">
      <header className="mb-5">
        <h1 className="text-[19px] font-extrabold tracking-tight text-[#F3E7DC]">Convocatorias del mes</h1>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[#F3E7DC]/60">
          {limite === 0
            ? 'Tu nivel no incluye abrir fichas de convocatorias.'
            : restante === null
              ? 'Tu nivel no tiene límite: abre todas las fichas que quieras.'
              : `Este mes puedes abrir ${limite} fichas completas. Te quedan ${restante}. Se renuevan el ${uso.hasta.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}.`}
        </p>
      </header>

      {lista.length === 0 ? (
        <p className="text-[13.5px] text-[#F3E7DC]/60">Todavía no hay convocatorias abiertas en la biblioteca.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {lista.map((c) => {
            const abierta = abiertas.has(c.id)
            return (
              <article key={c.id} className={`rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-5 ${SOMBRA_TARJETA}`}>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C9A46B]/15 text-[#C9A46B]">
                    <Target className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-[14.5px] font-extrabold text-[#F3E7DC]">{c.nombre}</h2>
                    <p className="text-[12.5px] text-[#F3E7DC]/55">{c.entidad || 'Entidad sin dato'}</p>
                    <p className="mt-1 text-[12.5px] font-semibold text-[#E0B868]">Cierra: {fechaCorta(c.fecha_cierre, c.fecha_cierre_texto)}</p>
                  </div>
                </div>

                {abierta ? (
                  <dl className="mt-3 space-y-1.5 text-[13px] text-[#F3E7DC]/75">
                    {c.monto && <div><dt className="inline font-bold text-[#F3E7DC]">Monto: </dt><dd className="inline">{c.monto}</dd></div>}
                    {c.territorio && <div><dt className="inline font-bold text-[#F3E7DC]">Territorio: </dt><dd className="inline">{c.territorio}</dd></div>}
                    {c.linea_tematica && <div><dt className="inline font-bold text-[#F3E7DC]">Línea temática: </dt><dd className="inline">{c.linea_tematica}</dd></div>}
                    {c.requisitos && <div><dt className="inline font-bold text-[#F3E7DC]">Requisitos: </dt><dd className="inline">{c.requisitos}</dd></div>}
                    {c.mecanismo_postulacion && <div><dt className="inline font-bold text-[#F3E7DC]">Cómo se postula: </dt><dd className="inline">{c.mecanismo_postulacion}</dd></div>}
                    {c.fuente_oficial && (
                      <div>
                        <a href={c.fuente_oficial} target="_blank" rel="noopener noreferrer" className="font-bold text-[#C9A46B] underline">
                          Ver la convocatoria oficial
                        </a>
                      </div>
                    )}
                  </dl>
                ) : (
                  limite !== 0 && <AbrirConvocatoriaMes convocatoriaId={c.id} sinCupo={sinCupo} />
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
