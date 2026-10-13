import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HojaArbolClient from './HojaArbolClient'

export const dynamic = 'force-dynamic'

export default async function HojaArbolPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <HojaArbolClient />
}
