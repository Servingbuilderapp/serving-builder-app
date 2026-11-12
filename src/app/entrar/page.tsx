import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SeleccionCamino } from '@/components/landing/SeleccionCamino'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Elige tu camino | Serving',
}

/** Después de iniciar sesión: la persona elige entre sus proyectos empresariales y su panel de financiación. */
export default async function EntrarPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/entrar')
  return <SeleccionCamino />
}
