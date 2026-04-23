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
  { id: 'food', name_es: 'Restaurantes y Comida', icon: '🍕' },
  { id: 'dentists', name_es: 'Dentistas y Odontología', icon: '🦷' },
  { id: 'beauty', name_es: 'Belleza y Spas', icon: '💄' },
  { id: 'pets', name_es: 'Mascotas y Veterinaria', icon: '🐾' },
  { id: 'travel', name_es: 'Viajes y Turismo', icon: '✈️' },
  { id: 'crypto', name_es: 'Cripto y Web3', icon: '🔗' },
  { id: 'gaming', name_es: 'Gaming y Esports', icon: '🎮' },
  { id: 'fashion', name_es: 'Moda y Accesorios', icon: '👗' },
  { id: 'photography', name_es: 'Fotografía y Video', icon: '📸' },
  { id: 'events', name_es: 'Eventos y Bodas', icon: '🎊' },
  { id: 'hr', name_es: 'RRHH y Reclutamiento', icon: '👥' },
  { id: 'real-estate-invest', name_es: 'Inversión Inmobiliaria', icon: '🏢' },
  { id: 'architecture', name_es: 'Arquitectura y Diseño', icon: '📐' },
  { id: 'logistics', name_es: 'Logística y Transporte', icon: '📦' },
  { id: 'cleaning', name_es: 'Servicios de Limpieza', icon: '🧹' },
  { id: 'construction', name_es: 'Construcción y Reformas', icon: '🏗️' },
  { id: 'automotive', name_es: 'Automotriz y Talleres', icon: '🚗' },
  { id: 'insurance', name_es: 'Seguros y Corretaje', icon: '🛡️' },
  { id: 'psychology', name_es: 'Psicología y Terapia', icon: '🧠' },
  { id: 'yoga', name_es: 'Yoga y Mindfulness', icon: '🧘' },
  { id: 'saas', name_es: 'Software y SaaS', icon: '💻' },
  { id: 'coaching', name_es: 'Coaching y Mentoría', icon: '📢' },
  { id: 'podcasting', name_es: 'Podcasting y Audio', icon: '🎙️' },
  { id: 'influencers', name_es: 'Influencers y Creadores', icon: '🤳' },
  { id: 'dropshipping', name_es: 'Dropshipping', icon: '🚢' },
  { id: 'nonprofit', name_es: 'ONGs y Fundaciones', icon: '🤝' },
  { id: 'gardening', name_es: 'Jardinería y Paisajismo', icon: '🌿' },
  { id: 'security', name_es: 'Seguridad y Vigilancia', icon: '🚨' },
  { id: 'energy', name_es: 'Energía y Renovables', icon: '⚡' },
  { id: 'agriculture', name_es: 'Agricultura y Ganadería', icon: '🚜' },
  { id: 'music', name_es: 'Música y Producción', icon: '🎵' },
  { id: 'writing', name_es: 'Escritura y Copywriting', icon: '✍️' },
  { id: 'translation', name_es: 'Traducción e Idiomas', icon: '🌐' },
  { id: 'cybersecurity', name_es: 'Ciberseguridad', icon: '🔐' },
  { id: 'iot', name_es: 'IoT y Smart Homes', icon: '🏠' },
  { id: 'cleaning-ind', name_es: 'Limpieza Industrial', icon: '🏭' },
  { id: 'recycling', name_es: 'Reciclaje y Ecología', icon: '♻️' },
  { id: 'fishing', name_es: 'Pesca y Acuicultura', icon: '🎣' },
  { id: 'luxury', name_es: 'Lujo y Estilo de Vida', icon: '💎' },
  { id: 'wedding-plan', name_es: 'Wedding Planning', icon: '💍' },
  { id: 'baby', name_es: 'Bebés y Maternidad', icon: '👶' },
  { id: 'home-decor', name_es: 'Decoración de Hogar', icon: '🖼️' },
  { id: 'parenting', name_es: 'Parenting y Crianza', icon: '👨‍👩‍👧' },
  { id: 'pets-food', name_es: 'Alimentación de Mascotas', icon: '🦴' },
  { id: 'coffee', name_es: 'Cafeterías y Barismo', icon: '☕' },
  { id: 'wine', name_es: 'Vinos y Enología', icon: '🍷' },
  { id: 'beer', name_es: 'Cervecería Artesanal', icon: '🍺' },
  { id: 'bakery', name_es: 'Panadería y Pastelería', icon: '🥐' },
  { id: 'gym', name_es: 'Gimnasios y Boxeo', icon: '🥊' },
  { id: 'martial-arts', name_es: 'Artes Marciales', icon: '🥋' },
  { id: 'running', name_es: 'Running y Maratón', icon: '🏃' },
  { id: 'cycling', name_es: 'Ciclismo', icon: '🚲' },
  { id: 'swimming', name_es: 'Natación', icon: '🏊' },
  { id: 'football', name_es: 'Fútbol y Deportes', icon: '⚽' },
  { id: 'tennis', name_es: 'Tenis y Pádel', icon: '🎾' },
  { id: 'golf', name_es: 'Golf', icon: '⛳' },
  { id: 'outdoor', name_es: 'Camping y Outdoor', icon: '🏕️' },
  { id: 'handmade', name_es: 'Artesanías y DIY', icon: '🎨' },
  { id: 'jewelry', name_es: 'Joyería', icon: '📿' },
  { id: 'toys', name_es: 'Juguetes y Hobbies', icon: '🧸' },
  { id: 'books', name_es: 'Libros y Editoriales', icon: '📚' },
  { id: 'newspaper', name_es: 'Noticias y Medios', icon: '📰' },
  { id: 'theatre', name_es: 'Teatro y Cine', icon: '🎭' },
  { id: 'dance', name_es: 'Danza y Baile', icon: '💃' },
  { id: 'art', name_es: 'Arte y Galerías', icon: '🎨' },
  { id: 'spirituality', name_es: 'Espiritualidad', icon: '✨' },
  { id: 'astrology', name_es: 'Astrología', icon: '🌙' },
  { id: 'magic', name_es: 'Magia e Ilusionismo', icon: '🪄' },
  { id: 'cleaning-car', name_es: 'Detailing Automotriz', icon: '✨' },
  { id: 'vintage', name_es: 'Vintage y Segunda Mano', icon: '📜' },
  { id: 'gadgets', name_es: 'Gadgets Tecnológicos', icon: '⌚' },
  { id: 'drones', name_es: 'Drones y Robótica', icon: '🚁' },
  { id: 'ai', name_es: 'IA Aplicada', icon: '🤖' },
  { id: 'nocode', name_es: 'No-Code y Low-Code', icon: '🛠️' },
  { id: 'cyber-security', name_es: 'Ciber-Seguridad Personal', icon: '🛡️' },
  { id: 'productivity', name_es: 'Productividad Personal', icon: '📅' },
  { id: 'biohacking', name_es: 'Biohacking', icon: '🧪' },
  { id: 'investing', name_es: 'Bolsa e Inversiones', icon: '📈' },
  { id: 'taxes', name_es: 'Impuestos y Contabilidad', icon: '📝' },
  { id: 'real-estate-luxury', name_es: 'Inmuebles de Lujo', icon: '🏰' },
  { id: 'co-working', name_es: 'Co-working y Oficinas', icon: '🏢' },
  { id: 'virtual-asist', name_es: 'Asistencia Virtual', icon: '👩‍💻' },
  { id: 'copywriting', name_es: 'Copywriting Persuasivo', icon: '✒️' },
  { id: 'public-speak', name_es: 'Hablar en Público', icon: '🎤' },
  { id: 'languages', name_es: 'Idiomas Online', icon: '🗣️' },
  { id: 'cooking-class', name_es: 'Clases de Cocina', icon: '👨‍🍳' },
  { id: 'survival', name_es: 'Supervivencia y Bushcraft', icon: '🔪' },
  { id: 'solar', name_es: 'Energía Solar', icon: '☀️' },
  { id: 'sustainable', name_es: 'Vida Sostenible', icon: '♻️' },
  { id: 'interior-design', name_es: 'Diseño de Interiores', icon: '🛋️' },
  { id: 'graphic-design', name_es: 'Diseño Gráfico', icon: '🖌️' },
  { id: 'video-edit', name_es: 'Edición de Video', icon: '🎞️' },
  { id: 'social-ads', name_es: 'Publicidad Pagada', icon: '💰' },
  { id: 'others', name_es: 'Otros (Especificar)', icon: '✨' }
]

