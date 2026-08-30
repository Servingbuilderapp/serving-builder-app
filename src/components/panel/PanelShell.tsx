'use client'

import React, { useState } from 'react'
import { MenuLateral } from '@/components/panel/MenuLateral'
import { CabeceraPanel, type ProyectoResumen } from '@/components/panel/CabeceraPanel'

export function PanelShell({
  children,
  proyecto,
  nombreUsuario,
  rolUsuario,
  numeroAlertas,
}: {
  children: React.ReactNode
  proyecto: ProyectoResumen | null
  nombreUsuario: string
  rolUsuario: string
  numeroAlertas?: number
}) {
  const [menuMovil, setMenuMovil] = useState(false)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F4F7FC] text-[#0F172A]">
      <MenuLateral abiertoEnMovil={menuMovil} onCerrar={() => setMenuMovil(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <CabeceraPanel
          onAbrirMenu={() => setMenuMovil(true)}
          proyecto={proyecto}
          nombreUsuario={nombreUsuario}
          rolUsuario={rolUsuario}
          numeroAlertas={numeroAlertas}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
