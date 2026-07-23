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
    // NOTA: Hemos eliminado por completo el 'onAuthStateChange' automático de este bloque 
    // para evitar que sesiones locales residuales fuercen redirecciones invisibles y generen bucles.
  }, [searchParams, language, toast])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Si estamos en desarrollo local, hacemos bypass directo al panel para evitar fallos de base de datos
    const isDevelopment = window.location.hostname === 'localhost'
    if (isDevelopment) {
      toast({
        title: "Iniciando sesión en entorno local de desarrollo...",
        type: 'success'
      })
      startTransition(() => {
        router.push('/admin/presidencia')
      })
      return
    }

    // Comportamiento de producción estándar
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast({
        title: error.message,
        type: 'error'
      })
      setLoading(false)
    } else if (data?.session) {
      const redirectTo = searchParams.get('redirect') || '/admin/presidencia'
      window.location.href = redirectTo
    }
  }

  return (
    <GlassCard className="p-8 w-full">
      <div className="flex flex-col items-center mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-color-primary to-color-accent-pink shadow-lg shadow-color-primary/20 mb-4">
          <span className="text-2xl font-bold text-white">S</span>
        </div>
        <h1 className="text-2xl font-black text-color-base-content uppercase tracking-tighter">
          SERVING<span className="text-color-primary">FACTORY</span>
        </h1>
        <p className="text-sm text-color-base-content/60 mt-2 text-center">
          Plataforma de estructuración y gobernanza con IA
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          type="email"
          placeholder="Correo electrónico"
          icon={<Mail className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Contraseña"
          icon={<Lock className="h-4 w-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <GlowButton type="submit" className="w-full mt-2" disabled={loading || isPending}>
          {loading || isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Iniciar Sesión"}
        </GlowButton>
      </form>

      <div className="mt-6 flex flex-col items-center gap-3 text-sm">
        <Link href="/forgot-password" id="forgot-password-link" className="text-color-base-content/70 hover:text-color-primary transition-colors">
          ¿Olvidaste tu contraseña?
        </Link>
        <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent my-2" />
        <Link href="/signup" className="text-color-base-content/70 hover:text-color-primary transition-colors">
          ¿No tienes cuenta? Regístrate
        </Link>
      </div>
    </GlassCard>
  )
}

import { createClient as createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    redirect('/admin/presidencia')
  }

  return (
    <Suspense fallback={<div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-color-primary" /></div>}>
      <LoginContent />
    </Suspense>
  )
}