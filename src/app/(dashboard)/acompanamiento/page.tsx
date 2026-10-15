import React from 'react'
import { HeartHandshake } from 'lucide-react'
import { contextoMiembro } from '@/lib/membresiasServicios'
import { AvisoMiembros } from '@/components/panel/AvisoMiembros'
import { PedirAcompanamiento } from '@/components/panel/ServiciosMiembroClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SOMBRA_TARJETA =
  'shadow-[0_1px_2px_rgba(20,5,10,0.28),0_8px_24px_-14px_rgba(20,5,10,0.55)]'

const ESTADOS: Record<string, string> = {
  pedida: 'Pedido: el equipo te propondrá fecha',
  agendada: 'Agendado',
  realizada: 'Realizado',
}

type Cita = { id: string; tema: string; estado: string; fecha_hora: string | null; enlace: string | null; nota_equipo: string | null; created_at: string }

export default async function AcompanamientoPage() {
  const ctx = await contextoMiembro()
  if (!ctx.vigente && !ctx.esEquipo) {
    return <AvisoMiembros titulo="Acompañamiento semanal" texto="Con la membresía Arquitecto tienes un encuentro cada semana con el equipo de Serving para avanzar en tus proyectos." />
  }
  if (!ctx.servicios.acompanamientoSemanal) {
    return <AvisoMiembros titulo="Acompañamiento semanal" texto="El acompañamiento de una vez por semana está incluido en el nivel Arquitecto." boton="Ver los niveles" />
  }

  const { data } = await ctx.servicio
    .from('membresias_acompanamiento')
    .select('id, tema, estado, fecha_hora, enlace, nota_equipo, created_at')
    .ilike('correo_cliente', ctx.correo)
    .order('created_at', { ascending: false })
    .limit(30)
  const citas = (data || []) as Cita[]
  const hayPendiente = citas.some((c) => c.estado === 'pedida' || c.estado === 'agendada')

  return (
    <div className="min-h-full bg-[#54142B] px-4 py-6 lg:px-6">
      <header className="mb-5">
        <h1 className="flex items-center gap-2 text-[19px] font-extrabold tracking-tight text-[#F3E7DC]">
          <HeartHandshake className="h-5 w-5 text-[#C9A46B]" />
          Acompañamiento semanal
        </h1>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[#F3E7DC]/60">
          Un encuentro por semana con el equipo de Serving. Cuéntanos el tema y te confirmamos la fecha.
        </p>
      </header>

      <section className={`mb-5 rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-5 ${SOMBRA_TARJETA}`}>
        <PedirAcompanamiento bloqueado={hayPendiente && !ctx.esEquipo} />
      </section>

      {citas.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-[15px] font-extrabold text-[#E0B868]">Mis encuentros</h2>
          {citas.map((c) => (
            <article key={c.id} className={`rounded-2xl border border-[#B08D57]/25 bg-[#4C2032] p-4 ${SOMBRA_TARJETA}`}>
              <p className="text-[13px] font-extrabold text-[#E0B868]">{ESTADOS[c.estado] || c.estado}</p>
              <p className="mt-1 text-[13.5px] text-[#F3E7DC]/85">{c.tema}</p>
              {c.fecha_hora && (
                <p className="mt-1 text-[12.5px] text-[#F3E7DC]/70">
                  {new Date(c.fecha_hora).toLocaleString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' })} (hora de Colombia)
                </p>
              )}
              {c.enlace && c.estado === 'agendada' && (
                <a href={c.enlace} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-[13px] font-bold text-[#C9A46B] underline">Entrar al encuentro</a>
              )}
              {c.nota_equipo && <p className="mt-1 text-[12.5px] text-[#F3E7DC]/60">Del equipo: {c.nota_equipo}</p>}
            </article>
          ))}
        </section>
      )}
    </div>
  )
}
