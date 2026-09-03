'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

/**
 * Rutas del panel donde NO va la burbuja: adentro el cliente ya tiene su propio
 * botón para hablar con el estructurador, y la burbuja verde se le montaba
 * encima. La burbuja se queda en el website público, que es donde sirve.
 */
const RUTAS_DEL_PANEL = [
  '/dashboard',
  '/mi-proyecto',
  '/pendientes',
  '/mis-convocatorias',
  '/ideas',
  '/admin',
  '/apps',
  '/plans',
  '/profile',
  '/settings',
]

export function WhatsAppButton() {
  const { language } = useTranslation()
  const ruta = usePathname() || ''

  if (RUTAS_DEL_PANEL.some((r) => ruta === r || ruta.startsWith(`${r}/`))) return null

  const phoneNumber = '573227008727'
  const message = language === 'en' 
    ? 'Hello, I need support with Arquitectura Digital de Proyectos' 
    : 'Hola, necesito soporte con Arquitectura Digital de Proyectos'
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 hover:scale-110 hover:shadow-[#25D366]/50 transition-all duration-300 group animate-in fade-in zoom-in slide-in-from-bottom-10"
      title={language === 'en' ? 'Contact Support' : 'Contactar Soporte'}
    >
      <div className="absolute -top-12 right-0 bg-white text-black text-[10px] font-black px-3 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest border border-black/5">
        {language === 'en' ? 'Support' : 'Soporte'}
        <div className="absolute -bottom-1 right-5 w-2 h-2 bg-white rotate-45" />
      </div>
      <MessageCircle className="h-7 w-7 fill-white" />
      
      {/* Pulse effect */}
      <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 pointer-events-none" />
    </a>
  )
}
