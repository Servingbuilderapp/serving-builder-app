'use client'

import React from 'react'
import { IdeaGenerator } from '@/components/landing/IdeaGenerator'
import { Sparkles } from 'lucide-react'

export default function IdeasClient({ planSlug }: { planSlug: string }) {
  return (
    <div className="max-w-5xl mx-auto w-full space-y-12 py-12 px-6">
      <div className="text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-color-primary/10 border border-color-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-color-primary">
          <Sparkles className="h-3 w-3" />
          HERRAMIENTA PREMIUM
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-color-base-content tracking-tight uppercase italic">
          Generador de <span className="text-color-primary">Estrategias</span>
        </h1>
        <p className="text-color-base-content/40 max-w-2xl mx-auto font-medium">
          Explora nuevas verticales de negocio y descubre micro-apps rentables para tu industria.
        </p>
      </div>

      <IdeaGenerator userPlan={planSlug} mode="strategies" ideasCount={10} />
      
      <div className="pt-20 border-t border-color-base-content/5">
        <div className="bg-color-base-content/5 rounded-3xl p-8 border border-color-base-content/10 text-center">
          <p className="text-sm text-color-base-content/60 font-medium mb-4">
            <em>Los límites de generación dependen de tu plan actual: $49 (3/mes), $97 (10/mes), Elite/Master (Ilimitado).</em>
          </p>
          <p className="text-sm text-color-base-content/40 font-medium">
            ¿Tienes una idea específica que quieres desarrollar? <br className="hidden md:block" />
            <a href="https://wa.me/573227008727" className="text-color-primary hover:underline font-bold" target="_blank">Contacta con nuestro equipo de ingeniería para un desarrollo a medida.</a>
          </p>
        </div>
      </div>
    </div>
  )
}
