'use client'

import React, { Suspense, useState } from 'react'
import { COBRO_COLOMBIA, COBRO_EXTERIOR, desglosarPrecio } from '@/lib/mediosDePago'
import { TEXTO_CONTRATO } from '@/lib/textoContrato'
import { useSearchParams } from 'next/navigation'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlassCard } from '@/components/ui/GlassCard'
import { CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'
import { BotonPagoBold } from '@/components/pagos/BotonPagoBold'
import { AcompanamientoPostGane } from '@/components/estructuracion/AcompanamientoPostGane'

import {
  PLAN_EMPRENDEDOR,
  NOMBRE_PLAN_EMPRENDEDOR,
  MONTO_EMPRENDEDOR_COP,
  COMISION_EMPRENDEDOR_PCT,
  INCLUYE_EMPRENDEDOR,
  DECLARACION_EMPRENDEDOR,
  ANEXO_EMPRENDEDOR,
} from '@/lib/planEmprendedor'

const TASA_COP_POR_USD = 3244 // Actualizar periódicamente según la TRM del día

/**
 * Modalidades de estructuración.
 * El identificador (esencial / completo) NO se cambia: es el que queda guardado
 * en la base de datos de los proyectos. Lo que cambia es el nombre visible.
 */
const PLANES: Record<
  string,
  { nombre: string; montoCop: number; resumen: string; incluye: string[] }
> = {
  esencial: {
    nombre: 'Estructuración Estratégica',
    montoCop: 12000000,
    resumen: 'Formulación completa de tu proyecto y tres meses buscando convocatorias.',
    incluye: [
      'Diagnóstico incluido',
      'Formulación completa del proyecto',
      '3 meses de búsqueda de convocatorias',
      'Encaje con los términos de referencia',
      '3 meses adicionales de cortesía si no se gana nada',
    ],
  },
  completo: {
    nombre: 'Estructuración Élite',
    montoCop: 17000000,
    resumen: 'El acompañamiento más completo: seis meses de búsqueda y encaje prioritario.',
    incluye: [
      'Todo lo de la Estructuración Estratégica',
      '6 meses de búsqueda de convocatorias',
      'Encaje prioritario con los términos de referencia',
      '6 meses adicionales de cortesía si no se gana nada',
      'Atención prioritaria',
    ],
  },
  [PLAN_EMPRENDEDOR]: {
    nombre: NOMBRE_PLAN_EMPRENDEDOR,
    montoCop: MONTO_EMPRENDEDOR_COP,
    resumen: 'Para emprendedores y MiPymes que no tienen los recursos para estructurar su proyecto.',
    incluye: INCLUYE_EMPRENDEDOR,
  },
}

/**
 * Fondo Emprender cobra distinto a las dos modalidades normales, porque por
 * debajo de cierto monto no se hace la estructuración completa.
 *
 * Los escalones (todos + IVA):
 *   hasta $60.000.000             -> $2.000.000
 *   de $60.000.001 a $70.000.000  ->  $3.500.000
 *   de $70.000.001 a $150.000.000 ->  $7.000.000
 *   más de $150.000.000           -> $10.000.000
 *
 * Cambio del 10 de septiembre de 2026: el primer escalón dejó de ser
 * gratuito (antes CERO); ahora cobra $2.000.000 + IVA igual que los demás.
 */
export const ESCALONES_FONDO_EMPRENDER = [
  { hasta: 60000000, valor: 2000000, etiqueta: 'Hasta $60.000.000', precio: '$2.000.000 + IVA' },
  { hasta: 70000000, valor: 3500000, etiqueta: 'De $60.000.001 a $70.000.000', precio: '$3.500.000 + IVA' },
  { hasta: 150000000, valor: 7000000, etiqueta: 'De $70.000.001 a $150.000.000', precio: '$7.000.000 + IVA' },
  { hasta: Infinity, valor: 10000000, etiqueta: 'Más de $150.000.000', precio: '$10.000.000 + IVA' },
]

function calcularPrecioFondoEmprender(montoSolicitado: number) {
  const escalon = ESCALONES_FONDO_EMPRENDER.find((e) => montoSolicitado <= e.hasta)
  return escalon ? escalon.valor : 10000000
}

function formatCOP(v: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)
}

