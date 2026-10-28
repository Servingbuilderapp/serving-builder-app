import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { esEquipoServing } from '@/lib/guardiaEquipo'

/**
 * Enciende o apaga el portal de un socio de marca blanca.
 * Solo el equipo de Serving. Marca blanca no tiene precios ni cupos en la
 * plataforma: lo pactado con cada socio se maneja fuera, y aquí solo se
 * decide si su enlace propio (/mb/<slug>) está abierto o cerrado.
 */
export async function POST(req: Request) {
  try {
    if (!(await esEquipoServing())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { socioId, activo } = await req.json()
    if (!socioId || typeof activo !== 'boolean') {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from('socios').update({ activo }).eq('id', socioId)
    if (error) throw error

    return NextResponse.json({ success: true, activo })
  } catch (error) {
    const detalle =
      error && typeof error === 'object' && 'message' in error
        ? String((error as { message?: unknown }).message)
        : 'Error al cambiar el estado del portal'
    console.error('[api/admin/socios/estado] Error:', error)
    return NextResponse.json({ error: detalle }, { status: 500 })
  }
}
