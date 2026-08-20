import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: proyecto } = await supabase
    .from('proyectos_clientes_serving')
    .select('id, nombre_iniciativa, plan_pago, estado_actual, archivo_proyecto_url, archivo_proyecto_nombre, created_at')
    .eq('correo_cliente', user.email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nombreMostrar = user.user_metadata?.first_name || user.email?.split('@')[0] || 'Usuario'

  return <DashboardClient proyecto={proyecto} nombreMostrar={nombreMostrar} />
}
