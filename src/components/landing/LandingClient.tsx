'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, Zap, Shield, Globe, LayoutGrid, ChevronRight } from 'lucide-react'
import { PricingTable } from '@/components/plans/PricingTable'
import { EnvProjectGenerator } from '@/components/landing/EnvProjectGenerator'
import { IdeaGenerator } from '@/components/landing/IdeaGenerator'
import { PublicMicroAppRunner } from '@/components/landing/PublicMicroAppRunner'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlassCard } from '@/components/ui/GlassCard'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils'

interface LandingClientProps {
  user: any
  trialApps: any[]
  arsenalCategories: Record<string, any[]>
  syncPlans: any[]
}

export function LandingClient({ user, trialApps, arsenalCategories, syncPlans }: LandingClientProps) {
  const { language } = useTranslation()
  const [selectedTrialApp, setSelectedTrialApp] = React.useState<any>(null)

  return (
    <div className="min-h-screen bg-color-base-100 text-color-base-content overflow-hidden">
      {selectedTrialApp && (
        <PublicMicroAppRunner 
          app={selectedTrialApp} 
          onClose={() => setSelectedTrialApp(null)} 
        />
      )}
      {/* Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-color-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-color-accent-pink/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/60 border-b border-color-base-content/5">
        <div className="flex items-center justify-between px-8 h-20 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 overflow-hidden">
              <img src="/logo.png" alt="ECO SERVING Logo" className="h-full w-full object-contain" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic group-hover:tracking-normal transition-all duration-500 text-color-base-content">
              ECO<span className="text-color-primary">SERVING</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#trial" className="hidden md:block text-[10px] font-black uppercase tracking-[0.3em] text-color-base-content/60 hover:text-color-base-content transition-colors">
              {language === 'en' ? 'Arsenal' : 'Arsenal'}
            </Link>
            <Link href="#pricing" className="hidden md:block text-[10px] font-black uppercase tracking-[0.3em] text-color-base-content/60 hover:text-color-base-content transition-colors">
              {language === 'en' ? 'Plans' : 'Planes'}
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

      {/* Hero Section: The "WOW" Part */}
      <section className="relative z-10 pt-48 pb-40 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10 text-left">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-color-base-content/5 border border-color-base-content/10 text-[10px] font-black uppercase tracking-[0.3em] text-color-primary animate-in fade-in slide-in-from-left-4 duration-1000">
              <Sparkles className="h-4 w-4 fill-color-primary" />
              {language === 'en' ? 'Intelligence Reimagined' : 'Inteligencia Reimaginada'}
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] italic uppercase animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              {language === 'en' ? (
                <>
                  Transform <br />
                  <span className="text-gradient-magma drop-shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                    Ideas into <br />
                    Impact
                  </span>
                </>
              ) : (
                <>
                  Transforma <br />
                  <span className="text-gradient-magma drop-shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                    Ideas en <br />
                    Impacto
                  </span>
                </>
              )}
            </h1>
            
            <p className="text-xl text-color-base-content/70 max-w-xl font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
              {language === 'en' ? (
                <>Deploy specialized <span className="text-color-base-content font-black">AI Engines</span> that boost sustainability, calculate environmental impact, and scale green projects.</>
              ) : (
                <>Despliega <span className="text-color-base-content font-black">Motores de IA</span> especializados que impulsan la sostenibilidad, calculan el impacto ambiental y escalan proyectos verdes.</>
              )}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-600">
              <a href={user ? "/dashboard" : "/signup"} className="contents">
                <GlowButton 
                  className="h-16 px-12 text-lg gap-4 font-black italic uppercase tracking-widest"
                >
                  {user 
                    ? (language === 'en' ? "Go to Dashboard" : "Ir al Dashboard") 
                    : (language === 'en' ? "Start for Free" : "Empieza Gratis")}
                  <ArrowRight className="h-6 w-6" />
                </GlowButton>
              </a>
              <a href="#trial">
                <button className="h-16 px-10 text-xs font-black uppercase tracking-[0.2em] text-color-base-content/60 hover:text-color-base-content transition-all rounded-2xl bg-color-base-content/5 border border-color-base-content/10 hover:bg-color-base-content/10 hover:border-color-base-content/20 group">
                  {language === 'en' ? 'Try Now' : 'Probar Ahora'}
                </button>
              </a>
            </div>
          </div>

          {/* 3D-Style App Preview */}
          <div className="relative group perspective-1000 hidden lg:block">
            <div className="relative z-10 transform-3d group-hover:rotate-x-2 group-hover:rotate-y--6 transition-transform duration-1000">
              <GlassCard className="p-2 border-color-base-content/10 shadow-[0_0_80px_rgba(249,115,22,0.15)] rounded-[2.5rem]">
                <div className="rounded-[2rem] overflow-hidden bg-color-base-200 aspect-square flex flex-col">
                  {/* Mock Workspace Header */}
                  <div className="h-14 border-b border-color-base-content/5 px-6 flex items-center justify-between">
                    <div className="flex gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500/50" />
                      <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
                      <div className="h-2 w-2 rounded-full bg-green-500/50" />
                    </div>
                    <div className="h-6 w-32 rounded-lg bg-color-base-content/5" />
                  </div>
                  {/* Mock Content */}
                  <div className="flex-1 p-8 space-y-6 flex flex-col">
                    <div className="space-y-2">
                      <h4 className="font-black text-xl text-color-base-content uppercase tracking-tighter italic">ECO-STRATEGY</h4>
                      <p className="text-sm text-color-base-content/60 font-medium">Generando plan de impacto ambiental...</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Metric 1 */}
                      <div className="aspect-video rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 flex flex-col justify-between group-hover:bg-emerald-500/20 transition-colors">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Huella Carbono</span>
                          <Globe className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div>
                          <span className="text-2xl font-black text-emerald-700">-45%</span>
                          <p className="text-[10px] text-emerald-600/70 font-bold uppercase mt-1">Estimado vs Meta</p>
                        </div>
                      </div>
                      
                      {/* Metric 2 */}
                      <div className="aspect-video rounded-2xl bg-teal-500/10 border border-teal-500/20 p-4 flex flex-col justify-between group-hover:bg-teal-500/20 transition-colors">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-black uppercase tracking-widest text-teal-600">Eficiencia</span>
                          <Zap className="h-4 w-4 text-teal-500" />
                        </div>
                        <div>
                          <span className="text-2xl font-black text-teal-700">92/100</span>
                          <p className="text-[10px] text-teal-600/70 font-bold uppercase mt-1">Score Verde</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bottom Panel */}
                    <div className="flex-1 rounded-2xl bg-color-base-content/5 border border-color-base-content/10 p-5 flex flex-col relative overflow-hidden group-hover:border-emerald-500/30 transition-colors">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-color-base-content/60">Análisis IA en curso</span>
                      </div>
                      
                      <div className="space-y-3 flex-1">
                        <div className="h-8 w-full bg-white/50 rounded-lg flex items-center px-3 border border-color-base-content/5">
                           <span className="text-xs font-bold text-color-base-content/70">✔ Optimización de recursos hídricos</span>
                        </div>
                        <div className="h-8 w-4/5 bg-white/50 rounded-lg flex items-center px-3 border border-color-base-content/5">
                           <span className="text-xs font-bold text-color-base-content/70">✔ Implementación de energías limpias</span>
                        </div>
                      </div>
                      
                      {/* Gradient overlay to simulate loading/scanning */}
                      <div className="absolute inset-0 bg-linear-to-b from-transparent via-emerald-500/5 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
            {/* Floating Badges */}
            <div className="absolute -top-10 -right-10 z-20 animate-bounce" style={{ animationDuration: '4s' }}>
              <GlassCard className="px-6 py-4 border-color-primary/40 bg-color-primary/10 backdrop-blur-2xl">
                <Zap className="h-6 w-6 text-color-primary" />
              </GlassCard>
            </div>
            <div className="absolute -bottom-10 -left-10 z-20 animate-bounce" style={{ animationDuration: '6s' }}>
              <GlassCard className="px-6 py-4 border-color-accent-pink/40 bg-color-accent-pink/10 backdrop-blur-2xl">
                <Sparkles className="h-6 w-6 text-color-accent-pink" />
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-6 group p-8 rounded-[2.5rem] hover:bg-color-base-content/5 transition-all duration-500">
            <div className="h-16 w-16 rounded-2xl bg-color-primary/10 flex items-center justify-center text-color-primary group-hover:scale-110 transition-transform">
              <Zap className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">
              {language === 'en' ? 'Instant Impact Analysis' : 'Análisis de Impacto Inmediato'}
            </h3>
            <p className="text-color-base-content/60 leading-relaxed font-medium">
              {language === 'en' 
                ? 'Get precise environmental calculations and strategies in milliseconds with our specialized AI.' 
                : 'Obtén cálculos y estrategias ambientales precisas en milisegundos con nuestra IA especializada.'}
            </p>
          </div>
          <div className="space-y-6 group p-8 rounded-[2.5rem] hover:bg-color-base-content/5 transition-all duration-500">
            <div className="h-16 w-16 rounded-2xl bg-color-accent-pink/10 flex items-center justify-center text-color-accent-pink group-hover:scale-110 transition-transform">
              <Shield className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">
              {language === 'en' ? 'Normative Security' : 'Seguridad Normativa'}
            </h3>
            <p className="text-color-base-content/60 leading-relaxed font-medium">
              {language === 'en' 
                ? 'Your company data is protected and aligned with global environmental standards.' 
                : 'Los datos de tu empresa están protegidos y alineados con estándares ambientales globales.'}
            </p>
          </div>
          <div className="space-y-6 group p-8 rounded-[2.5rem] hover:bg-color-base-content/5 transition-all duration-500">
            <div className="h-16 w-16 rounded-2xl bg-color-accent-blue/10 flex items-center justify-center text-color-accent-blue group-hover:scale-110 transition-transform">
              <Globe className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">
              {language === 'en' ? 'Global Execution' : 'Ejecución Global'}
            </h3>
            <p className="text-color-base-content/60 leading-relaxed font-medium">
              {language === 'en' 
                ? 'Export your projects into actionable plans for government, corporate, or community levels.' 
                : 'Exporta tus proyectos en planes accionables para niveles gubernamentales, corporativos o comunitarios.'}
            </p>
          </div>
        </div>
      </section>

      {/* Free Trial Section */}
      <section id="trial" className="relative z-10 py-32 px-6 bg-color-base-content/5 border-y border-color-base-content/5">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">
              {language === 'en' ? 'Try it ' : 'Pruébalo '}
              <span className="text-color-primary">
                {language === 'en' ? 'No Signup Required' : 'Sin Registro'}
              </span>
            </h2>
            <p className="text-color-base-content/60 font-medium text-lg">
              {language === 'en' ? 'Experience the power of our green AI engines right now.' : 'Experimenta el poder de nuestros motores de IA verdes ahora mismo.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trialApps.map((app: any) => (
              <GlassCard key={app.id} className="p-8 group hover:border-color-primary/50 transition-all hover:scale-105 duration-500 flex flex-col">
                <div className="h-16 w-16 rounded-2xl bg-color-base-content/5 border border-color-base-content/10 flex items-center justify-center text-color-primary group-hover:bg-color-primary/20 transition-all mb-6">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black text-color-base-content uppercase italic tracking-tighter mb-4">
                  {language === 'en' ? app.name_en || app.name_es : app.name_es}
                </h3>
                <p className="text-sm text-color-base-content/60 mb-8 line-clamp-6 leading-relaxed flex-1">
                  {language === 'en' ? app.description_en || app.description_es : app.description_es}
                </p>
                <button onClick={() => setSelectedTrialApp(app)} className="w-full">
                  <GlowButton variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest py-6">
                    {language === 'en' ? 'Test Engine' : 'Probar Motor'}
                  </GlowButton>
                </button>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* App Grid Preview */}
      <section className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
              {language === 'en' ? 'Engine ' : 'Arsenal de '}
              <span className="text-color-primary">
                {language === 'en' ? 'Arsenal' : 'Motores'}
              </span>
            </h2>
            <p className="text-color-base-content/60 font-medium text-xl">
              {language === 'en' ? 'More than 100 specialized environmental engines ready to work for you.' : 'Más de 100 motores ambientales especializados listos para trabajar por ti.'}
            </p>
          </div>
          <Link href="/apps" className="text-xs font-black uppercase tracking-[0.3em] text-color-primary flex items-center gap-3 group px-6 py-3 rounded-xl bg-color-primary/5 border border-color-primary/20 hover:bg-color-primary/10 transition-all">
            {language === 'en' ? 'VIEW FULL ARSENAL' : 'VER TODO EL ARSENAL'}
            <ChevronRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        <div className="space-y-16">
          {Object.entries(arsenalCategories).map(([category, categoryApps]) => (
            <div key={category} className="space-y-8">
              <div className="flex items-center gap-6">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-color-primary">
                  {category}
                </h3>
                <div className="h-px flex-1 bg-linear-to-r from-color-primary/20 to-transparent" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {categoryApps.map((app: any) => (
                  <GlassCard key={app.id} className="p-10 group hover:border-color-primary/50 transition-all hover:-translate-y-2 duration-500">
                    <div className="h-14 w-14 rounded-2xl bg-color-base-content/5 border border-color-base-content/10 flex items-center justify-center text-color-base-content/40 group-hover:text-color-primary group-hover:bg-color-primary/10 transition-all mb-8">
                      <Sparkles className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold text-color-base-content mb-3 uppercase tracking-tight">
                      {language === 'en' ? app.name_en || app.name_es : app.name_es}
                    </h3>
                    <p className="text-sm text-color-base-content/60 line-clamp-4 leading-relaxed">
                      {language === 'en' ? app.description_en || app.description_es : app.description_es}
                    </p>
                    <a href={`/login?redirect=/apps/${app.slug}`} className="mt-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-color-primary/60 hover:text-color-primary transition-colors">
                      {language === 'en' ? 'Test Engine' : 'Probar Motor'} <ArrowRight className="h-3 w-3" />
                    </a>
                  </GlassCard>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Idea Generator & Project Generator Section */}
      <section className="relative z-10 py-32 px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-color-primary/5 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="max-w-[95rem] mx-auto space-y-16">
          <div className="flex flex-col items-center text-center space-y-8 mb-10">
            <p className="text-color-base-content/70 font-medium text-lg max-w-4xl leading-relaxed">
              {language === 'en' 
                ? <>You've just seen our core apps. <br className="hidden md:block" /> <span className="text-color-base-content font-black">Would you like to receive custom environmental projects or ideas — generated by AI in 30 seconds?</span></>
                : <>Acabas de ver nuestras apps base. <br className="hidden md:block" /> <span className="text-color-base-content font-black">¿Te gustaría recibir proyectos o ideas ambientales personalizadas — generadas por IA en 30 seconds?</span></>
              }
            </p>
            
            <p className="text-color-base-content/60 font-medium text-sm max-w-3xl">
              {language === 'en'
                ? <>Access <span className="text-color-primary font-black">1 free test</span> of our Generators. Discover your next big initiative tailored to your specific sector.</>
                : <>Accede a <span className="text-color-primary font-black">1 prueba gratuita</span> de nuestros Generadores. Descubre tu próxima gran iniciativa adaptada a tu sector específico.</>
              }
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
            <IdeaGenerator userPlan={user?.email?.toLowerCase() === 'servingbuilderapp@gmail.com' ? 'master' : (user?.user_metadata?.plan_slug || 'free')} />
            <EnvProjectGenerator userPlan={user?.email?.toLowerCase() === 'servingbuilderapp@gmail.com' ? 'master' : (user?.user_metadata?.plan_slug || 'free')} />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-40 px-6 max-w-[95rem] mx-auto">
        <div className="text-center space-y-6 mb-24">
          <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">
            {language === 'en' ? 'Power ' : 'Planes de '}
            <span className="text-gradient-magma">
              {language === 'en' ? 'Plans' : 'Potencia'}
            </span>
          </h2>
          <p className="text-color-base-content/60 font-medium text-xl max-w-2xl mx-auto leading-relaxed">
            {language === 'en' 
              ? 'Scale your automation with the tier that best fits your vision.' 
              : 'Escala tu automatización con el nivel que mejor se adapte a tu visión.'}
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
              <div className="h-10 w-10 rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="ECO SERVING Logo" className="h-full w-full object-contain" />
              </div>
              <span className="text-base font-black tracking-tighter uppercase italic text-color-base-content">
                ECO<span className="text-color-primary">SERVING</span>
              </span>
            </div>
            <p className="text-color-base-content/40 text-xs font-bold uppercase tracking-[0.3em] leading-relaxed">
              © 2026 ECOSERVING SUITE. <br />
              {language === 'en' ? 'DEFINING THE FUTURE OF ENVIRONMENTAL IMPACT.' : 'DEFINIENDO EL FUTURO DEL IMPACTO AMBIENTAL.'}
            </p>
          </div>
          <div className="flex justify-md-end gap-10">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-color-base-content">
                {language === 'en' ? 'Platform' : 'Plataforma'}
              </h4>
              <nav className="flex flex-col gap-2">
                <Link href="/apps" className="text-[10px] font-bold text-color-base-content/60 hover:text-color-base-content transition-colors uppercase">Arsenal</Link>
                <Link href="#pricing" className="text-[10px] font-bold text-color-base-content/60 hover:text-color-base-content transition-colors uppercase">
                  {language === 'en' ? 'Pricing' : 'Precios'}
                </Link>
              </nav>
            </div>
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
