'use client'

import React, { useEffect, useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/ToastProvider'
import { Lock, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [listo, setListo] = useState(false)

  useEffect(() => {
    // El enlace de recuperación deja la sesión lista automáticamente al cargar esta página
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setListo(true)
      }
    })

    // Por si el evento ya pasó antes de montar el listener
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setListo(true)
    })

    return () => authListener.subscription.unsubscribe()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast({ title: 'La contraseña debe tener al menos 6 caracteres', type: 'error' })
      return
    }
    if (password !== confirmPassword) {
      toast({ title: 'Las contraseñas no coinciden', type: 'error' })
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      toast({ title: error.message, type: 'error' })
    } else {
      toast({ title: '¡Contraseña actualizada con éxito!', type: 'success' })
      router.push('/login')
    }
  }

  return (
    <GlassCard className="p-8 w-full">
      <div className="flex flex-col items-center mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-color-primary to-color-accent-pink shadow-lg shadow-color-primary/20 mb-4">
          <span className="text-2xl font-bold text-white">A</span>
        </div>
        <h1 className="text-2xl font-black text-color-base-content uppercase tracking-tighter">
          ARQUITECTURA<span className="text-color-primary">DIGITAL</span>
        </h1>
        <p className="text-sm text-color-base-content/60 mt-2 text-center">
          Escribe tu nueva contraseña
        </p>
      </div>

      {!listo ? (
        <div className="text-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-color-primary" />
          <p className="text-xs text-color-base-content/60 mt-3">Verificando tu enlace de recuperación...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Nueva contraseña"
            icon={<Lock className="h-4 w-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Confirmar contraseña"
            icon={<Lock className="h-4 w-4" />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <GlowButton type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Guardar nueva contraseña'}
          </GlowButton>
        </form>
      )}
    </GlassCard>
  )
}
