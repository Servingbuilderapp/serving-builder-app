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

/**
 * CREAR UNA SOLICITUD DE MEMBRESÍA
 *
 * No cobra nada: solo guarda la solicitud como 'pendiente_pago' y, si el
 * correo es nuevo, crea la cuenta de acceso — igual que /api/proyectos/crear.
 * El equipo confirma el pago a mano cuando llega el comprobante por WhatsApp,
 * desde /admin/membresias.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { nombreCliente, correoCliente, whatsapp, pais, nivel, ciclo, montoUsd, montoCop } = body

    if (!nombreCliente || !correoCliente || !whatsapp || !nivel || !ciclo) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let passwordTemporal: string | null = null
    let esUsuarioNuevo = false

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
      .from('membresias_clientes')
      .insert({
        nombre_cliente: nombreCliente,
        correo_cliente: correoCliente,
        telefono_whatsapp: whatsapp,
        pais,
        nivel,
        ciclo,
        monto_usd: montoUsd,
        monto_cop: montoCop || null,
        estado: 'pendiente_pago',
      })
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      membresiaId: data.id,
      esUsuarioNuevo,
      passwordTemporal,
    })
  } catch (error: unknown) {
    console.error('Error creando membresía:', error)
    const mensaje = error instanceof Error ? error.message : 'Error al crear la membresía'
    return NextResponse.json({ error: mensaje }, { status: 500 })
  }
}
