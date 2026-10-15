import { NextResponse } from 'next/server'
import { consumirBeneficio } from '@/lib/membresiasConsumo'
import { contextoMiembro } from '@/lib/membresiasServicios'
import { limpiarRespuestas, TODOS_LOS_PASOS, pasoCompleto } from '@/lib/miProyectoPasos'

/**
 * Los proyectos que el miembro estructura él mismo.
 * - crear: abre un proyecto nuevo y descuenta 1 del cupo del mes.
 * - guardar: guarda lo escrito (se llama solo mientras escribe).
 * - terminar: lo marca terminado, solo si todos los pasos están completos.
 */
export async function POST(req: Request) {
  try {
    const ctx = await contextoMiembro()
    if (!ctx.correo) return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    if (!ctx.vigente && !ctx.esEquipo) {
      return NextResponse.json({ error: 'Necesitas una membresía activa.' }, { status: 403 })
    }

    const c = await req.json()

    if (c?.accion === 'crear') {
      const nombre = typeof c.nombre === 'string' ? c.nombre.trim().slice(0, 150) : ''
      if (!nombre) return NextResponse.json({ error: 'Escribe el nombre de tu proyecto.' }, { status: 400 })

      let membresiaId: string | null = null
      if (!ctx.esEquipo) {
        const consumo = await consumirBeneficio(ctx.servicio, ctx.correo, 'proyecto_minimo', `proy:${nombre}`)
        if (!consumo.ok) return NextResponse.json({ error: consumo.mensaje }, { status: 409 })
        membresiaId = consumo.membresiaId
      }
      const { data, error } = await ctx.servicio
        .from('membresias_proyectos')
        .insert({ membresia_id: membresiaId, correo_cliente: ctx.correo, nombre })
        .select('id')
        .single()
      if (error || !data) {
        console.error('Error creando proyecto de membresía:', error)
        return NextResponse.json({ error: 'No se pudo crear el proyecto. Intenta de nuevo.' }, { status: 500 })
      }
      return NextResponse.json({ success: true, id: data.id })
    }

    const id = typeof c?.id === 'string' ? c.id : ''
    if (!id) return NextResponse.json({ error: 'Falta el proyecto.' }, { status: 400 })

    const { data: proyecto } = await ctx.servicio
      .from('membresias_proyectos')
      .select('id, estado')
      .eq('id', id)
      .ilike('correo_cliente', ctx.correo)
      .maybeSingle<{ id: string; estado: string }>()
    if (!proyecto) return NextResponse.json({ error: 'No encontramos ese proyecto.' }, { status: 404 })

    if (c?.accion === 'guardar') {
      if (proyecto.estado === 'terminado') {
        return NextResponse.json({ error: 'Este proyecto ya está terminado.' }, { status: 409 })
      }
      const respuestas = limpiarRespuestas(c.respuestas)
      const { error } = await ctx.servicio
        .from('membresias_proyectos')
        .update({ respuestas, actualizado_en: new Date().toISOString() })
        .eq('id', id)
      if (error) {
        console.error('Error guardando proyecto:', error)
        return NextResponse.json({ error: 'No se pudo guardar.' }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    if (c?.accion === 'terminar') {
      const respuestas = limpiarRespuestas(c.respuestas)
      const faltan = TODOS_LOS_PASOS.filter((p) => !pasoCompleto(p, respuestas))
      if (faltan.length > 0) {
        return NextResponse.json({ error: `Todavía faltan pasos por completar: ${faltan.map((p) => p.n).join(', ')}.` }, { status: 400 })
      }
      const { error } = await ctx.servicio
        .from('membresias_proyectos')
        .update({ respuestas, estado: 'terminado', actualizado_en: new Date().toISOString() })
        .eq('id', id)
      if (error) return NextResponse.json({ error: 'No se pudo cerrar el proyecto.' }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Acción desconocida.' }, { status: 400 })
  } catch (error: unknown) {
    console.error('Error en proyectos de membresía:', error)
    return NextResponse.json({ error: 'No se pudo completar. Intenta de nuevo.' }, { status: 500 })
  }
}
