'use client'

import React from 'react'
import { ShieldCheck, Lock, FileText, Video, HelpCircle, Download, CheckCircle2, FileCode } from 'lucide-react'
import { IdiomaSeguimiento, traduccionesSeguimiento } from '@/lib/seguimientoTranslations'

interface VeaDataRepositoryProps {
  idioma: IdiomaSeguimiento
}

export function VeaDataRepository({ idioma }: VeaDataRepositoryProps) {
  const t = traduccionesSeguimiento[idioma]

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-color-base-300 shadow-md space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-color-base-200 pb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
            BÓVEDA DE DATOS SEGUROS & TRACER
          </span>
          <h3 className="text-xl md:text-2xl font-black text-color-base-content uppercase italic mt-1 flex items-center gap-2">
            <Lock className="h-5 w-5 text-emerald-600" />
            {t.veaDataTitle}
          </h3>
          <p className="text-xs text-color-base-content/70 font-medium">
            Almacenamiento encriptado de alta seguridad (SSL/AES-256) con trazabilidad de entregables del proyecto.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Habeas Data Cumplido (Ley 1581)
        </div>
      </div>

      {/* Lista de Insumos y Repositorio */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Video className="h-4 w-4 text-color-primary" />
              Video Pitch Day Zero (3 min)
            </span>
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Verificado & Cifrado
            </span>
          </div>
          <p className="text-xs text-slate-600">
            URL: <code className="bg-slate-200 px-2 py-0.5 rounded text-[11px]">https://loom.com/share/v1892...</code>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <FileText className="h-4 w-4 text-color-primary" />
              Documento Base del Proyecto (Anteproyecto)
            </span>
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Almacenado PDF/DOCX
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Archivo: <strong className="text-slate-800">anteproyecto_v2_final.pdf</strong> (14.2 MB)
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-color-primary" />
              Respuestas Formulario de 22 Preguntas
            </span>
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              22/22 Procesadas
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Ficha técnica consolidada en base de datos cifrada Supabase.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <FileCode className="h-4 w-4 text-color-primary" />
              Contrato Digital Firmado
            </span>
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Firma SSL Valida
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Contrato con garantía extendida y términos aceptados.
          </p>
        </div>
      </div>
    </div>
  )
}
