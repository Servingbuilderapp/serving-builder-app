import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 1. Verificar que es admin
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('🚀 Starting Enterprise Plan insertion via API...')

    // 2. Insertar el plan
    const { data: plan, error: planError } = await supabaseAdmin
      .from('plans')
      .insert([
        {
          slug: 'enterprise',
          name_en: 'Enterprise',
          name_es: 'Enterprise',
          description_en: 'The ultimate solution for scaling your AI-powered business.',
          description_es: 'La solución definitiva para escalar tu negocio potenciado por IA.',
          price_monthly: 197,
          sort_order: 4,
          is_active: true,
          items_en: [
            "All apps included", 
            "Unlimited generations", 
            "24/7 Priority support", 
            "Early access to new apps", 
            "Personalized onboarding session"
          ],
          items_es: [
            "Todas las apps incluidas", 
            "Generaciones ilimitadas", 
            "Soporte prioritario 24/7", 
            "Acceso anticipado a nuevas apps", 
            "Sesión de onboarding personalizada"
          ]
        }
      ])
      .select()
      .single()

    if (planError) throw planError

    // 3. Obtener todas las apps
    const { data: apps } = await supabase
      .from('micro_apps')
      .select('id')

    if (apps) {
      const planApps = apps.map(app => ({
        plan_id: plan.id,
        app_id: app.id
      }))

      const { error: linkError } = await supabase
        .from('plan_apps')
        .insert(planApps)
      
      if (linkError) throw linkError
    }

    return NextResponse.json({ success: true, planId: plan.id })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
