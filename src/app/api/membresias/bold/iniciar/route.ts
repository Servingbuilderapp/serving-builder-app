import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { armarBotonBold } from '@/lib/bold'

/**
 * Arma los datos firmados que necesita el botón de Bold para cobrar una
 * membresía que ya se creó como 'pendiente_pago' (ver /api/membresias/crear).
 *
 * Usa la llave de service role porque `membresias_clientes` tiene el
 * candado de seguridad (RLS) activado sin políticas abiertas para esto.
 */
export async function POST(req: Request) {
  try {
    const { membresiaId } = await req.json()
    if (!membresiaId) {
      return NextResponse.json({ error: 'Falta el id de la membresía' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: membresia, error } = await supabaseAdmin
      .from('membresias_clientes')
      .select('id, nivel, ciclo, estado, pais, monto_cop')
      .eq('id', membresiaId)
      .single()

    if (error || !membresia) {
      return NextResponse.json({ error: 'No se encontró la membresía' }, { status: 404 })
    }
    if (membresia.estado !== 'pendiente_pago') {
      return NextResponse.json({ error: 'Esta membresía ya no está pendiente de pago' }, { status: 409 })
    }
    if (membresia.pais !== 'colombia' || !membresia.monto_cop) {
      return NextResponse.json(
        { error: 'El botón de Bold solo aplica a pagos en pesos colombianos' },
        { status: 400 }
      )
    }

    const origin = new URL(req.url).origin
    const boton = armarBotonBold({
      orderId: membresia.id,
      amount: membresia.monto_cop,
      currency: 'COP',
      description: `Membresía ${membresia.nivel} (${membresia.ciclo})`.slice(0, 100),
      redirectionUrl: `${origin}/membresia?pago=en_proceso`,
    })

    // Se guarda para poder relacionar el webhook con esta membresía.
    await supabaseAdmin.from('membresias_clientes').update({ bold_order_id: boton.orderId }).eq('id', membresia.id)

    return NextResponse.json(boton)
  } catch (error: unknown) {
    console.error('Error iniciando cobro de Bold para una membresía:', error)
    const mensaje = error instanceof Error ? error.message : 'Error al iniciar el pago'
    return NextResponse.json({ error: mensaje }, { status: 500 })
  }
}
