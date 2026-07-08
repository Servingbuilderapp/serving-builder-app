import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verificar rol de admin
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (user.email !== 'servingbuilderapp@gmail.com' && userData?.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="max-w-7xl mx-auto w-full pb-20 space-y-8">
      {children}
    </div>
  )
}
