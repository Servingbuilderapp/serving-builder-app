import React from 'react'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { FormularioIngresoSocio } from '@/components/marca-blanca/FormularioIngresoSocio'

export const dynamic = 'force-dynamic'

/**
 * Puerta de entrada pública de un socio de marca blanca. Cada socio
 * comparte esta misma dirección con su propio slug (ej. /mb/mi-gremio)
 * con sus clientes.
 *
 * Nunca muestra nada de Serving (ni su nombre, ni sus precios en pesos):
 * solo el nombre del socio y los dos paquetes de marca blanca. El pago de
 * verdad ya lo hizo el cliente con el socio, por fuera de esta pantalla —
 * aquí solo se recogen los datos para arrancar el proyecto.
 */
export default async function PortalSocioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )

  const { data: socio } = await supabaseAdmin
    .from('socios')
    .select('id, nombre, marca, activo, mantenimiento_pagado_hasta')
    .eq('slug', slug)
    .maybeSingle<{ id: string; nombre: string; marca: string | null; activo: boolean | null; mantenimiento_pagado_hasta: string | null }>()

  const hoy = new Date().toISOString().slice(0, 10)
  const activo = !!socio && !!socio.activo && !!socio.mantenimiento_pagado_hasta && socio.mantenimiento_pagado_hasta >= hoy

  if (!socio || !activo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7FC] p-6">
        <div className="max-w-md w-full rounded-2xl border border-[#0F172A]/10 bg-white p-8 text-center space-y-2">
          <h1 className="text-lg font-bold text-[#0F172A]">Este portal no está activo</h1>
          <p className="text-sm text-[#0F172A]/60">
            Contacta a quien te compartió este enlace para más información.
          </p>
        </div>
      </div>
    )
  }

  return <FormularioIngresoSocio slug={slug} nombreSocio={socio.marca || socio.nombre} />
}
