'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { 
  PenTool, Mail, Briefcase, Share2, Video, 
  LayoutGrid, Sparkles, FileText, MessageSquare, 
  Zap, Lock, ArrowRight, X, Loader2
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
  onUnlockClick?: (app: any) => void
}

function AppCard({ app, isLocked, onUnlockClick }: AppCardProps) {
  const { language } = useTranslation()
  const IconComponent = ICON_MAP[app.icon] ?? Sparkles

  const content = (
    <div className={cn(
      "group relative flex flex-col h-full rounded-3xl border p-7 transition-all duration-500 overflow-hidden bg-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]",
      isLocked 
        ? "border-orange-500/10 opacity-70 hover:opacity-100 hover:border-emerald-500/30 cursor-pointer" 
        : "border-orange-500/10 hover:border-emerald-500/30 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] cursor-pointer"
    )}
    onClick={() => {
      if (isLocked && onUnlockClick) {
        onUnlockClick(app);
      }
    }}>
      {/* Background Accent Glow */}
      {!isLocked && (
        <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-linear-to-br from-orange-500/10 to-amber-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
      )}
      {isLocked && (
        <div className="absolute top-4 right-4 text-orange-950/30 group-hover:text-emerald-500 transition-colors">
          <Lock className="h-4 w-4" />
        </div>
      )}

      <div className={cn(
        "h-14 w-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 shadow-md",
        isLocked ? "bg-orange-50 text-orange-950/40 group-hover:text-emerald-500 group-hover:bg-emerald-50" : "bg-orange-50 text-orange-600 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-emerald-500/20"
      )}>
        <IconComponent className="h-6 w-6" />
      </div>

      <h3 className="text-lg font-bold text-color-base-content mb-2 group-hover:text-emerald-700 transition-colors">
        {language === 'en' ? app.name_en : app.name_es}
      </h3>
      <p className="text-xs text-color-base-content/60 mb-6 relative z-10 leading-relaxed">
        {language === 'en' ? app.description_en : app.description_es}
      </p>

      <div className="mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all relative z-10">
        {isLocked ? (
          <span className="text-orange-950/40 group-hover:text-emerald-500 transition-colors">{language === 'en' ? 'Unlock' : 'Desbloquear'}</span>
        ) : (
          <span className="text-orange-600 group-hover:text-emerald-600 group-hover:translate-x-1 flex items-center gap-2">
            {language === 'en' ? 'Launch' : 'Lanzar'}
            <ArrowRight className="h-3 w-3" />
          </span>
        )}
      </div>
    </div>
  )

  if (isLocked) {
    // If locked, we don't wrap it in a link to the app, we handle the click in the div
    return content;
  }

  return <Link href={`/apps/${app.slug}`} className="block h-full">{content}</Link>
}

interface AppsGridProps {
  apps: any[]
  accessibleSlugs: string[]
  userEmail?: string | null
  appLimit?: number
  usedCredits?: number
}

