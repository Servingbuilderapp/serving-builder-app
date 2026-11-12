import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CompetenciaClient } from '@/components/empresarial/CompetenciaClient'
import type { Condicion } from '@/lib/empresarial/formulacion'
import { precioVacio, type Canal, type CampoPrecio, type Competidor, type Precio } from '@/lib/empresarial/mercadoCompetencia'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Competencia, precios y canales | Serving',
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
 * Estudio de mercado, pantalla 3: competencia, precios y canales.
 * Lee con la sesión de la persona: solo ve lo suyo. No inventa competidores ni precios.
 */
export default async function CompetenciaPage({ searchParams }: { searchParams: Promise<{ proyecto?: string }> }) {
  const { proyecto: proyectoId } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/empresarial')

  if (!proyectoId) return mensaje('Falta el proyecto', 'Entra desde tu proyecto para trabajar la competencia.')

  const { data: proyecto } = await supabase.from('sfpe_proyectos').select('id, nombre, moneda').eq('id', proyectoId).maybeSingle()
  if (!proyecto) return mensaje('No encontramos ese proyecto', 'Revisa que hayas entrado con tu cuenta.')

  const { data: mercado } = await supabase.from('sfpe_mercado').select('producto').eq('proyecto_id', proyecto.id).maybeSingle()

  const { data: p } = await supabase.from('sfpe_mercado_precio').select('*').eq('proyecto_id', proyecto.id).maybeSingle()
  const { data: cs } = await supabase
    .from('sfpe_mercado_competidores')
    .select('id, nombre, tipo, ubicacion, producto, precio, unidad_precio, fortalezas, debilidades, fuente, fecha_consulta, condicion')
    .eq('proyecto_id', proyecto.id)
    .order('orden', { ascending: true })
  const { data: ch } = await supabase
    .from('sfpe_mercado_canales')
    .select('id, tipo, descripcion, costo_adquisicion, conversion, condicion')
    .eq('proyecto_id', proyecto.id)
    .order('orden', { ascending: true })

  const precio: Precio = p
    ? {
        precio: s(p.precio),
        unidad_precio: s(p.unidad_precio),
        costo_unitario: s(p.costo_unitario),
        metodo: s(p.metodo),
        justificacion: s(p.justificacion),
        disposicion_pago: s(p.disposicion_pago),
        condiciones: (p.condiciones ?? {}) as Partial<Record<CampoPrecio, Condicion>>,
      }
    : precioVacio()
  const competidores: Competidor[] = (cs ?? []).map((c) => ({
    id: c.id as string,
    nombre: s(c.nombre),
    tipo: s(c.tipo) || 'directo',
    ubicacion: s(c.ubicacion),
    producto: s(c.producto),
    precio: s(c.precio),
    unidad_precio: s(c.unidad_precio),
    fortalezas: s(c.fortalezas),
    debilidades: s(c.debilidades),
    fuente: s(c.fuente),
    fecha_consulta: s(c.fecha_consulta),
    condicion: c.condicion as Condicion,
  }))
  const canales: Canal[] = (ch ?? []).map((c) => ({
    id: c.id as string,
    tipo: s(c.tipo) || 'otro',
    descripcion: s(c.descripcion),
    costo_adquisicion: s(c.costo_adquisicion),
    conversion: s(c.conversion),
    condicion: c.condicion as Condicion,
  }))

  return (
    <CompetenciaClient
      proyecto={{ id: proyecto.id as string, nombre: proyecto.nombre as string, moneda: proyecto.moneda as string | null }}
      precioInicial={precio}
      competidoresIniciales={competidores}
      canalesIniciales={canales}
      yaGuardado={Boolean(p) || competidores.length > 0 || canales.length > 0}
      producto={(mercado?.producto as string | null) ?? ''}
    />
  )
}
