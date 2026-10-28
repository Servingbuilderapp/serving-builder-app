import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { armarBotonBold } from '@/lib/bold'
import { motorAutorizado } from '@/lib/candadoMotores'
import { precioAbanico } from '@/lib/abanico'

/**
 * Arma los datos firmados que necesita el botón de Bold para cobrar el abanico.
 * Mismo patrón que el resto de productos: la referencia del cobro es el id de la compra,
 * y cuando Bold avisa que se aprobó (/api/webhooks/bold) el abanico arranca solo.
 */

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { abanicoId } = await req.json().catch(() => ({}))
    if (!abanicoId) return NextResponse.json({ error: 'Falta la compra' }, { status: 400 })

    const { data: abanico } = await supabase
      .from('abanicos')
      .select('id, proyecto_id, estado')
      .eq('id', abanicoId)
      .maybeSingle()
    if (!abanico) return NextResponse.json({ error: 'No encontramos la compra' }, { status: 404 })

    if (!(await motorAutorizado(req, String(abanico.proyecto_id)))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (abanico.estado !== 'pendiente_pago') {
      return NextResponse.json({ error: 'Este abanico ya está pagado' }, { status: 409 })
    }

    const { data: proyecto } = await supabase
      .from('proyectos_clientes_serving')
      .select('nombre_iniciativa, pasarela_pago')
      .eq('id', abanico.proyecto_id)
      .maybeSingle()

    const precio = precioAbanico(proyecto?.pasarela_pago)
    const origen = req.nextUrl.origin
    const boton = armarBotonBold({
      orderId: String(abanico.id),
      amount: precio.monto,
      currency: precio.moneda,
      description: `Armar mi abanico — ${(proyecto?.nombre_iniciativa || 'proyecto').slice(0, 80)}`,
      redirectionUrl: `${origen}/mi-abanico?pago=en_proceso`,
    })

    await supabase.from('abanicos').update({ bold_order_id: boton.orderId }).eq('id', abanico.id)
    return NextResponse.json(boton)
  } catch (e) {
    console.error('[abanico/iniciar-pago] Error:', e)
    const mensaje = e instanceof Error ? e.message : 'Error al iniciar el pago'
    return NextResponse.json({ error: mensaje }, { status: 500 })
  }
}
