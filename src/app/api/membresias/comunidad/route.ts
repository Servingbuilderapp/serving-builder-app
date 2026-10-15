import { NextResponse } from 'next/server'
import { contextoMiembro } from '@/lib/membresiasServicios'

/** Publicar un mensaje en la comunidad (nivel Arquitecto y equipo). */
export async function POST(req: Request) {
  try {
    const ctx = await contextoMiembro()
    if (!ctx.correo) return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    if (!ctx.servicios.comunidad) return NextResponse.json({ error: 'Tu nivel no incluye la comunidad.' }, { status: 403 })
    const { texto } = await req.json()
    const limpio = typeof texto === 'string' ? texto.trim().slice(0, 1000) : ''
    if (limpio.length < 2) return NextResponse.json({ error: 'Escribe tu mensaje.' }, { status: 400 })
    const { error } = await ctx.servicio.from('membresias_comunidad_mensajes').insert({
      correo_cliente: ctx.correo,
      nombre: ctx.esEquipo ? 'Equipo Serving' : ctx.nombre.slice(0, 60),
      texto: limpio,
    })
    if (error) {
      console.error('Error publicando en comunidad:', error)
      return NextResponse.json({ error: 'No se pudo publicar. Intenta de nuevo.' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error en comunidad:', error)
    return NextResponse.json({ error: 'No se pudo publicar. Intenta de nuevo.' }, { status: 500 })
  }
}
