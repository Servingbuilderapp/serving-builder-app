import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { verificarFirmaWebhookBold } from '@/lib/bold'

export const dynamic = 'force-dynamic'

/**
 * Webhook de Bold — Bold llama aquí solo cuando un pago cambia de estado.
 * Esta ruta, por ahora, solo sabe activar compras de Academia. El día que
 * se conecte Bold a membresías, estructuración o réplicas, este mismo
 * archivo se extiende para reconocer también esas referencias — no hace
 * falta una ruta nueva por cada producto.
 *
 * IMPORTANTE: hay que registrar esta URL en el panel de Bold
 * (Integraciones → Webhooks): https://<tu-dominio>/api/webhooks/bold
 */
export async function POST(req: Request) {
  const cuerpoCrudo = await req.text()
  const firma = req.headers.get('x-bold-signature')

  if (!verificarFirmaWebhookBold(cuerpoCrudo, firma)) {
    console.error('Webhook de Bold con firma inválida — se ignora.')
    return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
  }

  let evento: {
    type?: string
    data?: { payment_id?: string; metadata?: { reference?: string } }
  }
  try {
    evento = JSON.parse(cuerpoCrudo)
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  // Solo nos interesa cuando el pago quedó aprobado.
  if (evento.type !== 'SALE_APPROVED') {
    return NextResponse.json({ recibido: true })
  }

  const paymentId = evento.data?.payment_id
  const referencia = evento.data?.metadata?.reference

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Idempotencia: si Bold reenvía el mismo aviso, no se procesa dos veces.
  if (paymentId) {
    const { data: yaProcesado } = await supabaseAdmin
      .from('academia_compras')
      .select('id')
      .eq('bold_payment_id', paymentId)
      .maybeSingle()
    if (yaProcesado) {
      return NextResponse.json({ recibido: true, yaProcesado: true })
    }
  }

  if (!referencia) {
    console.error('Webhook de Bold aprobado sin referencia — no se puede saber qué compra activar.', {
      paymentId,
    })
    return NextResponse.json({ recibido: true, sinReferencia: true })
  }

  const { data: compra } = await supabaseAdmin
    .from('academia_compras')
    .select('id, estado')
    .or(`id.eq.${referencia},bold_order_id.eq.${referencia}`)
    .maybeSingle()

  if (!compra) {
    console.error('Webhook de Bold aprobado pero no se encontró la compra de Academia con esa referencia.', {
      referencia,
      paymentId,
    })
    return NextResponse.json({ recibido: true, compraNoEncontrada: true })
  }

  if (compra.estado !== 'pagado') {
    await supabaseAdmin
      .from('academia_compras')
      .update({
        estado: 'pagado',
        fecha_pago: new Date().toISOString(),
        bold_payment_id: paymentId || null,
      })
      .eq('id', compra.id)
  }

  return NextResponse.json({ recibido: true })
}
