import type { SupabaseClient } from '@supabase/supabase-js'
import { cabecerasInternas } from '@/lib/candadoMotores'

/**
 * Enciende el Motor 2 (búsqueda de convocatorias) para un proyecto, UNA sola vez.
 *
 * Regla del dueño (25 oct 2026): nadie espera a nadie. Apenas el Motor 1 y el
 * evaluador terminan, la búsqueda arranca sola — sin esperar que el cliente
 * apruebe y sin plazo de 3 días. Lo que el evaluador encuentre se le pregunta
 * al cliente en paralelo, pero eso no frena la búsqueda.
 *
 * "Una sola vez": primero se reclama la orden en la base (la columna
 * busqueda_convocatorias_iniciada pasa a true solo si todavía no lo estaba).
 * Si dos caminos intentan arrancar el mismo proyecto a la vez, solo uno gana.
 *
 * Si el Motor 2 se cae después de reclamarse, el reloj de seguridad
 * (/api/reanudar-estructuracion, punto D) lo vuelve a lanzar.
 */
export async function lanzarBusquedaConvocatorias(
  supabase: SupabaseClient,
  proyectoId: string,
  origen: string,
): Promise<{ lanzado: boolean; motivo?: string }> {
  const { data: reclamado, error } = await supabase
    .from('proyectos_clientes_serving')
    .update({ busqueda_convocatorias_iniciada: true })
    .eq('id', proyectoId)
    .or('busqueda_convocatorias_iniciada.is.null,busqueda_convocatorias_iniciada.eq.false')
    .select('id')

  if (error) {
    console.error(`No se pudo reclamar la búsqueda de ${proyectoId}:`, JSON.stringify(error))
    return { lanzado: false, motivo: 'error' }
  }
  if (!reclamado || reclamado.length === 0) return { lanzado: false, motivo: 'ya-iniciada' }

  try {
    await fetch(`${origen}/api/buscar-convocatorias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...cabecerasInternas() },
      body: JSON.stringify({ id_proyecto: proyectoId }),
    })
  } catch (e) {
    console.error(`Error lanzando el Motor 2 de ${proyectoId}:`, e)
    return { lanzado: false, motivo: 'fallo-al-llamar' }
  }
  return { lanzado: true }
}
