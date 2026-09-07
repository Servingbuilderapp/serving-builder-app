/**
 * CONVERSIÓN DE MONEDA
 * ====================
 *
 * Este archivo es el único sitio donde vive la tasa de cambio de la
 * plataforma. Sirve para mostrar, al lado de un precio en dólares, cuánto es
 * aproximadamente en pesos colombianos — por ejemplo en Réplicas
 * (`precioReplicas.ts`), donde los precios están fijados en USD.
 *
 * OJO — esto es solo para MOSTRAR una referencia en pantalla. No cambia cómo
 * se cobra de verdad: eso lo sigue decidiendo `mediosDePago.ts` (factura,
 * transferencia, PayPal). Nadie paga automáticamente en pesos por esto; es
 * solo para que el cliente entienda el monto sin tener que buscar la tasa por
 * su cuenta.
 *
 * CÓMO ACTUALIZAR LA TASA
 * ------------------------
 * La TRM (tasa representativa del mercado) cambia todos los días. No hace
 * falta actualizarla a diario — con revisarla cada una o dos semanas, o
 * cuando el dólar se mueva mucho, alcanza. Se cambia el número de `valor` de
 * abajo y la fecha de `actualizada`. La TRM oficial de Colombia se puede
 * consultar en la página del Banco de la República o en cualquier buscador.
 *
 * Cuando en el futuro se quiera agregar euros (u otra moneda), se agrega otra
 * entrada al mismo objeto `TASAS_DE_CAMBIO`, con el mismo formato.
 */

export type TasaDeCambio = {
  /** Cuántos pesos colombianos vale un dólar. */
  valor: number
  /** Cuándo se revisó esta tasa por última vez (para saber si ya está vieja). */
  actualizada: string
  fuente: string
}

export const TASAS_DE_CAMBIO: { USD_COP: TasaDeCambio } = {
  USD_COP: {
    valor: 3126.08,
    actualizada: '2026-09-07',
    fuente: 'TRM oficial de Colombia',
  },
}

/** Convierte un valor en dólares a pesos colombianos, redondeado a miles. */
export function convertirUsdACop(valorUsd: number): number {
  const cop = valorUsd * TASAS_DE_CAMBIO.USD_COP.valor
  return Math.round(cop / 1000) * 1000
}

/** Formatea un valor en pesos: 6000000 -> "$6.000.000" */
export function formatoCOP(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor)
}

/** Formatea un valor en dólares: 1800 -> "US$ 1.800" */
export function formatoUSD(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(valor)
}

/**
 * El texto que se muestra en pantalla: el valor en dólares, y al lado, entre
 * paréntesis, el equivalente aproximado en pesos.
 * Ej: "US$ 1.800 (aprox. $5.627.000 COP)"
 */
export function precioConEquivalenciaCOP(valorUsd: number): string {
  const cop = convertirUsdACop(valorUsd)
  return `${formatoUSD(valorUsd)} (aprox. ${formatoCOP(cop)} COP)`
}
