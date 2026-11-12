import React from 'react'
import { MenuCamino } from '@/components/empresarial/MenuCamino'

/**
 * Marco común de todas las pantallas de Proyectos Empresariales.
 * Cuando la dirección trae ?proyecto=ID, muestra a la izquierda el camino completo
 * (diagnóstico, oportunidades, formulación, mercado…) para entrar a cualquier paso.
 * Sin ?proyecto no muestra nada y la pantalla ocupa todo el ancho.
 */
export default function EmpresarialLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#2E0E1A] lg:flex">
      <MenuCamino />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