export function AppsGrid({ apps, accessibleSlugs, userEmail, appLimit = 0, usedCredits = 0 }: AppsGridProps) {
  const { language } = useTranslation()
  const router = useRouter()
  const ADMIN_EMAIL = 'servingbuilderapp@gmail.com';
  const isAdmin = userEmail?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  
  // Si el límite es 100 o más (Elite o Master), consideramos que tiene acceso ilimitado a todo
  const hasUnlimitedAccess = appLimit >= 100;
  
  const hasNoPlan = accessibleSlugs.length === 0 && !isAdmin && appLimit === 0
  const creditsRemaining = Math.max(0, appLimit - usedCredits)

  const [unlockingApp, setUnlockingApp] = useState<any | null>(null)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [unlockError, setUnlockError] = useState<string | null>(null)

  const handleUnlockClick = (app: any) => {
    setUnlockingApp(app)
    setUnlockError(null)
  }

  const confirmUnlock = async () => {
    if (!unlockingApp) return
    setIsUnlocking(true)
    setUnlockError(null)

    try {
      const res = await fetch('/api/user/unlock-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appSlug: unlockingApp.slug, appId: unlockingApp.id })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to unlock app')
      }

      // Success
      router.refresh()
      setUnlockingApp(null)
    } catch (err: any) {
      setUnlockError(err.message)
    } finally {
      setIsUnlocking(false)
    }
  }

  // Helper para organizar por temas si la DB no tiene el campo category
  const getAppCategory = (app: any) => {
    // 1. Usar categoría de la DB si existe (Prioridad Máxima)
    if (app.category) {
      if (app.category.toLowerCase().includes('social')) return language === 'en' ? 'Social Media' : 'Redes Sociales';
      if (app.category.toLowerCase().includes('project') || app.category.toLowerCase().includes('proyect')) return language === 'en' ? 'Projects' : 'Proyectos';
      if (app.category.toLowerCase().includes('productiv')) return language === 'en' ? 'Productivity' : 'Productividad';
      if (app.category.toLowerCase().includes('tool') || app.category.toLowerCase().includes('herramienta')) return language === 'en' ? 'Tools' : 'Herramientas';
      return app.category;
    }

    const name = (app.name_es || app.name_en || '').toLowerCase();
    
    // Redes Sociales
    if (name.includes('instagram') || name.includes('social') || name.includes('ninja') || name.includes('viral') || name.includes('post') || name.includes('reels')) {
      return language === 'en' ? 'Social Media' : 'Redes Sociales';
    }
    
    // Proyectos
    if (name.includes('proyecto') || name.includes('negocio') || name.includes('business') || name.includes('startup') || name.includes('inversión')) {
      return language === 'en' ? 'Projects' : 'Proyectos';
    }
    
    // Productividad
    if (name.includes('escritor') || name.includes('artículo') || name.includes('pro') || name.includes('texto') || name.includes('blog') || name.includes('copy') || name.includes('seo') || name.includes('optimiza')) {
      return language === 'en' ? 'Productivity' : 'Productividad';
    }
    
    // Herramientas (Default)
    return language === 'en' ? 'Tools' : 'Herramientas';
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
      
      {/* Barra de Créditos A La Carta */}
      {!isAdmin && appLimit > 0 && !hasUnlimitedAccess && (
        <div className="bg-linear-to-r from-color-primary/10 via-color-accent-pink/10 to-color-primary/10 border border-color-base-content/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-color-base-content flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-color-primary" />
              {language === 'en' ? 'A La Carte Plan' : 'Plan A La Carta'}
            </h3>
            <p className="text-sm text-color-base-content/60">
              {language === 'en' 
                ? `You have used ${usedCredits} out of ${appLimit} available app unlocks.` 
                : `Has usado ${usedCredits} de ${appLimit} aplicaciones disponibles.`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-black text-color-base-content">{creditsRemaining}</div>
              <div className="text-[10px] uppercase tracking-widest text-color-base-content/60">
                {language === 'en' ? 'Credits Left' : 'Créditos Restantes'}
              </div>
            </div>
            {creditsRemaining === 0 && (
              <Link href="/plans">
                <GlowButton className="text-xs h-10 px-6">
                  {language === 'en' ? 'Upgrade Plan' : 'Mejorar Plan'}
                </GlowButton>
              </Link>
            )}
          </div>
        </div>
      )}

      {hasNoPlan && (
        <div className="bg-linear-to-r from-color-primary/20 via-color-accent-pink/20 to-color-primary/20 border border-color-base-content/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-color-base-content">
              {language === 'en' ? 'Choose a plan to unlock your apps' : 'Elige un plan para desbloquear tus apps'}
            </h3>
            <p className="text-sm text-color-base-content/60">
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
            <h2 className="text-xl font-black text-color-base-content uppercase italic tracking-tighter">
              {category}
            </h2>
            <div className="h-px flex-1 bg-linear-to-r from-color-base-content/20 to-transparent" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categoryApps.map((app) => (
              <AppCard 
                key={app.id} 
                app={app} 
                isLocked={!isAdmin && !hasUnlimitedAccess && !accessibleSlugs.includes(app.slug)} 
                onUnlockClick={handleUnlockClick}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Unlock Confirmation Modal */}
      {unlockingApp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-color-base-content/60 backdrop-blur-md" onClick={() => !isUnlocking && setUnlockingApp(null)} />
          <div className="relative w-full max-w-md bg-color-base-100 border border-color-base-content/10 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <button 
              onClick={() => setUnlockingApp(null)}
              className="absolute top-6 right-6 text-color-base-content/60 hover:text-color-base-content transition-colors"
              disabled={isUnlocking}
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="space-y-6">
              <div className="h-16 w-16 rounded-2xl bg-color-primary/20 flex items-center justify-center text-color-primary mx-auto">
                <Lock className="h-8 w-8" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-color-base-content">
                  {language === 'en' ? 'Unlock App' : 'Desbloquear App'}
                </h3>
                <p className="text-color-base-content/60">
                  {language === 'en' 
                    ? `Do you want to permanently unlock "${unlockingApp.name_en || unlockingApp.name_es}"?` 
                    : `¿Deseas desbloquear permanentemente "${unlockingApp.name_es}"?`}
                </p>
              </div>

              {unlockError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl text-center">
                  {unlockError}
                </div>
              )}

              {creditsRemaining > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm p-4 rounded-xl bg-color-base-content/5 border border-color-base-content/10">
                    <span className="text-color-base-content/60">{language === 'en' ? 'Credits Remaining:' : 'Créditos Restantes:'}</span>
                    <span className="font-bold text-color-base-content">{creditsRemaining}</span>
                  </div>
                  <GlowButton 
                    className="w-full h-12" 
                    onClick={confirmUnlock}
                    disabled={isUnlocking}
                  >
                    {isUnlocking ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      language === 'en' ? 'Confirm Unlock (1 Credit)' : 'Confirmar Desbloqueo (1 Crédito)'
                    )}
                  </GlowButton>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm p-4 rounded-xl text-center">
                    {language === 'en' 
                      ? 'You have no credits remaining. Upgrade your plan to unlock more apps.' 
                      : 'No te quedan créditos. Mejora tu plan para desbloquear más apps.'}
                  </div>
                  <Link href="/plans" className="block">
                    <GlowButton className="w-full h-12">
                      {language === 'en' ? 'Upgrade Plan' : 'Mejorar Plan'}
                    </GlowButton>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
