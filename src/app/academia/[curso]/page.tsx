import React from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cursoPorSlug } from '@/lib/academia/cursos'
import { academiaContenido } from '@/lib/academia/academiaContenido'
import { academiaContenidoFormulacion } from '@/lib/academia/academiaContenidoFormulacion'
import { VentaCursoClient } from '../VentaCursoClient'
import { CursoAcademiaClient } from '../CursoAcademiaClient'
import { FormulacionSlidesClient } from '../FormulacionSlidesClient'

export const dynamic = 'force-dynamic'

export default async function CursoAcademiaPage({
  params,
}: {
  params: Promise<{ curso: string }>
}) {
  const { curso: cursoSlug } = await params
  const curso = cursoPorSlug(cursoSlug)
  if (!curso) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // `academia_compras` y `academia_notas` tienen el candado de seguridad
  // (RLS) activado sin políticas abiertas: solo la llave de service role
  // puede leerlas.
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let yaComprado = false
  if (user?.email) {
    const { data } = await supabaseAdmin
      .from('academia_compras')
      .select('id')
      .eq('correo_cliente', user.email)
      .eq('curso', curso.slug)
      .eq('estado', 'pagado')
      .maybeSingle()
    yaComprado = Boolean(data)
  }

  if (!yaComprado) {
    return <VentaCursoClient curso={curso} />
  }

  if (curso.slug === 'estructuracion') {
    return <CursoAcademiaClient nombreCurso={curso.nombre} bloques={academiaContenido} />
  }

  // curso.slug === 'formulacion'
  const notasIniciales: Record<number, string> = {}
  if (user?.email) {
    const { data: notas } = await supabaseAdmin
      .from('academia_notas')
      .select('diapositiva, nota')
      .eq('correo_cliente', user.email)
      .eq('curso', 'formulacion')
    for (const n of notas || []) {
      notasIniciales[n.diapositiva] = n.nota
    }
  }

  return (
    <FormulacionSlidesClient
      nombreCurso={curso.nombre}
      temas={academiaContenidoFormulacion}
      notasIniciales={notasIniciales}
    />
  )
}
