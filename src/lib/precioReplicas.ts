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
 * OJO — dos cosas que quedaron sin confirmar con el dueño, por la prisa del
 * día en que se definió el precio. Revisar antes de cobrar el primer cliente:
 *
 *   1. El precio de 'no_presentado' se dejó como un PAGO ÚNICO por el
 *      proyecto base, sin importar en cuántas convocatorias distintas
 *      termine postulándose. Si el dueño quiere cobrar por cada variante o
 *      poner un tope de variantes incluidas, hay que cambiar `precioUSD` por
 *      una función que reciba el número de variantes.
 *
 *   2. El precio está en dólares. Para un cliente colombiano que paga en
 *      pesos hace falta decidir la tasa de conversión (o dejarlo también en
 *      dólares, como ya se hace en `COBRO_EXTERIOR` de mediosDePago.ts). Por
 *      ahora este archivo solo entrega el valor en USD.
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

/** Formatea un valor en dólares: 1800 -> "US$ 1.800" */
export function formatoUSD(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(valor)
}

/** Atajo para mostrar el precio de una modalidad ya formateado. */
export function precioReplicaTexto(modalidad: ModalidadReplica): string {
  return formatoUSD(PRECIOS_REPLICA[modalidad].precioUSD)
}
