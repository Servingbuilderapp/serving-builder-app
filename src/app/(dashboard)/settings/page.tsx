import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SettingsClient } from '@/components/dashboard/SettingsClient'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-color-base-content tracking-tight">
          Configuración
        </h1>
        <p className="text-color-base-content/80">
          Administra tu perfil y preferencias de la cuenta.
        </p>
      </div>

      <SettingsClient initialProfile={profile} user={user} />
    </div>
  )
}
