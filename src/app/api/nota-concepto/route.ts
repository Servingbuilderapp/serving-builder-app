import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { motorAutorizado } from '@/lib/candadoMotores'
import { generarNotaConcepto } from '@/lib/motorNotaConcepto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export const maxDuration = 120

/**
 * POST: genera una Nota de Concepto nueva para un proyecto.
 *
 * En el uso normal esto lo dispara SOLO el propio Motor 1, automáticamente,
 * cuando la estructuración queda lista (ver estructurar-proyecto/route.ts).
 * Esta puerta sigue abierta para el equipo o el dueño del proyecto, por si
 * hay que volver a generarla a mano (por ejemplo, después de que el cliente
 * completó información que faltaba).
 */
export async function POST(req: NextRequest) {
  try {
    const { id_proyecto } = await req.json()

    if (!id_proyecto) {
      return NextResponse.json({ error: 'Falta id_proyecto' }, { status: 400 })
    }

    if (!(await motorAutorizado(req, id_proyecto))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const resultado = await generarNotaConcepto(supabase, id_proyecto)
    if (!resultado.ok) {
      return NextResponse.json({ ok: false, error: resultado.mensaje }, { status: 500 })
    }

    return NextResponse.json({ ok: true, notaId: resultado.notaId, mensaje: resultado.mensaje })
  } catch (err: any) {
    console.error('[Nota de Concepto] Error en la API:', err)
    return NextResponse.json(
      { error: 'Error al generar la nota de concepto', detalle: err?.message || String(err) },
      { status: 500 },
    )
  }
}

/** GET: trae la nota de concepto más reciente de un proyecto (y cuántas hay). */
export async function GET(req: NextRequest) {
  const idProyecto = req.nextUrl.searchParams.get('id_proyecto')
  if (!idProyecto) {
    return NextResponse.json({ error: 'Falta id_proyecto' }, { status: 400 })
  }

  if (!(await motorAutorizado(req, idProyecto))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('notas_concepto')
    .select('id, idioma, contenido_es, contenido_en, temas_faltantes, creada_en')
    .eq('proyecto_id', idProyecto)
    .order('creada_en', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'No se pudo leer el historial' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, notas: data || [] })
}
