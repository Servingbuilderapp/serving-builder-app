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
  pendiente_pago: { texto: 'Pendiente de pago', clases: 'bg-amber-50 text-amber-700 border-amber-200' },
  pagado: { texto: 'Listo para iniciar', clases: 'bg-blue-50 text-blue-700 border-blue-200' },
  estructurando_ia: { texto: 'En estructuración', clases: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  estructurado: { texto: 'Estructurado', clases: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  en_encaje: { texto: 'En encaje', clases: 'bg-violet-50 text-violet-700 border-violet-200' },
  postulado: { texto: 'Postulado', clases: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
}

export function etiquetaEstado(estado?: string | null) {
  if (!estado) return { texto: 'Sin iniciar', clases: 'bg-slate-100 text-slate-600 border-slate-200' }
  return (
    ETIQUETAS_ESTADO[estado] || {
      texto: estado.replace(/_/g, ' '),
      clases: 'bg-slate-100 text-slate-600 border-slate-200',
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
    <header className="h-[68px] shrink-0 bg-white border-b border-[#E8EDF5] flex items-center gap-4 px-4 lg:px-6">
      <button
        type="button"
        onClick={onAbrirMenu}
        aria-label="Abrir menú"
        className="lg:hidden h-9 w-9 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#0B2A4A] shrink-0"
      >
        <Menu className="h-4 w-4" />
      </button>

      <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#1D4ED8] to-[#0C2E5C] flex items-center justify-center">
          <span className="text-[15px] font-black text-white leading-none">A</span>
        </div>
        <div className="hidden sm:block leading-tight">
          <div className="text-[13px] font-extrabold tracking-tight text-[#0B2A4A]">
            ARQUITECTURA DIGITAL
          </div>
          <div className="text-[10px] text-[#5B6B84]">De la idea a la postulación</div>
        </div>
      </Link>

      {/* Proyecto activo */}
      <div className="flex-1 flex justify-center min-w-0">
        {proyecto ? (
          <div className="w-full max-w-[520px] rounded-xl border border-[#E2E8F0] bg-[#F8FAFD] px-4 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              Proyecto activo
            </div>
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-[14px] font-bold text-[#0B2A4A] truncate">{proyecto.nombre}</span>
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
          className="relative h-9 w-9 rounded-lg hover:bg-[#F1F5F9] flex items-center justify-center text-[#475569]"
        >
          <Bell className="h-[18px] w-[18px]" />
          {numeroAlertas > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
              {numeroAlertas > 9 ? '9+' : numeroAlertas}
            </span>
          ) : null}
        </button>

        <button
          type="button"
          aria-label="Ayuda"
          className="h-9 w-9 rounded-lg hover:bg-[#F1F5F9] flex items-center justify-center text-[#475569]"
        >
          <HelpCircle className="h-[18px] w-[18px]" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuPerfil((v) => !v)}
            className="flex items-center gap-2.5 rounded-lg pl-1.5 pr-2 py-1.5 hover:bg-[#F1F5F9]"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#1D4ED8] to-[#7C3AED] text-white text-[12px] font-bold flex items-center justify-center">
              {iniciales || 'U'}
            </div>
            <div className="hidden md:block text-left leading-tight">
              <div className="text-[13px] font-semibold text-[#0B2A4A]">{nombreUsuario}</div>
              <div className="text-[10px] text-[#94A3B8]">{rolUsuario}</div>
            </div>
            <ChevronDown className="hidden md:block h-3.5 w-3.5 text-[#94A3B8]" />
          </button>

          {menuPerfil ? (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-[#E2E8F0] bg-white shadow-lg py-1.5 z-50">
              <Link
                href="/profile"
                onClick={() => setMenuPerfil(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-[#334155] hover:bg-[#F1F5F9]"
              >
                <UserIcon className="h-4 w-4" /> Mi perfil
              </Link>
              <Link
                href="/settings"
                onClick={() => setMenuPerfil(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-[#334155] hover:bg-[#F1F5F9]"
              >
                <Settings className="h-4 w-4" /> Configuración
              </Link>
              <div className="my-1.5 h-px bg-[#E2E8F0]" />
              <button
                type="button"
                onClick={cerrarSesion}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-[#B91C1C] hover:bg-rose-50"
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
