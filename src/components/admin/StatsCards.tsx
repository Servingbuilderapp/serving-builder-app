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
      color: 'text-color-primary',
      bg: 'bg-color-primary/20',
      shadow: 'shadow-[0_0_20px_rgba(249,115,22,0.2)]',
      trend: '+12%'
    },
    {
      label: language === 'en' ? 'Active Apps' : 'Apps Activas',
      value: appCount,
      icon: LayoutGrid,
      color: 'text-color-accent-pink',
      bg: 'bg-color-accent-pink/20',
      shadow: 'shadow-[0_0_20px_rgba(236,72,153,0.2)]',
      trend: '46 total'
    },
    {
      label: language === 'en' ? 'Total Executions' : 'Ejecuciones Totales',
      value: executionCount,
      icon: Zap,
      color: 'text-color-accent-violet',
      bg: 'bg-color-accent-violet/20',
      shadow: 'shadow-[0_0_20px_rgba(139,92,246,0.2)]',
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
          
          <div className="flex items-center gap-5 relative z-10">
            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center border border-white/10", stat.bg, stat.color, stat.shadow)}>
              <stat.icon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-3">
                <h3 className="text-3xl font-black text-white tracking-tighter text-glow-primary">
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
