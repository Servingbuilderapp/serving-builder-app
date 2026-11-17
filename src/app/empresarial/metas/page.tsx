import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MetasClient } from '@/components/empresarial/MetasClient'
import type { Condicion } from '@/lib/empresarial/formulacion'
import type { NumeroGrupo } from '@/lib/empresarial/cliente'
import type { ItemMeta, ParteMeta } from '@/lib/empresarial/metas'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Tablero de Metas | Serving',
}

const mensaje = (titulo: string, texto: string) => (
  <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino flex items-center justify-center px-5">
    <div className="max-w-md text-center">
      <h1 className="text-2xl font-extrabold">{titulo}</h1>
      <p className="mt-3 text-ca-vino/80">{texto}</p>
      <Link href="/empresarial" className="mt-6 inline-block underline">
        Volver a mis proyectos
      </Link>
    </div>
  </main>
)

const s = (x: unknown) => (x === null || x === undefined ? '' : String(x).trim())

/** Tablero de Metas: qué quieres lograr a 3, 6 y 12 meses, cómo lo medirás y qué te puede frenar. */
export default async function MetasPage({ searchParams }: { searchParams: Promise<{ proyecto?: string }> }) {
  const { proyecto: proyectoId } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/empresarial')
  if (!proyectoId) return mensaje('Falta el proyecto', 'Entra desde “Mis proyectos”, abre tu proyecto y luego este paso.')

  const { data: proyecto } = await supabase.from('sfpe_proyectos').select('id, nombre').eq('id', proyectoId).maybeSingle()
  if (!proyecto) return mensaje('No encontramos ese proyecto', 'Revisa que hayas entrado con tu cuenta.')

  const { data: it } = await supabase.from('sfpe_metas_items').select('id, grupo, parte, texto, peso, fuente, condicion').eq('proyecto_id', proyecto.id).order('orden', { ascending: true })

  const items: ItemMeta[] = (it ?? []).map((x) => ({
    id: x.id as string,
    grupo: Number(x.grupo) as NumeroGrupo,
    parte: x.parte as ParteMeta,
    texto: s(x.texto),
    peso: String(x.peso ?? 3),
    fuente: s(x.fuente),
    condicion: x.condicion as Condicion,
  }))

  return <MetasClient proyecto={{ id: proyecto.id as string, nombre: proyecto.nombre as string }} itemsIniciales={items} yaGuardado={items.length > 0} />
}
