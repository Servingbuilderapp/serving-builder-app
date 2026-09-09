'use client'

import React, { useState } from 'react'
import { CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlassCard } from '@/components/ui/GlassCard'
import { cn } from '@/lib/utils'
import { COBRO_COLOMBIA } from '@/lib/mediosDePago'
import { NIVELES_MEMBRESIA, nivelPorSlug, precioAnualUsd, aPesos, formatoUSD } from '@/lib/membresias'

function formatoCOP(valor: number): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor)
}

export default function MembresiaPage() {
  const [nivelSlug, setNivelSlug] = useState<string | null>(null)
  const [ciclo, setCiclo] = useState<'mensual' | 'anual'>('mensual')
  const [pais, setPais] = useState<'colombia' | 'internacional' | null>(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [membresiaId, setMembresiaId] = useState('')
  const [passwordTemporal, setPasswordTemporal] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nombreCliente: '',
    correoCliente: '',
    whatsapp: '',
    aceptaTerminos: false,
  })

  const nivel = nivelSlug ? nivelPorSlug(nivelSlug) : null

  if (!nivel) {
    return (
      <div className="min-h-screen bg-color-base-100 py-16 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-color-base-content">
              Elige tu membresía
            </h1>
            <p className="text-color-base-content/60 text-sm max-w-xl mx-auto">
              Se cobra mes a mes o año a año, la que prefieras. Puedes cambiar de nivel
              más adelante escribiéndonos por WhatsApp.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {NIVELES_MEMBRESIA.map((n) => (
              <GlassCard
                key={n.slug}
                className={cn(
                  'p-7 flex flex-col gap-5',
                  n.slug === 'constructor' && 'ring-2 ring-color-primary/50'
                )}
              >
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-color-base-content">{n.nombre}</h2>
                  <p className="text-color-base-content/60 text-sm">{n.resumen}</p>
                </div>
                <div>
                  <div className="text-2xl font-black text-color-primary">
                    {formatoUSD(n.precioMensualUsd)}<span className="text-xs font-bold text-color-base-content/50 ml-1">/mes</span>
                  </div>
                  <p className="text-xs font-bold text-color-base-content/60 mt-0.5">
                    o {formatoUSD(precioAnualUsd(n))}/año
                  </p>
                </div>
                <ul className="space-y-2 flex-1">
                  {n.incluye.map((linea) => (
                    <li key={linea} className="flex items-start gap-2 text-sm text-color-base-content/80">
                      <CheckCircle2 className="h-4 w-4 text-color-accent-pink shrink-0 mt-0.5" />
                      <span>{linea}</span>
                    </li>
                  ))}
                </ul>
                <GlowButton className="w-full" onClick={() => setNivelSlug(n.slug)}>
                  Elegir {n.nombre}
                </GlowButton>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const montoUsd = ciclo === 'anual' ? precioAnualUsd(nivel) : nivel.precioMensualUsd
  const montoCop = aPesos(montoUsd)

  const handleConfirmar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.aceptaTerminos || !pais) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/membresias/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreCliente: formData.nombreCliente,
          correoCliente: formData.correoCliente,
          whatsapp: formData.whatsapp,
          pais,
          nivel: nivel.slug,
          ciclo,
          montoUsd,
          montoCop: pais === 'colombia' ? montoCop : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear la membresía')
      setMembresiaId(data.membresiaId)
      setPasswordTemporal(data.passwordTemporal || null)
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hubo un problema. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const mensajeWhatsapp =
    'Hola, me suscribí a la membresía ' + nivel.nombre + ' (' + ciclo + '), solicitud ' + membresiaId + '. Aquí está mi comprobante de pago.'
  const mensajeWhatsappUrl = 'https://wa.me/573227008727?text=' + encodeURIComponent(mensajeWhatsapp)

  return (
    <div className="min-h-screen bg-color-base-100 py-16 px-4">
      <div className="max-w-xl mx-auto">
        <GlassCard className="p-7 md:p-9">
          {step === 1 ? (
            <form onSubmit={handleConfirmar} className="space-y-6">
              <div>
                <button
                  type="button"
                  onClick={() => setNivelSlug(null)}
                  className="text-xs font-bold text-color-primary hover:underline mb-3"
                >
                  ← Cambiar de nivel
                </button>
                <h1 className="text-xl font-black text-color-base-content">Membresía {nivel.nombre}</h1>
                <p className="text-color-base-content/60 text-sm mt-1">{nivel.resumen}</p>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-color-base-content/60 mb-2">
                  ¿Cada cuánto pagas?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCiclo('mensual')}
                    className={cn(
                      'p-4 rounded-xl border text-sm font-bold transition-all',
                      ciclo === 'mensual' ? 'border-color-primary bg-color-primary/10' : 'border-color-base-300'
                    )}
                  >
                    Mensual — {formatoUSD(nivel.precioMensualUsd)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCiclo('anual')}
                    className={cn(
                      'p-4 rounded-xl border text-sm font-bold transition-all',
                      ciclo === 'anual' ? 'border-color-primary bg-color-primary/10' : 'border-color-base-300'
                    )}
                  >
                    Anual — {formatoUSD(precioAnualUsd(nivel))}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-color-base-content/60 mb-2">
                  ¿Desde dónde pagas?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPais('colombia')}
                    className={cn(
                      'p-4 rounded-xl border text-sm font-bold transition-all',
                      pais === 'colombia' ? 'border-color-primary bg-color-primary/10' : 'border-color-base-300'
                    )}
                  >
                    Colombia
                  </button>
                  <button
                    type="button"
                    onClick={() => setPais('internacional')}
                    className={cn(
                      'p-4 rounded-xl border text-sm font-bold transition-all',
                      pais === 'internacional' ? 'border-color-primary bg-color-primary/10' : 'border-color-base-300'
                    )}
                  >
                    Otro país
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <input
                  required
                  placeholder="Nombre completo"
                  value={formData.nombreCliente}
                  onChange={(e) => setFormData({ ...formData, nombreCliente: e.target.value })}
                  className="w-full p-3 rounded-xl border border-color-base-300 bg-transparent text-sm"
                />
                <input
                  required
                  type="email"
                  placeholder="Correo electrónico"
                  value={formData.correoCliente}
                  onChange={(e) => setFormData({ ...formData, correoCliente: e.target.value })}
                  className="w-full p-3 rounded-xl border border-color-base-300 bg-transparent text-sm"
                />
                <input
                  required
                  placeholder="WhatsApp (con indicativo de país)"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full p-3 rounded-xl border border-color-base-300 bg-transparent text-sm"
                />
              </div>

              <label className="flex items-start gap-2 text-xs text-color-base-content/70">
                <input
                  type="checkbox"
                  checked={formData.aceptaTerminos}
                  onChange={(e) => setFormData({ ...formData, aceptaTerminos: e.target.checked })}
                  className="mt-0.5"
                />
                Acepto que esta es una suscripción {ciclo === 'anual' ? 'anual' : 'mensual'} y que
                debo renovar el pago cuando venza para seguir teniendo acceso.
              </label>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <GlowButton type="submit" className="w-full" disabled={loading || !pais}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Continuar al pago'}
              </GlowButton>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div>
                <h1 className="text-xl font-black text-color-base-content">¡Ya casi!</h1>
                <p className="text-color-base-content/60 text-sm mt-1">
                  Haz el pago y envíanos el comprobante por WhatsApp para activar tu membresía.
                </p>
                {passwordTemporal && (
                  <p className="text-xs text-color-base-content/60 mt-2">
                    Ya creamos tu acceso al panel. Tu clave temporal es <strong>{passwordTemporal}</strong>,
                    puedes cambiarla al entrar.
                  </p>
                )}
              </div>

              {pais === 'colombia' && COBRO_COLOMBIA.modo === 'transferencia' && COBRO_COLOMBIA.cuenta ? (
                <div className="text-left p-6 rounded-2xl bg-color-base-content/5 border border-color-base-content/10 space-y-4">
                  <p className="text-sm font-bold text-color-base-content">
                    Valor a pagar: {formatoCOP(montoCop)}
                  </p>

                  {COBRO_COLOMBIA.cuenta.llaves?.length ? (
                    <div className="rounded-xl border border-color-primary/25 bg-color-primary/5 p-4 space-y-1.5">
                      <p className="text-xs font-black uppercase tracking-widest text-color-primary">
                        Paga con llave Bre-B
                      </p>
                      {COBRO_COLOMBIA.cuenta.llaves.map((llave) => (
                        <p key={llave.valor} className="text-sm text-color-base-content">
                          {llave.etiqueta}: <strong>{llave.valor}</strong>
                        </p>
                      ))}
                    </div>
                  ) : null}

                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-color-base-content/60">
                      O por transferencia
                    </p>
                    <p className="text-sm text-color-base-content/70">
                      Banco: {COBRO_COLOMBIA.cuenta.banco}
                      {COBRO_COLOMBIA.cuenta.codigoEntidad ? ` (código ${COBRO_COLOMBIA.cuenta.codigoEntidad})` : ''}
                    </p>
                    <p className="text-sm text-color-base-content/70">
                      Cuenta: {COBRO_COLOMBIA.cuenta.tipo} · {COBRO_COLOMBIA.cuenta.numero}
                    </p>
                    <p className="text-sm text-color-base-content/70">
                      Titular: {COBRO_COLOMBIA.cuenta.titular} · NIT {COBRO_COLOMBIA.cuenta.nit}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-left p-6 rounded-2xl bg-color-base-content/5 border border-color-base-content/10 space-y-2">
                  <p className="text-sm font-bold text-color-base-content">Valor a pagar: {formatoUSD(montoUsd)}</p>
                  <p className="text-sm text-color-base-content/70 leading-relaxed">
                    Para pagos desde fuera de Colombia todavía no tenemos un medio automático.
                    Escríbenos por WhatsApp y coordinamos contigo la forma de pago.
                  </p>
                </div>
              )}

              <a
                href={mensajeWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-color-primary hover:underline"
              >
                Ya pagué, enviar comprobante por WhatsApp
              </a>

              <div className="flex items-center justify-center gap-2 text-[10px] text-color-base-content/40 uppercase tracking-widest font-black pt-4">
                <ShieldCheck className="h-3 w-3" />
                Pago verificado a mano por el equipo, con tus datos protegidos
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
