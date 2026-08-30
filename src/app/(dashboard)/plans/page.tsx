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

  // Planes reales de Arquitectura Digital
  const localPlans = [
    {
      slug: 'esencial',
      name_en: 'Strategic Structuring',
      name_es: 'Estructuración Estratégica',
      description_en: 'Full project structuring with 3 months of grant search.',
      description_es: 'Estructuración completa de tu proyecto con 3 meses de búsqueda de convocatorias.',
      price_monthly: 12000000,
      items_en: [
        'Free Diagnosis Included',
        'Full Formulation Process',
        '3 Months of Grant & Funding Search',
        'Terms of Reference Matching',
        '+3 Extra Months if Nothing is Won'
      ],
      items_es: [
        'Diagnóstico Gratuito Incluido',
        'Formulación Completa',
        '3 Meses de Búsqueda de Convocatorias',
        'Encaje con Términos de Referencia',
        '+3 Meses de Cortesía si no se Gana Nada'
      ]
    },
    {
      slug: 'completo',
      name_en: 'Elite Structuring',
      name_es: 'Estructuración Élite',
      description_en: 'Our most complete plan: 6 months of grant search and priority matching.',
      description_es: 'Nuestra modalidad más completa: 6 meses de búsqueda de convocatorias y encaje prioritario.',
      price_monthly: 17000000,
      featured: true,
      items_en: [
        'Free Diagnosis Included',
        'Full Formulation Process',
        '6 Months of Grant & Funding Search',
        'Terms of Reference Matching',
        '+6 Extra Months if Nothing is Won',
        'Priority Support'
      ],
      items_es: [
        'Diagnóstico Gratuito Incluido',
        'Formulación Completa',
        '6 Meses de Búsqueda de Convocatorias',
        'Encaje con Términos de Referencia',
        '+6 Meses de Cortesía si no se Gana Nada',
        'Soporte Prioritario'
      ]
    }
  ];

  // Combinar: Usar localPlans para el contenido, pero mantener IDs de la DB si existen
  const plans = localPlans.map(lp => {
    const dbPlan = dbPlans?.find(dbp => dbp.slug === lp.slug);
    return {
      ...lp,
      id: dbPlan?.id || `temp-${lp.slug}`,
      plan_apps: dbPlan?.plan_apps || []
    };
  });


  return (
    <div className="max-w-[90rem] mx-auto w-full space-y-12 py-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-color-base-content tracking-tight">
          Estructura tu <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-accent-pink">Proyecto</span>
        </h1>
        <p className="text-color-base-content/60 max-w-2xl mx-auto">
          Elige el plan de estructuración que mejor se adapte a tu proyecto y comienza el proceso hoy mismo.
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
