import React from 'react'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resolverProyectoVisto } from '@/lib/proyectoVisto'
import { BannerProyectoVisto } from '@/components/panel/BannerProyectoVisto'
import { ComprarAbanico } from '@/components/panel/ComprarAbanico'
import { ElegirAbanico, type ConvocatoriaDelAbanico } from '@/components/panel/ElegirAbanico'
import { PRECIOS_REPLICA, precioReplicaConEquivalencia } from '@/lib/precioReplicas'
import { TOTAL_ABANICO, textoPrecioAbanico } from '@/lib/abanico'

export const dynamic = 'force-dynamic'

/**
 * MI ABANICO — el plan "Armar mi abanico": el proyecto del cliente, adaptado hasta a 12
 * convocatorias. Todo es automático: el cliente paga con Bold, la plataforma prepara las
 * convocatorias sola, y aquí el cliente escoge a cuáles quiere entrar.
 * El equipo la ve con ?proyecto=<id>, solo para mirar.
 */

type Punto = { que: string; detalle: string }
type FilaReplica = {
  id: string
  destino: string | null
  biblioteca_id: string | null
  nucleo_json: Punto[] | null
  adaptaciones_json: Punto[] | null
  obligados_json: Punto[] | null
  riesgos: string | null
  abanico_eleccion: string | null
}