export function IdeaGenerator() {
  const [industry, setIndustry] = useState('')
  const [customIndustry, setCustomIndustry] = useState('')
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
    const finalIndustry = industry === 'others' ? customIndustry : industry
    if (!finalIndustry || generationsLeft <= 0 || isGenerating) return

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
      
      const displayIndustry = industry === 'others' ? customIndustry : INDUSTRIES.find(i => i.id === industry)?.name_es

      setResult({
        industry: displayIndustry,
        microApps: [
          { title: `Generador de Copys para ${displayIndustry}`, desc: `IA que redacta descripciones hipnóticas especializadas en ${displayIndustry}.`, market: '$1.2M/mo' },
          { title: `Calculadora de ROI ${displayIndustry}`, desc: `Herramienta de precisión para el nicho de ${displayIndustry}.`, market: '$800k/mo' },
          { title: `Asistente de Leads para ${displayIndustry}`, desc: `Bot que califica leads y agenda citas en el sector ${displayIndustry}.`, market: '$2.5M/mo' },
          { title: `Analizador de Tendencias ${displayIndustry}`, desc: `Dashboard que predice el futuro de ${displayIndustry}.`, market: '$3.1M/mo' },
          { title: `Portal VIP ${displayIndustry}`, desc: `Experiencia exclusiva para clientes de ${displayIndustry}.`, market: '$4.5M/mo' }
        ],
        fusion: {
          title: `${displayIndustry}OS Pro`,
          desc: `La fusión definitiva: CRM + Generador de Contenido + Analítica Predictiva para ${displayIndustry}.`,
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

            {industry === 'others' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <input 
                  type="text"
                  placeholder="Escribe tu nicho o industria aquí..."
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                  className="w-full h-16 bg-[#0a0f1d] border border-white/10 rounded-2xl px-6 text-white focus:outline-none focus:border-color-primary/50 transition-all font-bold placeholder:text-white/20"
                />
              </div>
            )}
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
                EXTRAYENDO OPORTUNIDADES... {progress}%
              </>
            ) : (
              <>
                GENERAR 5 IDEAS DE MICRO-APPS + 1 FUSIÓN
                <Zap className="h-5 w-5 fill-white" />
              </>
            )}
          </GlowButton>
        </div>

        {generationsLeft === 0 && !isGenerating && !result && (
          <div className="mt-8 p-6 rounded-2xl bg-color-primary/10 border border-color-primary/20 text-center animate-in zoom-in-95">
            <p className="text-sm font-bold text-white mb-4">¡Has agotado tus consultas gratuitas de ideas!</p>
            <GlowButton variant="primary" className="mx-auto px-8">Acceder a Ideas Ilimitadas</GlowButton>
          </div>
        )}
      </GlassCard>

      {/* Result Display */}
      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-8 duration-700">
          <div className="text-center mb-6">
            <span className="text-[10px] font-black text-color-primary uppercase tracking-[0.4em]">Propuestas de Negocio para {result.industry}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.microApps.map((app: any, idx: number) => (
              <GlassCard key={idx} className="p-6 border-white/5 bg-white/2 hover:border-color-primary/30 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-color-primary/10 flex items-center justify-center text-color-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-black text-white/20 group-hover:text-color-primary transition-colors">IDEA #{idx + 1}</span>
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
              CONCEPTO DE FUSIÓN RENTABLE
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
            <div className="text-center mb-8">
               <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20">Proyección Estimada del Modelo de Negocio</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Costo Desarrollo</p>
                <p className="text-2xl font-black text-white">{result.math.cost}</p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Tiempo de Lanzamiento</p>
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
              QUIERO DESARROLLAR ESTA IDEA
              <ArrowRight className="h-5 w-5" />
            </GlowButton>
          </div>
        </div>
      )}
    </div>
  )
}
