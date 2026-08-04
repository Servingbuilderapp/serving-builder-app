'use client'

import React, { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlassCard } from '@/components/ui/GlassCard'
import { CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react'
import { PayPalButtons } from '@paypal/react-paypal-js'

const TASA_COP_POR_USD = 3244 // Actualizar periódicamente según la TRM del día

const PLANES: Record<string, { nombre: string; montoCop: number }> = {
  esencial: { nombre: 'Estructuración Esencial', montoCop: 12000000 },
  completo: { nombre: 'Estructuración Completa', montoCop: 17000000 },
}

function formatCOP(v: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)
}

function ContratarContent() {
  const searchParams = useSearchParams()
  const planSlug = searchParams.get('plan') || 'esencial'
  const plan = PLANES[planSlug] || PLANES.esencial
  const montoUsd = Math.round(plan.montoCop / TASA_COP_POR_USD)

  const [step, setStep] = useState<1 | 2>(1)
  const [pais, setPais] = useState<'colombia' | 'internacional' | null>(null)
  const [loading, setLoading] = useState(false)
  const [proyectoId, setProyectoId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    nombreCliente: '',
    nombreIniciativa: '',
    correoCliente: '',
    whatsapp: '',
    aceptaTerminos: false,
  })

  const handleFirmar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.aceptaTerminos || !pais) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/proyectos/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreCliente: formData.nombreCliente,
          correoCliente: formData.correoCliente,
          whatsapp: formData.whatsapp,
          nombreIniciativa: formData.nombreIniciativa,
          planPago: planSlug,
          montoCop: plan.montoCop,
          montoUsd,
          pais,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear el proyecto')
      setProyectoId(data.proyectoId)
      setStep(2)
    } catch (err: any) {
      setError(err.message || 'Hubo un problema. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const mensajeWhatsapp = 'Hola, firme el contrato para el plan ' + plan.nombre + ' (proyecto ' + proyectoId + '). Aqui esta mi comprobante de pago.'
  const mensajeWhatsappUrl = 'https://wa.me/573227008727?text=' + encodeURIComponent(mensajeWhatsapp)

  return (
    <div className="min-h-screen bg-color-base-100 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <GlassCard className="p-8 md:p-10 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-color-base-content">
              {plan.nombre}
            </h1>
            <p className="text-color-base-content/60 text-sm">
              {formatCOP(plan.montoCop)} COP · aprox. ${montoUsd.toLocaleString('en-US')} USD
            </p>
          </div>

          {step === 1 && (
            <form onSubmit={handleFirmar} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-color-base-content/70 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    required
                    value={formData.nombreCliente}
                    onChange={(e) => setFormData({ ...formData, nombreCliente: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-color-base-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-color-base-content/70 mb-2">
                    Nombre del proyecto u organización
                  </label>
                  <input
                    value={formData.nombreIniciativa}
                    onChange={(e) => setFormData({ ...formData, nombreIniciativa: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-color-base-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-color-base-content/70 mb-2">
                    Correo electrónico *
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.correoCliente}
                    onChange={(e) => setFormData({ ...formData, correoCliente: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-color-base-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-color-base-content/70 mb-2">
                    WhatsApp *
                  </label>
                  <input
                    required
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-color-base-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-color-base-content/70 mb-2">
                  ¿Desde dónde vas a pagar? *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPais('colombia')}
                    className={`p-4 rounded-xl border text-sm font-bold transition-all ${pais === 'colombia' ? 'border-color-primary bg-color-primary/10' : 'border-color-base-300'}`}
                  >
                    🇨🇴 Colombia
                  </button>
                  <button
                    type="button"
                    onClick={() => setPais('internacional')}
                    className={`p-4 rounded-xl border text-sm font-bold transition-all ${pais === 'internacional' ? 'border-color-primary bg-color-primary/10' : 'border-color-base-300'}`}
                  >
                    🌎 Otro país
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-color-base-content/5 border border-color-base-content/10 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-color-base-content">
                  Tratamiento de Datos Personales (Habeas Data)
                </h4>
                <div className="text-xs text-color-base-content/70 max-h-32 overflow-y-auto leading-relaxed pr-2">
                  Al aceptar, autorizo a Arquitectura Digital / Serving a recolectar, almacenar y usar mis
                  datos personales y los de mi proyecto exclusivamente para fines de diagnóstico,
                  estructuración, formulación y postulación ante fondos, convocatorias y entidades de
                  financiamiento, de acuerdo con la Ley 1581 de 2012 de Colombia. Puedo solicitar la
                  actualización, corrección o eliminación de mis datos en cualquier momento escribiendo a
                  servingbuilderapp@gmail.com.
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.aceptaTerminos}
                    onChange={(e) => setFormData({ ...formData, aceptaTerminos: e.target.checked })}
                    className="mt-1"
                  />
                  <span className="text-xs font-bold text-color-base-content">
                    Acepto el tratamiento de mis datos personales y confirmo que la información suministrada es veraz.
                  </span>
                </label>
              </div>

              {error && <p className="text-xs text-red-500 font-bold">{error}</p>}

              <GlowButton
                type="submit"
                disabled={!formData.aceptaTerminos || !pais || loading}
                className="w-full py-4 text-sm font-black uppercase tracking-widest"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Firmar y Continuar al Pago'}
              </GlowButton>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-6 text-center">
              <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto" />
              <h2 className="text-xl font-black text-color-base-content">¡Contrato firmado con éxito!</h2>

              {pais === 'colombia' ? (
                <div className="text-left p-6 rounded-2xl bg-color-base-content/5 border border-color-base-content/10 space-y-2">
                  <p className="text-sm font-bold text-color-base-content">Realiza tu transferencia a:</p>
                  <p className="text-sm text-color-base-content/70">Banco: [COMPLETAR]</p>
                  <p className="text-sm text-color-base-content/70">Cuenta: [COMPLETAR]</p>
                  <p className="text-sm text-color-base-content/70">Titular: [COMPLETAR]</p>
                  <p className="text-sm text-color-base-content/70">Valor: {formatCOP(plan.montoCop)}</p>
                  <p className="text-xs text-color-base-content/50 pt-2">
                    Una vez hagas la transferencia, envíanos el comprobante por WhatsApp para activar tu proyecto.
                  </p>
                </div>
              ) : (
                <div className="text-left p-6 rounded-2xl bg-color-base-content/5 border border-color-base-content/10 space-y-4">
                  <p className="text-sm font-bold text-color-base-content">
                    Paga ${montoUsd.toLocaleString('en-US')} USD (equivalente aproximado)
                  </p>
                  <PayPalButtons
                    style={{ layout: 'vertical' }}
                    createOrder={(_data, actions) =>
                      actions.order.create({
                        intent: 'CAPTURE',
                        purchase_units: [
                          {
                            amount: { currency_code: 'USD', value: montoUsd.toString() },
                            description: plan.nombre + ' - Arquitectura Digital',
                          },
                        ],
                      })
                    }
                    onApprove={async (_data, actions) => {
                      if (!actions.order) return
                      await actions.order.capture()
                      alert('¡Pago recibido! En breve activaremos tu proyecto.')
                    }}
                  />
                </div>
                )}

              
                <a href={mensajeWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-color-primary hover:underline"
              >
                Enviar comprobante por WhatsApp
              </a>

              <div className="flex items-center justify-center gap-2 text-[10px] text-color-base-content/40 uppercase tracking-widest font-black pt-4">
                <ShieldCheck className="h-3 w-3" />
                Tus datos están protegidos
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}

export default function ContratarPage() {
  return (
    <Suspense fallback={null}>
      <ContratarContent />
    </Suspense>
  )
}
