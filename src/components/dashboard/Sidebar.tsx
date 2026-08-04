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
  const [isEcoServing, setIsEcoServing] = useState(false)

  useEffect(() => {
    setIsEcoServing(false)
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
      <div
