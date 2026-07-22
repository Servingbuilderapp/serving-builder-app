'use client'

import React, { useState } from 'react'
import { FileText, CheckCircle2, Lock, Shield, ArrowRight, ArrowLeft } from 'lucide-react'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlassCard } from '@/components/ui/GlassCard'
import { PlanSeleccionado } from './PlanSelector'

export interface ContratoFirmado {
  nombreFirmante: string
  documentoIdentidad: string
  emailFirmante: string
  habeasDataAceptado: boolean
  terminosAceptados: boolean
  fechaFirma: string
}

interface ContratoDigitalModalProps {
  plan: PlanSeleccionado
  onContratoFirmado: (contrato: ContratoFirmado) => void
  onBack: () => void
}

export function ContratoDigitalModal({ plan, onContratoFirmado, onBack }: ContratoDigitalModalProps) {
  const [nombreFirmante, setNombreFirmante] = useState('')
  const [documentoIdentidad, setDocumentoIdentidad] = useState('')
  const [emailFirmante, setEmailFirmante] = useState('')
  const [habeasDataAceptado, setHabeasDataAceptado] = useState(false)
  const [terminosAceptados, setTerminosAceptados] = useState(false)
  const [errorText, setErrorText] = useState('')

  const handleFirmar = () => {
    if (!nombreFirmante || !documentoIdentidad || !emailFirmante) {
      setErrorText('Por favor completa todos los campos de identificación para la firma digital.')
      return
    }
    if (!habeasDataAceptado || !terminosAceptados) {
      setErrorText('Debes aceptar la política de Habeas Data y los Términos y Condiciones contractuales.')
      return
    }

    const contrato: ContratoFirmado = {
      nombreFirmante,
      documentoIdentidad,
      emailFirmante,
      habeasDataAceptado,
      terminosAceptados,
      fechaFirma: new Date().toISOString()
    }

    onContratoFirmado(contrato)
  }

  return (
    <div className="w-full max-w-4xl mx-auto my-6 animate-in fade-in zoom-in-95 duration-500">
      <GlassCard className="p-8 md:p-12 border border-color-primary/30 bg-white/90 shadow-2xl space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-color-base-200">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-color-primary bg-color-primary/10 px-3 py-1 rounded-full border border-color-primary/20">
              PASO 2: CONTRATO DIGITAL & ACEPTACIÓN LEGAL
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-color-base-content uppercase italic mt-2">
              Contrato de Servicios de Estructuración Digital
            </h2>
            <p className="text-xs text-color-base-content/70 font-semibold mt-1">
              Plan Seleccionado: <strong className="text-color-primary">{plan.nombre}</strong> ({plan.precioTotalDisplay})
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-2 rounded-xl">
            <Lock className="h-4 w-4 text-emerald-600" />
            Firma Encriptada con SSL
          </div>
        </div>

        {/* Visor de Contrato Legible */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 h-64 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed font-sans shadow-inner">
          <h4 className="font-extrabold text-slate-900 text-sm uppercase">
            CONTRATO DE PRESTACIÓN DE SERVICIOS TÉCNICOS Y ESTRUCTURACIÓN DIGITAL DE PROYECTOS
          </h4>

          <p>
            Entre los suscritos a saber: <strong>ARQUITECTURA DIGITAL S.A.S.</strong>, en adelante EL PRESTADOR, y el usuario identificado en la firma del presente documento, en adelante EL CLIENTE, se celebra el presente contrato sujeto a las siguientes cláusulas:
          </p>

          <h5 className="font-bold text-slate-900 uppercase pt-2">CLÁUSULA PRIMERA - OBJETO:</h5>
          <p>
            EL PRESTADOR se compromete a realizar la estructuración técnica del proyecto del CLIENTE bajo metodologías estandarizadas (Marco Lógico, Ficha MGA o matriz técnica exigida por cooperantes y fondos de financiación), entregando la documentación final en un plazo máximo de <strong>treinta (30) días calendario</strong> a partir del cumplimiento total del <strong>Day Zero</strong>.
          </p>

          <h5 className="font-bold text-slate-900 uppercase pt-2">CLÁUSULA SEGUNDA - VALOR Y FORMA DE PAGO:</h5>
          <p>
            El valor acordado para el plan seleccionado (<strong>{plan.nombre}</strong>) es de <strong>{plan.precioTotalDisplay}</strong>. {plan.id === 'esencial' ? 'EL CLIENTE realiza un pago inicial de $7.000.000 COP para iniciar la estructuración y podrá activar los módulos de búsqueda según su conveniencia.' : 'Incluye período de acompañamiento activo y garantías de postulación.'}
          </p>

          <h5 className="font-bold text-slate-900 uppercase pt-2">CLÁUSULA TERCERA - GARANTÍA DE ACOMPAÑAMIENTO EXTENDIDO:</h5>
          <p>
            {plan.garantia} En caso de no resultar beneficiario de fondos durante el periodo inicial contratado, EL PRESTADOR extenderá el tiempo de búsqueda y postulación de forma 100% gratuita según los términos garantizados en el plan.
          </p>

          <h5 className="font-bold text-slate-900 uppercase pt-2">CLÁUSULA CUARTA - POLÍTICA DE HABEAS DATA Y PRIVACIDAD (LEY 1581 DE 2012):</h5>
          <p>
            EL CLIENTE autoriza de manera explícita a ARQUITECTURA DIGITAL S.A.S. para el tratamiento de sus datos personales, información empresarial y documentos técnicos con el único fin de ejecutar el objeto de este contrato y gestionar postulaciones a convocatorias.
          </p>

          <h5 className="font-bold text-slate-900 uppercase pt-2">CLÁUSULA QUINTA - CONDICIÓN SUSPENSIVA (DAY ZERO):</h5>
          <p>
            Las partes declaran expresamente que el término de treinta (30) días para la entrega del proyecto estructurado comenzará a contarse únicamente a partir del día hábil siguiente en que EL CLIENTE complete los tres (3) requisitos del <strong>Day Zero</strong> (Video Pitch de máx 3 min, Documento Actual del Proyecto y Formulario de 22 Preguntas).
          </p>
        </div>

        {/* Checkboxes de Aceptación Legal & Habeas Data */}
        <div className="space-y-3 bg-white p-5 rounded-2xl border border-color-base-200">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={habeasDataAceptado}
              onChange={e => setHabeasDataAceptado(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-color-base-300 text-color-primary focus:ring-color-primary"
            />
            <span className="text-xs font-medium text-color-base-content/90">
              Acepto explícitamente la <strong className="text-color-base-content">Política de Habeas Data (Tratamiento de Datos Personales)</strong> para la gestión de mi proyecto y búsqueda de financiamiento.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={terminosAceptados}
              onChange={e => setTerminosAceptados(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-color-base-300 text-color-primary focus:ring-color-primary"
            />
            <span className="text-xs font-medium text-color-base-content/90">
              He leído y acepto los <strong className="text-color-base-content">Términos, Condiciones y Cláusulas Contractuales</strong> descritos en este documento digital.
            </span>
          </label>
        </div>

        {/* Formulario de Firma Digital */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-color-base-content flex items-center gap-2">
            <FileText className="h-4 w-4 text-color-primary" />
            Datos del Firmante Representante
          </h4>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-color-base-content/80 mb-1">
                Nombre Completo o Razón Social *
              </label>
              <input
                type="text"
                placeholder="Ej: Juan Carlos Perez"
                value={nombreFirmante}
                onChange={e => setNombreFirmante(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-color-base-300 bg-white text-xs font-medium focus:ring-2 focus:ring-color-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-color-base-content/80 mb-1">
                Cédula de Ciudadanía o NIT *
              </label>
              <input
                type="text"
                placeholder="Ej: 1.098.765.432 / 901.234.567-8"
                value={documentoIdentidad}
                onChange={e => setDocumentoIdentidad(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-color-base-300 bg-white text-xs font-medium focus:ring-2 focus:ring-color-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-color-base-content/80 mb-1">
                Correo Electrónico Notificación *
              </label>
              <input
                type="email"
                placeholder="cliente@empresa.com"
                value={emailFirmante}
                onChange={e => setEmailFirmante(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-color-base-300 bg-white text-xs font-medium focus:ring-2 focus:ring-color-primary outline-none"
              />
            </div>
          </div>
        </div>

        {errorText && (
          <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
            {errorText}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-color-base-200">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-color-base-content/60 hover:text-color-base-content transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Selección de Plan
          </button>

          <GlowButton
            onClick={handleFirmar}
            className="px-8 py-3 text-xs font-black tracking-widest gap-2 bg-gradient-to-r from-color-primary to-teal-500"
          >
            FIRMAR CONTRATO Y CONTINUAR A DAY ZERO
            <ArrowRight className="h-4 w-4" />
          </GlowButton>
        </div>
      </GlassCard>
    </div>
  )
}
