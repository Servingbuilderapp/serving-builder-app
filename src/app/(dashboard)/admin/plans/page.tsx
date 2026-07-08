import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PlansManagement } from '@/components/admin/PlansManagement'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminPlansPage() {
  const supabase = await createClient()
  const { data: { user: adminUser } } = await supabase.auth.getUser()

  if (!adminUser) redirect('/login')

  // 1. Obtener todos los planes con apps y conteo de usuarios
  const { data: plans } = await supabase
    .from('plans')
    .select('*, plan_apps(app_id), users(count)')
    .order('sort_order', { ascending: true })

  // 2. Obtener todas las apps para el selector
  const { data: allApps } = await supabase
    .from('micro_apps')
    .select('id, name_en, name_es, icon')
    .order('created_at', { ascending: true })

  return (
    <PlansManagement 
      initialPlans={plans || []} 
      allApps={allApps || []} 
    />
  )
}
