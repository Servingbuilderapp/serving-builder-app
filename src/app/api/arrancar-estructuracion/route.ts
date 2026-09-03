import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { esEquipoServing } from '@/lib/guardiaEquipo'
import { arrancarEstructuracion } from '@/lib/arrancarEstructuracion'

/**
 * Enciende la estructuración de un proyecto.
 *
 * La llama la pantalla «Lo que me piden» apenas el cliente termina de subir un
 * documento. Solo puede pedirlo el dueño del proyecto o el equipo de Serving:
 * por dentro se trabaja con la llave de servicio, así que sin este candado
 * cualquiera podría poner a correr el motor sobre el proyecto de otro.
 */
export async function POST(request: NextRequest) {
  const { proyectoId } = await request.json().catch(() => ({ proyectoId: '' }))

  if (!proyectoId) {
    return NextResponse.json({ error: 'Falta el proyecto' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: proyecto } = await supabase
    .from('proyectos_clientes_serving')
    .select('id, correo_cliente')
    .eq('id', proyectoId)
    .maybeSingle<{ id: string; correo_cliente: string | null }>()

  const esDueno =
    (proyecto?.correo_cliente || '').toLowerCase().trim() ===
    (user.email || '').toLowerCase().trim()

  if (!proyecto || (!esDueno && !(await esEquipoServing()))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const resultado = await arrancarEstructuracion(String(proyecto.id), request.nextUrl.origin)

  return NextResponse.json(resultado)
}
