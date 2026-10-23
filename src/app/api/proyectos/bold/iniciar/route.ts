import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { armarBotonBold } from '@/lib/bold'
import { COBRO_EXTERIOR, desglosarPrecio } from '@/lib/mediosDePago'
import { PLAN_EMPRENDEDOR } from '@/lib/planEmprendedor'

/**
 * Arma los datos firmados que necesita el botón de Bold para cobrar el
 * ANTICIPO (mitad al firmar) de un proyecto de Estructuración que ya se
 * creó como 'pendiente_pago' (ver /api/proyectos/crear).
 *
 * Solo cobra el anticipo automático, igual que hoy hace el equipo a mano en
 * /api/proyectos/marcar-pagado. El segundo pago (saldo, el día de la
 * entrega) sigue funcionando como hasta ahora — no lo toca esta ruta.
 *
 * Usa la llave de service role porque `proyectos_clientes_serving` tiene el
 * candado de seguridad (RLS) activado sin políticas abiertas para esto.
 */
export async function POST(req: Request) {
  try {
    const { proyectoId, pagoCompleto } = await req.json()
    if (!proyectoId) {
      return NextResponse.json({ error: 'Falta el id del proyecto' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: proyecto, error } = await supabaseAdmin
      .from('proyectos_clientes_serving')
      .select('id, nombre_iniciativa, estado_actual, monto_solicitado_cop, monto_solicitado_usd, pasarela_pago, plan_pago')
      .eq('id', proyectoId)
      .single()

    if (error || !proyecto) {
      return NextResponse.json({ error: 'No se encontró el proyecto' }, { status: 404 })
    }
    if (proyecto.estado_actual !== 'pendiente_pago') {
      return NextResponse.json({ error: 'Este proyecto ya no está pendiente de pago' }, { status: 409 })
    }
    // Cliente de otro país: se cobra TODO de una vez, en dólares, sin IVA.
    if (proyecto.pasarela_pago === 'Bold USD') {
      const montoUsd = COBRO_EXTERIOR.precioUsdFijo[proyecto.plan_pago] ?? proyecto.monto_solicitado_usd
      if (!montoUsd) {
        return NextResponse.json({ error: 'Este proyecto no tiene precio en dólares' }, { status: 400 })
      }
      const origenUsd = new URL(req.url).origin
      const botonUsd = armarBotonBold({
        orderId: proyecto.id,
        amount: Math.round(Number(montoUsd)),
        currency: 'USD',
        description: `Pago total — ${(proyecto.nombre_iniciativa || 'Estructuración').slice(0, 90)}`,
        redirectionUrl: `${origenUsd}/contratar?pago=en_proceso`,
      })
      await supabaseAdmin.from('proyectos_clientes_serving').update({ bold_order_id: botonUsd.orderId }).eq('id', proyecto.id)
      return NextResponse.json(botonUsd)
    }
    if (proyecto.pasarela_pago !== 'Manual' || !proyecto.monto_solicitado_cop) {
      return NextResponse.json(
        { error: 'Este proyecto no tiene un cobro automático disponible' },
        { status: 400 }
      )
    }

    const precio = desglosarPrecio(proyecto.monto_solicitado_cop)
    // El cliente puede elegir pagar todo de una vez (pagoCompleto) o en dos
    // partes (por defecto: la mitad al firmar, la otra mitad la cobra el equipo).
    // El plan Emprendedor siempre se paga completo (un solo pago, con IVA).
    const pagaTodo = pagoCompleto === true || proyecto.plan_pago === PLAN_EMPRENDEDOR
    const montoACobrar = pagaTodo || precio.anticipoConIva === 0 ? precio.total : precio.anticipoConIva
    if (!montoACobrar) {
      return NextResponse.json(
        { error: 'Este proyecto no tiene costo de estructuración (solo comisión de éxito)' },
        { status: 400 }
      )
    }

    const origin = new URL(req.url).origin
    const boton = armarBotonBold({
      orderId: proyecto.id,
      amount: montoACobrar,
      currency: 'COP',
      description: `${pagaTodo ? 'Pago total' : 'Anticipo'} — ${(proyecto.nombre_iniciativa || 'Estructuración').slice(0, 90)}`,
      redirectionUrl: `${origin}/contratar?pago=en_proceso`,
    })

    // Se guarda para poder relacionar el webhook con este proyecto.
    await supabaseAdmin.from('proyectos_clientes_serving').update({ bold_order_id: boton.orderId }).eq('id', proyecto.id)

    return NextResponse.json(boton)
  } catch (error: unknown) {
    console.error('Error iniciando cobro de Bold para un proyecto:', error)
    const mensaje = error instanceof Error ? error.message : 'Error al iniciar el pago'
    return NextResponse.json({ error: mensaje }, { status: 500 })
  }
}
