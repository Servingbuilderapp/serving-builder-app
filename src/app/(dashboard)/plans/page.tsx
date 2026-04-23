
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PricingTable } from '@/components/plans/PricingTable'

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

  // 2. Obtener planes activos de la DB para tener los IDs correctos
  let { data: dbPlans } = await supabase
    .from('plans')
    .select('*, plan_apps(app_id, micro_apps(name_en, name_es))')
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

  // Combinar: Usar localPlans para el contenido, pero mantener IDs de la DB si existen
  const plans = localPlans.map(lp => {
    const dbPlan = dbPlans?.find(dbp => dbp.slug === lp.slug);
    return {
      ...lp,
      id: dbPlan?.id || `temp-${lp.slug}`, // Importante para que el checkout funcione con el slug
      plan_apps: dbPlan?.plan_apps || []
    };
  });


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

      <PricingTable 
        plans={plans || []} 
        currentPlanId={userData?.plan_id || null} 
      />

      <div className="text-center p-8 border border-dashed border-white/10 rounded-3xl bg-white/2">
        <p className="text-sm text-white/40">
          ¿Necesitas un plan a medida? <a href="https://wa.me/573227008727?text=Hola,%20necesito%20información%20sobre%20un%20plan%20a%20medida" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">Contacta con soporte</a>
        </p>
      </div>
    </div>
  )
}
