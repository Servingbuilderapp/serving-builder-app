import { NextRequest, NextResponse } from 'next/server'
import { esEquipoServing } from '@/lib/guardiaEquipo'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * "Ya le escribí": el equipo marca que ya contactó (por WhatsApp o llamada) a un cliente.
 * Ese cliente sale de la lista "falta escribirles" durante unos días.
 */
export async function POST(req: NextRequest) {
  if (!(await esEquipoServing())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { proyectoId } = (await req.json().catch(() => ({}))) as { proyectoId?: string }
  if (!proyectoId) return NextResponse.json({ error: 'Falta el proyecto' }, { status: 400 })
  const { error } = await supabaseAdmin
    .from('seguimientos_cliente')
    .upsert(
      { proyecto_id: String(proyectoId), clave: 'wa_manual', veces: 1, ultimo_envio: new Date().toISOString() },
      { onConflict: 'proyecto_id,clave' },
    )
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
