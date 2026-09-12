import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Confirma a mano que llegó el comprobante de la compra de un curso.
 * Es pago único: solo cambia el estado y guarda la fecha de pago.
 */
export async function POST(req: Request) {
  try {
    const { compraId } = await req.json()
    if (!compraId) {
      return NextResponse.json({ error: 'Falta el id de la compra' }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('academia_compras')
      .update({
        estado: 'pagado',
        fecha_pago: new Date().toISOString(),
      })
      .eq('id', compraId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error marcando compra de Academia como pagada:', error)
    const mensaje = error instanceof Error ? error.message : 'Error al confirmar el pago'
    return NextResponse.json({ error: mensaje }, { status: 500 })
  }
}
