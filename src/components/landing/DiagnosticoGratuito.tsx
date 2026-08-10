'use client'

import React, { useState } from 'react'
import {
  Sparkles, ArrowRight, Loader2, Check, Building2, FileText,
  Coins, MessageSquare, Download, ChevronRight
} from 'lucide-react'
import { GlowButton } from '@/components/ui/GlowButton'
import { GlassCard } from '@/components/ui/GlassCard'
import type { DiagnosticoResultadoV2 } from '@/app/api/diagnostico-v2/route'

const initialForm = {
  nombreEmpresa: '',
  nombreRepresentante: '',
  documentoIdentidad: '',
  email: '',
  whatsapp: '',
  ciudadPais: '',
  nombreProyecto: '',
  beneficiarios: '',
  ubicacionProyecto: '',
  problema: '',
  solucion: '',
  objetivoGeneral: '',
  objetivosEspecificos: '',
  descripcionGeneral: '',
  presupuesto: '',
  moneda: 'COP',
  fasesProyecto: '',
  tiempoEjecucion: '',
  resultadosEsperados: '',
  modeloSostenibilidad: '',
  estrategiaEscalabilidad: '',
}

type FormData = typeof initialForm

const inputClass = "w-full px-4 py-3 rounded-xl border border-color-base-300 bg-white/50 focus:bg-white focus:ring-2 focus:ring-color-primary outline-none transition-all text-sm font-medium"
const labelClass = "block text-xs font-bold uppercase tracking-wider
