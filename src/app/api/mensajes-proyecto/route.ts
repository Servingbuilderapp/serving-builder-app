import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createClienteSesion } from '@/lib/supabase/server'
import { esEquipoServing } from '@/lib/guardiaEquipo'

/**
 * Canal de mensajes cliente ↔ equipo, por proyecto.
 *
 * GET  /api/mensajes-proyecto?proyectoId=...   trae el hilo completo.
 * POST /api/mensajes-proyecto  { proyectoId, mensaje }   manda un mensaje.
 *
 * Quién puede: el equipo de Serving (cualquier proyecto) o el dueño del
 * proyecto (correo_cliente). El autor_tipo se decide solo, según quién sea.
 */

function servicio() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

async function identificarse(
  proyectoId: string,
  supabase: any,
): Promise<{ ok: boolean; autorTipo?: 'cliente' | 'equipo'; correo?: string }> {
  if (await esEquipoServing()) {
    const sesion = await createClienteSesion()
    const {
      data: { user },
    } = await sesion.auth.getUser()
    return { ok: true, autorTipo: 'equipo', correo: user?.email || 'equipo@serving' }
  }

  try {
    const sesion = await createClienteSesion()
    const {
      data: { user },
    } = await sesion.auth.getUser()
    if (!user?.email) return { ok: false }

    const { data: proyecto } = await supabase
      .from('proyectos_clientes_serving')
      .select('correo_cliente')
      .eq('id', proyectoId)
      .maybeSingle()

    if ((proyecto?.correo_cliente || '').toLowerCase().trim() !== user.email.toLowerCase().trim()) {
      return { ok: false }
    }
    return { ok: true, autorTipo: 'cliente', correo: user.email }
  } catch {
    return { ok: false }
  }
}

export async function GET(req: NextRequest) {
  const proyectoId = req.nextUrl.searchParams.get('proyectoId')
  if (!proyectoId) return NextResponse.json({ error: 'Falta proyectoId' }, { status: 400 })

  const supabase = servicio()
  const identidad = await identificarse(proyectoId, supabase)
  if (!identidad.ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('mensajes_proyecto')
    .select('id, autor_tipo, autor_correo, mensaje, creado_en')
    .eq('proyecto_id', proyectoId)
    .order('creado_en', { ascending: true })

  if (error) return NextResponse.json({ error: 'No se pudo leer el hilo' }, { status: 500 })

  // Marca como leído lo que el otro lado había mandado.
  const campoLeido = identidad.autorTipo === 'cliente' ? 'leido_por_cliente' : 'leido_por_equipo'
  await supabase
    .from('mensajes_proyecto')
    .update({ [campoLeido]: true })
    .eq('proyecto_id', proyectoId)
    .neq('autor_tipo', identidad.autorTipo!)

  return NextResponse.json({ ok: true, mensajes: data || [], autorTipo: identidad.autorTipo })
}

export async function POST(req: NextRequest) {
  const cuerpo = await req.json()
  const { proyectoId, mensaje } = cuerpo || {}
  if (!proyectoId || !String(mensaje || '').trim()) {
    return NextResponse.json({ error: 'Faltan proyectoId y mensaje' }, { status: 400 })
  }

  const supabase = servicio()
  const identidad = await identificarse(proyectoId, supabase)
  if (!identidad.ok) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('mensajes_proyecto')
    .insert({
      proyecto_id: proyectoId,
      autor_tipo: identidad.autorTipo,
      autor_correo: identidad.correo,
      mensaje: String(mensaje).trim().slice(0, 4000),
      leido_por_cliente: identidad.autorTipo === 'cliente',
      leido_por_equipo: identidad.autorTipo === 'equipo',
    })
    .select('id, autor_tipo, autor_correo, mensaje, creado_en')
    .single()

  if (error || !data) return NextResponse.json({ error: 'No se pudo enviar el mensaje' }, { status: 500 })

  return NextResponse.json({ ok: true, mensaje: data })
}
