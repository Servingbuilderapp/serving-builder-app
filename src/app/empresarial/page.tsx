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

  // Proyectos propios (no los derivados de una oportunidad: esos se ven dentro de "Mi camino").
  let proyectos: { id: string; nombre: string; estado: string }[] = []
  if (user) {
    const { data: propios } = await supabase
      .from('sfpe_proyectos')
      .select('id, nombre, estado')
      .eq('user_id', user.id)
      .order('actualizada_en', { ascending: false })
      .limit(20)
    const { data: derivados } = await supabase
      .from('sfpe_oportunidades')
      .select('proyecto_derivado_id')
      .not('proyecto_derivado_id', 'is', null)
    const idsDerivados = new Set((derivados ?? []).map((d) => d.proyecto_derivado_id as string))
    proyectos = (propios ?? [])
      .filter((p) => !idsDerivados.has(p.id as string))
      .map((p) => ({ id: p.id as string, nombre: p.nombre as string, estado: p.estado as string }))
  }

  return <EmpresarialClient userId={user?.id ?? null} proyectos={proyectos} />
}
