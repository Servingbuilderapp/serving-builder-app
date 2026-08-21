'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { BloqueEstructuracion } from '@/components/estructuracion/BloqueEstructuracion'
import { useTranslation } from '@/hooks/useTranslation'

export function EstructuracionPageClient() {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen bg-color-base-100 text-color-base-content py-12 px-4 relative overflow-hidden">
      {/* Ambient background blur */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-color-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px]" />
      </div>
      <div className="max-w-7xl mx-auto relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-color-base-content/60 hover:text-color-base-content transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('comun.volver_inicio')}
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-color-primary to-teal-500 text-white font-black text-sm">
              A
            </div>
            <span className="font-black tracking-tight text-sm uppercase italic">
              ARQUITECTURA<span className="text-color-primary">DIGITAL</span>
            </span>
          </div>
        </div>
        <BloqueEstructuracion />
      </div>
    </main>
  )
}
