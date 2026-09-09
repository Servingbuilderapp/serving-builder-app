'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Menu, Bell, HelpCircle, ChevronDown, LogOut, User as UserIcon, Settings } from 'lucide-react'

export type ProyectoResumen = {
  id: string
  nombre: string
  estado: string
}

const ETIQUETAS_ESTADO: Record<string, { texto: string; clases: string }> = {
  pendiente_pago: { texto: 'Pendiente de pago', clases: 'bg-[rgba(201,154,61,0.16)] text-[#E0B868] border-[rgba(201,154,61,0.35)]' },
  pagado: { texto: 'Listo para iniciar', clases: 'bg-[rgba(176,141,87,0.16)] text-[#E0C79A] border-[rgba(176,141,87,0.35)]' },
  estructurando_ia: { texto: 'En estructuración', clases: 'bg-[rgba(122,139,111,0.18)] text-[#A9C29A] border-[rgba(122,139,111,0.35)]' },
  estructurado: { texto: 'Estructurado', clases: 'bg-[rgba(122,139,111,0.18)] text-[#A9C29A] border-[rgba(122,139,111,0.35)]' },
  en_encaje: { texto: 'En encaje', clases: 'bg-[rgba(140,54,84,0.22)] text-[#E3B9C2] border-[rgba(140,54,84,0.4)]' },
  postulado: { texto: 'Postulado', clases: 'bg-[rgba(140,147,166,0.18)] text-[#AEB4C4] border-[rgba(140,147,166,0.35)]' },
}

export function etiquetaEstado(estado?: string | null) {
  if (!estado) return { texto: 'Sin iniciar', clases: 'bg-[rgba(243,231,220,0.08)] text-[#CBAF9E] border-[rgba(243,231,220,0.16)]' }
  return (
    ETIQUETAS_ESTADO[estado] || {
      texto: estado.replace(/_/g, ' '),
      clases: 'bg-[rgba(243,231,220,0.08)] text-[#CBAF9E] border-[rgba(243,231,220,0.16)]',
    }
  )
}

export function CabeceraPanel({
  onAbrirMenu,
  proyecto,
  nombreUsuario,
  rolUsuario,
  numeroAlertas = 0,
}: {
  onAbrirMenu: () => void
  proyecto: ProyectoResumen | null
  nombreUsuario: string
  rolUsuario: string
  numeroAlertas?: number
}) {
  const [menuPerfil, setMenuPerfil] = useState(false)
  const router = useRouter()

  const cerrarSesion = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const estado = etiquetaEstado(proyecto?.estado)
  const iniciales = nombreUsuario
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="h-[68px] shrink-0 bg-[#4C2032] border-b border-[rgba(176,141,87,0.2)] flex items-center gap-4 px-4 lg:px-6">
      <button
        type="button"
        onClick={onAbrirMenu}
        aria-label="Abrir menú"
        className="lg:hidden h-9 w-9 rounded-lg border border-[rgba(176,141,87,0.3)] flex items-center justify-center text-[#F3E7DC] shrink-0"
      >
        <Menu className="h-4 w-4" />
      </button>

      <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#C39F68] to-[#A8804B] flex items-center justify-center">
          <span className="text-[15px] font-black text-[#3A1420] leading-none">A</span>
        </div>
        <div className="hidden sm:block leading-tight">
          <div className="text-[13px] font-extrabold tracking-tight text-[#F3E7DC] font-[family-name:var(--font-cormorant)]">
            ARQUITECTURA DIGITAL
          </div>
          <div className="text-[10px] text-[#CBAF9E]">De la idea a la postulación</div>
        </div>
      </Link>

      {/* Proyecto activo */}
      <div className="flex-1 flex justify-center min-w-0">
        {proyecto ? (
          <div className="w-full max-w-[520px] rounded-xl border border-[rgba(176,141,87,0.25)] bg-[rgba(0,0,0,0.16)] px-4 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#B08D57]">
              Proyecto activo
            </div>
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-[14px] font-bold text-[#F3E7DC] truncate">{proyecto.nombre}</span>
              <span
                className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${estado.clases}`}
              >
                {estado.texto}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          aria-label="Notificaciones"
          className="relative h-9 w-9 rounded-lg hover:bg-[rgba(176,141,87,0.1)] flex items-center justify-center text-[#CBAF9E]"
        >
          <Bell className="h-[18px] w-[18px]" />
          {numeroAlertas > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-[#C0604A] text-white text-[10px] font-bold flex items-center justify-center">
              {numeroAlertas > 9 ? '9+' : numeroAlertas}
            </span>
          ) : null}
        </button>

        <button
          type="button"
          aria-label="Ayuda"
          className="h-9 w-9 rounded-lg hover:bg-[rgba(176,141,87,0.1)] flex items-center justify-center text-[#CBAF9E]"
        >
          <HelpCircle className="h-[18px] w-[18px]" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuPerfil((v) => !v)}
            className="flex items-center gap-2.5 rounded-lg pl-1.5 pr-2 py-1.5 hover:bg-[rgba(176,141,87,0.1)]"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#C39F68] to-[#8C3654] text-[#3A1420] text-[12px] font-bold flex items-center justify-center">
              {iniciales || 'U'}
            </div>
            <div className="hidden md:block text-left leading-tight">
              <div className="text-[13px] font-semibold text-[#F3E7DC]">{nombreUsuario}</div>
              <div className="text-[10px] text-[#B29886]">{rolUsuario}</div>
            </div>
            <ChevronDown className="hidden md:block h-3.5 w-3.5 text-[#B29886]" />
          </button>

          {menuPerfil ? (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-[rgba(176,141,87,0.25)] bg-[#4C2032] shadow-lg py-1.5 z-50">
              <Link
                href="/profile"
                onClick={() => setMenuPerfil(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-[#D9C6BA] hover:bg-[rgba(176,141,87,0.1)]"
              >
                <UserIcon className="h-4 w-4" /> Mi perfil
              </Link>
              <Link
                href="/settings"
                onClick={() => setMenuPerfil(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-[#D9C6BA] hover:bg-[rgba(176,141,87,0.1)]"
              >
                <Settings className="h-4 w-4" /> Configuración
              </Link>
              <div className="my-1.5 h-px bg-[rgba(176,141,87,0.2)]" />
              <button
                type="button"
                onClick={cerrarSesion}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-[#E0917E] hover:bg-[rgba(192,96,74,0.12)]"
              >
                <LogOut className="h-4 w-4" /> Cerrar sesión
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
