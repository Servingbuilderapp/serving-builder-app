import React from 'react'
import { leerSocioPortal, estadoPortal } from '@/lib/sociosGratis'
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

  const socio = await leerSocioPortal(slug)
  const portal = socio ? await estadoPortal(socio) : null
  const activo = !!portal?.abierto

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

  return (
    <FormularioIngresoSocio
      slug={slug}
      nombreSocio={socio.marca || socio.nombre}
      logoUrl={socio.logo_url}
      colorPrimario={socio.color_primario}
      gratis={portal?.gratis === true}
    />
  )
}
