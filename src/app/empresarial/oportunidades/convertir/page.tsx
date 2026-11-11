import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ConvertirClient } from '@/components/empresarial/ConvertirClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Pasar a proyecto | Serving',
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
 * Convertir oportunidades en proyectos.
 * Todo se lee con la sesión de la persona: solo ve lo suyo.
 */
export default async function ConvertirPage({ searchParams }: { searchParams: Promise<{ proyecto?: string }> }) {
  const { proyecto: proyectoId } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/empresarial')

  if (!proyectoId) return mensaje('Falta el proyecto', 'Entra desde tu proyecto para pasar una oportunidad a proyecto.')

  const { data: proyecto } = await supabase
    .from('sfpe_proyectos')
    .select('id, nombre, perfil_sugerido, perfil_confirmado, pais, moneda, profundidad, contrato_proyecto_id')
    .eq('id', proyectoId)
    .maybeSingle()

  if (!proyecto) return mensaje('No encontramos ese proyecto', 'Revisa que hayas entrado con tu cuenta.')

  const { data: oportunidades } = await supabase
    .from('sfpe_oportunidades')
    .select(
      'id, nombre, categoria, descripcion, cliente_o_beneficiario, solucion_propuesta, valor_generado, estado, proyecto_derivado_id',
    )
    .eq('proyecto_id', proyecto.id)
    .order('creada_en', { ascending: false })

  const { data: hipotesis } = await supabase
    .from('sfpe_hipotesis')
    .select('oportunidad_id, tipo, estado')
    .eq('proyecto_id', proyecto.id)

  // Evaluaciones: se conservan todas; aquí se toma la más reciente de cada oportunidad.
  const { data: evaluaciones } = await supabase
    .from('sfpe_evaluaciones_oportunidad')
    .select('oportunidad_id, puntaje_total, evaluada_en')
    .eq('proyecto_id', proyecto.id)
    .order('evaluada_en', { ascending: false })
  const puntajes: Record<string, number | null> = {}
  for (const e of evaluaciones ?? []) {
    const id = e.oportunidad_id as string
    if (!(id in puntajes)) puntajes[id] = e.puntaje_total === null ? null : Number(e.puntaje_total)
  }

  return (
    <ConvertirClient
      userId={user.id}
      proyecto={{
        id: proyecto.id,
        nombre: proyecto.nombre,
        perfil_sugerido: proyecto.perfil_sugerido as string | null,
        perfil_confirmado: proyecto.perfil_confirmado as string | null,
        pais: proyecto.pais as string | null,
        moneda: proyecto.moneda as string | null,
        profundidad: proyecto.profundidad as string | null,
        contrato_proyecto_id: proyecto.contrato_proyecto_id as string | null,
      }}
      oportunidadesIniciales={oportunidades ?? []}
      hipotesis={(hipotesis ?? []).map((h) => ({
        oportunidad_id: h.oportunidad_id as string,
        tipo: h.tipo as string,
        estado: h.estado as string,
      }))}
      puntajes={puntajes}
    />
  )
}
