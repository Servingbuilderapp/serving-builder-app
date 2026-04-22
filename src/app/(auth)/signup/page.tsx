'use client'

import React, { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/ToastProvider'
import { Mail, Lock, User, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const { language } = useTranslation()
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()
  
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const origin = window.location.origin
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
        emailRedirectTo: `${origin}/login?verified=true`,
      }
    })

    if (error) {
      toast({
        title: error.message,
        type: 'error'
      })
      setLoading(false)
    } else {
      toast({
        title: language === 'en' ? "Success! Please check your email to verify your account." : "¡Éxito! Por favor revisa tu correo para verificar tu cuenta.",
        type: 'success'
      })
      router.push('/login')
    }
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
          {language === 'en' ? "Create your account" : "Crea tu cuenta"}
        </p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="text"
            placeholder={language === 'en' ? "First Name" : "Nombre"}
            icon={<User className="h-4 w-4" />}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <Input
            type="text"
            placeholder={language === 'en' ? "Last Name" : "Apellido"}
            icon={<User className="h-4 w-4" />}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <Input
          type="email"
          placeholder={language === 'en' ? "Email" : "Correo electrónico"}
          icon={<Mail className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder={language === 'en' ? "Password" : "Contraseña"}
          icon={<Lock className="h-4 w-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <GlowButton type="submit" className="w-full mt-2" disabled={loading}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (language === 'en' ? "Create Account" : "Crear Cuenta")}
        </GlowButton>
      </form>

      <div className="mt-6 flex flex-col items-center gap-3 text-sm">
        <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent my-2" />
        <Link href="/login" className="text-color-base-content/70 hover:text-color-primary transition-colors">
          {language === 'en' ? "Already have an account? Sign in" : "¿Ya tienes cuenta? Inicia sesión"}
        </Link>
      </div>
    </GlassCard>
  )
}
