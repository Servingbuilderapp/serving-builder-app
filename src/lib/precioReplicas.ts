/**
 * PRECIO DE RÉPLICAS
 * ==================
 *
 * Este archivo es el único sitio donde se decide cuánto cobra el Portal de
 * Réplicas. Sigue el mismo patrón que `mediosDePago.ts`: no hay que tocar
 * ninguna pantalla para cambiar un precio, solo este archivo.
 *
 * Hay dos formas de Réplica, según lo decidido por el dueño el 7 de
 * septiembre de 2026 (ver el documento de esa fecha en el proyecto):
 *
 *   'ya_presentado'    El proyecto ya fue postulado antes a una convocatoria,
 *                      se recibió el resultado (feedback), y se quiere volver
 *                      a presentar — ajustado — en esa misma convocatoria en
 *                      otra edición, o en una distinta.
 *
 *   'no_presentado'    El proyecto ya está estructurado (pasó el Motor 1) pero
 *                      nunca se ha postulado. Se quiere presentar en varias
 *                      formas a la vez sobre ese MISMO proyecto base — otro
 *                      proponente, otro territorio, otro presupuesto, etc.
 *                      (ver TIPOS_REPLICA en motorReplica.ts).
 *
 * CONFIRMADO por el dueño el 7 de septiembre de 2026, tarde:
 *
 *   - El precio de 'no_presentado' (USD 2.500) es un PAGO ÚNICO por el
 *     proyecto base, sin importar en cuántas formas distintas termine
 *     postulándose (otro territorio, otro beneficiario, otro proponente,
 *     otro presupuesto, etc. — todas incluidas en ese precio).
 *
 *   - Los precios quedan en dólares en toda la plataforma, con el
 *     equivalente en pesos mostrado al lado como referencia (no como cobro
 *     real). Ver `conversionMoneda.ts` para cómo se calcula y cómo
 *     actualizar la tasa de cambio.
 */

export type ModalidadReplica = 'ya_presentado' | 'no_presentado'

export type PrecioReplica = {
  id: ModalidadReplica
  nombre: string
  descripcionCorta: string
  descripcion: string
  precioUSD: number
}

export const PRECIOS_REPLICA: Record<ModalidadReplica, PrecioReplica> = {
  ya_presentado: {
    id: 'ya_presentado',
    nombre: 'Réplica de un proyecto ya presentado',
    descripcionCorta: 'Se vuelve a postular, ajustado con el feedback recibido.',
    descripcion:
      'El proyecto ya fue postulado a una convocatoria y se recibió el resultado. ' +
      'Se ajusta con ese feedback y se vuelve a presentar, en la misma convocatoria ' +
      '(otra edición) o en una distinta.',
    precioUSD: 1800,
  },
  no_presentado: {
    id: 'no_presentado',
    nombre: 'Réplica de un proyecto estructurado, aún no presentado',
    descripcionCorta: 'Se adapta y se postula en varias formas a la vez.',
    descripcion:
      'El proyecto ya está estructurado pero nunca se ha postulado. Se adapta el ' +
      'mismo proyecto base a varias formas de postulación — otro proponente, otro ' +
      'territorio, otro presupuesto, otra línea temática, etc. — y se presenta en ' +
      'todas ellas.',
    precioUSD: 2500,
  },
}

export { formatoUSD, formatoCOP, convertirUsdACop, precioConEquivalenciaCOP } from './conversionMoneda'
import { formatoUSD, precioConEquivalenciaCOP } from './conversionMoneda'

/** Atajo para mostrar el precio de una modalidad ya formateado, solo en dólares. */
export function precioReplicaTexto(modalidad: ModalidadReplica): string {
  return formatoUSD(PRECIOS_REPLICA[modalidad].precioUSD)
}

/**
 * El mismo precio, pero con el equivalente en pesos al lado, para mostrar en
 * pantalla. Ej: "US$ 1.800 (aprox. $5.627.000 COP)"
 */
export function precioReplicaConEquivalencia(modalidad: ModalidadReplica): string {
  return precioConEquivalenciaCOP(PRECIOS_REPLICA[modalidad].precioUSD)
}
