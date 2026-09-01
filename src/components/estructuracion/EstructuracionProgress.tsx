'use client'

import React, { useState, useEffect } from 'react'
import { Clock, CheckCircle2, FileCheck2, Sparkles, MessageSquare, ShieldCheck, Download, Award, ArrowRight } from 'lucide-react'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlassCard } from '@/components/ui/GlassCard'
import { PlanSeleccionado } from './PlanSelector'

interface EstructuracionProgressProps {
  plan: PlanSeleccionado
}

export function EstructuracionProgress({ plan }: EstructuracionProgressProps) {
  // Simulador de contador regresivo de 30 días
  const [daysLeft, setDaysLeft] = useState(29)
  const [hoursLeft, setHoursLeft] = useState(23)
  const [minutesLeft, setMinutesLeft] = useState(59)

  return (
    <div className="w-full max-w-4xl mx-auto my-8 space-y-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Banner Principal de Confirmación */}
      <GlassCard className="p-8 md:p-12 border border-color-primary/30 bg-gradient-to-br from-slate-900 via-[#0B2A4A] to-slate-900 text-white shadow-2xl relative overflow-hidden space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              <CheckCircle2 className="h-4 w-4" />
              DAY ZERO VALIDADO CON ÉXITO
            </div>
            <h2 className="text-3xl md:text-5xl font-black italic uppercase mt-3">
              Proceso de Estructuración <span className="text-color-primary">Iniciado</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl mt-2">
              Tu proyecto ingresó a la fase oficial de producción técnica. Nuestro equipo de ingenieros y estructuradores preparará la documentación completa.
            </p>
          </div>

          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center min-w-[160px]">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Plan Contratado
            </span>
            <h4 className="text-sm font-black text-color-primary mt-1">
              {plan.nombre}
            </h4>
            <span className="text-[10px] text-slate-400 font-bold">
              {plan.precioTotalDisplay}
            </span>
          </div>
        </div>

        {/* Cronómetro de Entrega a 30 Días */}
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 text-center space-y-4">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-300 flex items-center justify-center gap-2">
            <Clock className="h-4 w-4 animate-pulse" />
            Compromiso de Entrega Técnica Máxima en 30 Días
          </span>

          <div className="flex justify-center items-center gap-4 text-white">
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-6xl font-black font-mono bg-slate-900/80 px-4 py-2 rounded-2xl border border-emerald-500/30 shadow-inner">
                {String(daysLeft).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2">Días</span>
            </div>
            <span className="text-3xl font-bold text-color-primary">:</span>
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-6xl font-black font-mono bg-slate-900/80 px-4 py-2 rounded-2xl border border-emerald-500/30 shadow-inner">
                {String(hoursLeft).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2">Horas</span>
            </div>
            <span className="text-3xl font-bold text-color-primary">:</span>
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-6xl font-black font-mono bg-slate-900/80 px-4 py-2 rounded-2xl border border-emerald-500/30 shadow-inner">
                {String(minutesLeft).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2">Minutos</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Hitos Técnicos de Producción */}
      <div className="bg-white rounded-3xl p-8 border border-color-base-300 shadow-xl space-y-6">
        <h3 className="text-lg font-black uppercase tracking-tight text-color-base-content flex items-center gap-2">
          <FileCheck2 className="h-5 w-5 text-color-primary" />
          Ruta de Producción & Entrega del Proyecto
        </h3>

        <div className="space-y-4">
          {[
            {
              step: '1',
              title: 'Revisión y Análisis de Requerimientos Day Zero',
              desc: 'Validación del video pitch, documento inicial y las 22 respuestas de contexto.',
              status: 'Completado',
              done: true
            },
            {
              step: '2',
              title: 'Redacción de Marco Lógico y Justificación Técnica',
              desc: 'Formulación de matriz de alternativas, problemática y población beneficiaria.',
              status: 'En Proceso',
              active: true
            },
            {
              step: '3',
              title: 'Estudio de Viabilidad Financiera & Presupuesto Detallado',
              desc: 'Modelación de costos, fuentes de financiación y desglose de rubros.',
              status: 'Pendiente',
              pending: true
            },
            {
              step: '4',
              title: 'Entrega de Ficha Técnica Finalizada y Documentos Radicables',
              desc: 'Entrega formal al cliente en formato listo para postular ante convocatorias.',
              status: 'Pendiente',
              pending: true
            },
            {
              step: '5',
              title: 'Activación de Módulo de Búsqueda & Postulación a Convocatorias',
              desc: 'Acompañamiento en la radicación efectiva y seguimiento a evaluaciones.',
              status: 'Pendiente',
              pending: true
            }
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                item.done ? 'bg-emerald-500 text-white' : item.active ? 'bg-color-primary text-white animate-pulse' : 'bg-slate-200 text-slate-600'
              }`}>
                {item.done ? <CheckCircle2 className="h-4 w-4" /> : item.step}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-sm text-color-base-content">{item.title}</h4>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    item.done ? 'bg-emerald-100 text-emerald-800' : item.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-color-base-content/70 font-medium mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Contacto WhatsApp */}
        <div className="pt-4 border-t border-color-base-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-semibold text-color-base-content/80">
            ¿Tienes dudas o necesitas actualizar información de tu proyecto?
          </p>
          <a
            href="https://wa.me/573000000000?text=Hola%20Arquitectura%20Digital,%20quisiera%20consultar%20el%20estado%20de%20mi%20proceso%20de%20estructuraci%C3%B3n."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-color-primary text-white font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-color-primary/20 transition-all"
          >
            <MessageSquare className="h-4 w-4" />
            CONTACTAR AL ASESOR ASIGNADO POR WHATSAPP
          </a>
        </div>
      </div>
    </div>
  )
}
