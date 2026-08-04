'use client'

import React from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { CheckCircle2, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlowButton } from '@/components/ui/GlowButton'
import { useRouter } from 'next/navigation'

interface PricingTableProps {
  plans: any[]
  currentPlanId: string | null
}

function formatCOP(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

export function PricingTable({ plans }: PricingTableProps) {
  const { language } = useTranslation()
  const router = useRouter()

  const PlanCard = ({ plan }: { plan: any }) => {
    const features = language === 'en' ? plan.items_en : plan.items_es
    const featured = !!plan.featured

    return (
      <div className={cn(
        "relative group flex flex-col h-full border rounded-3xl p-8 transition-all duration-500 overflow-hidden shadow-2xl bg-white",
        featured
          ? "border-orange-500/40 hover:border-orange-400/60 shadow-xl hover:shadow-2xl ring-1 ring-orange-500/30 md:scale-105"
          : "border-color-base-content/10 hover:border-color-primary/40"
      )}>
        {featured && (
          <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-linear-to-r from-orange-500 to-purple-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1 z-20">
            <Crown className="h-3 w-3" />
            {language === 'en' ? 'Recommended' : 'Recomendado'}
          </div>
        )}

        <div className="relative space-y-6 flex-1">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-color-base-content leading-tight">
              {language === 'en' ? plan.name_en : plan.name_es}
            </h3>
            <p className="text-sm text-color-base-content/60 leading-relaxed">
              {language === 'en' ? plan.description_en : plan.description_es}
            </p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-color-base-content tracking-tighter">
              {formatCOP(plan.price_monthly)}
            </span>
            <span className="text-xs text-color-base-content/40 font-bold uppercase tracking-wide">
              {language === 'en' ? 'one-time' : 'pago único'}
            </span>
          </div>

          <div className="space-y-4 pt-4">
            <div className="h-px bg-color-base-content/10 w-full" />
            <ul className="space-y-4">
              {features.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 mt-1 shrink-0 text-color-primary" />
                  <span className="text-sm font-bold text-color-base-content/70 leading-snug">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8">
          <GlowButton
            onClick={() => router.push(`/contratar?plan=${plan.slug}`)}
            className="w-full py-4 text-sm font-black uppercase tracking-widest"
          >
            {language === 'en' ? 'Start My Project' : 'Iniciar Mi Proyecto'}
          </GlowButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
        {plans.map(plan => <PlanCard key={plan.id} plan={plan} />)}
      </div>
    </div>
  )
}
