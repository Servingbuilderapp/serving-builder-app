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
  const { data: plans } = await supabase
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

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

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6 max-w-5xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-color-primary mb-4 animate-bounce">
          <Sparkles className="h-3 w-3" />
          The Future of AI Apps is Here
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] italic uppercase">
          Build & Serve <br />
          <span className="text-gradient-magma">
            AI Magic
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto font-medium leading-relaxed">
          Access a suite of 47+ specialized AI applications designed to supercharge your creativity, productivity, and business results.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {user ? (
            <Link href="/dashboard">
              <GlowButton className="h-14 px-10 text-base gap-3">
                Go to My Dashboard
                <LayoutGrid className="h-5 w-5" />
              </GlowButton>
            </Link>
          ) : (
            <Link href="/signup">
              <GlowButton className="h-14 px-10 text-base gap-3">
                Start Building Now
                <ArrowRight className="h-5 w-5" />
              </GlowButton>
            </Link>
          )}
          <Link href="#pricing">
            <button className="h-14 px-10 text-base font-bold text-white/60 hover:text-white transition-all rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10">
              View Pricing
            </button>
          </Link>
        </div>
      </section>

      {/* App Grid Preview */}
      <section className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">
              Explore Our <span className="text-color-primary">Toolbox</span>
            </h2>
            <p className="text-white/40 font-medium">Over 47 specialized tools at your fingertips.</p>
          </div>
          <Link href="/apps" className="text-xs font-black uppercase tracking-widest text-color-primary flex items-center gap-2 group">
            See all apps
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps?.map((app) => (
            <GlassCard key={app.id} className="p-6 group hover:border-color-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-color-primary group-hover:bg-color-primary/10 transition-colors mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{app.name_en}</h3>
              <p className="text-sm text-white/40 line-clamp-2 leading-relaxed">
                {app.description_en}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-20 px-6 bg-white/5 border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-lg bg-color-primary/20 flex items-center justify-center text-color-primary">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Lightning Fast</h3>
            <p className="text-sm text-white/40 leading-relaxed">Get your results in milliseconds with our optimized AI infrastructure.</p>
          </div>
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-lg bg-color-accent-pink/20 flex items-center justify-center text-color-accent-pink">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Secure by Design</h3>
            <p className="text-sm text-white/40 leading-relaxed">Your data is encrypted and protected with industry-standard protocols.</p>
          </div>
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-lg bg-color-accent-blue/20 flex items-center justify-center text-color-accent-blue">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">Omnichannel Ready</h3>
            <p className="text-sm text-white/40 leading-relaxed">Generate content for any platform: social media, web, or email.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">
            Choose Your <span className="text-color-primary">Plan</span>
          </h2>
          <p className="text-white/40 font-medium">Scalable solutions for individuals and teams.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans?.map((plan) => (
            <GlassCard key={plan.id} className={cn(
              "p-8 flex flex-col relative overflow-hidden",
              plan.slug === 'professional' && "border-color-primary/50 ring-1 ring-color-primary/20"
            )}>
              {plan.slug === 'professional' && (
                <div className="absolute top-0 right-0 bg-color-primary text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-widest">
                  Popular
                </div>
              )}
              <h3 className="text-lg font-bold text-white uppercase tracking-tighter mb-1">{plan.name_en}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-black text-white">${plan.price_monthly}</span>
                <span className="text-xs text-white/40 font-bold uppercase tracking-widest">/mo</span>
              </div>
              
              <div className="space-y-3 mb-8 flex-1">
                {plan.features?.map((feature: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-medium text-white/60">
                    <div className="h-1 w-1 rounded-full bg-color-primary" />
                    {feature}
                  </div>
                ))}
              </div>

              <Link href={`/signup?plan=${plan.slug}`}>
                <GlowButton variant={plan.slug === 'professional' ? 'primary' : 'ghost'} className="w-full text-xs">
                  Select Plan
                </GlowButton>
              </Link>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-linear-to-tr from-color-primary to-color-accent-pink flex items-center justify-center">
              <span className="text-[10px] font-black text-white italic">S</span>
            </div>
            <span className="text-sm font-black tracking-tighter uppercase italic">
              SERVING <span className="text-color-primary">BUILDER</span>
            </span>
          </div>
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
            © 2026 SERVING BUILDER APP. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </div>
  )
}
