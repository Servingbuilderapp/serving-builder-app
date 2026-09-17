import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createClienteSesion } from '@/lib/supabase/server'
import {
  prepararPostulacion,
  registrarRadicacion,
  marcarRequisito,
  elegirQuienRadica,
} from '@/lib/motorPostulacion'
import { esEquipoServing } from '@/lib/guardiaEquipo'

// Preparar una postulación ahora hace, en la misma llamada: el paquete de
// postulación (Motor 4), la validación final cualitativa y la nota de
// concepto ajustada a la convocatoria — tres consultas al modelo seguidas.
// Sin este valor, Vercel corta la función antes de que termine la tercera.
export const maxDuration = 180

/**
 * Motor 4 — postulación.
 *
 * POST /api/postulacion
 *   { "accion": "preparar", "proyectoId": "...", "convocatoriaId": "..." }
 *      Solo equipo. Prepara (o vuelve a correr) la postulación: requisitos,
 *      adaptaciones, carta y evaluación de 100 puntos (informativa).
 *
 *   { "accion": "marcar_requisito", "requisitoId": "...", "cumplido": true }
 *      Solo equipo. El equipo es quien deja listos los documentos del
 *      checklist — no "prepara" la postulación, la deja lista para radicar.
 *
 *   { "accion": "radicar", "postulacionId": "...", "radicadaPor": "cliente"|"equipo" }
 *      Solo equipo. Registra la radicación. Solo pasa si el checklist de
 *      requisitos está al 100% y el evaluador ya se corrió dos veces.
 *
 *   { "accion": "elegir_quien_radica", "postulacionId": "...", "quienRadica": "cliente"|"equipo" }
 *      Equipo o el dueño del proyecto. Es una decisión humana: primero se le
 *      pregunta al cliente si la presenta él, y si no, la presenta el equipo.
 */

function servicio() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

/** El equipo siempre puede; el cliente solo sobre postulaciones de SU propio proyecto. */
async function puedeElegirQuienRadica(postulacionId: string, supabaseServicio: any): Promise<boolean> {
  if (await esEquipoServing()) return true

  try {
    const sesion = await createClienteSesion()
    const {
      data: { user },
    } = await sesion.auth.getUser()
    if (!user?.email) return false

    const { data: postulacion } = await supabaseServicio
      .from('postulaciones')
      .select('proyecto_id')
      .eq('id', postulacionId)
      .maybeSingle()
    if (!postulacion) return false

    const { data: proyecto } = await supabaseServicio
      .from('proyectos_clientes_serving')
      .select('correo_cliente')
      .eq('id', postulacion.proyecto_id)
      .maybeSingle()

    return (proyecto?.correo_cliente || '').toLowerCase().trim() === user.email.toLowerCase().trim()
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  try {
    const cuerpo = await req.json()
    const accion = cuerpo?.accion || 'preparar'
    const supabase = servicio()

    // Esta única acción la puede usar también el dueño del proyecto, no solo
    // el equipo: es su decisión si postula él o si prefiere que lo haga
    // Serving.
    if (accion === 'elegir_quien_radica') {
      if (!cuerpo?.postulacionId || !['cliente', 'equipo'].includes(cuerpo?.quienRadica)) {
        return NextResponse.json({ error: 'Faltan postulacionId y quienRadica' }, { status: 400 })
      }
      if (!(await puedeElegirQuienRadica(cuerpo.postulacionId, supabase))) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
      }
      const resultado = await elegirQuienRadica(supabase, cuerpo.postulacionId, cuerpo.quienRadica)
      return NextResponse.json(resultado, { status: resultado.ok ? 200 : 400 })
    }

    if (!(await esEquipoServing())) {
      return NextResponse.json({ error: 'Solo el equipo de Serving puede usar esta ruta' }, { status: 401 })
    }

    if (accion === 'marcar_requisito') {
      if (!cuerpo?.requisitoId || typeof cuerpo?.cumplido !== 'boolean') {
        return NextResponse.json({ error: 'Faltan requisitoId y cumplido' }, { status: 400 })
      }
      const resultado = await marcarRequisito(supabase, cuerpo.requisitoId, cuerpo.cumplido, {
        responsable: cuerpo.responsable,
        nota: cuerpo.nota,
      })
      return NextResponse.json(resultado, { status: resultado.ok ? 200 : 400 })
    }

    if (accion === 'radicar') {
      if (!cuerpo?.postulacionId) {
        return NextResponse.json({ error: 'Falta postulacionId' }, { status: 400 })
      }
      const resultado = await registrarRadicacion(supabase, cuerpo.postulacionId, cuerpo.radicadaPor)
      return NextResponse.json(resultado, { status: resultado.ok ? 200 : 400 })
    }

    if (!cuerpo?.proyectoId || !cuerpo?.convocatoriaId) {
      return NextResponse.json({ error: 'Faltan proyectoId y convocatoriaId' }, { status: 400 })
    }

    const resultado = await prepararPostulacion(supabase, cuerpo.proyectoId, cuerpo.convocatoriaId)
    return NextResponse.json(resultado, { status: resultado.ok ? 200 : 400 })
  } catch (error: any) {
    console.error('[Motor 4] Error preparando la postulación:', error)
    return NextResponse.json(
      { error: 'Error al preparar la postulación', detalle: error?.message || String(error) },
      { status: 500 },
    )
  }
}

