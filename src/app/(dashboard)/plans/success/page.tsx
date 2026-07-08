'use client'

import React, { useEffect, useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { GlowButton } from '@/components/ui/GlowButton'
import { CheckCircle2, Copy, ArrowRight, Mail, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/ToastProvider'

export default function PaymentSuccessPage() {
  const { language } = useTranslation()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  
  const email = searchParams.get('email')
  const password = searchParams.get('password')
  const isNew = searchParams.get('new') === 'true'

  const copyPassword = () => {
    if (password) {
      navigator.clipboard.writeText(password)
      toast({ title: language === 'en' ? 'Password copied' : 'Contraseña copiada', type: 'success' })
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-20 px-6 text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
      <div className="flex justify-center">
        <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 border border-green-500/30">
          <CheckCircle2 className="h-10 w-10" />
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-black text-white tracking-tight">
          {language === 'en' ? 'Payment Successful!' : '¡Pago Completado con Éxito!'}
        </h1>
        <p className="text-white/40 text-lg">
          {language === 'en' 
            ? 'Your account has been upgraded and all tools are now unlocked.' 
            : 'Tu cuenta ha sido actualizada y todas las herramientas están desbloqueadas.'}
        </p>
      </div>

      {isNew && password && (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 text-left relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldCheck className="h-20 w-20" />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
              <Mail className="h-3 w-3" />
              {language === 'en' ? 'Access Credentials' : 'Credenciales de Acceso'}
            </label>
            <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">Email:</span>
                <span className="text-sm font-bold text-white">{email}</span>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">{language === 'en' ? 'Password:' : 'Contraseña:'}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-bold text-primary">{password}</span>
                  <button onClick={copyPassword} className="p-1.5 hover:bg-white/10 rounded-md transition-colors">
                    <Copy className="h-4 w-4 text-white/40" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-yellow-500/70 italic">
            * {language === 'en' 
                ? 'Please change your password after logging in for the first time.' 
                : 'Por favor, cambia tu contraseña después de iniciar sesión por primera vez.'}
          </p>
        </div>
      )}

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/apps" className="w-full sm:w-auto">
          <GlowButton className="w-full px-12">
            <span className="flex items-center gap-2">
              {language === 'en' ? 'Start Using Apps' : 'Comenzar a usar Apps'}
              <ArrowRight className="h-4 w-4" />
            </span>
          </GlowButton>
        </Link>
        <Link href="/" className="text-white/40 hover:text-white transition-colors text-sm font-bold">
          {language === 'en' ? 'Return to Dashboard' : 'Volver al Panel'}
        </Link>
      </div>
    </div>
  )
}
