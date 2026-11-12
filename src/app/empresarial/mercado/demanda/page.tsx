import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DemandaClient } from '@/components/empresarial/DemandaClient'
import type { Condicion } from '@/lib/empresarial/formulacion'
import { tamanoVacio, type CampoDemanda, type Cifra, type Tamano } from '@/lib/empresarial/mercadoDemanda'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Demanda y tamaño del mercado | Serving',
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

/**
 * Estudio de mercado, pantalla 2: demanda y tamaño (TAM, SAM, SOM).
 * Lee con la sesión de la persona: solo ve lo suyo. No inventa cifras: lo que no esté guardado queda vacío.
 */
export default async function DemandaPage({ searchParams }: { searchParams: Promise<{ proyecto?: string }> }) {
  const { proyecto: proyectoId } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/empresarial')

  if (!proyectoId) return mensaje('Falta el proyecto', 'Entra desde tu proyecto para trabajar la demanda.')

  const { data: proyecto } = await supabase
    .from('sfpe_proyectos')
    .select('id, nombre, moneda')
    .eq('id', proyectoId)
    .maybeSingle()
  if (!proyecto) return mensaje('No encontramos ese proyecto', 'Revisa que hayas entrado con tu cuenta.')

  // Lo ya definido en la pantalla 1, como referencia (solo lectura).
  const { data: mercado } = await supabase
    .from('sfpe_mercado')
    .select('producto, cobertura, ubicacion')
    .eq('proyecto_id', proyecto.id)
    .maybeSingle()
  const { data: segmentos } = await supabase
    .from('sfpe_mercado_segmentos')
    .select('nombre')
    .eq('proyecto_id', proyecto.id)
    .order('orden', { ascending: true })

  const { data: g } = await supabase.from('sfpe_mercado_tamano').select('*').eq('proyecto_id', proyecto.id).maybeSingle()

  let inicial: Tamano = tamanoVacio()
  if (g) {
    const base = tamanoVacio()
    const s = (x: unknown) => (x === null || x === undefined ? '' : String(x))
    const cifra = (c: Cifra) => ({
      valor: s(g[`${c}_valor`]),
      fuente: s(g[`${c}_fuente`]),
      condicion: ((g[`${c}_condicion`] as Condicion | null) ?? base.cifras[c].condicion) as Condicion,
    })
    inicial = {
      ...base,
      cifras: { gasto: cifra('gasto'), tam: cifra('tam'), sam: cifra('sam'), som: cifra('som') },
      capacidad_clientes: s(g.capacidad_clientes),
      frecuencia_compra: s(g.frecuencia_compra),
      estacionalidad: s(g.estacionalidad),
      intencion_compra: s(g.intencion_compra),
      demanda_insatisfecha: s(g.demanda_insatisfecha),
      condiciones: (g.condiciones ?? {}) as Partial<Record<CampoDemanda, Condicion>>,
    }
  }

  return (
    <DemandaClient
      proyecto={{ id: proyecto.id as string, nombre: proyecto.nombre as string, moneda: proyecto.moneda as string | null }}
      inicial={inicial}
      yaGuardado={Boolean(g)}
      referencia={{
        producto: (mercado?.producto as string | null) ?? '',
        cobertura: (mercado?.cobertura as string | null) ?? '',
        ubicacion: (mercado?.ubicacion as string | null) ?? '',
        segmentos: (segmentos ?? []).map((x) => x.nombre as string),
      }}
    />
  )
}
