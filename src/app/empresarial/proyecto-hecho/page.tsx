import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProyectoHechoClient } from '@/components/empresarial/ProyectoHechoClient'
import { ProyectoHechoResultado, type MuestraVista } from '@/components/empresarial/ProyectoHechoResultado'
import { TRAMOS, type Tramo } from '@/lib/empresarial/proyectoHecho'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Que la IA formule mi proyecto | Serving',
  description: 'Sube tu documento o cuéntanos tu idea, responde unas preguntas básicas y la IA arma tu proyecto.',
}

/**
 * Sin ?proyecto: el formulario de entrada.
 * Con ?proyecto=ID: el adelanto gratis, el pago y, ya pagado, el documento completo.
 */
export default async function ProyectoHechoPage({ searchParams }: { searchParams: Promise<{ proyecto?: string; pago?: string }> }) {
  const { proyecto, pago } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/empresarial/proyecto-hecho')

  if (!proyecto) return <ProyectoHechoClient userId={user.id} />

  const { data: fila } = await supabase
    .from('sfpe_entrada')
    .select('proyecto_id, muestra, tramo, precio_base_cop, precio_total_cop, estado_pago, proyecto_final')
    .eq('proyecto_id', proyecto)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!fila) redirect('/empresarial/proyecto-hecho')

  const { data: p } = await supabase.from('sfpe_proyectos').select('nombre').eq('id', proyecto).maybeSingle()

  return (
    <ProyectoHechoResultado
      enProceso={pago === 'en_proceso'}
      e={{
        proyectoId: fila.proyecto_id as string,
        nombre: (p?.nombre as string | undefined) ?? 'Mi proyecto',
        muestra: (fila.muestra as MuestraVista | null) ?? null,
        tramoNombre: fila.tramo ? (TRAMOS[fila.tramo as Tramo]?.nombre ?? null) : null,
        precioBase: fila.precio_base_cop ? Number(fila.precio_base_cop) : null,
        precioTotal: fila.precio_total_cop ? Number(fila.precio_total_cop) : null,
        pagado: fila.estado_pago === 'pagado',
        documento: (fila.proyecto_final as string | null) ?? null,
      }}
    />
  )
}
