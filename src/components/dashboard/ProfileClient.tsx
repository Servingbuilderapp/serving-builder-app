'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { 
  Camera, User, Mail, Calendar, 
  CreditCard, Loader2, CheckCircle2, 
  Shield, Trash2, Upload
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/ToastProvider'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/GlassCard'

// Simple MD5 implementation for Gravatar
function md5(string: string) {
  function md5cycle(x: any, k: any) {
    var a = x[0], b = x[1], c = x[2], d = x[3];
    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176411634);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);

    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);

    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);

    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894946606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054924099);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787280);
    b = ii(b, c, d, a, k[9], 21, -343485551);

    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }

  function cmn(q: any, a: any, b: any, x: any, s: any, t: any) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }
  function ff(a: any, b: any, c: any, d: any, x: any, s: any, t: any) {
    return cmn((b & c) | ((~b) & d), a, b, x, s, t);
  }
  function gg(a: any, b: any, c: any, d: any, x: any, s: any, t: any) {
    return cmn((b & d) | (c & (~d)), a, b, x, s, t);
  }
  function hh(a: any, b: any, c: any, d: any, x: any, s: any, t: any) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a: any, b: any, c: any, d: any, x: any, s: any, t: any) {
    return cmn(c ^ (b | (~d)), a, b, x, s, t);
  }
  function add32(a: any, b: any) {
    return (a + b) & 0xFFFFFFFF;
  }

  function md51(s: string) {
    var txt = '';
    var n = s.length,
      state = [1732584193, -271733879, -1732584194, 271733878],
      i;
    for (i = 64; i <= s.length; i += 64) {
      md5cycle(state, md5blk(s.substring(i - 64, i)));
    }
    s = s.substring(i - 64);
    var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (i = 0; i < s.length; i++)
      tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
    tail[i >> 2] |= 0x80 << ((i % 4) << 3);
    if (i > 55) {
      md5cycle(state, tail);
      for (i = 0; i < 16; i++) tail[i] = 0;
    }
    tail[14] = n * 8;
    md5cycle(state, tail);
    return state;
  }

  function md5blk(s: string) {
    var md5blks = [],
      i;
    for (i = 0; i < 64; i += 4) {
      md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  }

  var hex_chr = '0123456789abcdef'.split('');

  function rhex(n: any) {
    var s = '',
      j = 0;
    for (; j < 4; j++)
      s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F];
    return s;
  }

  function hex(x: any) {
    for (var i = 0; i < x.length; i++) x[i] = rhex(x[i]);
    return x.join('');
  }

  return hex(md51(string));
}

interface ProfileClientProps {
  user: any
  profile: any
}

