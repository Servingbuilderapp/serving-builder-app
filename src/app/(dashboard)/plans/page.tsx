
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

  // Fallback si la DB falla o devuelve vacío (Día 9)
  if (!plans || plans.length === 0) {
    plans = [
      { id: '1', slug: 'basic', name_en: 'Basic', name_es: 'Básico', description_en: 'Perfect for getting started', description_es: 'Perfecto para empezar', price_monthly: 29.00, items_en: ['Access to all AI apps', 'Standard speed'], items_es: ['Acceso a todas las apps', 'Velocidad estándar'] },
      { id: '2', slug: 'intermediary', name_en: 'Intermediary', name_es: 'Intermedio', description_en: 'For growing businesses', description_es: 'Para negocios en crecimiento', price_monthly: 49.00, items_en: ['Priority generation', 'Priority support'], items_es: ['Generación prioritaria', 'Soporte prioritario'] },
      { id: '3', slug: 'professional', name_en: 'Professional', name_es: 'Profesional', description_en: 'Unlimited power', description_es: 'Poder ilimitado', price_monthly: 97.00, items_en: ['Ultra-fast generation', 'Direct support'], items_es: ['Generación ultra-rápida', 'Soporte directo'] },
      { id: '4', slug: 'enterprise', name_en: 'Enterprise', name_es: 'Empresarial', description_en: 'Custom solutions', description_es: 'Soluciones a medida', price_monthly: 197.00, items_en: ['API Access', 'Dedicated account manager'], items_es: ['Acceso API', 'Gestor de cuenta dedicado'] }
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
