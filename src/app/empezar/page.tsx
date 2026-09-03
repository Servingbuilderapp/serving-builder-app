import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { EmpezarClient } from '@/components/landing/EmpezarClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Consigue financiación para tu proyecto | Arquitectura Digital de Proyectos',
  description:
    'Diagnóstico gratuito con inteligencia artificial. Estructuramos tu proyecto, buscamos las convocatorias que encajan y te acompañamos hasta la postulación.',
}

/**
 * Página de captación.
 *
 * Es la página a la que llega alguien desde una campaña, una tarjeta o un
 * mensaje: una sola promesa arriba y dos puertas debajo, una para empresas e
 * ideas y otra para entidades y organizaciones. Las dos llevan al mismo
 * diagnóstico gratuito, pero hablando el idioma de cada quien.
 *
 * A diferencia del website, aquí no hay menú de navegación: quien llega tiene
 * una sola cosa que hacer, y cada enlace de más es una salida.
 */
export default async function EmpezarPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return <EmpezarClient user={user} />
}
