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
 * - Cobro: botón integrado de Bold (monto firmado en el servidor), un solo pago de $7.140.000.
 */

export const PLAN_EMPRENDEDOR = 'emprendedor'
export const NOMBRE_PLAN_EMPRENDEDOR = 'Estructuración Emprendedor'
export const MONTO_EMPRENDEDOR_COP = 6000000 // + IVA
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

/**
 * Anexo del contrato que SOLO se muestra y se firma con el plan Emprendedor.
 * Reemplaza lo que dicen las cláusulas 7 y 11 del contrato general (igual que
 * el Anexo 1 hace con Fondo Emprender). Los valores salen de las constantes
 * de arriba para que nunca se desacomoden. Conviene que un abogado lo revise.
 */
export const ANEXO_EMPRENDEDOR = `ANEXO 2 — CONDICIONES ESPECÍFICAS DEL PLAN ESTRUCTURACIÓN EMPRENDEDOR

Para quien contrata el plan Estructuración Emprendedor aplican las siguientes
condiciones, que reemplazan lo establecido en la Cláusula 7 (condiciones del
servicio, duración y forma de pago) y en la Cláusula 11 (comisión de éxito
general) únicamente para este plan:

1. Quién puede contratarlo: emprendedores, MiPymes y empresas sin empleados
   que no cuentan con los recursos para estructurar su proyecto. El cliente
   declara que cumple este perfil. SERVING revisa cada solicitud y puede no
   aprobarla; mientras no sea aprobada no hay pago ni servicio en marcha.

2. Duración: un (1) mes contado desde el pago. Dentro de ese mes se entregan
   todas las convocatorias que salgan, completas, hasta la postulación. Este
   plan no tiene período adicional de cortesía ni extensión: al terminar el
   mes, el plan se cierra.

3. Valor y forma de pago: $6.000.000 COP + IVA (19 %), es decir $7.140.000
   COP en total, pagados en un solo contado, una vez aprobada la solicitud.

4. Comisión de éxito: en caso de que el proyecto sea aprobado y reciba
   desembolso, el cliente reconocerá una comisión de éxito del ${COMISION_EMPRENDEDOR_PCT} %
   sobre el monto efectivamente desembolsado, exigible y pagadera bajo las
   mismas condiciones de plazo de la Cláusula 11.

5. Todo lo demás del contrato (tratamiento de datos personales, alcance y
   límite de la responsabilidad, veracidad de la información) sigue igual.`

export const DECLARACION_EMPRENDEDOR =
  'Declaro que soy emprendedor, MiPyme o empresa sin empleados, que no cuento con los recursos para estructurar mi proyecto por otra vía, y que la información que entrego es verdadera. Entiendo que Serving revisa esta solicitud y puede no aprobarla.'
