import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PanelShell } from '@/components/panel/PanelShell'
import { esEquipoServing } from '@/lib/guardiaEquipo'
import { calcularSiguientePaso } from '@/lib/siguientePaso'

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
    .select('first_name, last_name, full_name, role, email, socio_id')
    .eq('id', user?.id || '')
    .maybeSingle<Perfil & { socio_id?: string | null }>()

  const { data: proyecto } = await supabase
    .from('proyectos_clientes_serving')
    .select('id, nombre_iniciativa, estado_actual, canal_origen, plan_pago')
    .eq('correo_cliente', correo)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<{ id: string; nombre_iniciativa: string | null; estado_actual: string | null; canal_origen: string | null; plan_pago: string | null }>()

  const nombrePartes = [perfil?.first_name, perfil?.last_name].filter(Boolean).join(' ').trim()
  const nombreUsuario =
    perfil?.full_name ||
    nombrePartes ||
    (user?.user_metadata?.first_name as string | undefined) ||
    correo.split('@')[0] ||
    'Usuario'

  const esAdmin = perfil?.role === 'admin' || correo === 'servingbuilderapp@gmail.com' || (await esEquipoServing())
  const esSocio = !esAdmin && perfil?.role === 'socio'

  // El administrador tampoco: el proyecto atado a su correo es uno de prueba y
  // confundía (salía arriba aunque estuviera viendo el de un cliente).
  // Un socio de marca blanca no tiene "proyecto activo" propio (administra
  // varios, no es dueño de uno) — nunca se le muestra el proyecto de otra
  // persona en la cabecera.
  const rolUsuario = esAdmin ? 'Administrador' : esSocio ? 'Socio' : 'Cliente'

  // La campanita: lo que le toca al cliente ahora. Si falla, simplemente no se muestra.
  let aviso: { titulo: string; texto: string; accion: { texto: string; href: string } | null } | null = null
  if (!esAdmin && !esSocio && proyecto?.id) {
    try {
      aviso = await calcularSiguientePaso({
        db: supabase,
        proyectoId: String(proyecto.id),
        nombreProyecto: proyecto.nombre_iniciativa,
        nombreCliente: null,
        correoCliente: correo,
        vistaEquipo: false,
      })
    } catch {
      aviso = null
    }
  }

  // Un cliente que entró por el enlace de un socio de marca blanca solo
  // recibe el camino de estructuración — sin App de Ideas, Réplicas ni
  // Academia (acuerdo del 13 sep 2026: esas son cosas de la marca propia
  // de Serving, el socio no las necesita ni las contrató).
  const esClienteMarcaBlanca = !esAdmin && !esSocio && proyecto?.canal_origen === 'marca_blanca'

  return (
    <PanelShell
      proyecto={
        !esSocio && !esAdmin && proyecto
          ? {
              id: String(proyecto.id),
              nombre: String(proyecto.nombre_iniciativa || 'Proyecto sin nombre'),
              estado: String(proyecto.estado_actual || ''),
            }
          : null
      }
      nombreUsuario={nombreUsuario}
      rolUsuario={rolUsuario}
      esClienteMarcaBlanca={esClienteMarcaBlanca}
      tieneCortesia={!esAdmin && !esSocio && proyecto?.plan_pago === 'cortesia'}
      aviso={aviso}
      numeroAlertas={aviso?.accion ? 1 : 0}
    >
      {children}
    </PanelShell>
  )
}
