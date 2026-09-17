import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

/**
 * Crea un proyecto que entra por el enlace propio de un socio de marca
 * blanca (/mb/[slug]). Es una ruta PÚBLICA — no requiere que el cliente
 * haya iniciado sesión, porque todavía no tiene cuenta.
 *
 * Diferencias clave contra /api/proyectos/crear (la de Serving directo):
 *   - No cobra nada aquí. El socio ya le cobró a su cliente por su lado;
 *     Serving nunca ve ese pago. El proyecto arranca directo en estado
 *     'pagado', sin pasar por PayPal ni Bold.
 *   - Solo funciona si el socio tiene el mantenimiento mensual al día
 *     (mantenimiento_pagado_hasta). Si no, no se crea nada — es lo que
 *     "apaga" el portal del socio cuando no ha pagado.
 *   - Guarda socio_id y canal_origen = 'marca_blanca', para que el
 *     proyecto quede separado del resto (ver /socio y /admin/marca-blanca).
 *   - El plazo (fecha_limite_entrega) sale del paquete elegido: 45 días
 *     para Estándar, 90 para Premium (acuerdo del 16 sep 2026).
 *
 * De ahí en adelante, el cliente entra con la cuenta que se le crea aquí
 * y sigue exactamente las mismas pantallas que un cliente directo de
 * Serving (subir su idea en "Lo que me piden", que dispara el mismo
 * motor de estructuración) — no se duplica ninguna lógica.
 */

function generarPasswordTemporal() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let pass = ''
  for (let i = 0; i < 10; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return pass
}

export async function POST(req: Request) {
  try {
    const { slug, nombreCliente, correoCliente, whatsapp, nombreIniciativa, paquete } = await req.json()

    if (!slug || !nombreCliente || !correoCliente || !whatsapp || !nombreIniciativa) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
    }
    if (paquete !== 'estandar' && paquete !== 'premium') {
      return NextResponse.json({ error: 'Elige un paquete' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    const { data: socio } = await supabaseAdmin
      .from('socios')
      .select('id, nombre, activo, mantenimiento_pagado_hasta')
      .eq('slug', slug)
      .maybeSingle<{ id: string; nombre: string; activo: boolean | null; mantenimiento_pagado_hasta: string | null }>()

    if (!socio) {
      return NextResponse.json({ error: 'Este enlace no existe' }, { status: 404 })
    }

    const hoy = new Date().toISOString().slice(0, 10)
    const mantenimientoAlDia = !!socio.mantenimiento_pagado_hasta && socio.mantenimiento_pagado_hasta >= hoy

    if (!socio.activo || !mantenimientoAlDia) {
      return NextResponse.json(
        { error: 'Este portal no está activo en este momento. Contacta a quien te compartió este enlace.' },
        { status: 403 }
      )
    }

    const diasVentana = paquete === 'premium' ? 90 : 45
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() + diasVentana)

    let passwordTemporal: string | null = null
    let esUsuarioNuevo = false

    const { data: usuariosExistentes } = await supabaseAdmin.auth.admin.listUsers()
    const yaExiste = usuariosExistentes?.users?.some(
      (u) => u.email?.toLowerCase() === String(correoCliente).toLowerCase()
    )

    if (!yaExiste) {
      passwordTemporal = generarPasswordTemporal()
      const { error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: correoCliente,
        password: passwordTemporal,
        email_confirm: true,
        user_metadata: { first_name: String(nombreCliente).split(' ')[0] },
      })
      if (authError) {
        console.error('No se pudo crear la cuenta de acceso (marca blanca):', authError)
      } else {
        esUsuarioNuevo = true
      }
    }

    const forwardedFor = req.headers.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'desconocida'

    const { data, error } = await supabaseAdmin
      .from('proyectos_clientes_serving')
      .insert({
        nombre_cliente: nombreCliente,
        correo_cliente: correoCliente,
        telefono_whatsapp: whatsapp,
        nombre_iniciativa: nombreIniciativa,
        estado_actual: 'pagado',
        estado_comercial: 'nuevo',
        contrato_firmado: true,
        firma_digital: { nombre: nombreCliente, aceptado: true, fecha: new Date().toISOString(), ip },
        plan_pago: paquete === 'premium' ? 'premium_mb' : 'estandar_mb',
        canal_origen: 'marca_blanca',
        socio_id: socio.id,
        fecha_limite_entrega: fechaLimite.toISOString(),
        pasarela_pago: 'Ninguno',
      })
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      proyectoId: data.id,
      esUsuarioNuevo,
      passwordTemporal,
    })
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al crear el proyecto'
    return NextResponse.json({ error: mensaje }, { status: 500 })
  }
}
