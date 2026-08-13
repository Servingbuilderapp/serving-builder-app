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
  // DETECTOR DE MODO LOCAL: Si estás en desarrollo, simula el usuario administrador para evitar el bucle de login
  const isDevelopment = process.env.NODE_ENV === 'development'

  let user: any = null
  let profile: any = null
  let adminProfile: any = null

  if (isDevelopment) {
    // Usuario ficticio de pruebas para desarrollo local sin Supabase obligatorio
    user = {
      id: 'local-dev-user-id',
      email: 'gonzalo@serving.co',
      user_metadata: {
        brand_name: 'SERVING FACTORY LOCAL'
      }
    }
    profile = {
      id: 'local-dev-user-id',
      email: 'gonzalo@serving.co',
      brand_name: 'SERVING FACTORY LOCAL',
      plans: {
        slug: 'enterprise',
        name_en: 'Enterprise Plan',
        name_es: 'Plan Enterprise'
      }
    }
  } else {
    // Comportamiento de producción estándar
    const supabase = await createClient()
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser()

    if (error || !supabaseUser) {
      redirect('/login')
    }
    user = supabaseUser

    // 1. Obtener el perfil completo del usuario con su plan
    const { data: dbProfile } = await supabase
      .from('users')
      .select('*, plans(slug, name_en, name_es)')
      .eq('id', user.id)
      .single()
    profile = dbProfile

    // 2. Obtener branding global (del administrador principal)
    const { data: dbAdminProfile } = await supabase
      .from('users')
      .select('brand_name, brand_logo_url')
      .eq('email', 'servingbuilderapp@gmail.com')
      .single()
    adminProfile = dbAdminProfile
  }

  const branding = {
    name: profile?.brand_name || user?.user_metadata?.brand_name || adminProfile?.brand_name || 'Arquitectura Digital de Proyectos',
    logo_url: profile?.brand_logo_url || user?.user_metadata?.brand_logo_url || adminProfile?.brand_logo_url || null
  }

  return (
    <DashboardLayoutClient user={user} profile={{ ...profile, branding }}>
      {children}
    </DashboardLayoutClient>
  )
}
