import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MensajesProyecto } from '@/components/panel/MensajesProyecto'

export const dynamic = 'force-dynamic'

const CORREO_ADMIN = 'servingbuilderapp@gmail.com'

/** Pantalla interna del equipo para hablar con el cliente de un proyecto. */
export default async function MensajesProyectoAdminPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email?.toLowerCase() !== CORREO_ADMIN) redirect('/dashboard')

  const { data: proyecto } = await supabase
    .from('proyectos_clientes_serving')
    .select('id, nombre_iniciativa')
    .eq('id', id)
    .maybeSingle()

  if (!proyecto) redirect('/admin/proyectos')

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 p-4 lg:p-6">
      <header>
        <h1 className="text-[19px] font-extrabold uppercase tracking-tight text-[#F3E7DC]">Mensajes</h1>
        <p className="text-[13px] text-[#F3E7DC]/55">{proyecto.nombre_iniciativa}</p>
      </header>
      {/*
        MensajesProyecto está pintado con la paleta clara del panel del
        cliente (igual que ConvocatoriasCliente); el resto de esta sección de
        admin sigue en vino oscuro. Se envuelve en una tarjeta clara para que
        no choque, en vez de duplicar el componente con dos paletas.
      */}
      <div className="overflow-hidden rounded-2xl">
        <MensajesProyecto proyectoId={String(proyecto.id)} soyEquipo />
      </div>
    </div>
  )
}
