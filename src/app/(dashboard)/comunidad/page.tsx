import React from 'react'
import { Users } from 'lucide-react'
import { contextoMiembro } from '@/lib/membresiasServicios'
import { AvisoMiembros } from '@/components/panel/AvisoMiembros'
import { PublicarComunidad } from '@/components/panel/ServiciosMiembroClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SOMBRA_TARJETA =
  'shadow-[0_1px_2px_rgba(20,5,10,0.28),0_8px_24px_-14px_rgba(20,5,10,0.55)]'

type Mensaje = { id: string; nombre: string; texto: string; created_at: string }

export default async function ComunidadPage() {
  const ctx = await contextoMiembro()
  if (!ctx.vigente && !ctx.esEquipo) {
    return <AvisoMiembros titulo="Comunidad" texto="Con la membresía Arquitecto entras a la comunidad de miembros de Serving para compartir y resolver dudas." />
  }
  if (!ctx.servicios.comunidad) {
    return <AvisoMiembros titulo="Comunidad" texto="La comunidad está incluida en el nivel Arquitecto." boton="Ver los niveles" />
  }

  const { data } = await ctx.servicio
    .from('membresias_comunidad_mensajes')
    .select('id, nombre, texto, created_at')
    .order('created_at', { ascending: false })
    .limit(60)
  const mensajes = (data || []) as Mensaje[]

  return (
    <div className="min-h-full bg-[#54142B] px-4 py-6 lg:px-6">
      <header className="mb-5">
        <h1 className="flex items-center gap-2 text-[19px] font-extrabold tracking-tight text-[#F3E7DC]">
          <Users className="h-5 w-5 text-[#C9A46B]" />
          Comunidad
        </h1>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[#F3E7DC]/60">
          El espacio de los miembros Arquitecto. Comparte preguntas, avances y aprendizajes.
        </p>
      </header>

      <section className={`mb-5 rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-5 ${SOMBRA_TARJETA}`}>
        <PublicarComunidad />
      </section>

      {mensajes.length === 0 ? (
        <p className="text-[13.5px] text-[#F3E7DC]/60">Todavía no hay mensajes. Escribe el primero.</p>
      ) : (
        <div className="space-y-3">
          {mensajes.map((m) => (
            <article key={m.id} className={`rounded-2xl border border-[#B08D57]/25 bg-[#4C2032] p-4 ${SOMBRA_TARJETA}`}>
              <p className="text-[13px] font-extrabold text-[#E0B868]">
                {m.nombre}{' '}
                <span className="font-normal text-[#F3E7DC]/45">
                  · {new Date(m.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}
                </span>
              </p>
              <p className="mt-1 whitespace-pre-wrap text-[13.5px] text-[#F3E7DC]/85">{m.texto}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
