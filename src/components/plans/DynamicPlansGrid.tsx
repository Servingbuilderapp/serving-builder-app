'use client'

import React, { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { Check, Sparkles, LayoutGrid, X, CreditCard, ShieldCheck, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlassCard } from '@/components/ui/GlassCard'
import { useToast } from '@/components/ui/ToastProvider'
import { Input } from '@/components/ui/Input'

interface DynamicPlansGridProps {
  plans: any[]
  currentPlanId: string | null
}

export function DynamicPlansGrid({ plans, currentPlanId }: DynamicPlansGridProps) {
  const { language } = useTranslation()
  const { toast } = useToast()
  
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Checkout Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    card_holder: '',
    expiry: '09/28',
    cvc: '472'
  })

  const generateDemoData = () => {
    const firstNames = ['Carlos', 'Ana', 'Luis', 'María', 'Pedro', 'Sofía', 'Jorge', 'Laura', 'Andrés', 'Valentina']
    const lastNames = ['García', 'López', 'Martínez', 'Rodríguez', 'Hernández', 'Pérez', 'González', 'Sánchez', 'Torres', 'Ramírez']
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const random5 = Math.random().toString(36).substring(2, 7)
    
    setFormData({
      first_name: fName,
      last_name: lName,
      email: `demo_${random5}@gmail.com`,
      card_holder: `${fName} ${lName}`.toUpperCase(),
      expiry: `${Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0')}/${Math.floor(Math.random() * 5 + 25)}`,
      cvc: Math.floor(Math.random() * 899 + 100).toString()
    })
  }

  const handleOpenModal = (plan: any) => {
    if (plan.id === currentPlanId) {
      toast({
        title: language === 'en' ? "You already have this plan active" : "Ya tienes este plan activo",
        type: 'success'
      })
      return
    }
    setSelectedPlan(plan)
    generateDemoData()
    setIsModalOpen(true)
  }

  const handleConfirmPayment = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/webhooks/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'payment.completed',
          customer: {
            email: formData.email,
            first_name: formData.first_name,
            last_name: formData.last_name
          },
          plan: selectedPlan.slug,
          source: 'self-service',
          transaction_id: `self_${Math.random().toString(36).substring(2, 10)}`,
          amount: selectedPlan.price_monthly,
          currency: 'USD'
        })
      })

      const data = await response.json()

      if (response.ok) {
        setIsModalOpen(false)
        toast({
          title: language === 'en' 
            ? `Plan activated! Welcome to the ${selectedPlan.name_en} plan` 
            : `¡Plan activado! Bienvenido al plan ${selectedPlan.name_es}`,
          type: 'success'
        })
        
        if (data.generated_password) {
          toast({
            title: `Password: ${data.generated_password}`,
            type: 'success'
          })
        }

        // Recargar para actualizar estado
        setTimeout(() => window.location.reload(), 2000)
      } else {
        toast({
          title: data.error || (language === 'en' ? "Payment failed" : "Error en el pago"),
          type: 'error'
        })
      }
    } catch (error: any) {
      toast({
        title: language === 'en' ? "Connection error" : "Error de conexión",
        type: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {plans.map((plan) => {
        const isCurrent = plan.id === currentPlanId
        const features = language === 'en' ? plan.items_en : plan.items_es
        
        return (
          <div key={plan.id} className={cn(
            "relative group flex flex-col h-full bg-white/5 border rounded-3xl p-8 transition-all duration-500 overflow-hidden",
            isCurrent ? "border-color-primary shadow-[0_0_40px_rgba(139,92,246,0.2)]" : "border-white/10 hover:border-white/20"
          )}>
            <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            {isCurrent && (
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-color-primary text-[10px] font-black uppercase tracking-widest text-white animate-pulse">
                {language === 'en' ? 'Current Plan' : 'Plan Actual'}
              </div>
            )}

            <div className="relative space-y-6 flex-1">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {language === 'en' ? plan.name_en : plan.name_es}
                </h3>
                <p className="text-sm text-white/50 h-10 line-clamp-2">
                  {language === 'en' ? plan.description_en : plan.description_es}
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">${plan.price_monthly}</span>
                <span className="text-sm text-white/40 font-medium">/mo</span>
              </div>

              <div className="space-y-4">
                <div className="h-px bg-white/10 w-full" />
                <ul className="space-y-4">
                  {features.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/80">
                      <div className="mt-1 h-4 w-4 rounded-full bg-color-primary/20 flex items-center justify-center text-color-primary">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 pt-4">
                <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
                  <LayoutGrid className="h-3 w-3" />
                  {language === 'en' ? 'Included Tools' : 'Herramientas Incluidas'}
                </h4>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                  {plan.plan_apps?.map((pa: any) => (
                    <div 
                      key={pa.app_id} 
                      className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:border-color-primary/40 transition-colors" 
                      title={language === 'en' ? pa.micro_apps?.name_en : pa.micro_apps?.name_es}
                    >
                      <Sparkles className="h-3 w-3" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 relative">
              <GlowButton 
                onClick={() => handleOpenModal(plan)}
                className="w-full py-4 text-sm font-bold"
                variant={isCurrent ? "ghost" : "primary"}
              >
                {language === 'en' ? 'Instant Access' : 'Acceso Instantáneo'}
              </GlowButton>
            </div>
          </div>
        )
      })}

      {/* Checkout Modal */}
      {isModalOpen && selectedPlan && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false) }}
        >
          <GlassCard className="w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Demo Banner */}
            <div className="bg-yellow-500/20 border-b border-yellow-500/30 py-2 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500">
                🧪 DEMO MODE — {language === 'en' ? 'Payment Simulation' : 'Simulación de pago'}
              </p>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {language === 'en' ? selectedPlan.name_en : selectedPlan.name_es}
                  </h2>
                  <p className="text-color-primary font-bold">
                    ${selectedPlan.price_monthly}.00/mo
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Credit Card Visual */}
              <div className="relative h-48 w-full rounded-2xl bg-linear-to-br from-color-base-300 to-color-base-200 border border-white/10 p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                  <CreditCard className="h-40 w-40" />
                </div>
                
                <div className="flex justify-between items-start">
                  <div className="h-10 w-14 rounded-md bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
                    <div className="h-6 w-10 rounded bg-yellow-600/40" />
                  </div>
                  <CreditCard className="h-8 w-8 text-white/20" />
                </div>

                <div className="space-y-1">
                  <p className="text-xl font-mono text-white tracking-[0.15em]">4242 4242 4242 4242</p>
                  <div className="flex justify-between items-end">
                    <div className="space-y-0.5">
                      <p className="text-[8px] uppercase tracking-widest text-white/30">Card Holder</p>
                      <p className="text-xs font-bold text-white/80">{formData.card_holder}</p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="text-[8px] uppercase tracking-widest text-white/30">Expires</p>
                      <p className="text-xs font-bold text-white/80">{formData.expiry}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'First Name' : 'Nombre'}</label>
                    <Input 
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Last Name' : 'Apellido'}</label>
                    <Input 
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">{language === 'en' ? 'Email Address' : 'Correo Electrónico'}</label>
                  <Input 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-2">
                <GlowButton 
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                  className="w-full py-4 font-bold"
                  variant="primary"
                >
                  {isProcessing ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      {language === 'en' ? '🔒 Confirm Payment' : '🔒 Confirmar Pago'}
                    </div>
                  )}
                </GlowButton>
                
                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-white/30 uppercase tracking-widest font-bold">
                  <ShieldCheck className="h-3 w-3" />
                  {language === 'en' ? 'Secured by DemoPay' : 'Protegido por DemoPay'}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}

function RefreshCw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}
