import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EmailSettingsClient } from '@/components/admin/EmailSettingsClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminEmailPage() {
  const supabase = await createClient()
  
  // 1. Verificar Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role, first_name, last_name')
    .eq('id', user.id)
    .single()

  const ADMIN_EMAIL = 'servingbuilderapp@gmail.com';
  const isGodAdmin = user.email === ADMIN_EMAIL;

  if (!isGodAdmin && (!profile || profile.role !== 'admin')) redirect('/')

  // 2. Obtener configuraciones actuales
  const { data: settings } = await supabase
    .from('smtp_settings')
    .select('*')
    .single()

  const adminName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-color-base-content tracking-tight uppercase italic">
          {profile?.role === 'admin' ? 'Email Configuration' : 'Configuración de Email'}
        </h1>
        <p className="text-color-base-content/40 text-sm font-medium italic">
          Configure your SMTP settings to enable welcome emails and notifications.
        </p>
      </div>

      <EmailSettingsClient 
        initialSettings={settings} 
        adminName={adminName}
        adminEmail={user.email || ''}
      />
    </div>
  )
}
