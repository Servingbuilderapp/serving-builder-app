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
  esClienteMarcaBlanca = false,
  tieneCortesia = false,
}: {
  children: React.ReactNode
  proyecto: ProyectoResumen | null
  nombreUsuario: string
  rolUsuario: string
  numeroAlertas?: number
  /** true solo para un cliente final que entró por el enlace de un socio de marca blanca. */
  esClienteMarcaBlanca?: boolean
  tieneCortesia?: boolean
}) {
  const [menuMovil, setMenuMovil] = useState(false)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#54142B] text-[#F3E7DC]">
      <MenuLateral
        abiertoEnMovil={menuMovil}
        onCerrar={() => setMenuMovil(false)}
        esEquipo={rolUsuario === 'Administrador'}
        esSocio={rolUsuario === 'Socio'}
        esClienteMarcaBlanca={esClienteMarcaBlanca}
        tieneCortesia={tieneCortesia}
      />

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
