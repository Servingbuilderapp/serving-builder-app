import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HojaBeneficiarioClient from './HojaBeneficiarioClient'

export const dynamic = 'force-dynamic'

export default async function HojaBeneficiarioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <HojaBeneficiarioClient />
}
