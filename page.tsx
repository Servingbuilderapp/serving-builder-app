import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PropuestaClient } from '@/components/empresarial/PropuestaClient'
import type { Condicion } from '@/lib/empresarial/formulacion'
import type { NumeroGrupo } from '@/lib/empresarial/cliente'
import type { ItemProp, MapaGrupo, ParteProp } from '@/lib/empresarial/propuesta'
import { resultadoGrupo, type ItemCliente, type Parte } from '@/lib/empresarial/cliente'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Propuesta de Valor | Serving',
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

/** Propuesta de Valor: por grupo de clientes, qué alivias, qué das y por qué a ti. Se cruza con el Mapa del Cliente. */
export default async function PropuestaPage({ searchParams }: { searchParams: Promise<{ proyecto?: string }> }) {
  const { proyecto: proyectoId } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/empresarial')
  if (!proyectoId) return mensaje('Falta el proyecto', 'Entra desde “Mis proyectos”, abre tu proyecto y luego este paso.')

  const { data: proyecto } = await supabase.from('sfpe_proyectos').select('id, nombre').eq('id', proyectoId).maybeSingle()
  if (!proyecto) return mensaje('No encontramos ese proyecto', 'Revisa que hayas entrado con tu cuenta.')

  const [{ data: it }, { data: cl }] = await Promise.all([
    supabase.from('sfpe_propuesta_items').select('id, grupo, parte, texto, peso, fuente, condicion').eq('proyecto_id', proyecto.id).order('orden', { ascending: true }),
    supabase.from('sfpe_cliente_items').select('grupo, grupo_nombre, parte, texto, peso, fuente, condicion').eq('proyecto_id', proyecto.id).order('orden', { ascending: true }),
  ])

  const items: ItemProp[] = (it ?? []).map((x) => ({
    id: x.id as string,
    grupo: Number(x.grupo) as NumeroGrupo,
    parte: x.parte as ParteProp,
    texto: s(x.texto),
    peso: String(x.peso ?? 3),
    fuente: s(x.fuente),
    condicion: x.condicion as Condicion,
  }))

  // Mapa del Cliente (solo lectura): nombres de grupo, lo que necesitan, lo que les duele y la fuerza.
  const itemsCliente: ItemCliente[] = (cl ?? []).map((x, n) => ({
    id: `c-${n}`,
    grupo: Number(x.grupo) as NumeroGrupo,
    parte: x.parte as Parte,
    texto: s(x.texto),
    peso: String(x.peso ?? 3),
    fuente: s(x.fuente),
    condicion: x.condicion as Condicion,
  }))
  const grupos = Array.from(new Set(itemsCliente.map((i) => i.grupo))).sort() as NumeroGrupo[]
  const mapa: MapaGrupo[] = grupos.map((g) => {
    const nombre = s((cl ?? []).find((x) => Number(x.grupo) === g && s(x.grupo_nombre))?.grupo_nombre)
    const de = (p: Parte) => itemsCliente.filter((i) => i.grupo === g && i.parte === p).map((i) => ({ texto: i.texto, peso: Number(i.peso) || 3 }))
    return { grupo: g, nombre, necesita: de('necesita'), duele: de('duele'), fuerza: resultadoGrupo(itemsCliente, g).fuerza }
  })

  return <PropuestaClient proyecto={{ id: proyecto.id as string, nombre: proyecto.nombre as string }} itemsIniciales={items} mapa={mapa} yaGuardado={items.length > 0} />
}
