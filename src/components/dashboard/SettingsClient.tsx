'use client'

import React, { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/ToastProvider'
import { User, Mail, Save, Loader2, Shield, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SettingsClientProps {
  initialProfile: any
  user: any
}

export function SettingsClient({ initialProfile, user }: SettingsClientProps) {
  const { language } = useTranslation()
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const [firstName, setFirstName] = useState(initialProfile?.first_name || '')
  const [lastName, setLastName] = useState(initialProfile?.last_name || '')
  const [brandName, setBrandName] = useState(initialProfile?.brand_name || '')
  const [brandLogo, setBrandLogo] = useState(initialProfile?.brand_logo_url || '')
  const [loading, setLoading] = useState(false)
  const isProPlan = initialProfile?.plan_slug === 'professional' || initialProfile?.plan_slug === 'elite' || initialProfile?.plan_slug === 'growth'

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: firstName,
          last_name: lastName,
          brand_name: brandName,
          brand_logo_url: brandLogo,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: language === 'en' ? 'Profile updated' : 'Perfil actualizado',
        type: 'success'
      })
      router.refresh()
    } catch (error: any) {
      toast({
        title: error.message,
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <GlassCard className="p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 rounded-full bg-linear-to-tr from-color-primary to-color-accent-pink flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-color-primary/20">
              {(firstName || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {language === 'en' ? 'Personal Information' : 'Información Personal'}
              </h2>
              <p className="text-sm text-white/40">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70 ml-1">
                {language === 'en' ? 'First Name' : 'Nombre'}
              </label>
              <Input
                placeholder="John"
                icon={<User className="h-4 w-4" />}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70 ml-1">
                {language === 'en' ? 'Last Name' : 'Apellido'}
              </label>
              <Input
                placeholder="Doe"
                icon={<User className="h-4 w-4" />}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-white/70 ml-1">
                Email
              </label>
              <Input
                value={user.email}
                icon={<Mail className="h-4 w-4" />}
                disabled
                className="opacity-50 cursor-not-allowed"
              />
              <p className="text-[10px] text-white/20 mt-1 italic ml-1">
                {language === 'en' ? 'Email cannot be changed directly.' : 'El email no se puede cambiar directamente.'}
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-white/5 my-4" />

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-white/40">
              <Shield className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {language === 'en' ? 'Role:' : 'Rol:'} {initialProfile?.role || 'user'}
              </span>
            </div>
            <GlowButton 
              type="submit" 
              className="gap-2 px-8" 
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {language === 'en' ? 'Save Changes' : 'Guardar Cambios'}
            </GlowButton>
          </div>
        </form>
      </GlassCard>

      {/* Branding Section (Marca Blanca) - Only for Pro/Elite */}
      {isProPlan && (
        <GlassCard className="p-8 border-color-primary/20 bg-color-primary/5">
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-color-primary/20 flex items-center justify-center text-color-primary shadow-lg">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {language === 'en' ? 'Branding & White Label' : 'Identidad de Marca Blanca'}
                </h2>
                <p className="text-xs text-white/40">Personaliza la apariencia de los recursos generados</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 ml-1">Nombre de Marca</label>
                <Input 
                  placeholder="Tu Agencia Pro" 
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70 ml-1">URL del Logo (Transparente)</label>
                <Input 
                  placeholder="https://tu-sitio.com/logo.png" 
                  value={brandLogo}
                  onChange={(e) => setBrandLogo(e.target.value)}
                />
              </div>
            </div>
            
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <p className="text-[10px] text-white/40 italic">
                * Tu logo aparecerá como marca de agua en los resultados finales, eliminando la marca de Serving Builder.
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Team Management (Multi-user) - Agency Plan */}
      {initialProfile?.plan_slug === 'professional' && (
        <GlassCard className="p-8 opacity-60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Gestión de Equipo</h2>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[8px] font-black uppercase text-white/40">Próximamente</span>
              </div>
              <p className="text-sm text-white/40">Añade colaboradores a tu espacio de trabajo de agencia.</p>
            </div>
            <GlowButton variant="ghost" disabled className="text-xs opacity-50">Gestionar Equipo</GlowButton>
          </div>
        </GlassCard>
      )}

      {/* Danger Zone */}
      <div className="pt-8">
        <h3 className="text-sm font-bold text-red-500/80 uppercase tracking-widest mb-4 ml-1">
          {language === 'en' ? 'Danger Zone' : 'Zona de Peligro'}
        </h3>
        <GlassCard className="p-6 border-red-500/20 bg-red-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-white">{language === 'en' ? 'Delete Account' : 'Eliminar Cuenta'}</h4>
              <p className="text-xs text-white/40 mt-1">
                {language === 'en' 
                  ? 'Permanently delete your account and all data. This cannot be undone.' 
                  : 'Elimina permanentemente tu cuenta y todos los datos. Esto no se puede deshacer.'}
              </p>
            </div>
            <button className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all">
              {language === 'en' ? 'Delete Account' : 'Eliminar Cuenta'}
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
