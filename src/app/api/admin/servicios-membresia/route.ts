import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { esEquipoServing } from '@/lib/guardiaEquipo'

const ESTADOS_POSTULACION = ['solicitada', 'en_revision', 'postulada', 'no_viable']
const ESTADOS_ACOMP = ['pedida', 'agendada', 'realizada']

const texto = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/** Acciones del equipo sobre los servicios de membresía. Solo equipo de Serving. */
export async function POST(req: Request) {
  try {
    if (!(await esEquipoServing())) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    const c = await req.json()
    const servicio = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const id = texto(c?.id, 60)

    switch (c?.accion) {
      case 'crear_sesion': {
        const titulo = texto(c.titulo, 150)
        const fecha = new Date(texto(c.fecha_hora, 40))
        if (!titulo || isNaN(fecha.getTime())) return NextResponse.json({ error: 'Falta el título o la fecha.' }, { status: 400 })
        const { error } = await servicio.from('membresias_sesiones').insert({
          titulo, descripcion: texto(c.descripcion, 600) || null, fecha_hora: fecha.toISOString(), enlace: texto(c.enlace, 400) || null,
        })
        if (error) throw error
        break
      }
      case 'borrar_sesion': {
        await servicio.from('membresias_sesiones').delete().eq('id', id)
        break
      }
      case 'estado_postulacion': {
        const estado = texto(c.estado, 20)
        if (!ESTADOS_POSTULACION.includes(estado)) return NextResponse.json({ error: 'Estado inválido.' }, { status: 400 })
        const { error } = await servicio.from('membresias_postulaciones').update({ estado, nota_equipo: texto(c.nota_equipo, 600) || null }).eq('id', id)
        if (error) throw error
        break
      }
      case 'agendar_acompanamiento': {
        const estado = texto(c.estado, 20)
        if (!ESTADOS_ACOMP.includes(estado)) return NextResponse.json({ error: 'Estado inválido.' }, { status: 400 })
        const fecha = texto(c.fecha_hora, 40) ? new Date(texto(c.fecha_hora, 40)) : null
        if (fecha && isNaN(fecha.getTime())) return NextResponse.json({ error: 'Fecha inválida.' }, { status: 400 })
        const { error } = await servicio.from('membresias_acompanamiento').update({
          estado, fecha_hora: fecha ? fecha.toISOString() : null, enlace: texto(c.enlace, 400) || null, nota_equipo: texto(c.nota_equipo, 600) || null,
        }).eq('id', id)
        if (error) throw error
        break
      }
      case 'borrar_mensaje': {
        await servicio.from('membresias_comunidad_mensajes').delete().eq('id', id)
        break
      }
      default:
        return NextResponse.json({ error: 'Acción desconocida.' }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error en servicios de membresía (admin):', error)
    return NextResponse.json({ error: 'No se pudo guardar. Intenta de nuevo.' }, { status: 500 })
  }
}
