import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UsersTable } from '@/components/admin/UsersTable'
import { RecentActivity } from '@/components/admin/RecentActivity'
import { StatsCards } from '@/components/admin/StatsCards'
import { ResumenGestionKPIs } from '@/components/admin/ResumenGestionKPIs'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminUsersPage() {
  const isDevelopment = process.env.NODE_ENV === 'development'

  let userCount = 0
  let appCount = 0
  let executionCount = 0
  let users: any[] = []
  let plans: any[] = []

  // Indicadores de gestión (KPIs reales para "Gestión del Portal")
  let diagnosticosCount = 0
  let clientesTotal = 0
  let clientesPagados = 0
  let proyectosConPostulacion = 0
  let quejasAbiertas = 0
  let tasaDesercion = 0
  let clientesEsteMes = 0
  let clientesMesAnterior = 0

  if (isDevelopment) {
    // Datos de prueba para desarrollo local para que no falle la interfaz
    userCount = 12
    appCount = 5
    executionCount = 142

    diagnosticosCount = 428
    clientesTotal = 61
    clientesPagados = 48
    proyectosConPostulacion = 19
    quejasAbiertas = 4
    tasaDesercion = 6
    clientesEsteMes = 9
    clientesMesAnterior = 6

    users = [
      {
        id: 'local-user-1',
        email: 'gonzalo@serving.co',
        role: 'admin',
        created_at: new Date().toISOString(),
        plans: {
          name_en: 'Enterprise Plan',
          name_es: 'Plan Enterprise',
          slug: 'enterprise'
        }
      },
      {
        id: 'local-user-2',
        email: 'rocio.velasco@serving.co',
        role: 'user',
        created_at: new Date().toISOString(),
        plans: {
          name_en: 'Pro Plan',
          name_es: 'Plan Pro',
          slug: 'pro'
        }
      }
    ]

    plans = [
      { id: 'p1', name_en: 'Free Plan', name_es: 'Plan Gratuito', slug: 'free', is_active: true },
      { id: 'p2', name_en: 'Pro Plan', name_es: 'Plan Pro', slug: 'pro', is_active: true },
      { id: 'p3', name_en: 'Enterprise Plan', name_es: 'Plan Enterprise', slug: 'enterprise', is_active: true }
    ]
  } else {
    // Comportamiento estricto en producción
    const supabase = await createClient()
    const { data: { user: adminUser } } = await supabase.auth.getUser()

    if (!adminUser) redirect('/login')

    // 1. Obtener conteos para las tarjetas
    const { count: dbUserCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
    const { count: dbAppCount } = await supabase.from('micro_apps').select('*', { count: 'exact', head: true })
    const { count: dbExecutionCount } = await supabase.from('app_executions').select('*', { count: 'exact', head: true })

    userCount = dbUserCount || 0
    appCount = dbAppCount || 0
    executionCount = dbExecutionCount || 0

    // 2. Obtener usuarios con sus planes
    const { data: dbUsers } = await supabase
      .from('users')
      .select('*, plans(name_en, name_es, slug)')
      .order('created_at', { ascending: false })
    users = dbUsers || []

    // 3. Obtener planes activos para el modal
    const { data: dbPlans } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    plans = dbPlans || []

    // 4. Indicadores de gestión — diagnósticos (leads del embudo)
    const { count: dbDiagnosticosCount } = await supabase
      .from('diagnosticos')
      .select('*', { count: 'exact', head: true })
    diagnosticosCount = dbDiagnosticosCount || 0

    // 5. Indicadores de gestión — clientes/proyectos (estado, deserción, altas por mes)
    const { data: proyectosResumen } = await supabase
      .from('proyectos_clientes_serving')
      .select('estado_actual, estado_comercial, created_at')
    const listaProyectos = proyectosResumen || []

    clientesTotal = listaProyectos.length
    clientesPagados = listaProyectos.filter((p) => p.estado_actual === 'pagado').length

    const conSeguimientoComercial = listaProyectos.filter((p) => !!p.estado_comercial)
    const desertados = conSeguimientoComercial.filter((p) =>
      ['Descartado', 'No Asistió'].includes(p.estado_comercial)
    )
    tasaDesercion =
      conSeguimientoComercial.length > 0
        ? Math.round((desertados.length / conSeguimientoComercial.length) * 100)
        : 0

    const ahora = new Date()
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1)
    clientesEsteMes = listaProyectos.filter(
      (p) => p.created_at && new Date(p.created_at) >= inicioMes
    ).length
    clientesMesAnterior = listaProyectos.filter((p) => {
      if (!p.created_at) return false
      const fecha = new Date(p.created_at)
      return fecha >= inicioMesAnterior && fecha < inicioMes
    }).length

    // 6. Indicadores de gestión — quejas abiertas
    const { count: dbQuejasAbiertas } = await supabase
      .from('quejas_fallos_ia')
      .select('*', { count: 'exact', head: true })
      .neq('estado', 'Resuelto')
    quejasAbiertas = dbQuejasAbiertas || 0

    // 7. Indicadores de gestión — proyectos con al menos una postulación
    const { data: postulacionesProyectos } = await supabase
      .from('postulaciones')
      .select('proyecto_id')
    proyectosConPostulacion = new Set(
      (postulacionesProyectos || []).map((r) => r.proyecto_id)
    ).size
  }

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

      <ResumenGestionKPIs
        diagnosticosCount={diagnosticosCount}
        clientesTotal={clientesTotal}
        clientesPagados={clientesPagados}
        proyectosConPostulacion={proyectosConPostulacion}
        quejasAbiertas={quejasAbiertas}
        tasaDesercion={tasaDesercion}
        clientesEsteMes={clientesEsteMes}
        clientesMesAnterior={clientesMesAnterior}
      />

      <StatsCards
        userCount={userCount}
        appCount={appCount}
        executionCount={executionCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <UsersTable initialUsers={users} plans={plans} />
        </div>
        <div className="lg:col-span-1 h-full">
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}