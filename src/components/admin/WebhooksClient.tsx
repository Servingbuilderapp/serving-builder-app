'use client'

import React, { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { Input } from '@/components/ui/Input'
import { 
  Radio, 
  Send, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Zap, 
  Terminal,
  Shield,
  HelpCircle,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/ToastProvider'

interface WebhookLog {
  id: string
  source: string
  event_type: string
  status: string
  created_at: string
  raw_payload: any
  error_message?: string
}

interface WebhooksClientProps {
  logs: WebhookLog[]
  plans: any[]
}

export function WebhooksClient({ logs: initialLogs, plans }: WebhooksClientProps) {
  const { language } = useTranslation()
  const { toast } = useToast()
  const [logs, setLogs] = useState(initialLogs)
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)

  // Simulator Form State
  const [formData, setFormData] = useState({
    event: 'payment.completed',
    first_name: '',
    last_name: '',
    email: '',
    plan: plans[0]?.slug || 'basic',
    source: 'simulator',
    transaction_id: '',
    amount: plans[0]?.price_monthly || 0,
    currency: 'USD'
  })

  const quickGenerate = () => {
    const firstNames = ['Carlos', 'Ana', 'Luis', 'María', 'Pedro', 'Sofía', 'Jorge', 'Laura', 'Andrés', 'Valentina']
    const lastNames = ['García', 'López', 'Martínez', 'Rodríguez', 'Hernández', 'Pérez', 'González', 'Sánchez', 'Torres', 'Ramírez']
    const randomFirst = firstNames[Math.floor(Math.random() * firstNames.length)]
    const randomLast = lastNames[Math.floor(Math.random() * lastNames.length)]
    const randomId = Math.random().toString(36).substring(7)
    const randomPlan = plans[Math.floor(Math.random() * plans.length)]

    setFormData({
      ...formData,
      first_name: randomFirst,
      last_name: randomLast,
      email: `demo_${randomId}@gmail.com`,
      plan: randomPlan?.slug || 'basic',
      transaction_id: `sim_${randomId}`,
      amount: randomPlan?.price_monthly || 0
    })
  }

  const simulatePayment = async () => {
    setLoading(true)
    setResponse(null)
    try {
      const res = await fetch('/api/webhooks/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: formData.event,
          customer: {
            email: formData.email,
            first_name: formData.first_name,
            last_name: formData.last_name
          },
          plan: formData.plan,
          source: formData.source,
          transaction_id: formData.transaction_id,
          amount: formData.amount,
          currency: formData.currency
        })
      })

      const data = await res.json()
      setResponse({ status: res.status, data })

      if (res.ok) {
        toast({ 
          title: language === 'en' ? 'Webhook simulated successfully' : 'Webhook simulado con éxito', 
          type: 'success' 
        })
        // Refresh logs (simulate refresh)
        const newLog: WebhookLog = {
          id: Math.random().toString(),
          source: formData.source,
          event_type: formData.event,
          status: 'processed',
          created_at: new Date().toISOString(),
          raw_payload: formData
        }
        setLogs([newLog, ...logs])
      } else {
        toast({ 
          title: language === 'en' ? 'Simulation failed' : 'La simulación falló', 
          type: 'error' 
        })
      }
    } catch (err) {
      toast({ title: 'Error network', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: language === 'en' ? 'Copied to clipboard' : 'Copiado al portapapeles', type: 'success' })
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Radio className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Webhooks</h1>
        </div>
        <p className="text-white/40">
          {language === 'en' 
            ? 'Simulate payments and manage processor integration' 
            : 'Simula pagos y gestiona la integración de procesadores'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Simulator Section */}
        <div className="space-y-6">
          <GlassCard className="p-6 border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                {language === 'en' ? 'Payment Simulator' : 'Simulador de Pagos'}
              </h2>
              <button 
                onClick={quickGenerate}
                className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
              >
                ⚡ {language === 'en' ? 'Quick Generate' : 'Generar Demo'}
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/40 uppercase ml-1">Event</label>
                  <select 
                    value={formData.event}
                    onChange={(e) => setFormData({...formData, event: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  >
                    <option value="payment.completed">payment.completed</option>
                    <option value="subscription.cancelled">subscription.cancelled</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/40 uppercase ml-1">Plan</label>
                  <select 
                    value={formData.plan}
                    onChange={(e) => {
                      const p = plans.find(pl => pl.slug === e.target.value)
                      setFormData({...formData, plan: e.target.value, amount: p?.price_monthly || 0})
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.slug}>{p.name_es} (${p.price_monthly})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/40 uppercase ml-1">{language === 'en' ? 'First Name' : 'Nombre'}</label>
                  <Input 
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/40 uppercase ml-1">{language === 'en' ? 'Last Name' : 'Apellido'}</label>
                  <Input 
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/40 uppercase ml-1">Email</label>
                <Input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/40 uppercase ml-1">Transaction ID</label>
                  <Input 
                    value={formData.transaction_id}
                    onChange={(e) => setFormData({...formData, transaction_id: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/40 uppercase ml-1">Source</label>
                  <Input 
                    value={formData.source}
                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                  />
                </div>
              </div>

              <GlowButton 
                onClick={simulatePayment} 
                className="w-full mt-4" 
                disabled={loading}
              >
                {loading ? (language === 'en' ? 'Processing...' : 'Procesando...') : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    {language === 'en' ? 'Simulate Payment' : 'Simular Pago'}
                  </span>
                )}
              </GlowButton>
            </div>
          </GlassCard>

          {response && (
            <div className={cn(
              "p-4 rounded-2xl border animate-in slide-in-from-top-4 duration-300",
              response.status === 200 ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"
            )}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-white/40">Response Status: {response.status}</span>
                {response.status === 200 ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-red-400" />}
              </div>
              <pre className="text-[10px] font-mono text-white/60 overflow-x-auto p-3 bg-black/20 rounded-lg">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Integration Guide Section */}
        <div className="space-y-6">
          <GlassCard className="p-6 border-white/10">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {language === 'en' ? 'Integration Guide' : 'Guía de Integración'}
            </h2>

            <div className="space-y-8">
              <section className="space-y-3">
                <label className="text-xs font-bold text-white/40 uppercase">Webhook URL</label>
                <div className="flex items-center gap-2 bg-black/40 p-3 rounded-xl border border-white/5">
                  <code className="text-xs text-primary font-mono truncate flex-1">
                    https://servingbuilder.vercel.app/api/webhooks/payment
                  </code>
                  <button onClick={() => copyToClipboard('https://servingbuilder.vercel.app/api/webhooks/payment')} className="p-1.5 hover:bg-white/10 rounded-md transition-colors">
                    <Copy className="h-4 w-4 text-white/60" />
                  </button>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-sm font-bold text-primary">1</div>
                  <p className="text-sm text-white/70">
                    {language === 'en' 
                      ? 'Map your payment processor (Stripe, PayPal, Hotmart) to our format using Make.com or Zapier.' 
                      : 'Mapea tu procesador de pagos (Stripe, PayPal, Hotmart) a nuestro formato usando Make.com o Zapier.'}
                  </p>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-sm font-bold text-primary">2</div>
                  <div className="space-y-2 flex-1">
                    <p className="text-sm text-white/70">
                      {language === 'en' ? 'Expected JSON Payload:' : 'Payload JSON esperado:'}
                    </p>
                    <pre className="text-[10px] font-mono text-white/40 bg-black/40 p-3 rounded-xl border border-white/5 overflow-x-auto">
{`{
  "event": "payment.completed",
  "customer": {
    "email": "user@example.com",
    "first_name": "Juan",
    "last_name": "Perez"
  },
  "plan": "professional",
  "source": "stripe",
  "transaction_id": "txn_123"
}`}
                    </pre>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-sm font-bold text-primary">3</div>
                  <p className="text-sm text-white/70">
                    {language === 'en' 
                      ? 'The system will automatically create the user account and send them an email.' 
                      : 'El sistema creará automáticamente la cuenta de usuario y le enviará el acceso.'}
                  </p>
                </div>
              </section>

              <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10 flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-400/80 leading-relaxed">
                  {language === 'en'
                    ? 'Important: Ensure the "plan" slug matches exactly with your database (basic, intermediary, professional).'
                    : 'Importante: Asegúrate de que el slug del "plan" coincida exactamente con tu base de datos (basic, intermediary, professional).'}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Logs Table Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Terminal className="h-5 w-5 text-color-accent-blue" />
            {language === 'en' ? 'Webhook History' : 'Historial de Webhooks'}
          </h2>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/2">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/40 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/20 italic">
                    {language === 'en' ? 'No webhooks recorded yet' : 'No hay webhooks registrados aún'}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          log.status === 'processed' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                        )}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-2 text-white">
                          <Radio className="h-3 w-3 text-color-accent-blue" />
                          {log.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/60 font-mono text-xs">{log.event_type}</td>
                      <td className="px-6 py-4 text-white/80">{log.raw_payload?.customer?.email || 'N/A'}</td>
                      <td className="px-6 py-4 text-white/40 text-xs">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                          className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                        >
                          {expandedLog === log.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </td>
                    </tr>
                    {expandedLog === log.id && (
                      <tr className="bg-black/20">
                        <td colSpan={6} className="px-6 py-4">
                          <pre className="text-[10px] font-mono text-white/50 overflow-x-auto">
                            {JSON.stringify(log.raw_payload, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
