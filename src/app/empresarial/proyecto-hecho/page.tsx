import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProyectoHechoClient } from '@/components/empresarial/ProyectoHechoClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Que la IA formule mi proyecto | Serving',
  description: 'Sube tu documento o cuéntanos tu idea, responde unas preguntas básicas y la IA arma tu proyecto.',
}

/** Entrada de "proyecto hecho": la persona deja su documento o idea y unas respuestas básicas. */
export default async function ProyectoHechoPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/empresarial/proyecto-hecho')

  return <ProyectoHechoClient userId={user.id} />
}
