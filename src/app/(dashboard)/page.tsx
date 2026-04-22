'use client'

import React from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { Users, Activity, TrendingUp, Sparkles, Plus, ArrowRight, Settings, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const { language } = useTranslation()
  const [greeting, setGreeting] = React.useState('')
  const [emoji, setEmoji] = React.useState('')
  const [userName, setUserName] = React.useState('')
  const [subtitle, setSubtitle] = React.useState('')
  
  // Real stats state
  const [stats, setStats] = React.useState([
    { label: language === 'en' ? 'Generations' : 'Generaciones', value: '0', icon: Activity, trend: '0%', isPositive: true },
    { label: language === 'en' ? 'Apps Used' : 'Apps Usadas', value: '0', icon: Users, trend: '0%', isPositive: true },
    { label: language === 'en' ? 'Success Rate' : 'Tasa de Éxito', value: '0%', icon: TrendingUp, trend: '0%', isPositive: true },
    { label: language === 'en' ? 'Current Plan' : 'Plan Actual', value: '---', icon: Sparkles, trend: '', isPositive: true },
  ])

  const [activities, setActivities] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // 1. Fetch Profile
        const { data: profile } = await supabase
          .from('users')
          .select('first_name, full_name, plan_id, plans(name_en, name_es, slug)')
          .eq('id', user.id)
          .single()
        
        const name = profile?.first_name || profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || (language === 'en' ? 'User' : 'Usuario')
        setUserName(name)

        // 2. Fetch Executions for Stats
        const { data: executions } = await supabase
          .from('app_executions')
          .select('id, status, app_id, micro_apps(name_en, name_es), created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (executions) {
          const total = executions.length
          const completed = executions.filter(ex => ex.status === 'completed').length
          const uniqueApps = new Set(executions.map(ex => ex.app_id)).size
          const successRate = total > 0 ? Math.round((completed / total) * 100) : 0
          
          const planData = Array.isArray(profile?.plans) ? profile.plans[0] : profile?.plans
          const planName = planData 
            ? (language === 'en' ? planData.name_en : planData.name_es)
            : (language === 'en' ? 'Free' : 'Gratis')

          setStats([
            { label: language === 'en' ? 'Generations' : 'Generaciones', value: total.toString(), icon: Activity, trend: '+100%', isPositive: true },
            { label: language === 'en' ? 'Apps Used' : 'Apps Usadas', value: uniqueApps.toString(), icon: Users, trend: '', isPositive: true },
            { label: language === 'en' ? 'Success Rate' : 'Tasa de Éxito', value: `${successRate}%`, icon: TrendingUp, trend: '', isPositive: true },
            { label: language === 'en' ? 'Current Plan' : 'Plan Actual', value: planName, icon: Sparkles, trend: '', isPositive: true },
          ])

          // 3. Map Activities (Last 5)
          const mappedActivities = executions.slice(0, 5).map(ex => {
            const appData = Array.isArray(ex.micro_apps) ? ex.micro_apps[0] : ex.micro_apps;
            return {
              id: ex.id,
              title: language === 'en' ? (appData?.name_en || 'App Execution') : (appData?.name_es || 'Ejecución de App'),
            time: formatTimeAgo(new Date(ex.created_at)),
            status: ex.status,
            type: 'app'
            };
          })
          setActivities(mappedActivities)
        }
      }
      setLoading(false)
    }

    const updateGreeting = () => {
      const hour = new Date().getHours()
      if (hour < 12) {
        setGreeting(language === 'en' ? 'Good morning' : 'Buenos días')
        setEmoji('☀️')
        setSubtitle(language === 'en' ? 'What will you create today?' : '¿Qué vas a crear hoy?')
      } else if (hour < 18) {
        setGreeting(language === 'en' ? 'Good afternoon' : 'Buenas tardes')
        setEmoji('🌤️')
        setSubtitle(language === 'en' ? 'Let\'s make something amazing.' : 'Vamos a crear algo increíble.')
      } else {
        setGreeting(language === 'en' ? 'Good evening' : 'Buenas noches')
        setEmoji('🌙')
        setSubtitle(language === 'en' ? 'Refining your next big idea?' : '¿Perfeccionando tu próxima gran idea?')
      }
    }

    fetchData()
    updateGreeting()
  }, [language])

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return language === 'en' ? 'Just now' : 'Ahora mismo'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return language === 'en' ? `${minutes}m ago` : `hace ${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return language === 'en' ? `${hours}h ago` : `hace ${hours}h`
    return date.toLocaleDateString()
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 md:p-8 space-y-8 pb-12">
      {/* Personalized Greeting */}
      <div className="mb-2 animate-in fade-in slide-in-from-top-4 duration-700">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
          {greeting}, <span className="bg-clip-text text-transparent bg-linear-to-r from-color-primary to-color-accent-pink">{userName || '...'}</span> {emoji}
        </h2>
        <p className="text-color-base-content/40 mt-1 font-medium italic">
          {subtitle}
        </p>
      </div>

      <div className="h-px w-full bg-linear-to-r from-white/10 via-white/5 to-transparent mb-8" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {language === 'en' ? 'Dashboard Overview' : 'Resumen del Panel'}
          </h1>
          <p className="text-color-base-content/60 mt-1">
            {language === 'en' ? 'Welcome back. Here is what is happening today.' : 'Bienvenido de nuevo. Esto es lo que pasa hoy.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/apps">
            <GlowButton className="gap-2">
              <Plus className="h-4 w-4" />
              {language === 'en' ? 'Explore Apps' : 'Explorar Apps'}
            </GlowButton>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <GlassCard key={i} className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-color-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-color-primary/10 transition-colors" />
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-color-primary">
                <stat.icon className="h-5 w-5" />
              </div>
              {stat.trend && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  stat.isPositive 
                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {stat.trend}
                </span>
              )}
            </div>
            <div className="relative z-10">
              <h3 className="text-color-base-content/60 text-xs font-bold uppercase tracking-widest mb-1">
                {stat.label}
              </h3>
              <p className="text-2xl font-black text-white tracking-tight">
                {loading ? '...' : stat.value}
              </p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Charts Section (Simplified for this version) */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="p-8 flex flex-col items-center justify-center min-h-[300px] text-center space-y-4">
            <div className="p-4 rounded-full bg-color-primary/10 border border-color-primary/20">
              <Sparkles className="h-8 w-8 text-color-primary animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {language === 'en' ? 'Start Creating with AI' : 'Empieza a crear con IA'}
              </h2>
              <p className="text-color-base-content/60 max-w-md mx-auto mt-2">
                {language === 'en' 
                  ? 'Access over 10 specialized AI applications to boost your productivity and creativity.' 
                  : 'Accede a más de 10 aplicaciones de IA especializadas para potenciar tu productividad.'}
              </p>
            </div>
            <Link href="/apps">
              <GlowButton variant="ghost" className="mt-4">
                {language === 'en' ? 'Go to App Library' : 'Ir a la Librería'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </GlowButton>
            </Link>
          </GlassCard>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/plans" className="group">
              <div className="h-full rounded-2xl p-6 bg-linear-to-br from-color-primary/10 to-transparent border border-color-primary/20 hover:border-color-primary/50 transition-colors relative overflow-hidden">
                <div className="absolute inset-0 bg-color-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-color-primary/20 text-color-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{language === 'en' ? 'Upgrade Plan' : 'Mejorar Plan'}</h3>
                    <p className="text-sm text-color-base-content/60">{language === 'en' ? 'Get more generations' : 'Obtén más generaciones'}</p>
                  </div>
                </div>
              </div>
            </Link>
            <div className="group cursor-pointer rounded-2xl p-6 bg-linear-to-br from-color-accent-pink/10 to-transparent border border-color-accent-pink/20 hover:border-color-accent-pink/50 transition-colors relative overflow-hidden">
              <div className="absolute inset-0 bg-color-accent-pink/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-color-accent-pink/20 text-color-accent-pink">
                  <Settings className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{language === 'en' ? 'Help Center' : 'Centro de Ayuda'}</h3>
                  <p className="text-sm text-color-base-content/60">{language === 'en' ? 'Need assistance?' : '¿Necesitas ayuda?'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Sidebar */}
        <GlassCard className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">
              {language === 'en' ? 'Recent Activity' : 'Actividad Reciente'}
            </h2>
          </div>
          
          <div className="flex-1 relative">
            <div className="absolute top-0 bottom-0 left-[15px] w-px bg-white/10" />
            
            <div className="space-y-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 opacity-20">
                  <Loader2 className="h-6 w-6 animate-spin mb-2" />
                  <span className="text-xs uppercase tracking-widest font-bold">Cargando...</span>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-12 text-white/20 italic text-sm">
                  {language === 'en' ? 'No recent activity' : 'Sin actividad reciente'}
                </div>
              ) : activities.map((item, i) => (
                <div key={i} className="relative flex items-start gap-4">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border z-10 bg-color-base-200",
                    item.status === 'completed' ? "border-green-500/50 text-green-400" :
                    item.status === 'error' ? "border-red-500/50 text-red-400" :
                    "border-color-primary/50 text-color-primary"
                  )}>
                    {item.status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> :
                     item.status === 'error' ? <XCircle className="h-4 w-4" /> :
                     <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-color-base-content/40 uppercase tracking-widest mt-1">
                      {item.time} • {item.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

      </div>
    </div>
  )
}
