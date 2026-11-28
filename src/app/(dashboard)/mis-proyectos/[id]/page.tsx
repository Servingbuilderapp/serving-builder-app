import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { contextoMiembro } from '@/lib/membresiasServicios'
import { AvisoMiembros } from '@/components/panel/AvisoMiembros'
import { EditorProyectoMembresia } from '@/components/panel/EditorProyectoMembresia'
import { BloqueProyectoTraido } from '@/components/panel/BloqueProyectoTraido'
import { RegistrarPostulaciones } from '@/components/panel/RegistrarPostulaciones'
import { BUCKET_PROYECTOS, CLAVE_ARCHIVO_RUTA, MAX_POSTULACIONES_POR_PROYECTO, esProyectoTraido, leerPostulaciones } from '@/lib/miProyectoListo'
import type { RespuestasProyecto } from '@/lib/miProyectoPasos'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SOMBRA_TARJETA =
  'shadow-[0_1px_2px_rgba(20,5,10,0.28),0_8px_24px_-14px_rgba(20,5,10,0.55)]'

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
  const traido = esProyectoTraido(proyecto.respuestas)
  let urlArchivo: string | null = null
  if (traido) {
    const { data: firmada } = await ctx.servicio.storage
      .from(BUCKET_PROYECTOS)
      .createSignedUrl(proyecto.respuestas?.[CLAVE_ARCHIVO_RUTA] || '', 60 * 60)
    urlArchivo = firmada?.signedUrl || null
  }

  const usadas = leerPostulaciones(proyecto.respuestas)
  let opciones: { id: string; etiqueta: string }[] = []
  if (terminado && usadas.length < MAX_POSTULACIONES_POR_PROYECTO) {
    const { data: abiertas } = await ctx.servicio
      .from('biblioteca_convocatorias')
      .select('id, nombre, entidad')
      .or(`fecha_cierre.is.null,fecha_cierre.gte.${new Date().toISOString().slice(0, 10)}`)
      .order('nombre', { ascending: true })
      .limit(600)
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
          <p className="mt-1 text-[13px] leading-relaxed text-[#F3E7DC]/70">
            Busca la convocatoria que más te sirva, regístrala aquí y postula tú mismo en el portal de la entidad. Cada proyecto tiene máximo {MAX_POSTULACIONES_POR_PROYECTO} postulaciones.
          </p>
          <RegistrarPostulaciones proyectoId={id} opciones={opciones} usadas={usadas} />
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/mis-convocatorias" className="rounded-xl bg-[#C9A46B] px-4 py-2 text-[13px] font-bold text-[#3B1727]">
              Explorar convocatorias
            </Link>
            <Link href="/convocatorias-del-mes" className="rounded-xl border border-[#C9A46B]/50 px-4 py-2 text-[13px] font-bold text-[#C9A46B]">
              Ventajas del mes
            </Link>
          </div>
          <p className="mt-4 text-[12.5px] leading-relaxed text-[#F3E7DC]/60">
            ¿Necesitas ayuda con algo, por ejemplo conseguir aliados? Llámanos al 3123335966 o escríbenos a servingproyectosgi@gmail.com.
          </p>
        </section>
      )}

      {traido ? (
        <BloqueProyectoTraido respuestas={proyecto.respuestas || {}} urlArchivo={urlArchivo} />
      ) : (
        <EditorProyectoMembresia proyectoId={id} nombre={proyecto.nombre} inicial={proyecto.respuestas || {}} terminado={terminado} />
      )}
    </div>
  )
}
