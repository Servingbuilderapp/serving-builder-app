import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { armarBotonBold } from '@/lib/bold'
import { cursoPorSlug } from '@/lib/academia/cursos'

/**
 * Arma los datos firmados que necesita el botón de Bold para cobrar una
 * compra de Academia que ya se creó como 'pendiente_pago'
 * (ver /api/academia/crear). La firma se calcula aquí, en el servidor,
 * porque necesita la llave secreta — nunca se manda al navegador.
 */
export async function POST(req: Request) {
  try {
    const { compraId } = await req.json()
    if (!compraId) {
      return NextResponse.json({ error: 'Falta el id de la compra' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: compra, error } = await supabase
      .from('academia_compras')
      .select('id, curso, monto_cop, estado, pais')
      .eq('id', compraId)
      .single()

    if (error || !compra) {
      return NextResponse.json({ error: 'No se encontró la compra' }, { status: 404 })
    }
    if (compra.estado === 'pagado') {
      return NextResponse.json({ error: 'Esta compra ya está pagada' }, { status: 409 })
    }
    if (compra.pais !== 'colombia' || !compra.monto_cop) {
      return NextResponse.json(
        { error: 'El botón de Bold solo aplica a pagos en pesos colombianos' },
        { status: 400 }
      )
    }

    const curso = cursoPorSlug(compra.curso)
    if (!curso) {
      return NextResponse.json({ error: 'Curso no reconocido' }, { status: 400 })
    }

    const origin = new URL(req.url).origin
    const boton = armarBotonBold({
      orderId: compra.id,
      amount: compra.monto_cop,
      currency: 'COP',
      description: curso.nombre.slice(0, 100),
      redirectionUrl: `${origin}/academia/${curso.slug}?pago=en_proceso`,
    })

    // Se guarda para poder relacionar el webhook con esta compra.
    await supabase.from('academia_compras').update({ bold_order_id: boton.orderId }).eq('id', compra.id)

    return NextResponse.json(boton)
  } catch (error: unknown) {
    console.error('Error iniciando cobro de Bold para Academia:', error)
    const mensaje = error instanceof Error ? error.message : 'Error al iniciar el pago'
    return NextResponse.json({ error: mensaje }, { status: 500 })
  }
}
