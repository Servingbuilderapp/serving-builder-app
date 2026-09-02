import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { PestanasProyecto } from '@/components/panel/PestanasProyecto'

export const dynamic = 'force-dynamic'

/**
 * Marco común de las pantallas internas de un proyecto: la barra de pestañas.
 * El candado de acceso lo sigue haciendo cada pantalla (todas redirigen si el
 * usuario no es del equipo); aquí solo se lee el nombre para la cabecera.
 */
export default async function LayoutProyecto({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: proyecto } = await supabase
    .from('proyectos_clientes_serving')
    .select('id, nombre_iniciativa, nombre_cliente')
    .eq('id', id)
    .maybeSingle<{ id: string; nombre_iniciativa: string | null; nombre_cliente: string | null }>()

  if (!proyecto?.id) return <>{children}</>

  return (
    <>
      <PestanasProyecto
        proyectoId={String(proyecto.id)}
        nombreProyecto={proyecto.nombre_iniciativa || 'Proyecto sin nombre'}
        nombreCliente={proyecto.nombre_cliente}
      />
      {children}
    </>
  )
}
