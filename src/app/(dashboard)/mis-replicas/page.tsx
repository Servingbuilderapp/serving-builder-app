import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Copy, Plus } from 'lucide-react'
import { PRECIOS_REPLICA, type ModalidadReplica } from '@/lib/precioReplicas'
import { VariantesReplicaClient, type VarianteReplica } from '@/components/panel/VariantesReplicaClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SOMBRA_TARJETA =
  'shadow-[0_1px_2px_rgba(11,42,74,0.06),0_8px_24px_-14px_rgba(11,42,74,0.20)]'

const RELIEVE_BOTON =
  'shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_2px_4px_rgba(11,42,74,0.18),0_8px_18px_-10px_rgba(29,78,216,0.55)]'

type SolicitudReplica = {
  id: string
  nombre_iniciativa: string | null
  estado_actual: string | null
  estado_comercial: string | null
  modalidad_replica_solicitada: string | null
  progreso_estructuracion: number | null
  created_at: string | null
}

function etiquetaEstado(solicitud: SolicitudReplica): { texto: string; clase: string } {
  const estado = (solicitud.estado_actual || '').toLowerCase()
  if (estado === 'estructurando_ia') {
    return { texto: 'Procesando tu documento', clase: 'bg-[#FEF3C7] text-[#8A5307]' }
  }
  if (estado === 'en_revision_tecnica') {
    return { texto: 'En revisión del equipo', clase: 'bg-[#EFF6FF] text-[#1D4ED8]' }
  }
  return { texto: solicitud.estado_comercial || 'Recibida', clase: 'bg-[#F1F5F9] text-[#5B6B84]' }
}

export default async function MisReplicasPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const correo = user?.email || ''

  const { data: solicitudes } = await supabase
    .from('proyectos_clientes_serving')
    .select('id, nombre_iniciativa, estado_actual, estado_comercial, modalidad_replica_solicitada, progreso_estructuracion, created_at')
    .eq('correo_cliente', correo)
    .eq('es_solicitud_replica_cliente', true)
    .order('created_at', { ascending: false })

  const lista = (solicitudes || []) as SolicitudReplica[]

  // Se lee con la llave de servicio: "replicas" nunca antes la había leído un
  // cliente, y no hay que depender de un permiso de base de datos que quizás
  // no está puesto. Los proyectos ya se filtraron arriba por su propio correo,
  // así que solo se traen réplicas de proyectos que ya son suyos.
  const idsProyectos = lista.map((s) => s.id)
  const servicio = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  const { data: variantes } =
    idsProyectos.length > 0
      ? await servicio
          .from('replicas')
          .select('id, proyecto_origen_id, tipo, destino, estado')
          .in('proyecto_origen_id', idsProyectos)
          .order('creada_en', { ascending: false })
      : { data: [] as { id: string; proyecto_origen_id: string; tipo: string; destino: string | null; estado: string }[] }

  const variantesPorProyecto = new Map<string, VarianteReplica[]>()
  for (const v of variantes || []) {
    const lista2 = variantesPorProyecto.get(v.proyecto_origen_id) || []
    lista2.push({ id: v.id, tipo: v.tipo, destino: v.destino, estado: v.estado })
    variantesPorProyecto.set(v.proyecto_origen_id, lista2)
  }

  return (
    <div className="px-4 py-6 lg:px-6">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[19px] font-extrabold tracking-tight text-[#0B2A4A]">Mis réplicas</h1>
          <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[#5B6B84]">
            Proyectos ya estructurados que nos enviaste para volver a presentar — en otra
            convocatoria, otro territorio u otra forma.
          </p>
        </div>
        <Link
          href="/mis-replicas/nueva"
          className={`inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-[13px] font-bold text-white transition-transform ${RELIEVE_BOTON} hover:-translate-y-px`}
        >
          <Plus className="h-4 w-4" /> Solicitar una réplica
        </Link>
      </header>

      {lista.length === 0 ? (
        <div className={`mx-auto max-w-xl rounded-2xl border border-[#E4EAF3] bg-white p-8 text-center ${SOMBRA_TARJETA}`}>
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#1D4ED8]">
            <Copy className="h-5 w-5" />
          </span>
          <h2 className="mt-3 text-[15px] font-extrabold text-[#0B2A4A]">Todavía no has pedido ninguna</h2>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-[#5B6B84]">
            Si ya tienes un proyecto estructurado y quieres volver a presentarlo — en otra
            convocatoria, otro territorio, otro presupuesto — súbelo aquí.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {lista.map((solicitud) => {
            const estado = etiquetaEstado(solicitud)
            const modalidad = PRECIOS_REPLICA[(solicitud.modalidad_replica_solicitada || 'no_presentado') as ModalidadReplica]
            return (
              <div key={solicitud.id} className={`rounded-2xl border border-[#E4EAF3] bg-white p-5 ${SOMBRA_TARJETA}`}>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-[14.5px] font-extrabold leading-snug text-[#0B2A4A]">
                    {solicitud.nombre_iniciativa || 'Proyecto sin nombre'}
                  </h2>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${estado.clase}`}>
                    {estado.texto}
                  </span>
                </div>
                <p className="mt-2 text-[12.5px] text-[#5B6B84]">{modalidad.nombre}</p>
                {typeof solicitud.progreso_estructuracion === 'number' && solicitud.progreso_estructuracion < 100 ? (
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#EEF2F8]">
                    <div
                      className="h-full rounded-full bg-[#1D4ED8]"
                      style={{ width: `${Math.max(4, solicitud.progreso_estructuracion)}%` }}
                    />
                  </div>
                ) : null}

                <VariantesReplicaClient
                  proyectoOrigenId={solicitud.id}
                  modalidad={solicitud.modalidad_replica_solicitada}
                  variantesIniciales={variantesPorProyecto.get(solicitud.id) || []}
                  puedeProcesar={(solicitud.estado_actual || '').toLowerCase() !== 'estructurando_ia'}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
