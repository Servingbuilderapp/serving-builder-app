import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileClient } from '@/components/dashboard/ProfileClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Fetch user profile from DB
  const { data: profile } = await supabase
    .from('users')
    .select('*, plans(name_en, name_es)')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-5xl mx-auto w-full py-10 px-4">
      <ProfileClient user={user} profile={profile} />
    </div>
  )
}
