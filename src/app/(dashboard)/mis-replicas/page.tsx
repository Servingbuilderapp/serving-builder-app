import { redirect } from 'next/navigation'

/**
 * "Mis réplicas" ya no existe: lo reemplazó "Mi abanico" (un solo plan, un solo precio).
 * Este archivo solo evita que un enlace viejo se rompa: manda a la pantalla nueva.
 */
export default function MisReplicasVieja() {
  redirect('/mi-abanico')
}
