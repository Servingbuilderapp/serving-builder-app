'use client'

import React from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { Globe } from 'lucide-react'

export function Footer() {
  const { language } = useTranslation()
  
  return (
    <footer className="w-full pt-16 pb-8 flex flex-col items-center justify-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-center space-x-6">
        <a 
          href="https://linkedin.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white/20 hover:text-color-primary transition-colors duration-300"
          title="LinkedIn"
        >
          <Globe className="h-4 w-4" />
        </a>
        <a 
          href="https://instagram.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white/20 hover:text-color-primary transition-colors duration-300"
          title="Instagram"
        >
          <Globe className="h-4 w-4" />
        </a>
        <a 
          href="https://servingproyectos.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white/20 hover:text-color-primary transition-colors duration-300"
          title="Website"
        >
          <Globe className="h-4 w-4" />
        </a>
      </div>
      
      <div className="text-center space-y-1">
        <p className="text-[10px] sm:text-xs font-medium text-white/30 tracking-wider">
          © 2026 <span className="text-white/40">SERVING PROYECTOS ESTRATEGICOS SAS</span>. 
          {language === 'en' ? ' All rights reserved.' : ' Todos los derechos reservados.'}
        </p>
        <p className="text-[9px] text-white/10 uppercase tracking-[0.2em] font-bold">
          Powered by Advanced Agentic AI
        </p>
      </div>
    </footer>
  )
}
