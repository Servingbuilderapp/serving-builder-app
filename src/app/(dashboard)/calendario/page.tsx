import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { CalendarDays } from 'lucide-react'
import { membresiaVigente } from '@/lib/membresiasConsumo'
import { esEquipoServing } from '@/lib/guardiaEquipo'
import { Ayuda } from '@/components/ui/Ayuda'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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
  fecha_cierre_texto: string | null
  abierta_todo_el_anio: boolean | null
  mes_apertura_tipico: number | null
  monto: string | null
}

function diaCorto(f: string) {
  return new Date(f + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })
}

function Tarjeta({ c, etiqueta }: { c: Ficha; etiqueta: string }) {
  return (
    <li className={`rounded-xl border border-[#B08D57]/30 bg-[#4C2032] p-3.5 ${SOMBRA_TARJETA}`}>
      <p className="text-[13.5px] font-extrabold text-[#F3E7DC]">{c.nombre || 'Convocatoria sin nombre'}</p>
      <p className="text-[12.5px] text-[#F3E7DC]/55">{c.entidad || 'Entidad sin dato'}</p>
      <p className="mt-1 text-[12.5px] font-semibold text-[#E0B868]">{etiqueta}</p>
      {c.monto ? <p className="mt-0.5 text-[12px] text-[#F3E7DC]/60">Monto: {c.monto}</p> : null}
    </li>
  )
}

