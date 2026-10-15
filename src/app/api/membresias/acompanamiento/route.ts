import { NextResponse } from 'next/server'
import { contextoMiembro } from '@/lib/membresiasServicios'

/** El miembro Arquitecto pide su encuentro semanal de acompañamiento. */
export async function POST(req: Request) {
  try {
    const ctx = await contextoMiembro()
    if (!ctx.correo) return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    if (!ctx.servicios.acompanamientoSemanal) {
      return NextResponse.json({ error: 'Tu nivel no incluye el acompañamiento semanal.' }, { status: 403 })
    }
    const { tema } = await req.json()
    const limpio = typeof tema === 'string' ? tema.trim().slice(0, 600) : ''
    if (limpio.length < 5) return NextResponse.json({ error: 'Cuéntanos sobre qué quieres hablar.' }, { status: 400 })

    const { data: pendiente } = await ctx.servicio
      .from('membresias_acompanamiento')
      .select('id')
      .ilike('correo_cliente', ctx.correo)
      .in('estado', ['pedida', 'agendada'])
      .limit(1)
    if (pendiente && pendiente.length > 0) {
      return NextResponse.json({ error: 'Ya tienes un encuentro pendiente. Cuando se realice, puedes pedir el siguiente.' }, { status: 409 })
    }

    const { error } = await ctx.servicio.from('membresias_acompanamiento').insert({ correo_cliente: ctx.correo, tema: limpio })
    if (error) {
      console.error('Error pidiendo acompañamiento:', error)
      return NextResponse.json({ error: 'No se pudo enviar. Intenta de nuevo.' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error en acompañamiento:', error)
    return NextResponse.json({ error: 'No se pudo enviar. Intenta de nuevo.' }, { status: 500 })
  }
}
