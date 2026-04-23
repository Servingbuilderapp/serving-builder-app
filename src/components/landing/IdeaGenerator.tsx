'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, Zap, PieChart, Layers, ArrowRight, Loader2, CheckCircle2, Star, Target, TrendingUp, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlassCard } from '@/components/ui/GlassCard'

const INDUSTRIES = [
  // Core / Classics
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
  { id: 'gaming', name_es: 'Gaming y Esports', icon: '🎮' },
  { id: 'fashion', name_es: 'Moda y Accesorios', icon: '👗' },
  { id: 'photography', name_es: 'Fotografía y Video', icon: '📸' },
  { id: 'events', name_es: 'Eventos y Bodas', icon: '🎊' },
  { id: 'hr', name_es: 'RRHH y Reclutamiento', icon: '👥' },
  { id: 'architecture', name_es: 'Arquitectura y Diseño', icon: '📐' },
  { id: 'logistics', name_es: 'Logística y Transporte', icon: '📦' },
  
  // Requested & Advanced
  { id: 'agriculture', name_es: 'Agricultura y Ganadería', icon: '🚜' },
  { id: 'mental-health', name_es: 'Salud Mental y Bienestar', icon: '🧠' },
  { id: 'environment', name_es: 'Medio Ambiente y Ecología', icon: '🌿' },
  { id: 'entrepreneurship', name_es: 'Emprendimiento y Startups', icon: '🚀' },
  { id: 'social-projects', name_es: 'Proyectos Sociales y ONGs', icon: '🤝' },
  { id: 'tokenization', name_es: 'Tokenización de Activos', icon: '💎' },
  { id: 'industry-4', name_es: 'Innovación y Tecnologías 4.0', icon: '🤖' },
  { id: 'blockchain', name_es: 'Blockchain y Web3', icon: '🔗' },
  { id: 'ai-advanced', name_es: 'Inteligencia Artificial', icon: '🧠' },
  { id: 'freelance', name_es: 'Profesionales Independientes', icon: '👨‍💻' },
  { id: 'b2b', name_es: 'B2B y Servicios Corporativos', icon: '🏢' },
  { id: 'consulting', name_es: 'Consultoría y Asesoría', icon: '👔' },
  
  // Specialized Niches
  { id: 'crypto-mining', name_es: 'Minería de Cripto', icon: '⛏️' },
  { id: 'renewable-energy', name_es: 'Energías Renovables', icon: '☀️' },
  { id: 'smart-cities', name_es: 'Smart Cities e Infraestructura', icon: '🏙️' },
  { id: 'biotech', name_es: 'Biotecnología', icon: '🧪' },
  { id: 'cybersecurity', name_es: 'Ciberseguridad', icon: '🔐' },
  { id: 'iot', name_es: 'Internet de las Cosas (IoT)', icon: '📡' },
  { id: 'robotics', name_es: 'Robótica y Automatización', icon: '🦾' },
  { id: 'space-tech', name_es: 'Tecnología Espacial', icon: '🚀' },
  { id: 'vr-ar', name_es: 'Realidad Virtual y Aumentada', icon: '👓' },
  { id: 'fintech', name_es: 'Fintech y Neobancos', icon: '💳' },
  { id: 'insurtech', name_es: 'Insurtech y Seguros', icon: '🛡️' },
  { id: 'proptech', name_es: 'Proptech e Inmobiliaria Tech', icon: '🏢' },
  { id: 'edtech', name_es: 'EdTech y Educación Online', icon: '💻' },
  { id: 'medtech', name_es: 'MedTech y Salud Digital', icon: '🏥' },
  { id: 'agritech', name_es: 'AgriTech y Agricultura Tech', icon: '🌱' },
  { id: 'foodtech', name_es: 'FoodTech e Innovación Alimentaria', icon: '🍔' },
  { id: 'clean-tech', name_es: 'CleanTech y Sostenibilidad', icon: '♻️' },
  
  // Services & Business
  { id: 'saas', name_es: 'Software y SaaS', icon: '💻' },
  { id: 'coaching', name_es: 'Coaching y Mentoría', icon: '📢' },
  { id: 'podcasting', name_es: 'Podcasting y Audio', icon: '🎙️' },
  { id: 'influencers', name_es: 'Influencers y Creadores', icon: '🤳' },
  { id: 'dropshipping', name_es: 'Dropshipping', icon: '🚢' },
  { id: 'cleaning', name_es: 'Servicios de Limpieza', icon: '🧹' },
  { id: 'construction', name_es: 'Construcción y Reformas', icon: '🏗️' },
  { id: 'automotive', name_es: 'Automotriz y Talleres', icon: '🚗' },
  { id: 'insurance', name_es: 'Seguros y Corretaje', icon: '🛡️' },
  { id: 'yoga', name_es: 'Yoga y Mindfulness', icon: '🧘' },
  { id: 'gardening', name_es: 'Jardinería y Paisajismo', icon: '🌿' },
  { id: 'security', name_es: 'Seguridad y Vigilancia', icon: '🚨' },
  { id: 'music', name_es: 'Música y Producción', icon: '🎵' },
  { id: 'writing', name_es: 'Escritura y Copywriting', icon: '✍️' },
  { id: 'translation', name_es: 'Traducción e Idiomas', icon: '🌐' },
  { id: 'recycling', name_es: 'Reciclaje y Ecología', icon: '♻️' },
  { id: 'fishing', name_es: 'Pesca y Acuicultura', icon: '🎣' },
  { id: 'luxury', name_es: 'Lujo y Estilo de Vida', icon: '💎' },
  { id: 'wedding-plan', name_es: 'Wedding Planning', icon: '💍' },
  { id: 'baby', name_es: 'Bebés y Maternidad', icon: '👶' },
  { id: 'home-decor', name_es: 'Decoración de Hogar', icon: '🖼️' },
  { id: 'coffee', name_es: 'Cafeterías y Barismo', icon: '☕' },
  { id: 'wine', name_es: 'Vinos y Enología', icon: '🍷' },
  { id: 'gym', name_es: 'Gimnasios y Boxeo', icon: '🥊' },
  { id: 'martial-arts', name_es: 'Artes Marciales', icon: '🥋' },
  { id: 'cycling', name_es: 'Ciclismo', icon: '🚲' },
  { id: 'football', name_es: 'Fútbol y Deportes', icon: '⚽' },
  { id: 'art', name_es: 'Arte y Galerías', icon: '🎨' },
  { id: 'spirituality', name_es: 'Espiritualidad', icon: '✨' },
  { id: 'gadgets', name_es: 'Gadgets Tecnológicos', icon: '⌚' },
  { id: 'drones', name_es: 'Drones y Robótica', icon: '🚁' },
  { id: 'nocode', name_es: 'No-Code y Low-Code', icon: '🛠️' },
  { id: 'productivity', name_es: 'Productividad Personal', icon: '📅' },
  { id: 'biohacking', name_es: 'Biohacking', icon: '🧪' },
  { id: 'investing', name_es: 'Bolsa e Inversiones', icon: '📈' },
  { id: 'taxes', name_es: 'Impuestos y Contabilidad', icon: '📝' },
  { id: 'co-working', name_es: 'Co-working y Oficinas', icon: '🏢' },
  { id: 'virtual-asist', name_es: 'Asistencia Virtual', icon: '👩‍💻' },
  { id: 'copywriting', name_es: 'Copywriting Persuasivo', icon: '✒️' },
  { id: 'languages', name_es: 'Idiomas Online', icon: '🗣️' },
  { id: 'survival', name_es: 'Supervivencia y Bushcraft', icon: '🔪' },
  { id: 'interior-design', name_es: 'Diseño de Interiores', icon: '🛋️' },
  { id: 'graphic-design', name_es: 'Diseño Gráfico', icon: '🖌️' },
  { id: 'video-edit', name_es: 'Edición de Video', icon: '🎞️' },
  { id: 'social-ads', name_es: 'Publicidad Pagada', icon: '💰' },
  
  // Even more niches to hit 100+
  { id: 'hvac', name_es: 'Aire Acondicionado y Calefacción', icon: '❄️' },
  { id: 'plumbing', name_es: 'Fontanería y Plomería', icon: '🚰' },
  { id: 'electrical', name_es: 'Electricidad y Energía', icon: '⚡' },
  { id: 'roofing', name_es: 'Techos y Cubiertas', icon: '🏠' },
  { id: 'pest-control', name_es: 'Control de Plagas', icon: '🐜' },
  { id: 'pool-service', name_es: 'Mantenimiento de Piscinas', icon: '🏊' },
  { id: 'landscaping', name_es: 'Paisajismo y Jardinería', icon: '🌳' },
  { id: 'waste-mgmt', name_es: 'Gestión de Residuos', icon: '🗑️' },
  { id: 'printing', name_es: 'Impresión y Merchandising', icon: '🖨️' },
  { id: 'storage', name_es: 'Almacenamiento y Trasteros', icon: '📦' },
  { id: 'vending', name_es: 'Máquinas Vending', icon: '🍫' },
  { id: 'laundry', name_es: 'Lavandería y Tintorería', icon: '🧺' },
  { id: 'security-home', name_es: 'Seguridad para el Hogar', icon: '🏠' },
  { id: 'personal-shopper', name_es: 'Personal Shopper', icon: '🛍️' },
  { id: 'concierge', name_es: 'Servicios de Conserjería', icon: '🛎️' },
  { id: 'moving', name_es: 'Mudanzas y Traslados', icon: '🚚' },
  { id: 'courier', name_es: 'Mensajería y Reparto', icon: '🛵' },
  { id: 'pet-grooming', name_es: 'Peluquería Canina', icon: '✂️' },
  { id: 'dog-training', name_es: 'Adiestramiento Canino', icon: '🐕' },
  { id: 'vet-mobile', name_es: 'Veterinaria a Domicilio', icon: '🚑' },
  { id: 'care-seniors', name_es: 'Cuidado de Personas Mayores', icon: '👵' },
  { id: 'nanny', name_es: 'Cuidado de Niños', icon: '🤱' },
  { id: 'tutoring-math', name_es: 'Clases de Matemáticas', icon: '➕' },
  { id: 'tutoring-eng', name_es: 'Clases de Inglés', icon: '🔤' },
  { id: 'music-piano', name_es: 'Clases de Piano', icon: '🎹' },
  { id: 'music-guitar', name_es: 'Clases de Guitarra', icon: '🎸' },
  { id: 'fitness-online', name_es: 'Entrenamiento Online', icon: '💻' },
  { id: 'yoga-pre', name_es: 'Yoga Prenatal', icon: '🤰' },
  { id: 'meditation', name_es: 'Meditación Guiada', icon: '🧘' },
  { id: 'nutrition-vegan', name_es: 'Nutrición Vegana', icon: '🥦' },
  { id: 'paleo', name_es: 'Dieta Paleo', icon: '🍖' },
  { id: 'keto', name_es: 'Dieta Keto', icon: '🥑' },
  { id: 'crossfit', name_es: 'Crossfit', icon: '🏋️' },
  { id: 'pilates', name_es: 'Pilates', icon: '🤸' },
  { id: 'zumba', name_es: 'Zumba y Baile', icon: '💃' },
  { id: 'tennis-padel', name_es: 'Tenis y Pádel', icon: '🎾' },
  { id: 'golf-pro', name_es: 'Clases de Golf', icon: '⛳' },
  { id: 'hiking', name_es: 'Senderismo y Trekking', icon: '🥾' },
  { id: 'camping', name_es: 'Camping y Glamping', icon: '⛺' },
  { id: 'surfing', name_es: 'Surf y Kitesurf', icon: '🏄' },
  { id: 'skiing', name_es: 'Esquí y Snowboard', icon: '⛷️' },
  { id: 'scuba', name_es: 'Buceo y Submarinismo', icon: '🤿' },
  { id: 'sailing', name_es: 'Vela y Yates', icon: '⛵' },
  { id: 'classic-cars', name_es: 'Coches Clásicos', icon: '🏎️' },
  { id: 'motorcycles', name_es: 'Motos y Custom', icon: '🏍️' },
  { id: 'bicycles-ebike', name_es: 'E-Bikes y Movilidad', icon: '🚲' },
  { id: 'renewable-solar', name_es: 'Energía Solar Fotovoltaica', icon: '☀️' },
  { id: 'renewable-wind', name_es: 'Energía Eólica', icon: '🌬️' },
  { id: 'home-automation', name_es: 'Domótica Avanzada', icon: '🏠' },
  { id: 'interior-office', name_es: 'Diseño de Oficinas', icon: '🏢' },
  { id: 'landscape-commercial', name_es: 'Paisajismo Comercial', icon: '🏢' },
  { id: 'event-planning', name_es: 'Organización de Eventos', icon: '📅' },
  { id: 'wedding-photography', name_es: 'Fotografía de Bodas', icon: '📸' },
  { id: 'video-drone', name_es: 'Video con Drones', icon: '🚁' },
  { id: 'animation-3d', name_es: 'Animación 3D', icon: '🎬' },
  { id: 'game-dev', name_es: 'Desarrollo de Videojuegos', icon: '🎮' },
  { id: 'app-dev-mobile', name_es: 'Desarrollo de Apps Móviles', icon: '📱' },
  { id: 'web-design-ux', name_es: 'Diseño Web y UX', icon: '🖥️' },
  { id: 'cyber-sec-audit', name_es: 'Auditoría de Ciberseguridad', icon: '🔐' },
  { id: 'cloud-hosting', name_es: 'Cloud y Alojamiento', icon: '☁️' },
  { id: 'big-data-ana', name_es: 'Big Data y Analítica', icon: '📊' },
  { id: 'ai-chatbots', name_es: 'Chatbots e IA', icon: '🤖' },
  { id: 'machine-learning', name_es: 'Machine Learning', icon: '⚙️' },
  { id: 'blockchain-dev', name_es: 'Desarrollo Blockchain', icon: '🔗' },
  { id: 'nft-art', name_es: 'Arte NFT y Coleccionables', icon: '🎨' },
  { id: 'metaverse-real', name_es: 'Metaverso y Realidad Virtual', icon: '🌐' },
  
  { id: 'others', name_es: 'Otros (Especificar)', icon: '✨' }
]

