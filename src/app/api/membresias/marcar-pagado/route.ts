import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Confirma a mano que llegó el comprobante de una membresía.
 * Pone la fecha de inicio hoy y la próxima fecha de pago a 30 o 365 días,
 * según el ciclo elegido.
 */
export async function POST(req: Request) {
  try {
    const { membresiaId } = await req.json()
    if (!membresiaId) {
      return NextResponse.json({ error: 'Falta el id de la membresía' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: membresia, error: errorLectura } = await supabase
      .from('membresias_clientes')
      .select('ciclo')
      .eq('id', membresiaId)
      .single()

    if (errorLectura || !membresia) {
      return NextResponse.json({ error: 'No se encontró la membresía' }, { status: 404 })
    }

    const ahora = new Date()
    const proximoPago = new Date(ahora)
    if (membresia.ciclo === 'anual') {
      proximoPago.setFullYear(proximoPago.getFullYear() + 1)
    } else {
      proximoPago.setDate(proximoPago.getDate() + 30)
    }

    const { error } = await supabase
      .from('membresias_clientes')
      .update({
        estado: 'activa',
        fecha_inicio: ahora.toISOString(),
        fecha_proximo_pago: proximoPago.toISOString(),
      })
      .eq('id', membresiaId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error marcando membresía como pagada:', error)
    const mensaje = error instanceof Error ? error.message : 'Error al confirmar el pago'
    return NextResponse.json({ error: mensaje }, { status: 500 })
  }
}
