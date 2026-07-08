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
  const ADMIN_EMAIL = 'servingbuilderapp@gmail.com';
  const accessibleSlugs = await getUserAccessibleApps(user.id, user.email)
  
  const isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  if (!isAdmin && !accessibleSlugs.includes(slug)) {
    redirect('/plans')
  }

  return <MicroAppRunner appSlug={slug} />
}