export default async function CalendarioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const correo = (user?.email || '').toLowerCase()

  const servicio = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { vigente } = correo ? await membresiaVigente(servicio, correo) : { vigente: undefined }
  const esEquipo = await esEquipoServing()

  if (!vigente && !esEquipo) {
    return (
      <div className="min-h-full bg-[#54142B] px-4 py-6 lg:px-6">
        <h1 className="text-[19px] font-extrabold tracking-tight text-[#F3E7DC]">Calendario de convocatorias</h1>
        <div className={`mx-auto mt-6 max-w-xl rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-8 text-center ${SOMBRA_TARJETA}`}>
          <h2 className="text-[15px] font-extrabold text-[#F3E7DC]">Esta sección es para miembros</h2>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-[#F3E7DC]/60">
            Con una membresía activa ves mes a mes cuándo cierran las convocatorias y cuándo suelen abrir.
          </p>
          <Link href="/membresia" className="mt-4 inline-flex rounded-xl bg-[#C9A46B] px-4 py-2.5 text-[13px] font-bold text-[#3B1727]">
            Ver las membresías
          </Link>
        </div>
      </div>
    )
  }

  const hoy = new Date()
  const hoyTxt = hoy.toISOString().slice(0, 10)
  const limite = new Date(hoy)
  limite.setFullYear(limite.getFullYear() + 1)
  const limiteTxt = limite.toISOString().slice(0, 10)

  const columnas = 'id, nombre, entidad, fecha_cierre, fecha_cierre_texto, abierta_todo_el_anio, mes_apertura_tipico, monto'

  const [conCierre, todoElAnio, tipicas] = await Promise.all([
    servicio
      .from('biblioteca_convocatorias')
      .select(columnas)
      .gte('fecha_cierre', hoyTxt)
      .lte('fecha_cierre', limiteTxt)
      .order('fecha_cierre', { ascending: true })
      .limit(400),
    servicio
      .from('biblioteca_convocatorias')
      .select(columnas)
      .or('abierta_todo_el_anio.eq.true,estado_convocatoria.ilike.%todo el a%,tipo.eq.permanente')
      .order('nombre', { ascending: true })
      .limit(200),
    servicio
      .from('biblioteca_convocatorias')
      .select(columnas)
      .eq('abierta_todo_el_anio', false)
      .not('mes_apertura_tipico', 'is', null)
      .order('mes_apertura_tipico', { ascending: true })
      .limit(400),
  ])

  const cierres = ((conCierre.data || []) as Ficha[]).filter((c) => !c.abierta_todo_el_anio)
  const permanentes = (todoElAnio.data || []) as Ficha[]
  // "Suelen abrir": las que no tienen un cierre próximo ya listado arriba.
  const idsConCierre = new Set(cierres.map((c) => c.id))
  const suelenAbrir = ((tipicas.data || []) as Ficha[]).filter((c) => !idsConCierre.has(c.id))

  // Próximos 12 meses, empezando por el mes actual.
  const meses = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() + i, 1)
    return { anio: d.getFullYear(), mes: d.getMonth() }
  })
  const porMes = meses.map(({ anio, mes }) => ({
    anio,
    mes,
    items: cierres.filter((c) => {
      const d = new Date((c.fecha_cierre as string) + 'T12:00:00')
      return d.getFullYear() === anio && d.getMonth() === mes
    }),
  }))

  const porMesTipico = Array.from({ length: 12 }, (_, i) => ({
    mes: i,
    items: suelenAbrir.filter((c) => c.mes_apertura_tipico === i + 1),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="min-h-full bg-[#54142B] px-4 py-6 lg:px-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-[19px] font-extrabold tracking-tight text-[#F3E7DC]">
          <CalendarDays className="h-5 w-5 text-[#C9A46B]" />
          <Ayuda clave="panel.calendario" claro={false}>Calendario de convocatorias</Ayuda>
        </h1>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[#F3E7DC]/60">
          Los próximos 12 meses: qué cierra en cada uno, cuáles están abiertas todo el año y cuáles suelen abrir en ciertos meses.
        </p>
      </header>

      <section className="mb-8">
        <h2 className="mb-3 text-[15px] font-extrabold text-[#E0B868]">Cierres mes a mes</h2>
        <div className="grid items-start gap-4 lg:grid-cols-2">
          {porMes.map(({ anio, mes, items }) => (
            <div key={`${anio}-${mes}`} className={`rounded-2xl border border-[#B08D57]/35 bg-[#3B1727] p-4 ${SOMBRA_TARJETA}`}>
              <h3 className="mb-2 text-[14px] font-extrabold text-[#F3E7DC]">
                <span className="capitalize">{MESES[mes]}</span> {anio}
                <span className="ml-2 text-[12px] font-semibold text-[#F3E7DC]/45">
                  {items.length === 0 ? 'sin cierres' : `${items.length} ${items.length === 1 ? 'cierre' : 'cierres'}`}
                </span>
              </h3>
              {items.length > 0 && (
                <ul className="space-y-2">
                  {items.map((c) => (
                    <Tarjeta key={c.id} c={c} etiqueta={`Cierra el ${diaCorto(c.fecha_cierre as string)}`} />
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-1 text-[15px] font-extrabold text-[#E0B868]">Abiertas todo el año</h2>
        <p className="mb-3 text-[12.5px] text-[#F3E7DC]/55">Puedes postular en cualquier momento.</p>
        {permanentes.length === 0 ? (
          <p className="text-[13px] text-[#F3E7DC]/55">Todavía no hay convocatorias de este tipo en la biblioteca.</p>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {permanentes.map((c) => (
              <Tarjeta key={c.id} c={c} etiqueta="Abierta todo el año" />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-1 text-[15px] font-extrabold text-[#E0B868]">Suelen abrir en estos meses</h2>
        <p className="mb-3 text-[12.5px] text-[#F3E7DC]/55">Por lo que se ha visto en años anteriores; la fecha exacta puede cambiar.</p>
        {porMesTipico.length === 0 ? (
          <p className="text-[13px] text-[#F3E7DC]/55">Todavía no hay meses típicos registrados.</p>
        ) : (
          <div className="space-y-4">
            {porMesTipico.map(({ mes, items }) => (
              <div key={mes}>
                <h3 className="mb-2 text-[13.5px] font-extrabold capitalize text-[#F3E7DC]">{MESES[mes]}</h3>
                <ul className="grid gap-3 lg:grid-cols-2">
                  {items.map((c) => (
                    <Tarjeta key={c.id} c={c} etiqueta={`Suele abrir en ${MESES[mes]}`} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
