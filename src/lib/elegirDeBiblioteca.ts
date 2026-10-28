/**
 * Pasa una convocatoria de la BIBLIOTECA a ser una convocatoria ELEGIDA de un proyecto:
 *   1. si el proyecto ya la tenía como candidata, la marca como elegida;
 *   2. si no, crea la candidata copiando la ficha de la biblioteca, ya elegida.
 * Devuelve el id de la candidata para poder lanzar el análisis de encaje (Motor 3).
 * Lo usan "Elegir esta" (A tu medida) y "Confirmar mi abanico".
 */

const CAMPOS_BIBLIOTECA =
  'id, nombre, entidad, tipo, estado_convocatoria, fecha_cierre, fecha_cierre_texto, monto, beneficiarios, territorio, linea_tematica, requisitos, mecanismo_postulacion, terminos_referencia, fuente_oficial, alertas, informacion_faltante'

export type ResultadoEleccion = { ok: boolean; idCandidata?: string; yaElegida?: boolean; error?: string }

export async function elegirConvocatoriaDeBiblioteca(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  idProyecto: string,
  idBiblioteca: string,
): Promise<ResultadoEleccion> {
  const { data: ficha } = await supabase
    .from('biblioteca_convocatorias')
    .select(CAMPOS_BIBLIOTECA)
    .eq('id', idBiblioteca)
    .maybeSingle()
  if (!ficha) return { ok: false, error: 'No encontramos esa convocatoria en la biblioteca.' }

  const { data: existente } = await supabase
    .from('convocatorias_candidatas_proyecto')
    .select('id, eleccion_cliente')
    .eq('id_proyecto', idProyecto)
    .eq('biblioteca_id', idBiblioteca)
    .limit(1)
    .maybeSingle()

  if (existente) {
    if (existente.eleccion_cliente === 'elegida') return { ok: true, yaElegida: true, idCandidata: String(existente.id) }
    const { error } = await supabase
      .from('convocatorias_candidatas_proyecto')
      .update({ seleccionada: true, eleccion_cliente: 'elegida' })
      .eq('id', existente.id)
    if (error) return { ok: false, error: 'No se pudo guardar la elección.' }
    return { ok: true, idCandidata: String(existente.id) }
  }

  const { data: ultimoLote } = await supabase
    .from('convocatorias_candidatas_proyecto')
    .select('lote')
    .eq('id_proyecto', idProyecto)
    .order('lote', { ascending: false })
    .limit(1)
  const lote = ultimoLote && ultimoLote.length > 0 ? Number(ultimoLote[0].lote || 0) + 1 : 1

  const { data: nueva, error } = await supabase
    .from('convocatorias_candidatas_proyecto')
    .insert({
      id_proyecto: idProyecto,
      lote,
      nombre: ficha.nombre,
      entidad: ficha.entidad,
      tipo: ficha.tipo,
      estado_convocatoria: ficha.estado_convocatoria,
      fecha_cierre: ficha.fecha_cierre_texto || ficha.fecha_cierre,
      monto: ficha.monto,
      beneficiarios: ficha.beneficiarios,
      territorio: ficha.territorio,
      linea_tematica: ficha.linea_tematica,
      requisitos: ficha.requisitos,
      mecanismo_postulacion: ficha.mecanismo_postulacion,
      terminos_referencia: ficha.terminos_referencia,
      fuente_oficial: ficha.fuente_oficial,
      alertas: ficha.alertas,
      informacion_faltante: ficha.informacion_faltante,
      biblioteca_id: idBiblioteca,
      seleccionada: true,
      eleccion_cliente: 'elegida',
      disponible_para_cliente_desde: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error || !nueva) return { ok: false, error: 'No se pudo guardar la elección.' }
  return { ok: true, idCandidata: String(nueva.id) }
}
