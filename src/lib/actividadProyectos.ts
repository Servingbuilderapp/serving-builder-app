/**
 * ÚLTIMO MOVIMIENTO de cada proyecto.
 *
 * Antes, "estancado" se calculaba desde que el proyecto se CREÓ: cualquier proyecto con más de
 * 5 días salía estancado, aunque estuviera avanzando. Aquí se toma el último movimiento real:
 * un paso de estructuración completado, una convocatoria que le llegó, o su postulación.
 * Si no hay ninguno, se usa la fecha en que se creó.
 *
 * Solo usa columnas ya verificadas en el código: avance_estructuracion_proyecto.fecha_completado,
 * convocatorias_candidatas_proyecto.disponible_para_cliente_desde y postulaciones.actualizada_en.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = any

export async function ultimoMovimientoPorProyecto(
  db: Db,
  proyectos: { id: string; created_at: string | null }[],
): Promise<Map<string, Date>> {
  const mapa = new Map<string, Date>()
  const ids = proyectos.map((p) => String(p.id))
  if (ids.length === 0) return mapa

  const registrar = (id: unknown, fecha: unknown) => {
    if (!id || !fecha) return
    const f = new Date(String(fecha))
    if (Number.isNaN(f.getTime())) return
    const clave = String(id)
    const actual = mapa.get(clave)
    if (!actual || f > actual) mapa.set(clave, f)
  }

  for (const p of proyectos) registrar(p.id, p.created_at)

  try {
    const { data } = await db
      .from('avance_estructuracion_proyecto')
      .select('proyecto_id, fecha_completado')
      .in('proyecto_id', ids)
      .not('fecha_completado', 'is', null)
      .order('fecha_completado', { ascending: false })
      .limit(5000)
    for (const f of (data || []) as { proyecto_id: string; fecha_completado: string }[]) registrar(f.proyecto_id, f.fecha_completado)
  } catch {
    /* si falla, se sigue con lo demás */
  }

  try {
    const { data } = await db
      .from('convocatorias_candidatas_proyecto')
      .select('id_proyecto, disponible_para_cliente_desde')
      .in('id_proyecto', ids)
      .not('disponible_para_cliente_desde', 'is', null)
      .order('disponible_para_cliente_desde', { ascending: false })
      .limit(5000)
    for (const f of (data || []) as { id_proyecto: string; disponible_para_cliente_desde: string }[])
      registrar(f.id_proyecto, f.disponible_para_cliente_desde)
  } catch {
    /* igual */
  }

  try {
    const { data } = await db
      .from('postulaciones')
      .select('proyecto_id, actualizada_en')
      .in('proyecto_id', ids)
      .not('actualizada_en', 'is', null)
      .order('actualizada_en', { ascending: false })
      .limit(5000)
    for (const f of (data || []) as { proyecto_id: string; actualizada_en: string }[]) registrar(f.proyecto_id, f.actualizada_en)
  } catch {
    /* igual */
  }

  return mapa
}

export function diasSinMovimiento(fecha: Date | undefined): number | null {
  if (!fecha) return null
  return Math.max(0, Math.floor((Date.now() - fecha.getTime()) / 86400000))
}
