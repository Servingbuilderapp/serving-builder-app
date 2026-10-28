import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * Marca blanca, opción 2: el socio ofrece 5 proyectos gratis (cortesías: 15 días,
 * 15 % de comisión de éxito para Serving). Cuando se acaban, el socio pasa a la
 * opción 1 (mantenimiento mensual al día).
 */

export type SocioPortal = {
  id: string
  nombre: string
  marca: string | null
  activo: boolean | null
  mantenimiento_pagado_hasta: string | null
  logo_url: string | null
  color_primario: string | null
  modalidad: string
  cupo_gratis: number
}

/** Lee al socio por su enlace. Si las columnas nuevas todavía no existen en la base, lee lo de siempre. */
export async function leerSocioPortal(slug: string): Promise<SocioPortal | null> {
  const completa = await supabaseAdmin
    .from('socios')
    .select('id, nombre, marca, activo, mantenimiento_pagado_hasta, logo_url, color_primario, modalidad, cupo_gratis')
    .eq('slug', slug)
    .maybeSingle<SocioPortal>()
  if (!completa.error) return completa.data

  const basica = await supabaseAdmin
    .from('socios')
    .select('id, nombre, marca, activo, mantenimiento_pagado_hasta, logo_url, color_primario')
    .eq('slug', slug)
    .maybeSingle<Omit<SocioPortal, 'modalidad' | 'cupo_gratis'>>()
  return basica.data ? { ...basica.data, modalidad: 'uso', cupo_gratis: 0 } : null
}

/** Cuántos proyectos gratis ya usó este socio. */
export async function gratisUsados(socioId: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('cortesias')
    .select('id', { count: 'exact', head: true })
    .eq('socio_id', socioId)
  return error ? 0 : count || 0
}

/** Estado del portal de un socio: ¿entra gratis, entra por mantenimiento, o está apagado? */
export async function estadoPortal(socio: SocioPortal): Promise<{
  abierto: boolean
  gratis: boolean
  restantes: number
}> {
  // Marca blanca queda en una sola modalidad, sin precios ni cupos fijos: lo que
  // se acuerde con cada socio se maneja fuera de la plataforma. El portal del
  // socio se abre mientras el socio esté activo (27 oct 2026).
  return { abierto: !!socio.activo, gratis: false, restantes: 0 }
}
