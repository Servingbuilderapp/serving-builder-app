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
    <div className="flex h-screen w-full overflow-hidden z-0 bg-[#0a0f1d] text-color-base-content relative">
      {/* Ambient Background Orbs (Dynamic & High Impact) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        {/* Top-left orange→violet orb */}
        <div 
          className="absolute -top-64 -left-96 w-[1200px] h-[1200px] rounded-full opacity-40 animate-pulse"
          style={{ 
            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.25) 0%, rgba(139, 92, 246, 0.15) 40%, transparent 70%)',
            filter: 'blur(150px)',
            animationDuration: '8s'
          }} 
        />
        {/* Center-right pink orb */}
        <div 
          className="absolute top-1/2 -right-48 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20 animate-pulse"
          style={{ 
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)',
            filter: 'blur(100px)',
            animationDuration: '12s'
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
          className="absolute -bottom-48 -right-48 w-[800px] h-[800px] rounded-full opacity-25 animate-pulse"
          style={{ 
            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.2) 0%, transparent 70%)',
            filter: 'blur(120px)',
            animationDuration: '10s'
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
