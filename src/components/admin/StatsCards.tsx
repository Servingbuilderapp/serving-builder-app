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

  // Las tres tarjetas usan el mismo dorado como acento (no colores distintos
  // por tarjeta) — es el mismo criterio que ya se aplicó en el resto del
  // panel: un solo color de marca, el vino y el dorado, nada de arcoíris.
  const stats = [
    {
      label: language === 'en' ? 'Total Users' : 'Usuarios Totales',
      value: userCount,
      icon: Users,
      trend: '+12%',
      trendColor: '#9BB18D',
    },
    {
      label: language === 'en' ? 'Active Apps' : 'Apps Activas',
      value: appCount,
      icon: LayoutGrid,
      trend: '46 total',
      trendColor: '#E0B868',
    },
    {
      label: language === 'en' ? 'Total Executions' : 'Ejecuciones Totales',
      value: executionCount,
      icon: Zap,
      trend: '+24%',
      trendColor: '#9BB18D',
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, i) => (
        <GlassCard key={i} className="p-6 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.06] text-color-primary group-hover:opacity-[0.12] transition-opacity">
            <stat.icon className="h-24 w-24" />
          </div>

          <div className="flex items-center gap-5 relative z-10">
            <div
              className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center border shrink-0",
                "bg-color-primary/15 text-color-primary border-color-primary/25 shadow-[0_0_20px_rgba(176,141,87,0.18)]"
              )}
            >
              <stat.icon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-color-base-content/45 uppercase tracking-widest">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-3">
                <h3 className="text-3xl font-black text-color-base-content tracking-tighter tabular-nums">
                  {stat.value.toLocaleString()}
                </h3>
                <span
                  className="text-[10px] font-bold flex items-center gap-0.5"
                  style={{ color: stat.trendColor }}
                >
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
