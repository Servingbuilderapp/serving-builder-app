import { redirect } from 'next/navigation'

/**
 * Esta pantalla era del primer recorrido (selector de planes, "Day Zero" y bloques).
 * Hoy contratar y pagar se hace en /contratar, con pago automático. Se deja solo para que
 * ningún enlace viejo muestre cosas que ya no corresponden: manda a Contratar.
 */
export default function EstructuracionRetirada() {
  redirect('/contratar')
}
