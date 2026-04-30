'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'
import { ChevronsLeft, ChevronsRight, X, Sparkles } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Cast for dynamic icon resolution
const Icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
  profile?: any
  user?: any
}

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile, profile, user }: SidebarProps) {
  const { language } = useTranslation()
  const pathname = usePathname()
  const [isEcoServing, setIsEcoServing] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsEcoServing(window.location.hostname.includes('ecoserving') || window.location.hostname.includes('localhost'))
    }
  }, [])
  
  const currentEmail = (profile?.email || user?.email || '').toLowerCase().trim()
  const currentRoleFromProfile = (profile?.role || '').toLowerCase().trim()
  const currentRoleFromMetadata = (user?.user_metadata?.role || '').toLowerCase().trim()
  
  const role = (
    currentEmail === 'servingbuilderapp@gmail.com' || 
    currentRoleFromProfile === 'admin' || 
    currentRoleFromMetadata === 'admin'
  ) ? 'admin' : 'user'

  const firstName = profile?.first_name || user?.user_metadata?.first_name || ''
  const lastName = profile?.last_name || user?.user_metadata?.last_name || ''
  const fullNameFromProfile = profile?.full_name || ''
  const fullNameFromMetadata = (firstName && lastName) ? `${firstName} ${lastName}`.trim() : (firstName || lastName)
  const fullName = fullNameFromProfile || fullNameFromMetadata || user?.email?.split('@')[0] || 'User'

  const sidebarContent = (
    <div className="flex h-full flex-col glass-sidebar relative overflow-hidden border-r-0">
      {/* Vibrant Right Border Glow */}
      <div className="absolute top-0 right-0 w-[2px] h-full bg-linear-to-b from-color-primary via-color-accent-pink to-color-accent-violet opacity-80 shadow-[0_0_15px_rgba(249,115,22,0.5)] z-20" />
      
      {/* Decorative Gradient Glow behind logo */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-color-primary/20 rounded-full blur-3xl pointer-events-none" />
      {/* Top section: Logo/Brand */}
      <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-color-base-content/5">
        <div className="flex items-center gap-3 overflow-hidden">
          {profile?.branding?.logo_url ? (
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg">
              <img src={profile.branding.logo_url} alt="Brand Logo" className="h-full w-full object-contain" />
            </div>
          ) : (
            <Link href="/" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:scale-105 transition-transform overflow-hidden">
              <img src="/logo.png" alt="ECO SERVING Logo" className="h-full w-full object-contain drop-shadow-sm" />
            </Link>
          )}
          
          <span className={cn(
            "text-lg font-black tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-color-primary via-color-accent-pink to-color-accent-violet whitespace-nowrap transition-all duration-300 drop-shadow-sm",
            collapsed && "lg:opacity-0 lg:w-0"
          )} style={{ WebkitTextFillColor: 'transparent', color: 'transparent' }}>
            {isEcoServing ? profile?.branding?.name.toUpperCase() : 'SERVING BUILDER'}
          </span>
        </div>
        
        {/* Mobile close button */}
        <button 
          onClick={onCloseMobile}
          className="lg:hidden p-1 rounded-md text-color-base-content/50 hover:text-color-base-content hover:bg-color-base-content/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 custom-scrollbar">
        <div className={cn("px-4 text-[10px] font-black text-color-base-content/60 uppercase tracking-[0.2em] mb-3 mt-6 transition-all duration-300", collapsed && "lg:text-center lg:opacity-0")}>
          {language === 'en' ? 'Main Menu' : 'Menú Principal'}
        </div>

        {/* Landing Page Link */}
        <Link 
          href="/"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black transition-all duration-500 group border border-transparent text-color-base-content/60 hover:bg-color-base-content/5 hover:text-color-base-content"
          )}
        >
          <LucideIcons.Globe className="h-5 w-5 shrink-0 transition-colors text-color-base-content/40 group-hover:text-color-base-content/80" />
          <span className={cn("whitespace-nowrap transition-all duration-300", collapsed && "lg:hidden")}>
            {language === 'en' ? 'Back to Website' : 'Volver a la Web'}
          </span>
        </Link>

        {/* Dashboard Link */}
        <Link 
          href="/dashboard"
          onClick={() => onCloseMobile()}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black transition-all duration-500 group border relative overflow-hidden",
            pathname === '/dashboard' 
              ? "bg-color-primary/20 text-color-base-content border-color-primary/50 shadow-[0_0_15px_rgba(249,115,22,0.1)] ring-1 ring-color-primary/20 animate-active-glow" 
              : "bg-transparent text-color-base-content/60 border-transparent hover:bg-color-base-content/5 hover:text-color-base-content"
          )}
        >
          {pathname === '/dashboard' && (
            <div className="absolute inset-0 bg-linear-to-br from-color-primary/20 via-transparent to-transparent pointer-events-none" />
          )}
          <LucideIcons.LayoutDashboard className={cn(
            "h-5 w-5 shrink-0 transition-colors",
            pathname === '/' ? "text-color-primary" : "text-color-base-content/40 group-hover:text-color-base-content"
          )} />
          <span className={cn("whitespace-nowrap transition-all duration-300", collapsed && "lg:hidden")}>
            {language === 'en' ? 'Dashboard' : 'Panel de Control'}
          </span>
        </Link>

        {/* Idea Generator Link */}
        <Link 
          href="/ideas"
          onClick={() => onCloseMobile()}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black transition-all duration-500 group border relative overflow-hidden",
            pathname === '/ideas' 
              ? "bg-color-accent-pink/20 text-color-base-content border-color-accent-pink/50 shadow-[0_0_15px_rgba(236,72,153,0.1)] ring-1 ring-color-accent-pink/20 animate-active-glow" 
              : "bg-transparent text-color-base-content/60 border-transparent hover:bg-color-base-content/5 hover:text-color-base-content"
          )}
        >
          {pathname === '/ideas' && (
            <div className="absolute inset-0 bg-linear-to-br from-color-accent-pink/20 via-transparent to-transparent pointer-events-none" />
          )}
          <LucideIcons.Sparkles className={cn(
            "h-5 w-5 shrink-0 transition-colors",
            pathname === '/ideas' ? "text-color-accent-pink" : "text-color-base-content/40 group-hover:text-color-base-content"
          )} />
          <span className={cn("whitespace-nowrap transition-all duration-300", collapsed && "lg:hidden")}>
            {language === 'en' ? 'Idea Generator' : 'Generador de Ideas'}
          </span>
        </Link>
        <Link 
          href="/apps"
          onClick={() => onCloseMobile()}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black transition-all duration-500 group border relative overflow-hidden",
            pathname.startsWith('/apps')
              ? "bg-color-primary/20 text-color-base-content border-color-primary/50 shadow-[0_0_15px_rgba(249,115,22,0.1)] ring-1 ring-color-primary/20 animate-active-glow" 
              : "bg-transparent text-color-base-content/60 border-transparent hover:bg-color-base-content/5 hover:text-color-base-content"
          )}
        >
          {pathname.startsWith('/apps') && (
            <div className="absolute inset-0 bg-linear-to-br from-color-primary/20 via-transparent to-transparent pointer-events-none" />
          )}
          <LucideIcons.LayoutGrid className={cn(
            "h-5 w-5 shrink-0 transition-colors",
            pathname.startsWith('/apps') ? "text-color-primary" : "text-color-base-content/40 group-hover:text-color-base-content"
          )} />
          <span className={cn("whitespace-nowrap transition-all duration-300", collapsed && "lg:hidden")}>
            {language === 'en' ? 'App Library' : 'Librería de Apps'}
          </span>
        </Link>

        {/* Plans Link */}
        <Link 
          href="/plans"
          onClick={() => onCloseMobile()}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black transition-all duration-500 group border relative overflow-hidden",
            pathname === '/plans' 
              ? "bg-color-primary/20 text-color-base-content border-color-primary/50 shadow-[0_0_15px_rgba(249,115,22,0.1)] ring-1 ring-color-primary/20 animate-active-glow" 
              : "bg-transparent text-color-base-content/60 border-transparent hover:bg-color-base-content/5 hover:text-color-base-content"
          )}
        >
          {pathname === '/plans' && (
            <div className="absolute inset-0 bg-linear-to-br from-color-primary/20 via-transparent to-transparent pointer-events-none" />
          )}
          <LucideIcons.CreditCard className={cn(
            "h-5 w-5 shrink-0 transition-colors",
            pathname === '/plans' ? "text-color-primary" : "text-color-base-content/40 group-hover:text-color-base-content"
          )} />
          <span className={cn("whitespace-nowrap transition-all duration-300", collapsed && "lg:hidden")}>
            {language === 'en' ? 'Plans' : 'Planes'}
          </span>
        </Link>

        {/* Admin Section (Conditional) */}
        {role === 'admin' && (
          <>
            <div className={cn("px-4 text-[10px] font-black text-color-base-content/60 uppercase tracking-[0.2em] mb-3 mt-8 transition-all duration-300", collapsed && "lg:text-center lg:opacity-0")}>
              {language === 'en' ? 'Administration' : 'Administración'}
            </div>
            
            {/* Admin Parent Link */}
            <Link 
              href="/admin"
              onClick={() => onCloseMobile()}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black transition-all duration-500 group border mb-1 relative overflow-hidden",
                pathname === '/admin'
                  ? "bg-color-primary/20 text-color-base-content border-color-primary/50 shadow-[0_0_15px_rgba(249,115,22,0.1)] ring-1 ring-color-primary/10 animate-active-glow" 
                  : "bg-transparent text-color-base-content/60 border-transparent hover:bg-color-base-content/5 hover:text-color-base-content"
              )}
            >
              <LucideIcons.Shield className={cn(
                "h-5 w-5 shrink-0 transition-colors",
                pathname === '/admin' ? "text-color-primary" : "text-color-base-content/60 group-hover:text-color-base-content"
              )} />
              <span className={cn("whitespace-nowrap transition-all duration-300", collapsed && "lg:hidden")}>
                {language === 'en' ? 'Admin Panel' : 'Panel Admin'}
              </span>
            </Link>

            {/* Webhooks Child Link */}
            <Link 
              href="/admin/webhooks"
              onClick={() => onCloseMobile()}
              className={cn(
                "flex items-center gap-2 transition-all duration-300 group border border-transparent relative overflow-hidden",
                collapsed 
                  ? "justify-center px-2 ml-0 pl-2 border-l-0 py-2.5 rounded-xl" 
                  : "ml-4 pl-4 py-2.5 text-xs border-l border-color-base-content/10 hover:border-color-primary/30",
                pathname.startsWith('/admin/webhooks')
                  ? "text-color-base-content border-l-color-primary font-black bg-color-primary/10 rounded-r-xl shadow-inner" 
                  : "text-color-base-content/60 hover:text-color-base-content"
              )}
            >
              <LucideIcons.Radio className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                pathname.startsWith('/admin/webhooks') ? "text-color-primary" : "text-color-base-content/40 group-hover:text-color-base-content/60"
              )} />
              <span className={cn("whitespace-nowrap transition-all duration-300 uppercase tracking-widest", collapsed && "lg:hidden")}>
                Webhooks
              </span>
            </Link>

            {/* Email Child Link */}
            <Link 
              href="/admin/email"
              onClick={() => onCloseMobile()}
              className={cn(
                "flex items-center gap-2 transition-all duration-300 group border border-transparent relative overflow-hidden",
                collapsed 
                  ? "justify-center px-2 ml-0 pl-2 border-l-0 py-2.5 rounded-xl" 
                  : "ml-4 pl-4 py-2.5 text-xs border-l border-color-base-content/10 hover:border-color-primary/30",
                pathname.startsWith('/admin/email')
                  ? "text-color-base-content border-l-color-primary font-black bg-color-primary/10 rounded-r-xl shadow-inner" 
                  : "text-color-base-content/60 hover:text-color-base-content"
              )}
            >
              <LucideIcons.Mail className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                pathname.startsWith('/admin/email') ? "text-color-primary" : "text-color-base-content/40 group-hover:text-color-base-content/60"
              )} />
              <span className={cn("whitespace-nowrap transition-all duration-300 uppercase tracking-widest", collapsed && "lg:hidden")}>
                Email
              </span>
            </Link>

            {/* Plans Child Link */}
            <Link 
              href="/admin/plans"
              onClick={() => onCloseMobile()}
              className={cn(
                "flex items-center gap-2 transition-all duration-300 group border border-transparent relative overflow-hidden",
                collapsed 
                  ? "justify-center px-2 ml-0 pl-2 border-l-0 py-2.5 rounded-xl" 
                  : "ml-4 pl-4 py-2.5 text-xs border-l border-color-base-content/10 hover:border-color-primary/30",
                pathname.startsWith('/admin/plans')
                  ? "text-color-base-content border-l-color-primary font-black bg-color-primary/10 rounded-r-xl shadow-inner" 
                  : "text-color-base-content/60 hover:text-color-base-content"
              )}
            >
              <LucideIcons.CreditCard className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                pathname.startsWith('/admin/plans') ? "text-color-primary" : "text-color-base-content/40 group-hover:text-color-base-content/60"
              )} />
              <span className={cn("whitespace-nowrap transition-all duration-300 uppercase tracking-widest", collapsed && "lg:hidden")}>
                {language === 'en' ? 'Plans' : 'Planes'}
              </span>
            </Link>
          </>
        )}
      </nav>
      {/* Bottom section: Profile & Collapse */}
      <div className={cn("mt-auto space-y-4 border-t border-color-base-content/10 bg-color-base-content/5", collapsed ? "p-2" : "p-4")}>
        {/* Profile removed based on user request */}

        <button
          onClick={onToggleCollapse}
          className={cn(
            "flex w-full items-center rounded-xl py-2.5 text-[10px] font-black uppercase tracking-widest text-color-base-content/60 hover:text-color-base-content hover:bg-color-base-content/10 hover:shadow-lg transition-all border border-transparent hover:border-color-base-content/10",
            collapsed ? "justify-center px-0" : "gap-3 px-3"
          )}
        >
          {collapsed ? (
            <ChevronsRight className="h-5 w-5 shrink-0 mx-auto" />
          ) : (
            <>
              <ChevronsLeft className="h-5 w-5 shrink-0" />
              <span className="whitespace-nowrap">
                {language === 'en' ? 'Collapse' : 'Colapsar'}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:block shrink-0 relative z-20 h-full transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-color-base-content/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebarContent}
      </aside>
    </>
  )
}
