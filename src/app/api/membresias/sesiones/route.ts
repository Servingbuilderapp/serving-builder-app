import { NextResponse } from 'next/server'
import { contextoMiembro } from '@/lib/membresiasServicios'
import { periodoMensual } from '@/lib/membresiasUso'

/** Reservar o cancelar el lugar en una sesión grupal. El cupo mensual depende del nivel. */
export async function POST(req: Request) {
  try {
    const ctx = await contextoMiembro()
    if (!ctx.correo) return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    if (ctx.servicios.sesionesPorMes === 0) {
      return NextResponse.json({ error: 'Tu nivel no incluye sesiones grupales.' }, { status: 403 })
    }
    const { sesionId, accion } = await req.json()
    if (!sesionId || typeof sesionId !== 'string') return NextResponse.json({ error: 'Falta la sesión.' }, { status: 400 })

    if (accion === 'cancelar') {
      await ctx.servicio.from('membresias_sesiones_inscritos').delete().eq('sesion_id', sesionId).ilike('correo_cliente', ctx.correo)
      return NextResponse.json({ success: true })
    }

    const { data: sesion } = await ctx.servicio
      .from('membresias_sesiones')
      .select('id, fecha_hora')
      .eq('id', sesionId)
      .maybeSingle<{ id: string; fecha_hora: string }>()
    if (!sesion || new Date(sesion.fecha_hora).getTime() < Date.now()) {
      return NextResponse.json({ error: 'Esa sesión ya pasó o no existe.' }, { status: 404 })
    }

    if (!ctx.esEquipo) {
      // Cupo del mes: las sesiones reservadas cuya fecha cae en el período vigente de la membresía.
      const { desde, hasta } = periodoMensual(ctx.vigente?.fecha_inicio ?? null)
      const { data: reservadas } = await ctx.servicio
        .from('membresias_sesiones_inscritos')
        .select('sesion_id, membresias_sesiones!inner(fecha_hora)')
        .ilike('correo_cliente', ctx.correo)
        .gte('membresias_sesiones.fecha_hora', desde.toISOString())
        .lt('membresias_sesiones.fecha_hora', hasta.toISOString())
      if ((reservadas || []).length >= ctx.servicios.sesionesPorMes) {
        return NextResponse.json({ error: 'Ya reservaste todas las sesiones que incluye tu nivel este mes.' }, { status: 409 })
      }
    }

    const { error } = await ctx.servicio.from('membresias_sesiones_inscritos').insert({ sesion_id: sesionId, correo_cliente: ctx.correo })
    if (error && error.code !== '23505') {
      console.error('Error reservando sesión:', error)
      return NextResponse.json({ error: 'No se pudo reservar. Intenta de nuevo.' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error en sesiones:', error)
    return NextResponse.json({ error: 'No se pudo completar. Intenta de nuevo.' }, { status: 500 })
  }
}
