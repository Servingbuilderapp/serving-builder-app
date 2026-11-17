import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClienteClient } from '@/components/empresarial/ClienteClient'
import type { Condicion } from '@/lib/empresarial/formulacion'
import { nombresVacios, type ItemCliente, type NumeroGrupo, type Parte } from '@/lib/empresarial/cliente'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Mapa del Cliente | Serving',
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

/** Mapa del Cliente: la persona describe hasta tres grupos de clientes; el sistema calcula las barras. */
export default async function ClientePage({ searchParams }: { searchParams: Promise<{ proyecto?: string }> }) {
  const { proyecto: proyectoId } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/empresarial')
  if (!proyectoId) return mensaje('Falta el proyecto', 'Entra desde “Mis proyectos”, abre tu proyecto y luego este paso.')

  const { data: proyecto } = await supabase.from('sfpe_proyectos').select('id, nombre').eq('id', proyectoId).maybeSingle()
  if (!proyecto) return mensaje('No encontramos ese proyecto', 'Revisa que hayas entrado con tu cuenta.')

  const { data: it } = await supabase
    .from('sfpe_cliente_items')
    .select('id, grupo, grupo_nombre, parte, texto, peso, fuente, condicion')
    .eq('proyecto_id', proyecto.id)
    .order('orden', { ascending: true })

  const nombres = nombresVacios()
  const items: ItemCliente[] = (it ?? []).map((x) => {
    const g = Number(x.grupo) as NumeroGrupo
    if (s(x.grupo_nombre) && !nombres[g]) nombres[g] = s(x.grupo_nombre)
    return {
      id: x.id as string,
      grupo: g,
      parte: x.parte as Parte,
      texto: s(x.texto),
      peso: String(x.peso ?? 3),
      fuente: s(x.fuente),
      condicion: x.condicion as Condicion,
    }
  })

  return <ClienteClient proyecto={{ id: proyecto.id as string, nombre: proyecto.nombre as string }} itemsIniciales={items} nombresIniciales={nombres} yaGuardado={items.length > 0} />
}