export function ProfileClient({ user, profile }: ProfileClientProps) {
  const { language } = useTranslation()
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()
  
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || ''
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const brandLogoInputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null)
  const [brandLogoUrl, setBrandLogoUrl] = useState<string | null>(profile?.brand_logo_url || user?.user_metadata?.brand_logo_url || null)
  const [brandName, setBrandName] = useState(profile?.brand_name || user?.user_metadata?.brand_name || '')
  
  const currentEmail = (profile?.email || user?.email || '').toLowerCase().trim()
  const currentRole = (profile?.role || user?.user_metadata?.role || 'user').toLowerCase().trim()
  const isAdmin = (currentEmail === 'servingbuilderapp@gmail.com' || currentRole === 'admin')
  const isWhiteLabelEligible = isAdmin || profile?.plans?.slug === 'professional' || profile?.plans?.slug === 'elite' || profile?.plans?.slug === 'poder-ilimitado'
  
  const hasChanges = formData.firstName !== (profile?.first_name || '') || 
                     formData.lastName !== (profile?.last_name || '') ||
                     brandName !== (profile?.brand_name || user?.user_metadata?.brand_name || '')

  const currentAvatar = avatarUrl || profile?.avatar_url || user?.user_metadata?.avatar_url || null

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (1MB)
    if (file.size > 1024 * 1024) {
      toast({
        title: language === 'en' ? 'File too large (max 1MB)' : 'Archivo demasiado grande (máx 1MB)',
        type: 'error'
      })
      return
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: language === 'en' ? 'Invalid format (PNG, JPG, GIF, WebP)' : 'Formato inválido (PNG, JPG, GIF, WebP)',
        type: 'error'
      })
      return
    }

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update in DB and Metadata
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          firstName: formData.firstName, 
          lastName: formData.lastName, 
          avatarUrl: publicUrl 
        })
      })

      if (!response.ok) throw new Error('Failed to update profile picture')

      setAvatarUrl(publicUrl)
      toast({
        title: language === 'en' ? 'Profile picture updated' : 'Foto de perfil actualizada',
        type: 'success'
      })
      
      // Refresh to update header
      router.refresh()
    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: language === 'en' ? 'Upload failed' : 'Error al subir la imagen',
        type: 'error'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleBrandLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/brand_${Math.random()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('avatars') // Using same bucket for simplicity
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      setBrandLogoUrl(publicUrl)
      
      // Persist immediately like avatar
      await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          brandLogoUrl: publicUrl
        })
      })

      toast({
        title: language === 'en' ? 'Brand logo updated' : 'Logo de marca actualizado',
        type: 'success'
      })
      router.refresh()
    } catch (error: any) {
      toast({ title: language === 'en' ? 'Upload failed' : 'Error al subir', type: 'error' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          firstName: formData.firstName, 
          lastName: formData.lastName,
          brandName,
          brandLogoUrl
        })
      })

      if (response.ok) {
        toast({
          title: language === 'en' ? 'Profile updated successfully' : 'Perfil actualizado con éxito',
          type: 'success'
        })
        router.refresh()
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error: any) {
      toast({ title: error.message, type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white tracking-tight">
          {language === 'en' ? 'Your Profile' : 'Tu Perfil'}
        </h1>
        <p className="text-white/40 text-sm">
          {language === 'en' ? 'Manage your personal information and profile picture.' : 'Gestiona tu información personal y foto de perfil.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar */}
        <div className="md:col-span-1 space-y-6">
          <GlassCard className="p-8 flex flex-col items-center text-center space-y-6 group">
            <div className="relative">
              <div className={cn(
                "h-32 w-32 rounded-full border-2 border-white/10 overflow-hidden bg-[#1a233a] relative shadow-2xl transition-all duration-500 group-hover:border-color-primary/50",
                isUploading && "opacity-50"
              )}>
                {currentAvatar ? (
                  <img 
                    src={currentAvatar} 
                    alt={user.email} 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) {
                        const fallback = parent.querySelector('.avatar-fallback');
                        if (fallback) (fallback as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                
                <div className={cn(
                  "avatar-fallback absolute inset-0 flex items-center justify-center text-4xl font-black text-color-primary bg-linear-to-br from-color-primary/20 to-color-accent-pink/20",
                  currentAvatar ? "hidden" : "flex"
                )}>
                  {profile?.first_name?.[0]}{profile?.last_name?.[0] || user?.email?.[0]?.toUpperCase()}
                </div>
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-1 right-1 h-10 w-10 rounded-full bg-color-primary text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all border-4 border-color-base-100 group-hover:shadow-color-primary/40"
              >
                <Camera className="h-5 w-5" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <div className="space-y-1 w-full">
              <h3 className="text-xl font-bold text-white truncate">
                {profile?.first_name} {profile?.last_name}
              </h3>
              <div className="flex items-center justify-center gap-2">
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                  isAdmin ? "bg-color-primary/20 text-color-primary border-color-primary/30" : "bg-white/5 text-white/40 border-white/10"
                )}>
                  {isAdmin ? 'admin' : (profile?.role || 'user')}
                </span>
              </div>
            </div>

            <div className="w-full pt-6 border-t border-white/5 space-y-4">
              <div className="flex items-center gap-3 text-left">
                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
                    {language === 'en' ? 'Member since' : 'Miembro desde'}
                  </p>
                  <p className="text-sm font-bold text-white/80">
                    {new Date(user.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-left">
                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
                    {language === 'en' ? 'Current Plan' : 'Plan Actual'}
                  </p>
                  <p className="text-sm font-bold text-color-primary">
                    {profile?.plans ? (language === 'en' ? profile.plans.name_en : profile.plans.name_es) : (language === 'en' ? 'No Plan' : 'Sin Plan')}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Form */}
        <div className="md:col-span-2">
          <GlassCard className="p-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">
                  {language === 'en' ? 'First Name' : 'Nombre'}
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-color-primary transition-colors" />
                  <input 
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white focus:outline-hidden focus:border-color-primary/50 focus:ring-1 focus:ring-color-primary/50 transition-all shadow-inner"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">
                  {language === 'en' ? 'Last Name' : 'Apellido'}
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-color-primary transition-colors" />
                  <input 
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white focus:outline-hidden focus:border-color-primary/50 focus:ring-1 focus:ring-color-primary/50 transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">
                {language === 'en' ? 'Email Address' : 'Correo Electrónico'}
              </label>
              <div className="relative opacity-60">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <input 
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full bg-[#0a0f1d]/50 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white/40 cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-white/20 ml-1 italic">
                {language === 'en' ? 'Email cannot be changed for security reasons.' : 'El email no puede cambiarse por razones de seguridad.'}
              </p>
            </div>

            {/* White Label Settings (Conditional) */}
            {isWhiteLabelEligible && (
              <div className="pt-8 border-t border-white/5 space-y-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-color-primary" />
                  <h3 className="text-lg font-bold text-white uppercase tracking-tighter">
                    {language === 'en' ? 'White Label Settings' : 'Configuración de Marca Blanca'}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">
                        {language === 'en' ? 'Brand Name' : 'Nombre de la Marca'}
                      </label>
                      <input 
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="Ej: Mi Agencia AI"
                        className="w-full bg-[#0a0f1d] border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-hidden focus:border-color-primary/50 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">
                        {language === 'en' ? 'Brand Logo' : 'Logo de la Marca'}
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-xl border-2 border-dashed border-white/10 bg-[#0a0f1d] flex items-center justify-center overflow-hidden">
                          {brandLogoUrl ? (
                            <img src={brandLogoUrl} alt="Brand" className="h-full w-full object-contain" />
                          ) : (
                            <Upload className="h-6 w-6 text-white/10" />
                          )}
                        </div>
                        <button 
                          onClick={() => brandLogoInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 hover:text-white transition-all"
                        >
                          {language === 'en' ? 'Upload Logo' : 'Subir Logo'}
                        </button>
                        <input 
                          type="file"
                          ref={brandLogoInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleBrandLogoChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-color-primary/5 rounded-2xl p-6 border border-color-primary/10">
                    <p className="text-xs font-bold text-color-primary uppercase tracking-widest mb-2">
                      {language === 'en' ? 'What is this?' : '¿Qué es esto?'}
                    </p>
                    <p className="text-[11px] text-white/40 leading-relaxed">
                      {language === 'en' 
                        ? 'Your logo and brand name will appear in the results of the apps you generate, replacing our branding. Perfect for agencies and professional use.' 
                        : 'Tu logo y nombre de marca aparecerán en los resultados de las apps que generes, reemplazando nuestra marca. Ideal para agencias y uso profesional.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 flex justify-end">
              <button 
                onClick={handleSaveChanges}
                disabled={!hasChanges || isSaving}
                className={cn(
                  "flex items-center gap-2 px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all",
                  hasChanges 
                    ? "bg-white text-black hover:bg-white/90 shadow-xl shadow-white/5 active:scale-95" 
                    : "bg-white/5 text-white/20 cursor-not-allowed"
                )}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {language === 'en' ? 'Save Changes' : 'Guardar Cambios'}
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
