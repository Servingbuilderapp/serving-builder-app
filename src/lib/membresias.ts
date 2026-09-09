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
 * El precio anual, por ahora, es sencillamente 12 veces el mensual: el dueño
 * no ha dicho si el pago anual lleva algún descuento. El día que lo diga,
 * se cambia solo el campo `factorAnual` de cada nivel.
 */

export const TASA_COP_POR_USD = 3244 // La misma tasa que usa /contratar. Actualizar periódicamente.

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
    resumen: 'Para empezar a moverte: las herramientas, el mapa de fondos y una nota de concepto al mes.',
    incluye: [
      'Apps de Ideas',
      'Lista de fondos y motores de búsqueda',
      'Glosario de términos',
      'Calendario de convocatorias inteligente',
      'Metodología',
      '1 nota de concepto a convocatorias al mes',
      '5 convocatorias del mes',
    ],
  },
  {
    slug: 'constructor',
    nombre: 'Constructor',
    precioMensualUsd: 97,
    factorAnual: 12,
    resumen: 'Todo lo del Explorador, más ayuda real para estructurar tu primer proyecto mínimo viable.',
    incluye: [
      'Todo lo del Explorador',
      'Curso mínimo viable de convocatorias (offline, ~6 horas)',
      '5 manuales de convocatorias especiales',
      'Ayuda para estructurar 1 proyecto mínimo viable al mes',
      '1 TDR con sugerencias al mes',
      '10 convocatorias del mes',
    ],
  },
  {
    slug: 'arquitecto',
    nombre: 'Arquitecto',
    precioMensualUsd: 197,
    factorAnual: 12,
    resumen: 'El nivel completo: comunidad, acceso a expertos y acceso anticipado a lo nuevo de la plataforma.',
    incluye: [
      'Todo lo del Constructor',
      'Todos los manuales, sin límite',
      'Estructurar hasta 3 proyectos mínimos viables al mes',
      '3 notas de concepto, 3 TDR',
      'Todas las convocatorias del mes',
      'Comunidad',
      'Acceso a expertos: charlas, podcasts y contenido que edifica',
      'Acceso anticipado a convocatorias y funciones nuevas',
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
