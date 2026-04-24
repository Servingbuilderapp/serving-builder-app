'use client'

import React, { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/ToastProvider'
import { 
  Mail, Server, Shield, User, 
  Lock, Globe, CheckCircle2, AlertTriangle,
  Loader2, FlaskConical, ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmailSettingsClientProps {
  initialSettings: any
  adminName: string
  adminEmail: string
}

export function EmailSettingsClient({ initialSettings, adminName, adminEmail }: EmailSettingsClientProps) {
  const { language } = useTranslation()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    host: initialSettings?.host || '',
    port: initialSettings?.port || 587,
    username: initialSettings?.username || '',
    password: '', // Password is always dots/empty on load
    from_email: initialSettings?.from_email || '',
    from_name: initialSettings?.from_name || '',
  })
  
  const [testRecipient, setTestRecipient] = useState(adminEmail)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(initialSettings?.is_verified || false)
  const [verifiedAt, setVerifiedAt] = useState(initialSettings?.verified_at || null)

  const providers = [
    { name: 'SendGrid', host: 'smtp.sendgrid.net', port: 587, username: 'apikey' },
    { name: 'Gmail SMTP', host: 'smtp.gmail.com', port: 587, username: adminEmail },
    { name: 'Mailgun', host: 'smtp.mailgun.org', port: 587, username: adminEmail },
    { name: 'Amazon SES', host: 'email-smtp.us-east-1.amazonaws.com', port: 587, username: adminEmail },
  ]

  const handleProviderFill = (provider: any) => {
    setFormData({
      ...formData,
      host: provider.host,
      port: provider.port,
      username: provider.username,
      from_email: formData.from_email || adminEmail,
      from_name: formData.from_name || adminName,
    })
    setIsVerified(false) // Reset verification on change
    toast({
      title: language === 'en' ? `Auto-filled with ${provider.name} defaults` : `Auto-completado con valores de ${provider.name}`,
      type: 'success'
    })
  }

  const handleTestEmail = async () => {
    if (!formData.host || !formData.username || !testRecipient) {
      toast({
        title: language === 'en' ? 'Please fill in all required fields' : 'Por favor completa los campos obligatorios',
        type: 'error'
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          test_recipient: testRecipient
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: language === 'en' ? 'Test email sent and settings saved!' : '¡Email enviado y configuración guardada!',
          type: 'success'
        })
        setIsVerified(true)
        setVerifiedAt(new Date().toISOString())
      } else {
        toast({
          title: (language === 'en' ? 'Test Failed: ' : 'Prueba Fallida: ') + (result.message || result.error || 'Error desconocido'),
          type: 'error'
        })
      }
    } catch (error: any) {
      toast({
        title: (language === 'en' ? 'Error: ' : 'Error: ') + error.message,
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className={cn(
        "p-4 rounded-2xl flex items-center gap-4 border animate-in slide-in-from-top-2 duration-500",
        isVerified 
          ? "bg-green-500/10 border-green-500/20 text-green-400" 
          : "bg-amber-500/10 border-amber-500/20 text-amber-400"
      )}>
        {isVerified ? (
          <>
            <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-sm">
                {language === 'en' ? 'SMTP Configured and Verified' : 'SMTP Configurado y Verificado'}
              </p>
              <p className="text-xs opacity-70">
                {language === 'en' ? 'Last verified:' : 'Última verificación:'} {verifiedAt ? new Date(verifiedAt).toLocaleString() : '---'}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-sm">
                {language === 'en' ? 'SMTP Not Configured' : 'SMTP No Configurado'}
              </p>
              <p className="text-xs opacity-70">
                {language === 'en' ? 'Welcome emails are currently disabled.' : 'Los emails de bienvenida están desactivados actualmente.'}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Main Settings Form */}
      <GlassCard className="p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-color-primary/20 text-color-primary">
              <Server className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {language === 'en' ? 'SMTP Settings' : 'Configuración SMTP'}
            </h2>
          </div>

          {/* Provider Badges */}
          <div className="flex flex-wrap gap-2">
            {providers.map((p) => (
              <button
                key={p.name}
                onClick={() => handleProviderFill(p)}
                className="px-3 py-1 rounded-full bg-color-primary/10 border border-color-primary/20 text-[10px] font-black uppercase tracking-widest text-color-primary hover:bg-color-primary/20 transition-all active:scale-95"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                {language === 'en' ? 'SMTP Host' : 'Host SMTP'}
              </label>
              <Input 
                placeholder="smtp.sendgrid.net"
                icon={<Globe className="h-4 w-4" />}
                value={formData.host}
                onChange={(e) => { setFormData({...formData, host: e.target.value}); setIsVerified(false); }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                {language === 'en' ? 'SMTP Port' : 'Puerto SMTP'}
              </label>
              <Input 
                type="number"
                placeholder="587"
                icon={<Shield className="h-4 w-4" />}
                value={formData.port}
                onChange={(e) => { setFormData({...formData, port: parseInt(e.target.value)}); setIsVerified(false); }}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                {language === 'en' ? 'Username' : 'Usuario'}
              </label>
              <Input 
                placeholder="apikey"
                icon={<User className="h-4 w-4" />}
                value={formData.username}
                onChange={(e) => { setFormData({...formData, username: e.target.value}); setIsVerified(false); }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                {language === 'en' ? 'Password' : 'Contraseña'}
              </label>
              <Input 
                type="password"
                placeholder="••••••••"
                icon={<Lock className="h-4 w-4" />}
                value={formData.password}
                onChange={(e) => { setFormData({...formData, password: e.target.value}); setIsVerified(false); }}
              />
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-white/5" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
              {language === 'en' ? 'From Email' : 'Email Remitente'}
            </label>
            <Input 
              placeholder="noreply@domain.com"
              icon={<Mail className="h-4 w-4" />}
              value={formData.from_email}
              onChange={(e) => { setFormData({...formData, from_email: e.target.value}); setIsVerified(false); }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
              {language === 'en' ? 'From Name' : 'Nombre Remitente'}
            </label>
            <Input 
              placeholder="My AI Portal"
              icon={<User className="h-4 w-4" />}
              value={formData.from_name}
              onChange={(e) => { setFormData({...formData, from_name: e.target.value}); setIsVerified(false); }}
            />
          </div>
        </div>
      </GlassCard>

      {/* Test Section */}
      <GlassCard className="p-8 border-color-primary/20 bg-linear-to-br from-color-primary/5 to-transparent">
        <div className="flex flex-col sm:flex-row items-end gap-6">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <FlaskConical className="h-4 w-4 text-color-primary" />
              <h3 className="text-sm font-black uppercase tracking-widest text-white/60">
                {language === 'en' ? 'Test Verification' : 'Verificación de Prueba'}
              </h3>
            </div>
            <Input 
              placeholder="test@example.com"
              icon={<Mail className="h-4 w-4" />}
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
            />
            <p className="text-[10px] text-white/30 italic">
              {language === 'en' ? 'The test is the save button. Successful tests automatically save your settings.' : 'La prueba es el botón de guardar. Las pruebas exitosas guardan tu configuración automáticamente.'}
            </p>
          </div>
          
          <GlowButton 
            onClick={handleTestEmail}
            disabled={isLoading}
            className="h-12 px-8 shrink-0 gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
            {language === 'en' ? 'Send Test Email' : 'Enviar Email de Prueba'}
          </GlowButton>
        </div>
      </GlassCard>
    </div>
  )
}
