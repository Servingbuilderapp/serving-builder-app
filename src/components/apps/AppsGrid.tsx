'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { 
  PenTool, Mail, Briefcase, Share2, Video, 
  LayoutGrid, Sparkles, FileText, MessageSquare, 
  Zap, Lock, ArrowRight 
} from 'lucide-react'
import type { ComponentType } from 'react'
import { cn } from '@/lib/utils'
import { GlowButton } from '@/components/ui/GlowButton'

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  PenTool, Mail, Briefcase, Share2, Video, LayoutGrid, Sparkles, FileText, MessageSquare, Zap
}

interface AppCardProps {
  app: any
  isLocked: boolean
}

function AppCard({ app, isLocked }: AppCardProps) {
  const { language } = useTranslation()
  const IconComponent = ICON_MAP[app.icon] ?? Sparkles

  const content = (
    <div className={cn(
      "group relative flex flex-col h-full rounded-2xl border p-6 transition-all duration-300",
      isLocked 
        ? "bg-white/2 border-white/5 opacity-50 cursor-not-allowed" 
        : "bg-white/5 border-white/10 hover:border-primary/50 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(124,58,237,0.1)] cursor-pointer"
    )}>
      {isLocked && (
        <div className="absolute top-4 right-4 text-white/30">
          <Lock className="h-4 w-4" />
        </div>
      )}

      <div className={cn(
        "h-12 w-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
        isLocked ? "bg-white/5 text-white/30" : "bg-primary/20 text-primary group-hover:bg-primary/30"
      )}>
        <IconComponent className="h-6 w-6" />
      </div>

      <h3 className="text-lg font-bold text-white mb-2">
        {language === 'en' ? app.name_en : app.name_es}
      </h3>
      <p className="text-sm text-white/50 line-clamp-2 mb-6">
        {language === 'en' ? app.description_en : app.description_es}
      </p>

      <div className="mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all">
        {isLocked ? (
          <span className="text-white/30">{language === 'en' ? 'Locked' : 'Bloqueado'}</span>
        ) : (
          <span className="text-primary group-hover:translate-x-1 flex items-center gap-2">
            {language === 'en' ? 'Launch' : 'Lanzar'}
            <ArrowRight className="h-3 w-3" />
          </span>
        )}
      </div>
    </div>
  )

  if (isLocked) {
    return <Link href="/plans" className="block h-full">{content}</Link>
  }

  return <Link href={`/apps/${app.slug}`} className="block h-full">{content}</Link>
}

interface AppsGridProps {
  apps: any[]
  accessibleSlugs: string[]
}

export function AppsGrid({ apps, accessibleSlugs }: AppsGridProps) {
  const { language } = useTranslation()
  const hasNoPlan = accessibleSlugs.length === 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {hasNoPlan && (
        <div className="bg-linear-to-r from-primary/20 via-accent-pink/20 to-primary/20 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-white">
              {language === 'en' ? 'Choose a plan to unlock your apps' : 'Elige un plan para desbloquear tus apps'}
            </h3>
            <p className="text-sm text-white/60">
              {language === 'en' 
                ? 'Get instant access to professional AI tools.' 
                : 'Obtén acceso instantáneo a herramientas profesionales de IA.'}
            </p>
          </div>
          <Link href="/plans">
            <GlowButton>
              {language === 'en' ? 'View Plans' : 'Ver Planes'}
            </GlowButton>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {apps.map((app) => (
          <AppCard 
            key={app.id} 
            app={app} 
            isLocked={!accessibleSlugs.includes(app.slug)} 
          />
        ))}
      </div>
    </div>
  )
}
