import { NextResponse } from 'next/server'
import { contextoMiembro } from '@/lib/membresiasServicios'

/** El miembro le pide a Serving que postule uno de sus proyectos mínimos viables. */
export async function POST(req: Request) {
  try {
    const ctx = await contextoMiembro()
    if (!ctx.correo) return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    if (!ctx.vigente && !ctx.esEquipo) {
      return NextResponse.json({ error: 'Necesitas una membresía activa.' }, { status: 403 })
    }

    const cuerpo = await req.json()
    const proyectoId = typeof cuerpo?.proyectoId === 'string' ? cuerpo.proyectoId : ''
    const convocatoriaId = typeof cuerpo?.convocatoriaId === 'string' && cuerpo.convocatoriaId ? cuerpo.convocatoriaId : null
    const convocatoriaTexto = typeof cuerpo?.convocatoriaTexto === 'string' ? cuerpo.convocatoriaTexto.trim().slice(0, 300) : ''
    const comentario = typeof cuerpo?.comentario === 'string' ? cuerpo.comentario.trim().slice(0, 1000) : ''
    if (!proyectoId) return NextResponse.json({ error: 'Falta el proyecto.' }, { status: 400 })
    if (!convocatoriaId && !convocatoriaTexto) {
      return NextResponse.json({ error: 'Elige la convocatoria o escribe cuál es.' }, { status: 400 })
    }

    const { data: proyecto } = await ctx.servicio
      .from('membresias_proyectos_minimos')
      .select('id')
      .eq('id', proyectoId)
      .ilike('correo_cliente', ctx.correo)
      .maybeSingle()
    if (!proyecto) return NextResponse.json({ error: 'No encontramos ese proyecto.' }, { status: 404 })

    let textoConvocatoria = convocatoriaTexto
    if (convocatoriaId && !textoConvocatoria) {
      const { data: conv } = await ctx.servicio
        .from('biblioteca_convocatorias')
        .select('nombre, entidad')
        .eq('id', convocatoriaId)
        .maybeSingle<{ nombre: string | null; entidad: string | null }>()
      textoConvocatoria = [conv?.nombre, conv?.entidad].filter(Boolean).join(' — ')
    }

    const { error } = await ctx.servicio.from('membresias_postulaciones').insert({
      proyecto_id: proyectoId,
      correo_cliente: ctx.correo,
      convocatoria_id: convocatoriaId,
      convocatoria_texto: textoConvocatoria || null,
      comentario: comentario || null,
    })
    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Ya pediste la postulación de este proyecto.' }, { status: 409 })
      console.error('Error guardando postulación:', error)
      return NextResponse.json({ error: 'No se pudo enviar la solicitud. Intenta de nuevo.' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error pidiendo postulación:', error)
    return NextResponse.json({ error: 'No se pudo enviar la solicitud. Intenta de nuevo.' }, { status: 500 })
  }
}
