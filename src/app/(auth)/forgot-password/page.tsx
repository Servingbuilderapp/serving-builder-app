'use client'

import React, { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/ToastProvider'
import { Mail, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const { language } = useTranslation()
  const { toast } = useToast()
  const supabase = createClient()
  
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const origin = window.location.origin
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/login`,
    })

    if (error) {
      toast({
        title: error.message,
        type: 'error'
      })
    } else {
      toast({
        title: language === 'en' ? "Recovery email sent! Please check your inbox." : "¡Correo de recuperación enviado! Por favor revisa tu bandeja.",
        type: 'success'
      })
      setEmail('')
    }
    setLoading(false)
  }

  return (
    <GlassCard className="p-8 w-full">
      <div className="flex flex-col items-center mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-color-primary to-color-accent-pink shadow-lg shadow-color-primary/20 mb-4">
          <span className="text-2xl font-bold text-white">S</span>
        </div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-color-primary to-color-accent-pink" style={{ WebkitTextFillColor: 'transparent', color: 'transparent' }}>
          SERVING BUILDER APP
        </h1>
        <p className="text-sm text-color-base-content/60 mt-2 text-center">
          {language === 'en' ? "Reset your password" : "Recupera tu contraseña"}
        </p>
      </div>

      <form onSubmit={handleReset} className="space-y-4">
        <Input
          type="email"
          placeholder={language === 'en' ? "Email" : "Correo electrónico"}
          icon={<Mail className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <GlowButton type="submit" className="w-full mt-2" disabled={loading}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (language === 'en' ? "Send recovery link" : "Enviar enlace de recuperación")}
        </GlowButton>
      </form>

      <div className="mt-6 flex flex-col items-center gap-3 text-sm">
        <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent my-2" />
        <Link href="/login" className="flex items-center gap-2 text-color-base-content/70 hover:text-color-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {language === 'en' ? "Back to sign in" : "Volver a iniciar sesión"}
        </Link>
      </div>
    </GlassCard>
  )
}
