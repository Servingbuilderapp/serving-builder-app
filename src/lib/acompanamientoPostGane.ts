/**
 * ACOMPAÑAMIENTO DESPUÉS DE GANAR
 * ================================
 *
 * Servicio APARTE del porcentaje de éxito. Se ofrece al cliente que ya ganó
 * los recursos, para acompañar la ejecución del proyecto durante 12 meses.
 *
 * Es el único sitio donde viven estos valores. Para ajustar un corte o un
 * valor, se cambia aquí y se refleja en la pantalla de contratar.
 *
 * - Los extremos (desde USD 200.000 ganados; de USD 1.000 a 3.500 al mes;
 *   12 meses) los definió el dueño.
 * - Los valores y cortes intermedios son un borrador pendiente de su visto
 *   bueno (tabla del 17 oct 2026).
 */

export const ACOMPANAMIENTO_POSTGANE = {
  mesesDuracion: 12,
  /** Monto ganado, en USD, desde el cual aplica este servicio. */
  desdeUsdGanados: 200_000,
  filas: [
    { desde: 200_000, hasta: 500_000, mensualUsd: 1_000 },
    { desde: 500_001, hasta: 1_000_000, mensualUsd: 1_500 },
    { desde: 1_000_001, hasta: 2_000_000, mensualUsd: 2_200 },
    { desde: 2_000_001, hasta: 4_000_000, mensualUsd: 2_800 },
    { desde: 4_000_001, hasta: 6_000_000, mensualUsd: 3_500 },
  ],
} as const

export function formatoUsd(valor: number): string {
  return `USD ${valor.toLocaleString('es-CO')}`
}
