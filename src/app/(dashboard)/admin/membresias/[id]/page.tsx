import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { esEquipoServing } from '@/lib/guardiaEquipo'
import { resumenDeUso } from '@/lib/membresiasUso'
import { ETIQUETA_BENEFICIO } from '@/lib/membresias'
import { porcentajeProyecto, type RespuestasProyecto } from '@/lib/miProyectoPasos'

export const dynamic = 'force-dynamic'

/**
 * QUÉ ESTÁ HACIENDO ESTE MIEMBRO — pantalla del equipo, solo lectura.
 *
 * Para poder contestarle a un miembro sabiendo dónde está: su membresía, lo que ha
 * usado este mes, los proyectos que armó (y cuánto lleva cada uno), las sesiones a
 * las que se inscribió y los acompañamientos que pidió. No cambia nada.
 */

const NOMBRE_NIVEL: Record<string, string> = {
  explorador: 'Explorador',
  constructor: 'Constructor',
  arquitecto: 'Arquitecto',
}

function fecha(valor: string | null | undefined, conHora = false): string {
  if (!valor) return '-'
  const d = new Date(valor)
  return conHora ? d.toLocaleString('es-CO') : d.toLocaleDateString('es-CO')
}

const TARJETA = 'rounded-2xl border border-color-base-content/10 bg-color-base-200 p-5'
const TITULO = 'text-xs font-black uppercase tracking-widest text-color-base-content/50'

