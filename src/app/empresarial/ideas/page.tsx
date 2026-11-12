import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import IdeasClient from '@/app/(dashboard)/ideas/IdeasClient'

export const dynamic = 'force-dynamic'

/** Misma pantalla de la App de Ideas, pero dentro del Camino A (con su propio menú). */
export default async function Page() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <IdeasClient />
}
