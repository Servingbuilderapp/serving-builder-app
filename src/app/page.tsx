import React from 'react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, Sparkles, Zap, Shield, Globe, LayoutGrid, ChevronRight } from 'lucide-react'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlassCard } from '@/components/ui/GlassCard'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch a few apps to showcase
  const { data: apps } = await supabase
    .from('micro_apps')
    .select('*')
    .limit(6)

  // Fetch plans
  let { data: plans } = await supabase
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  // Fallback si la DB falla o devuelve vacío
  if (!plans || plans.length === 0) {
    plans = [
      { 
        id: '1', slug: 'explorador', name_en: 'Explorer', price_monthly: 0, 
        items_en: [
          '1 Specialized AI Engine', 
          '3 High-Performance Tools', 
          'Standard Generation Speed',
          'Community Support'
        ] 
      },
      { 
        id: '2', slug: 'basic', name_en: 'Entrepreneur', price_monthly: 29, 
        items_en: [
          '4 Pro AI Engines (Image/Video)', 
          '7 Specialized Tools', 
          'No Watermarks on Assets',
          'Fast Generation Queue',
          'Direct Email Support'
        ] 
      },
      { 
        id: '3', slug: 'growth', name_en: 'Growth', price_monthly: 49, 
        items_en: [
          'Niche Specific AI Engines', 
          '10 Advanced Tools', 
          'Custom Domain Integration', 
          'Advanced Analytics Dashboard',
          'SEO Optimization Tools'
        ] 
      },
      { 
        id: '4', slug: 'professional', name_en: 'Unlimited Power', price_monthly: 97, 
        items_en: [
          'Complete Business Engine Access', 
          '30+ Premium Tools', 
          'Full White-Label Capabilities',
          'Multi-user Team Management',
          'Priority VIP Support 24/7'
        ] 
      },
      { 
        id: '5', slug: 'elite', name_en: 'Elite', price_monthly: 197, 
        items_en: [
          'Everything Truly Unlimited', 
          'Private Beta for All New Engines', 
          '1-on-1 Monthly Growth Strategy', 
          'Full White-Label Deployment', 
          'Priority Roadmap Influence'
        ] 
      }
    ] as any;
  }

  return (
    <div className="min-h-screen bg-color-base-100 text-white overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-color-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-color-accent-pink/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-linear-to-tr from-color-primary to-color-accent-pink flex items-center justify-center shadow-lg shadow-color-primary/20">
            <span className="font-black text-white italic">S</span>
          </div>
          <span className="text-lg font-black tracking-tighter uppercase italic">
            SERVING <span className="text-color-primary">BUILDER</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/dashboard">
              <GlowButton className="text-xs h-9 px-6 gap-2">
                <LayoutGrid className="h-3 w-3" />
                Dashboard
              </GlowButton>
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-bold text-white/60 hover:text-white transition-colors">
                Login
              </Link>
              <Link href="/signup">
                <GlowButton className="text-xs h-9 px-6">
                  Get Started
                </GlowButton>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section: The "WOW" Part */}
      <section className="relative z-10 pt-32 pb-40 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10 text-left">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-color-primary animate-in fade-in slide-in-from-left-4 duration-1000">
              <Sparkles className="h-4 w-4 fill-color-primary" />
              Intelligence Reimagined
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] italic uppercase animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Transform <br />
              <span className="text-gradient-magma drop-shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                Ideas into <br />
                Reality
              </span>
            </h1>
            
            <p className="text-xl text-white/50 max-w-xl font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
              Despliega <span className="text-white font-bold">Motores de IA</span> especializados que automatizan tu negocio, escalan tu marca y liberan tu tiempo.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-600">
              <Link href="/signup">
                <GlowButton className="h-16 px-12 text-lg gap-4 font-black italic uppercase tracking-widest">
                  Empieza Gratis
                  <ArrowRight className="h-6 w-6" />
                </GlowButton>
              </Link>
              <Link href="#trial">
                <button className="h-16 px-10 text-xs font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 group">
                  Probar Ahora
                </button>
              </Link>
            </div>
          </div>

          {/* 3D-Style App Preview */}
          <div className="relative group perspective-1000 hidden lg:block">
            <div className="relative z-10 transform-3d group-hover:rotate-x-2 group-hover:rotate-y--6 transition-transform duration-1000">
              <GlassCard className="p-2 border-white/20 shadow-[0_0_80px_rgba(249,115,22,0.15)] rounded-[2.5rem]">
                <div className="rounded-[2rem] overflow-hidden bg-[#111d35] aspect-square flex flex-col">
                  {/* Mock Workspace Header */}
                  <div className="h-14 border-b border-white/5 px-6 flex items-center justify-between">
                    <div className="flex gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500/50" />
                      <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
                      <div className="h-2 w-2 rounded-full bg-green-500/50" />
                    </div>
                    <div className="h-6 w-32 rounded-lg bg-white/5" />
                  </div>
                  {/* Mock Content */}
                  <div className="flex-1 p-8 space-y-6">
                    <div className="space-y-3">
                      <div className="h-4 w-3/4 bg-linear-to-r from-color-primary/40 to-transparent rounded-full" />
                      <div className="h-4 w-1/2 bg-linear-to-r from-color-primary/20 to-transparent rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="aspect-video rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
                      <div className="aspect-video rounded-2xl bg-white/5 border border-white/10 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    </div>
                    <div className="h-32 rounded-2xl bg-white/5 border border-white/10 p-4 relative overflow-hidden">
                      <div className="h-2 w-full bg-color-primary/10 rounded-full mb-2" />
                      <div className="h-2 w-2/3 bg-color-primary/10 rounded-full mb-2" />
                      <div className="h-2 w-1/2 bg-color-primary/10 rounded-full" />
                      <div className="absolute inset-0 bg-linear-to-t from-color-primary/5 to-transparent" />
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

      {/* Free Trial Section */}
      <section id="trial" className="relative z-10 py-32 px-6 bg-white/5 border-y border-white/5">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">
              Pruébalo <span className="text-color-primary">Sin Registro</span>
            </h2>
            <p className="text-white/40 font-medium text-lg">Experimenta el poder de nuestros motores de IA ahora mismo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {apps?.slice(0, 3).map((app) => (
              <GlassCard key={app.id} className="p-8 group hover:border-color-primary/50 transition-all hover:scale-105 duration-500 flex flex-col">
                <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-color-primary group-hover:bg-color-primary/20 transition-all mb-6">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">{app.name_es}</h3>
                <p className="text-sm text-white/40 mb-8 line-clamp-3 leading-relaxed flex-1">
                  {app.description_es}
                </p>
                <Link href={`/login?redirect=/apps/${app.slug}`} className="w-full">
                  <GlowButton variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest py-6">
                    Probar Motor
                  </GlowButton>
                </Link>
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
              Arsenal de <span className="text-color-primary">Motores</span>
            </h2>
            <p className="text-white/40 font-medium text-xl">Más de 47 motores especializados listos para trabajar por ti.</p>
          </div>
          <Link href="/apps" className="text-xs font-black uppercase tracking-[0.3em] text-color-primary flex items-center gap-3 group px-6 py-3 rounded-xl bg-color-primary/5 border border-color-primary/20 hover:bg-color-primary/10 transition-all">
            VER TODO EL ARSENAL
            <ChevronRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {apps?.map((app) => (
            <GlassCard key={app.id} className="p-10 group hover:border-color-primary/50 transition-all hover:-translate-y-2 duration-500">
              <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-color-primary group-hover:bg-color-primary/10 transition-all mb-8">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tight">{app.name_es}</h3>
              <p className="text-sm text-white/40 line-clamp-2 leading-relaxed">
                {app.description_es}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-40 px-6 max-w-[95rem] mx-auto">
        <div className="text-center space-y-6 mb-24">
          <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">
            Planes de <span className="text-gradient-magma">Potencia</span>
          </h2>
          <p className="text-white/40 font-medium text-xl max-w-2xl mx-auto leading-relaxed">
            Escala tu automatización con el nivel que mejor se adapte a tu visión.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {plans?.map((plan) => (
            <GlassCard key={plan.id} className={cn(
              "p-10 flex flex-col relative overflow-hidden transition-all duration-500 hover:scale-105",
              plan.slug === 'professional' && "border-color-accent-pink/50 ring-1 ring-color-accent-pink/20 shadow-[0_0_50px_rgba(236,72,153,0.1)]",
              plan.slug === 'elite' && "border-color-primary/50 ring-2 ring-color-primary/30 shadow-[0_0_60px_rgba(249,115,22,0.1)]"
            )}>
              {(plan.slug === 'professional' || plan.slug === 'elite') && (
                <div className="absolute top-0 right-0 bg-linear-to-r from-color-primary to-color-accent-pink text-white text-[10px] font-black uppercase px-5 py-2 rounded-bl-2xl tracking-[0.2em] z-10 shadow-2xl">
                  {plan.slug === 'elite' ? 'PREMIUM' : 'POPULAR'}
                </div>
              )}
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">{plan.name_en}</h3>
              <p className="text-[11px] text-white/30 mb-8 leading-relaxed font-bold uppercase tracking-widest min-h-[3rem]">
                {plan.description_en || (plan.slug === 'elite' ? 'Ultimate power for AI innovators.' : 'Professional tools for business growth.')}
              </p>
              
              <div className="flex items-baseline gap-2 mb-10">
                <span className="text-5xl font-black text-white">${plan.price_monthly}</span>
                <span className="text-xs text-white/30 font-black uppercase tracking-widest">/ Mes</span>
              </div>
              
              <div className="space-y-5 mb-12 flex-1">
                {plan.items_en?.map((feature: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 group/item">
                    <div className="mt-1 h-5 w-5 rounded-lg bg-color-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-color-primary" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/50 group-hover/item:text-white transition-colors">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Link href={`/signup?plan=${plan.slug}`}>
                <GlowButton 
                  variant={(plan.slug === 'professional' || plan.slug === 'elite') ? 'primary' : 'ghost'} 
                  className="w-full text-[11px] font-black uppercase h-14 tracking-[0.2em]"
                >
                  SELECCIONAR PLAN
                </GlowButton>
              </Link>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-24 px-8 border-t border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-linear-to-tr from-color-primary to-color-accent-pink flex items-center justify-center">
                <span className="text-[10px] font-black text-white italic">S</span>
              </div>
              <span className="text-base font-black tracking-tighter uppercase italic">
                SERVING <span className="text-color-primary">BUILDER</span>
              </span>
            </div>
            <p className="text-white/20 text-xs font-bold uppercase tracking-[0.3em] leading-relaxed">
              © 2026 SERVING BUILDER APP. <br />
              DEFINIENDO EL FUTURO DE LA AUTOMATIZACIÓN.
            </p>
          </div>
          <div className="flex justify-md-end gap-10">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Platform</h4>
              <nav className="flex flex-col gap-2">
                <Link href="/apps" className="text-[10px] font-bold text-white/30 hover:text-white transition-colors uppercase">Arsenal</Link>
                <Link href="#pricing" className="text-[10px] font-bold text-white/30 hover:text-white transition-colors uppercase">Precios</Link>
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Legal</h4>
              <nav className="flex flex-col gap-2">
                <Link href="#" className="text-[10px] font-bold text-white/30 hover:text-white transition-colors uppercase">Privacidad</Link>
                <Link href="#" className="text-[10px] font-bold text-white/30 hover:text-white transition-colors uppercase">Términos</Link>
              </nav>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
