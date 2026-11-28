/**
 * MEMBRESÍAS — Explorador, Constructor, Arquitecto.
 *
 * Este archivo es el único sitio donde están el nombre, el precio y lo que
 * incluye cada nivel. La Mentoría (con acompañamiento en vivo) NO es una
 * membresía y no vive aquí — es un producto aparte, todavía sin construir.
 *
 * Los precios están en dólares porque así los definió el dueño. Para un
 * cliente colombiano se convierten a pesos con la misma tasa que usa
 * `/contratar` (ver TASA_COP_POR_USD más abajo) — hay que actualizarla cada
 * cierto tiempo a mano, igual que allá.
 *
 * El precio anual es 12 veces el mensual: sin descuento ni meses gratis
 * (decisión del dueño, 28 nov 2026). Para cambiarlo, se cambia solo el campo
 * `factorAnual` de cada nivel.
 */

export const TASA_COP_POR_USD = 3486.64 // Tasa de respaldo (28 nov 2026) si falla la TRM automática. Actualizar periódicamente.

export type NivelMembresia = {
  slug: 'explorador' | 'constructor' | 'arquitecto'
  nombre: string
  precioMensualUsd: number
  /** Multiplicador sobre el precio mensual para calcular el precio anual. 12 = sin descuento. */
  factorAnual: number
  resumen: string
  incluye: string[]
}

export const NIVELES_MEMBRESIA: NivelMembresia[] = [
  {
    slug: 'explorador',
    nombre: 'Explorador',
    precioMensualUsd: 47,
    factorAnual: 12,
    resumen: 'Trae 1 proyecto listo o arma el tuyo por tu cuenta, y postula tú mismo hasta en 3 convocatorias durante 45 días.',
    incluye: [
      'Trae 1 proyecto listo, o arma el tuyo por ti mismo',
      'Centinela Digital',
      'Postulas tu proyecto tú mismo, hasta en 3 convocatorias',
      'Un mes para desarrollar tu proyecto y 45 días para postular',
    ],
  },
  {
    slug: 'constructor',
    nombre: 'Constructor',
    precioMensualUsd: 67,
    factorAnual: 12,
    resumen: 'Trae o arma 2 proyectos diferentes y postula cada uno tú mismo, hasta en 3 convocatorias durante 45 días.',
    incluye: [
      'Trae o arma 2 proyectos diferentes',
      'Postulas cada proyecto tú mismo, hasta en 3 convocatorias',
      'Centinela Digital',
      'Un mes para desarrollar tus proyectos y 45 días para postular',
    ],
  },
  {
    slug: 'arquitecto',
    nombre: 'Arquitecto',
    precioMensualUsd: 97,
    factorAnual: 12,
    resumen: 'Trae o arma 3 proyectos diferentes y postula cada uno tú mismo, hasta en 3 convocatorias durante 45 días.',
    incluye: [
      'Trae o arma 3 proyectos diferentes',
      'Postulas cada proyecto tú mismo, hasta en 3 convocatorias',
      'Centinela Digital',
      'Un mes para desarrollar tus proyectos y 45 días para postular',
    ],
  },
]

export function nivelPorSlug(slug: string): NivelMembresia | undefined {
  return NIVELES_MEMBRESIA.find((n) => n.slug === slug)
}

export function precioAnualUsd(nivel: NivelMembresia): number {
  return nivel.precioMensualUsd * nivel.factorAnual
}

/** Convierte un precio en dólares al peso colombiano, redondeando a miles. */
export function aPesos(usd: number): number {
  return Math.round((usd * TASA_COP_POR_USD) / 1000) * 1000
}

export function formatoUSD(valor: number): string {
  return '$' + valor.toLocaleString('en-US') + ' USD'
}

/**
 * BENEFICIOS CON CUPO MENSUAL — lo que el cliente "gasta" cada mes.
 * `limite: null` significa sin límite. `limite: 0` significa que ese nivel no lo incluye.
 * Los números salen del Excel nuevo de membresías (12 oct 2026). Ya no hay notas de concepto ni TDR.
 */
export type ClaveBeneficio = 'nota_concepto' | 'tdr' | 'proyecto_minimo' | 'convocatorias'

export const ETIQUETA_BENEFICIO: Record<ClaveBeneficio, string> = {
  nota_concepto: 'Notas de concepto',
  tdr: 'TDR con sugerencias',
  proyecto_minimo: 'Proyectos al mes',
  convocatorias: 'Ventajas del mes (convocatorias)',
}

export const CLAVES_BENEFICIO = Object.keys(ETIQUETA_BENEFICIO) as ClaveBeneficio[]

export const CUPOS_POR_NIVEL: Record<NivelMembresia['slug'], Record<ClaveBeneficio, number | null>> = {
  explorador: { nota_concepto: 0, tdr: 0, proyecto_minimo: 1, convocatorias: null },
  constructor: { nota_concepto: 0, tdr: 0, proyecto_minimo: 2, convocatorias: null },
  arquitecto: { nota_concepto: 0, tdr: 0, proyecto_minimo: 3, convocatorias: null },
}

/**
 * SERVICIOS DE ACOMPAÑAMIENTO — lo que cada nivel puede usar además de los cupos.
 * sesionesPorMes: cuántas sesiones grupales puede reservar al mes (0 = no incluido).
 */
export const SERVICIOS_POR_NIVEL: Record<
  NivelMembresia['slug'],
  { sesionesPorMes: number; comunidad: boolean; acompanamientoSemanal: boolean }
> = {
  // Desde el 28 nov 2026: ningún nivel trae charla mensual, comunidad ni acompañamiento semanal.
  explorador: { sesionesPorMes: 0, comunidad: false, acompanamientoSemanal: false },
  constructor: { sesionesPorMes: 0, comunidad: false, acompanamientoSemanal: false },
  arquitecto: { sesionesPorMes: 0, comunidad: false, acompanamientoSemanal: false },
}
