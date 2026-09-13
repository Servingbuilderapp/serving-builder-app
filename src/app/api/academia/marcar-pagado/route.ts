import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

/**
 * Confirma a mano que llegó el comprobante de la compra de un curso.
 * Es pago único: solo cambia el estado y guarda la fecha de pago.
 *
 * Usa la llave de service role porque `academia_compras` tiene el candado
 * de seguridad (RLS) activado sin políticas abiertas — solo esta llave
 * puede leer y escribir ahí (igual que /api/academia/crear).
 */
export async function POST(req: Request) {
  try {
    const { compraId } = await req.json()
    if (!compraId) {
      return NextResponse.json({ error: 'Falta el id de la compra' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabaseAdmin
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
