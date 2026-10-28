import { NextRequest, NextResponse, after } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { motorAutorizado, cabecerasInternas } from '@/lib/candadoMotores'
import { elegirConvocatoriaDeBiblioteca } from '@/lib/elegirDeBiblioteca'

/**
 * El cliente confirma su abanico: marca a cuáles de las convocatorias preparadas quiere
 * entrar. Para cada una elegida pasa lo mismo que cuando elige una en "Mis convocatorias":
 * queda como convocatoria elegida del proyecto y arranca el análisis completo de encaje y
 * la preparación de su postulación. Las que descarta quedan guardadas, sin gastar más.
 *
 * POST { abanicoId, replicaIds: string[] }
 */

export const maxDuration = 120

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { abanicoId, replicaIds } = await req.json().catch(() => ({}))
    if (!abanicoId || !Array.isArray(replicaIds)) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const { data: abanico } = await supabase
      .from('abanicos')
      .select('id, proyecto_id, estado')
      .eq('id', abanicoId)
      .maybeSingle()
    if (!abanico) return NextResponse.json({ error: 'No encontramos tu abanico' }, { status: 404 })

    if (!(await motorAutorizado(req, String(abanico.proyecto_id)))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (abanico.estado !== 'listo') {
      return NextResponse.json(
        { error: abanico.estado === 'confirmado' ? 'Ya confirmaste este abanico.' : 'Tu abanico todavía no está listo.' },
        { status: 409 },
      )
    }

    const { data: replicas } = await supabase
      .from('replicas')
      .select('id, biblioteca_id')
      .eq('abanico_id', abanico.id)
    const delAbanico = (replicas || []) as { id: string; biblioteca_id: string | null }[]
    const idsValidos = new Set(delAbanico.map((r) => String(r.id)))

    const elegidasIds = (replicaIds as string[]).map(String).filter((id) => idsValidos.has(id))
    if (elegidasIds.length === 0) {
      return NextResponse.json({ error: 'Escoge al menos una convocatoria.' }, { status: 400 })
    }

    const candidatas: string[] = []
    for (const replica of delAbanico.filter((r) => elegidasIds.includes(String(r.id)))) {
      if (!replica.biblioteca_id) continue
      const resultado = await elegirConvocatoriaDeBiblioteca(supabase, String(abanico.proyecto_id), String(replica.biblioteca_id))
      if (resultado.ok && resultado.idCandidata && !resultado.yaElegida) candidatas.push(resultado.idCandidata)
    }

    await supabase.from('replicas').update({ abanico_eleccion: 'elegida' }).in('id', elegidasIds)
    const descartadasIds = delAbanico.map((r) => String(r.id)).filter((id) => !elegidasIds.includes(id))
    if (descartadasIds.length > 0) {
      await supabase.from('replicas').update({ abanico_eleccion: 'descartada' }).in('id', descartadasIds)
    }
    await supabase.from('abanicos').update({ estado: 'confirmado' }).eq('id', abanico.id)

    // El análisis completo de cada convocatoria elegida arranca solo, en segundo plano.
    const origen = req.nextUrl.origin
    for (const id_convocatoria of candidatas) {
      after(async () => {
        try {
          await fetch(`${origen}/api/analizar-encaje`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...cabecerasInternas() },
            body: JSON.stringify({ id_convocatoria }),
          })
        } catch (e) {
          console.error('[abanico/confirmar] Error disparando el análisis de encaje:', e)
        }
      })
    }

    return NextResponse.json({
      ok: true,
      elegidas: elegidasIds.length,
      mensaje: 'Listo: ya estamos preparando tus postulaciones. Las verás en Mis convocatorias.',
    })
  } catch (e) {
    console.error('[abanico/confirmar] Error:', e)
    return NextResponse.json({ error: 'Error al confirmar tu abanico' }, { status: 500 })
  }
}
