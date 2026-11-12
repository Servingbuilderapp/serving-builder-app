import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TecnicoClient } from '@/components/empresarial/TecnicoClient'
import type { Condicion } from '@/lib/empresarial/formulacion'
import { tecnicoVacio, type CampoTecnico, type Especificacion, type Paso, type Tecnico } from '@/lib/empresarial/tecnico'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Estudio técnico | Serving',
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
 * Estudio técnico, pantalla 1: solución y proceso.
 * Lee con la sesión de la persona: solo ve lo suyo. No inventa valores técnicos.
 */
export default async function TecnicoPage({ searchParams }: { searchParams: Promise<{ proyecto?: string }> }) {
  const { proyecto: proyectoId } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/empresarial')

  if (!proyectoId) return mensaje('Falta el proyecto', 'Entra desde tu proyecto para hacer el estudio técnico.')

  const { data: proyecto } = await supabase.from('sfpe_proyectos').select('id, nombre').eq('id', proyectoId).maybeSingle()
  if (!proyecto) return mensaje('No encontramos ese proyecto', 'Revisa que hayas entrado con tu cuenta.')

  // Referencias del estudio de mercado (solo lectura).
  const { data: mercado } = await supabase.from('sfpe_mercado').select('producto').eq('proyecto_id', proyecto.id).maybeSingle()
  const { data: precio } = await supabase.from('sfpe_mercado_precio').select('unidad_precio').eq('proyecto_id', proyecto.id).maybeSingle()

  const { data: g } = await supabase.from('sfpe_tecnico').select('*').eq('proyecto_id', proyecto.id).maybeSingle()
  const { data: sp } = await supabase
    .from('sfpe_tecnico_specs')
    .select('id, caracteristica, especificacion, unidad, criterio, condicion')
    .eq('proyecto_id', proyecto.id)
    .order('orden', { ascending: true })
  const { data: ps } = await supabase
    .from('sfpe_tecnico_pasos')
    .select('id, nombre, responsable, duracion_min, entrada, salida, recursos, condicion')
    .eq('proyecto_id', proyecto.id)
    .order('orden', { ascending: true })

  const inicial: Tecnico = g
    ? {
        tipo_solucion: s(g.tipo_solucion),
        nombre_solucion: s(g.nombre_solucion),
        descripcion: s(g.descripcion),
        unidad_comercializacion: s(g.unidad_comercializacion),
        estado_solucion: s(g.estado_solucion),
        calidad_esperada: s(g.calidad_esperada),
        restricciones: s(g.restricciones),
        condiciones: (g.condiciones ?? {}) as Partial<Record<CampoTecnico, Condicion>>,
      }
    : tecnicoVacio()
  const specs: Especificacion[] = (sp ?? []).map((x) => ({
    id: x.id as string,
    caracteristica: s(x.caracteristica),
    especificacion: s(x.especificacion),
    unidad: s(x.unidad),
    criterio: s(x.criterio),
    condicion: x.condicion as Condicion,
  }))
  const pasos: Paso[] = (ps ?? []).map((x) => ({
    id: x.id as string,
    nombre: s(x.nombre),
    responsable: s(x.responsable),
    duracion_min: s(x.duracion_min),
    entrada: s(x.entrada),
    salida: s(x.salida),
    recursos: s(x.recursos),
    condicion: x.condicion as Condicion,
  }))

  return (
    <TecnicoClient
      proyecto={{ id: proyecto.id as string, nombre: proyecto.nombre as string }}
      inicial={inicial}
      specsIniciales={specs}
      pasosIniciales={pasos}
      yaGuardado={Boolean(g) || specs.length > 0 || pasos.length > 0}
      referencia={{ producto: (mercado?.producto as string | null) ?? '', unidadPrecio: (precio?.unidad_precio as string | null) ?? '' }}
    />
  )
}
