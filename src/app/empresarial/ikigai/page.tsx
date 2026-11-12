import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { IkigaiClient } from '@/components/empresarial/IkigaiClient'
import type { Condicion } from '@/lib/empresarial/formulacion'
import type { ItemIkigai } from '@/lib/empresarial/ikigai'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Ikigai del proyecto | Serving',
}

const mensaje = (titulo: string, texto: string) => (
  <main className="min-h-screen bg-gradient-to-b from-[#2E0E1A] via-[#3B1727] to-[#54142B] text-[#F3E7DC] flex items-center justify-center px-5">
    <div className="max-w-md text-center">
      <h1 className="text-2xl font-extrabold">{titulo}</h1>
      <p className="mt-3 text-[#F3E7DC]/80">{texto}</p>
      <Link href="/empresarial" className="mt-6 inline-block underline">
        Volver
      </Link>
    </div>
  </main>
)

const s = (x: unknown) => (x === null || x === undefined ? '' : String(x).trim())

/**
 * Ikigai del proyecto: la persona escribe ideas y marca cuáles de cuatro preguntas cumple cada una.
 * Lee con la sesión de la persona: solo ve lo suyo.
 */
export default async function IkigaiPage({ searchParams }: { searchParams: Promise<{ proyecto?: string }> }) {
  const { proyecto: proyectoId } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/empresarial')
  if (!proyectoId) return mensaje('Falta el proyecto', 'Entra desde tu proyecto para hacer el Ikigai.')

  const { data: proyecto } = await supabase.from('sfpe_proyectos').select('id, nombre').eq('id', proyectoId).maybeSingle()
  if (!proyecto) return mensaje('No encontramos ese proyecto', 'Revisa que hayas entrado con tu cuenta.')

  const { data: it } = await supabase
    .from('sfpe_ikigai_items')
    .select('id, texto, ama, bueno, necesita, pagan, fuente, condicion')
    .eq('proyecto_id', proyecto.id)
    .order('orden', { ascending: true })
  const items: ItemIkigai[] = (it ?? []).map((x) => ({
    id: x.id as string,
    texto: s(x.texto),
    ama: Boolean(x.ama),
    bueno: Boolean(x.bueno),
    necesita: Boolean(x.necesita),
    pagan: Boolean(x.pagan),
    fuente: s(x.fuente),
    condicion: x.condicion as Condicion,
  }))

  return <IkigaiClient proyecto={{ id: proyecto.id as string, nombre: proyecto.nombre as string }} itemsIniciales={items} yaGuardado={items.length > 0} />
}
