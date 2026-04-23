import React from 'react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, Sparkles, Zap, Shield, Globe, LayoutGrid, ChevronRight, Check, Gift } from 'lucide-react'
import { PricingTable } from '@/components/plans/PricingTable'
import { IdeaGenerator } from '@/components/landing/IdeaGenerator'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlassCard } from '@/components/ui/GlassCard'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Helper para organizar por temas si la DB no tiene el campo category
  const getAppCategory = (app: any) => {
    if (app.category) return app.category;
    const name = (app.name_es || app.name_en || '').toLowerCase();
    if (name.includes('video') || name.includes('guion') || name.includes('podcast')) return 'Video & Audio';
    if (name.includes('instagram') || name.includes('social') || name.includes('ninja') || name.includes('viral')) return 'Redes Sociales';
    if (name.includes('seo') || name.includes('web') || name.includes('optimiza')) return 'SEO & Web';
    if (name.includes('escritor') || name.includes('artículo') || name.includes('pro') || name.includes('texto')) return 'Escritura & Contenido';
    return 'Herramientas Pro';
  };
  
  // Fetch apps for showcase
  let { data: allApps } = await supabase
    .from('micro_apps')
    .select('*')
    .limit(20)

  // Fallback si la DB de apps está vacía o falla
  if (!allApps || allApps.length === 0) {
    allApps = [
      { id: '1', slug: 'escritor-pro', name_es: 'Escritor Maestro IA', description_es: 'Genera contenido persuasivo y artículos de alta calidad en segundos.', icon: 'PenTool', category: 'Contenido' },
      { id: '2', slug: 'vision-art', name_es: 'Visión Artística 3D', description_es: 'Transforma conceptos simples en imágenes fotorrealistas e impactantes.', icon: 'Sparkles', category: 'Imagen & Video' },
      { id: '3', slug: 'video-gen', name_es: 'Generador de Video Pro', description_es: 'Crea clips cinematográficos a partir de texto con inteligencia cinemática.', icon: 'Video', category: 'Imagen & Video' },
      { id: '4', slug: 'seo-boost', name_es: 'Optimizador SEO Elite', description_es: 'Domina los buscadores con análisis profundo de palabras clave.', icon: 'Zap', category: 'Optimización' },
      { id: '5', slug: 'social-ninja', name_es: 'Social Media Ninja', description_es: 'Automatiza tu presencia en redes sociales con contenido viral.', icon: 'Share2', category: 'Contenido' },
      { id: '6', slug: 'code-wizard', name_es: 'Asistente Code Wizard', description_es: 'Desarrolla aplicaciones y resuelve bugs con lógica de nivel experto.', icon: 'LayoutGrid', category: 'Optimización' },
    ] as any;
  }

  const trialApps = allApps?.slice(0, 3) || []
  const arsenalApps = allApps?.slice(3, 12) || []

  // Group arsenal by category
  const arsenalCategories = arsenalApps.reduce((acc: Record<string, any[]>, app) => {
    const cat = getAppCategory(app)
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(app)
    return acc
  }, {})

  // 2. Obtener planes activos de la DB
  let { data: dbPlans } = await supabase
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  // Definición de contenido local (Source of Truth para presentación)
  const localPlans = [
    { 
      slug: 'explorador', name_en: 'Explorer', name_es: 'Explorador', 
      description_en: 'Test our interface with limited access.', 
      description_es: 'Acceso limitado para conocer la interfaz.', 
      price_monthly: 0.00, 
      items_en: ['3 Demo Apps (1 Tool, 1 Productivity, 1 Project)', 'Community Support', 'Limited Access (No AI)'], 
      items_es: ['3 Apps Demo (1 Herramienta, 1 Productividad, 1 Proyecto)', 'Soporte vía Comunidad', 'Acceso Limitado (Sin IA)'] 
    },
    { 
      slug: 'basic', name_en: 'Entrepreneur', name_es: 'Emprendedor', 
      description_en: 'Start your journey with essential productivity tools.', 
      description_es: 'Inicia tu camino con herramientas esenciales de productividad.', 
      price_monthly: 29.00, 
      items_en: ['Productivity Tools Unlocked', '7 Specialized Miniapps', 'No Watermarks', 'Fast Generation Queue', 'Email Support', 'Commercial License'], 
      items_es: ['Herramientas de Productividad Desbloqueadas', '7 Miniapps Especializadas', 'Sin Marcas de Agua', 'Cola de Generación Rápida', 'Soporte por Email', 'Licencia Comercial'] 
    },
    { 
      slug: 'growth', name_en: 'Growth', name_es: 'Crecimiento', 
      description_en: 'Scale with project management and advanced vertical tools.', 
      description_es: 'Escala con gestión de proyectos y herramientas verticales avanzadas.', 
      price_monthly: 49.00, 
      items_en: ['Project Tools Unlocked', '15 Advanced Miniapps', 'Custom Domain Integration', 'Advanced Analytics', 'SEO Optimization', 'Priority Generation'], 
      items_es: ['Herramientas de Proyectos Desbloqueadas', '15 Miniapps Avanzadas', 'Integración de Dominio Propio', 'Analíticas Avanzadas', 'Optimización SEO', 'Generación Prioritaria'] 
    },
    { 
      slug: 'professional', name_en: 'Professional', name_es: 'Profesional', 
      description_en: 'Full suite for professional creators and agencies.', 
      description_es: 'Suite completa para creadores profesionales y agencias.', 
      price_monthly: 97.00, 
      items_en: ['Vertical Tools Fully Unlocked', '30+ Premium Miniapps', 'Full White-Label Capabilities', 'Team Management', '24/7 VIP Support', 'Extended Commercial Rights'], 
      items_es: ['Herramientas Verticales Desbloqueadas', 'Más de 30 Miniapps Premium', 'Marca Blanca Total', 'Gestión de Equipo', 'Soporte VIP 24/7', 'Derechos Comerciales Extendidos'] 
    },
    { 
      slug: 'elite', name_en: 'Elite', name_es: 'Elite', 
      description_en: 'The premium experience with AI Idea Generation.', 
      description_es: 'La experiencia premium con Generador de Ideas de IA.', 
      price_monthly: 197.00, 
      items_en: ['All Tools at Maximum Capacity', 'AI Idea Generator (10 queries/mo)', 'Private Beta Access', 'Monthly Growth Strategy', 'Dedicated Success Manager', 'Custom Development Requests'], 
      items_es: ['Todas las Herramientas al Máximo', 'Generador de Ideas IA (10 consultas/mes)', 'Acceso a Betas Privadas', 'Estrategia de Crecimiento Mensual', 'Gestor de Éxito Dedicado', 'Peticiones de Desarrollo a Medida'] 
    },
    { 
      slug: 'master', name_en: 'Business Master', name_es: 'Master Empresarial', 
      description_en: 'The ultimate business powerhouse. Everything unlimited.', 
      description_es: 'La potencia empresarial definitiva. Todo ilimitado.', 
      price_monthly: 497.00, 
      items_en: ['Everything Unlimited', 'UNLIMITED AI Idea Generator', '10 Custom Apps per Month', 'Full White-Label Deployment', 'Direct Access to Roadmap', 'Priority Engineering Support'], 
      items_es: ['Todo Ilimitado', 'Generador de Ideas IA ILIMITADO', '10 Apps Personalizadas al Mes', 'Despliegue de Marca Blanca Total', 'Acceso Directo al Roadmap', 'Soporte de Ingeniería Prioritario'] 
    }
  ];

  const syncPlans = localPlans.map(lp => {
    const dbPlan = dbPlans?.find(dbp => dbp.slug === lp.slug);
    return {
      ...lp,
      id: dbPlan?.id || `temp-${lp.slug}`,
      plan_apps: []
    };
  });

  return (
    <div className="min-h-screen bg-color-base-100 text-white overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-color-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-color-accent-pink/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0f1d]/60 border-b border-white/5">
        <div className="flex items-center justify-between px-8 h-20 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="h-10 w-10 rounded-xl bg-linear-to-tr from-color-primary to-color-accent-pink flex items-center justify-center shadow-xl shadow-color-primary/20 group-hover:scale-110 transition-transform duration-500">
              <span className="font-black text-white italic text-xl">S</span>
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic group-hover:tracking-normal transition-all duration-500">
              SERVING <span className="text-color-primary">BUILDER</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#trial" className="hidden md:block text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors">Arsenal</Link>
            <Link href="#pricing" className="hidden md:block text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors">Planes</Link>
            {user ? (
              <Link href="/dashboard">
                <GlowButton className="text-[10px] h-10 px-8 gap-2 font-black tracking-widest">
                  <LayoutGrid className="h-4 w-4" />
                  DASHBOARD
                </GlowButton>
              </Link>
            ) : (
              <>
              <a href="/login" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 hover:text-white transition-colors">
                Iniciar Sesión
              </a>
              <a href="/signup" className="contents">
                <GlowButton className="text-[10px] h-10 px-8 font-black tracking-widest">
                  EMPEZAR AHORA
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
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-color-primary animate-in fade-in slide-in-from-left-4 duration-1000">
              <Sparkles className="h-4 w-4 fill-color-primary" />
              Inteligencia Reimaginada
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] italic uppercase animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Transforma <br />
              <span className="text-gradient-magma drop-shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                Ideas en <br />
                Realidad
              </span>
            </h1>
            
            <p className="text-xl text-white/50 max-w-xl font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
              Despliega <span className="text-white font-bold">Motores de IA</span> especializados que automatizan tu negocio, escalan tu marca y liberan tu tiempo.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-600">
              <a href={user ? "/dashboard" : "/signup"} className="contents">
                <GlowButton 
                  className="h-16 px-12 text-lg gap-4 font-black italic uppercase tracking-widest"
                  onClick={() => window.location.href = user ? "/dashboard" : "/signup"}
                >
                  {user ? "Ir al Dashboard" : "Empieza Gratis"}
                  <ArrowRight className="h-6 w-6" />
                </GlowButton>
              </a>
              <a href="#trial">
                <button className="h-16 px-10 text-xs font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 group">
                  Probar Ahora
                </button>
              </a>
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

      {/* Benefits Section */}
      <section id="benefits" className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-6 group p-8 rounded-[2.5rem] hover:bg-white/5 transition-all duration-500">
            <div className="h-16 w-16 rounded-2xl bg-color-primary/10 flex items-center justify-center text-color-primary group-hover:scale-110 transition-transform">
              <Zap className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Velocidad Extrema</h3>
            <p className="text-white/40 leading-relaxed font-medium">Obtén resultados en milisegundos con nuestra infraestructura de IA optimizada para el rendimiento.</p>
          </div>
          <div className="space-y-6 group p-8 rounded-[2.5rem] hover:bg-white/5 transition-all duration-500">
            <div className="h-16 w-16 rounded-2xl bg-color-accent-pink/10 flex items-center justify-center text-color-accent-pink group-hover:scale-110 transition-transform">
              <Shield className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Seguridad de Élite</h3>
            <p className="text-white/40 leading-relaxed font-medium">Tus datos están protegidos con encriptación de nivel bancario y protocolos de seguridad avanzados.</p>
          </div>
          <div className="space-y-6 group p-8 rounded-[2.5rem] hover:bg-white/5 transition-all duration-500">
            <div className="h-16 w-16 rounded-2xl bg-color-accent-blue/10 flex items-center justify-center text-color-accent-blue group-hover:scale-110 transition-transform">
              <Globe className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Multicanal Pro</h3>
            <p className="text-white/40 leading-relaxed font-medium">Genera contenido adaptado para cualquier plataforma: redes sociales, web o campañas de email marketing.</p>
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
            {trialApps.map((app: any) => (
              <GlassCard key={app.id} className="p-8 group hover:border-color-primary/50 transition-all hover:scale-105 duration-500 flex flex-col">
                <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-color-primary group-hover:bg-color-primary/20 transition-all mb-6">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">{app.name_es}</h3>
                <p className="text-sm text-white/40 mb-8 line-clamp-3 leading-relaxed flex-1">
                  {app.description_es}
                </p>
                <a href={`/login?redirect=/apps/${app.slug}`} className="w-full">
                  <GlowButton variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest py-6">
                    Probar Motor
                  </GlowButton>
                </a>
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
            <p className="text-white/40 font-medium text-xl">Más de 100 motores especializados listos para trabajar por ti.</p>
          </div>
          <Link href="/apps" className="text-xs font-black uppercase tracking-[0.3em] text-color-primary flex items-center gap-3 group px-6 py-3 rounded-xl bg-color-primary/5 border border-color-primary/20 hover:bg-color-primary/10 transition-all">
            VER TODO EL ARSENAL
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
                    <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-color-primary group-hover:bg-color-primary/10 transition-all mb-8">
                      <Sparkles className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tight">{app.name_es}</h3>
                    <p className="text-sm text-white/40 line-clamp-2 leading-relaxed">
                      {app.description_es}
                    </p>
                    <a href={`/login?redirect=/apps/${app.slug}`} className="mt-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-color-primary/60 hover:text-color-primary transition-colors">
                      Probar Motor <ArrowRight className="h-3 w-3" />
                    </a>
                  </GlassCard>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Idea Generator Section (The Gift) */}
      <section className="relative z-10 py-32 px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-color-primary/5 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col items-center text-center space-y-8 mb-10">
            <p className="text-white/60 font-medium text-lg max-w-4xl leading-relaxed">
              Acabas de ver 5 micro-apps, una fusión que no existe en ningún lado, y los números reales de tu primer año. <br className="hidden md:block" />
              <span className="text-white font-bold">¿Te gustaría recibir ideas así — personalizadas para la industria que TÚ elijas — generadas por IA en 30 segundos?</span>
            </p>
            
            <p className="text-white/30 font-medium text-sm max-w-3xl">
              Eric te regala <span className="text-white font-black">5 generaciones gratuitas</span> de su Generador de Apps Rentables. Cada generación te da 5 micro-apps únicas + 1 fusión + la matemática completa. Eso es <span className="text-white font-black">25 ideas de negocio en 5 industrias</span>. Elige tu industria y genera.
            </p>
          </div>

          <IdeaGenerator userPlan={user?.user_metadata?.plan_slug || 'free'} />
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

        <PricingTable 
          plans={syncPlans} 
          currentPlanId={null} 
        />
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
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Plataforma</h4>
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
