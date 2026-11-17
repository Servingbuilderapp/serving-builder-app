import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { asegurarMembresia, calcularAcceso } from '@/lib/empresarial/membresia'
import { HerramientasClient } from '@/components/empresarial/HerramientasClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Mis herramientas | Serving',
}

/** Catálogo de las 29 matrices: cuáles incluye el plan de la persona, cuáles puede abrir y cuáles vienen pronto. */
export default async function HerramientasPage({ searchParams }: { searchParams: Promise<{ proyecto?: string }> }) {
  const { proyecto: proyectoId } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/empresarial')
  const fila = await asegurarMembresia(user.id)
  if (!fila) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino flex items-center justify-center px-5">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-extrabold">No pudimos leer tu plan</h1>
          <p className="mt-3 text-ca-vino/80">Recarga la página en un momento.</p>
          <Link href="/empresarial" className="mt-6 inline-block underline">
            Volver a mis proyectos
          </Link>
        </div>
      </main>
    )
  }
  const acceso = calcularAcceso(fila)
  return <HerramientasClient proyectoId={proyectoId ?? null} activo={acceso.activo} plan={acceso.plan} diasRestantes={acceso.diasRestantes} />
}
