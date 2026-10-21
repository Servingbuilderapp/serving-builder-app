/**
 * ESTRUCTURACIÓN EMPRENDEDOR — plan para emprendedores y MiPymes sin recursos.
 *
 * Decidido el 21 de octubre de 2026. Todo lo que define este plan vive aquí,
 * en un solo sitio, para que lo vean igual el cliente y el equipo.
 *
 * - Identificador en la base de datos (plan_pago): 'emprendedor'.
 * - Es avalado: la persona declara su situación y Serving la revisa ANTES de
 *   dejarla pagar. Mientras tanto el proyecto queda en 'pendiente_aval'.
 * - Duración: un mes. Al terminar el plan se cierra.
 * - Comisión de éxito: 10 %.
 * - Cobro: botón integrado de Bold (monto firmado en el servidor), un solo pago de $5.950.000.
 */

export const PLAN_EMPRENDEDOR = 'emprendedor'
export const NOMBRE_PLAN_EMPRENDEDOR = 'Estructuración Emprendedor'
export const MONTO_EMPRENDEDOR_COP = 5000000 // + IVA
export const COMISION_EMPRENDEDOR_PCT = 10
export const MESES_EMPRENDEDOR = 1

/** Estado del proyecto mientras Serving revisa si la persona entra en este plan. */
export const ESTADO_PENDIENTE_AVAL = 'pendiente_aval'

export const INCLUYE_EMPRENDEDOR = [
  'Un mes de acompañamiento, no más',
  'Todas las convocatorias que salgan en ese mes, completas, hasta la postulación',
  'Formulación completa de tu proyecto',
  'Solo para quien no tiene los recursos para estructurar su proyecto',
]

export const DECLARACION_EMPRENDEDOR =
  'Declaro que soy emprendedor, MiPyme o empresa sin empleados, que no cuento con los recursos para estructurar mi proyecto por otra vía, y que la información que entrego es verdadera. Entiendo que Serving revisa esta solicitud y puede no aprobarla.'
