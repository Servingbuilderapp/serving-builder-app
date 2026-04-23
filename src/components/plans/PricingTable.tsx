'use client'

import React, { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { CheckCircle2, Sparkles, LayoutGrid, X, ShieldCheck, Star, Zap, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlassCard } from '@/components/ui/GlassCard'
import { useToast } from '@/components/ui/ToastProvider'
import { PayPalButtons } from "@paypal/react-paypal-js"

interface PricingTableProps {
  plans: any[]
  currentPlanId: string | null
}

export function PricingTable({ plans, currentPlanId }: PricingTableProps) {
  const { language } = useTranslation()
  const { toast } = useToast()
  
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  })

  const handleOpenModal = (plan: any) => {
    if (plan.id === currentPlanId) {
      toast({
        title: language === 'en' ? "You already have this plan active" : "Ya tienes este plan activo",
        type: 'success'
      })
      return
    }
    setSelectedPlan(plan)
    setIsModalOpen(true)
  }

  // Tiers logic
  const tier1 = plans.filter(p => p.price_monthly === 0)
  const tier2 = plans.filter(p => p.price_monthly > 0 && p.price_monthly < 100)
  const tier3 = plans.filter(p => p.price_monthly >= 100)

  const getPlanStyles = (plan: any) => {
    const price = plan.price_monthly
    if (price === 0) {
      return {
        card: "border-blue-500/30 bg-blue-500/10 hover:border-blue-500/50 shadow-blue-500/10",
        badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        icon: "text-blue-400",
        button: "ghost",
        accent: "from-blue-500/15 via-transparent to-blue-500/5"
      }
    }
    if (price < 100) {
      return {
        card: "border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-500/50 shadow-emerald-500/10",
        badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        icon: "text-emerald-400",
        button: "primary",
        accent: "from-emerald-500/15 via-transparent to-emerald-500/5"
      }
    }
    return {
      card: "border-purple-500/40 bg-purple-900/20 hover:border-purple-400/60 shadow-purple-500/20 ring-1 ring-purple-500/30",
      badge: "bg-linear-to-r from-orange-500 via-red-500 to-purple-600 text-white border-transparent shadow-lg shadow-purple-500/20",
      icon: "text-orange-400",
      button: "primary",
      accent: "from-purple-600/20 via-red-500/10 to-orange-500/10",
      premium: true
    }
  }

  const PlanCard = ({ plan }: { plan: any }) => {
    const isCurrent = plan.id === currentPlanId
    const styles = getPlanStyles(plan)
    const features = language === 'en' ? plan.items_en : plan.items_es

    return (
      <div className={cn(
        "relative group flex flex-col h-full border rounded-3xl p-8 transition-all duration-500 overflow-hidden shadow-2xl",
        styles.card,
        isCurrent && "ring-2 ring-white/20"
      )}>
        {/* Background Gradient Effect */}
        <div className={cn(
          "absolute inset-0 bg-linear-to-br opacity-40 group-hover:opacity-100 transition-opacity duration-700 blur-3xl",
          styles.accent
        )} />

        {isCurrent && (
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-white z-20">
            {language === 'en' ? 'Current' : 'Actual'}
          </div>
        )}

        <div className="relative space-y-6 flex-1">
          <div className="space-y-2">
            <div className={cn(
              "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border",
              styles.badge
            )}>
              {styles.premium ? <Crown className="h-3 w-3" /> : <Star className="h-3 w-3" />}
              {plan.price_monthly === 0 ? (language === 'en' ? 'Starter' : 'Explorador') : 
               plan.price_monthly < 100 ? (language === 'en' ? 'Growth' : 'Crecimiento') : 
               (language === 'en' ? 'Premium' : 'Exclusivo')}
            </div>
            <h3 className="text-2xl font-bold text-white leading-tight">
              {language === 'en' ? plan.name_en : plan.name_es}
            </h3>
            <p className="text-sm text-white/50 leading-relaxed">
              {language === 'en' ? plan.description_en : plan.description_es}
            </p>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black text-white tracking-tighter">${plan.price_monthly}</span>
            <span className="text-sm text-white/40 font-medium tracking-wide">/mo</span>
          </div>

          <div className="space-y-4 pt-4">
            <div className="h-px bg-white/10 w-full" />
            <ul className="space-y-4">
              {features.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 group/item">
                  <div className="mt-1 flex-shrink-0">
                    <CheckCircle2 className={cn("h-4 w-4 transition-transform duration-300 group-hover/item:scale-125", styles.icon)} />
                  </div>
                  <span className="text-sm font-bold text-white/70 leading-snug group-hover/item:text-white transition-colors">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 relative">
          <GlowButton 
            onClick={() => handleOpenModal(plan)}
            className={cn(
              "w-full py-4 text-sm font-black uppercase tracking-widest transition-all duration-300",
              styles.premium && "hover:scale-[1.02] active:scale-95"
            )}
            variant={isCurrent ? "ghost" : (styles.premium ? "primary" : styles.button as any)}
          >
            {isCurrent ? (language === 'en' ? 'Active Plan' : 'Plan Activo') : 
             (language === 'en' ? 'Choose Plan' : 'Elegir Plan')}
          </GlowButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-20">
      {/* Tier 1: Explorador */}
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          {tier1.map(plan => <PlanCard key={plan.id} plan={plan} />)}
        </div>
      </div>

      {/* Tier 2: Mid Range */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tier2.map(plan => <PlanCard key={plan.id} plan={plan} />)}
      </div>

      {/* Tier 3: Premium */}
      <div className="flex flex-col md:flex-row justify-center gap-8 items-stretch">
        {tier3.map(plan => (
          <div key={plan.id} className="w-full max-w-xl">
             <PlanCard plan={plan} />
          </div>
        ))}
      </div>

      {/* Checkout Modal (Shared) */}
      {isModalOpen && selectedPlan && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-500"
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false) }}
        >
          <GlassCard className="w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border-white/10">
            <div className="bg-yellow-500/10 border-b border-yellow-500/20 py-3 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500">
                🛡️ {language === 'en' ? 'SECURE CHECKOUT' : 'PAGO SEGURO'}
              </p>
            </div>

            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-white tracking-tighter">
                    {language === 'en' ? selectedPlan.name_en : selectedPlan.name_es}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-orange-500">${selectedPlan.price_monthly}.00</span>
                    <span className="text-xs text-white/40 uppercase font-bold tracking-widest">/ month</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <PayPalButtons
                  style={{ 
                    layout: "vertical",
                    color: "blue",
                    shape: "rect",
                    label: "pay"
                  }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      intent: "CAPTURE",
                      purchase_units: [
                        {
                          amount: {
                            currency_code: "USD",
                            value: selectedPlan.price_monthly.toString(),
                          },
                          description: `${selectedPlan.name_en} Plan Subscription`,
                        },
                      ],
                    });
                  }}
                  onApprove={async (data, actions) => {
                    if (!actions.order) return;
                    setIsProcessing(true);
                    
                    try {
                      const details = await actions.order.capture();
                      
                      const response = await fetch('/api/webhooks/payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          event: 'payment.completed',
                          customer: {
                            email: details.payer?.email_address || 'customer@example.com',
                            first_name: details.payer?.name?.given_name || 'Customer',
                            last_name: details.payer?.name?.surname || ''
                          },
                          plan: selectedPlan.slug,
                          source: 'paypal',
                          transaction_id: details.id,
                          amount: selectedPlan.price_monthly,
                          currency: 'USD'
                        })
                      });

                      const resData = await response.json();

                      if (response.ok) {
                        setIsModalOpen(false);
                        toast({
                          title: language === 'en' ? "Welcome to the family!" : "¡Bienvenido a la familia!",
                          type: 'success'
                        });
                        setTimeout(() => window.location.reload(), 2000);
                      } else {
                         throw new Error(resData.error || 'Failed to update plan');
                      }
                    } catch (error: any) {
                      toast({
                        title: error.message || "Payment error",
                        type: 'error'
                      });
                    } finally {
                      setIsProcessing(false);
                    }
                  }}
                />
                
                <div className="flex items-center justify-center gap-6 text-[10px] text-white/20 uppercase tracking-widest font-black">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3" />
                    SSL SECURE
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    INSTANT ACTIVATION
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
