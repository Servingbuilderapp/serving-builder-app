import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { armarBotonBold } from '@/lib/bold'
import { PLANES, clienteAdmin, type ClavePlan } from '@/lib/empresarial/membresia'

/**
 * Arma el botón de Bold para pagar un mes del plan del Camino A.
 * Cada mes es un pago nuevo, por eso cada vez se crea una referencia nueva.
 * Cuando Bold avise que el pago fue aprobado, /api/webhooks/bold activa el plan.
 */
export async function POST(req: Request) {
  try {
    const { membresiaId, plan } = (await req.json()) as { membresiaId?: string; plan?: string }
    if (!membresiaId || (plan !== 'sencillo' && plan !== 'completo')) {
      return NextResponse.json({ error: 'Falta elegir el plan' }, { status: 400 })
    }
    const clavePlan = plan as ClavePlan

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Inicia sesión para pagar tu plan' }, { status: 401 })

    const admin = clienteAdmin()
    const { data: fila } = await admin.from('sfpe_membresias').select('id').eq('id', membresiaId).eq('user_id', user.id).maybeSingle()
    if (!fila) return NextResponse.json({ error: 'No encontramos tu plan' }, { status: 404 })

    const referencia = randomUUID()
    await admin.from('sfpe_membresias').update({ plan_pendiente: clavePlan, bold_order_id: referencia }).eq('id', fila.id)

    const origin = new URL(req.url).origin
    const boton = armarBotonBold({
      orderId: referencia,
      amount: PLANES[clavePlan].precioCop,
      currency: 'COP',
      description: `Camino A, plan ${PLANES[clavePlan].nombre} (1 mes)`,
      redirectionUrl: `${origin}/empresarial/membresia?pago=en_proceso`,
    })
    return NextResponse.json(boton)
  } catch (error: unknown) {
    console.error('Error iniciando el cobro del plan del Camino A:', error)
    const mensaje = error instanceof Error ? error.message : 'Error al iniciar el pago'
    return NextResponse.json({ error: mensaje }, { status: 500 })
  }
}
