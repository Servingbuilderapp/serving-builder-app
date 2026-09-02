import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { esEquipoServing } from '@/lib/guardiaEquipo'

/**
 * Guarda la corrección que el equipo de Serving hace sobre el contenido de un
 * paso de estructuración.
 *
 * La IA (Motor 1) redacta el contenido de cada paso; esta ruta es la que deja
 * que una persona lo corrija. Trabaja con la llave de servicio, así que el
 * candado `esEquipoServing()` es obligatorio: sin él, cualquiera que supiera
 * la dirección podría reescribir el proyecto de otro.
 */
export async function POST(request: NextRequest) {
  if (!(await esEquipoServing())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const llave = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !llave) {
    return NextResponse.json({ error: 'Falta configuración del servidor' }, { status: 500 })
  }

  let cuerpo: {
    proyectoId?: string
    pasoId?: number | string
    contenido?: string
    advertencia?: string | null
  }

  try {
    cuerpo = await request.json()
  } catch {
    return NextResponse.json({ error: 'Petición mal formada' }, { status: 400 })
  }

  const proyectoId = String(cuerpo.proyectoId || '').trim()
  const pasoId = Number(cuerpo.pasoId)
  const contenido = String(cuerpo.contenido ?? '').trim()

  if (!proyectoId || !Number.isFinite(pasoId)) {
    return NextResponse.json({ error: 'Falta el proyecto o el paso' }, { status: 400 })
  }
  if (!contenido) {
    return NextResponse.json({ error: 'El contenido no puede quedar vacío' }, { status: 400 })
  }

  const advertenciaTexto = String(cuerpo.advertencia ?? '').trim()
  const advertencia = advertenciaTexto ? advertenciaTexto : null

  const supabase = createClient(url, llave)

  // Se intenta actualizar la fila existente; si el paso todavía no tenía
  // contenido, se crea. Así no depende de cómo esté definida la llave de la
  // tabla y nunca quedan dos filas para el mismo paso.
  const { data: actualizadas, error: errorUpdate } = await supabase
    .from('contenido_pasos_proyecto')
    .update({ contenido, advertencia })
    .eq('id_proyecto', proyectoId)
    .eq('id_paso', pasoId)
    .select('id_paso')

  if (errorUpdate) {
    return NextResponse.json({ error: errorUpdate.message }, { status: 500 })
  }

  if (!actualizadas || actualizadas.length === 0) {
    const { error: errorInsert } = await supabase
      .from('contenido_pasos_proyecto')
      .insert({ id_proyecto: proyectoId, id_paso: pasoId, contenido, advertencia })

    if (errorInsert) {
      return NextResponse.json({ error: errorInsert.message }, { status: 500 })
    }
  }

  // Un paso corregido a mano queda dado por completado: si el equipo escribió
  // ahí, ese paso ya tiene contenido válido.
  const { error: errorAvance } = await supabase.from('avance_estructuracion_proyecto').upsert({
    proyecto_id: proyectoId,
    paso_id: pasoId,
    completado: true,
    fecha_completado: new Date().toISOString(),
  })

  if (errorAvance) {
    return NextResponse.json({ error: errorAvance.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
