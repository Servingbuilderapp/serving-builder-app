'use client'

import React, { useEffect, useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { Menu, Search, Bell, LogOut, User as UserIcon, Settings, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface UserMetadata {
  first_name?: string
  last_name?: string
  role?: string
  avatar_url?: string
}

interface User {
  id: string
  email?: string
  user_metadata: UserMetadata
}

interface HeaderProps {
  onToggleMobileSidebar: () => void
  user?: User
  profile?: any
}

export function Header({ onToggleMobileSidebar, user, profile }: HeaderProps) {
  const { language } = useTranslation()
  const router = useRouter()
  const supabase = createClient()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // Calculate User Info during render for reliability
  const currentEmail = (profile?.email || user?.email || '').toLowerCase().trim()
  const currentRoleFromProfile = (profile?.role || '').toLowerCase().trim()
  const currentRoleFromMetadata = (user?.user_metadata?.role || '').toLowerCase().trim()
  
  const displayRole = (
    currentEmail === 'servingbuilderapp@gmail.com' || 
    currentRoleFromProfile === 'admin' || 
    currentRoleFromMetadata === 'admin'
  ) ? 'admin' : (currentRoleFromProfile || currentRoleFromMetadata || 'user')

  const firstName = profile?.first_name || user?.user_metadata?.first_name || ''
  const lastName = profile?.last_name || user?.user_metadata?.last_name || ''
  const fullNameFromProfile = profile?.full_name || ''
  const fullNameFromMetadata = (firstName && lastName) ? `${firstName} ${lastName}`.trim() : (firstName || lastName)
  const displayUserName = fullNameFromProfile || fullNameFromMetadata || currentEmail || 'User'
  const displayUserInitial = displayUserName.charAt(0).toUpperCase()
  const displayUserAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || null

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('#user-menu') && !target.closest('#user-avatar')) {
        setDropdownOpen(false)
      }
      if (!target.closest('#notifications-menu') && !target.closest('#notifications-btn')) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="h-16 shrink-0 relative z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 glass-header">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 -ml-2 rounded-lg text-color-base-content/70 hover:text-color-base-content hover:bg-color-base-content/5 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* White Label Logo */}
        {profile?.branding?.logo_url && (
          <div className="hidden lg:flex items-center gap-3 mr-4">
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg">
              <img src={profile.branding.logo_url} alt="Brand Logo" className="h-full w-full object-contain" />
            </div>
            <span className="text-sm font-black tracking-widest text-color-base-content/60 uppercase">
              {profile.branding.name}
            </span>
          </div>
        )}

        {/* Search */}
        <div className="hidden sm:flex items-center relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-color-base-content/40 group-focus-within:text-color-primary transition-colors" />
          <input
            type="text"
            placeholder={language === 'en' ? "Search..." : "Buscar..."}
            className="w-64 bg-color-base-content/5 border border-color-base-content/10 rounded-full py-1.5 pl-9 pr-12 text-sm text-color-base-content placeholder:text-color-base-content/40 focus:outline-none focus:border-color-primary/50 focus:ring-1 focus:ring-color-primary/50 transition-all shadow-inner focus:bg-color-base-content/10"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] font-medium text-color-base-content/50 border border-color-base-content/10 rounded px-1.5 py-0.5 bg-color-base-content/5">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
        {/* Website Link */}
        <Link 
          href="/" 
          target="_blank"
          title={language === 'en' ? 'View Website' : 'Ver Sitio Web'}
          className="flex items-center justify-center h-8 w-8 rounded-full bg-color-base-content/5 border border-color-base-content/10 text-color-base-content/60 hover:text-color-base-content hover:bg-color-base-content/10 hover:border-color-base-content/20 transition-all group shrink-0"
        >
          <Globe className="h-4 w-4 group-hover:scale-110 transition-transform" />
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <LanguageSwitcher />

        {/* Notifications */}
        <div className="relative">
          <button
            id="notifications-btn"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-full text-color-base-content/70 hover:text-color-base-content hover:bg-color-base-content/5 transition-colors group"
          >
            <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-color-accent-pink shadow-[0_0_8px_rgba(236,72,153,0.8)] animate-pulse" />
          </button>

          {notificationsOpen && (
            <div id="notifications-menu" className="absolute right-0 mt-2 w-80 rounded-2xl border border-color-base-content/10 bg-white shadow-[0_20px_50px_rgba(6,78,59,0.1)] p-2 animate-in fade-in slide-in-from-top-2 backdrop-blur-xl z-50">
              <div className="px-3 py-3 border-b border-color-base-content/10 flex items-center justify-between">
                <h3 className="font-bold text-sm text-color-base-content tracking-tight">{language === 'en' ? 'Notifications' : 'Notificaciones'}</h3>
                <span className="text-[10px] bg-color-primary/20 text-color-primary px-2 py-0.5 rounded-full uppercase font-black tracking-tighter ring-1 ring-color-primary/30">2 NEW</span>
              </div>
              <div className="py-2 flex flex-col gap-1 max-h-[350px] overflow-y-auto custom-scrollbar">
                <button className="flex items-start gap-3 w-full p-3 rounded-xl hover:bg-color-base-content/5 transition-all text-left group relative overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-r from-color-primary/0 via-color-primary/5 to-color-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="mt-1 h-2 w-2 rounded-full bg-color-accent-pink shrink-0 shadow-[0_0_8px_rgba(236,72,153,0.8)] animate-pulse" />
                  <div className="relative z-10">
                    <p className="text-sm font-bold text-color-base-content group-hover:text-color-primary transition-colors">
                      {language === 'en' 
                        ? `Welcome to ${profile?.branding?.name || 'ECOSERVING'}!` 
                        : `¡Bienvenido a ${profile?.branding?.name || 'ECOSERVING'}!`}
                    </p>
                    <p className="text-xs text-color-base-content/60 mt-0.5 leading-relaxed">{language === 'en' ? 'Explore all the AI tools we have for you.' : 'Explora todas las herramientas de IA que tenemos para ti.'}</p>
                    <span className="text-[10px] font-bold text-color-base-content/30 mt-2 block uppercase tracking-widest">2m ago</span>
                  </div>
                </button>
                <button className="flex items-start gap-3 w-full p-3 rounded-xl hover:bg-color-base-content/5 transition-all text-left group relative overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-r from-color-primary/0 via-color-primary/5 to-color-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="mt-1 h-2 w-2 rounded-full bg-color-accent-blue shrink-0 shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
                  <div className="relative z-10">
                    <p className="text-sm font-bold text-color-base-content group-hover:text-color-primary transition-colors">{language === 'en' ? 'System Update v16' : 'Actualización del Sistema v16'}</p>
                    <p className="text-xs text-color-base-content/60 mt-0.5 leading-relaxed">{language === 'en' ? 'New high-performance features added.' : 'Nuevas funciones de alto rendimiento añadidas.'}</p>
                    <span className="text-[10px] font-bold text-color-base-content/30 mt-2 block uppercase tracking-widest">1h ago</span>
                  </div>
                </button>
              </div>
              <div className="mt-1 p-2 border-t border-color-base-content/10">
                <button className="w-full py-2 text-xs font-bold text-color-base-content/40 hover:text-color-base-content transition-colors uppercase tracking-widest">
                  {language === 'en' ? 'Clear all' : 'Limpiar todo'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            id="user-avatar"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-color-base-content/5 transition-colors border border-transparent hover:border-color-base-content/10"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-tr from-color-primary to-color-accent-pink shadow-lg shadow-color-primary/20 overflow-hidden border border-color-base-content/10">
              {displayUserAvatar ? (
                <img src={displayUserAvatar} alt={displayUserName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-white">{displayUserInitial}</span>
              )}
            </div>
            <div className="hidden sm:flex flex-col items-start leading-none gap-0.5">
              <span className="text-sm font-semibold text-color-base-content max-w-[100px] truncate">
                {displayUserName}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-color-primary/80">
                {displayRole}
              </span>
            </div>
          </button>

          {dropdownOpen && (
            <div id="user-menu" className="absolute right-0 mt-2 w-56 rounded-2xl border border-color-base-content/10 bg-white shadow-[0_20px_50px_rgba(6,78,59,0.1)] p-1.5 animate-in fade-in slide-in-from-top-2 backdrop-blur-xl">
              <div className="px-3 py-3 border-b border-color-base-content/10 mb-1.5">
                <p className="text-sm font-bold text-color-base-content truncate">{displayUserName}</p>
                <p className="text-xs text-color-base-content/50 truncate mt-0.5">{user?.email}</p>
              </div>
              
              <div className="space-y-1">
                <Link href="/profile">
                  <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-xl hover:bg-color-base-content/5 transition-all text-color-base-content/80 hover:text-color-base-content group text-left">
                    <div className="p-1.5 rounded-lg bg-color-base-content/5 text-color-base-content/40 group-hover:text-color-primary group-hover:bg-color-primary/10 transition-colors">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    {language === 'en' ? 'Profile' : 'Perfil'}
                  </button>
                </Link>
                <Link href="/settings">
                  <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-xl hover:bg-color-base-content/5 transition-all text-color-base-content/80 hover:text-color-base-content group text-left">
                    <div className="p-1.5 rounded-lg bg-color-base-content/5 text-color-base-content/40 group-hover:text-color-primary group-hover:bg-color-primary/10 transition-colors">
                      <Settings className="h-4 w-4" />
                    </div>
                    {language === 'en' ? 'Settings' : 'Configuración'}
                  </button>
                </Link>
              </div>

              <div className="my-1.5 border-t border-color-base-content/10" />
              
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-xl hover:bg-red-500/10 text-red-400/80 hover:text-red-400 transition-all group"
              >
                <div className="p-1.5 rounded-lg bg-red-500/5 text-red-400/40 group-hover:bg-red-500/20 group-hover:text-red-400 transition-colors">
                  <LogOut className="h-4 w-4" />
                </div>
                {language === 'en' ? 'Sign Out' : 'Cerrar Sesión'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
