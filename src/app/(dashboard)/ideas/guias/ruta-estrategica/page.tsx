import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GuiaLectura from '@/components/ideas/GuiaLectura'
import { buscarGuia } from '@/lib/ideas/guias-data'

export const dynamic = 'force-dynamic'

export default async function GuiaRutaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <GuiaLectura guia={buscarGuia('ruta-estrategica')} />
}
