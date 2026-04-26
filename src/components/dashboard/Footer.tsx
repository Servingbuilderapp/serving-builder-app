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
          className="text-color-base-content/ hover:text-color-primary hover:scale-110 transition-all duration-300 p-2 rounded-full bg-color-base-content/ border border-color-base-content/"
          title="LinkedIn"
        >
          <Globe className="h-5 w-5" />
        </a>
        <a 
          href="https://instagram.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-color-base-content/ hover:text-color-primary hover:scale-110 transition-all duration-300 p-2 rounded-full bg-color-base-content/ border border-color-base-content/"
          title="Instagram"
        >
          <Globe className="h-5 w-5" />
        </a>
        <a 
          href="https://servingproyectos.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-color-base-content/ hover:text-color-primary hover:scale-110 transition-all duration-300 p-2 rounded-full bg-color-base-content/ border border-color-base-content/"
          title="Website"
        >
          <Globe className="h-5 w-5" />
        </a>
      </div>
      
      <div className="text-center space-y-1">
        <p className="text-[10px] sm:text-xs font-black text-color-base-content/ tracking-widest uppercase italic">
          © 2026 <span className="text-color-primary">SERVING PROYECTOS ESTRATEGICOS SAS</span>. 
          {language === 'en' ? ' All rights reserved.' : ' Todos los derechos reservados.'}
        </p>
        <p className="text-[10px] text-color-base-content/ uppercase tracking-[0.4em] font-black mt-2">
          Powered by <span className="text-gradient-magma">Advanced Agentic AI</span>
        </p>
      </div>
    </footer>
  )
}
