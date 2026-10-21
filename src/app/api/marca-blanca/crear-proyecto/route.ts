import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { leerSocioPortal, estadoPortal } from '@/lib/sociosGratis'
import { COMISION_CORTESIA_POR_DEFECTO, DIAS_CORTESIA_POR_DEFECTO, ESTADO_PROYECTO_CORTESIA_PENDIENTE } from '@/lib/cortesias'

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
    const esCortesia = paquete === 'cortesia'
    if (!esCortesia && !['estandar', 'premium', 'plan1', 'plan2', 'plan3'].includes(paquete)) {
      return NextResponse.json({ error: 'Elige un paquete' }, { status: 400 })
    }

    const socio = await leerSocioPortal(slug)
    if (!socio) {
      return NextResponse.json({ error: 'Este enlace no existe' }, { status: 404 })
    }

    const portal = await estadoPortal(socio)
    if (!portal.abierto) {
      return NextResponse.json(
        { error: 'Este portal no está activo en este momento. Contacta a quien te compartió este enlace.' },
        { status: 403 }
      )
    }
    // Solo se puede pedir cortesía si el socio todavía tiene proyectos gratis.
    if (esCortesia && !portal.gratis) {
      return NextResponse.json({ error: 'Elige un paquete' }, { status: 400 })
    }
    // Si el socio ofrece proyectos gratis, ese es el camino mientras queden.
    const comoCortesia = portal.gratis

    const diasVentana = paquete === 'premium' || paquete === 'plan3' ? 90 : 45
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
        estado_actual: comoCortesia ? ESTADO_PROYECTO_CORTESIA_PENDIENTE : 'pagado',
        estado_comercial: 'nuevo',
        contrato_firmado: !comoCortesia,
        firma_digital: comoCortesia ? null : { nombre: nombreCliente, aceptado: true, fecha: new Date().toISOString(), ip },
        plan_pago: comoCortesia ? 'cortesia' : paquete === 'premium' || paquete === 'plan3' ? 'premium_mb' : 'estandar_mb',
        canal_origen: 'marca_blanca',
        vertical_asignada: 'General',
        socio_id: socio.id,
        fecha_limite_entrega: fechaLimite.toISOString(),
        pasarela_pago: 'Ninguno',
      })
      .select('id')
      .single()

    if (error) throw error

    if (comoCortesia) {
      const { error: errCort } = await supabaseAdmin.from('cortesias').insert({
        proyecto_id: String(data.id),
        correo: String(correoCliente).trim().toLowerCase(),
        nombre: nombreCliente,
        whatsapp,
        iniciativa: nombreIniciativa,
        origen: socio.marca || socio.nombre,
        socio_id: socio.id,
        comision_pct: COMISION_CORTESIA_POR_DEFECTO,
        dias: DIAS_CORTESIA_POR_DEFECTO,
        estado: 'invitada',
      })
      if (errCort) throw errCort
    }

    return NextResponse.json({
      success: true,
      proyectoId: data.id,
      esUsuarioNuevo,
      passwordTemporal,
    })
  } catch (error) {
    const detalle =
      error && typeof error === 'object' && 'message' in error
        ? String((error as { message?: unknown }).message)
        : error instanceof Error
        ? error.message
        : 'Error al crear el proyecto'
    console.error('[api/marca-blanca/crear-proyecto] Error:', error)
    return NextResponse.json({ error: detalle }, { status: 500 })
  }
}
