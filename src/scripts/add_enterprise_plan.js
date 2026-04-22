const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function addEnterprisePlan() {
  console.log('🚀 Starting Enterprise Plan insertion...')

  // 1. Insertar el plan
  const { data: plan, error: planError } = await supabase
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

  if (planError) {
    console.error('❌ Error inserting plan:', planError)
    return
  }

  console.log('✅ Plan "Enterprise" inserted successfully with ID:', plan.id)

  // 2. Obtener todas las apps
  const { data: apps, error: appsError } = await supabase
    .from('micro_apps')
    .select('id')

  if (appsError) {
    console.error('❌ Error fetching apps:', appsError)
    return
  }

  console.log(`📦 Found ${apps.length} apps. Linking to Enterprise plan...`)

  // 3. Vincular apps al plan
  const planApps = apps.map(app => ({
    plan_id: plan.id,
    app_id: app.id
  }))

  const { error: linkError } = await supabase
    .from('plan_apps')
    .insert(planApps)

  if (linkError) {
    console.error('❌ Error linking apps:', linkError)
    return
  }

  console.log('✨ Enterprise plan fully configured with all apps!')
}

addEnterprisePlan()
