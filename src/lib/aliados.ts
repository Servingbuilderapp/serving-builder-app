import { createClient as createAdminClient } from '@supabase/supabase-js'

/**
 * ALIADOS COMERCIALES — solo para usar en el servidor.
 * Cada aliado tiene un código y un porcentaje de comisión de éxito fijo para
 * los clientes que trae. La lista vive en la tabla `aliados_comerciales`.
 */
export interface Aliado {
  codigo: string
  nombre: string
  porcentaje: number
}

export function normalizarCodigoAliado(codigo: unknown): string {
  return String(codigo ?? '').trim().toUpperCase().replace(/\s+/g, '')
}

/** Devuelve el aliado si el código existe y está activo; si no, null. */
export async function buscarAliado(codigo: unknown): Promise<Aliado | null> {
  const limpio = normalizarCodigoAliado(codigo)
  if (!limpio || limpio.length > 40) return null

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data, error } = await admin
    .from('aliados_comerciales')
    .select('codigo, nombre, porcentaje_exito, activo')
    .eq('codigo', limpio)
    .eq('activo', true)
    .maybeSingle()

  if (error || !data) return null
  return { codigo: data.codigo, nombre: data.nombre, porcentaje: Number(data.porcentaje_exito) }
}
