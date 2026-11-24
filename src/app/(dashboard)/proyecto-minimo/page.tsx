import { redirect } from 'next/navigation'

/** La pantalla "Proyecto mínimo viable" ya no existe: ahora es "Mis proyectos" (armar o traer uno hecho). */
export default function ProyectoMinimoPage() {
  redirect('/mis-proyectos')
}
