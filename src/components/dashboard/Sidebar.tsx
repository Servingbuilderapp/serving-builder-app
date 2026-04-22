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
  
  const currentEmail = profile?.email || user?.email || ''
  const currentRole = (profile?.role || user?.user_metadata?.role || 'user').toLowerCase()
  const role = (currentEmail === 'servingbuilderapp@gmail.com' || currentRole === 'admin') ? 'admin' : 'user'

  const sidebarContent = (
    <div className="flex h-full flex-col glass-sidebar relative overflow-hidden">
      {/* Decorative Gradient Glow behind logo */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-color-primary/10 rounded-full blur-3xl pointer-events-none" />
      {/* Top section: Logo/Brand */}
      <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-white/5">
        <div className="flex items-center gap-3 overflow-hidden">
          <Link href="/" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-color-primary to-color-accent-pink shadow-lg shadow-color-primary/20 hover:scale-105 transition-transform">
            <span className="text-lg font-bold text-white">S</span>
          </Link>
          <span className={cn(
            "text-lg font-black tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-color-primary via-color-accent-pink to-color-accent-violet whitespace-nowrap transition-all duration-300 drop-shadow-sm",
            collapsed && "lg:opacity-0 lg:w-0"
          )} style={{ WebkitTextFillColor: 'transparent', color: 'transparent' }}>
            SERVING <span className="text-white/90">BUILDER</span>
          </span>
        </div>
        
        {/* Mobile close button */}
        <button 
          onClick={onCloseMobile}
          className="lg:hidden p-1 rounded-md text-color-base-content/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 custom-scrollbar">
        <div className={cn("px-4 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 mt-6 transition-all duration-300", collapsed && "lg:text-center lg:opacity-0")}>
          {language === 'en' ? 'Main Menu' : 'Menú Principal'}
        </div>

        {/* Dashboard Link */}
        <Link 
          href="/"
          onClick={() => onCloseMobile()}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black transition-all duration-500 group border relative overflow-hidden",
            pathname === '/' 
              ? "bg-color-primary/20 text-white border-color-primary/50 shadow-[0_0_25px_rgba(249,115,22,0.2)] ring-1 ring-white/20 animate-active-glow" 
              : "bg-transparent text-white/40 border-transparent hover:bg-white/5 hover:text-white"
          )}
        >
          {pathname === '/' && (
            <div className="absolute inset-0 bg-linear-to-br from-color-primary/20 via-transparent to-transparent pointer-events-none" />
          )}
          <LucideIcons.LayoutDashboard className={cn(
            "h-5 w-5 shrink-0 transition-colors",
            pathname === '/' ? "text-white" : "text-color-base-content/40 group-hover:text-white/60"
          )} />
          <span className={cn("whitespace-nowrap transition-all duration-300", collapsed && "lg:hidden")}>
            {language === 'en' ? 'Dashboard' : 'Panel de Control'}
          </span>
        </Link>

        {/* App Library Link */}
        <Link 
          href="/apps"
          onClick={() => onCloseMobile()}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black transition-all duration-500 group border relative overflow-hidden",
            pathname.startsWith('/apps')
              ? "bg-color-primary/20 text-white border-color-primary/50 shadow-[0_0_25px_rgba(249,115,22,0.2)] ring-1 ring-white/20 animate-active-glow" 
              : "bg-transparent text-white/40 border-transparent hover:bg-white/5 hover:text-white"
          )}
        >
          {pathname.startsWith('/apps') && (
            <div className="absolute inset-0 bg-linear-to-br from-color-primary/20 via-transparent to-transparent pointer-events-none" />
          )}
          <LucideIcons.LayoutGrid className={cn(
            "h-5 w-5 shrink-0 transition-colors",
            pathname.startsWith('/apps') ? "text-white" : "text-color-base-content/40 group-hover:text-white/60"
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
              ? "bg-color-primary/20 text-white border-color-primary/50 shadow-[0_0_25px_rgba(249,115,22,0.2)] ring-1 ring-white/20 animate-active-glow" 
              : "bg-transparent text-white/40 border-transparent hover:bg-white/5 hover:text-white"
          )}
        >
          {pathname === '/plans' && (
            <div className="absolute inset-0 bg-linear-to-br from-color-primary/20 via-transparent to-transparent pointer-events-none" />
          )}
          <LucideIcons.CreditCard className={cn(
            "h-5 w-5 shrink-0 transition-colors",
            pathname === '/plans' ? "text-white" : "text-color-base-content/40 group-hover:text-white/60"
          )} />
          <span className={cn("whitespace-nowrap transition-all duration-300", collapsed && "lg:hidden")}>
            {language === 'en' ? 'Plans' : 'Planes'}
          </span>
        </Link>

        {/* Admin Section (Conditional) */}
        {role === 'admin' && (
          <>
            <div className={cn("px-2 text-xs font-semibold text-color-base-content/40 uppercase tracking-wider mb-2 mt-8 transition-all duration-300", collapsed && "lg:text-center lg:opacity-0")}>
              {language === 'en' ? 'Administration' : 'Administración'}
            </div>
            
            {/* Admin Parent Link */}
            <Link 
              href="/admin"
              onClick={() => onCloseMobile()}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 group border mb-1",
                pathname === '/admin'
                  ? "bg-linear-to-br from-color-primary/20 to-color-accent-pink/20 text-white border-color-primary/30 shadow-[0_0_20px_rgba(139,92,246,0.25)] ring-1 ring-white/10" 
                  : "bg-transparent text-color-base-content/60 border-transparent hover:bg-white/5 hover:text-white"
              )}
            >
              <LucideIcons.Shield className={cn(
                "h-5 w-5 shrink-0 transition-colors",
                pathname === '/admin' ? "text-white" : "text-color-base-content/40 group-hover:text-white/60"
              )} />
              <span className={cn("whitespace-nowrap transition-all duration-300", collapsed && "lg:hidden")}>
                {language === 'en' ? 'Admin' : 'Admin'}
              </span>
            </Link>

            {/* Webhooks Child Link */}
            <Link 
              href="/admin/webhooks"
              onClick={() => onCloseMobile()}
              className={cn(
                "flex items-center gap-2 transition-all duration-300 group border border-transparent",
                collapsed 
                  ? "justify-center px-2 ml-0 pl-2 border-l-0 py-2.5 rounded-xl" 
                  : "ml-4 pl-4 py-2 text-xs border-l border-white/10 hover:border-white/30",
                pathname.startsWith('/admin/webhooks')
                  ? "text-white border-l-color-primary font-bold bg-color-primary/5 rounded-r-lg" 
                  : "text-color-base-content/40 hover:text-white/80"
              )}
            >
              <LucideIcons.Radio className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                pathname.startsWith('/admin/webhooks') ? "text-color-primary" : "text-color-base-content/30 group-hover:text-white/40"
              )} />
              <span className={cn("whitespace-nowrap transition-all duration-300", collapsed && "lg:hidden")}>
                Webhooks
              </span>
            </Link>

            {/* Email Child Link */}
            <Link 
              href="/admin/email"
              onClick={() => onCloseMobile()}
              className={cn(
                "flex items-center gap-2 transition-all duration-300 group border border-transparent",
                collapsed 
                  ? "justify-center px-2 ml-0 pl-2 border-l-0 py-2.5 rounded-xl" 
                  : "ml-4 pl-4 py-2 text-xs border-l border-white/10 hover:border-white/30",
                pathname.startsWith('/admin/email')
                  ? "text-white border-l-color-primary font-bold bg-color-primary/5 rounded-r-lg" 
                  : "text-color-base-content/40 hover:text-white/80"
              )}
            >
              <LucideIcons.Mail className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                pathname.startsWith('/admin/email') ? "text-color-primary" : "text-color-base-content/30 group-hover:text-white/40"
              )} />
              <span className={cn("whitespace-nowrap transition-all duration-300", collapsed && "lg:hidden")}>
                Email
              </span>
            </Link>

            {/* Plans Child Link */}
            <Link 
              href="/admin/plans"
              onClick={() => onCloseMobile()}
              className={cn(
                "flex items-center gap-2 transition-all duration-300 group border border-transparent",
                collapsed 
                  ? "justify-center px-2 ml-0 pl-2 border-l-0 py-2.5 rounded-xl" 
                  : "ml-4 pl-4 py-2 text-xs border-l border-white/10 hover:border-white/30",
                pathname.startsWith('/admin/plans')
                  ? "text-white border-l-color-primary font-bold bg-color-primary/5 rounded-r-lg" 
                  : "text-color-base-content/40 hover:text-white/80"
              )}
            >
              <LucideIcons.CreditCard className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                pathname.startsWith('/admin/plans') ? "text-color-primary" : "text-color-base-content/30 group-hover:text-white/40"
              )} />
              <span className={cn("whitespace-nowrap transition-all duration-300", collapsed && "lg:hidden")}>
                {language === 'en' ? 'Plans' : 'Planes'}
              </span>
            </Link>
          </>
        )}
      </nav>

      {/* Bottom section: Collapse Toggle (Desktop only) */}
      <div className="hidden lg:flex p-4 border-t border-white/5">
        <button
          onClick={onToggleCollapse}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-color-base-content/60 hover:text-white hover:bg-white/5 transition-colors"
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
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
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
