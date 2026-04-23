
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DynamicPlansGrid } from '@/components/plans/DynamicPlansGrid'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PlansPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // 1. Obtener usuario actual para marcar su plan
  const { data: userData } = await supabase
    .from('users')
    .select('plan_id')
    .eq('id', user.id)
    .single()

  // 2. Obtener planes activos
  let { data: plans } = await supabase
    .from('plans')
    .select('*, plan_apps(app_id, micro_apps(name_en, name_es))')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  // Fallback si la DB falla o devuelve vacío
  if (!plans || plans.length === 0) {
    plans = [
      { 
        id: '1', slug: 'explorador', name_en: 'Explorer', name_es: 'Explorador', 
        description_en: 'The perfect entry point to the AI revolution. Test our core capabilities without spending a cent.', 
        description_es: 'La puerta de entrada ideal a la revolución de la IA. Prueba nuestras capacidades principales sin gastar un centavo.', 
        price_monthly: 0.00, 
        items_en: [
          '1 Specialized Base Tool', 
          '3 High-Performance Miniapps', 
          'Standard Generation Speed',
          'Community Support',
          'Standard Cloud Hosting'
        ], 
        items_es: [
          '1 Herramienta Base Especializada', 
          '3 Miniapps de Alto Rendimiento', 
          'Velocidad de Generación Estándar',
          'Soporte vía Comunidad',
          'Alojamiento Cloud Estándar'
        ] 
      },
      { 
        id: '2', slug: 'basic', name_en: 'Entrepreneur', name_es: 'Emprendedor', 
        description_en: 'Scale your personal brand with professional tools. No watermarks, just your brand.', 
        description_es: 'Escala tu marca personal con herramientas profesionales. Sin marcas de agua, solo tu marca.', 
        price_monthly: 29.00, 
        items_en: [
          '4 Pro Tools (Image/Text/Video)', 
          '7 Specialized Miniapps', 
          'No Watermarks on Assets',
          'Fast Generation Queue',
          'Direct Email Support',
          'Personal Commercial License'
        ], 
        items_es: [
          '4 Herramientas Pro (Imagen/Texto/Video)', 
          '7 Miniapps Especializadas', 
          'Sin Marcas de Agua en Recursos',
          'Cola de Generación Rápida',
          'Soporte Directo por Email',
          'Licencia Comercial Personal'
        ] 
      },
      { 
        id: '3', slug: 'growth', name_en: 'Growth', name_es: 'Crecimiento', 
        description_en: 'For businesses that need more power. Analytics and custom branding to dominate your niche.', 
        description_es: 'Para negocios que necesitan más poder. Analíticas y marca personalizada para dominar tu nicho.', 
        price_monthly: 49.00, 
        items_en: [
          'Niche Specific AI Tools', 
          '10 Advanced Miniapps', 
          'Custom Domain Integration', 
          'Advanced Analytics Dashboard',
          'SEO Optimization Tools',
          'Priority Generation Speed'
        ], 
        items_es: [
          'Herramientas de IA para Nichos', 
          '10 Miniapps Avanzadas', 
          'Integración de Dominio Propio', 
          'Panel de Analíticas Avanzado',
          'Herramientas de Optimización SEO',
          'Velocidad de Generación Prioritaria'
        ] 
      },
      { 
        id: '4', slug: 'professional', name_en: 'Unlimited Power', name_es: 'Poder Ilimitado', 
        description_en: 'The ultimate agency powerhouse. White-label everything and manage your team with ease.', 
        description_es: 'La central de energía para agencias. Marca blanca en todo y gestiona a tu equipo con facilidad.', 
        price_monthly: 97.00, 
        items_en: [
          'Complete Business Suite Access', 
          '30+ Premium Miniapps', 
          'Full White-Label Capabilities',
          'Multi-user Team Management',
          'Priority VIP Support 24/7',
          'API Access (Early Access)',
          'Extended Commercial Rights'
        ], 
        items_es: [
          'Acceso a Suite Completa de Negocio', 
          'Más de 30 Miniapps Premium', 
          'Capacidad Total de Marca Blanca',
          'Gestión de Equipo Multi-usuario',
          'Soporte VIP Prioritario 24/7',
          'Acceso a API (Acceso Temprano)',
          'Derechos Comerciales Extendidos'
        ] 
      },
      { 
        id: '5', slug: 'elite', name_en: 'Everything Unlimited', name_es: 'Elite', 
        description_en: 'The inner circle of AI innovators. Access everything, influence our roadmap, and grow exponentially.', 
        description_es: 'El círculo interno de innovadores de IA. Accede a todo, influye en nuestro roadmap y crece exponencialmente.', 
        price_monthly: 197.00, 
        items_en: [
          'Everything Truly Unlimited', 
          'Private Beta for All New Apps', 
          '1-on-1 Monthly Growth Strategy', 
          'Full White-Label Deployment', 
          'Priority Feature Roadmap Influence',
          'Dedicated Success Manager',
          'Custom Tool Development Requests'
        ], 
        items_es: [
          'Todo Absolutamente Ilimitado', 
          'Beta Privada de Nuevas Apps', 
          'Estrategia de Crecimiento Mensual 1-a-1', 
          'Despliegue de Marca Blanca Total', 
          'Influencia Directa en el Roadmap',
          'Gestor de Éxito Dedicado',
          'Peticiones de Desarrollo de Herramientas'
        ] 
      }
    ] as any;
  }


  return (
    <div className="max-w-[90rem] mx-auto w-full space-y-12 py-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
          Impulsa tu <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-accent-pink">Creatividad</span>
        </h1>
        <p className="text-white/40 max-w-2xl mx-auto">
          Elige el plan que mejor se adapte a tus necesidades y comienza a generar contenido con IA profesional hoy mismo.
        </p>
      </div>

      <DynamicPlansGrid 
        plans={plans || []} 
        currentPlanId={userData?.plan_id || null} 
      />

      <div className="text-center p-8 border border-dashed border-white/10 rounded-3xl bg-white/2">
        <p className="text-sm text-white/40">
          ¿Necesitas un plan a medida? <a href="#" className="text-primary hover:underline font-bold">Contacta con soporte</a>
        </p>
      </div>
    </div>
  )
}
