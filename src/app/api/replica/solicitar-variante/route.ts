import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { prepararReplica, crearProyectoReplica, TIPOS_REPLICA, type TipoReplica } from '@/lib/motorReplica'
import { armarDestino, CAMPO_DESTINO } from '@/lib/plantillasReplica'

/**
 * El cliente pide él mismo una variante de su réplica — sin que nadie del
 * equipo tenga que apretar un botón. Es el mismo motor que ya usa la pantalla
 * interna (`prepararReplica` + `crearProyectoReplica`), solo que aquí el que
 * llama es el dueño del proyecto, no el equipo de Serving.
 *
 * La modalidad "no_presentado" (USD 2.500) es un pago único que cubre todas
 * las formas en que se termine postulando — por eso no tiene límite de
 * variantes. La modalidad "ya_presentado" (USD 1.800) es una sola
 * repostulación — por eso se cierra después de la primera.
 *
 * POST { proyectoOrigenId, tipo, valorCampoDestino, notaAdicional }
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
      return NextResponse.json({ error: 'Tienes que iniciar sesión.' }, { status: 401 })
    }

    const cuerpo = await req.json().catch(() => ({}))
    const proyectoOrigenId = texto(cuerpo.proyectoOrigenId)
    const tipo = texto(cuerpo.tipo) as TipoReplica
    const valorCampoDestino = texto(cuerpo.valorCampoDestino)
    const notaAdicional = texto(cuerpo.notaAdicional)

    if (!proyectoOrigenId || !tipo) {
      return NextResponse.json({ error: 'Faltan datos: el proyecto y el tipo de réplica.', tipos_validos: TIPOS_REPLICA }, { status: 400 })
    }
    if (!(TIPOS_REPLICA as readonly string[]).includes(tipo)) {
      return NextResponse.json({ error: 'Ese tipo de réplica no existe.', tipos_validos: TIPOS_REPLICA }, { status: 400 })
    }

    const campo = CAMPO_DESTINO[tipo]
    if (campo && !campo.opcional && !valorCampoDestino) {
      return NextResponse.json({ error: `Falta: ${campo.etiqueta.toLowerCase()}.` }, { status: 400 })
    }

    const servicio = admin()

    const { data: proyecto } = await servicio
      .from('proyectos_clientes_serving')
      .select('id, correo_cliente, es_solicitud_replica_cliente, modalidad_replica_solicitada')
      .eq('id', proyectoOrigenId)
      .maybeSingle<{
        id: string
        correo_cliente: string | null
        es_solicitud_replica_cliente: boolean | null
        modalidad_replica_solicitada: string | null
      }>()

    const esDueno = (proyecto?.correo_cliente || '').toLowerCase().trim() === (user.email || '').toLowerCase().trim()

    if (!proyecto || !esDueno || !proyecto.es_solicitud_replica_cliente) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // "ya_presentado" es una sola repostulación. Si ya tiene una variante
    // creada, no se abre otra desde aquí — se atiende aparte con el equipo.
    if (proyecto.modalidad_replica_solicitada === 'ya_presentado') {
      const { count } = await servicio
        .from('replicas')
        .select('id', { count: 'exact', head: true })
        .eq('proyecto_origen_id', proyectoOrigenId)

      if ((count || 0) >= 1) {
        return NextResponse.json(
          { error: 'Esta modalidad incluye una sola repostulación, y ya la pediste. Si necesitas otra, escríbenos por WhatsApp.' },
          { status: 400 },
        )
      }
    }

    const destino = armarDestino(tipo, valorCampoDestino, notaAdicional)

    const preparada = await prepararReplica(servicio, proyectoOrigenId, { tipo, destino })
    if (!preparada.ok || !preparada.replicaId) {
      return NextResponse.json({ error: preparada.mensaje }, { status: 400 })
    }

    const creada = await crearProyectoReplica(servicio, preparada.replicaId)
    if (!creada.ok) {
      return NextResponse.json({ error: creada.mensaje }, { status: 400 })
    }

    return NextResponse.json({ ok: true, mensaje: creada.mensaje, proyectoReplicaId: creada.proyectoReplicaId })
  } catch (error: any) {
    console.error('[Réplicas] Error al pedir variante:', error)
    return NextResponse.json({ error: error?.message || 'Error al pedir la réplica.' }, { status: 500 })
  }
}
