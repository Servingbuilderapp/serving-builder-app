import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { nivelPorSlug, precioAnualUsd } from '@/lib/membresias'
import { obtenerTasa, precioColombia } from '@/lib/tasaCambio'
import { VERSION_ACEPTACION_MEMBRESIA, textoAceptacionMembresia } from '@/lib/aceptacionMembresia'

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
    if (body.aceptaTerminos !== true) {
      return NextResponse.json({ error: 'Debes aceptar las condiciones de la membresía para continuar.' }, { status: 400 })
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

    // El precio en pesos (con IVA) se calcula aquí con la tasa del día; no se confía en el que manda el navegador.
    let montoCopFinal: number | null = null
    if (pais === 'colombia') {
      const n = nivelPorSlug(nivel)
      if (n) {
        const usd = ciclo === 'anual' ? precioAnualUsd(n) : n.precioMensualUsd
        montoCopFinal = precioColombia(usd, (await obtenerTasa()).tasa).total
      } else {
        montoCopFinal = montoCop || null
      }
    }

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
        monto_cop: montoCopFinal,
        estado: 'pendiente_pago',
      })
      .select('id')
      .single()

    if (error) throw error

    // Constancia de lo que aceptó. Va aparte y nunca frena la compra: si las columnas
    // todavía no existen (falta correr supabase_migration_membresias_aceptacion.sql), solo se avisa en el registro.
    const { error: errorConstancia } = await supabaseAdmin
      .from('membresias_clientes')
      .update({
        texto_aceptado: textoAceptacionMembresia(ciclo === 'anual' ? 'anual' : 'mensual'),
        version_aceptacion: VERSION_ACEPTACION_MEMBRESIA,
        aceptado_en: new Date().toISOString(),
        ip_aceptacion: (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || null,
      })
      .eq('id', data.id)
    if (errorConstancia) console.error('No se pudo guardar la constancia de aceptación de la membresía:', errorConstancia)

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
