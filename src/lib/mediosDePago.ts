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
  /** Nombre de la entidad tal como aparece en la lista de bancos del cliente. */
  banco: string
  /** Código interbancario, por si el banco del cliente lo pide. */
  codigoEntidad?: string
  /** 'Ahorros' o 'Corriente'. Si el cliente paga por llave Bre-B no hace falta. */
  tipo: string
  numero: string
  titular: string
  nit: string
  /**
   * Llaves Bre-B: celular, correo o las dos. Es la forma más segura de cobrar,
   * porque el cliente no tiene que escoger tipo de cuenta ni entidad — solo
   * escribe la llave y le sale el nombre del titular para confirmar.
   */
  llaves?: { etiqueta: string; valor: string }[]
}

export type CobroColombia = {
  modo: 'factura' | 'transferencia'
  cuenta: CuentaBancaria | null
}

export const COBRO_COLOMBIA: CobroColombia = {
  modo: 'transferencia',

  cuenta: {
    banco: 'Bold CF',
    codigoEntidad: '1808',
    // La Cuenta Digital Bold CF es un DEPÓSITO, no una cuenta de ahorros.
    // Muchos bancos solo ofrecen "ahorros" o "corriente" en su formulario de
    // transferencia; por eso la llave Bre-B va de primera, que no pide tipo.
    tipo: 'Depósito',
    numero: '1700 1105 6454',
    titular: 'Serving Proyectos Estratégicos SAS',
    nit: '901972451-7',
    llaves: [
      { etiqueta: 'Celular', valor: '+57 322 700 8727' },
      { etiqueta: 'Correo', valor: 'servingproyectosgi@gmail.com' },
    ],
  },
}

/**
 * EXTERIOR — PayPal.
 * Poner en false lo apaga y deja el mismo mensaje de factura que Colombia.
 */
export const COBRO_EXTERIOR = {
  paypal: true,
}

/**
 * PAGO EN DOS PARTES
 * ==================
 *
 * Mitad al firmar, mitad el día de la entrega (día 30).
 *
 * EL PUNTO IMPORTANTE: el segundo pago no va detrás del trabajo, va DELANTE de
 * lo que el cliente más quiere. Con ese pago arrancan los meses de búsqueda de
 * convocatorias y radicación. Un cliente que no lo paga se queda con un
 * documento y sin nadie que lo postule — no hay que perseguirlo.
 *
 * Para cambiar el corte, se cambia `porcentajeAnticipo` y ya. Para volver al
 * pago de una sola vez, `activo: false`.
 */
export const PAGO_EN_DOS_PARTES = {
  activo: true,
  porcentajeAnticipo: 50,
}

/** Parte el valor total en anticipo y saldo, redondeando a miles. */
export function partirEnDos(total: number) {
  if (!PAGO_EN_DOS_PARTES.activo) {
    return { hayDosPartes: false as const, anticipo: total, saldo: 0 }
  }
  const anticipo = Math.round((total * PAGO_EN_DOS_PARTES.porcentajeAnticipo) / 100 / 1000) * 1000
  return { hayDosPartes: true as const, anticipo, saldo: total - anticipo }
}
