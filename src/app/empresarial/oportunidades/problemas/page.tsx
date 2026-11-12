import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProblemasClient } from '@/components/empresarial/ProblemasClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Problemas | Serving',
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

/**
 * Problemas de un proyecto empresarial y las oportunidades que se relacionan con cada uno.
 * Todo se lee con la sesión de la persona: solo ve lo suyo.
 */
export default async function ProblemasPage({ searchParams }: { searchParams: Promise<{ proyecto?: string }> }) {
  const { proyecto: proyectoId } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/empresarial')

  if (!proyectoId) return mensaje('Falta el proyecto', 'Entra desde tu proyecto para ver tus problemas.')

  const { data: proyecto } = await supabase
    .from('sfpe_proyectos')
    .select('id, nombre')
    .eq('id', proyectoId)
    .maybeSingle()

  if (!proyecto) return mensaje('No encontramos ese proyecto', 'Revisa que hayas entrado con tu cuenta.')

  const { data: problemas } = await supabase
    .from('sfpe_problemas')
    .select('id, titulo, descripcion, afectados, ubicacion, frecuencia, consecuencias, causas, nivel_certeza, hallazgo_id, creada_en')
    .eq('proyecto_id', proyecto.id)
    .order('creada_en', { ascending: false })

  const { data: oportunidades } = await supabase
    .from('sfpe_oportunidades')
    .select('id, nombre, problema_id')
    .eq('proyecto_id', proyecto.id)
    .order('creada_en', { ascending: false })

  return (
    <ProblemasClient
      proyecto={{ id: proyecto.id, nombre: proyecto.nombre }}
      problemasIniciales={(problemas ?? []).map((p) => ({
        ...p,
        causas: Array.isArray(p.causas) ? (p.causas as unknown[]).filter((c): c is string => typeof c === 'string') : [],
      }))}
      oportunidadesIniciales={oportunidades ?? []}
    />
  )
}
