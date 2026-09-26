/**
 * "Mis convocatorias" — la pantalla del CLIENTE.
 *
 * Corrección del 26 sep 2026: este archivo (page.tsx) es el que de verdad
 * usa Next.js para la ruta /mis-convocatorias. Antes tenía su propia copia
 * de la lógica, más vieja que la de `mis-convocatorias-page.tsx` (le
 * faltaba, entre otras cosas, mostrar el estado de la postulación). Las dos
 * copias se habían ido desincronizando. Para que eso no vuelva a pasar,
 * aquí solo se reexporta la versión completa y actualizada.
 */
export { default, dynamic, revalidate } from './mis-convocatorias-page'
