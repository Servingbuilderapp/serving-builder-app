/**
 * Lo que la ESTRUCTURACIÓN POR DOCUMENTO (Motor 1) ya escribió para una parte del proyecto.
 *
 * Las pestañas Árbol, Objetivos, Cadena de valor, Presupuesto y Cronograma de la ficha se
 * armaron primero para el formulario técnico, que guarda en otras tablas. Un proyecto que
 * entra con su propio documento se estructura en 42 pasos (`contenido_pasos_proyecto`) y esas
 * pestañas quedaban en blanco aunque el trabajo ya estuviera hecho. Con esto se les puede mostrar.
 */

export type PasoDelMotor = { orden: number; nombre: string; contenido: string }

/** Pasos de estructuración (orden_secuencia) que corresponden a cada parte de la ficha. */
export const PASOS_POR_AREA: Record<string, number[]> = {
  arbol: [13, 14, 15],
  objetivos: [20, 21],
  'cadena-valor': [24, 25],
  presupuesto: [33],
  cronograma: [31],
}

export async function pasosDelMotor(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  proyectoId: string,
  ordenes: number[],
): Promise<PasoDelMotor[]> {
  try {
    const { data: pasos } = await db
      .from('pasos_estructuracion')
      .select('id, orden_secuencia, nombre_paso')
      .in('orden_secuencia', ordenes)
    if (!pasos || pasos.length === 0) return []

    const { data: contenidos } = await db
      .from('contenido_pasos_proyecto')
      .select('id_paso, contenido')
      .eq('id_proyecto', proyectoId)
      .in('id_paso', pasos.map((p: { id: number }) => p.id))

    const resultado: PasoDelMotor[] = []
    for (const orden of ordenes) {
      const paso = pasos.find((p: { orden_secuencia: number }) => Number(p.orden_secuencia) === orden)
      const fila = paso && (contenidos || []).find((c: { id_paso: number }) => c.id_paso === paso.id)
      const texto = String(fila?.contenido || '').trim()
      if (paso && texto) resultado.push({ orden, nombre: String(paso.nombre_paso), contenido: texto })
    }
    return resultado
  } catch {
    return []
  }
}
