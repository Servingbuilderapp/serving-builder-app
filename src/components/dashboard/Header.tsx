'use client'

import React, { useEffect, useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { Menu, Search, Bell, LogOut, User as UserIcon, Settings } from 'lucide-react'
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
  const [userName, setUserName] = useState<string>('')
  const [userInitial, setUserInitial] = useState<string>('U')
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  useEffect(() => {
    // Priority 1: Profile table data
    if (profile) {
      const firstName = profile.first_name || ''
      const lastName = profile.last_name || ''
      const fullName = profile.full_name || `${firstName} ${lastName}`.trim()
      const role = (profile.email === 'servingbuilderapp@gmail.com' || (profile.role || 'user').toLowerCase() === 'admin') ? 'admin' : 'user'
      
      setUserRole(role)
      setUserAvatar(profile.avatar_url || null)
      
      if (fullName) {
        setUserName(fullName)
        setUserInitial((profile.full_name || firstName || profile.email || 'U').charAt(0).toUpperCase())
      } else {
        setUserName(profile.email || 'User')
        setUserInitial((profile.email || 'U').charAt(0).toUpperCase())
      }
    } 
    // Priority 2: User metadata fallback
    else if (user) {
      const firstName = user.user_metadata?.first_name || ''
      const lastName = user.user_metadata?.last_name || ''
      const fullName = `${firstName} ${lastName}`.trim()
      const role = (user.email === 'servingbuilderapp@gmail.com' || (user.user_metadata?.role || 'user').toLowerCase() === 'admin') ? 'admin' : 'user'
      
      setUserRole(role)
      setUserAvatar(user.user_metadata?.avatar_url || null)
      
      if (fullName) {
        setUserName(fullName)
        setUserInitial(firstName.charAt(0).toUpperCase())
      } else if (user.email) {
        setUserName(user.email)
        setUserInitial(user.email.charAt(0).toUpperCase())
      }
    }
  }, [user, profile])

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
          className="lg:hidden p-2 -ml-2 rounded-lg text-color-base-content/70 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* White Label Logo */}
        {profile?.branding?.logo_url && (
          <div className="hidden lg:flex items-center gap-3 mr-4">
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg">
              <img src={profile.branding.logo_url} alt="Brand Logo" className="h-full w-full object-contain" />
            </div>
            <span className="text-sm font-black tracking-widest text-white/40 uppercase">
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
            className="w-64 bg-white/5 border border-white/10 rounded-full py-1.5 pl-9 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-color-primary/50 focus:ring-1 focus:ring-color-primary/50 transition-all shadow-inner focus:bg-white/10"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] font-medium text-color-base-content/50 border border-white/10 rounded px-1.5 py-0.5 bg-white/5">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <LanguageSwitcher />

        {/* Notifications */}
        <div className="relative">
          <button
            id="notifications-btn"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-full text-color-base-content/70 hover:text-white hover:bg-white/5 transition-colors group"
          >
            <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-color-accent-pink shadow-[0_0_8px_rgba(236,72,153,0.8)] animate-pulse" />
          </button>

          {notificationsOpen && (
            <div id="notifications-menu" className="absolute right-0 mt-2 w-80 rounded-2xl border border-white/20 bg-color-base-300 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 animate-in fade-in slide-in-from-top-2 backdrop-blur-xl z-50">
              <div className="px-3 py-3 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-sm text-white tracking-tight">{language === 'en' ? 'Notifications' : 'Notificaciones'}</h3>
                <span className="text-[10px] bg-color-primary/20 text-color-primary px-2 py-0.5 rounded-full uppercase font-black tracking-tighter ring-1 ring-color-primary/30">2 NEW</span>
              </div>
              <div className="py-2 flex flex-col gap-1 max-h-[350px] overflow-y-auto custom-scrollbar">
                <button className="flex items-start gap-3 w-full p-3 rounded-xl hover:bg-white/5 transition-all text-left group relative overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-r from-color-primary/0 via-color-primary/5 to-color-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="mt-1 h-2 w-2 rounded-full bg-color-accent-pink shrink-0 shadow-[0_0_8px_rgba(236,72,153,0.8)] animate-pulse" />
                  <div className="relative z-10">
                    <p className="text-sm font-bold text-white group-hover:text-color-primary transition-colors">{language === 'en' ? 'Welcome to SERVING BUILDER APP!' : '¡Bienvenido a SERVING BUILDER APP!'}</p>
                    <p className="text-xs text-color-base-content/60 mt-0.5 leading-relaxed">{language === 'en' ? 'Explore all the AI tools we have for you.' : 'Explora todas las herramientas de IA que tenemos para ti.'}</p>
                    <span className="text-[10px] font-bold text-color-base-content/30 mt-2 block uppercase tracking-widest">2m ago</span>
                  </div>
                </button>
                <button className="flex items-start gap-3 w-full p-3 rounded-xl hover:bg-white/5 transition-all text-left group relative overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-r from-color-primary/0 via-color-primary/5 to-color-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="mt-1 h-2 w-2 rounded-full bg-color-accent-blue shrink-0 shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
                  <div className="relative z-10">
                    <p className="text-sm font-bold text-white group-hover:text-color-primary transition-colors">{language === 'en' ? 'System Update v16' : 'Actualización del Sistema v16'}</p>
                    <p className="text-xs text-color-base-content/60 mt-0.5 leading-relaxed">{language === 'en' ? 'New high-performance features added.' : 'Nuevas funciones de alto rendimiento añadidas.'}</p>
                    <span className="text-[10px] font-bold text-color-base-content/30 mt-2 block uppercase tracking-widest">1h ago</span>
                  </div>
                </button>
              </div>
              <div className="mt-1 p-2 border-t border-white/10">
                <button className="w-full py-2 text-xs font-bold text-color-base-content/40 hover:text-white transition-colors uppercase tracking-widest">
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
            className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-tr from-color-primary to-color-accent-pink shadow-lg shadow-color-primary/20 overflow-hidden border border-white/10">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-white">{userInitial}</span>
              )}
            </div>
            <div className="hidden sm:flex flex-col items-start leading-none gap-0.5">
              <span className="text-sm font-semibold text-white max-w-[100px] truncate">
                {userName || 'User'}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-color-primary/80">
                {userRole}
              </span>
            </div>
          </button>

          {dropdownOpen && (
            <div id="user-menu" className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/20 bg-color-base-300 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-1.5 animate-in fade-in slide-in-from-top-2 backdrop-blur-xl">
              <div className="px-3 py-3 border-b border-white/10 mb-1.5">
                <p className="text-sm font-bold text-white truncate">{userName || 'User'}</p>
                <p className="text-xs text-color-base-content/50 truncate mt-0.5">{user?.email}</p>
              </div>
              
              <div className="space-y-1">
                <Link href="/profile">
                  <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-xl hover:bg-white/5 transition-all text-color-base-content/80 hover:text-white group text-left">
                    <div className="p-1.5 rounded-lg bg-white/5 text-color-base-content/40 group-hover:text-color-primary group-hover:bg-color-primary/10 transition-colors">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    {language === 'en' ? 'Profile' : 'Perfil'}
                  </button>
                </Link>
                <Link href="/settings">
                  <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-xl hover:bg-white/5 transition-all text-color-base-content/80 hover:text-white group text-left">
                    <div className="p-1.5 rounded-lg bg-white/5 text-color-base-content/40 group-hover:text-color-primary group-hover:bg-color-primary/10 transition-colors">
                      <Settings className="h-4 w-4" />
                    </div>
                    {language === 'en' ? 'Settings' : 'Configuración'}
                  </button>
                </Link>
              </div>

              <div className="my-1.5 border-t border-white/10" />
              
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
