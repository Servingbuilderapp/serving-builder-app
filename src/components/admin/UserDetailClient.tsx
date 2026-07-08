'use client'

import React, { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { 
  ArrowLeft, Mail, Calendar, Shield, 
  CreditCard, AppWindow, History, CheckCircle2, 
  XCircle, Save, Loader2, Clock, Radio
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useToast } from '@/components/ui/ToastProvider'
import { useRouter } from 'next/navigation'

interface UserDetailClientProps {
  user: any
  plans: any[]
  totalAppsCount: number
  accessibleApps: string[]
  executions: any[]
  payments: any[]
}

export function UserDetailClient({ user, plans, totalAppsCount, accessibleApps, executions, payments }: UserDetailClientProps) {
  const { language } = useTranslation()
  const { toast } = useToast()
  const router = useRouter()
  
  const [selectedPlanId, setSelectedPlanId] = useState(user.plan_id || '')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdatePlan = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch('/api/admin/update-user-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, planId: selectedPlanId || null })
      })

      if (response.ok) {
        toast({ 
          title: language === 'en' ? 'Plan updated successfully' : 'Plan actualizado con éxito', 
          type: 'success' 
        })
        router.refresh()
      } else {
        throw new Error('Failed to update plan')
      }
    } catch (error: any) {
      toast({ title: error.message, type: 'error' })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin"
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {user.first_name} {user.last_name}
          </h1>
          <p className="text-white/40 text-sm">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Info & Plan */}
        <div className="lg:col-span-1 space-y-8">
          {/* User Info Card */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-center">
              <div className="h-24 w-24 rounded-full border-2 border-white/10 flex items-center justify-center text-3xl font-black text-color-primary overflow-hidden shadow-2xl shadow-color-primary/20 bg-linear-to-br from-color-primary/20 to-color-accent-pink/20">
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.first_name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{user.first_name[0]}{user.last_name[0]}</span>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/40 flex items-center gap-2"><Shield className="h-4 w-4" /> {language === 'en' ? 'Role' : 'Rol'}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-lg font-bold text-[10px] uppercase tracking-widest",
                  user.role === 'admin' ? "bg-color-primary/20 text-color-primary border border-color-primary/30" : "bg-white/5 text-white/40"
                )}>{user.role}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/40 flex items-center gap-2"><Calendar className="h-4 w-4" /> {language === 'en' ? 'Joined' : 'Miembro desde'}</span>
                <span className="text-white/80">{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Plan Management Card */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-color-primary" />
              {language === 'en' ? 'Plan Assignment' : 'Asignación de Plan'}
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">{language === 'en' ? 'Active Plan' : 'Plan Activo'}</label>
                <select 
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-color-primary/50"
                >
                  <option value="" className="bg-color-base-300">{language === 'en' ? 'No Plan' : 'Sin Plan'}</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id} className="bg-color-base-300">
                      {language === 'en' ? p.name_en : p.name_es}
                    </option>
                  ))}
                </select>
              </div>

              {user.plan_source && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/40 uppercase text-[10px] font-bold tracking-widest">{language === 'en' ? 'Source:' : 'Fuente:'}</span>
                  <span className="px-2 py-0.5 rounded bg-color-primary/10 text-color-primary text-[10px] font-bold uppercase tracking-widest border border-color-primary/20">
                    {user.plan_source}
                  </span>
                </div>
              )}

              <button 
                onClick={handleUpdatePlan}
                disabled={isUpdating}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-white/90 disabled:opacity-50 transition-all"
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {language === 'en' ? 'Save Changes' : 'Guardar Cambios'}
              </button>
            </div>

            {user.plan_assigned_at && (
              <div className="space-y-4 pt-4 border-t border-white/5 animate-in fade-in zoom-in-95 duration-500">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Calendar className="h-10 w-10" />
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/30">
                      {language === 'en' ? 'Since' : 'Asignado el'}
                    </p>
                    <p className="text-xs font-bold text-white">
                      {new Date(user.plan_assigned_at).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Clock className="h-10 w-10" />
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/30">
                      {language === 'en' ? 'Active for' : 'Tiempo activo'}
                    </p>
                    <p className="text-xs font-bold text-color-primary">
                      {(() => {
                        const days = Math.floor((new Date().getTime() - new Date(user.plan_assigned_at).getTime()) / (1000 * 60 * 60 * 24));
                        if (days === 0) return language === 'en' ? 'Today' : 'Desde hoy';
                        return language === 'en' ? `${days} days ago` : `Hace ${days} días`;
                      })()}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-linear-to-br from-white/5 to-transparent border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-color-primary animate-pulse shadow-[0_0_8px_var(--color-primary)]" />
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                        {language === 'en' ? 'Unlocked Apps' : 'Aplicaciones Desbloqueadas'}
                      </span>
                    </div>
                    <span className="text-xs font-black text-white">
                      {(() => {
                        const currentPlan = plans.find(p => p.id === user.plan_id);
                        // Using accessibleApps count is more accurate as it includes overrides
                        const count = accessibleApps.length;
                        return language === 'en' 
                          ? `${count} of ${totalAppsCount} apps` 
                          : `${count} de ${totalAppsCount} apps`;
                      })()}
                    </span>
                  </div>
                  
                  {/* Visual Progress Bar */}
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-linear-to-r from-color-primary to-color-accent-pink rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (accessibleApps.length / totalAppsCount) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Accessible Apps & History */}
        <div className="lg:col-span-2 space-y-8">
          {/* Accessible Apps Card */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AppWindow className="h-5 w-5 text-color-primary" />
                {language === 'en' ? 'Accessible Apps' : 'Aplicaciones Accesibles'}
              </h3>
              <span className="text-xs font-bold text-white/40 bg-white/5 px-2 py-1 rounded-lg">
                {accessibleApps.length} {language === 'en' ? 'Apps' : 'Apps'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {accessibleApps.length === 0 ? (
                <p className="text-sm text-white/20 italic">{language === 'en' ? 'No apps accessible' : 'Sin acceso a aplicaciones'}</p>
              ) : accessibleApps.map(slug => (
                <div key={slug} className="px-3 py-1.5 rounded-xl bg-color-primary/10 border border-color-primary/20 text-xs font-semibold text-white">
                  {slug}
                </div>
              ))}
            </div>
          </div>

          {/* Payment History Card */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Radio className="h-5 w-5 text-color-primary" />
              {language === 'en' ? 'Payment History' : 'Historial de Pagos'}
            </h3>

            <div className="space-y-4">
              {payments.length === 0 ? (
                <div className="py-12 text-center text-white/20 italic border-2 border-dashed border-white/5 rounded-2xl">
                  {language === 'en' ? 'No payments recorded' : 'Sin pagos registrados'}
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {payments.map(payment => (
                    <div key={payment.id} className="py-4 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40",
                          payment.status === 'processed' ? "text-green-500/50" : "text-red-500/50"
                        )}>
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-white/5 text-white/40 border border-white/10">
                              {payment.source}
                            </span>
                            <p className="text-sm font-bold text-white">
                              {payment.event_type}
                            </p>
                          </div>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">
                            {new Date(payment.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-white">
                          ${payment.normalized_payload?.amount || '0.00'}
                        </p>
                        <p className="text-[10px] text-white/20 uppercase font-bold">
                          {payment.normalized_payload?.currency || 'USD'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Execution History Card */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="h-5 w-5 text-color-primary" />
              {language === 'en' ? 'Execution History' : 'Historial de Ejecuciones'}
            </h3>

            <div className="space-y-4">
              {executions.length === 0 ? (
                <div className="py-12 text-center text-white/20 italic border-2 border-dashed border-white/5 rounded-2xl">
                  {language === 'en' ? 'No executions yet' : 'Sin ejecuciones registradas'}
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {executions.map(ex => (
                    <div key={ex.id} className="py-4 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-color-primary transition-colors">
                          <History className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            {language === 'en' 
                              ? (ex.micro_apps?.name_en || ex.app_id) 
                              : (ex.micro_apps?.name_es || ex.app_id)}
                          </p>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest">
                            {new Date(ex.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        ex.status === 'completed' ? "bg-green-500/20 text-green-500" :
                        ex.status === 'error' ? "bg-red-500/20 text-red-500" :
                        "bg-white/5 text-white/40"
                      )}>
                        {ex.status === 'completed' ? <CheckCircle2 className="h-3 w-3" /> :
                         ex.status === 'error' ? <XCircle className="h-3 w-3" /> :
                         <Loader2 className="h-3 w-3 animate-spin" />}
                        {ex.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
