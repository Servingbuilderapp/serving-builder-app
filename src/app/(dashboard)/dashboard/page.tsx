import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import { SubirDocumentoProyecto } from '@/components/dashboard/SubirDocumentoProyecto'
import { ChecklistEstructuracion } from '@/components/dashboard/ChecklistEstructuracion'
import { PreguntasPendientesProyecto } from '@/components/dashboard/PreguntasPendientesProyecto'
import { EstadoProyecto } from '@/components/dashboard/EstadoProyecto'
import { ConvocatoriasEncontradas } from '@/components/dashboard/ConvocatoriasEncontradas'

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

  const estaPagado = proyecto && proyecto.estado_actual === 'pagado'

  return (
    <DashboardClient
      proyecto={proyecto}
      nombreMostrar={nombreMostrar}
      subirDocumento={
        estaPagado ? (
          <SubirDocumentoProyecto
            proyectoId={proyecto.id}
            archivoActualNombre={proyecto.archivo_proyecto_nombre}
            archivoActualUrl={proyecto.archivo_proyecto_url}
          />
        ) : null
      }
      otrosPagado={
        estaPagado ? (
          <>
            <ChecklistEstructuracion proyectoId={proyecto.id} />
            <EstadoProyecto proyectoId={proyecto.id} />
            <PreguntasPendientesProyecto proyectoId={proyecto.id} />
            <ConvocatoriasEncontradas proyectoId={proyecto.id} />
          </>
        ) : null
      }
    />
  )
}
