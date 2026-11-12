import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { LandingClient } from '@/components/landing/LandingClient'

export const dynamic = 'force-dynamic'

/**
 * Página del Camino B (Proyectos Financiables).
 * Aquí vive todo el contenido de convocatorias, diagnóstico gratuito, planes y preguntas.
 * La portada ("/") solo muestra los dos caminos.
 */
export default async function FinanciablesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return <LandingClient user={user} modo="financiables" />
}
