'use client'

import React from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { Sparkles, ArrowRight, Settings, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function DashboardPage() {
  const { language } = useTranslation()
  const [greeting, setGreeting] = React.useState('')
  const [emoji, setEmoji] = React.useState('')
  const [userName, setUserName] = React.useState('')
  const [subtitle, setSubtitle] = React.useState('')

  React.useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('first_name, full_name')
          .eq('id', user.id)
          .single()

        let parsedName = profile?.first_name || profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || (language === 'en' ? 'User' : 'Usuario');
        if (parsedName.toLowerCase() === 'servingbuilderapp') {
          parsedName = 'Admin';
        }
        setUserName(parsedName)
      }
    }

    const updateGreeting = () => {
      const hour = new Date().getHours()
      if (hour < 12) {
        setGreeting(language === 'en' ? 'Good morning' : 'Buenos días')
        setEmoji('☀️')
        setSubtitle(language === 'en' ? 'Ready to move your project forward?' : '¿Listo para avanzar con tu proyecto?')
      } else if (hour < 18) {
        setGreeting(language === 'en' ? 'Good afternoon' : 'Buenas tardes')
        setEmoji('🌤️')
        setSubtitle(language === 'en' ? "Let's keep building." : 'Sigamos construyendo tu proyecto.')
      } else {
        setGreeting(language === 'en' ? 'Good evening' : 'Buenas noches')
        setEmoji('🌙')
        setSubtitle(language === 'en' ? 'Reviewing your project?' : '¿Revisando tu proyecto?')
      }
    }

    fetchData()
    updateGreeting()
  }, [language])

  return (
    <div className="w-full max-w-7xl mx-auto p-6 md:p-8 space-y-8 pb-12">
      {/* Personalized Greeting */}
      <div className="mb-2 animate-in fade-in slide-in-from-top-4 duration-700 relative">
        <div className="absolute -left-8 top-0 bottom-0 w-1 bg-linear-to-b from-color-primary to-color-accent-pink rounded-full blur-[2px]" />
        <h2 className="text-2xl md:text-3xl font-black text-color-base-content tracking-tighter italic uppercase flex items-center gap-4">
          {greeting}, <span className="text-gradient-magma drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">{userName || '...'}</span> {emoji}
        </h2>
        <p className="text-color-base-content/60 mt-2 font-black uppercase tracking-[0.3em] text-xs">
          {subtitle}
        </p>
      </div>

      <div className="h-px w-full bg-linear-to-r from-color-base-content/10 via-color-base-content/5 to-transparent mb-8" />

      {/* Header section */}
      <div>
        <h1 className="text-3xl font-bold text-color-base-content tracking-tight">
          {language === 'en' ? 'My Project' : 'Mi Proyecto'}
        </h1>
        <p className="text-color-base-content/60 mt-1">
          {language === 'en' ? 'Track and manage your project structuring process here.' : 'Consulta y gestiona aquí el proceso de estructuración de tu proyecto.'}
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <GlassCard className="p-10 flex flex-col items-center justify-center min-h-[280px] text-center space-y-6 relative group border-color-base-content/10">
            <div className="absolute inset-0 bg-linear-to-br from-color-primary/5 via-transparent to-color-accent-pink/5 opacity-50" />
            <div className="p-6 rounded-full bg-color-base-content/5 border border-color-base-content/10 shadow-2xl relative z-10 group-hover:scale-110 transition-transform">
              <Sparkles className="h-10 w-10 text-color-primary animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-color-base-content">
                {language === 'en' ? 'Your project structuring will appear here' : 'Aquí aparecerá el avance de tu proyecto'}
              </h2>
              <p className="text-color-base-content/60 max-w-md mx-auto mt-2">
                {language === 'en'
                  ? 'Once your process starts, you will be able to track each of the 32 formulation steps from here.'
                  : 'Una vez inicie tu proceso, podrás hacer seguimiento aquí a cada uno de los 32 pasos de formulación.'}
              </p>
            </div>
          </GlassCard>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/plans" className="group">
              <div className="h-full rounded-2xl p-6 bg-linear-to-br from-color-primary/10 to-transparent border border-color-primary/20 hover:border-color-primary/50 transition-colors relative overflow-hidden">
                <div className="absolute inset-0 bg-color-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-color-primary/20 text-color-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-color-base-content">{language === 'en' ? 'View Plans' : 'Ver Planes'}</h3>
                    <p className="text-sm text-color-base-content/60">{language === 'en' ? 'Start or upgrade your structuring plan' : 'Inicia o mejora tu plan de estructuración'}</p>
                  </div>
                </div>
              </div>
            </Link>
            <a href="mailto:servingbuilderapp@gmail.com" className="group cursor-pointer rounded-2xl p-6 bg-linear-to-br from-color-accent-pink/10 to-transparent border border-color-accent-pink/20 hover:border-color-accent-pink/50 transition-colors relative overflow-hidden">
              <div className="absolute inset-0 bg-color-accent-pink/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-color-accent-pink/20 text-color-accent-pink">
                  <Settings className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-color-base-content">{language === 'en' ? 'Help Center' : 'Centro de Ayuda'}</h3>
                  <p className="text-sm text-color-base-content/60">{language === 'en' ? 'Need assistance?' : '¿Necesitas ayuda?'}</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
