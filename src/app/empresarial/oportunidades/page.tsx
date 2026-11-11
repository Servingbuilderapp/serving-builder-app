import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OportunidadesClient } from '@/components/empresarial/OportunidadesClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Oportunidades | Serving',
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
 * Oportunidades de un proyecto empresarial.
 * Junta lo que salió del diagnóstico (lo que conviene fortalecer) con las oportunidades que la persona ya guardó.
 * Todo se lee con la sesión de la persona: solo ve lo suyo.
 */
export default async function OportunidadesPage({
  searchParams,
}: {
  searchParams: Promise<{ proyecto?: string }>
}) {
  const { proyecto: proyectoId } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/empresarial')

  if (!proyectoId) return mensaje('Falta el proyecto', 'Entra desde tu proyecto para ver tus oportunidades.')

  const { data: proyecto } = await supabase
    .from('sfpe_proyectos')
    .select('id, nombre, perfil_confirmado')
    .eq('id', proyectoId)
    .maybeSingle()

  if (!proyecto) return mensaje('No encontramos ese proyecto', 'Revisa que hayas entrado con tu cuenta.')

  const { data: hallazgos } = await supabase
    .from('sfpe_hallazgos')
    .select('id, dimension_id, tipo, descripcion, gravedad')
    .eq('proyecto_id', proyecto.id)
    .neq('estado', 'descartado')

  const dimensionIds = Array.from(
    new Set((hallazgos ?? []).map((h) => h.dimension_id).filter((x): x is string => Boolean(x))),
  )
  const { data: dimensiones } = dimensionIds.length
    ? await supabase.from('sfpe_diag_dimensiones').select('id, codigo, nombre').in('id', dimensionIds)
    : { data: [] }

  const { data: oportunidades } = await supabase
    .from('sfpe_oportunidades')
    .select(
      'id, hallazgo_id, nombre, descripcion, categoria, cliente_o_beneficiario, solucion_propuesta, valor_generado, sector, ubicacion, estado, puntaje_preliminar, creada_en',
    )
    .eq('proyecto_id', proyecto.id)
    .order('creada_en', { ascending: false })

  return (
    <OportunidadesClient
      proyecto={{ id: proyecto.id, nombre: proyecto.nombre, perfil: proyecto.perfil_confirmado as string | null }}
      hallazgos={hallazgos ?? []}
      dimensiones={dimensiones ?? []}
      oportunidadesIniciales={oportunidades ?? []}
    />
  )
}
