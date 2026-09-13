import { NextResponse } from 'next/server'
import { after } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { verificarFirmaWebhookBold } from '@/lib/bold'
import { arrancarEstructuracion } from '@/lib/arrancarEstructuracion'

export const dynamic = 'force-dynamic'

/**
 * Webhook de Bold — Bold llama aquí solo cuando un pago cambia de estado.
 *
 * Reconoce pagos de tres productos, buscando la referencia en orden en:
 *   1. academia_compras      (cursos y mentorías de Academia)
 *   2. proyectos_clientes_serving  (anticipo de Estructuración)
 *   3. membresias_clientes   (Explorador / Constructor)
 *
 * El día que se conecte Bold a Réplicas, este mismo archivo se extiende con
 * un cuarto bloque — no hace falta una ruta nueva por cada producto.
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

  if (!referencia) {
    console.error('Webhook de Bold aprobado sin referencia — no se puede saber qué compra activar.', {
      paymentId,
    })
    return NextResponse.json({ recibido: true, sinReferencia: true })
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Idempotencia: si Bold reenvía el mismo aviso, no se procesa dos veces en
  // ninguna de las tres tablas.
  if (paymentId) {
    const [academiaYa, proyectoYa, membresiaYa] = await Promise.all([
      supabaseAdmin.from('academia_compras').select('id').eq('bold_payment_id', paymentId).maybeSingle(),
      supabaseAdmin.from('proyectos_clientes_serving').select('id').eq('bold_payment_id', paymentId).maybeSingle(),
      supabaseAdmin.from('membresias_clientes').select('id').eq('bold_payment_id', paymentId).maybeSingle(),
    ])
    if (academiaYa.data || proyectoYa.data || membresiaYa.data) {
      return NextResponse.json({ recibido: true, yaProcesado: true })
    }
  }

  // 1) Academia
  const { data: compra } = await supabaseAdmin
    .from('academia_compras')
    .select('id, estado')
    .or(`id.eq.${referencia},bold_order_id.eq.${referencia}`)
    .maybeSingle()

  if (compra) {
    if (compra.estado !== 'pagado') {
      await supabaseAdmin
        .from('academia_compras')
        .update({ estado: 'pagado', fecha_pago: new Date().toISOString(), bold_payment_id: paymentId || null })
        .eq('id', compra.id)
    }
    return NextResponse.json({ recibido: true })
  }

  // 2) Estructuración — el anticipo pone el proyecto en marcha, igual que
  // hace hoy a mano /api/proyectos/marcar-pagado.
  const { data: proyecto } = await supabaseAdmin
    .from('proyectos_clientes_serving')
    .select('id, estado_actual')
    .or(`id.eq.${referencia},bold_order_id.eq.${referencia}`)
    .maybeSingle()

  if (proyecto) {
    if (proyecto.estado_actual !== 'pagado') {
      await supabaseAdmin
        .from('proyectos_clientes_serving')
        .update({ estado_actual: 'pagado', bold_payment_id: paymentId || null })
        .eq('id', proyecto.id)

      const origen = new URL(req.url).origin
      after(async () => {
        await arrancarEstructuracion(String(proyecto.id), origen)
      })
    }
    return NextResponse.json({ recibido: true })
  }

  // 3) Membresías
  const { data: membresia } = await supabaseAdmin
    .from('membresias_clientes')
    .select('id, estado, ciclo')
    .or(`id.eq.${referencia},bold_order_id.eq.${referencia}`)
    .maybeSingle()

  if (membresia) {
    if (membresia.estado !== 'activa') {
      const ahora = new Date()
      const proximoPago = new Date(ahora)
      if (membresia.ciclo === 'anual') {
        proximoPago.setFullYear(proximoPago.getFullYear() + 1)
      } else {
        proximoPago.setDate(proximoPago.getDate() + 30)
      }
      await supabaseAdmin
        .from('membresias_clientes')
        .update({
          estado: 'activa',
          fecha_inicio: ahora.toISOString(),
          fecha_proximo_pago: proximoPago.toISOString(),
          bold_payment_id: paymentId || null,
        })
        .eq('id', membresia.id)
    }
    return NextResponse.json({ recibido: true })
  }

  console.error('Webhook de Bold aprobado pero no se encontró ninguna compra con esa referencia.', {
    referencia,
    paymentId,
  })
  return NextResponse.json({ recibido: true, compraNoEncontrada: true })
}
