import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ValidarClient } from '@/components/empresarial/ValidarClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Validar oportunidades | Serving',
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
 * Validar una oportunidad: hipótesis, experimentos y evidencias.
 * Todo se lee con la sesión de la persona: solo ve lo suyo.
 */
export default async function ValidarPage({
  searchParams,
}: {
  searchParams: Promise<{ proyecto?: string; oportunidad?: string }>
}) {
  const { proyecto: proyectoId, oportunidad: oportunidadId } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/empresarial')

  if (!proyectoId) return mensaje('Falta el proyecto', 'Entra desde tu proyecto para validar tus oportunidades.')

  const { data: proyecto } = await supabase
    .from('sfpe_proyectos')
    .select('id, nombre')
    .eq('id', proyectoId)
    .maybeSingle()

  if (!proyecto) return mensaje('No encontramos ese proyecto', 'Revisa que hayas entrado con tu cuenta.')

  const { data: oportunidades } = await supabase
    .from('sfpe_oportunidades')
    .select('id, nombre, descripcion, cliente_o_beneficiario, solucion_propuesta, valor_generado, estado')
    .eq('proyecto_id', proyecto.id)
    .order('creada_en', { ascending: false })

  const { data: hipotesis } = await supabase
    .from('sfpe_hipotesis')
    .select('id, oportunidad_id, tipo, enunciado, importancia, riesgo_si_falsa, estado, fecha_limite, creada_en')
    .eq('proyecto_id', proyecto.id)
    .order('creada_en', { ascending: true })

  const { data: experimentos } = await supabase
    .from('sfpe_experimentos')
    .select(
      'id, hipotesis_id, tipo, objetivo, metodo, muestra, resultado, conclusion, declara_consentimiento, inicia_en, termina_en, creada_en',
    )
    .eq('proyecto_id', proyecto.id)
    .order('creada_en', { ascending: true })

  const { data: evidencias } = await supabase
    .from('sfpe_evidencias')
    .select('id, oportunidad_id, hipotesis_id, experimento_id, enlace, fuente, tipo, nivel, descripcion, estado_revision, creada_en')
    .eq('proyecto_id', proyecto.id)
    .not('hipotesis_id', 'is', null)
    .order('creada_en', { ascending: true })

  return (
    <ValidarClient
      proyecto={{ id: proyecto.id, nombre: proyecto.nombre }}
      oportunidadInicial={oportunidadId ?? null}
      oportunidades={oportunidades ?? []}
      hipotesisIniciales={(hipotesis ?? []) as never}
      experimentosIniciales={(experimentos ?? []) as never}
      evidenciasIniciales={(evidencias ?? []) as never}
    />
  )
}