export default async function ActividadMiembroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!(await esEquipoServing())) redirect('/dashboard')

  const servicio = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: miembro } = await servicio
    .from('membresias_clientes')
    .select('id, nombre_cliente, correo_cliente, telefono_whatsapp, pais, nivel, ciclo, estado, fecha_inicio, fecha_proximo_pago')
    .eq('id', id)
    .maybeSingle()

  if (!miembro) redirect('/admin/membresias')

  const correo = String(miembro.correo_cliente || '')

  const [uso, proyectosRes, postulacionesRes, inscritosRes, acompRes] = await Promise.all([
    resumenDeUso(servicio, { id: miembro.id, nivel: miembro.nivel, fecha_inicio: miembro.fecha_inicio }),
    servicio
      .from('membresias_proyectos')
      .select('id, nombre, estado, respuestas, created_at')
      .ilike('correo_cliente', correo)
      .order('created_at', { ascending: false })
      .limit(50),
    servicio.from('membresias_postulaciones').select('proyecto_id, estado').ilike('correo_cliente', correo),
    servicio.from('membresias_sesiones_inscritos').select('sesion_id').ilike('correo_cliente', correo),
    servicio
      .from('membresias_acompanamiento')
      .select('id, tema, estado, fecha_hora, nota_equipo, created_at')
      .ilike('correo_cliente', correo)
      .order('created_at', { ascending: false })
      .limit(30),
  ])

  const proyectos = proyectosRes.data || []
  const postulaciones = postulacionesRes.data || []
  const idsSesiones = (inscritosRes.data || []).map((i) => i.sesion_id)
  const acompanamientos = acompRes.data || []

  const { data: sesiones } = idsSesiones.length
    ? await servicio
        .from('membresias_sesiones')
        .select('id, titulo, fecha_hora')
        .in('id', idsSesiones)
        .order('fecha_hora', { ascending: false })
    : { data: [] as { id: string; titulo: string; fecha_hora: string }[] }

  return (
    <div className="p-6 lg:p-8 max-w-5xl space-y-6">
      <div>
        <Link href="/admin/membresias" className="text-xs font-bold text-[#B08D57] hover:underline">
          ← Volver a miembros y membresías
        </Link>
        <h1 className="mt-2 text-3xl font-black text-color-base-content tracking-tight">
          {miembro.nombre_cliente || 'Miembro sin nombre'}
        </h1>
        <p className="text-sm text-color-base-content/60 mt-1">
          Vista del equipo, solo lectura. Aquí ves lo mismo que este miembro hace dentro de su membresía.
        </p>
      </div>

      <div className={TARJETA}>
        <div className={TITULO}>Su membresía</div>
        <div className="mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          <div><span className="text-color-base-content/50">Nivel:</span> <strong>{NOMBRE_NIVEL[miembro.nivel] || miembro.nivel}</strong></div>
          <div><span className="text-color-base-content/50">Estado:</span> <strong>{miembro.estado}</strong></div>
          <div><span className="text-color-base-content/50">Ciclo:</span> {miembro.ciclo || '-'}</div>
          <div><span className="text-color-base-content/50">Inició:</span> {fecha(miembro.fecha_inicio)}</div>
          <div><span className="text-color-base-content/50">Próximo pago:</span> {fecha(miembro.fecha_proximo_pago)}</div>
          <div><span className="text-color-base-content/50">País:</span> {miembro.pais || '-'}</div>
          <div><span className="text-color-base-content/50">Correo:</span> {correo || '-'}</div>
          <div><span className="text-color-base-content/50">WhatsApp:</span> {miembro.telefono_whatsapp || '-'}</div>
        </div>
      </div>

      <div className={TARJETA}>
        <div className={TITULO}>Lo que ha usado este mes</div>
        <div className="mt-3 space-y-1 text-sm">
          {uso.lineas.filter((l) => l.limite !== 0).length === 0 ? (
            <span className="text-color-base-content/50">Su nivel no tiene beneficios con cupo.</span>
          ) : (
            uso.lineas
              .filter((l) => l.limite !== 0)
              .map((l) => (
                <div key={l.clave}>
                  {ETIQUETA_BENEFICIO[l.clave]}:{' '}
                  <strong>{l.limite === null ? `${l.usados} (sin límite)` : `${l.usados} de ${l.limite}`}</strong>
                </div>
              ))
          )}
        </div>
      </div>

      <div className={TARJETA}>
        <div className={TITULO}>Sus proyectos ({proyectos.length})</div>
        {proyectos.length === 0 ? (
          <p className="mt-3 text-sm text-color-base-content/50">Todavía no ha creado ningún proyecto.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {proyectos.map((p) => {
              const avance = porcentajeProyecto((p.respuestas || {}) as RespuestasProyecto)
              const susPostulaciones = postulaciones.filter((x) => x.proyecto_id === p.id)
              return (
                <div key={p.id} className="rounded-xl border border-color-base-content/10 p-3 text-sm">
                  <div className="flex flex-wrap items-center gap-x-3">
                    <strong>{p.nombre || 'Proyecto sin nombre'}</strong>
                    <span className="text-xs text-color-base-content/50">Creado el {fecha(p.created_at)}</span>
                    <span className="text-xs font-bold text-[#B08D57]">{avance}% armado</span>
                    <span className="text-xs text-color-base-content/60">Estado: {p.estado || '-'}</span>
                  </div>
                  <div className="mt-1 text-xs text-color-base-content/60">
                    {susPostulaciones.length === 0
                      ? 'Sin postulaciones todavía.'
                      : `Postulaciones: ${susPostulaciones.length} (${susPostulaciones.map((x) => x.estado).join(', ')})`}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className={TARJETA}>
        <div className={TITULO}>Sesiones a las que se inscribió ({(sesiones || []).length})</div>
        {(sesiones || []).length === 0 ? (
          <p className="mt-3 text-sm text-color-base-content/50">No se ha inscrito a ninguna sesión.</p>
        ) : (
          <ul className="mt-3 space-y-1 text-sm">
            {(sesiones || []).map((s) => (
              <li key={s.id}>
                <strong>{s.titulo}</strong> <span className="text-color-base-content/50">· {fecha(s.fecha_hora, true)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={TARJETA}>
        <div className={TITULO}>Acompañamientos que pidió ({acompanamientos.length})</div>
        {acompanamientos.length === 0 ? (
          <p className="mt-3 text-sm text-color-base-content/50">No ha pedido acompañamiento.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {acompanamientos.map((a) => (
              <div key={a.id} className="rounded-xl border border-color-base-content/10 p-3 text-sm">
                <div>
                  <strong>{a.tema || 'Sin tema'}</strong>{' '}
                  <span className="text-xs text-color-base-content/50">
                    · pedido el {fecha(a.created_at)} · estado: {a.estado || '-'}
                    {a.fecha_hora ? ` · cita: ${fecha(a.fecha_hora, true)}` : ''}
                  </span>
                </div>
                {a.nota_equipo ? (
                  <div className="mt-1 text-xs text-color-base-content/60">Nota del equipo: {a.nota_equipo}</div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
