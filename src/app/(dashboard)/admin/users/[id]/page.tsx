import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserDetailClient } from '@/components/admin/UserDetailClient'
import { getUserAccessibleApps } from '@/lib/access'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user: adminUser } } = await supabase.auth.getUser()

  if (!adminUser) redirect('/login')

  // 1. Cargar usuario
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (!user) notFound()

  // 2. Cargar planes para el selector
  const { data: plans } = await supabase
    .from('plans')
    .select('*, plan_apps(count)')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  // 2.5 Cargar total de apps para mostrar el ratio (ej: 3 de 10)
  const { count: totalAppsCount } = await supabase
    .from('micro_apps')
    .select('*', { count: 'exact', head: true })

  // 3. Obtener apps accesibles (utilidad)
  const accessibleApps = await getUserAccessibleApps(id)

  // 4. Cargar historial reciente (10 ejecuciones)
  const { data: rawExecutions } = await supabase
    .from('app_executions')
    .select('id, status, created_at, app_id, micro_apps(name_en, name_es)')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Normalizar ejecuciones por el tema de PostgREST embedded selects
  const executions = (rawExecutions || []).map(ex => ({
    ...ex,
    micro_apps: Array.isArray(ex.micro_apps) ? ex.micro_apps[0] : ex.micro_apps
  }))

  // 5. Cargar historial de pagos (últimos 10 eventos de webhook)
  const { data: payments } = await supabase
    .from('webhook_logs')
    .select('id, source, event_type, status, created_at, normalized_payload')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <UserDetailClient 
      user={user} 
      plans={plans || []} 
      totalAppsCount={totalAppsCount || 0}
      accessibleApps={accessibleApps}
      executions={executions}
      payments={payments || []}
    />
  )
}
