import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import IdeasClient from './IdeasClient'

export const dynamic = 'force-dynamic'

export default async function IdeasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('plan_slug')
    .eq('id', user.id)
    .single()

  return <IdeasClient planSlug={profile?.plan_slug || 'free'} />
}
