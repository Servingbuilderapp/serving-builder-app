import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { LandingClient } from '@/components/landing/LandingClient'

export const dynamic = 'force-dynamic'

/**
 * Página pública de entrada (website).
 *
 * Solo necesita saber si hay una sesión iniciada, para mostrar "Ir a mi panel"
 * en lugar de "Iniciar sesión / Crear cuenta". Todo el contenido del website es
 * estático y traducible desde los archivos de la carpeta locales.
 */
export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return <LandingClient user={user} />
}
