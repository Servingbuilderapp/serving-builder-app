'use client'

import { usePathname, useSearchParams } from 'next/navigation'

/**
 * La App de Ideas vive en dos lugares con las mismas pantallas:
 * - /ideas (panel del Camino B)
 * - /empresarial/ideas (Camino A, con su propio menú)
 * Esta función convierte un enlace "/ideas/..." en el enlace correcto según dónde esté la persona,
 * y en el Camino A conserva el ?proyecto= para que el menú del camino siga visible.
 */
export function useRutaIdeas() {
  const pathname = usePathname() ?? ''
  const proyecto = useSearchParams().get('proyecto')
  const enCaminoA = pathname.startsWith('/empresarial')
  return (ruta: string): string => {
    if (!enCaminoA) return ruta
    const base = `/empresarial${ruta}`
    return proyecto ? `${base}?proyecto=${proyecto}` : base
  }
}
