import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

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
    const body = await req.json()
    const {
      nombreCliente,
      correoCliente,
      whatsapp,
      nombreIniciativa,
      planPago,
      montoCop,
      montoUsd,
      pais,
      verticalDiagnostico,
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

    // Cliente con permisos de administrador, solo para crear la cuenta de acceso
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let passwordTemporal: string | null = null
    let esUsuarioNuevo = false

    // Verificar si ya existe una cuenta con este correo
    const { data: usuariosExistentes } = await supabaseAdmin.auth.admin.listUsers()
    const yaExiste = usuariosExistentes?.users?.some(
      (u) => u.email?.toLowerCase() === correoCliente.toLowerCase()
    )

    if (!yaExiste) {
      passwordTemporal = generarPasswordTemporal()
      const { error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: correoCliente,
        password: passwordTemporal,
        email_confirm: true,
        user_metadata: { first_name: nombreCliente.split(' ')[0] },
      })
      if (authError) {
        console.error('No se pudo crear la cuenta de acceso:', authError)
      } else {
        esUsuarioNuevo = true
      }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('proyectos_clientes_serving')
      .insert({
        nombre_cliente: nombreCliente,
        correo_cliente: correoCliente,
        telefono_whatsapp: whatsapp,
        nombre_iniciativa: nombreIniciativa || nombreCliente,
        vertical_asignada: verticalDiagnostico || 'sin_clasificar',
        plan_pago: planPago,
        monto_solicitado_cop: montoCop || null,
        monto_solicitado_usd: montoUsd || null,
        estado_actual: 'pendiente_pago',
        estado_comercial: 'nuevo',
        contrato_firmado: true,
        firma_digital: firmaDigital,
        pasarela_pago: pais === 'colombia' ? 'Manual' : 'PayPal',
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
  } catch (error: any) {
    console.error('Error creando proyecto:', error)
    return NextResponse.json({ error: error.message || 'Error al crear el proyecto' }, { status: 500 })
  }
}
