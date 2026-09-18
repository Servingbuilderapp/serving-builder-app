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
 *
 * MENTORÍA: reutiliza exactamente este mismo flujo de compra y de pago
 * (formulario, Bold, transferencia manual) — es la misma mecánica que un
 * curso de Academia, solo que en vez de contenido para leer, lo que se
 * entrega es un mes de acompañamiento del equipo. Por eso vive aparte, en
 * `MENTORIA`, y no dentro de `CURSOS_ACADEMIA` (esa lista es la que se ve
 * en la pantalla /academia, que es solo para los cursos de autoestudio).
 */

import { aPesos, formatoUSD } from '@/lib/membresias'

export type CursoSlug = 'estructuracion' | 'formulacion' | 'mentoria'

export type Curso = {
  slug: CursoSlug
  nombre: string
  precioUsd: number
  resumen: string
  formato: 'lectura' | 'presentacion' | 'servicio'
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

/**
 * Mentoría de Estructuración — confirmado por el dueño el 17 sep 2026 (ver
 * `claude/producto-mentoria-definicion-y-precio-2026-09-17.md` en el
 * Proyecto): un mes de acompañamiento del equipo de Serving CON el
 * cliente — ni lo hace solo (Academia) ni se lo entregan sin que él
 * intervenga (Estructuración): el equipo trabaja junto con él. Incluye
 * dejar el proyecto estructurado, buscar una convocatoria y postular a
 * ella; si no sale seleccionada, hasta 2 réplicas en los 6 meses
 * siguientes. Precio fijo, pago único: US$2.500 — no es "según el caso".
 */
export const MENTORIA: Curso = {
  slug: 'mentoria',
  nombre: 'Mentoría de Estructuración',
  precioUsd: 2500,
  resumen:
    'Un mes de acompañamiento del equipo de Serving contigo: dejamos tu proyecto estructurado, buscamos una convocatoria y hacemos la postulación. Si no sale seleccionada, tienes 6 meses para hasta 2 réplicas.',
  formato: 'servicio',
  incluye: [
    '1 mes de acompañamiento con el equipo de Serving',
    'Trabajo personalizado, contigo',
    'Búsqueda de una convocatoria y postulación',
    'Hasta 2 réplicas en los 6 meses siguientes, si no sale seleccionada',
  ],
}

export function cursoPorSlug(slug: string): Curso | undefined {
  if (slug === MENTORIA.slug) return MENTORIA
  return CURSOS_ACADEMIA.find((c) => c.slug === slug)
}

export function precioCOP(curso: Curso): number {
  return aPesos(curso.precioUsd)
}

export function precioUSDTexto(curso: Curso): string {
  return formatoUSD(curso.precioUsd)
}