function ContratarContent() {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  // Si no llega ningún plan en la dirección, se le muestran las opciones en vez
  // de imponerle uno por defecto.
  const [planSlug, setPlanSlug] = useState<string>(searchParams.get('plan') || '')
  const montoFondoEmprender = Number(searchParams.get('monto')) || 30000000
  const esFondoEmprender = planSlug === 'fondo_emprender'
  const debeElegirPlan = !planSlug
  const esEmprendedor = planSlug === PLAN_EMPRENDEDOR

  const plan = esFondoEmprender
    ? {
        nombre: 'Estructuración — Fondo Emprender',
        montoCop: calcularPrecioFondoEmprender(montoFondoEmprender),
        resumen: 'Estructuración orientada específicamente a la postulación al Fondo Emprender.',
        incluye: [] as string[],
      }
    : (PLANES[planSlug] || PLANES.esencial)
  const montoUsd = COBRO_EXTERIOR.precioUsdFijo[planSlug] ?? Math.round(plan.montoCop / TASA_COP_POR_USD)

  const [step, setStep] = useState<1 | 2>(1)
  const [pais, setPais] = useState<'colombia' | 'internacional' | null>(null)
  const [loading, setLoading] = useState(false)
  const [proyectoId, setProyectoId] = useState<string | null>(null)
  const [passwordTemporal, setPasswordTemporal] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [verticalDiagnostico, setVerticalDiagnostico] = useState<string | null>(null)
  const [contratoLeido, setContratoLeido] = useState(false)
  // Cómo prefiere pagar el cliente en Colombia: en dos partes o todo de una vez.
  const [formaPago, setFormaPago] = useState<'dos_cuotas' | 'una_vez'>('dos_cuotas')

  React.useEffect(() => {
    const guardado = sessionStorage.getItem('diagnostico_vertical_principal')
    if (guardado) setVerticalDiagnostico(guardado)
  }, [])

  const [formData, setFormData] = useState({
    nombreCliente: '',
    nombreIniciativa: '',
    correoCliente: '',
    whatsapp: '',
    aceptaTerminos: false,
    declaracionBajosRecursos: false,
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
          verticalDiagnostico,
          declaracionBajosRecursos: formData.declaracionBajosRecursos,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear el proyecto')
      setProyectoId(data.proyectoId)
      setPasswordTemporal(data.passwordTemporal || null)
      setStep(2)
    } catch (err: any) {
      setError(err.message || 'Hubo un problema. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const mensajeWhatsapp = 'Hola, firme el contrato para el plan ' + plan.nombre + ' (proyecto ' + proyectoId + '). Aqui esta mi comprobante de pago.'
  const mensajeWhatsappUrl = 'https://wa.me/573123335966?text=' + encodeURIComponent(mensajeWhatsapp)
  const mensajeGlobal66 = 'Hola, firmé el contrato para el plan ' + plan.nombre + ' (proyecto ' + proyectoId + '). Quiero pagar por Global66.'
  const mensajeGlobal66Url = 'https://wa.me/573123335966?text=' + encodeURIComponent(mensajeGlobal66)

  if (debeElegirPlan) {
    return (
      <div className="min-h-screen bg-color-base-100 py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-color-base-content">
              Elige tu modalidad
            </h1>
            <p className="text-color-base-content/60 text-sm max-w-xl mx-auto">
              Cada una lleva tu proyecto hasta la postulación. Cambian el alcance del
              acompañamiento y el tiempo de búsqueda de convocatorias.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {(['esencial', 'completo'] as const).map((slug) => {
              const opcion = PLANES[slug]
              const destacado = slug === 'completo'
              return (
                <GlassCard
                  key={slug}
                  className={cn(
                    'p-7 flex flex-col gap-5',
                    destacado && 'ring-2 ring-color-primary/50'
                  )}
                >
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-color-base-content">{opcion.nombre}</h2>
                    <p className="text-color-base-content/60 text-sm">{opcion.resumen}</p>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-color-primary">
                      {formatCOP(opcion.montoCop)}
                      <span className="text-xs font-bold text-color-base-content/50 ml-2">+ IVA</span>
                    </div>
                    <p className="text-xs font-bold text-color-base-content/60 mt-0.5">
                      {desglosarPrecio(opcion.montoCop).totalConEtiqueta}
                    </p>
                    <p className="text-xs font-bold text-color-base-content mt-0.5">
                      Mitad al firmar ({desglosarPrecio(opcion.montoCop).anticipoConIvaTexto}) y mitad al recibir tu proyecto
                    </p>
                  </div>
                  <ul className="space-y-2 flex-1">
                    {opcion.incluye.map((linea) => (
                      <li
                        key={linea}
                        className="flex items-start gap-2 text-sm text-color-base-content/80"
                      >
                        <CheckCircle2 className="h-4 w-4 text-color-accent-pink shrink-0 mt-0.5" />
                        <span>{linea}</span>
                      </li>
                    ))}
                  </ul>
                  <GlowButton className="w-full" onClick={() => setPlanSlug(slug)}>
                    Elegir esta modalidad
                  </GlowButton>
                </GlassCard>
              )
            })}
          </div>

          <GlassCard className="p-7 flex flex-col md:flex-row md:items-center gap-5 justify-between ring-2 ring-color-accent-pink/30">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-color-base-content">{NOMBRE_PLAN_EMPRENDEDOR}</h3>
              <p className="text-sm font-bold text-color-base-content">
                Solo para emprendedores, MiPymes y empresas sin empleados que no tienen los recursos para estructurar su proyecto.
              </p>
              <p className="text-color-base-content/60 text-sm">
                Serving revisa tu solicitud antes de habilitar el pago. Dura un mes.
              </p>
              <div className="text-xl font-black text-color-primary">
                {formatCOP(MONTO_EMPRENDEDOR_COP)}
                <span className="text-xs font-bold text-color-base-content/50 ml-2">+ IVA</span>
              </div>
              <p className="text-xs font-bold text-color-base-content/60">
                {desglosarPrecio(MONTO_EMPRENDEDOR_COP).totalConEtiqueta} · comisión de éxito del {COMISION_EMPRENDEDOR_PCT} %
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPlanSlug(PLAN_EMPRENDEDOR)}
              className="shrink-0 px-6 py-3 rounded-xl bg-color-primary text-white text-sm font-bold shadow-md hover:opacity-90 transition-opacity"
            >
              Solicitar este plan
            </button>
          </GlassCard>

          <GlassCard className="p-6 flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <div>
              <h3 className="font-black text-color-base-content">Fondo Emprender</h3>
              <p className="text-color-base-content/60 text-sm">
                Si tu proyecto se va a postular al Fondo Emprender, el valor depende del
                monto que solicites.
              </p>
              <ul className="mt-3 space-y-1 text-sm text-color-base-content/80">
                {ESCALONES_FONDO_EMPRENDER.map((e) => (
                  <li key={e.etiqueta}>
                    {e.etiqueta}: <strong>{e.precio}</strong>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setPlanSlug('fondo_emprender')}
              className="shrink-0 px-6 py-3 rounded-xl border border-color-base-300 text-sm font-bold text-color-base-content hover:bg-color-base-200 transition-colors"
            >
              Ver condiciones
            </button>
          </GlassCard>

          <AcompanamientoPostGane />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-color-base-100 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <GlassCard className="p-8 md:p-10 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-color-base-content">
              {plan.nombre}
            </h1>
            <p className="text-color-base-content/60 text-sm">
              {plan.montoCop === 0
                ? 'Sin costo de estructuración · solo comisión de éxito si el proyecto es aprobado'
                : `${desglosarPrecio(plan.montoCop).baseConSufijo} · ${desglosarPrecio(plan.montoCop).totalConEtiqueta} · aprox. $${montoUsd.toLocaleString('en-US')} USD`}
            </p>
          </div>

          {step === 1 && (
            <form onSubmit={handleFirmar} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-color-base-content/70 mb-2">
                    {t('contratar.campo_nombre')}
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
                    {t('contratar.campo_proyecto')}
                  </label>
                  <input
                    value={formData.nombreIniciativa}
                    onChange={(e) => setFormData({ ...formData, nombreIniciativa: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-color-base-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-color-base-content/70 mb-2">
                    {t('contratar.campo_correo')}
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
                    {t('contratar.campo_whatsapp')}
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
                  {t('contratar.pregunta_pais')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPais('colombia')}
                    className={`p-4 rounded-xl border text-sm font-bold transition-all ${pais === 'colombia' ? 'border-color-primary bg-color-primary/10' : 'border-color-base-300'}`}
                  >
                    {t('contratar.pais_colombia')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPais('internacional')}
                    className={`p-4 rounded-xl border text-sm font-bold transition-all ${pais === 'internacional' ? 'border-color-primary bg-color-primary/10' : 'border-color-base-300'}`}
                  >
                    {t('contratar.pais_internacional')}
                  </button>
                </div>
              </div>

              {esEmprendedor && (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-amber-800">
                    Este plan es solo para quien no tiene recursos
                  </h4>
                  <p className="text-xs text-amber-800">
                    Si tu empresa sí cuenta con recursos, te corresponde Estructuración Estratégica o Estructuración Élite.
                    Serving revisa cada solicitud antes de habilitar el pago.
                  </p>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.declaracionBajosRecursos}
                      onChange={(e) => setFormData({ ...formData, declaracionBajosRecursos: e.target.checked })}
                      className="mt-1"
                    />
                    <span className="text-xs font-bold text-color-base-content">{DECLARACION_EMPRENDEDOR}</span>
                  </label>
                </div>
              )}

              <div className="p-5 rounded-2xl bg-color-base-content/5 border border-color-base-content/10 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-[#1f1f1f]">
                  {t('contratar.titulo_contrato')}
                </h4>
                <div
                  onScroll={(e) => {
                    const el = e.currentTarget
                    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
                      setContratoLeido(true)
                    }
                  }}
                  className="text-xs text-[#1f1f1f] max-h-56 overflow-y-auto leading-relaxed pr-2 whitespace-pre-line border border-color-base-content/10 rounded-xl p-3 bg-white"
                >
                  {esEmprendedor ? TEXTO_CONTRATO + '\n\n' + ANEXO_EMPRENDEDOR : TEXTO_CONTRATO}
                </div>
                {!contratoLeido && (
                  <p className="text-[10px] text-amber-600 font-bold">
                    {t('contratar.aviso_scroll')}
                  </p>
                )}
                <label className={cn("flex items-start gap-3", contratoLeido ? "cursor-pointer" : "cursor-not-allowed opacity-50")}>
                  <input
                    type="checkbox"
                    disabled={!contratoLeido}
                    checked={formData.aceptaTerminos}
                    onChange={(e) => setFormData({ ...formData, aceptaTerminos: e.target.checked })}
                    className="mt-1"
                  />
                  <span className="text-xs font-bold text-[#1f1f1f]">
                    {t('contratar.checkbox_acepto')}
                  </span>
                </label>
              </div>

              {error && <p className="text-xs text-red-500 font-bold">{error}</p>}

              <GlowButton
                type="submit"
                disabled={!formData.aceptaTerminos || !pais || loading || (esEmprendedor && !formData.declaracionBajosRecursos)}
                className="w-full py-4 text-sm font-black uppercase tracking-widest"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : t('contratar.boton_firmar')}
              </GlowButton>
            </form>
          )}

          {step === 2 && esEmprendedor && (
            <div className="space-y-6 text-center">
              <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto" />
              <h2 className="text-xl font-black text-color-base-content">Recibimos tu solicitud</h2>
              <p className="text-sm text-color-base-content/70 max-w-md mx-auto">
                Serving va a revisar que este plan sea el adecuado para ti. Cuando te aprueben, te avisamos
                por WhatsApp y por correo, y ahí se habilita el pago. Todavía no tienes que pagar nada.
              </p>
              {passwordTemporal && (
                <div className="text-left p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-700">
                    {t('contratar.acceso_titulo')}
                  </p>
                  <p className="text-sm text-color-base-content">
                    {t('contratar.acceso_correo')} <strong>{formData.correoCliente}</strong>
                  </p>
                  <p className="text-sm text-color-base-content">
                    {t('contratar.acceso_password')} <strong className="font-mono">{passwordTemporal}</strong>
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 2 && !esEmprendedor && (
            <div className="space-y-6 text-center">
              <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto" />
              <h2 className="text-xl font-black text-color-base-content">{t('contratar.titulo_exito')}</h2>
              {passwordTemporal && (
                <div className="text-left p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-700">
                    {t('contratar.acceso_titulo')}
                  </p>
                  <p className="text-sm text-color-base-content">
                    {t('contratar.acceso_correo')} <strong>{formData.correoCliente}</strong>
                  </p>
                  <p className="text-sm text-color-base-content">
                    {t('contratar.acceso_password')} <strong className="font-mono">{passwordTemporal}</strong>
                  </p>
                  <p className="text-xs text-color-base-content/60 pt-1">
                    {t('contratar.acceso_nota_1')}{' '}
                    <a href="/login" className="text-color-primary underline">/login</a>
                    {t('contratar.acceso_nota_2')}
                  </p>
                </div>
              )}

              {/* Cómo se cobra se decide en src/lib/mediosDePago.ts, no aquí. */}
              {pais === 'colombia' && COBRO_COLOMBIA.modo === 'transferencia' && COBRO_COLOMBIA.cuenta ? (
                <div className="text-left p-6 rounded-2xl bg-color-base-content/5 border border-color-base-content/10 space-y-5">
                  <div>
                    <p className="text-sm font-bold text-color-base-content">{t('contratar.transferencia_titulo')}</p>
                    {(() => {
                      const precio = desglosarPrecio(plan.montoCop)
                      if (precio.base === 0) {
                        return (
                          <p className="text-sm text-color-base-content/70 mt-1">
                            No hay que pagar nada por la estructuración. Solo se cobra la
                            comisión de éxito si el proyecto resulta aprobado y desembolsado.
                          </p>
                        )
                      }
                      if (precio.anticipoConIva === 0) {
                        return (
                          <p className="text-sm text-color-base-content/70 mt-1">
                            {t('contratar.valor_label')} {precio.baseConSufijo} · {precio.totalConEtiqueta}
                          </p>
                        )
                      }
                      return (
                        <div className="mt-2 space-y-2">
                          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t('contratar.forma_pago_titulo')}>
                            {([
                              { valor: 'dos_cuotas', clave: 'contratar.forma_pago_dos' },
                              { valor: 'una_vez', clave: 'contratar.forma_pago_una' },
                            ] as const).map((op) => (
                              <button
                                key={op.valor}
                                type="button"
                                role="radio"
                                aria-checked={formaPago === op.valor}
                                onClick={() => setFormaPago(op.valor)}
                                className={`rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                                  formaPago === op.valor
                                    ? 'border-color-primary bg-color-primary/10 text-color-primary'
                                    : 'border-color-base-content/15 text-color-base-content/70 hover:border-color-primary/40'
                                }`}
                              >
                                {t(op.clave)}
                              </button>
                            ))}
                          </div>
                          {formaPago === 'una_vez' ? (
                            <p className="text-sm font-bold text-color-base-content">
                              {t('contratar.forma_pago_total')} {precio.totalTexto}
                            </p>
                          ) : (
                            <>
                              <p className="text-sm font-bold text-color-base-content">
                                {t('contratar.anticipo_label')} {precio.anticipoConIvaTexto}
                              </p>
                              <p className="text-sm text-color-base-content/70">
                                {t('contratar.saldo_label')} {precio.saldoConIvaTexto}
                              </p>
                            </>
                          )}
                          <p className="text-xs text-color-base-content/60 pt-1">
                            {precio.baseConSufijo} · {precio.totalConEtiqueta}
                          </p>
                        </div>
                      )
                    })()}
                  </div>

                  {proyectoId && desglosarPrecio(plan.montoCop).base > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-black uppercase tracking-widest text-color-primary">
                        Pago automático
                      </p>
                      <BotonPagoBold
                        endpoint="/api/proyectos/bold/iniciar"
                        campoId="proyectoId"
                        id={proyectoId}
                        extra={{ pagoCompleto: formaPago === 'una_vez' }}
                      />
                    </div>
                  )}

                  {COBRO_COLOMBIA.cuenta.llaves?.length ? (
                    <div className="rounded-xl border border-color-primary/25 bg-color-primary/5 p-4 space-y-1.5">
                      <p className="text-xs font-black uppercase tracking-widest text-color-primary">
                        {t('contratar.llave_titulo')}
                      </p>
                      {COBRO_COLOMBIA.cuenta.llaves.map((llave) => (
                        <p key={llave.valor} className="text-sm text-color-base-content">
                          {llave.etiqueta}: <strong>{llave.valor}</strong>
                        </p>
                      ))}
                      <p className="text-xs text-color-base-content/60 pt-1">{t('contratar.llave_nota')}</p>
                    </div>
                  ) : null}

                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-color-base-content/60">
                      {t('contratar.transferencia_alterna')}
                    </p>
                    <p className="text-sm text-color-base-content/70">
                      {t('contratar.banco_label')} {COBRO_COLOMBIA.cuenta.banco}
                      {COBRO_COLOMBIA.cuenta.codigoEntidad ? ` (código ${COBRO_COLOMBIA.cuenta.codigoEntidad})` : ''}
                    </p>
                    <p className="text-sm text-color-base-content/70">
                      {t('contratar.cuenta_label')} {COBRO_COLOMBIA.cuenta.tipo} · {COBRO_COLOMBIA.cuenta.numero}
                    </p>
                    <p className="text-sm text-color-base-content/70">
                      {t('contratar.titular_label')} {COBRO_COLOMBIA.cuenta.titular} · NIT {COBRO_COLOMBIA.cuenta.nit}
                    </p>
                    <p className="text-xs text-color-base-content/50 pt-1">
                      {t('contratar.transferencia_alterna_nota')}
                    </p>
                  </div>

                  <p className="text-xs text-color-base-content/50 border-t border-color-base-content/10 pt-3">
                    {t('contratar.transferencia_nota')}
                  </p>
                </div>
              ) : pais === 'colombia' ? (
                <div className="text-left p-6 rounded-2xl bg-color-base-content/5 border border-color-base-content/10 space-y-2">
                  <p className="text-sm font-bold text-color-base-content">{t('contratar.factura_titulo')}</p>
                  <p className="text-sm text-color-base-content/70 leading-relaxed">{t('contratar.factura_texto')}</p>
                  {(() => {
                    const precio = desglosarPrecio(plan.montoCop)
                    if (precio.base === 0) {
                      return (
                        <p className="text-sm text-color-base-content/70 pt-1">
                          No hay que pagar nada por la estructuración. Solo se cobra la
                          comisión de éxito si el proyecto resulta aprobado y desembolsado.
                        </p>
                      )
                    }
                    if (precio.anticipoConIva === 0) {
                      return (
                        <p className="text-sm text-color-base-content/70 pt-1">
                          {t('contratar.valor_label')} {pais === 'colombia' ? `${precio.baseConSufijo} · ${precio.totalConEtiqueta}` : `$${montoUsd.toLocaleString('en-US')} USD`}
                        </p>
                      )
                    }
                    return (
                      <div className="pt-2 space-y-1">
                        <p className="text-sm font-bold text-color-base-content">
                          {t('contratar.anticipo_label')} {precio.anticipoConIvaTexto}
                        </p>
                        <p className="text-sm text-color-base-content/70">
                          {t('contratar.saldo_label')} {precio.saldoConIvaTexto}
                        </p>
                        <p className="text-xs text-color-base-content/50">
                          {precio.baseConSufijo} · {precio.totalConEtiqueta}
                        </p>
                      </div>
                    )
                  })()}
                </div>
              ) : (
                <div className="text-left p-6 rounded-2xl bg-color-base-content/5 border border-color-base-content/10 space-y-4">
                  <p className="text-sm font-bold text-color-base-content">
                    {t('contratar.pago_usd_prefijo')} ${montoUsd.toLocaleString('en-US')} USD {t('contratar.pago_usd_sufijo')}
                  </p>
                  {proyectoId && (
                    <BotonPagoBold
                      endpoint="/api/proyectos/bold/iniciar"
                      campoId="proyectoId"
                      id={proyectoId}
                      texto="Pagar con tarjeta"
                    />
                  )}
                </div>
              )}

              <div className="text-left p-5 rounded-2xl bg-color-base-content/5 border border-color-base-content/10 space-y-2">
                <p className="text-sm font-bold text-[#1f1f1f]">¿Prefieres pagar por Global66?</p>
                <p className="text-sm text-[#1f1f1f]/80 leading-relaxed">
                  Si no puedes o no quieres pagar con Bold, también puedes pagar por Global66 desde
                  cualquiera de los países habilitados. Escríbenos por WhatsApp y te enviamos los datos para hacerlo.
                </p>
                <a
                  href={mensajeGlobal66Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-color-primary hover:underline"
                >
                  Pagar por Global66 (WhatsApp)
                </a>
              </div>

                <a href={mensajeWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-color-primary hover:underline"
              >
                {COBRO_COLOMBIA.modo === 'transferencia' && COBRO_COLOMBIA.cuenta
                  ? t('contratar.boton_whatsapp')
                  : t('contratar.boton_whatsapp_factura')}
              </a>

              <div className="flex items-center justify-center gap-2 text-[10px] text-color-base-content/40 uppercase tracking-widest font-black pt-4">
                <ShieldCheck className="h-3 w-3" />
                {t('contratar.footer_seguridad')}
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
