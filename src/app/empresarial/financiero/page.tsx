import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FinancieroClient } from '@/components/empresarial/FinancieroClient'
import type { Condicion } from '@/lib/empresarial/formulacion'
import { financieroVacio, type Financiero, type ItemFinanciero, type TipoItem } from '@/lib/empresarial/financiero'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Financiero básico | Serving',
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

const s = (x: unknown) => (x === null || x === undefined ? '' : String(x))

/**
 * Financiero básico: inversión, costos y ventas del proyecto, con resultados calculados.
 * Si no hay nada guardado, copia (sin inventar) el precio y el costo por unidad del estudio de mercado.
 * Lee con la sesión de la persona: solo ve lo suyo.
 */
export default async function FinancieroPage({ searchParams }: { searchParams: Promise<{ proyecto?: string }> }) {
  const { proyecto: proyectoId } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/empresarial')

  if (!proyectoId) return mensaje('Falta el proyecto', 'Entra desde tu proyecto para hacer el financiero.')

  const { data: proyecto } = await supabase.from('sfpe_proyectos').select('id, nombre, moneda').eq('id', proyectoId).maybeSingle()
  if (!proyecto) return mensaje('No encontramos ese proyecto', 'Revisa que hayas entrado con tu cuenta.')

  // Referencias del estudio de mercado.
  const { data: precio } = await supabase
    .from('sfpe_mercado_precio')
    .select('precio, unidad_precio, costo_unitario')
    .eq('proyecto_id', proyecto.id)
    .maybeSingle()
  const { data: tam } = await supabase
    .from('sfpe_mercado_tamano')
    .select('som_valor, gasto_valor, capacidad_clientes')
    .eq('proyecto_id', proyecto.id)
    .maybeSingle()
  const somValor = tam?.som_valor === null || tam?.som_valor === undefined ? null : Number(tam.som_valor)
  const gasto = tam?.gasto_valor === null || tam?.gasto_valor === undefined ? null : Number(tam.gasto_valor)
  const somAnual = somValor !== null && gasto !== null ? somValor * gasto : null

  const { data: g } = await supabase.from('sfpe_financiero').select('*').eq('proyecto_id', proyecto.id).maybeSingle()
  const { data: it } = await supabase
    .from('sfpe_financiero_items')
    .select('id, tipo, concepto, categoria, valor, fuente, condicion')
    .eq('proyecto_id', proyecto.id)
    .order('orden', { ascending: true })

  let inicial: Financiero = financieroVacio()
  if (g) {
    inicial = {
      precio_unitario: s(g.precio_unitario),
      costo_variable_unitario: s(g.costo_variable_unitario),
      unidades_mes: s(g.unidades_mes),
      unidades_fuente: s(g.unidades_fuente),
      unidades_condicion: ((g.unidades_condicion as Condicion | null) ?? 'supuesto') as Condicion,
      aporte_propio: s(g.aporte_propio),
    }
  } else if (precio) {
    inicial = { ...inicial, precio_unitario: s(precio.precio), costo_variable_unitario: s(precio.costo_unitario) }
  }
  const items: ItemFinanciero[] = (it ?? []).map((x) => ({
    id: x.id as string,
    tipo: x.tipo as TipoItem,
    concepto: s(x.concepto),
    categoria: s(x.categoria) || 'otro',
    valor: s(x.valor),
    fuente: s(x.fuente),
    condicion: x.condicion as Condicion,
  }))

  return (
    <FinancieroClient
      proyecto={{ id: proyecto.id as string, nombre: proyecto.nombre as string, moneda: proyecto.moneda as string | null }}
      inicial={inicial}
      itemsIniciales={items}
      yaGuardado={Boolean(g) || items.length > 0}
      copiadoDeMercado={!g && Boolean(precio)}
      referencia={{ somAnual, unidadPrecio: (precio?.unidad_precio as string | null) ?? '' }}
    />
  )
}
