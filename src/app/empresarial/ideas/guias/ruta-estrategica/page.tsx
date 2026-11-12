import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GuiaLectura from '@/components/ideas/GuiaLectura'
import { buscarGuia } from '@/lib/ideas/guias-data'

export const dynamic = 'force-dynamic'

/** Misma pantalla de la App de Ideas, pero dentro del Camino A (con su propio menú). */
export default async function Page() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <GuiaLectura guia={buscarGuia('ruta-estrategica')} />
}
