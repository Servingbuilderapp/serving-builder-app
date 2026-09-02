/**
 * COMISIÓN DE ÉXITO — UN SOLO SITIO.
 *
 * Antes las escalas vivían escritas a mano dentro del texto legal de
 * /contratar, y el contrato que el cliente firma en /estructuracion ni
 * siquiera las mencionaba. Resultado: quien firmaba por /estructuracion no se
 * obligaba a pagar la comisión de éxito, que es la línea de ingreso más
 * grande del negocio.
 *
 * Desde aquí se alimentan los dos documentos. Para cambiar un porcentaje se
 * toca este archivo y nada más.
 */

export interface EscalonExito {
  /** Hasta cuánto llega este escalón. Infinity = de ahí en adelante. */
  hasta: number
  /** Porcentaje sobre el monto desembolsado. */
  porcentaje: number
  /** Cómo se lee el rango en el contrato. */
  etiqueta: string
}

/**
 * Escala general — todas las fuentes de financiación EXCEPTO Fondo Emprender.
 * Los rangos van en dólares porque la mayoría de la cooperación internacional
 * desembolsa en dólares o euros.
 *
 * Los rangos son continuos a propósito: no hay ningún monto que se quede sin
 * escalón, ni por debajo del primero ni por encima del último.
 */
export const ESCALA_EXITO_GENERAL: EscalonExito[] = [
  { hasta: 100_000, porcentaje: 12, etiqueta: 'Hasta USD 100.000' },
  { hasta: 400_000, porcentaje: 10, etiqueta: 'De USD 100.001 a USD 400.000' },
  { hasta: 1_000_000, porcentaje: 7, etiqueta: 'De USD 400.001 a USD 1.000.000' },
  { hasta: Infinity, porcentaje: 4, etiqueta: 'Más de USD 1.000.000' },
]

/**
 * Escala de Fondo Emprender, en pesos y sobre el monto aprobado.
 * El último escalón aplica de ahí en adelante, sin tope.
 */
export const ESCALA_EXITO_FONDO_EMPRENDER: EscalonExito[] = [
  { hasta: 30_000_000, porcentaje: 20, etiqueta: 'Hasta $30.000.000 COP' },
  { hasta: 73_000_000, porcentaje: 17, etiqueta: 'De $30.000.001 a $73.000.000 COP' },
  { hasta: Infinity, porcentaje: 10, etiqueta: 'Más de $73.000.000 COP' },
]

/** Días que tiene el cliente para pagar, contados desde que recibe el dinero. */
export const PLAZO_PAGO_EXITO_DIAS = 10

function porcentajeDe(escala: EscalonExito[], monto: number): number {
  const escalon = escala.find((e) => monto <= e.hasta)
  return escalon ? escalon.porcentaje : escala[escala.length - 1].porcentaje
}

/** Porcentaje de comisión de éxito para un desembolso en dólares. */
export function porcentajeExitoGeneral(montoUsd: number): number {
  return porcentajeDe(ESCALA_EXITO_GENERAL, montoUsd)
}

/** Porcentaje de comisión de éxito para un aprobado de Fondo Emprender, en pesos. */
export function porcentajeExitoFondoEmprender(montoCop: number): number {
  return porcentajeDe(ESCALA_EXITO_FONDO_EMPRENDER, montoCop)
}

function listar(escala: EscalonExito[], sangria: string): string {
  return escala.map((e) => `${sangria}- ${e.etiqueta}: ${e.porcentaje}%`).join('\n')
}

/** Los cuatro renglones de la escala general, listos para el texto legal. */
export const TEXTO_ESCALA_EXITO_GENERAL = listar(ESCALA_EXITO_GENERAL, '  ')

/** Los renglones de la escala de Fondo Emprender, con la sangría del Anexo 1. */
export const TEXTO_ESCALA_EXITO_FONDO_EMPRENDER = listar(ESCALA_EXITO_FONDO_EMPRENDER, '   ')

/**
 * Regla de conversión. Los escalones generales están en dólares, pero el
 * desembolso puede llegar en pesos. Sin esta regla el cliente puede discutir
 * qué escalón le aplica.
 */
export const TEXTO_CONVERSION_EXITO =
  'Cuando el desembolso se realice en una moneda distinta al dólar, el escalón ' +
  'aplicable se determinará convirtiendo el monto efectivamente desembolsado a ' +
  'dólares de los Estados Unidos a la Tasa Representativa del Mercado (TRM) ' +
  'vigente en la fecha del desembolso, y la comisión se liquidará y pagará en la ' +
  'moneda en que el desembolso haya sido recibido.'
