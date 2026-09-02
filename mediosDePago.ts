/**
 * CÓMO SE COBRA
 * =============
 *
 * Este archivo es el único sitio donde se decide cómo paga un cliente.
 * No hay que tocar ninguna pantalla para prender o apagar un medio de pago.
 *
 * ---------------------------------------------------------------------------
 * COLOMBIA — dos modos
 *
 *   'factura'       (el de ahora)
 *                   La página NO muestra números de cuenta. Le dice al cliente
 *                   que le enviamos la factura con los datos de pago. Es lo
 *                   normal en una venta de este tamaño y es lo que permite
 *                   vender sin tener todavía la cuenta lista.
 *
 *   'transferencia' Muestra los datos de la cuenta en pantalla y le pide el
 *                   comprobante por WhatsApp.
 *
 * PARA PASAR A 'transferencia' cuando exista la cuenta de la empresa:
 *   1. cambiar    modo: 'factura'    por    modo: 'transferencia'
 *   2. llenar el objeto `cuenta` de abajo
 * Nada más. La pantalla se acomoda sola.
 *
 * REGLA: la cuenta va a nombre de Serving Proyectos Estratégicos SAS, con su
 * NIT, porque es el mismo NIT que aparece en la factura del cliente.
 * ---------------------------------------------------------------------------
 */

export type CuentaBancaria = {
  banco: string
  tipo: string
  numero: string
  titular: string
  nit: string
}

export type CobroColombia = {
  modo: 'factura' | 'transferencia'
  cuenta: CuentaBancaria | null
}

export const COBRO_COLOMBIA: CobroColombia = {
  modo: 'factura',

  // Ejemplo de cómo queda cuando exista la cuenta:
  // cuenta: {
  //   banco: 'Bancolombia',
  //   tipo: 'Cuenta corriente',
  //   numero: '000-000000-00',
  //   titular: 'Serving Proyectos Estratégicos SAS',
  //   nit: '901972451-7',
  // },
  cuenta: null,
}

/**
 * EXTERIOR — PayPal.
 * Poner en false lo apaga y deja el mismo mensaje de factura que Colombia.
 */
export const COBRO_EXTERIOR = {
  paypal: true,
}
