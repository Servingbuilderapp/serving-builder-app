'use client'

import React, { useState } from 'react'
import { Globe, MessageSquare, ShieldCheck, Sparkles, Clock, LayoutGrid, CheckCircle2, ArrowRight } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { IdiomaSeguimiento, traduccionesSeguimiento } from '@/lib/seguimientoTranslations'
import { SemaforoConvocatorias, ConvocatoriaAsignada } from './SemaforoConvocatorias'
import { ProgresoMetodologia32Pasos } from './ProgresoMetodologia32Pasos'

interface DashboardSeguimientoProps {
  proyectoNombre?: string
}

export function DashboardSeguimiento({ proyectoNombre = 'Proyecto EcoInnovación Digital' }: DashboardSeguimientoProps) {
  const [idioma, setIdioma] = useState<IdiomaSeguimiento>('es')
  const t = traduccionesSeguimiento[idioma]

  // Convocatorias asignadas de prueba con diferentes fechas de cierre para probar el semáforo 🟢 / 🟡 / 🔴 / ⚫
  const convocatoriasSimuladas: ConvocatoriaAsignada[] = [
    {
      id: 'c1',
      nombre: 'Fondo Emprender SENA - Convocatoria Nacional 2026',
      entidad: 'SENA / Gobierno de Colombia',
      monto: 'Hasta $100M - $180M COP',
      fechaCierre: '2026-08-20', // ~30 días restantes -> 🟢 VERDE
      categoria: 'Capital Semilla',
      tdr: 'Financiación condonable del 100% del plan de negocio para nuevas empresas formadas en Colombia con componentes de innovación y empleo.',
      urlOficial: 'https://www.fondoemprender.com',
      requisitosClave: ['Plan de negocio formalizado', 'Asesoría y validación SENA', 'Constitución de SAS']
    },
    {
      id: 'c2',
      nombre: 'APC Colombia - Fondo de Cooperación Sur-Sur & Triangular',
      entidad: 'Agencia Presidencial de Cooperación Internacional',
      monto: '$50,000 USD - $150,000 USD',
      fechaCierre: '2026-08-05', // ~15 días restantes -> 🟡 AMARILLO
      categoria: 'Subvención No Reembolsable',
      tdr: 'Subvención técnica y financiera no reembolsable para iniciativas de desarrollo sostenible, comunidades vulnerables y tecnologías limpias.',
      urlOficial: 'https://www.apccolombia.gov.co',
      requisitosClave: ['Entidad legal o alianza con ESAL', 'Matriz de Marco Lógico', 'Indicadores de impacto social']
    },
    {
      id: 'c3',
      nombre: 'BID Lab - Desafío de Innovación y Aceleración Tecnológica',
      entidad: 'Banco Interamericano de Desarrollo',
      monto: '$100,000 USD - $300,000 USD',
      fechaCierre: '2026-07-28', // ~7 días restantes -> 🔴 ROJO (Máxima Urgencia)
      categoria: 'Capital Semilla & Aceleración',
      tdr: 'Financiamiento directo para modelos de negocio escalables de alto impacto ambiental o social en América Latina.',
      urlOficial: 'https://bidlab.org',
      requisitosClave: ['MVP funcional', 'Tracción preliminar', 'Modelo de ingresos validado']
    },
    {
      id: 'c4',
      nombre: 'iNNpulsa Colombia - Programa Vouchers de Innovación MGA',
      entidad: 'Ministerio de Comercio, Industria y Turismo',
      monto: '$40M COP',
      fechaCierre: '2026-07-10', // Pasada -> ⚫ NEGRO (Vencida)
      categoria: 'Cofinanciación',
      tdr: 'Cofinanciación de prototipado y validación comercial para micro y pequeñas empresas registradas.',
      urlOficial: 'https://innpulsacolombia.com',
      requisitosClave: ['RUT activo con mínimo 6 meses de registro', 'Certificado de Existencia']
    }
  ]

  const getWhatsappSoporteLink = () => {
    const msg = encodeURIComponent(
      `Hola Arquitectura Digital, soy cliente del proyecto "${proyectoNombre}". Quisiera ponerme en contacto con mi estructurador asignado para revisar el avance de mi propuesta.`
    )
    return `https://wa.me/573000000000?text=${msg}`
  }

  return (
    <div className="w-full max-w-5xl mx-auto my-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Selector de Idioma (ES / EN / PT) & Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-color-base-300 shadow-sm">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-color-primary bg-color-primary/10 px-3 py-1 rounded-full border border-color-primary/20">
            BLOQUE 3: MONITOREO & CONVOCATORIAS
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-color-base-content uppercase italic mt-1">
            {t.title}
          </h2>
          <p className="text-xs text-color-base-content/70 font-semibold mt-0.5">
            Proyecto: <strong className="text-color-primary">{proyectoNombre}</strong>
          </p>
        </div>

        {/* Language selector buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start sm:self-auto">
          <Globe className="h-4 w-4 text-slate-500 ml-2 mr-1" />
          <button
            onClick={() => setIdioma('es')}
            className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
              idioma === 'es' ? 'bg-color-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ES
          </button>
          <button
            onClick={() => setIdioma('en')}
            className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
              idioma === 'en' ? 'bg-color-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setIdioma('pt')}
            className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
              idioma === 'pt' ? 'bg-color-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            PT
          </button>
        </div>
      </div>

      {/* 1. BARRA DE PROGRESO DE LA METODOLOGÍA DE 32 PASOS */}
      <ProgresoMetodologia32Pasos pasosCompletadosCount={12} idioma={idioma} />

      {/* 2. MÓDULO DE CONVOCATORIAS ASIGNADAS CON SISTEMA DE SEMÁFORO (🟢/🟡/🔴/⚫) */}
      <SemaforoConvocatorias convocatorias={convocatoriasSimuladas} idioma={idioma} />

      {/* 3. CANAL DIRECTO DE SOPORTE CON EL ESTRUCTURADOR */}
      <GlassCard className="p-8 border border-color-primary/30 bg-gradient-to-r from-slate-900 via-[#0B2A4A] to-slate-900 text-white shadow-2xl relative overflow-hidden space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-color-primary/20 border border-color-primary/30 text-color-primary text-[10px] font-black uppercase tracking-widest">
              <MessageSquare className="h-3.5 w-3.5" />
              SOPORTE TÉCNICO DIRECTO
            </div>
            <h3 className="text-xl md:text-2xl font-black italic uppercase">
              {t.soporteTitle}
            </h3>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-xl">
              {t.soporteDesc}
            </p>
          </div>

          <div>
            <a
              href={getWhatsappSoporteLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-color-primary hover:brightness-110 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-color-primary/30 transition-all"
            >
              <MessageSquare className="h-4 w-4" />
              {t.contactarEstructurador}
            </a>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
