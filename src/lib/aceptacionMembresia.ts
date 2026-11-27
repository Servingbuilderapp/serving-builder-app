/**
 * Lo que el cliente acepta al comprar una membresía. Se muestra en la casilla de
 * la pantalla de compra y el mismo texto se guarda con la fecha, para que quede constancia.
 * Si se cambia la redacción, se cambia solo aquí.
 */
export const VERSION_ACEPTACION_MEMBRESIA = '2026-11-27'

export function textoAceptacionMembresia(ciclo: 'mensual' | 'anual'): string {
  return (
    `Acepto que esta es una suscripción ${ciclo} y que debo renovar el pago cuando venza para seguir teniendo acceso. ` +
    'También acepto que, si con un proyecto trabajado en esta plataforma gano recursos en cualquier convocatoria, ' +
    'la haya registrado aquí o no, el 10 % de lo desembolsado corresponde a Serving Proyectos Estratégicos SAS. ' +
    'Entiendo que cada proyecto tiene máximo 3 postulaciones.'
  )
}
