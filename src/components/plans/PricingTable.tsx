'use client'

import React, { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { CheckCircle2, X, ShieldCheck, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlassCard } from '@/components/ui/GlassCard'

interface PricingTableProps {
  plans: any[]
  currentPlanId: string | null
}

const WHATSAPP_NUMBER = '573227008727'

function formatCOP(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

export function PricingTable({ plans }: PricingTableProps) {
  const { language } = useTranslation()

  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
  })

  const handleOpenModal = (plan: any) => {
    setSelectedPlan(plan)
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const planName = language === 'en' ? selectedPlan.name_en : selectedPlan.name_es
    const message = `Hola, quiero iniciar mi proyecto con el plan *${planName}* (${formatCOP(selectedPlan.price_monthly)}).\n\nNombre: ${formData.nombre}\nCorreo: ${formData.email}\nTeléfono: ${formData.telefono}`
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
    setIsModalOpen(false)
  }

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
            onClick={() => handleOpenModal(plan)}
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

      {isModalOpen && selectedPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-color-base-content/60 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false) }}
        >
          <GlassCard className="w-full max-w-md overflow-hidden border-color-base-content/10">
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-color-base-content">
                    {language === 'en' ? selectedPlan.name_en : selectedPlan.name_es}
                  </h2>
                  <p className="text-sm text-color-base-content/60">{formatCOP(selectedPlan.price_monthly)}</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 w-10 rounded-full bg-color-base-content/5 flex items-center justify-center text-color-base-content/40 hover:bg-color-base-content/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-sm text-color-base-content/60">
                {language === 'en'
                  ? "Leave your details and we'll contact you to start the process and sign the data-handling agreement."
                  : 'Déjanos tus datos y te contactamos para iniciar el proceso y firmar el acuerdo de manejo de datos.'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  required
                  placeholder={language === 'en' ? 'Full name' : 'Nombre completo'}
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full rounded-xl border border-color-base-content/10 px-4 py-3 text-sm"
                />
                <input
                  required
                  type="email"
                  placeholder={language === 'en' ? 'Email' : 'Correo electrónico'}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-color-base-content/10 px-4 py-3 text-sm"
                />
                <input
                  required
                  placeholder={language === 'en' ? 'WhatsApp phone' : 'Teléfono WhatsApp'}
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full rounded-xl border border-color-base-content/10 px-4 py-3 text-sm"
                />
                <GlowButton type="submit" className="w-full py-4 text-sm font-black uppercase tracking-widest">
                  {language === 'en' ? 'Continue on WhatsApp' : 'Continuar por WhatsApp'}
                </GlowButton>
                <div className="flex items-center justify-center gap-2 text-[10px] text-color-base-content/40 uppercase tracking-widest font-black">
                  <ShieldCheck className="h-3 w-3" />
                  {language === 'en' ? 'Your data is safe' : 'Tus datos están seguros'}
                </div>
              </form>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
