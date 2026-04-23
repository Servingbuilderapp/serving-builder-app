
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
        description_en: 'Perfect to test the portal power and start automating for free.', 
        description_es: 'Perfecto para probar la potencia del portal y empezar a automatizar sin costo.', 
        price_monthly: 0.00, 
        items_en: ['1 Base Tool', '3 Mini-apps', 'Community support'], 
        items_es: ['1 Herramienta base', '3 Miniapps', 'Soporte de la comunidad'] 
      },
      { 
        id: '2', slug: 'basic', name_en: 'Entrepreneur', name_es: 'Emprendedor', 
        description_en: 'Designed for solopreneurs. Includes email support and no watermark.', 
        description_es: 'Diseñado para solopreneurs. Incluye soporte por email y eliminación de marca de agua.', 
        price_monthly: 29.00, 
        items_en: ['4 Additional Tools', '7 Mini-apps', 'Email Support', 'No Watermark'], 
        items_es: ['4 Herramientas adicionales', '7 Miniapps', 'Soporte por email', 'Sin marca de agua'] 
      },
      { 
        id: '3', slug: 'growth', name_en: 'Growth', name_es: 'Crecimiento', 
        description_en: 'For scaling businesses. Includes custom domain and analytics.', 
        description_es: 'Para negocios que escalan. Incluye dominio personalizado y analíticas.', 
        price_monthly: 49.00, 
        items_en: ['Niche Specific Tools', '10 Mini-apps', 'Custom Domain', 'Analytics Dashboard'], 
        items_es: ['Herramientas de nicho', '10 Miniapps', 'Dominio personalizado', 'Analíticas'] 
      },
      { 
        id: '4', slug: 'professional', name_en: 'Unlimited Power', name_es: 'Poder Ilimitado', 
        description_en: 'Ideal for agencies and power users. Priority support and multi-user.', 
        description_es: 'Ideal para agencias y power users. Incluye soporte prioritario y modo multi-usuario.', 
        price_monthly: 97.00, 
        items_en: ['All Business Tools', '30 Mini-apps', 'Priority Support', 'Multi-user Mode', 'White Label Options'], 
        items_es: ['Todas las herramientas', '30 Miniapps', 'Soporte prioritario', 'Modo multi-usuario', 'Opciones Marca Blanca'] 
      },
      { 
        id: '5', slug: 'elite', name_en: 'Everything Unlimited', name_es: 'Elite', 
        description_en: 'Total access to new apps before anyone else and monthly optimization consulting.', 
        description_es: 'Acceso total a nuevas apps antes que nadie y consultoría mensual de optimización.', 
        price_monthly: 197.00, 
        items_en: ['Everything Unlimited', 'Beta Access', 'Monthly Consulting', 'Full White Label', 'Priority Feature Requests'], 
        items_es: ['Todo Ilimitado', 'Acceso Beta', 'Consultoría mensual', 'Marca Blanca Total', 'Peticiones de funciones VIP'] 
      }
    ] as any;
  }


  return (
    <div className="max-w-7xl mx-auto w-full space-y-12 py-10">
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
