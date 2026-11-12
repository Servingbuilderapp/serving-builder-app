import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DofaClient, type Sugerencia } from '@/components/empresarial/DofaClient'
import type { Condicion } from '@/lib/empresarial/formulacion'
import type { ItemDofa, TipoDofa } from '@/lib/empresarial/dofa'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Análisis DOFA | Serving',
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
const corto = (x: string) => (x.length > 160 ? x.slice(0, 157) + '…' : x)

/**
 * Análisis DOFA: la persona escribe; el sistema calcula el balance y dibuja la posición.
 * Ofrece sugerencias tomadas de SU estudio de competencia (nunca inventadas); ella decide cuáles usar.
 */
export default async function DofaPage({ searchParams }: { searchParams: Promise<{ proyecto?: string }> }) {
  const { proyecto: proyectoId } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/empresarial')
  if (!proyectoId) return mensaje('Falta el proyecto', 'Entra desde tu proyecto para hacer el análisis DOFA.')

  const { data: proyecto } = await supabase.from('sfpe_proyectos').select('id, nombre').eq('id', proyectoId).maybeSingle()
  if (!proyecto) return mensaje('No encontramos ese proyecto', 'Revisa que hayas entrado con tu cuenta.')

  const { data: it } = await supabase
    .from('sfpe_dofa_items')
    .select('id, cuadrante, texto, impacto, fuente, condicion')
    .eq('proyecto_id', proyecto.id)
    .order('orden', { ascending: true })
  const items: ItemDofa[] = (it ?? []).map((x) => ({
    id: x.id as string,
    cuadrante: x.cuadrante as TipoDofa,
    texto: s(x.texto),
    impacto: s(x.impacto) || '3',
    fuente: s(x.fuente),
    condicion: x.condicion as Condicion,
  }))

  const { data: comps } = await supabase.from('sfpe_mercado_competidores').select('nombre, fortalezas, debilidades').eq('proyecto_id', proyecto.id)
  const sugerencias: Sugerencia[] = []
  for (const c of comps ?? []) {
    const nombre = s(c.nombre) || 'Un competidor'
    if (s(c.debilidades)) sugerencias.push({ cuadrante: 'oportunidad', texto: corto(`${nombre} tiene este punto débil: ${s(c.debilidades)}`) })
    if (s(c.fortalezas)) sugerencias.push({ cuadrante: 'amenaza', texto: corto(`${nombre} tiene esta fortaleza: ${s(c.fortalezas)}`) })
  }

  // Lo que la persona escribió en el Radar del Entorno se ofrece como oportunidad (ayuda) o amenaza (perjudica).
  const { data: ent } = await supabase.from('sfpe_entorno_items').select('texto, efecto').eq('proyecto_id', proyecto.id).order('orden', { ascending: true })
  for (const e of ent ?? []) {
    if (s(e.texto)) sugerencias.push({ cuadrante: e.efecto === 'perjudica' ? 'amenaza' : 'oportunidad', texto: corto(s(e.texto)), origen: 'Radar del Entorno' })
  }

  // Lo que la persona escribió en el Mapa de Presiones: la protección se ofrece como oportunidad y la presión como amenaza.
  const { data: pre } = await supabase.from('sfpe_presiones_items').select('texto, efecto').eq('proyecto_id', proyecto.id).order('orden', { ascending: true })
  for (const e of pre ?? []) {
    if (s(e.texto)) sugerencias.push({ cuadrante: e.efecto === 'presiona' ? 'amenaza' : 'oportunidad', texto: corto(s(e.texto)), origen: 'Mapa de Presiones' })
  }

  return <DofaClient proyecto={{ id: proyecto.id as string, nombre: proyecto.nombre as string }} itemsIniciales={items} yaGuardado={items.length > 0} sugerencias={sugerencias} />
}
