import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CaminoClient } from '@/components/empresarial/CaminoClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Mi camino | Serving',
}

/** Pantalla de inicio de un proyecto: el camino completo y a dónde seguir. */
export default async function CaminoPage({ searchParams }: { searchParams: Promise<{ proyecto?: string }> }) {
  const { proyecto: proyectoId } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/empresarial')

  if (!proyectoId) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino flex items-center justify-center px-5">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-extrabold">Elige un proyecto</h1>
          <p className="mt-3 text-ca-vino/80">Entra desde “Mis proyectos” para ver tu camino.</p>
          <Link href="/empresarial" className="mt-6 inline-block underline">
            Ir a mis proyectos
          </Link>
        </div>
      </main>
    )
  }
  return <CaminoClient proyectoId={proyectoId} />
}
