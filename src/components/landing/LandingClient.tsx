'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, LayoutGrid } from 'lucide-react'
import { PricingTable } from '@/components/plans/PricingTable'
import { DiagnosticoGratuito } from '@/components/landing/DiagnosticoGratuito'
import { GlowButton } from '@/components/ui/GlowButton'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils'

interface LandingClientProps {
  user: any
  trialApps: any[]
  arsenalCategories: Record<string, any[]>
  syncPlans: any[]
  isEcoServing?: boolean
}

export function LandingClient({ user, syncPlans }: LandingClientProps) {
  const { language } = useTranslation()

  return (
    <div className="min-h-screen bg-color-base-100 text-color-base-content overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-color-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/70 border-b border-color-base-content/5 shadow-xs">
        <div className="flex items-center justify-between px-8 h-20 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-color-primary to-teal-500 shadow-lg shadow-color-primary/20 group-hover:scale-110 transition-transform duration-500">
              <span className="text-xl font-black text-white">A</span>
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic group-hover:tracking-normal transition-all duration-500 text-color-base-content">
              ARQUITECTURA<span className="text-color-primary">DIGITAL</span>
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="#diagnostico" className="hidden md:block text-[10px] font-black uppercase tracking-[0.3em] text-color-primary hover:text-emerald-700 transition-colors">
              Diagnóstico Gratuito
            </Link>
            <Link href="#pricing" className="hidden md:block text-[10px] font-black uppercase tracking-[0.3em] text-color-base-content/60 hover:text-color-base-content transition-colors">
              Planes de Estructuración
            </Link>
            {user ? (
              <Link href="/dashboard">
                <GlowButton className="text-[10px] h-10 px-8 gap-2 font-black tracking-widest">
                  <LayoutGrid className="h-4 w-4" />
                  DASHBOARD
                </GlowButton>
              </Link>
            ) : (
              <>
              <a href="/login" className="text-[10px] font-black uppercase tracking-[0.3em] text-color-base-content/60 hover:text-color-base-content transition-colors">
                {language === 'en' ? 'Login' : 'Iniciar Sesión'}
              </a>
              <a href="/signup" className="contents">
                <GlowButton className="text-[10px] h-10 px-8 font-black tracking-widest">
                  {language === 'en' ? 'GET STARTED' : 'EMPEZAR AHORA'}
                </GlowButton>
              </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section: Arquitectura Digital */}
      <section className="relative z-10 pt-36 pb-20 px-6 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-color-primary/10 border border-color-primary/20 text-[10px] font-black uppercase tracking-[0.3em] text-color-primary animate-in fade-in slide-in-from-left-4 duration-1000">
            <Sparkles className="h-4 w-4 fill-color-primary" />
            Estructuración Inteligente de Proyectos
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] italic uppercase animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Arquitectura <br />
            <span className="text-gradient-magma drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              Digital & Fondos
            </span>
          </h1>

          <p className="text-lg md:text-xl text-color-base-content/80 max-w-xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
            Estructuramos, formalizamos y postulamos tu <span className="text-color-base-content font-black">Emprendimiento, Proyecto Social o Sostenible</span> ante <strong className="text-color-primary">Fondo Emprender, APC Colombia, BID Lab, DRK Foundation</strong> y fuentes internacionales de financiamiento.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-600">
            <a href="#diagnostico" className="contents">
              <GlowButton
                className="h-14 px-10 text-xs gap-3 font-black italic uppercase tracking-widest bg-gradient-to-r from-color-primary to-teal-500"
              >
                REALIZAR DIAGNÓSTICO GRATUITO
                <ArrowRight className="h-5 w-5" />
              </GlowButton>
            </a>
            <a href="#pricing">
              <button className="h-14 px-8 text-xs font-black uppercase tracking-[0.2em] text-color-base-content/70 hover:text-color-base-content transition-all rounded-2xl bg-white/60 border border-color-base-300 hover:bg-white group">
                Ver Planes de Acompañamiento
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Bloque 1: Diagnóstico Gratuito */}
      <DiagnosticoGratuito />

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-40 px-6 max-w-[95rem] mx-auto">
        <div className="text-center space-y-6 mb-24">
          <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">
            {language === 'en' ? 'Structuring ' : 'Planes de '}
            <span className="text-gradient-magma">
              {language === 'en' ? 'Plans' : 'Estructuración'}
            </span>
          </h2>
          <p className="text-color-base-content/60 font-medium text-xl max-w-2xl mx-auto leading-relaxed">
            {language === 'en'
              ? 'Turn your project into a fundable, ready-to-submit proposal.'
              : 'Convierte tu proyecto en una propuesta lista y financiable.'}
          </p>
        </div>

        <PricingTable
          plans={syncPlans}
          currentPlanId={null}
        />
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-24 px-8 border-t border-color-base-content/5 bg-white/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-linear-to-br from-color-primary to-color-accent-pink shadow-lg shadow-color-primary/20">
                <span className="text-xl font-bold text-white">S</span>
              </div>
              <span className="text-base font-black tracking-tighter uppercase italic text-color-base-content">
                SERVING<span className="text-color-primary">HOLDING</span>
              </span>
            </div>
            <p className="text-color-base-content/40 text-xs font-bold uppercase tracking-[0.3em] leading-relaxed">
              © 2026 SERVING HOLDING. <br />
              {language === 'en' ? `DEFINING THE FUTURE OF DIGITAL BUSINESS.` : `DEFINIENDO EL FUTURO DEL NEGOCIO DIGITAL.`}
            </p>
          </div>
          <div className="flex justify-md-end gap-10">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-color-base-content">
                {language === 'en' ? 'Contact & Legal' : 'Contacto y Legal'}
              </h4>
              <nav className="flex flex-col gap-2">
                <a href="mailto:servingbuilderapp@gmail.com" className="text-[10px] font-bold text-color-base-content/60 hover:text-color-base-content transition-colors uppercase">
                  {language === 'en' ? 'Support' : 'Soporte'}
                </a>
                <Link href="/privacy" className="text-[10px] font-bold text-color-base-content/60 hover:text-color-base-content transition-colors uppercase">
                  {language === 'en' ? 'Privacy Policy' : 'Políticas de Privacidad'}
                </Link>
                <Link href="/terms" className="text-[10px] font-bold text-color-base-content/60 hover:text-color-base-content transition-colors uppercase">
                  {language === 'en' ? 'Terms of Service' : 'Términos de Servicio'}
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
