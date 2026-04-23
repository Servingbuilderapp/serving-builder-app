'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, Zap, PieChart, Layers, ArrowRight, Loader2, CheckCircle2, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlassCard } from '@/components/ui/GlassCard'

const INDUSTRIES = [
  { id: 'real-estate', name_es: 'Bienes Raíces', icon: '🏠' },
  { id: 'fitness', name_es: 'Salud y Fitness', icon: '💪' },
  { id: 'education', name_es: 'Educación y Cursos', icon: '🎓' },
  { id: 'ecommerce', name_es: 'E-commerce y Retail', icon: '🛒' },
  { id: 'legal', name_es: 'Legal y Abogados', icon: '⚖️' },
  { id: 'marketing', name_es: 'Marketing y Agencias', icon: '🚀' },
  { id: 'finance', name_es: 'Finanzas Personales', icon: '💰' },
  { id: 'food', name_es: 'Restaurantes y Comida', icon: '🍕' }
]

export function IdeaGenerator() {
  const [industry, setIndustry] = useState('')
  const [generationsLeft, setGenerationsLeft] = useState(5)
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [progress, setProgress] = useState(0)

  // Load state from local storage
  useEffect(() => {
    const saved = localStorage.getItem('idea_generations_left')
    if (saved !== null) {
      setGenerationsLeft(parseInt(saved))
    }
  }, [])

  const handleGenerate = async () => {
    if (!industry || generationsLeft <= 0 || isGenerating) return

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
      const newLeft = generationsLeft - 1
      setGenerationsLeft(newLeft)
      localStorage.setItem('idea_generations_left', newLeft.toString())
      
      setResult({
        industry: INDUSTRIES.find(i => i.id === industry)?.name_es,
        microApps: [
          { title: 'Generador de Copys de Listados', desc: 'IA que redacta descripciones hipnóticas para propiedades.', market: '$1.2M/mo' },
          { title: 'Calculadora de ROI Express', desc: 'Herramienta de 1 clic para inversores de alta velocidad.', market: '$800k/mo' },
          { title: 'Asistente de Citas WhatsApp', desc: 'Bot que califica leads y agenda visitas automáticamente.', market: '$2.5M/mo' },
          { title: 'Analizador de Precios de Zona', desc: 'Dashboard que predice tendencias de valor por m².', market: '$3.1M/mo' },
          { title: 'Creador de Tours Virtuales IA', desc: 'Convierte fotos 2D en renders 3D navegables.', market: '$4.5M/mo' }
        ],
        fusion: {
          title: 'RealEstateOS Pro',
          desc: 'La fusión definitiva: CRM + Generador de Contenido + Analítica Predictiva en una sola micro-app.',
          impact: 'Potencial de Facturación: $10k - $25k / mes'
        },
        math: {
          cost: '$150',
          time: '3-5 días',
          users: '500 suscriptores',
          revenue: '$14,500/mes'
        }
      })
      setIsGenerating(false)
    }, 3000)
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Header Info */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-color-primary/10 border border-color-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-color-primary">
          🎁 EL REGALO — GENERADOR DE APPS RENTABLES
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase">
          Generador de Ideas de Micro-Apps
        </h2>
        <p className="text-white/40 font-bold">
          Tu fábrica personal de ideas de negocio — 25 ideas en 5 industrias
        </p>
      </div>

      <GlassCard className="p-10 border-white/10 bg-linear-to-b from-white/5 to-transparent relative overflow-hidden">
        {/* Progress Dots */}
        <div className="flex justify-center gap-3 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div 
              key={i} 
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-all duration-500",
                i <= generationsLeft ? "bg-color-accent-blue shadow-[0_0_10px_rgba(56,189,248,0.8)]" : "bg-white/10"
              )} 
            />
          ))}
        </div>
        
        <p className="text-center text-[11px] font-black uppercase tracking-widest text-white/30 mb-10">
          Generaciones disponibles: <span className="text-color-accent-blue">{generationsLeft} de 5</span>
        </p>

        <div className="space-y-8">
          <div className="space-y-4">
            <label className="block text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-2">
              Selecciona una industria:
            </label>
            <div className="relative group">
              <select 
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full h-16 bg-[#0a0f1d] border border-white/10 rounded-2xl px-6 text-white appearance-none focus:outline-none focus:border-color-primary/50 transition-all cursor-pointer font-bold"
              >
                <option value="" disabled>— Elige una industria —</option>
                {INDUSTRIES.map(i => (
                  <option key={i.id} value={i.id}>{i.icon} {i.name_es}</option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                <Layers className="h-5 w-5 text-white/20" />
              </div>
            </div>
          </div>

          <GlowButton 
            onClick={handleGenerate}
            disabled={!industry || generationsLeft <= 0 || isGenerating}
            className="w-full h-16 text-sm font-black uppercase tracking-[0.3em] gap-3 italic"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                GENERANDO OPORTUNIDADES... {progress}%
              </>
            ) : (
              <>
                GENERAR 5 MICRO-APPS + 1 FUSIÓN
                <Zap className="h-5 w-5 fill-white" />
              </>
            )}
          </GlowButton>
        </div>

        {generationsLeft === 0 && !isGenerating && !result && (
          <div className="mt-8 p-6 rounded-2xl bg-color-primary/10 border border-color-primary/20 text-center animate-in zoom-in-95">
            <p className="text-sm font-bold text-white mb-4">¡Has agotado tus consultas gratuitas!</p>
            <GlowButton variant="primary" className="mx-auto px-8">Acceder a Consultas Ilimitadas</GlowButton>
          </div>
        )}
      </GlassCard>

      {/* Result Display */}
      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-8 duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.microApps.map((app: any, idx: number) => (
              <GlassCard key={idx} className="p-6 border-white/5 bg-white/2 hover:border-color-primary/30 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-color-primary/10 flex items-center justify-center text-color-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-black text-white/20 group-hover:text-color-primary transition-colors">#{idx + 1}</span>
                </div>
                <h4 className="text-lg font-black text-white uppercase italic tracking-tight mb-2">{app.title}</h4>
                <p className="text-xs text-white/40 leading-relaxed mb-4">{app.desc}</p>
                <div className="flex items-center gap-2 text-color-accent-blue">
                  <PieChart className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{app.market} Potencial</span>
                </div>
              </GlassCard>
            ))}
          </div>

          <GlassCard className="p-10 border-color-accent-pink/30 bg-color-accent-pink/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 px-6 py-2 bg-color-accent-pink text-white text-[10px] font-black uppercase tracking-widest italic">
              LA FUSIÓN GANADORA
            </div>
            <div className="flex flex-col md:flex-row gap-10 items-center">
              <div className="h-24 w-24 rounded-3xl bg-color-accent-pink/20 flex items-center justify-center text-color-accent-pink shadow-[0_0_30px_rgba(236,72,153,0.3)] group-hover:scale-110 transition-transform duration-500">
                <Zap className="h-12 w-12 fill-color-accent-pink" />
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{result.fusion.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed max-w-2xl">{result.fusion.desc}</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-black uppercase tracking-widest text-white">{result.fusion.impact}</span>
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="bg-[#111d35] rounded-[2.5rem] p-10 border border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Costo Desarrollo</p>
                <p className="text-2xl font-black text-white">{result.math.cost}</p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Tiempo Go-to-Market</p>
                <p className="text-2xl font-black text-white">{result.math.time}</p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Meta de Usuarios</p>
                <p className="text-2xl font-black text-white">{result.math.users}</p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Ingreso Mensual Est.</p>
                <p className="text-2xl font-black text-color-accent-blue">{result.math.revenue}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-8">
            <GlowButton variant="primary" className="h-16 px-12 text-sm gap-3">
              QUIERO EMPEZAR CON ESTA IDEA
              <ArrowRight className="h-5 w-5" />
            </GlowButton>
          </div>
        </div>
      )}
    </div>
  )
}
