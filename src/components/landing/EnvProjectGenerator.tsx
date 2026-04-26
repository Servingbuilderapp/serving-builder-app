'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, Zap, PieChart, Layers, ArrowRight, Loader2, Star, Target, TrendingUp, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlassCard } from '@/components/ui/GlassCard'
import { ENVIRONMENTAL_NICHES } from '@/lib/environmental-ideas-data'
import Link from 'next/link'

interface EnvProjectGeneratorProps {
  userPlan?: string;
  ideasCount?: number;
}

export function EnvProjectGenerator({ userPlan = 'free', ideasCount = 5 }: EnvProjectGeneratorProps) {
  const [industry, setIndustry] = useState('')
  const [generationsLeft, setGenerationsLeft] = useState(0)
  const [maxGenerations, setMaxGenerations] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [progress, setProgress] = useState(0)

  // Determine limits based on plan
  const planSlug = userPlan.toLowerCase();
  
  // Pricing Rules
  // growth-49 ($49): 3/month
  // growth-97 ($97): 10/month
  // elite ($197) & master ($497): unlimited

  const isUnlimited = ['elite', 'master'].includes(planSlug);
  const hasAccess = true; // Everyone can see it, but limit is enforced below

  useEffect(() => {
    let limit = 1; // Default to 1 free trial for everyone below $49
    if (planSlug === 'growth-49') limit = 3;
    else if (planSlug === 'growth-97') limit = 10;
    else if (isUnlimited) limit = 9999; // Represents unlimited

    setMaxGenerations(limit);

    if (hasAccess && !isUnlimited) {
      // Check local storage for daily generations
      const today = new Date().toISOString().split('T')[0];
      const savedDate = localStorage.getItem('env_gen_date');
      const savedCount = localStorage.getItem('env_gen_count');

      if (savedDate !== today) {
        // New day, reset
        localStorage.setItem('env_gen_date', today);
        localStorage.setItem('env_gen_count', '0');
        setGenerationsLeft(limit);
      } else {
        const used = savedCount ? parseInt(savedCount, 10) : 0;
        setGenerationsLeft(Math.max(0, limit - used));
      }
    } else if (isUnlimited) {
      setGenerationsLeft(9999);
    }
  }, [planSlug, hasAccess, isUnlimited]);

  const handleGenerate = async () => {
    if (!industry || (!hasAccess) || (generationsLeft <= 0 && !isUnlimited) || isGenerating) return

    setIsGenerating(true)
    setResult(null)
    setProgress(0)

    // Simulation of progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 100)

    // Simulate AI Generation
    setTimeout(() => {
      if (!isUnlimited) {
        const newLeft = generationsLeft - 1;
        setGenerationsLeft(newLeft);
        const savedCount = localStorage.getItem('env_gen_count') || '0';
        localStorage.setItem('env_gen_count', (parseInt(savedCount) + 1).toString());
      }
      
      const selectedNiche = ENVIRONMENTAL_NICHES.find(i => i.id === industry);
      const displayIndustry = selectedNiche?.name_es || 'Proyectos Ecológicos';

      // Generate items based on count
      const items = Array.from({ length: ideasCount }).map((_, i) => ({
        title: i === 0 ? `Modelo de Negocio: ${displayIndustry} As-A-Service` : 
               i === 1 ? `Plataforma de Trazabilidad para ${displayIndustry}` :
               i === 2 ? `Sistema IoT de Optimización para ${displayIndustry}` :
               i === 3 ? `Marketplace B2B especializado en ${displayIndustry}` :
               i === 4 ? `Certificadora Digital de Impacto en ${displayIndustry}` :
               `Solución Verde #${i + 1} para ${displayIndustry}`,
        desc: `Un enfoque altamente escalable que resuelve la fricción actual en el mercado de ${displayIndustry}, generando rentabilidad y triple impacto.`,
        market: `$${(Math.random() * 10 + 2).toFixed(1)}M/mo`
      }))

      setResult({
        industry: displayIndustry,
        microApps: items,
        fusion: {
          title: `Eco-Ecosistema: ${displayIndustry} 360`,
          desc: `La solución definitiva que integra tecnología, impacto ambiental medible y alta rentabilidad para el sector de ${displayIndustry}.`,
          impact: 'Reducción de 10k toneladas CO2 / año'
        },
        strategies: {
          marketing: [
            { title: 'Storytelling Ambiental', desc: `Campañas que muestran el impacto real en toneladas de CO2 ahorradas en ${displayIndustry}.` },
            { title: 'Partnerships B2B', desc: `Alianzas con corporaciones que necesitan reducir su huella ecológica usando ${displayIndustry}.` },
            { title: 'Thought Leadership', desc: `Publicación de reportes de sostenibilidad en LinkedIn enfocados en ${displayIndustry}.` }
          ],
          sales: [
            { title: 'Suscripción Corporativa', desc: 'Planes B2B desde $997/mes que incluyen reporte ESG automatizado.' },
            { title: 'Venta por Resultados', desc: 'Cobro de un porcentaje basado en el ahorro real generado para el cliente.' },
            { title: 'Licencias Gubernamentales', desc: `Contratos públicos para escalar la adopción de ${displayIndustry} a nivel ciudad.` }
          ],
          growth: [
            { title: 'Expansión de Impacto', desc: 'Reinvertir el 10% en proyectos comunitarios para generar efecto de red.' },
            { title: 'Certificaciones Integradas', desc: `Conectar automáticamente los logros con estándares ISO o Bonos de Carbono.` },
            { title: 'API Abierta', desc: 'Permitir que otras eco-startups construyan sobre tu infraestructura.' }
          ]
        },
        math: {
          cost: '$2,500 - $5k',
          time: '30-45 días',
          users: '100 B2B',
          revenue: `$${(ideasCount * 8500).toLocaleString()}/mes`
        }
      })
      setIsGenerating(false)
    }, 3000)
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 animate-in fade-in duration-1000">
      {/* Header Info */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
          🌱 EXCLUSIVO PLANES PRO — 200 POSIBILIDADES
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-color-base-content italic tracking-tighter uppercase">
          Generador de <span className="text-emerald-600">Proyectos Ambientales</span>
        </h2>
        <p className="text-color-base-content/60 font-bold">
          Modelos de negocio de triple impacto (Económico, Social, Ambiental).
        </p>
      </div>

      <GlassCard className="p-10 border-color-base-content/10 bg-linear-to-b from-emerald-500/5 to-transparent relative overflow-hidden">
        {hasAccess ? (
          <>
            {/* Progress Dots */}
            <div className="flex justify-center gap-3 mb-6">
              {isUnlimited ? (
                <div className="h-2.5 px-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[8px] font-black text-emerald-600 flex items-center tracking-widest uppercase">
                  Acceso Ilimitado Master
                </div>
              ) : (
                <div className="h-2.5 px-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-600 flex items-center tracking-widest uppercase">
                  Límite del Plan: {generationsLeft} / {maxGenerations}
                </div>
              )}
            </div>
            
            <p className="text-center text-[11px] font-black uppercase tracking-widest text-color-base-content/40 mb-10">
              Generaciones disponibles: <span className="text-emerald-600">{isUnlimited ? 'ILIMITADAS' : `${generationsLeft} restantes`}</span>
            </p>

            <div className="space-y-8">
              <div className="space-y-4">
                <label className="block text-xs font-black uppercase tracking-[0.2em] text-color-base-content/60 ml-2">
                  Selecciona uno de los 200 nichos ambientales:
                </label>
                <div className="relative group">
                  <select 
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full h-16 bg-color-base-content/5 border border-color-base-content/10 rounded-2xl px-6 text-color-base-content appearance-none focus:outline-none focus:border-emerald-500/50 transition-all cursor-pointer font-bold"
                  >
                    <option value="" disabled>— Elige una posibilidad —</option>
                    {ENVIRONMENTAL_NICHES.map(i => (
                      <option key={i.id} value={i.id}>{i.icon} {i.name_es}</option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Layers className="h-5 w-5 text-color-base-content/30" />
                  </div>
                </div>
              </div>

              <GlowButton 
                onClick={handleGenerate}
                disabled={!industry || (!isUnlimited && generationsLeft <= 0) || isGenerating}
                className="w-full h-16 text-sm font-black uppercase tracking-[0.3em] gap-3 italic bg-linear-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 border-none text-white shadow-emerald-500/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    ANALIZANDO IMPACTO... {progress}%
                  </>
                ) : (
                  <>
                    GENERAR ESTRATEGIAS VERDES
                    <Zap className="h-5 w-5 fill-current" />
                  </>
                )}
              </GlowButton>
            </div>

            {!isUnlimited && generationsLeft === 0 && !isGenerating && !result && (
               <div className="mt-8 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center animate-in zoom-in-95">
                 <p className="text-sm font-bold text-color-base-content mb-4">¡Has alcanzado tu límite de generaciones!</p>
                 <Link href="#pricing">
                   <GlowButton className="mx-auto px-8 bg-emerald-600 border-none text-white">Mejorar a Plan Ilimitado</GlowButton>
                 </Link>
               </div>
            )}
          </>
        ) : null}
      </GlassCard>

      {/* Result Display */}
      {result && (
        <div className="space-y-16 animate-in fade-in slide-in-from-top-8 duration-700 pb-20">
          {/* Section: Ideas Grid */}
          <div className="space-y-8">
            <div className="text-center">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]">Soluciones para {result.industry}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {result.microApps.map((app: any, idx: number) => (
                <GlassCard key={idx} className="p-6 border-color-base-content/10 bg-color-base-content/5 hover:border-emerald-500/30 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-black text-color-base-content/30 group-hover:text-emerald-600 transition-colors">PROYECTO #{idx + 1}</span>
                  </div>
                  <h4 className="text-lg font-black text-color-base-content uppercase italic tracking-tight mb-2">{app.title}</h4>
                  <p className="text-xs text-color-base-content/60 leading-relaxed mb-4">{app.desc}</p>
                  <div className="flex items-center gap-2 text-emerald-600">
                    <PieChart className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{app.market} Potencial</span>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Section: Strategy */}
          <div className="space-y-12 pt-12 border-t border-color-base-content/10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">
                  ⚡ HOJA DE RUTA ECOLÓGICA
                </div>
                <h3 className="text-4xl md:text-5xl font-black text-color-base-content uppercase italic tracking-tighter">
                  Estrategia de <span className="text-emerald-600">Triple Impacto</span>
                </h3>
                <p className="text-color-base-content/60 text-sm max-w-2xl mx-auto">Análisis profundo de ejecución comercial para dominar el sector de {result.industry}.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Marketing */}
              <div className="space-y-6 group">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <Target className="h-6 w-6" />
                  </div>
                  <h4 className="text-xl font-black text-color-base-content uppercase italic tracking-tight">Marketing Verde</h4>
                </div>
                <div className="space-y-4">
                  {result.strategies.marketing.map((s: any, idx: number) => (
                    <div key={idx} className="p-5 rounded-2xl bg-color-base-content/5 border border-color-base-content/10 hover:border-emerald-500/30 transition-all">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                        {s.title}
                      </p>
                      <p className="text-xs text-color-base-content/60 leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sales */}
              <div className="space-y-6 group">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <h4 className="text-xl font-black text-color-base-content uppercase italic tracking-tight">Modelo B2B</h4>
                </div>
                <div className="space-y-4">
                  {result.strategies.sales.map((s: any, idx: number) => (
                    <div key={idx} className="p-5 rounded-2xl bg-color-base-content/5 border border-color-base-content/10 hover:border-emerald-500/30 transition-all">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                        {s.title}
                      </p>
                      <p className="text-xs text-color-base-content/60 leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Growth */}
              <div className="space-y-6 group">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <h4 className="text-xl font-black text-color-base-content uppercase italic tracking-tight">Escalabilidad</h4>
                </div>
                <div className="space-y-4">
                  {result.strategies.growth.map((s: any, idx: number) => (
                    <div key={idx} className="p-5 rounded-2xl bg-color-base-content/5 border border-color-base-content/10 hover:border-emerald-500/30 transition-all">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                        {s.title}
                      </p>
                      <p className="text-xs text-color-base-content/60 leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Fusion */}
          <GlassCard className="p-10 border-teal-500/30 bg-teal-500/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 px-6 py-2 bg-teal-500 text-white text-[10px] font-black uppercase tracking-widest italic">
              CONCEPTO MACRO
            </div>
            <div className="flex flex-col md:flex-row gap-10 items-center">
              <div className="h-24 w-24 rounded-3xl bg-teal-500/20 flex items-center justify-center text-teal-600 shadow-[0_0_30px_rgba(20,184,166,0.3)] group-hover:scale-110 transition-transform duration-500">
                <Zap className="h-12 w-12 fill-teal-600" />
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-3xl font-black text-color-base-content uppercase italic tracking-tighter">{result.fusion.title}</h3>
                <p className="text-sm text-color-base-content/60 leading-relaxed max-w-2xl">{result.fusion.desc}</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-color-base-content/5 border border-color-base-content/10">
                  <Star className="h-4 w-4 text-emerald-500 fill-emerald-500" />
                  <span className="text-xs font-black uppercase tracking-widest text-color-base-content">{result.fusion.impact}</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
