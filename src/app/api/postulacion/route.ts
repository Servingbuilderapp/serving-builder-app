import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prepararPostulacion, registrarRadicacion } from '@/lib/motorPostulacion'
import { esEquipoServing } from '@/lib/guardiaEquipo'

/**
 * Motor 4 — postulación.
 *
 * POST /api/postulacion
 *   { "accion": "preparar", "proyectoId": "...", "convocatoriaId": "..." }
 *      Prepara (o vuelve a correr) la postulación de un proyecto a una
 *      convocatoria de la biblioteca: requisitos, adaptaciones, carta y
 *      evaluación de 100 puntos.
 *
 *   { "accion": "radicar", "postulacionId": "..." }
 *      Registra la radicación. Solo pasa si el puntaje llegó a 90 y el
 *      evaluador ya se corrió dos veces.
 */

function cliente() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(req: Request) {
  try {
    if (!(await esEquipoServing())) {
      return NextResponse.json({ error: 'Solo el equipo de Serving puede usar esta ruta' }, { status: 401 })
    }

    const cuerpo = await req.json()
    const accion = cuerpo?.accion || 'preparar'
    const supabase = cliente()

    if (accion === 'radicar') {
      if (!cuerpo?.postulacionId) {
        return NextResponse.json({ error: 'Falta postulacionId' }, { status: 400 })
      }
      const resultado = await registrarRadicacion(supabase, cuerpo.postulacionId)
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

    const supabase = cliente()

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

    const conRequisitos = (postulaciones || []).map((p: any) => ({
      ...p,
      requisitos: (requisitos || []).filter((r: any) => r.postulacion_id === p.id),
    }))

    return NextResponse.json({ ok: true, postulaciones: conRequisitos })
  } catch (error: any) {
    console.error('[Motor 4] Error leyendo postulaciones:', error)
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 })
  }
}
