import { NextResponse } from 'next/server'
import { esEquipoServing } from '@/lib/guardiaEquipo'
import { createClient } from '@/lib/supabase/server'
import { PLAN_EMPRENDEDOR, ESTADO_PENDIENTE_AVAL } from '@/lib/planEmprendedor'

/**
 * El equipo de Serving aprueba o rechaza una solicitud del plan Emprendedor.
 * - aprobar  → el proyecto pasa a 'pendiente_pago' y al cliente se le habilita el pago.
 * - rechazar → el proyecto pasa a 'aval_rechazado' (no puede pagar este plan).
 */
export async function POST(req: Request) {
  try {
    if (!(await esEquipoServing())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }
    const { proyectoId, decision } = await req.json()
    if (!proyectoId || (decision !== 'aprobar' && decision !== 'rechazar')) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('proyectos_clientes_serving')
      .update({ estado_actual: decision === 'aprobar' ? 'pendiente_pago' : 'aval_rechazado' })
      .eq('id', proyectoId)
      .eq('plan_pago', PLAN_EMPRENDEDOR)
      .eq('estado_actual', ESTADO_PENDIENTE_AVAL)
      .select('id')
    if (error) throw error
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Esta solicitud ya no está pendiente de revisión' }, { status: 409 })
    }
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : 'Error al registrar la decisión'
    return NextResponse.json({ error: mensaje }, { status: 500 })
  }
}