function Caja({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-[#B08D57]/40 bg-[#4C2032] p-5 text-sm text-[#F3E7DC]">{children}</div>
}

export default async function MiAbanicoPage({
  searchParams,
}: {
  searchParams?: Promise<{ proyecto?: string; pago?: string }>
}) {
  const params = searchParams ? await searchParams : undefined
  const vista = await resolverProyectoVisto(params?.proyecto)

  if (!vista.proyectoId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-[#F3E7DC]">
        <h1 className="text-xl font-extrabold">Mi abanico</h1>
        <p className="mt-2 text-sm text-[#F3E7DC]/70">Cuando tengas un proyecto con nosotros, aquí podrás armar tu abanico.</p>
      </div>
    )
  }
  const proyectoId: string = vista.proyectoId

  const { data: abanico } = await supabaseAdmin
    .from('abanicos')
    .select('id, estado')
    .eq('proyecto_id', proyectoId)
    .order('creado_en', { ascending: false })
    .limit(1)
    .maybeSingle()

  let cuerpo: React.ReactNode

  if (!abanico || abanico.estado === 'pendiente_pago') {
    cuerpo = (
      <Caja>
        <p className="text-base font-extrabold text-[#C9A46B]">{PRECIOS_REPLICA.abanico.nombre}</p>
        <p className="mt-2 text-[#F3E7DC]/85">{PRECIOS_REPLICA.abanico.descripcion}</p>
        <p className="mt-3 text-lg font-extrabold text-[#C9A46B]">{precioReplicaConEquivalencia('abanico')}</p>
        <p className="mt-1 text-xs font-bold text-[#C9A46B]">{textoPrecioAbanico()}</p>
        <p className="mt-1 text-xs text-[#F3E7DC]/60">
          Pagas una sola vez. Después todo es automático: armamos tu abanico y te avisamos por correo para que escojas.
        </p>
        {params?.pago === 'en_proceso' ? (
          <p className="mt-3 text-xs font-bold text-[#C9A46B]">
            Estamos confirmando tu pago. En unos minutos esta pantalla cambia sola; si no, recárgala.
          </p>
        ) : null}
        {vista.vistaEquipo ? (
          <p className="mt-3 text-xs text-[#F3E7DC]/60">Vista del equipo: el cliente todavía no ha pagado su abanico.</p>
        ) : (
          <ComprarAbanico proyectoId={proyectoId} abanicoIdInicial={abanico ? String(abanico.id) : null} />
        )}
      </Caja>
    )
  } else if (abanico.estado === 'pagado' || abanico.estado === 'preparando') {
    const { count } = await supabaseAdmin
      .from('replicas')
      .select('id', { count: 'exact', head: true })
      .eq('abanico_id', abanico.id)
    cuerpo = (
      <Caja>
        <p className="text-base font-extrabold text-[#C9A46B]">Estamos armando tu abanico</p>
        <p className="mt-2 text-[#F3E7DC]/85">
          Tu pago quedó confirmado. Estamos escogiendo las convocatorias que mejor le quedan a tu proyecto y adaptándolo a
          cada una. Van {count || 0} de hasta {TOTAL_ABANICO}. No tienes que hacer nada: te avisamos por correo cuando esté
          listo para que escojas.
        </p>
      </Caja>
    )
  } else if (abanico.estado === 'sin_opciones') {
    cuerpo = (
      <Caja>
        <p className="text-base font-extrabold text-[#C9A46B]">Todavía no hay convocatorias para tu abanico</p>
        <p className="mt-2 text-[#F3E7DC]/85">
          Hoy no encontramos convocatorias abiertas que le queden bien a tu proyecto. Ya lo sabe nuestro equipo y te escribirá
          para darte una solución.
        </p>
      </Caja>
    )
  } else {
    // 'listo' o 'confirmado': se muestran las convocatorias preparadas
    const { data: filas } = await supabaseAdmin
      .from('replicas')
      .select('id, destino, biblioteca_id, nucleo_json, adaptaciones_json, obligados_json, riesgos, abanico_eleccion')
      .eq('abanico_id', abanico.id)
    const replicas = (filas || []) as FilaReplica[]

    const idsBiblioteca = replicas.map((r) => r.biblioteca_id).filter((v): v is string => Boolean(v))
    const { data: fichas } = idsBiblioteca.length
      ? await supabaseAdmin
          .from('biblioteca_convocatorias')
          .select('id, nombre, entidad, fecha_cierre, fecha_cierre_texto, monto, fuente_oficial, enlace_aplicacion')
          .in('id', idsBiblioteca)
      : { data: [] as { id: string; nombre: string; entidad: string | null; fecha_cierre: string | null; fecha_cierre_texto: string | null; monto: string | null; fuente_oficial: string | null; enlace_aplicacion: string | null }[] }
    const fichaPor = new Map((fichas || []).map((f) => [String(f.id), f]))

    const items: ConvocatoriaDelAbanico[] = replicas.map((r) => {
      const f = r.biblioteca_id ? fichaPor.get(String(r.biblioteca_id)) : undefined
      return {
        replicaId: String(r.id),
        nombre: f?.nombre || r.destino || 'Convocatoria',
        entidad: f?.entidad || null,
        cierre: f?.fecha_cierre_texto || (f?.fecha_cierre ? new Date(f.fecha_cierre).toLocaleDateString('es-CO') : null),
        monto: f?.monto || null,
        enlace: f?.enlace_aplicacion || f?.fuente_oficial || null,
        nucleo: r.nucleo_json || [],
        adaptaciones: r.adaptaciones_json || [],
        obligados: r.obligados_json || [],
        riesgos: r.riesgos || null,
      }
    })

    if (abanico.estado === 'confirmado') {
      const elegidas = items.filter((i) => replicas.find((r) => String(r.id) === i.replicaId)?.abanico_eleccion === 'elegida')
      cuerpo = (
        <Caja>
          <p className="text-base font-extrabold text-[#C9A46B]">Tu abanico está confirmado</p>
          <p className="mt-2 text-[#F3E7DC]/85">
            Escogiste {elegidas.length} convocatorias. Preparamos el análisis y la postulación de cada una; las ves en{' '}
            <Link href={vista.vistaEquipo ? `/mis-convocatorias?proyecto=${proyectoId}` : '/mis-convocatorias'} className="font-bold text-[#B08D57] underline">
              Mis convocatorias
            </Link>
            .
          </p>
          <ul className="mt-3 space-y-1 text-xs text-[#F3E7DC]/75">
            {elegidas.map((i) => (
              <li key={i.replicaId}>• {i.nombre}</li>
            ))}
          </ul>
        </Caja>
      )
    } else if (vista.vistaEquipo) {
      cuerpo = (
        <Caja>
          <p className="text-base font-extrabold text-[#C9A46B]">Abanico listo, esperando que el cliente escoja</p>
          <ul className="mt-3 space-y-1 text-xs text-[#F3E7DC]/75">
            {items.map((i) => (
              <li key={i.replicaId}>• {i.nombre}</li>
            ))}
          </ul>
        </Caja>
      )
    } else {
      cuerpo = <ElegirAbanico abanicoId={String(abanico.id)} convocatorias={items} />
    }
  }

  return (
    <>
      <BannerProyectoVisto vista={vista} />
      <div className="mx-auto max-w-4xl px-4 py-6 text-[#F3E7DC]">
        <h1 className="text-xl font-extrabold">Mi abanico</h1>
        <p className="mt-1 mb-4 text-sm text-[#F3E7DC]/70">
          Tu proyecto, adaptado hasta a {TOTAL_ABANICO} convocatorias, cambiando en cada una lo que pida.
        </p>
        {cuerpo}
      </div>
    </>
  )
}
