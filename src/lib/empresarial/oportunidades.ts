/**
 * Oportunidades (Camino A) — reglas simples, sin IA.
 * Sirve para: categorías, estados y convertir un hallazgo del diagnóstico en una oportunidad sugerida.
 * Lo que sale de aquí es una SUGERENCIA: la persona la edita, la guarda o la ignora.
 */

export const CATEGORIAS = [
  'Creación de empresa',
  'Nuevos productos',
  'Nuevos servicios',
  'Nuevos mercados',
  'Nuevos segmentos',
  'Nuevos canales comerciales',
  'Expansión geográfica',
  'Diversificación',
  'Innovación',
  'Transformación digital',
  'Automatización',
  'Optimización operativa',
  'Reducción de costos',
  'Fortalecimiento financiero',
  'Desarrollo organizacional',
  'Desarrollo tecnológico',
  'Sostenibilidad',
  'Economía circular',
  'Internacionalización',
  'Alianzas estratégicas',
  'Desarrollo de capacidades',
  'Mejoramiento de infraestructura',
  'Cadenas productivas',
  'Impacto social',
] as const

export type Categoria = (typeof CATEGORIAS)[number]

export const ESTADOS_OPORTUNIDAD = [
  'Identificada',
  'En validación',
  'Priorizada',
  'Lista para formular',
  'Descartada',
] as const

export type EstadoOportunidad = (typeof ESTADOS_OPORTUNIDAD)[number]

/** Categoría con la que se sugiere empezar según el área del diagnóstico. La persona la puede cambiar. */
const CATEGORIA_POR_DIMENSION: Record<string, Categoria> = {
  // Perfiles C y D
  EST: 'Desarrollo organizacional',
  COM: 'Nuevos canales comerciales',
  FIN: 'Fortalecimiento financiero',
  OPE: 'Optimización operativa',
  TEC: 'Transformación digital',
  ORG: 'Desarrollo organizacional',
  LEG: 'Desarrollo organizacional',
  SOS: 'Sostenibilidad',
  // Perfil A
  IDE: 'Creación de empresa',
  PRO: 'Nuevos productos',
  MER: 'Nuevos mercados',
  CAP: 'Desarrollo de capacidades',
  REC: 'Alianzas estratégicas',
  VAL: 'Creación de empresa',
}

export interface HallazgoEntrada {
  id: string
  dimension_id: string | null
  tipo: string
  descripcion: string
  gravedad: 'Bajo' | 'Medio' | 'Alto' | 'Crítico' | null
}

export interface SugerenciaOportunidad {
  hallazgo_id: string
  dimension_id: string | null
  nombre: string
  descripcion: string
  categoria: Categoria
  gravedad: HallazgoEntrada['gravedad']
}

const ORDEN_GRAVEDAD: Record<string, number> = { Crítico: 0, Alto: 1, Medio: 2, Bajo: 3 }

/**
 * Convierte las debilidades del diagnóstico en oportunidades sugeridas.
 * - Solo debilidades (lo que conviene fortalecer).
 * - No repite las que ya se convirtieron en oportunidad.
 * - Ordenadas de lo más importante a lo menos.
 */
export function sugerirDesdeHallazgos(
  hallazgos: HallazgoEntrada[],
  dimensiones: { id: string; codigo: string; nombre: string }[],
  yaConvertidos: Set<string>,
): SugerenciaOportunidad[] {
  const dim = new Map(dimensiones.map((d) => [d.id, d]))
  return hallazgos
    .filter((h) => h.tipo === 'debilidad' && !yaConvertidos.has(h.id))
    .sort((a, b) => (ORDEN_GRAVEDAD[a.gravedad ?? 'Bajo'] ?? 9) - (ORDEN_GRAVEDAD[b.gravedad ?? 'Bajo'] ?? 9))
    .map((h) => {
      const d = h.dimension_id ? dim.get(h.dimension_id) : undefined
      const area = d ? d.nombre.toLowerCase() : 'un área del proyecto'
      return {
        hallazgo_id: h.id,
        dimension_id: h.dimension_id,
        nombre: `Fortalecer ${area}`,
        descripcion: h.descripcion,
        categoria: (d && CATEGORIA_POR_DIMENSION[d.codigo]) || 'Desarrollo organizacional',
        gravedad: h.gravedad,
      }
    })
}
