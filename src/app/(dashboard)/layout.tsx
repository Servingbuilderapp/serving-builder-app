import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayoutClient } from '@/components/dashboard/DashboardLayoutClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // 1. Obtener el perfil completo del usuario con su plan
  const { data: profile } = await supabase
    .from('users')
    .select('*, plans(slug, name_en, name_es)')
    .eq('id', user.id)
    .single()

  // 2. Obtener branding global (del administrador principal)
  const { data: adminProfile } = await supabase
    .from('users')
    .select('brand_name, brand_logo_url')
    .eq('email', 'servingbuilderapp@gmail.com')
    .single()

  const branding = {
    name: profile?.brand_name || user?.user_metadata?.brand_name || adminProfile?.brand_name || 'SERVING BUILDER',
    logo_url: profile?.brand_logo_url || user?.user_metadata?.brand_logo_url || adminProfile?.brand_logo_url || null
  }

  return (
    <DashboardLayoutClient user={user} profile={{ ...profile, branding }}>
      {children}
    </DashboardLayoutClient>
  )
}
