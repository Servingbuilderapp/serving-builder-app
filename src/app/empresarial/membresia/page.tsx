import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MembresiaClient } from '@/components/empresarial/MembresiaClient'
import { asegurarMembresia, calcularAcceso } from '@/lib/empresarial/membresia'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Mi plan | Serving',
}

export default async function Pagina({ searchParams }: { searchParams: Promise<{ pago?: string }> }) {
  const { pago } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const fila = user ? await asegurarMembresia(user.id) : null

  if (!user || !fila) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino flex items-center justify-center px-5">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-extrabold">Inicia sesión para ver tu plan</h1>
          <p className="mt-3 text-ca-vino/80">Tu plan está ligado a tu cuenta.</p>
          <Link href="/empresarial" className="mt-6 inline-block underline">
            Volver
          </Link>
        </div>
      </main>
    )
  }

  const acceso = calcularAcceso(fila)
  return (
    <MembresiaClient
      membresiaId={fila.id}
      plan={acceso.plan}
      activo={acceso.activo}
      diasRestantes={acceso.diasRestantes}
      enPeriodoInicial={acceso.enPeriodoInicial}
      accesoHasta={fila.acceso_hasta}
      pagoEnProceso={pago === 'en_proceso'}
    />
  )
}
