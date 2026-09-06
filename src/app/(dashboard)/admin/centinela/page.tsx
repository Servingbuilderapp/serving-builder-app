import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CentinelaFuentesClient } from '@/components/admin/CentinelaFuentesClient'

export const dynamic = 'force-dynamic'

/**
 * FUENTES DEL CENTINELA DIGITAL — pantalla del equipo.
 *
 * De aquí sale todo lo demás del Centinela: primero se sabe a quién se le va a
 * seguir la pista y por qué vía, y después se construye la lectura automática
 * de cada vía.
 */
export default async function AdminCentinelaPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const correo = (user.email || '').toLowerCase().trim()
  let esEquipo = correo === 'servingbuilderapp@gmail.com'

  if (!esEquipo) {
    const { data: perfil } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle<{ role: string | null }>()
    esEquipo = perfil?.role === 'admin'
  }

  if (!esEquipo) redirect('/dashboard')

  const { data: fuentes, error } = await supabase
    .from('centinela_fuentes')
    // El texto del select va en UNA sola línea a propósito: si se parte con un
    // "+", TypeScript deja de reconocer las columnas y el resultado le llega a
    // la pantalla sin tipo. Es el error que ya arrastra la pantalla de
    // convocatorias.
    .select('id, nombre, categoria, nivel, estado, url, url_newsletter, correo_remitente, notas, primer_correo_en, ultima_revision')
    .order('categoria', { ascending: true })
    .limit(1000)

  return <CentinelaFuentesClient fuentes={fuentes || []} errorCarga={error?.message || null} />
}
