
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserAccessibleApps } from '@/lib/access'
import { AppsGrid } from '@/components/apps/AppsGrid'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AppsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // 1. Obtener apps accesibles
  const accessibleSlugs = await getUserAccessibleApps(user.id)

  // 2. Obtener TODAS las apps de la DB
  const { data: apps } = await supabase
    .from('micro_apps')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Mis Aplicaciones
        </h1>
        <p className="text-white/40">
          Explora las herramientas de IA disponibles en tu plan
        </p>
      </div>

      <AppsGrid 
        apps={apps || []} 
        accessibleSlugs={accessibleSlugs} 
      />
    </div>
  )
}
