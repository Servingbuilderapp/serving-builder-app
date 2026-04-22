'use client'

import React from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Users, LayoutGrid, Zap, TrendingUp } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils'

interface StatsCardsProps {
  userCount: number
  appCount: number
  executionCount: number
}

export function StatsCards({ userCount, appCount, executionCount }: StatsCardsProps) {
  const { language } = useTranslation()

  const stats = [
    {
      label: language === 'en' ? 'Total Users' : 'Usuarios Totales',
      value: userCount,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      trend: '+12%'
    },
    {
      label: language === 'en' ? 'Active Apps' : 'Apps Activas',
      value: appCount,
      icon: LayoutGrid,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      trend: '46 total'
    },
    {
      label: language === 'en' ? 'Total Executions' : 'Ejecuciones Totales',
      value: executionCount,
      icon: Zap,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
      trend: '+24%'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, i) => (
        <GlassCard key={i} className="p-6 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <stat.icon className="h-24 w-24" />
          </div>
          
          <div className="flex items-center gap-4">
            <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-white">
                  {stat.value.toLocaleString()}
                </h3>
                <span className="text-[10px] font-bold text-green-400 flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" />
                  {stat.trend}
                </span>
              </div>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  )
}
