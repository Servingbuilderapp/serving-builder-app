import { PRECIOS_REPLICA } from '@/lib/precioReplicas'
import { TASAS_DE_CAMBIO, convertirUsdACop, formatoCOP, formatoUSD } from '@/lib/conversionMoneda'

/**
 * ABANICO — datos comunes a todas las piezas (cobro, preparación y elección).
 *
 * "Armar mi abanico" es un solo plan: el proyecto del cliente, adaptado hasta a 12
 * convocatorias. Todo es automático: el cliente paga con Bold, la plataforma prepara
 * las convocatorias sola, y el cliente escoge a cuáles quiere entrar.
 */

/** Cuántas convocatorias se preparan, como máximo. Si salen menos, son las que hay. */
export const TOTAL_ABANICO = 12

/** Puntaje mínimo de encaje (de 100) para que una convocatoria entre al abanico. Por debajo no vale la pena postular. */
export const MINIMO_ENCAJE_ABANICO = 60

/** Cuántas convocatorias se preparan en cada pasada (cada una es una llamada a la IA). */
export const LOTE_ABANICO = 3

export type EstadoAbanico = 'pendiente_pago' | 'pagado' | 'preparando' | 'listo' | 'confirmado' | 'sin_opciones'

/** IVA que se suma a los clientes en Colombia. Clientes de otro país no lo pagan. */
export const IVA_COLOMBIA = 0.19

/**
 * Cuánto se cobra. Los precios de la plataforma están en dólares (US$ 2.800).
 *  - Cliente en Colombia: se cobra en pesos, al cambio de hoy, MÁS el IVA del 19 %.
 *  - Cliente de otro país: se cobra en dólares (Bold USD), sin IVA.
 */
export function precioAbanico(pasarela: string | null | undefined): {
  moneda: 'COP' | 'USD'
  /** Lo que se le cobra de verdad al cliente, en su moneda. */
  monto: number
  usd: number
  copBase: number
  iva: number
  copTotal: number
  tasa: number
} {
  const usd = PRECIOS_REPLICA.abanico.precioUSD
  const copBase = convertirUsdACop(usd)
  const iva = Math.round(copBase * IVA_COLOMBIA)
  const copTotal = copBase + iva
  const enDolares = pasarela === 'Bold USD'
  return {
    moneda: enDolares ? 'USD' : 'COP',
    monto: enDolares ? usd : copTotal,
    usd,
    copBase,
    iva,
    copTotal,
    tasa: TASAS_DE_CAMBIO.USD_COP.valor,
  }
}

/** El precio explicado en una frase, para mostrar en pantalla. */
export function textoPrecioAbanico(): string {
  const p = precioAbanico('Manual')
  return (
    `Colombia: ${formatoCOP(p.copBase)} + IVA del 19 % = ${formatoCOP(p.copTotal)}. ` +
    `Otros países: ${formatoUSD(p.usd)}, sin IVA.`
  )
}
