import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { contextoMiembro } from '@/lib/membresiasServicios'
import { AvisoMiembros } from '@/components/panel/AvisoMiembros'
import { EditorProyectoMembresia } from '@/components/panel/EditorProyectoMembresia'
import { PostularProyecto } from '@/components/panel/PostularProyecto'
import type { RespuestasProyecto } from '@/lib/miProyectoPasos'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SOMBRA_TARJETA =
  'shadow-[0_1px_2px_rgba(20,5,10,0.28),0_8px_24px_-14px_rgba(20,5,10,0.55)]'

const ESTADOS: Record<string, string> = {
  solicitada: 'Solicitada: el equipo la va a revisar',
  en_revision: 'En revisión por el equipo',
  postulada: 'Postulada',
  no_viable: 'El equipo te escribirá: no era viable para esa convocatoria',
}

export default async function ProyectoMembresiaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await contextoMiembro()
  if (!ctx.vigente && !ctx.esEquipo) {
    return <AvisoMiembros titulo="Mis proyectos" texto="Con una membresía activa estructuras tus propios proyectos." />
  }

  const { data: proyecto } = await ctx.servicio
    .from('membresias_proyectos')
    .select('id, nombre, estado, respuestas')
    .eq('id', id)
    .ilike('correo_cliente', ctx.correo)
    .maybeSingle<{ id: string; nombre: string; estado: string; respuestas: RespuestasProyecto }>()
  if (!proyecto) notFound()

  const terminado = proyecto.estado === 'terminado'
  let postulacion: { estado: string; convocatoria_texto: string | null; nota_equipo: string | null } | null = null
  let opciones: { id: string; etiqueta: string }[] = []

  if (terminado) {
    const [{ data: post }, { data: abiertas }] = await Promise.all([
      ctx.servicio.from('membresias_postulaciones').select('estado, convocatoria_texto, nota_equipo').eq('proyecto_id', id).maybeSingle(),
      ctx.servicio
        .from('biblioteca_convocatorias')
        .select('id, nombre, entidad')
        .or(`fecha_cierre.is.null,fecha_cierre.gte.${new Date().toISOString().slice(0, 10)}`)
        .order('nombre', { ascending: true })
        .limit(600),
    ])
    postulacion = post
    opciones = ((abiertas || []) as { id: string; nombre: string | null; entidad: string | null }[]).map((c) => ({
      id: c.id,
      etiqueta: `${c.nombre || 'Sin nombre'}${c.entidad ? ' — ' + c.entidad : ''}`.slice(0, 140),
    }))
  }

  return (
    <div className="min-h-full bg-[#54142B] px-4 py-6 lg:px-6">
      <Link href="/mis-proyectos" className="text-[12.5px] font-bold text-[#C9A46B] underline">← Mis proyectos</Link>
      <h1 className="mb-4 mt-2 text-[19px] font-extrabold tracking-tight text-[#F3E7DC]">{proyecto.nombre}</h1>

      {terminado && (
        <section className={`mb-5 rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-5 ${SOMBRA_TARJETA}`}>
          <h2 className="text-[15px] font-extrabold text-[#E0B868]">Tu proyecto está terminado</h2>
          {postulacion ? (
            <div className="mt-2 text-[13.5px] text-[#F3E7DC]/80">
              <p className="font-bold text-[#E0B868]">{ESTADOS[postulacion.estado] || postulacion.estado}</p>
              {postulacion.convocatoria_texto && <p>Convocatoria: {postulacion.convocatoria_texto}</p>}
              {postulacion.nota_equipo && <p className="mt-1">Mensaje del equipo: {postulacion.nota_equipo}</p>}
            </div>
          ) : (
            <>
              <p className="mt-1 text-[13px] text-[#F3E7DC]/60">
                Escoge una convocatoria de la biblioteca y nosotros te ayudamos a postular. Si ganas, el 10 % es para Serving.
              </p>
              <PostularProyecto proyectoId={id} opciones={opciones} />
            </>
          )}
        </section>
      )}

      <EditorProyectoMembresia proyectoId={id} nombre={proyecto.nombre} inicial={proyecto.respuestas || {}} terminado={terminado} />
    </div>
  )
}
