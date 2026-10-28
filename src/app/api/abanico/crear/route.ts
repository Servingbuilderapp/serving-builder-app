import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { motorAutorizado } from '@/lib/candadoMotores'
import { precioAbanico } from '@/lib/abanico'

/**
 * El cliente dice "quiero armar mi abanico": se crea la compra (queda pendiente de pago)
 * y se devuelve su id para que la pantalla muestre el botón de pago de Bold.
 * Si el proyecto ya tiene un abanico, se devuelve ese: no se crean dos.
 */

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { proyectoId } = await req.json().catch(() => ({}))
    if (!proyectoId) return NextResponse.json({ error: 'Falta el proyecto' }, { status: 400 })

    if (!(await motorAutorizado(req, String(proyectoId)))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { data: proyecto } = await supabase
      .from('proyectos_clientes_serving')
      .select('id, correo_cliente, pasarela_pago')
      .eq('id', proyectoId)
      .maybeSingle()
    if (!proyecto?.correo_cliente) {
      return NextResponse.json({ error: 'No encontramos el proyecto' }, { status: 404 })
    }

    const { data: existente } = await supabase
      .from('abanicos')
      .select('id, estado')
      .eq('proyecto_id', String(proyectoId))
      .order('creado_en', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (existente) return NextResponse.json({ ok: true, abanicoId: existente.id, estado: existente.estado })

    const precio = precioAbanico(proyecto.pasarela_pago)
    const { data: nuevo, error } = await supabase
      .from('abanicos')
      .insert({
        proyecto_id: String(proyectoId),
        correo_cliente: String(proyecto.correo_cliente).toLowerCase().trim(),
        estado: 'pendiente_pago',
        precio_usd: precio.usd,
        precio_cop: precio.cop,
        tasa_usd_cop: precio.tasa,
      })
      .select('id')
      .single()

    if (error || !nuevo) {
      console.error('[abanico/crear] No se pudo crear:', JSON.stringify(error))
      return NextResponse.json({ error: 'No se pudo preparar tu compra. Intenta de nuevo.' }, { status: 500 })
    }
    return NextResponse.json({ ok: true, abanicoId: nuevo.id, estado: 'pendiente_pago' })
  } catch (e) {
    console.error('[abanico/crear] Error:', e)
    return NextResponse.json({ error: 'Error al preparar tu compra' }, { status: 500 })
  }
}
