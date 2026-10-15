import React from 'react'
import { resumenDeUso } from '@/lib/membresiasUso'
import { contextoMiembro } from '@/lib/membresiasServicios'
import { AvisoMiembros } from '@/components/panel/AvisoMiembros'
import { FormularioProyectoMinimo } from '@/components/panel/FormularioProyectoMinimo'
import { NotaConceptoTexto } from '@/components/panel/NotaConceptoTexto'
import { PostularProyecto } from '@/components/panel/PostularProyecto'

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

type Proyecto = { id: string; nombre_proyecto: string; documento: string; created_at: string }
type Postulacion = { proyecto_id: string; estado: string; convocatoria_texto: string | null; nota_equipo: string | null }

export default async function ProyectoMinimoPage() {
  const ctx = await contextoMiembro()
  if (!ctx.vigente && !ctx.esEquipo) {
    return (
      <AvisoMiembros
        titulo="Mi proyecto mínimo viable"
        texto="Con una membresía activa creas cada mes tu proyecto mínimo viable respondiendo unas preguntas, y pides que lo postulemos."
      />
    )
  }

  const uso = ctx.vigente ? await resumenDeUso(ctx.servicio, ctx.vigente) : null
  const linea = uso?.lineas.find((l) => l.clave === 'proyecto_minimo')
  const limite = ctx.esEquipo ? null : (linea?.limite ?? 0)
  const restante = ctx.esEquipo ? null : (linea?.restante ?? null)
  const sinCupo = !ctx.esEquipo && (limite === 0 || (restante !== null && restante <= 0))

  const [{ data: proyectos }, { data: postulaciones }, { data: abiertas }] = await Promise.all([
    ctx.servicio
      .from('membresias_proyectos_minimos')
      .select('id, nombre_proyecto, documento, created_at')
      .ilike('correo_cliente', ctx.correo)
      .order('created_at', { ascending: false })
      .limit(20),
    ctx.servicio
      .from('membresias_postulaciones')
      .select('proyecto_id, estado, convocatoria_texto, nota_equipo')
      .ilike('correo_cliente', ctx.correo),
    ctx.servicio
      .from('biblioteca_convocatorias')
      .select('id, nombre, entidad')
      .or(`fecha_cierre.is.null,fecha_cierre.gte.${new Date().toISOString().slice(0, 10)}`)
      .order('nombre', { ascending: true })
      .limit(300),
  ])
  const opciones = ((abiertas || []) as { id: string; nombre: string | null; entidad: string | null }[]).map((c) => ({
    id: c.id,
    etiqueta: `${c.nombre || 'Sin nombre'}${c.entidad ? ' — ' + c.entidad : ''}`.slice(0, 140),
  }))
  const porProyecto = new Map<string, Postulacion>(((postulaciones || []) as Postulacion[]).map((p) => [p.proyecto_id, p]))

  return (
    <div className="min-h-full bg-[#54142B] px-4 py-6 lg:px-6">
      <header className="mb-5">
        <h1 className="text-[19px] font-extrabold tracking-tight text-[#F3E7DC]">Mi proyecto mínimo viable</h1>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[#F3E7DC]/60">
          {ctx.esEquipo
            ? 'Vista de administrador: puedes probar sin membresía y sin gastar cupo. Las pruebas no se guardan.'
            : restante === null
              ? 'Tu nivel no tiene límite de proyectos este mes.'
              : `Este mes puedes crear ${limite} ${limite === 1 ? 'proyecto' : 'proyectos'}. Te quedan ${restante}. Se renuevan el ${uso?.hasta.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}.`}
        </p>
        <p className="mt-1 max-w-2xl text-[13px] text-[#F3E7DC]/50">
          Respondes unas preguntas con tus palabras y nosotros armamos tu proyecto. Cuando esté listo, pides que lo postulemos.
        </p>
      </header>

      <section className={`rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-5 ${SOMBRA_TARJETA}`}>
        <FormularioProyectoMinimo sinCupo={sinCupo} />
      </section>

      {proyectos && proyectos.length > 0 && (
        <section className={`mt-4 rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-5 ${SOMBRA_TARJETA}`}>
          <h2 className="text-[15px] font-extrabold text-[#F3E7DC]">Mis proyectos</h2>
          <div className="mt-3 space-y-2">
            {(proyectos as Proyecto[]).map((n) => {
              const post = porProyecto.get(n.id)
              return (
                <details key={n.id} className="rounded-xl bg-[#3B1727] p-3">
                  <summary className="cursor-pointer text-[13.5px] font-bold text-[#F3E7DC]">
                    {n.nombre_proyecto}{' '}
                    <span className="font-normal text-[#F3E7DC]/50">
                      · {new Date(n.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}
                      {post ? ` · ${ESTADOS[post.estado] || post.estado}` : ''}
                    </span>
                  </summary>
                  <div className="mt-3">
                    <NotaConceptoTexto documento={n.documento} />
                    {post ? (
                      <div className="mt-3 rounded-xl bg-[#54142B] p-3 text-[13px] text-[#F3E7DC]/80">
                        <p className="font-bold text-[#E0B868]">{ESTADOS[post.estado] || post.estado}</p>
                        {post.convocatoria_texto && <p>Convocatoria: {post.convocatoria_texto}</p>}
                        {post.nota_equipo && <p className="mt-1">Mensaje del equipo: {post.nota_equipo}</p>}
                      </div>
                    ) : (
                      <PostularProyecto proyectoId={n.id} opciones={opciones} />
                    )}
                  </div>
                </details>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
