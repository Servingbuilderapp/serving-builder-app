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
      "group relative flex flex-col h-full rounded-3xl border p-7 transition-all duration-500 overflow-hidden",
      isLocked 
        ? "bg-slate-900/50 border-white/5 opacity-50 cursor-not-allowed" 
        : "bg-linear-to-br from-[#1a233a] to-[#0f1629] border-white/10 hover:border-color-primary/50 hover:scale-[1.03] hover:shadow-[0_20px_50px_rgba(249,115,22,0.15)] cursor-pointer"
    )}>
      {/* Background Accent Glow */}
      {!isLocked && (
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-color-primary/10 rounded-full blur-2xl group-hover:bg-color-primary/20 transition-colors" />
      )}
      {isLocked && (
        <div className="absolute top-4 right-4 text-white/30">
          <Lock className="h-4 w-4" />
        </div>
      )}

      <div className={cn(
        "h-14 w-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 shadow-xl",
        isLocked ? "bg-white/5 text-white/20" : "bg-color-primary/20 text-color-primary group-hover:bg-color-primary/30 group-hover:scale-110"
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
  userEmail?: string | null
}

export function AppsGrid({ apps, accessibleSlugs, userEmail }: AppsGridProps) {
  const { language } = useTranslation()
  const ADMIN_EMAIL = 'servingbuilderapp@gmail.com';
  const isAdmin = userEmail?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const hasNoPlan = accessibleSlugs.length === 0 && !isAdmin

  // Helper para organizar por temas si la DB no tiene el campo category
  const getAppCategory = (app: any) => {
    if (app.category) return app.category;
    const name = (app.name_es || app.name_en || '').toLowerCase();
    if (name.includes('video') || name.includes('guion') || name.includes('podcast') || name.includes('audio') || name.includes('voz')) return language === 'en' ? 'Video & Audio' : 'Video & Audio';
    if (name.includes('imagen') || name.includes('foto') || name.includes('diseño') || name.includes('art') || name.includes('visual')) return language === 'en' ? 'Image & Design' : 'Imagen & Diseño';
    if (name.includes('instagram') || name.includes('social') || name.includes('ninja') || name.includes('viral') || name.includes('facebook') || name.includes('tiktok') || name.includes('post')) return language === 'en' ? 'Social Media' : 'Redes Sociales';
    if (name.includes('seo') || name.includes('web') || name.includes('optimiza') || name.includes('ranking') || name.includes('keyword')) return language === 'en' ? 'SEO & Optimization' : 'SEO & Optimización';
    if (name.includes('escritor') || name.includes('artículo') || name.includes('pro') || name.includes('texto') || name.includes('blog') || name.includes('copy')) return language === 'en' ? 'Writing & Content' : 'Escritura & Contenido';
    return language === 'en' ? 'Pro Tools' : 'Herramientas Pro';
  };

  // Group apps by category
  const categories = apps.reduce((acc: Record<string, any[]>, app) => {
    const cat = getAppCategory(app)
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(app)
    return acc
  }, {})

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
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

      {Object.entries(categories).map(([category, categoryApps]) => (
        <div key={category} className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-white to-white/40">
              {category}
            </h2>
            <div className="h-px flex-1 bg-linear-to-r from-white/10 to-transparent" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categoryApps.map((app) => (
              <AppCard 
                key={app.id} 
                app={app} 
                isLocked={!isAdmin && !accessibleSlugs.includes(app.slug)} 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
