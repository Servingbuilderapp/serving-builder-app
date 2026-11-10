import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { EmpresarialClient } from '@/components/empresarial/EmpresarialClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Arquitectura de Proyectos Empresariales | Serving',
  description:
    'Crea, fortalece o haz crecer tu empresa con un proyecto bien estructurado. Cuéntanos tu situación y te mostramos por dónde empezar.',
}

/**
 * Entrada de la línea de Proyectos Empresariales.
 * Solo necesita saber si hay una sesión iniciada: sin sesión se puede responder
 * las preguntas, pero para guardar el proyecto hace falta la cuenta.
 */
export default async function EmpresarialPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return <EmpresarialClient userId={user?.id ?? null} />
}
