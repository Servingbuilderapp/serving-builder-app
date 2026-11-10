import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DiagnosticoEmpresarialClient } from '@/components/empresarial/DiagnosticoEmpresarialClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Diagnóstico empresarial | Serving',
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
 * Diagnóstico empresarial de un proyecto (perfiles A, C y D).
 * El perfil B no tiene puntaje: va a su ruta de descubrimiento.
 * Carga el banco de preguntas y lo que la persona ya respondió, y se lo pasa a la pantalla.
 * Todo se lee con la sesión de la persona: solo ve lo suyo.
 */
export default async function DiagnosticoEmpresarialPage({
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

  if (!proyectoId) return mensaje('Falta el proyecto', 'Entra desde tu proyecto para empezar el diagnóstico.')

  const { data: proyecto } = await supabase
    .from('sfpe_proyectos')
    .select('id, nombre, perfil_confirmado')
    .eq('id', proyectoId)
    .maybeSingle()

  if (!proyecto) return mensaje('No encontramos ese proyecto', 'Revisa que hayas entrado con tu cuenta.')

  const perfil = proyecto.perfil_confirmado as string | null
  if (perfil === 'B') redirect(`/empresarial/descubrimiento?proyecto=${proyecto.id}`)
  if (perfil !== 'A' && perfil !== 'C' && perfil !== 'D') {
    return mensaje(
      'Tu diagnóstico se activa muy pronto',
      'Estamos terminando las preguntas para tu punto de partida. Tu proyecto ya quedó guardado.',
    )
  }

  const { data: plantilla } = await supabase
    .from('sfpe_diag_plantillas')
    .select('id, metodologia_id')
    .eq('perfil', perfil)
    .eq('version', '1.0')
    .eq('estado', 'Activa')
    .maybeSingle()

  if (!plantilla) return mensaje('Diagnóstico no disponible', 'Todavía no está cargado el banco de preguntas.')

  const { data: dimensiones } = await supabase
    .from('sfpe_diag_dimensiones')
    .select('id, codigo, nombre, descripcion, peso, orden')
    .eq('plantilla_id', plantilla.id)
    .order('orden')

  const dimensionIds = (dimensiones ?? []).map((d) => d.id)
  const { data: preguntas } = await supabase
    .from('sfpe_diag_preguntas')
    .select('id, dimension_id, codigo, texto, ayuda, tipo, anclajes, peso, orden')
    .in('dimension_id', dimensionIds)
    .eq('activa', true)
    .order('orden')

  // La sesión más reciente de este proyecto con esta plantilla
  const { data: sesion } = await supabase
    .from('sfpe_diag_sesiones')
    .select('id')
    .eq('proyecto_id', proyecto.id)
    .eq('plantilla_id', plantilla.id)
    .order('iniciada_en', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: respuestas } = sesion
    ? await supabase
        .from('sfpe_diag_respuestas')
        .select('pregunta_id, estado_respuesta, valor, texto')
        .eq('sesion_id', sesion.id)
    : { data: [] }

  return (
    <DiagnosticoEmpresarialClient
      proyecto={{ id: proyecto.id, nombre: proyecto.nombre }}
      perfil={perfil}
      plantillaId={plantilla.id}
      metodologiaId={plantilla.metodologia_id}
      dimensiones={dimensiones ?? []}
      preguntas={preguntas ?? []}
      sesionId={sesion?.id ?? null}
      respuestasIniciales={respuestas ?? []}
    />
  )
}
