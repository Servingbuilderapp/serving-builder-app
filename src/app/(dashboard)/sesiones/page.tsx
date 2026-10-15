import React from 'react'
import { CalendarClock } from 'lucide-react'
import { contextoMiembro } from '@/lib/membresiasServicios'
import { AvisoMiembros } from '@/components/panel/AvisoMiembros'
import { ReservarSesion } from '@/components/panel/ServiciosMiembroClient'
import { periodoMensual } from '@/lib/membresiasUso'
import { Ayuda } from '@/components/ui/Ayuda'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SOMBRA_TARJETA =
  'shadow-[0_1px_2px_rgba(20,5,10,0.28),0_8px_24px_-14px_rgba(20,5,10,0.55)]'

type Sesion = { id: string; titulo: string; descripcion: string | null; fecha_hora: string; enlace: string | null }

export default async function SesionesPage() {
  const ctx = await contextoMiembro()
  if (!ctx.vigente && !ctx.esEquipo) {
    return <AvisoMiembros titulo="Sesiones grupales" texto="Con una membresía Constructor o Arquitecto participas en sesiones grupales en vivo con el equipo de Serving." />
  }
  if (ctx.servicios.sesionesPorMes === 0) {
    return <AvisoMiembros titulo="Sesiones grupales" texto="Las sesiones grupales están incluidas desde el nivel Constructor." boton="Ver los niveles" />
  }

  const ahora = new Date().toISOString()
  const [{ data: sesiones }, { data: mias }] = await Promise.all([
    ctx.servicio.from('membresias_sesiones').select('id, titulo, descripcion, fecha_hora, enlace').gte('fecha_hora', ahora).order('fecha_hora', { ascending: true }).limit(30),
    ctx.servicio.from('membresias_sesiones_inscritos').select('sesion_id').ilike('correo_cliente', ctx.correo),
  ])
  const inscritas = new Set((mias || []).map((m: { sesion_id: string }) => m.sesion_id))
  const lista = (sesiones || []) as Sesion[]

  let reservadasMes = 0
  if (!ctx.esEquipo) {
    const { desde, hasta } = periodoMensual(ctx.vigente?.fecha_inicio ?? null)
    reservadasMes = lista.filter((s) => inscritas.has(s.id) && new Date(s.fecha_hora) >= desde && new Date(s.fecha_hora) < hasta).length
  }
  const sinCupo = !ctx.esEquipo && reservadasMes >= ctx.servicios.sesionesPorMes

  return (
    <div className="min-h-full bg-[#54142B] px-4 py-6 lg:px-6">
      <header className="mb-5">
        <h1 className="flex items-center gap-2 text-[19px] font-extrabold tracking-tight text-[#F3E7DC]">
          <CalendarClock className="h-5 w-5 text-[#C9A46B]" />
          <Ayuda clave="panel.sesiones" claro={false}>Sesiones grupales</Ayuda>
        </h1>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[#F3E7DC]/60">
          {ctx.esEquipo ? 'Vista de administrador.' : `Tu nivel incluye ${ctx.servicios.sesionesPorMes} ${ctx.servicios.sesionesPorMes === 1 ? 'sesión' : 'sesiones'} al mes. Este mes has reservado ${reservadasMes}.`}
        </p>
      </header>

      {lista.length === 0 ? (
        <p className="text-[13.5px] text-[#F3E7DC]/60">Todavía no hay sesiones programadas. Apenas el equipo publique la próxima, la verás aquí.</p>
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-2">
          {lista.map((s) => {
            const inscrito = inscritas.has(s.id)
            return (
              <article key={s.id} className={`rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-5 ${SOMBRA_TARJETA}`}>
                <h2 className="text-[14.5px] font-extrabold text-[#F3E7DC]">{s.titulo}</h2>
                <p className="mt-1 text-[12.5px] font-semibold text-[#E0B868]">
                  {new Date(s.fecha_hora).toLocaleString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' })} (hora de Colombia)
                </p>
                {s.descripcion && <p className="mt-2 text-[13px] text-[#F3E7DC]/70">{s.descripcion}</p>}
                {inscrito && s.enlace && (
                  <a href={s.enlace} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[13px] font-bold text-[#C9A46B] underline">
                    Entrar a la sesión
                  </a>
                )}
                <div className="mt-3">
                  <ReservarSesion sesionId={s.id} inscrito={inscrito} sinCupo={sinCupo} />
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
