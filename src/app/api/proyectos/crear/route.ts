import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      nombreCliente,
      correoCliente,
      whatsapp,
      nombreIniciativa,
      planPago,
      montoCop,
      montoUsd,
      pais, // 'colombia' | 'internacional'
    } = body

    if (!nombreCliente || !correoCliente || !whatsapp || !planPago) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
    }

    const forwardedFor = req.headers.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'desconocida'

    const firmaDigital = {
      nombre: nombreCliente,
      aceptado: true,
      fecha: new Date().toISOString(),
      ip,
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('proyectos_clientes_serving')
      .insert({
        nombre_cliente: nombreCliente,
        correo_cliente: correoCliente,
        telefono_whatsapp: whatsapp,
        vertical_asignada: 'sin_clasificar',
        nombre_iniciativa: nombreIniciativa || nombreCliente,
        plan_pago: planPago,
        monto_solicitado_cop: montoCop || null,
        monto_solicitado_usd: montoUsd || null,
        estado_actual: 'pendiente_pago',
        estado_comercial: 'nuevo',
        contrato_firmado: true,
        firma_digital: firmaDigital,
        pasarela_pago: pais === 'colombia' ? 'transferencia_colombia' : 'paypal_internacional',
      })
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, proyectoId: data.id })
  } catch (error: any) {
    console.error('Error creando proyecto:', error)
    return NextResponse.json({ error: error.message || 'Error al crear el proyecto' }, { status: 500 })
  }
}
