/**
 * ACADEMIA — catálogo de cursos.
 *
 * Único sitio donde están el nombre, el precio y el resumen de cada curso.
 * Todo pago es ÚNICO (no recurrente, a diferencia de las membresías): una
 * vez confirmado, el cliente tiene acceso de por vida a ese curso.
 *
 * Los precios están en dólares. Para un cliente colombiano se convierten a
 * pesos con la misma tasa que usa toda la plataforma (`aPesos()` en
 * `src/lib/membresias.ts`).
 */

import { aPesos, formatoUSD } from '@/lib/membresias'

export type CursoSlug = 'estructuracion' | 'formulacion'

export type Curso = {
  slug: CursoSlug
  nombre: string
  precioUsd: number
  resumen: string
  formato: 'lectura' | 'presentacion'
  incluye: string[]
}

export const CURSOS_ACADEMIA: Curso[] = [
  {
    slug: 'estructuracion',
    nombre: 'Entendiendo la Estructuración de Proyectos',
    precioUsd: 497,
    resumen:
      'Los cuatro bloques completos para entender cómo se estructura un proyecto desde el ecosistema de financiación hasta el encaje con la fuente correcta.',
    formato: 'lectura',
    incluye: [
      '4 bloques completos, con unidades y subtemas',
      'Casos de estudio y preguntas de reflexión',
      'Listas de verificación por bloque',
      'Glosario de términos en cada bloque',
      'Acceso de por vida, a tu ritmo',
    ],
  },
  {
    slug: 'formulacion',
    nombre: 'Entendiendo la Formulación de Proyectos',
    precioUsd: 197,
    resumen:
      'Un curso en formato de presentación para aprender a redactar el problema, los objetivos, los indicadores, el presupuesto y la sostenibilidad de un proyecto.',
    formato: 'presentacion',
    incluye: [
      '6 temas completos, diapositiva por diapositiva',
      'Espacio para tomar notas que se guardan solas',
      'Ejemplos y listas de verificación en cada tema',
      'Menú con el índice completo para saltar a cualquier parte',
      'Acceso de por vida, a tu ritmo',
    ],
  },
]

export function cursoPorSlug(slug: string): Curso | undefined {
  return CURSOS_ACADEMIA.find((c) => c.slug === slug)
}

export function precioCOP(curso: Curso): number {
  return aPesos(curso.precioUsd)
}

export function precioUSDTexto(curso: Curso): string {
  return formatoUSD(curso.precioUsd)
}
