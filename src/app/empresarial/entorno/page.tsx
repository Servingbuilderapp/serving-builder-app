import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EntornoClient } from '@/components/empresarial/EntornoClient'
import type { Condicion } from '@/lib/empresarial/formulacion'
import type { Efecto, Factor, ItemEntorno } from '@/lib/empresarial/entorno'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Radar del Entorno | Serving',
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

const s = (x: unknown) => (x === null || x === undefined ? '' : String(x).trim())

/** Radar del Entorno: la persona escribe lo de afuera; el sistema suma pesos y dibuja el radar. */
export default async function EntornoPage({ searchParams }: { searchParams: Promise<{ proyecto?: string }> }) {
  const { proyecto: proyectoId } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/empresarial')
  if (!proyectoId) return mensaje('Falta el proyecto', 'Entra desde tu proyecto para hacer el Radar del Entorno.')

  const { data: proyecto } = await supabase.from('sfpe_proyectos').select('id, nombre').eq('id', proyectoId).maybeSingle()
  if (!proyecto) return mensaje('No encontramos ese proyecto', 'Revisa que hayas entrado con tu cuenta.')

  const { data: it } = await supabase
    .from('sfpe_entorno_items')
    .select('id, factor, texto, efecto, peso, fuente, condicion')
    .eq('proyecto_id', proyecto.id)
    .order('orden', { ascending: true })
  const items: ItemEntorno[] = (it ?? []).map((x) => ({
    id: x.id as string,
    factor: x.factor as Factor,
    texto: s(x.texto),
    efecto: x.efecto as Efecto,
    peso: String(x.peso ?? 3),
    fuente: s(x.fuente),
    condicion: x.condicion as Condicion,
  }))

  return <EntornoClient proyecto={{ id: proyecto.id as string, nombre: proyecto.nombre as string }} itemsIniciales={items} yaGuardado={items.length > 0} />
}
