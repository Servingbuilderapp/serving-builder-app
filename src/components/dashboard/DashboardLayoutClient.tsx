'use client'

import React, { useState } from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'
import { Footer } from '@/components/dashboard/Footer'

interface DashboardLayoutClientProps {
  children: React.ReactNode
  user: any
  profile: any
}

export function DashboardLayoutClient({ children, user, profile }: DashboardLayoutClientProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen w-full overflow-hidden z-0 bg-color-base-100 text-color-base-content relative">
      {/* Ambient Background Orbs (Static & Premium) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        {/* Top-left orange→violet orb (hero orb) */}
        <div 
          className="absolute -top-40 -left-72 w-225 h-225 rounded-full opacity-20"
          style={{ 
            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.2) 0%, rgba(139, 92, 246, 0.1) 40%, transparent 70%)',
            filter: 'blur(80px)'
          }} 
        />
        {/* Top-right violet orb */}
        <div 
          className="absolute -top-16 -right-10 w-105 h-105 rounded-full opacity-20"
          style={{ 
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
            filter: 'blur(40px)'
          }} 
        />
        {/* Bottom-right orange orb */}
        <div 
          className="absolute -bottom-28 -right-20 w-137.5 h-137.5 rounded-full opacity-20"
          style={{ 
            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.1) 0%, transparent 70%)',
            filter: 'blur(40px)'
          }} 
        />
      </div>

      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        profile={profile}
        user={user}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0 z-10 bg-transparent">
        <Header 
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)} 
          user={user} 
          profile={profile} 
        />
        <main className="flex-1 overflow-y-auto w-full p-4 sm:p-6 lg:p-8 relative custom-scrollbar">
          <div className="min-h-full flex flex-col relative z-10">
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </div>
        </main>
      </div>
    </div>
  )
}
