import { PRECIOS_REPLICA } from '@/lib/precioReplicas'
import { TASAS_DE_CAMBIO, convertirUsdACop } from '@/lib/conversionMoneda'

/**
 * ABANICO — datos comunes a todas las piezas (cobro, preparación y elección).
 *
 * "Armar mi abanico" es un solo plan: el proyecto del cliente, adaptado hasta a 12
 * convocatorias. Todo es automático: el cliente paga con Bold, la plataforma prepara
 * las convocatorias sola, y el cliente escoge a cuáles quiere entrar.
 */

/** Cuántas convocatorias se preparan, como máximo. Si salen menos, son las que hay. */
export const TOTAL_ABANICO = 12

/** Cuántas convocatorias se preparan en cada pasada (cada una es una llamada a la IA). */
export const LOTE_ABANICO = 3

export type EstadoAbanico = 'pendiente_pago' | 'pagado' | 'preparando' | 'listo' | 'confirmado' | 'sin_opciones'

/**
 * Cuánto se cobra. Los precios de la plataforma están en dólares. Clientes de otro país
 * pagan en dólares (Bold USD); en Colombia se cobra en pesos, al cambio de hoy.
 */
export function precioAbanico(pasarela: string | null | undefined): {
  moneda: 'COP' | 'USD'
  monto: number
  usd: number
  cop: number
  tasa: number
} {
  const usd = PRECIOS_REPLICA.abanico.precioUSD
  const cop = convertirUsdACop(usd)
  const enDolares = pasarela === 'Bold USD'
  return {
    moneda: enDolares ? 'USD' : 'COP',
    monto: enDolares ? usd : cop,
    usd,
    cop,
    tasa: TASAS_DE_CAMBIO.USD_COP.valor,
  }
}
