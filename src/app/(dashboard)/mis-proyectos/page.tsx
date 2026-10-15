import React from 'react'
import Link from 'next/link'
import { FolderKanban } from 'lucide-react'
import { resumenDeUso } from '@/lib/membresiasUso'
import { contextoMiembro } from '@/lib/membresiasServicios'
import { AvisoMiembros } from '@/components/panel/AvisoMiembros'
import { NuevoProyectoMembresia } from '@/components/panel/NuevoProyectoMembresia'
import { porcentajeProyecto, type RespuestasProyecto } from '@/lib/miProyectoPasos'
import { Ayuda } from '@/components/ui/Ayuda'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SOMBRA_TARJETA =
  'shadow-[0_1px_2px_rgba(20,5,10,0.28),0_8px_24px_-14px_rgba(20,5,10,0.55)]'

type Proyecto = { id: string; nombre: string; estado: string; respuestas: RespuestasProyecto; created_at: string }

export default async function MisProyectosPage() {
  const ctx = await contextoMiembro()
  if (!ctx.vigente && !ctx.esEquipo) {
    return (
      <AvisoMiembros
        titulo="Mis proyectos"
        texto="Con una membresía activa estructuras tus propios proyectos, paso a paso, y cuando están listos pides que los postulemos."
      />
    )
  }

  const uso = ctx.vigente ? await resumenDeUso(ctx.servicio, ctx.vigente) : null
  const linea = uso?.lineas.find((l) => l.clave === 'proyecto_minimo')
  const limite = ctx.esEquipo ? null : (linea?.limite ?? 0)
  const restante = ctx.esEquipo ? null : (linea?.restante ?? null)
  const sinCupo = !ctx.esEquipo && (limite === 0 || (restante !== null && restante <= 0))

  const [{ data: proyectos }, { data: postulaciones }] = await Promise.all([
    ctx.servicio.from('membresias_proyectos').select('id, nombre, estado, respuestas, created_at').ilike('correo_cliente', ctx.correo).order('created_at', { ascending: false }).limit(50),
    ctx.servicio.from('membresias_postulaciones').select('proyecto_id, estado').ilike('correo_cliente', ctx.correo),
  ])
  const estadoPost = new Map(((postulaciones || []) as { proyecto_id: string; estado: string }[]).map((p) => [p.proyecto_id, p.estado]))
  const TEXTO_POST: Record<string, string> = {
    solicitada: 'Postulación solicitada',
    en_revision: 'En revisión por el equipo',
    postulada: 'Postulada',
    no_viable: 'El equipo te escribirá',
  }

  return (
    <div className="min-h-full bg-[#54142B] px-4 py-6 lg:px-6">
      <header className="mb-5">
        <h1 className="flex items-center gap-2 text-[19px] font-extrabold tracking-tight text-[#F3E7DC]">
          <FolderKanban className="h-5 w-5 text-[#C9A46B]" />
          <Ayuda clave="panel.mis_proyectos" claro={false}>Mis proyectos</Ayuda>
        </h1>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[#F3E7DC]/60">
          {ctx.esEquipo
            ? 'Vista de administrador: puedes probar sin membresía y sin gastar cupo.'
            : restante === null
              ? 'Tu nivel no tiene límite de proyectos este mes.'
              : `Este mes puedes estructurar ${limite} ${limite === 1 ? 'proyecto' : 'proyectos'}. Te quedan ${restante}. Se renuevan el ${uso?.hasta.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}.`}
        </p>
        <p className="mt-1 max-w-2xl text-[13px] text-[#F3E7DC]/50">
          Tú llenas tu proyecto, paso a paso, con tus propias palabras. Cuando lo termines, pides que lo postulemos a la convocatoria que elijas. Si ganas, el 10 % es para Serving.
        </p>
      </header>

      <section className={`rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-5 ${SOMBRA_TARJETA}`}>
        <NuevoProyectoMembresia sinCupo={sinCupo} />
      </section>

      {proyectos && proyectos.length > 0 && (
        <section className="mt-5 grid items-start gap-3 lg:grid-cols-2">
          {(proyectos as Proyecto[]).map((p) => (
            <Link key={p.id} href={`/mis-proyectos/${p.id}`} className={`block rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-4 hover:brightness-110 ${SOMBRA_TARJETA}`}>
              <p className="text-[14.5px] font-extrabold text-[#F3E7DC]">{p.respuestas?.titulo_elegido?.trim() || p.nombre}</p>
              <p className="mt-1 text-[12.5px] text-[#F3E7DC]/55">
                {p.estado === 'terminado' ? 'Terminado' : `En proceso · ${porcentajeProyecto(p.respuestas || {})} %`}
                {estadoPost.get(p.id) ? ` · ${TEXTO_POST[estadoPost.get(p.id) as string] || ''}` : ''}
              </p>
              <p className="mt-1 text-[12px] text-[#F3E7DC]/40">Creado el {new Date(p.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}</p>
            </Link>
          ))}
        </section>
      )}
    </div>
  )
}
