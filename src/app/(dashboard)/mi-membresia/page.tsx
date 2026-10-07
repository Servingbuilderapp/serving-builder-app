import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Crown } from 'lucide-react'
import { nivelPorSlug } from '@/lib/membresias'
import { resumenDeUso } from '@/lib/membresiasUso'
import { BeneficiosMes } from '@/components/panel/BeneficiosMes'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SOMBRA_TARJETA =
  'shadow-[0_1px_2px_rgba(20,5,10,0.28),0_8px_24px_-14px_rgba(20,5,10,0.55)]'

function fechaLarga(d: Date | string) {
  return new Date(d).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}

function diasHasta(fecha: string | null): number | null {
  if (!fecha) return null
  return Math.ceil((new Date(fecha).getTime() - Date.now()) / 86400000)
}

export default async function MiMembresiaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const correo = (user?.email || '').toLowerCase()

  // Llave de servicio: la tabla tiene el candado activado. Se filtra por el correo del propio usuario.
  const servicio = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  const { data: filas } = await servicio
    .from('membresias_clientes')
    .select('id, nivel, ciclo, estado, fecha_inicio, fecha_proximo_pago')
    .ilike('correo_cliente', correo)
    .order('created_at', { ascending: false })

  const membresia = (filas || []).find((m) => m.estado === 'activa') || (filas || [])[0]
  const nivel = membresia ? nivelPorSlug(membresia.nivel) : undefined

  if (!membresia || !nivel) {
    return (
      <div className="min-h-full bg-[#54142B] px-4 py-6 lg:px-6">
        <h1 className="text-[19px] font-extrabold tracking-tight text-[#F3E7DC]">Mi membresía</h1>
        <div className={`mx-auto mt-6 max-w-xl rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-8 text-center ${SOMBRA_TARJETA}`}>
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#C9A46B]/15 text-[#C9A46B]">
            <Crown className="h-5 w-5" />
          </span>
          <h2 className="mt-3 text-[15px] font-extrabold text-[#F3E7DC]">Todavía no tienes una membresía</h2>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-[#F3E7DC]/60">
            Elige el nivel que va contigo: Explorador, Constructor o Arquitecto.
          </p>
          <Link href="/membresia" className="mt-4 inline-flex rounded-xl bg-[#C9A46B] px-4 py-2.5 text-[13px] font-bold text-[#3B1727]">
            Ver las membresías
          </Link>
        </div>
      </div>
    )
  }

  const activa = membresia.estado === 'activa'
  const dias = diasHasta(membresia.fecha_proximo_pago)
  const uso = activa ? await resumenDeUso(servicio, membresia) : null

  let estadoTexto = 'Pendiente de pago'
  let estadoClase = 'bg-[#C99A3D]/15 text-[#E0B868]'
  if (activa) {
    estadoTexto = dias !== null && dias < 0 ? 'Vencida' : 'Activa'
    estadoClase = dias !== null && dias < 0 ? 'bg-[#C0604A]/20 text-[#E0917E]' : 'bg-[#7A8B6F]/20 text-[#9BB18D]'
  } else if (membresia.estado === 'vencida') {
    estadoTexto = 'Vencida'
    estadoClase = 'bg-[#C0604A]/20 text-[#E0917E]'
  } else if (membresia.estado === 'cancelada') {
    estadoTexto = 'Cancelada'
    estadoClase = 'bg-[#F3E7DC]/10 text-[#F3E7DC]/60'
  }

  return (
    <div className="min-h-full bg-[#54142B] px-4 py-6 lg:px-6">
      <header className="mb-5">
        <h1 className="text-[19px] font-extrabold tracking-tight text-[#F3E7DC]">Mi membresía</h1>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[#F3E7DC]/60">
          Tu nivel, hasta cuándo está activo y cuánto te queda este mes de cada beneficio.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={`rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-5 ${SOMBRA_TARJETA}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C9A46B]/15 text-[#C9A46B]">
                <Crown className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#F3E7DC]/45">Tu nivel</p>
                <h2 className="text-[18px] font-extrabold text-[#F3E7DC]">{nivel.nombre}</h2>
              </div>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${estadoClase}`}>{estadoTexto}</span>
          </div>
          <p className="mt-3 text-[13.5px] leading-relaxed text-[#F3E7DC]/65">{nivel.resumen}</p>

          <dl className="mt-4 space-y-2 text-[13.5px]">
            <div className="flex justify-between gap-3">
              <dt className="text-[#F3E7DC]/55">Pago</dt>
              <dd className="font-semibold text-[#F3E7DC] capitalize">{membresia.ciclo}</dd>
            </div>
            {activa && membresia.fecha_proximo_pago && (
              <div className="flex justify-between gap-3">
                <dt className="text-[#F3E7DC]/55">Vence el</dt>
                <dd className="font-semibold text-[#F3E7DC]">
                  {fechaLarga(membresia.fecha_proximo_pago)}
                  {dias !== null && dias >= 0 && <span className="ml-2 text-[#F3E7DC]/55">({dias} días)</span>}
                </dd>
              </div>
            )}
          </dl>

          {activa && dias !== null && dias <= 7 && (
            <p className="mt-4 rounded-xl bg-[#C99A3D]/15 px-3 py-2 text-[13px] text-[#E0B868]">
              {dias < 0
                ? 'Tu membresía ya venció. Para renovarla, vuelve a hacer el pago.'
                : 'Tu membresía vence pronto. Para seguir sin interrupción, renueva el pago.'}{' '}
              <Link href="/membresia" className="font-bold underline">Renovar</Link>
            </p>
          )}
          {!activa && membresia.estado === 'pendiente_pago' && (
            <p className="mt-4 rounded-xl bg-[#C99A3D]/15 px-3 py-2 text-[13px] text-[#E0B868]">
              Estamos esperando tu pago. Cuando lo confirmemos, aquí verás tus beneficios.
            </p>
          )}
        </section>

        <section className={`rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-5 ${SOMBRA_TARJETA}`}>
          <h2 className="text-[15px] font-extrabold text-[#F3E7DC]">Tus beneficios de este mes</h2>
          {uso ? (
            <>
              <p className="mt-1 mb-4 text-[12.5px] text-[#F3E7DC]/55">
                Se renuevan el {fechaLarga(uso.hasta)}.
              </p>
              <BeneficiosMes lineas={uso.lineas} />
            </>
          ) : (
            <p className="mt-2 text-[13.5px] text-[#F3E7DC]/60">
              Los beneficios se activan cuando tu pago esté confirmado.
            </p>
          )}
        </section>
      </div>

      <section className={`mt-4 rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-5 ${SOMBRA_TARJETA}`}>
        <h2 className="text-[15px] font-extrabold text-[#F3E7DC]">Todo lo que incluye tu nivel</h2>
        <ul className="mt-3 grid gap-x-6 gap-y-1.5 text-[13.5px] text-[#F3E7DC]/75 sm:grid-cols-2">
          {nivel.incluye.map((x) => (
            <li key={x} className="flex gap-2"><span className="text-[#C9A46B]">•</span>{x}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
