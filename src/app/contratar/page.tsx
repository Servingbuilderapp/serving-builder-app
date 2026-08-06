'use client'

import React, { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlassCard } from '@/components/ui/GlassCard'
import { CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react'
import { PayPalButtons } from '@paypal/react-paypal-js'
import { cn } from '@/lib/utils'

const TASA_COP_POR_USD = 3244 // Actualizar periódicamente según la TRM del día

const PLANES: Record<string, { nombre: string; montoCop: number }> = {
  esencial: { nombre: 'Estructuración Esencial', montoCop: 12000000 },
  completo: { nombre: 'Estructuración Completa', montoCop: 17000000 },
}

const TEXTO_CONTRATO = `AUTORIZACIÓN PARA EL TRATAMIENTO DE DATOS PERSONALES
Y TÉRMINOS DEL SERVICIO DE DIAGNÓSTICO Y ESTRUCTURACIÓN DE PROYECTOS

1. RESPONSABLE DEL TRATAMIENTO
SERVING PROYECTOS ESTRATÉGICOS SAS, [NIT], propietaria y operadora de la
plataforma "Arquitectura Digital", con correo de contacto
servingbuilderapp@gmail.com, es responsable del tratamiento de los datos
personales que usted suministra a través de esta plataforma.

2. FINALIDAD DEL TRATAMIENTO
Los datos personales, financieros y del proyecto que usted suministra serán
utilizados exclusivamente para:
  a) Elaborar el diagnóstico de viabilidad de su proyecto.
  b) Realizar la estructuración, formulación técnica y documentación de su
     proyecto conforme al plan contratado.
  c) Identificar convocatorias, fondos, cooperantes internacionales y
     entidades de financiamiento compatibles con su perfil, y acompañar la
     postulación de su proyecto ante dichas fuentes una vez el cliente
     entregue la información y documentación que cada una exija.
  d) Contactarlo por correo electrónico o WhatsApp para dar seguimiento a su
     proceso.
  e) Fines administrativos, contables y de facturación del servicio
     contratado.

3. DATOS QUE SE RECOLECTAN
Nombre, correo electrónico, número de teléfono/WhatsApp, información sobre
su proyecto u organización, estado legal de la empresa, monto de
financiamiento requerido, y demás información que usted suministre
voluntariamente durante el diagnóstico y la estructuración.

4. TRANSFERENCIA A TERCEROS
Como parte necesaria del servicio, su información y la documentación de su
proyecto podrán ser compartidas con los fondos, cooperantes, entidades
gubernamentales o financiadores específicos ante quienes se postule su
proyecto, únicamente con el fin de tramitar dicha postulación.
No se venderá ni cederá su información a terceros con fines distintos a los
aquí descritos.

5. DERECHOS DEL TITULAR (Ley 1581 de 2012)
Usted tiene derecho a conocer, actualizar, rectificar y solicitar la
supresión de sus datos personales, así como a revocar esta autorización en
cualquier momento, enviando su solicitud al correo
servingbuilderapp@gmail.com.

6. VIGENCIA
Sus datos serán conservados durante el tiempo que dure la relación
comercial y el tiempo adicional que exijan las obligaciones legales,
contables o fiscales aplicables.

7. CONDICIONES DEL SERVICIO CONTRATADO
Al firmar y proceder con el pago del plan seleccionado, usted contrata el
servicio de estructuración de proyecto descrito en la oferta, que incluye
el proceso de formulación técnica y el período de búsqueda, encaje y
acompañamiento para la postulación a convocatorias indicado en el plan
elegido (3 o 6 meses, según el plan), sujeto a lo establecido en la
Cláusula 9 sobre el alcance y límite de esta responsabilidad. Si al
finalizar dicho período no se ha logrado la aprobación de financiamiento,
ARQUITECTURA DIGITAL extenderá el período de búsqueda de convocatorias por
el mismo tiempo adicional, sin costo extra, en los términos ofrecidos.

8. NATURALEZA DEL SERVICIO Y AUSENCIA DE GARANTÍA DE RESULTADO
Los diagnósticos, calificaciones y análisis que muestra esta plataforma
tienen como finalidad optimizar y fortalecer la estructuración de su
proyecto. ARQUITECTURA DIGITAL no puede garantizar la aprobación,
adjudicación o desembolso de ninguna subvención, convocatoria, beca o
fuente de financiamiento, ya que dicha decisión depende exclusivamente de
los analistas y comités evaluadores de cada entidad convocante, ajenos a
esta plataforma.

El resultado final de cada postulación dependerá de su esfuerzo,
experiencia y capacidad de ejecución, combinados con la rapidez y
tecnología que ARQUITECTURA DIGITAL aporta para producir proyectos más
robustos, profesionales y con alta probabilidad de éxito. El servicio
contratado incluye el derecho a que su proyecto sea presentado, sin
restricción de cantidad, a todas las convocatorias que la plataforma
identifique como compatibles durante el período contratado, siempre sujeto
a que el cliente entregue oportunamente la información y documentación que
cada convocatoria exija, conforme a la Cláusula 9.

9. ALCANCE Y LÍMITE DE LA RESPONSABILIDAD DEL SERVICIO
La responsabilidad de ARQUITECTURA DIGITAL consiste en: (i) identificar
convocatorias y fuentes de financiamiento compatibles con el proyecto,
(ii) realizar el encaje técnico entre el proyecto y cada convocatoria
identificada, y (iii) entregar al cliente los Términos de Referencia (TDR)
de dichas convocatorias en el menor tiempo posible.

Una vez el cliente entrega la totalidad de la información y documentación
que cada TDR exige, ARQUITECTURA DIGITAL acompaña al cliente hasta la
radicación de la postulación. La consecución de los documentos,
certificaciones, requisitos o información particular que cada convocatoria
exija al postulante es responsabilidad exclusiva del cliente; ARQUITECTURA
DIGITAL no es responsable de la demora o imposibilidad de reunir dichos
requisitos.

10. POLÍTICA DE NO DEVOLUCIÓN
Una vez firmado este contrato y confirmado el pago, el valor pagado por el
servicio de estructuración no es reembolsable bajo ninguna circunstancia,
incluyendo la no obtención de financiamiento en las convocatorias
postuladas, dado que el servicio contratado corresponde al trabajo de
estructuración, encaje y acompañamiento descrito en este documento, y no a
la obtención garantizada de un resultado final que depende de terceros.

11. VALOR DEL SERVICIO Y COMISIÓN DE ÉXITO
El valor del plan contratado corresponde únicamente al servicio de
estructuración, formulación y búsqueda/encaje de convocatorias. En caso de
que el proyecto sea aprobado y reciba desembolso de financiamiento como
resultado de una postulación gestionada por ARQUITECTURA DIGITAL, el
cliente reconocerá adicionalmente una comisión de éxito sobre el monto
efectivamente desembolsado, según la siguiente escala:

  - De $20.000 a $100.000 USD (aprox. $65.000.000 a $324.000.000 COP): 12%
  - De $101.000 a $400.000 USD (aprox. $328.000.000 a $1.298.000.000 COP): 10%
  - De $401.000 a $999.000 USD (aprox. $1.301.000.000 a $3.241.000.000 COP): 7%
  - De $1.000.000 a $2.000.000 USD (aprox. $3.244.000.000 a $6.488.000.000 COP): 4%

La conversión a pesos colombianos es referencial, calculada a la tasa de
cambio vigente al momento de la firma de este contrato; la comisión se
calculará siempre sobre el monto real desembolsado por la entidad
financiadora, en la moneda en que dicho desembolso se realice.

La comisión será exigible y pagadera inmediatamente el cliente reciba el
desembolso, dentro de un plazo máximo de diez (10) días calendario desde la
fecha de recepción del dinero, o según las estipulaciones y calendario de
desembolsos propios de cada convocatoria o fondo, lo que resulte aplicable.

Nota: en el caso específico de postulaciones al Fondo Emprender, la
comisión de éxito podrá regirse por condiciones diferentes a las aquí
descritas, las cuales se definirán y anexarán a este contrato como Anexo 1
cuando dicho caso se presente. [PENDIENTE DE DEFINIR]

12. VERACIDAD DE LA INFORMACIÓN
Usted declara que la información suministrada es veraz, completa y de su
autoría o representación legítima, y que cuenta con la facultad para
autorizar su tratamiento y contratar este servicio.

Al marcar la casilla de aceptación, usted confirma que ha leído y acepta
este documento en su totalidad, y que dicha aceptación, junto con la fecha,
hora e IP de la sesión, quedará registrada como constancia de firma
electrónica.`

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
  const [passwordTemporal, setPasswordTemporal] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [verticalDiagnostico, setVerticalDiagnostico] = useState<string | null>(null)
  const [contratoLeido, setContratoLeido] = useState(false)

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
                  Contrato de Servicio y Autorización de Datos Personales
                </h4>
                <div
                  onScroll={(e) => {
                    const el = e.currentTarget
                    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
                      setContratoLeido(true)
                    }
                  }}
                  className="text-xs text-color-base-content/70 max-h-56 overflow-y-auto leading-relaxed pr-2 whitespace-pre-line border border-color-base-content/10 rounded-xl p-3 bg-white"
                >
                  {TEXTO_CONTRATO}
                </div>
                {!contratoLeido && (
                  <p className="text-[10px] text-amber-600 font-bold">
                    ↑ Desplázate hasta el final del documento para poder aceptar.
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
                  <span className="text-xs font-bold text-color-base-content">
                    He leído y acepto el contrato de servicio y el tratamiento de mis datos personales, y confirmo que la información suministrada es veraz.
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
              {passwordTemporal && (
                <div className="text-left p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-700">
                    Tu acceso a la plataforma
                  </p>
                  <p className="text-sm text-color-base-content">
                    Correo: <strong>{formData.correoCliente}</strong>
                  </p>
                  <p className="text-sm text-color-base-content">
                    Contraseña temporal: <strong className="font-mono">{passwordTemporal}</strong>
                  </p>
                  <p className="text-xs text-color-base-content/60 pt-1">
                    Guarda estos datos — los necesitas para entrar a tu panel en{' '}
                    <a href="/login" className="text-color-primary underline">/login</a>. Te
                    recomendamos cambiar la contraseña la primera vez que ingreses.
                  </p>
                </div>
              )}

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

              
                href={mensajeWhatsappUrl}
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
