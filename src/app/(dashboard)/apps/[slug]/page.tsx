import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserAccessibleApps } from '@/lib/access'
import { MicroAppRunner } from '@/components/microapps/MicroAppRunner'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Verificar acceso
  const accessibleSlugs = await getUserAccessibleApps(user.id)
  if (!accessibleSlugs.includes(slug)) {
    redirect('/plans')
  }

  return <MicroAppRunner appSlug={slug} />
}
