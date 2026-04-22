'use client'

import React, { useEffect, useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { GlassCard } from '@/components/ui/GlassCard'
import { UserPlus, CreditCard, Cpu, Clock, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface ActivityItem {
  id: string
  type: 'user' | 'payment' | 'execution'
  title_en: string
  title_es: string
  created_at: string
  user_name?: string
  amount?: number
  app_name?: string
}

export function RecentActivity() {
  const { language } = useTranslation()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true)
      const supabase = createClient()

      try {
        // 1. Fetch latest users
        const { data: users } = await supabase
          .from('users')
          .select('id, first_name, last_name, created_at')
          .order('created_at', { ascending: false })
          .limit(5)

        // 2. Fetch latest processed payments
        const { data: payments } = await supabase
          .from('webhook_logs')
          .select('id, normalized_payload, created_at')
          .eq('status', 'processed')
          .eq('event_type', 'payment.completed')
          .order('created_at', { ascending: false })
          .limit(5)

        // 3. Fetch latest app executions
        const { data: executions } = await supabase
          .from('app_executions')
          .select('id, user_id, app_id, created_at, micro_apps(name_en, name_es)')
          .order('created_at', { ascending: false })
          .limit(5)

        // Fetch users for these executions manually to avoid relationship issues
        const userIds = [...new Set(executions?.map(e => e.user_id) || [])]
        const { data: execUsers } = userIds.length > 0 ? await supabase
          .from('users')
          .select('id, first_name, last_name')
          .in('id', userIds) : { data: [] }

        const userMap = Object.fromEntries(execUsers?.map(u => [u.id, `${u.first_name} ${u.last_name}`]) || [])

        // Combine all
        const combined: ActivityItem[] = []

        users?.forEach(u => {
          combined.push({
            id: u.id,
            type: 'user',
            title_en: `🆕 ${u.first_name} ${u.last_name} registered`,
            title_es: `🆕 ${u.first_name} ${u.last_name} se registró`,
            created_at: u.created_at,
            user_name: `${u.first_name} ${u.last_name}`
          })
        })

        payments?.forEach(p => {
          const payload = p.normalized_payload as any
          combined.push({
            id: p.id,
            type: 'payment',
            title_en: `💰 Payment of $${payload?.amount} received from ${payload?.customer?.email}`,
            title_es: `💰 Pago de $${payload?.amount} recibido de ${payload?.customer?.email}`,
            created_at: p.created_at,
            amount: payload?.amount
          })
        })

        executions?.forEach((e: any) => {
          const uName = userMap[e.user_id] || 'User'
          const aNameEn = e.micro_apps?.name_en || 'App'
          const aNameEs = e.micro_apps?.name_es || 'App'
          combined.push({
            id: e.id,
            type: 'execution',
            title_en: `🤖 ${uName} used ${aNameEn}`,
            title_es: `🤖 ${uName} usó ${aNameEs}`,
            created_at: e.created_at,
            user_name: uName,
            app_name: aNameEn
          })
        })

        // Sort by date
        combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        
        setActivities(combined.slice(0, 10))
      } catch (err) {
        console.error('Error fetching activity:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [])

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return language === 'en' ? 'Just now' : 'Ahora mismo'
    
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return language === 'en' 
        ? `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago` 
        : `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return language === 'en' 
        ? `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago` 
        : `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    return language === 'en' 
      ? `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago` 
      : `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'user': return <UserPlus className="h-4 w-4" />
      case 'payment': return <CreditCard className="h-4 w-4" />
      case 'execution': return <Cpu className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'user': return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      case 'payment': return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'execution': return 'text-purple-400 bg-purple-400/10 border-purple-400/20'
      default: return 'text-white/40 bg-white/5 border-white/10'
    }
  }

  return (
    <GlassCard className="flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          {language === 'en' ? 'Recent Activity' : 'Actividad Reciente'}
        </h2>
        {loading && <Loader2 className="h-4 w-4 text-white/20 animate-spin" />}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {loading && activities.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-white/20">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : activities.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-white/20 text-sm italic">
            {language === 'en' ? 'No recent activity' : 'No hay actividad reciente'}
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((item) => (
              <div key={item.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                <div className={cn(
                  "p-2 rounded-lg border shrink-0 transition-transform group-hover:scale-110",
                  getColor(item.type)
                )}>
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium leading-tight mb-1">
                    {language === 'en' ? item.title_en : item.title_es}
                  </p>
                  <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">
                    {formatRelativeTime(item.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  )
}
