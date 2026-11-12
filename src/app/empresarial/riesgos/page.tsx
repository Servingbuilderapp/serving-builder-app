import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RiesgosClient } from '@/components/empresarial/RiesgosClient'
import type { Condicion } from '@/lib/empresarial/formulacion'
import type { Categoria, ItemRiesgo, Respuesta } from '@/lib/empresarial/riesgos'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Termómetro de Riesgos | Serving',
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

/** Termómetro de Riesgos: la persona escribe sus riesgos, su probabilidad e impacto; el sistema calcula y dibuja el mapa de calor. */
export default async function RiesgosPage({ searchParams }: { searchParams: Promise<{ proyecto?: string }> }) {
  const { proyecto: proyectoId } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/empresarial')
  if (!proyectoId) return mensaje('Falta el proyecto', 'Entra desde tu proyecto para hacer el Termómetro de Riesgos.')

  const { data: proyecto } = await supabase.from('sfpe_proyectos').select('id, nombre').eq('id', proyectoId).maybeSingle()
  if (!proyecto) return mensaje('No encontramos ese proyecto', 'Revisa que hayas entrado con tu cuenta.')

  const { data: it } = await supabase
    .from('sfpe_riesgos_items')
    .select('id, categoria, texto, probabilidad, impacto, respuesta, plan, responsable, fuente, condicion')
    .eq('proyecto_id', proyecto.id)
    .order('orden', { ascending: true })
  const items: ItemRiesgo[] = (it ?? []).map((x) => ({
    id: x.id as string,
    categoria: x.categoria as Categoria,
    texto: s(x.texto),
    probabilidad: String(x.probabilidad ?? 3),
    impacto: String(x.impacto ?? 3),
    respuesta: (x.respuesta ?? '') as Respuesta | '',
    plan: s(x.plan),
    responsable: s(x.responsable),
    fuente: s(x.fuente),
    condicion: x.condicion as Condicion,
  }))

  return <RiesgosClient proyecto={{ id: proyecto.id as string, nombre: proyecto.nombre as string }} itemsIniciales={items} yaGuardado={items.length > 0} />
}
