/**
 * Lo que el cliente acepta al comprar una membresía. Se muestra en la casilla de
 * la pantalla de compra y el mismo texto se guarda con la fecha, para que quede constancia.
 * Si se cambia la redacción, se cambia solo aquí.
 */
export const VERSION_ACEPTACION_MEMBRESIA = '2026-11-28'

export function textoAceptacionMembresia(ciclo: 'mensual' | 'anual'): string {
  return (
    `Acepto el contrato de esta membresía. Es una suscripción ${ciclo} y debo renovar el pago cuando venza para seguir teniendo acceso. ` +
    'Entiendo que cada mes de servicio sirve para desarrollar mi proyecto y usar Centinela Digital, que tengo 45 días para postular y que luego el mes se cierra. ' +
    'Postulo yo mismo, sin comisión de éxito para Serving, y la asistencia de Serving se limita a la plataforma y sus servicios técnicos. ' +
    'Entiendo que cada proyecto tiene máximo 3 postulaciones.'
  )
}
