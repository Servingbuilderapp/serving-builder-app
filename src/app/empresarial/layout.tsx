import React from 'react'
import { MenuCamino } from '@/components/empresarial/MenuCamino'
import { GuardaAcceso } from '@/components/empresarial/GuardaAcceso'
import { createClient } from '@/lib/supabase/server'
import { asegurarMembresia, calcularAcceso } from '@/lib/empresarial/membresia'

/**
 * Marco común de todas las pantallas de Proyectos Empresariales.
 * Cuando la dirección trae ?proyecto=ID, muestra a la izquierda el camino completo
 * (diagnóstico, oportunidades, formulación, mercado…) para entrar a cualquier paso.
 * Sin ?proyecto no muestra nada y la pantalla ocupa todo el ancho.
 */
/**
 * Las pantallas de la App de Ideas se comparten con el Camino B y usan los colores generales
 * (letra crema, dorado). Aquí, solo dentro del Camino A, se reemplazan por crema con vino y dorado.
 */
const COLORES_CAMINO_A = {
  '--color-color-base-100': '#F3E7DC',
  '--color-color-base-200': '#FBF7F0',
  '--color-color-base-300': '#EADBC6',
  '--color-color-base-content': '#54142B',
  '--color-color-primary': '#7A5B2C',
  '--color-color-accent-blue': '#4A6FB5',
} as React.CSSProperties

export default async function EmpresarialLayout({ children }: { children: React.ReactNode }) {
  // Se lee el plan de la persona. Si es la primera vez que entra, aquí empieza a contar su mes.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const fila = user ? await asegurarMembresia(user.id) : null
  const acceso = fila ? calcularAcceso(fila) : null

  return (
    <div className="camino-a bg-ca-fondo text-ca-vino lg:flex" style={COLORES_CAMINO_A}>
      <MenuCamino />
      <div className="min-w-0 flex-1">
        {acceso && <GuardaAcceso activo={acceso.activo} diasRestantes={acceso.diasRestantes} enPeriodoInicial={acceso.enPeriodoInicial} />}
        {children}
      </div>
    </div>
  )
}
