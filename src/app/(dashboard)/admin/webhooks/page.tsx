import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WebhooksClient } from '@/components/admin/WebhooksClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function WebhooksPage() {
  const supabase = await createClient()
  
  // 1. Verificar si el usuario es admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && user.email !== 'servingbuilderapp@gmail.com') {
    redirect('/')
  }

  // 2. Obtener logs de webhooks
  const { data: logs } = await supabase
    .from('webhook_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  // 3. Obtener planes para el simulador
  const { data: plans } = await supabase
    .from('plans')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div className="max-w-7xl mx-auto w-full pb-20">
      <WebhooksClient 
        logs={logs || []} 
        plans={plans || []} 
      />
    </div>
  )
}
