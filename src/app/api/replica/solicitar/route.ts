import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { PRECIOS_REPLICA, type ModalidadReplica } from '@/lib/precioReplicas'

/**
 * Puerta de entrada del cliente al Portal de Réplicas.
 *
 * Antes, para pedir una réplica, el proyecto tenía que existir ya adentro de
 * la plataforma. Esta ruta deja que un cliente llegue de afuera con su propio
 * documento (y, si ya lo presentó a una convocatoria, la retroalimentación
 * que recibió) y arranque desde ahí.
 *
 * No reinventa nada: crea un proyecto normal en `proyectos_clientes_serving`
 * — igual que cualquier otro — marcado como solicitud de réplica. De ahí en
 * adelante el documento se sube y se procesa con el mismo Motor 1 de siempre
 * (`/api/arrancar-estructuracion`), así que toda la cadena que ya existe
 * (Motor 1 → Motor 2 → Motor 3) queda disponible sin trabajo extra.
 *
 * POST  crea el proyecto (sin documento todavía). Devuelve el proyectoId
 *       para que la pantalla siga con la subida del archivo.
 * PATCH guarda la retroalimentación, cuando el cliente la sube como archivo
 *       aparte del documento del proyecto.
 */

function admin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : ''
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: 'Tienes que iniciar sesión para solicitar una réplica.' }, { status: 401 })
    }

    const cuerpo = await req.json().catch(() => ({}))
    const nombreCliente = texto(cuerpo.nombreCliente)
    const telefonoWhatsapp = texto(cuerpo.telefonoWhatsapp)
    const nombreIniciativa = texto(cuerpo.nombreIniciativa)
    const modalidad = texto(cuerpo.modalidad) as ModalidadReplica
    const retroalimentacionTexto = texto(cuerpo.retroalimentacionTexto)

    if (!nombreCliente || !telefonoWhatsapp || !nombreIniciativa) {
      return NextResponse.json({ error: 'Falta el nombre, el proyecto o el WhatsApp de contacto.' }, { status: 400 })
    }

    if (!(modalidad in PRECIOS_REPLICA)) {
      return NextResponse.json({ error: 'Falta indicar si el proyecto ya se presentó a una convocatoria.' }, { status: 400 })
    }

    if (modalidad === 'ya_presentado' && !retroalimentacionTexto) {
      return NextResponse.json(
        { error: 'Como ya se presentó antes, cuéntanos qué retroalimentación recibieron (puedes ampliarla con un archivo después).' },
        { status: 400 },
      )
    }

    const servicio = admin()

    const { data, error } = await servicio
      .from('proyectos_clientes_serving')
      .insert({
        nombre_cliente: nombreCliente,
        correo_cliente: user.email,
        telefono_whatsapp: telefonoWhatsapp,
        nombre_iniciativa: nombreIniciativa,
        plan_pago: 'replica',
        estado_actual: 'Estructurando_IA',
        estado_comercial: 'Réplica solicitada por el cliente',
        progreso_estructuracion: 0,
        es_solicitud_replica_cliente: true,
        modalidad_replica_solicitada: modalidad,
        retroalimentacion_convocatoria: retroalimentacionTexto || null,
      })
      .select('id')
      .single()

    if (error || !data) {
      console.error('[Réplicas] No se pudo crear la solicitud:', error)
      return NextResponse.json({ error: 'No se pudo registrar la solicitud. Intenta de nuevo.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, proyectoId: data.id })
  } catch (error: any) {
    console.error('[Réplicas] Error al solicitar:', error)
    return NextResponse.json({ error: error?.message || 'Error al registrar la solicitud.' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const cuerpo = await req.json().catch(() => ({}))
    const proyectoId = texto(cuerpo.proyectoId)
    const retroalimentacionArchivoUrl = texto(cuerpo.retroalimentacionArchivoUrl)
    const retroalimentacionArchivoNombre = texto(cuerpo.retroalimentacionArchivoNombre)

    if (!proyectoId || !retroalimentacionArchivoUrl) {
      return NextResponse.json({ error: 'Falta el proyecto o el archivo.' }, { status: 400 })
    }

    const servicio = admin()

    const { data: proyecto } = await servicio
      .from('proyectos_clientes_serving')
      .select('id, correo_cliente')
      .eq('id', proyectoId)
      .maybeSingle<{ id: string; correo_cliente: string | null }>()

    const esDueno =
      (proyecto?.correo_cliente || '').toLowerCase().trim() === (user.email || '').toLowerCase().trim()

    if (!proyecto || !esDueno) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { error } = await servicio
      .from('proyectos_clientes_serving')
      .update({
        retroalimentacion_archivo_url: retroalimentacionArchivoUrl,
        retroalimentacion_archivo_nombre: retroalimentacionArchivoNombre || null,
      })
      .eq('id', proyectoId)

    if (error) {
      console.error('[Réplicas] No se pudo guardar el archivo de retroalimentación:', error)
      return NextResponse.json({ error: 'No se pudo guardar el archivo.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('[Réplicas] Error al guardar retroalimentación:', error)
    return NextResponse.json({ error: error?.message || 'Error al guardar el archivo.' }, { status: 500 })
  }
}
