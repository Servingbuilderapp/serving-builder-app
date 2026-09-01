import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { crearProyectoReplica, prepararReplica, TIPOS_REPLICA } from '@/lib/motorReplica'
import { esEquipoServing } from '@/lib/guardiaEquipo'

/**
 * Réplicas.
 *
 * POST /api/replica
 *   { "accion": "preparar", "proyectoId": "...", "tipo": "otro territorio",
 *     "destino": "Nariño", "convocatoriaId": "opcional" }
 *      Piensa la réplica: qué núcleo no se toca, qué se adapta y qué obliga
 *      la convocatoria.
 *
 *   { "accion": "crear", "replicaId": "..." }
 *      Crea el proyecto nuevo copiando árbol, objetivos y cadena de valor.
 *
 * GET /api/replica?proyectoId=...   las réplicas de ese proyecto
 * GET /api/replica?tipos=1          los once tipos de réplica que existen
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
    const supabase = cliente()

    if (cuerpo?.accion === 'crear') {
      if (!cuerpo?.replicaId) {
        return NextResponse.json({ error: 'Falta replicaId' }, { status: 400 })
      }
      const resultado = await crearProyectoReplica(supabase, cuerpo.replicaId)
      return NextResponse.json(resultado, { status: resultado.ok ? 200 : 400 })
    }

    if (!cuerpo?.proyectoId || !cuerpo?.tipo) {
      return NextResponse.json(
        { error: 'Faltan proyectoId y tipo', tipos_validos: TIPOS_REPLICA },
        { status: 400 },
      )
    }

    const resultado = await prepararReplica(supabase, cuerpo.proyectoId, {
      tipo: cuerpo.tipo,
      destino: cuerpo.destino,
      convocatoriaId: cuerpo.convocatoriaId,
    })

    return NextResponse.json(resultado, { status: resultado.ok ? 200 : 400 })
  } catch (error: any) {
    console.error('[Réplicas] Error:', error)
    return NextResponse.json(
      { error: 'Error al trabajar la réplica', detalle: error?.message || String(error) },
      { status: 500 },
    )
  }
}

export async function GET(req: Request) {
  try {
    if (!(await esEquipoServing())) {
      return NextResponse.json({ error: 'Solo el equipo de Serving puede usar esta ruta' }, { status: 401 })
    }

    const url = new URL(req.url)

    if (url.searchParams.get('tipos')) {
      return NextResponse.json({ ok: true, tipos: TIPOS_REPLICA })
    }

    const proyectoId = url.searchParams.get('proyectoId')
    if (!proyectoId) {
      return NextResponse.json({ error: 'Falta proyectoId' }, { status: 400 })
    }

    const supabase = cliente()
    const { data, error } = await supabase
      .from('replicas')
      .select('*')
      .eq('proyecto_origen_id', proyectoId)
      .order('creada_en', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'No se pudieron leer las réplicas' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, replicas: data || [] })
  } catch (error: any) {
    console.error('[Réplicas] Error leyendo:', error)
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 })
  }
}
