import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { armarBotonBold } from '@/lib/bold'
import { desglosarPrecio } from '@/lib/mediosDePago'

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
    const { proyectoId } = await req.json()
    if (!proyectoId) {
      return NextResponse.json({ error: 'Falta el id del proyecto' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: proyecto, error } = await supabaseAdmin
      .from('proyectos_clientes_serving')
      .select('id, nombre_iniciativa, estado_actual, monto_solicitado_cop, pasarela_pago')
      .eq('id', proyectoId)
      .single()

    if (error || !proyecto) {
      return NextResponse.json({ error: 'No se encontró el proyecto' }, { status: 404 })
    }
    if (proyecto.estado_actual !== 'pendiente_pago') {
      return NextResponse.json({ error: 'Este proyecto ya no está pendiente de pago' }, { status: 409 })
    }
    if (proyecto.pasarela_pago !== 'Manual' || !proyecto.monto_solicitado_cop) {
      return NextResponse.json(
        { error: 'El botón de Bold solo aplica a pagos en pesos colombianos' },
        { status: 400 }
      )
    }

    const precio = desglosarPrecio(proyecto.monto_solicitado_cop)
    const montoACobrar = precio.anticipoConIva > 0 ? precio.anticipoConIva : precio.total
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
      description: `Anticipo — ${(proyecto.nombre_iniciativa || 'Estructuración').slice(0, 90)}`,
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