/**
 * GET /api/postulacion?proyectoId=...
 * Devuelve las postulaciones del proyecto con sus requisitos, para poder
 * verlas sin tener que entrar a la base de datos.
 */
export async function GET(req: Request) {
  try {
    if (!(await esEquipoServing())) {
      return NextResponse.json({ error: 'Solo el equipo de Serving puede usar esta ruta' }, { status: 401 })
    }

    const url = new URL(req.url)
    const proyectoId = url.searchParams.get('proyectoId')
    if (!proyectoId) {
      return NextResponse.json({ error: 'Falta proyectoId' }, { status: 400 })
    }

    const supabase = servicio()

    const { data: postulaciones, error } = await supabase
      .from('postulaciones')
      .select('*')
      .eq('proyecto_id', proyectoId)
      .order('fecha_cierre', { ascending: true, nullsFirst: false })

    if (error) {
      return NextResponse.json({ error: 'No se pudieron leer las postulaciones' }, { status: 500 })
    }

    const ids = (postulaciones || []).map((p: any) => p.id)
    const { data: requisitos } = ids.length
      ? await supabase
          .from('postulacion_requisitos')
          .select('*')
          .in('postulacion_id', ids)
          .order('orden')
      : { data: [] }

    // Validación final (la más reciente de cada postulación) y la Nota de
    // Concepto ajustada a cada convocatoria — las dos se generan solas al
    // preparar la postulación, esta pantalla solo las muestra.
    const { data: validaciones } = ids.length
      ? await supabase
          .from('validaciones_finales')
          .select('postulacion_id, corrida, hallazgos_json, creada_en')
          .in('postulacion_id', ids)
          .order('corrida', { ascending: false })
      : { data: [] }

    const ultimaValidacionPorPostulacion = new Map<string, any>()
    for (const v of validaciones || []) {
      if (!ultimaValidacionPorPostulacion.has(v.postulacion_id)) {
        ultimaValidacionPorPostulacion.set(v.postulacion_id, v)
      }
    }

    const idsConvocatoria = (postulaciones || [])
      .map((p: any) => p.biblioteca_id)
      .filter((id: string | null) => Boolean(id))

    const { data: notasAjustadas } = idsConvocatoria.length
      ? await supabase
          .from('notas_concepto')
          .select('convocatoria_id, contenido_es, creada_en')
          .in('convocatoria_id', idsConvocatoria)
          .order('creada_en', { ascending: false })
      : { data: [] }

    const ultimaNotaPorConvocatoria = new Map<string, any>()
    for (const n of notasAjustadas || []) {
      if (!ultimaNotaPorConvocatoria.has(n.convocatoria_id)) {
        ultimaNotaPorConvocatoria.set(n.convocatoria_id, n)
      }
    }

    const conRequisitos = (postulaciones || []).map((p: any) => ({
      ...p,
      requisitos: (requisitos || []).filter((r: any) => r.postulacion_id === p.id),
      validacion_final: ultimaValidacionPorPostulacion.get(p.id)?.hallazgos_json || null,
      nota_concepto_ajustada: p.biblioteca_id
        ? ultimaNotaPorConvocatoria.get(p.biblioteca_id)?.contenido_es || null
        : null,
    }))

    return NextResponse.json({ ok: true, postulaciones: conRequisitos })
  } catch (error: any) {
    console.error('[Motor 4] Error leyendo postulaciones:', error)
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 })
  }
}
