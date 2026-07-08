
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
      slug: 'gratis', name_en: 'Free Plan', name_es: 'Gratuito', 
      description_en: '5 pre-assigned master apps.', 
      description_es: '5 Apps maestras pre-asignadas.', 
      price_monthly: 0.00, 
      items_en: ['5 Pre-assigned Master Apps', 'Basic AI Generation', 'Limited Access'], 
      items_es: ['5 Apps Maestras Pre-asignadas', 'Familia, Empresas, Comunidad, Colegios, Gobierno', 'Generación Básica con IA'] 
    },
    { 
      slug: 'crecimiento-10', name_en: 'Initial Growth', name_es: 'Crecimiento Inicial', 
      description_en: 'Unlocks 10 additional apps.', 
      description_es: 'Desbloquea 10 apps adicionales.', 
      price_monthly: 27.00, 
      items_en: ['Everything in Free, PLUS:', '15 Apps in Total', 'Advanced Export Options', 'Standard Priority Support'], 
      items_es: ['Todo lo del plan Gratuito, MÁS:', '15 Apps en Total a tu elección', 'Exportación Avanzada (PDF/Word)', 'Soporte Estándar Prioritario'] 
    },
    { 
      slug: 'crecimiento-30', name_en: 'Pro Growth', name_es: 'Crecimiento Pro', 
      description_en: 'Unlocks 30 apps of your choice.', 
      description_es: 'Desbloquea 30 apps a tu elección.', 
      price_monthly: 47.00, 
      items_en: ['Everything in Initial Growth, PLUS:', '30 Apps in Total', 'Ultra-fast Generation Speed', 'Priority Support'], 
      items_es: ['Todo lo del plan anterior, MÁS:', '30 Apps en Total a tu elección', 'Velocidad de Generación Ultra-rápida', 'Soporte Prioritario'] 
    },
    { 
      slug: 'crecimiento-max', name_en: 'Max Growth', name_es: 'Crecimiento Max', 
      description_en: 'Unlocks 70 apps of your choice.', 
      description_es: 'Desbloquea 70 apps a tu elección.', 
      price_monthly: 97.00, 
      items_en: ['Everything in Pro Growth, PLUS:', '70 Apps in Total', 'Includes 15 Project Funding Apps', 'VIP Support'], 
      items_es: ['Todo lo del plan anterior, MÁS:', '70 Apps en Total a tu elección', 'Incluye 15 Apps de Financiamiento y Subvenciones', 'Soporte VIP'] 
    },
    { 
      slug: 'elite', name_en: 'Elite Plan', name_es: 'Plan Elite', 
      description_en: 'Unlocks 80 apps of your choice.', 
      description_es: 'Desbloquea 80 apps a tu elección.', 
      price_monthly: 197.00, 
      items_en: ['Everything in Max Growth, PLUS:', '80 Apps in Total', 'Unlimited Strategy Generator', 'Dedicated VIP Support', 'Custom Development Requests'], 
      items_es: ['Todo lo del plan anterior, MÁS:', '80 Apps en Total a tu elección', 'Generador de Estrategias y Proyectos IA ILIMITADO', 'Marca Blanca Total (Añade tu Logo)', 'Soporte VIP Dedicado', 'Prioridad en Peticiones de Desarrollo a Medida'] 
    },
    { 
      slug: 'master', name_en: 'Master Plan', name_es: 'Plan Master', 
      description_en: 'Unlimited Unlock (120 apps).', 
      description_es: 'Desbloqueo Ilimitado (120 apps).', 
      price_monthly: 497.00, 
      items_en: ['Everything in Elite, PLUS:', '120 Apps (Total Unlimited Access)', 'We build 3 Custom Apps / Month', 'Full White-Label Portal Deployment', 'Exclusive Server', 'Enterprise Support'], 
      items_es: ['Todo lo del plan Elite, MÁS:', '120 Apps (Acceso Total a TODA la Suite)', 'Construimos 3 Apps 100% Personalizadas / Mes', 'Despliegue Completo de Portal Marca Blanca Propio', 'Alojamiento en Servidor Privado Exclusivo', 'Soporte Técnico Empresarial'] 
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
        <h1 className="text-4xl md:text-5xl font-black text-color-base-content tracking-tight">
          Impulsa tu <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-accent-pink">Creatividad</span>
        </h1>
        <p className="text-color-base-content/60 max-w-2xl mx-auto">
          Elige el plan que mejor se adapte a tus necesidades y comienza a generar contenido con IA profesional hoy mismo.
        </p>
      </div>

      <PricingTable 
        plans={plans || []} 
        currentPlanId={userData?.plan_id || null} 
      />

      <div className="text-center p-8 border border-dashed border-color-base-content/10 rounded-3xl bg-color-base-content/5">
        <p className="text-sm text-color-base-content/60">
          ¿Necesitas un plan a medida? <a href="https://wa.me/573227008727?text=Hola,%20necesito%20información%20sobre%20un%20plan%20a%20medida" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">Contacta con soporte</a>
        </p>
      </div>
    </div>
  )
}
