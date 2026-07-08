
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UsersTable } from '@/components/admin/UsersTable'
import { RecentActivity } from '@/components/admin/RecentActivity'
import { StatsCards } from '@/components/admin/StatsCards'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user: adminUser } } = await supabase.auth.getUser()

  if (!adminUser) redirect('/login')

  // 1. Obtener conteos para las tarjetas
  const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
  const { count: appCount } = await supabase.from('micro_apps').select('*', { count: 'exact', head: true })
  const { count: executionCount } = await supabase.from('app_executions').select('*', { count: 'exact', head: true })

  // 2. Obtener usuarios con sus planes
  const { data: users } = await supabase
    .from('users')
    .select('*, plans(name_en, name_es, slug)')
    .order('created_at', { ascending: false })

  // 3. Obtener planes activos para el modal
  const { data: plans } = await supabase
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-color-base-content tracking-tight">
            Gestión del Portal
          </h1>
          <p className="text-color-base-content/60 text-sm mt-2 max-w-3xl">
            <strong>¿Cómo agregar un usuario y cuándo usarlo?</strong> Puedes agregar usuarios manualmente haciendo clic en el botón "Agregar Usuario". Esto es útil si tienes clientes que te pagaron por fuera de la plataforma (ej. transferencia, efectivo) o si quieres darle acceso gratuito a un colaborador. El sistema le creará la cuenta y le enviará un correo de bienvenida.
          </p>
        </div>
      </div>

      <StatsCards 
        userCount={userCount || 0} 
        appCount={appCount || 0} 
        executionCount={executionCount || 0} 
      />


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <UsersTable initialUsers={users || []} plans={plans || []} />
        </div>
        <div className="lg:col-span-1 h-full">
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
