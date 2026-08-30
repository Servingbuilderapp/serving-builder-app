import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PanelShell } from '@/components/panel/PanelShell'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Perfil = {
  first_name?: string | null
  last_name?: string | null
  full_name?: string | null
  role?: string | null
  email?: string | null
}

export default async function LayoutPanel({ children }: { children: React.ReactNode }) {
  // En desarrollo local se permite entrar sin sesión para poder trabajar en las
  // pantallas sin depender de Supabase (mismo comportamiento que ya existía).
  const enDesarrollo = process.env.NODE_ENV === 'development'

  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if ((error || !user) && !enDesarrollo) redirect('/login')

  const correo = user?.email || 'local@desarrollo.test'

  const { data: perfil } = await supabase
    .from('users')
    .select('first_name, last_name, full_name, role, email')
    .eq('id', user?.id || '')
    .maybeSingle<Perfil>()

  const { data: proyecto } = await supabase
    .from('proyectos_clientes_serving')
    .select('id, nombre_iniciativa, estado_actual')
    .eq('correo_cliente', correo)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nombrePartes = [perfil?.first_name, perfil?.last_name].filter(Boolean).join(' ').trim()
  const nombreUsuario =
    perfil?.full_name ||
    nombrePartes ||
    (user?.user_metadata?.first_name as string | undefined) ||
    correo.split('@')[0] ||
    'Usuario'

  const esAdmin = perfil?.role === 'admin' || correo === 'servingbuilderapp@gmail.com'

  return (
    <PanelShell
      proyecto={
        proyecto
          ? {
              id: String(proyecto.id),
              nombre: String(proyecto.nombre_iniciativa || 'Proyecto sin nombre'),
              estado: String(proyecto.estado_actual || ''),
            }
          : null
      }
      nombreUsuario={nombreUsuario}
      rolUsuario={esAdmin ? 'Administrador' : 'Cliente'}
    >
      {children}
    </PanelShell>
  )
}
