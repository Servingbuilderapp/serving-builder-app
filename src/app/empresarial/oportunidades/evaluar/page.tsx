import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EvaluarClient } from '@/components/empresarial/EvaluarClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Evaluar oportunidades | Serving',
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
 * Evaluar y comparar las oportunidades de un proyecto empresarial.
 * Todo se lee con la sesión de la persona: solo ve lo suyo.
 */
export default async function EvaluarPage({ searchParams }: { searchParams: Promise<{ proyecto?: string }> }) {
  const { proyecto: proyectoId } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/empresarial')

  if (!proyectoId) return mensaje('Falta el proyecto', 'Entra desde tu proyecto para evaluar tus oportunidades.')

  const { data: proyecto } = await supabase
    .from('sfpe_proyectos')
    .select('id, nombre')
    .eq('id', proyectoId)
    .maybeSingle()

  if (!proyecto) return mensaje('No encontramos ese proyecto', 'Revisa que hayas entrado con tu cuenta.')

  const { data: oportunidades } = await supabase
    .from('sfpe_oportunidades')
    .select('id, nombre, categoria, cliente_o_beneficiario, valor_generado, estado, puntaje_preliminar')
    .eq('proyecto_id', proyecto.id)
    .order('creada_en', { ascending: false })

  // Evaluaciones: se conservan todas (historial). Aquí se toma la más reciente de cada oportunidad.
  const { data: evaluaciones } = await supabase
    .from('sfpe_evaluaciones_oportunidad')
    .select('id, oportunidad_id, puntaje_total, evaluada_en')
    .eq('proyecto_id', proyecto.id)
    .order('evaluada_en', { ascending: false })

  const ultimaPorOportunidad = new Map<string, { id: string; oportunidad_id: string }>()
  for (const e of evaluaciones ?? []) {
    if (!ultimaPorOportunidad.has(e.oportunidad_id)) ultimaPorOportunidad.set(e.oportunidad_id, e)
  }
  const idsEvaluacion = Array.from(ultimaPorOportunidad.values()).map((e) => e.id)

  const { data: criterios } = idsEvaluacion.length
    ? await supabase
        .from('sfpe_evaluacion_criterios')
        .select('evaluacion_id, criterio, calificacion, justificacion')
        .in('evaluacion_id', idsEvaluacion)
    : { data: [] }

  const { data: decisiones } = await supabase
    .from('sfpe_decisiones')
    .select('id, oportunidad_id, decision, motivo, decidida_en')
    .eq('proyecto_id', proyecto.id)
    .order('decidida_en', { ascending: false })

  const evaluacionPorOportunidad: Record<
    string,
    { calificaciones: Record<string, number>; justificaciones: Record<string, string> }
  > = {}
  for (const [oportunidadId, ev] of ultimaPorOportunidad) {
    const calificaciones: Record<string, number> = {}
    const justificaciones: Record<string, string> = {}
    for (const c of criterios ?? []) {
      if (c.evaluacion_id !== ev.id) continue
      calificaciones[c.criterio] = c.calificacion
      if (c.justificacion) justificaciones[c.criterio] = c.justificacion
    }
    evaluacionPorOportunidad[oportunidadId] = { calificaciones, justificaciones }
  }

  return (
    <EvaluarClient
      proyecto={{ id: proyecto.id, nombre: proyecto.nombre }}
      oportunidadesIniciales={oportunidades ?? []}
      evaluacionesIniciales={evaluacionPorOportunidad}
      decisionesIniciales={decisiones ?? []}
    />
  )
}