interface IdeaGeneratorProps {
  userPlan?: string;
  mode?: 'ideas' | 'strategies';
  ideasCount?: number;
}

export function IdeaGenerator({ userPlan, mode = 'ideas', ideasCount = 5 }: IdeaGeneratorProps) {
  const [industry, setIndustry] = useState('')
  const [customIndustry, setCustomIndustry] = useState('')
  const [generationsLeft, setGenerationsLeft] = useState(5)
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [progress, setProgress] = useState(0)

  // Determine if user has unlimited access
  const isPremium = userPlan && !['explorador', 'free'].includes(userPlan.toLowerCase());
  const hasGenerations = isPremium || generationsLeft > 0;

  // Load state from local storage
  useEffect(() => {
    const saved = localStorage.getItem('idea_generations_left')
    if (saved !== null) {
      setGenerationsLeft(parseInt(saved))
    }
  }, [])

  const handleGenerate = async () => {
    const finalIndustry = industry === 'others' ? customIndustry : industry
    if (!finalIndustry || !hasGenerations || isGenerating) return

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
      if (!isPremium) {
        const newLeft = generationsLeft - 1
        setGenerationsLeft(newLeft)
        localStorage.setItem('idea_generations_left', newLeft.toString())
      }
      
      const displayIndustry = industry === 'others' ? customIndustry : INDUSTRIES.find(i => i.id === industry)?.name_es

      // Generate items based on count
      const items = Array.from({ length: ideasCount }).map((_, i) => ({
        title: i === 0 ? `Generador de Copys para ${displayIndustry}` : 
               i === 1 ? `Calculadora de ROI ${displayIndustry}` :
               i === 2 ? `Asistente de Leads para ${displayIndustry}` :
               i === 3 ? `Analizador de Tendencias ${displayIndustry}` :
               i === 4 ? `Portal VIP ${displayIndustry}` :
               i === 5 ? `Optimizador de Procesos ${displayIndustry}` :
               i === 6 ? `Dashboard de KPIs ${displayIndustry}` :
               i === 7 ? `Sistema de Reservas ${displayIndustry}` :
               i === 8 ? `Gestor de Inventario ${displayIndustry}` :
               `Herramienta Inteligente #${i + 1} para ${displayIndustry}`,
        desc: `Solución innovadora que utiliza IA para resolver problemas críticos en el sector de ${displayIndustry}.`,
        market: `$${(Math.random() * 5 + 0.5).toFixed(1)}M/mo`
      }))

      setResult({
        industry: displayIndustry,
        microApps: items,
        fusion: {
          title: `${displayIndustry}OS Pro`,
          desc: `La fusión definitiva: CRM + Generador de Contenido + Analítica Predictiva para ${displayIndustry}.`,
          impact: 'Potencial de Facturación: $10k - $25k / mes'
        },
        strategies: mode === 'strategies' ? {
          marketing: [
            { title: 'Marketing de Contenidos', desc: `Creación de 30 reels mensuales con ganchos psicológicos sobre ${displayIndustry}.` },
            { title: 'Ads de Alta Conversión', desc: `Campañas en Meta y Google dirigidas a dueños de negocios en ${displayIndustry}.` },
            { title: 'Estrategia de Autoridad', desc: `Posicionamiento en LinkedIn como el experto #1 en tecnología para ${displayIndustry}.` }
          ],
          sales: [
            { title: 'Modelo Suscripción', desc: 'Pricing mensual de $49 - $197 dependiendo del volumen de uso.' },
            { title: 'Demo Automática', desc: 'Embudo que permite probar la herramienta y cierra la venta con un video personalizado.' },
            { title: 'Partnerships', desc: `Alianzas con asociaciones locales de ${displayIndustry} para distribución masiva.` }
          ],
          growth: [
            { title: 'Bucle Viral', desc: 'Descuentos cruzados por referir a otros profesionales del sector.' },
            { title: 'Expansión Vertical', desc: `Módulos adicionales para sub-nichos específicos dentro de ${displayIndustry}.` },
            { title: 'Retención Premium', desc: 'Soporte prioritario y acceso a betas exclusivas para usuarios Elite.' }
          ]
        } : null,
        math: {
          cost: '$150',
          time: '3-5 días',
          users: '500 suscriptores',
          revenue: `$${(ideasCount * 2900).toLocaleString()}/mes`
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
          🎁 {mode === 'strategies' ? 'PORTAL PREMIUM — GENERADOR DE ESTRATEGIAS' : 'EL REGALO — GENERADOR DE APPS RENTABLES'}
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase">
          {mode === 'strategies' ? 'Generador de Estrategias de Negocio' : 'Generador de Ideas de Micro-Apps'}
        </h2>
        <p className="text-white/40 font-bold">
          {mode === 'strategies' 
            ? `Estrategia completa y ${ideasCount} ideas de negocio para escalar tu visión.` 
            : `Tu fábrica personal de ideas de negocio — 150+ industrias disponibles.`}
        </p>
      </div>

      <GlassCard className="p-10 border-white/10 bg-linear-to-b from-white/5 to-transparent relative overflow-hidden">
        {/* Progress Dots */}
        <div className="flex justify-center gap-3 mb-6">
          {isPremium ? (
            <div className="h-2.5 px-4 rounded-full bg-color-primary/20 border border-color-primary/30 text-[8px] font-black text-color-primary flex items-center tracking-widest uppercase">
              Acceso Ilimitado Premium
            </div>
          ) : (
            [1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition-all duration-500",
                  i <= generationsLeft ? "bg-color-accent-blue shadow-[0_0_10px_rgba(56,189,248,0.8)]" : "bg-white/10"
                )} 
              />
            ))
          )}
        </div>
        
        <p className="text-center text-[11px] font-black uppercase tracking-widest text-white/30 mb-10">
          Generaciones disponibles: <span className="text-color-accent-blue">{isPremium ? 'ILIMITADAS' : `${generationsLeft} de 5`}</span>
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

          <GlowButton 
            onClick={handleGenerate}
            disabled={!industry || (!isPremium && generationsLeft <= 0) || isGenerating}
            className="w-full h-16 text-sm font-black uppercase tracking-[0.3em] gap-3 italic"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                EXTRAYENDO OPORTUNIDADES... {progress}%
              </>
            ) : (
              <>
                GENERAR {ideasCount} {mode === 'strategies' ? 'ESTRATEGIAS' : 'IDEAS'} DE MICRO-APPS
                <Zap className="h-5 w-5 fill-white" />
              </>
            )}
          </GlowButton>
        </div>

        {!isPremium && generationsLeft === 0 && !isGenerating && !result && (
          <div className="mt-8 p-6 rounded-2xl bg-color-primary/10 border border-color-primary/20 text-center animate-in zoom-in-95">
            <p className="text-sm font-bold text-white mb-4">¡Has agotado tus consultas gratuitas de ideas!</p>
            <GlowButton variant="primary" className="mx-auto px-8">Acceder a Ideas Ilimitadas</GlowButton>
          </div>
        )}
      </GlassCard>

      {/* Result Display */}
      {result && (
        <div className="space-y-16 animate-in fade-in slide-in-from-top-8 duration-700 pb-20">
          {/* Section: Ideas Grid */}
          <div className="space-y-8">
            <div className="text-center">
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
          </div>

          {/* Section: Strategy (Only in strategies mode) */}
          {mode === 'strategies' && result.strategies && (
            <div className="space-y-12 pt-12 border-t border-white/5 animate-in fade-in slide-in-from-bottom-12 duration-1000">
              <div className="text-center space-y-4">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-color-primary/10 border border-color-primary/20 text-[10px] font-black uppercase tracking-[0.3em] text-color-primary">
                   ⚡ HOJA DE RUTA ESTRATÉGICA
                 </div>
                 <h3 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter">
                   Plan de <span className="text-color-primary">Lanzamiento</span> y Escalamiento
                 </h3>
                 <p className="text-white/40 text-sm max-w-2xl mx-auto">Análisis profundo de ejecución comercial para dominar el sector de {result.industry}.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Marketing */}
                <div className="space-y-6 group">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-color-primary/20 flex items-center justify-center text-color-primary group-hover:scale-110 transition-transform">
                      <Target className="h-6 w-6" />
                    </div>
                    <h4 className="text-xl font-black text-white uppercase italic tracking-tight">Marketing</h4>
                  </div>
                  <div className="space-y-4">
                    {result.strategies.marketing.map((s: any, idx: number) => (
                      <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-color-primary/30 transition-all">
                        <p className="text-[10px] font-black text-color-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-color-primary" />
                          {s.title}
                        </p>
                        <p className="text-xs text-white/60 leading-relaxed">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sales */}
                <div className="space-y-6 group">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <h4 className="text-xl font-black text-white uppercase italic tracking-tight">Ventas</h4>
                  </div>
                  <div className="space-y-4">
                    {result.strategies.sales.map((s: any, idx: number) => (
                      <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all">
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {s.title}
                        </p>
                        <p className="text-xs text-white/60 leading-relaxed">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Growth */}
                <div className="space-y-6 group">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <h4 className="text-xl font-black text-white uppercase italic tracking-tight">Crecimiento</h4>
                  </div>
                  <div className="space-y-4">
                    {result.strategies.growth.map((s: any, idx: number) => (
                      <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all">
                        <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                          {s.title}
                        </p>
                        <p className="text-xs text-white/60 leading-relaxed">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Fusion */}
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

          {/* Section: Math */}
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
