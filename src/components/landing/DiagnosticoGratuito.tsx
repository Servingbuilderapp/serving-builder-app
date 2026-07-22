'use client'

import React, { useState } from 'react'
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Building2,
  Globe2,
  Coins,
  ShieldCheck,
  Zap,
  TrendingUp,
  Award,
  HelpCircle,
  MessageSquare,
  FileSpreadsheet,
  ChevronRight,
  Loader2,
  Check,
  BarChart3
} from 'lucide-react'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlassCard } from '@/components/ui/GlassCard'
import { DiagnosticoInput, DiagnosticoResultado, FondoSugerido } from '@/app/api/diagnostico/route'
import { PlanSelector } from '@/components/estructuracion/PlanSelector'
import { VerticalSelector } from '@/components/diagnostico/VerticalSelector'
import { VerticalItem, TipoAccesoSocio, VerticalId } from '@/types/verticales'

interface DiagnosticoGratuitoProps {
  onPlanSelect?: (planSlug: string) => void
}

export function DiagnosticoGratuito({ onPlanSelect }: DiagnosticoGratuitoProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [loading, setLoading] = useState(false)

  // Form State
  const [formData, setFormData] = useState<DiagnosticoInput>({
    nombre: '',
    empresa: '',
    email: '',
    whatsapp: '',
    verticalId: 'emprendimiento',
    tipoAcceso: 'estandar',
    tipoProyecto: 'emprendimiento',
    estadoLegal: 'idea',
    tipoFinanciamiento: 'capital_semilla',
    montoObjetivo: '$50.000.000 COP',
    descripcion: ''
  })

  // Result State
  const [resultado, setResultado] = useState<DiagnosticoResultado | null>(null)

  const handleInputChange = (field: keyof DiagnosticoInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmitDiagnostico = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Error al generar el diagnóstico')
      const data: DiagnosticoResultado = await res.json()
      setResultado(data)
      setStep(4)
    } catch (err) {
      console.error(err)
      alert('Hubo un inconveniente al generar el diagnóstico. Por favor intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const getWhatsappLink = () => {
    if (!resultado) return '#'
    const message = encodeURIComponent(
      `Hola Arquitectura Digital, acabo de realizar mi Diagnóstico Gratuito para el proyecto "${formData.empresa || formData.nombre}". Obtuve un ${resultado.scores.preparacionConvocatorias}% de preparación en convocatorias y me interesa recibir acompañamiento para estructurar mi postulación a ${resultado.fondosSugeridos[0]?.nombre || 'Fondos'}.`
    )
    return `https://wa.me/573000000000?text=${message}`
  }

  return (
    <div id="diagnostico" className="w-full max-w-5xl mx-auto my-12 px-4">
      <GlassCard className="p-8 md:p-12 relative overflow-hidden border border-color-primary/20 shadow-2xl backdrop-blur-2xl bg-white/80">
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-gradient-to-r from-color-primary via-emerald-400 to-teal-500 rounded-b-full blur-[1px]" />

        {/* Title Header */}
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-color-primary/10 border border-color-primary/20 text-color-primary text-xs font-black uppercase tracking-widest">
            <Sparkles className="h-4 w-4 animate-pulse" />
            Bloque 1: Diagnóstico Gratuito & Inteligencia Estratégica
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-color-base-content uppercase italic">
            Diagnóstico de <span className="text-gradient-magma">Viabilidad & Fondos</span>
          </h2>
          <p className="text-color-base-content/70 max-w-2xl mx-auto text-sm md:text-base font-medium">
            Evalúa la madurez jurídica, elegibilidad de financiamiento y nivel de preparación de tu proyecto para postulaciones a <strong className="text-color-primary">Fondo Emprender, APC Colombia, BID Lab, DRK Foundation y más</strong>.
          </p>
        </div>

        {/* Wizard Step Indicator */}
        <div className="flex items-center justify-between max-w-xl mx-auto mb-10 relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-color-base-200 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-color-primary -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          />

          {[
            { num: 1, label: 'Contacto' },
            { num: 2, label: 'Proyecto' },
            { num: 3, label: 'Financiamiento' },
            { num: 4, label: 'Resultado' }
          ].map(item => (
            <div key={item.num} className="relative z-10 flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all duration-300 ${
                  step >= item.num
                    ? 'bg-color-primary text-white shadow-lg shadow-color-primary/30 scale-110'
                    : 'bg-color-base-200 text-color-base-content/50 border border-color-base-300'
                }`}
              >
                {step > item.num ? <Check className="h-4 w-4" /> : item.num}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-color-base-content/70">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* STEP 1: SELECCIÓN DE VERTICAL Y CONTACTO */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Selector Dinámico de las 9 Verticales Oficiales */}
            <VerticalSelector
              selectedVerticalId={formData.verticalId || 'emprendimiento'}
              tipoAcceso={formData.tipoAcceso || 'estandar'}
              onSelectVertical={(vertical) => {
                setFormData(prev => ({ ...prev, verticalId: vertical.id }))
              }}
              onToggleTipoAcceso={(tipo) => {
                setFormData(prev => ({ ...prev, tipoAcceso: tipo }))
              }}
            />

            <h3 className="text-xl font-extrabold text-color-base-content flex items-center gap-2 border-b border-color-base-200 pb-3">
              <Building2 className="h-5 w-5 text-color-primary" />
              Identificación del Proyecto o Líder
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-color-base-content/80 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: María Fernanda Gómez"
                  value={formData.nombre}
                  onChange={e => handleInputChange('nombre', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-color-base-300 bg-white/50 focus:bg-white focus:ring-2 focus:ring-color-primary outline-none transition-all text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-color-base-content/80 mb-2">
                  Nombre del Proyecto u Organización *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: EcoSoluciones SAS / Fundación Verde"
                  value={formData.empresa}
                  onChange={e => handleInputChange('empresa', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-color-base-300 bg-white/50 focus:bg-white focus:ring-2 focus:ring-color-primary outline-none transition-all text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-color-base-content/80 mb-2">
                  Correo Electrónico de Contacto *
                </label>
                <input
                  type="email"
                  required
                  placeholder="contacto@tuproyecto.com"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-color-base-300 bg-white/50 focus:bg-white focus:ring-2 focus:ring-color-primary outline-none transition-all text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-color-base-content/80 mb-2">
                  Teléfono WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+57 300 123 4567"
                  value={formData.whatsapp}
                  onChange={e => handleInputChange('whatsapp', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-color-base-300 bg-white/50 focus:bg-white focus:ring-2 focus:ring-color-primary outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <GlowButton
                disabled={!formData.nombre || !formData.email || !formData.whatsapp}
                onClick={() => setStep(2)}
                className="px-8 py-3 text-xs font-black tracking-widest gap-2"
              >
                SIGUIENTE: TIPO DE PROYECTO
                <ArrowRight className="h-4 w-4" />
              </GlowButton>
            </div>
          </div>
        )}

        {/* STEP 2: NATURALEZA Y DIMENSIÓN DEL PROYECTO */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xl font-extrabold text-color-base-content flex items-center gap-2 border-b border-color-base-200 pb-3">
              <Globe2 className="h-5 w-5 text-color-primary" />
              Paso 2: Naturaleza y Enfoque del Proyecto
            </h3>

            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-color-base-content/80">
                Selecciona la Categoría Principal de tu Proyecto *
              </label>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    id: 'emprendimiento',
                    title: 'Emprendimiento Comercial / Negocio',
                    desc: 'Creación o escalamiento de empresa con foco en rentabilidad y ventas.'
                  },
                  {
                    id: 'formalizacion',
                    title: 'Formación & Formalización de Empresa',
                    desc: 'Registro inicial de SAS, formalización jurídica y estructuración tributaria.'
                  },
                  {
                    id: 'social',
                    title: 'Proyecto Social y Comunitario',
                    desc: 'Iniciativa de impacto comunitario, inclusión, educación o desarrollo rural.'
                  },
                  {
                    id: 'ambiental',
                    title: 'Proyecto Ambiental y Sostenibilidad',
                    desc: 'Economía circular, gestión de residuos, conservación o energía limpia.'
                  },
                  {
                    id: 'tecnologia',
                    title: 'Innovación Tecnológica & Software',
                    desc: 'Desarrollo de plataforma, app, inteligencia artificial o biotecnología.'
                  }
                ].map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleInputChange('tipoProyecto', item.id as any)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex items-start gap-3 ${
                      formData.tipoProyecto === item.id
                        ? 'border-color-primary bg-color-primary/10 shadow-md ring-2 ring-color-primary/30'
                        : 'border-color-base-300 bg-white/40 hover:bg-white/80'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 ${
                        formData.tipoProyecto === item.id
                          ? 'border-color-primary bg-color-primary text-white'
                          : 'border-color-base-300'
                      }`}
                    >
                      {formData.tipoProyecto === item.id && <Check className="h-3 w-3" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-color-base-content">{item.title}</h4>
                      <p className="text-xs text-color-base-content/70 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-color-base-content/80 mb-2">
                Breve Descripción de la Propuesta de Valor (Opcional)
              </label>
              <textarea
                rows={3}
                placeholder="Describe brevemente qué soluciona tu proyecto, tu población objetivo o tu producto principal..."
                value={formData.descripcion}
                onChange={e => handleInputChange('descripcion', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-color-base-300 bg-white/50 focus:bg-white focus:ring-2 focus:ring-color-primary outline-none transition-all text-sm font-medium"
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-color-base-content/60 hover:text-color-base-content transition-colors"
              >
                Volver
              </button>
              <GlowButton
                onClick={() => setStep(3)}
                className="px-8 py-3 text-xs font-black tracking-widest gap-2"
              >
                SIGUIENTE: FINANCIAMIENTO
                <ArrowRight className="h-4 w-4" />
              </GlowButton>
            </div>
          </div>
        )}

        {/* STEP 3: ESTADO LEGAL Y FINANCIAMIENTO DESEADO */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xl font-extrabold text-color-base-content flex items-center gap-2 border-b border-color-base-200 pb-3">
              <Coins className="h-5 w-5 text-color-primary" />
              Paso 3: Formalización y Tipo de Financiamiento
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-color-base-content/80 mb-2">
                  Estado Legal Actual *
                </label>
                <select
                  value={formData.estadoLegal}
                  onChange={e => handleInputChange('estadoLegal', e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border border-color-base-300 bg-white/50 focus:bg-white focus:ring-2 focus:ring-color-primary outline-none transition-all text-sm font-medium"
                >
                  <option value="idea">Idea de Negocio (Sin Registro)</option>
                  <option value="persona_natural">Persona Natural registrado con RUT</option>
                  <option value="sas_tramite">Empresa SAS en Proceso de Constitución</option>
                  <option value="sas_constituida">Empresa SAS Constituidas en Cámara de Comercio</option>
                  <option value="fundacion_esal">Fundación / ONG / ESAL Registrada</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-color-base-content/80 mb-2">
                  Mecanismo de Financiamiento Prioritario *
                </label>
                <select
                  value={formData.tipoFinanciamiento}
                  onChange={e => handleInputChange('tipoFinanciamiento', e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border border-color-base-300 bg-white/50 focus:bg-white focus:ring-2 focus:ring-color-primary outline-none transition-all text-sm font-medium"
                >
                  <option value="capital_semilla">Capital Semilla No Reembolsable (Fondo Emprender / iNNpulsa)</option>
                  <option value="cooperacion_internacional">Cooperación Internacional No Reembolsable / Sur-Sur (APC, BID, Fundaciones)</option>
                  <option value="becas_premios">Premios, Becas y Fondos de Aceleración Internacional</option>
                  <option value="cofinanciacion">Cofinanciación Gubernamental / Vouchers de Innovación</option>
                  <option value="credito_inversion">Crédito Empresarial Preferencial / Inversión Privada</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-color-base-content/80 mb-2">
                Meta o Rango de Capital Requerido
              </label>
              <select
                value={formData.montoObjetivo}
                onChange={e => handleInputChange('montoObjetivo', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-color-base-300 bg-white/50 focus:bg-white focus:ring-2 focus:ring-color-primary outline-none transition-all text-sm font-medium"
              >
                <option value="$30M - $80M COP">$30M - $80M COP (Fases Semilla Iniciales)</option>
                <option value="$80M - $180M COP">$80M - $180M COP (Rango Estándar Fondo Emprender)</option>
                <option value="$20.000 USD - $100.000 USD">$20.000 - $100.000 USD (Cooperación Internacional / APC / BID)</option>
                <option value="Más de $100.000 USD">Más de $100.000 USD (Proyectos a Gran Escala / Fondos Globales)</option>
              </select>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-color-base-content/60 hover:text-color-base-content transition-colors"
              >
                Volver
              </button>
              <GlowButton
                disabled={loading}
                onClick={handleSubmitDiagnostico}
                className="px-8 py-3 text-xs font-black tracking-widest gap-2 bg-gradient-to-r from-color-primary to-teal-500"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    ANALIZANDO CON IA...
                  </>
                ) : (
                  <>
                    GENERAR DIAGNÓSTICO GRATUITO
                    <Sparkles className="h-4 w-4" />
                  </>
                )}
              </GlowButton>
            </div>
          </div>
        )}

        {/* STEP 4: RESULTADO VISUAL Y RECOMENDACIONES DE FONDOS (BLOQUE 1 COMPLETO) */}
        {step === 4 && resultado && (
          <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
            {/* Header del Diagnóstico */}
            <div className="bg-gradient-to-br from-color-primary/10 via-emerald-500/5 to-teal-500/10 p-6 md:p-8 rounded-3xl border border-color-primary/20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-color-primary bg-white/80 px-3 py-1 rounded-full border border-color-primary/30">
                    DIAGNÓSTICO FINALIZADO CON ÉXITO
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black text-color-base-content mt-2 uppercase italic">
                    Informe de Viabilidad: <span className="text-color-primary">{formData.empresa || formData.nombre}</span>
                  </h3>
                  <p className="text-xs md:text-sm text-color-base-content/80 mt-1 max-w-xl">
                    {resultado.resumenEjecutivo}
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-color-primary/30 shadow-xl min-w-[160px]">
                  <span className="text-[10px] font-black text-color-base-content/60 uppercase tracking-widest">
                    Score General
                  </span>
                  <span className="text-4xl font-black text-color-primary my-1">
                    {resultado.scores.preparacionConvocatorias}%
                  </span>
                  <span className="text-[9px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Apto para Postulación
                  </span>
                </div>
              </div>
            </div>

            {/* Gráficos de Porcentaje e Indicadores */}
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-color-base-content/80 mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-color-primary" />
                Matriz de Desempeño por Dimensión
              </h4>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: 'Constitución & Legalidad',
                    score: resultado.scores.formalizacionLegal,
                    desc: 'Registro SAS, RUT, Cámara de Comercio y gobernanza.'
                  },
                  {
                    title: 'Elegibilidad Financiera',
                    score: resultado.scores.elegibilidadFinanciera,
                    desc: 'Perfil idóneo para capital semilla o cooperación.'
                  },
                  {
                    title: 'Madurez del Proyecto',
                    score: resultado.scores.madurezProyecto,
                    desc: 'Claridad en propuesta de valor e impacto medible.'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white/60 border border-color-base-200 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-color-base-content">{item.title}</span>
                      <span className="text-lg font-black text-color-primary">{item.score}%</span>
                    </div>
                    <div className="w-full h-2 bg-color-base-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-color-primary to-teal-500 transition-all duration-1000"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-color-base-content/70">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Fondos y Cooperantes Sugeridos (Fondo Emprender, APC, BID, DRK, iNNpulsa) */}
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-color-base-content/80 mb-4 flex items-center gap-2">
                <Award className="h-4 w-4 text-color-primary" />
                Convocatorias & Fondos Recomendados para Tu Proyecto
              </h4>

              <div className="grid md:grid-cols-2 gap-4">
                {resultado.fondosSugeridos.map((fondo, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white border border-color-base-200 hover:border-color-primary/40 shadow-sm hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-color-primary bg-color-primary/10 px-2.5 py-0.5 rounded-full">
                          {fondo.tipo}
                        </span>
                        <h5 className="font-extrabold text-base text-color-base-content mt-1">
                          {fondo.nombre}
                        </h5>
                        <span className="text-[11px] font-semibold text-color-base-content/60">
                          {fondo.entidad}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                          {fondo.coincidenciaPorcentaje}% Match
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-color-base-content/80 font-medium">
                      {fondo.descripcion}
                    </p>

                    <div className="pt-2 border-t border-color-base-100 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-color-base-content">
                        Monto: <span className="text-color-primary">{fondo.montoEstimado}</span>
                      </span>
                      <span className="text-color-base-content/60 italic font-medium">
                        Requisitos: {fondo.requisitosClave.length} verificados
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Brechas Criticas y Pasos Recomendados */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                <h5 className="text-xs font-black uppercase tracking-wider text-amber-700 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                  Aspectos Clave a Fortalecer (Brechas)
                </h5>
                <ul className="space-y-2">
                  {resultado.brechasCriticas.map((b, i) => (
                    <li key={i} className="text-xs font-medium text-color-base-content/80 flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-color-primary/5 border border-color-primary/20 space-y-3">
                <h5 className="text-xs font-black uppercase tracking-wider text-color-primary flex items-center gap-2">
                  <Zap className="h-4 w-4 text-color-primary" />
                  Ruta de Acción Sugerida
                </h5>
                <ul className="space-y-2">
                  {resultado.pasosRecomendados.map((p, i) => (
                    <li key={i} className="text-xs font-medium text-color-base-content/80 flex items-start gap-2">
                      <span className="text-color-primary font-bold">•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* TRANSICIÓN AL BLOQUE 2: OFERTA DE PLANES PAGADOS */}
            {/* TRANSICIÓN AL BLOQUE 2: OFERTA DE PLANES PAGADOS */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden space-y-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-color-primary/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-color-primary/20 border border-color-primary/30 text-color-primary text-[10px] font-black uppercase tracking-widest">
                  Transición a Estructuración Profesional (Bloque 2)
                </div>
                <h4 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight">
                  ¿Listo para asegurar la aprobación de tus fondos?
                </h4>
                <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
                  Con nuestro acompañamiento en <strong className="text-white">Arquitectura Digital</strong>, transformamos tu diagnóstico en una propuesta técnica impecable con marco lógico, presupuesto detallado y documentación lista para radicar.
                </p>
              </div>

              <div className="relative z-10 flex flex-wrap items-center gap-4 pt-2">
                <a
                  href={getWhatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-color-primary text-white font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-color-primary/30 transition-all"
                >
                  <MessageSquare className="h-4 w-4" />
                  AGENDAR CONSULTA CON TU INFORME POR WHATSAPP
                </a>

                <a
                  href="#bloque2-planes"
                  onClick={() => {
                    const el = document.getElementById('bloque2-planes')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                    onPlanSelect?.(resultado.planRecomendado)
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-all"
                >
                  VER PLANES DE ESTRUCTURACIÓN (BLOQUE 2)
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* SECCIÓN BLOQUE 2 INTEGRADA */}
            <div id="bloque2-planes" className="pt-8 border-t border-color-base-200">
              <PlanSelector
                diagnosticoContext={{
                  nombre: formData.nombre,
                  empresa: formData.empresa,
                  email: formData.email,
                  whatsapp: formData.whatsapp,
                  montoObjetivo: formData.montoObjetivo,
                  scoreGlobal: resultado.scores.preparacionConvocatorias,
                  fondosEmparejados: resultado.fondosSugeridos.map(f => f.nombre)
                }}
                onSelectPlan={(plan) => {
                  if (typeof window !== 'undefined') {
                    window.location.href = `/estructuracion?plan=${plan.id}`
                  }
                }}
              />
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-color-base-content/60 hover:text-color-base-content underline"
              >
                Realizar un nuevo diagnóstico con otros datos
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
