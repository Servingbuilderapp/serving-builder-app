'use client'

import React, { Suspense, useEffect, useState, useTransition } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/ToastProvider'
import { Mail, Lock, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginContent() {
  const { language } = useTranslation()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const verified = searchParams.get('verified')
    const errorParam = searchParams.get('error')

    if (verified === 'true') {
      toast({
        title: language === 'en' ? "Email Confirmed! Your account has been verified." : "¡Email Confirmado! Tu cuenta ha sido verificada.",
        type: 'success'
      })
    }

    if (errorParam === 'auth-link-failed') {
      toast({
        title: language === 'en' ? "Authentication failed." : "Falló la autenticación.",
        type: 'error'
      })
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        const redirectTo = searchParams.get('redirect') || '/dashboard'
        startTransition(() => {
          router.push(redirectTo)
        })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [searchParams, language, toast, router, supabase.auth])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast({
        title: error.message,
        type: 'error'
      })
      setLoading(false)
    }
  }

  return (
    <GlassCard className="p-8 w-full">
      <div className="flex flex-col items-center mb-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl overflow-hidden mb-4 shadow-lg shadow-color-primary/20">
          <img src="/logo.png" alt="ECO SERVING Logo" className="h-full w-full object-contain" />
        </div>
        <h1 className="text-2xl font-black text-color-base-content uppercase">
          ECO<span className="text-color-primary">SERVING</span>
        </h1>
        <p className="text-sm text-color-base-content/60 mt-2 text-center">
          {language === 'en' ? "Your AI solutions platform" : "Tu plataforma de soluciones IA"}
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
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
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (language === 'en' ? "Sign In" : "Iniciar Sesión")}
        </GlowButton>
      </form>

      <div className="mt-6 flex flex-col items-center gap-3 text-sm">
        <Link href="/forgot-password" className="text-color-base-content/70 hover:text-color-primary transition-colors">
          {language === 'en' ? "Forgot your password?" : "¿Olvidaste tu contraseña?"}
        </Link>
        <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent my-2" />
        <Link href="/signup" className="text-color-base-content/70 hover:text-color-primary transition-colors">
          {language === 'en' ? "Don't have an account? Sign up" : "¿No tienes cuenta? Regístrate"}
        </Link>
      </div>
    </GlassCard>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-color-primary" /></div>}>
      <LoginContent />
    </Suspense>
  )
}
