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
 * El precio anual es 10 veces el mensual: pagando el año completo, el cliente
 * recibe 2 meses gratis. Para cambiarlo, se cambia solo el campo
 * `factorAnual` de cada nivel.
 */

export const TASA_COP_POR_USD = 3493 // La misma tasa que usa /contratar. Actualizar periódicamente.

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
    factorAnual: 10,
    resumen: 'Trae 1 proyecto listo o arma el tuyo por tu cuenta, y postula tú mismo hasta en 3 convocatorias.',
    incluye: [
      'Trae 1 proyecto listo, o arma el tuyo por ti mismo',
      'Centinela Digital',
      'App de ideas',
      'Postulas tu proyecto tú mismo, hasta en 3 convocatorias',
      'Si ganas, el 10 % es para Serving',
    ],
  },
  {
    slug: 'constructor',
    nombre: 'Constructor',
    precioMensualUsd: 97,
    factorAnual: 10,
    resumen: 'Trae o arma 2 proyectos diferentes y postula cada uno tú mismo, hasta en 3 convocatorias.',
    incluye: [
      'Trae o arma 2 proyectos diferentes',
      'Postulas cada proyecto tú mismo, hasta en 3 convocatorias',
      'Centinela Digital',
      'App de ideas',
      'Charla mensual',
      'Si ganas, el 10 % es para Serving',
    ],
  },
  {
    slug: 'arquitecto',
    nombre: 'Arquitecto',
    precioMensualUsd: 197,
    factorAnual: 10,
    resumen: 'Trae o arma 3 proyectos, postula cada uno tú mismo hasta en 3 convocatorias y cuenta con acompañamiento semanal.',
    incluye: [
      'Trae o arma 3 proyectos diferentes',
      'Postulas cada proyecto tú mismo, hasta en 3 convocatorias',
      'Centinela Digital',
      'App de ideas',
      'Charla mensual',
      'Acompañamiento semanal',
      'Si ganas, el 10 % es para Serving',
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
  // Desde el 23 nov 2026: charla mensual en Constructor y Arquitectura; acompañamiento semanal solo en Arquitecto. Sin comunidad.
  explorador: { sesionesPorMes: 0, comunidad: false, acompanamientoSemanal: false },
  constructor: { sesionesPorMes: 1, comunidad: false, acompanamientoSemanal: false },
  arquitecto: { sesionesPorMes: 1, comunidad: false, acompanamientoSemanal: true },
}
