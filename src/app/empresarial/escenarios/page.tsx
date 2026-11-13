import React from 'react'
import Link from 'next/link'
import { EscenariosClient } from '@/components/empresarial/EscenariosClient'
import { cargarContexto } from '@/lib/empresarial/calculadorasServidor'
import { createClient } from '@/lib/supabase/server'
import { completarEscenarios, escenariosDesdeFinanciero, type Escenarios } from '@/lib/empresarial/escenarios'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Tablero de escenarios | Serving',
}

const mensaje = (titulo: string, texto: string) => (
  <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino flex items-center justify-center px-5">
    <div className="max-w-md text-center">
      <h1 className="text-2xl font-extrabold">{titulo}</h1>
      <p className="mt-3 text-ca-vino/80">{texto}</p>
      <Link href="/empresarial" className="mt-6 inline-block underline">
        Volver
      </Link>
    </div>
  </main>
)

export default async function Pagina({ searchParams }: { searchParams: Promise<{ proyecto?: string }> }) {
  const { proyecto: proyectoId } = await searchParams
  if (!proyectoId) return mensaje('Falta el proyecto', 'Entra desde tu proyecto para usar el tablero.')
  const ctx = await cargarContexto(proyectoId, 'flujo_caja')
  if (!ctx.proyecto) return mensaje('No encontramos ese proyecto', 'Revisa que hayas entrado con tu cuenta.')

  const supabase = await createClient()
  const { data: fila } = await supabase.from('sfpe_escenarios').select('datos').eq('proyecto_id', ctx.proyecto.id).maybeSingle()
  const guardado = (fila?.datos ?? null) as Partial<Escenarios> | null
  const hayGuardado = Boolean(guardado && Object.keys(guardado).length > 0)

  const inicial: Escenarios = hayGuardado ? completarEscenarios(guardado) : ctx.precarga ? escenariosDesdeFinanciero(ctx.precarga) : completarEscenarios(null)

  return <EscenariosClient proyecto={ctx.proyecto} inicial={inicial} yaGuardado={hayGuardado} copiadoDeFinanciero={!hayGuardado && Boolean(ctx.precarga)} />
}
