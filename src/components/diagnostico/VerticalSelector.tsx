'use client'

import React from 'react'
import {
  HeartPulse,
  GraduationCap,
  Leaf,
  Rocket,
  Building2,
  Cpu,
  Users,
  Sprout,
  Award,
  Check,
  Crown,
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react'
import { VerticalId, VERTICALES_OFICIALES, TipoAccesoSocio, VerticalItem } from '@/types/verticales'

interface VerticalSelectorProps {
  selectedVerticalId: VerticalId
  tipoAcceso: TipoAccesoSocio
  onSelectVertical: (vertical: VerticalItem) => void
  onToggleTipoAcceso: (tipo: TipoAccesoSocio) => void
}

const ICON_MAP: Record<string, React.ElementType> = {
  HeartPulse,
  GraduationCap,
  Leaf,
  Rocket,
  Building2,
  Cpu,
  Users,
  Sprout,
  Award
}

export function VerticalSelector({
  selectedVerticalId,
  tipoAcceso,
  onSelectVertical,
  onToggleTipoAcceso
}: VerticalSelectorProps) {
  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Header Selector de Acceso: Estándar vs Socio Anual */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-color-primary dark:text-teal-400 bg-color-primary/10 dark:bg-teal-500/10 px-3 py-1 rounded-full border border-color-primary/20 dark:border-teal-500/30">
              MODALIDAD DE ESTRUCTURACIÓN Y DIAGNÓSTICO
            </span>
            <h3 className="text-lg md:text-xl font-black uppercase italic text-slate-900 dark:text-white mt-1">
              Selecciona la Vertical de tu Proyecto
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Especializamos la taxonomía de la Metodología MGA y los algoritmos de emparejamiento según tu sector objetivo.
            </p>
          </div>

          {/* Toggle Estándar vs Socio Anual */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => onToggleTipoAcceso('estandar')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                tipoAcceso === 'estandar'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-600'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Acceso Estándar
            </button>

            <button
              type="button"
              onClick={() => onToggleTipoAcceso('socio_anual')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                tipoAcceso === 'socio_anual'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
            >
              <Crown className="h-3.5 w-3.5 fill-current" />
              Socio Anual VIP
            </button>
          </div>
        </div>

        {/* Banner informativo del estatus de Socio Anual */}
        {tipoAcceso === 'socio_anual' && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-center justify-between text-xs font-bold animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
              <span>
                <strong>Modo Socio Anual Activo:</strong> Priorización de radicación en la ruta de estructuración, soporte personalizado en convocatorias ilimitadas y 0% comisión sobre desembolsos.
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-md border border-amber-500/40 shrink-0 hidden sm:inline-block">
              Beneficio Exclusivo
            </span>
          </div>
        )}
      </div>

      {/* Grid de 9 Verticales Oficiales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {VERTICALES_OFICIALES.map((vertical) => {
          const isSelected = selectedVerticalId === vertical.id
          const IconComponent = ICON_MAP[vertical.iconoNombre] || Rocket

          return (
            <div
              key={vertical.id}
              onClick={() => onSelectVertical(vertical)}
              className={`relative group cursor-pointer p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 border-color-primary dark:border-teal-500 shadow-xl shadow-color-primary/10 dark:shadow-teal-500/10 ring-2 ring-color-primary/20 dark:ring-teal-500/30 scale-[1.02]'
                  : 'bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Top Row: Icon + Badge + Check */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div
                  className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all ${
                    isSelected
                      ? `bg-gradient-to-br ${vertical.colorTheme} text-white shadow-md`
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:scale-110'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${vertical.badgeColor}`}
                  >
                    {vertical.nombre}
                  </span>

                  {isSelected && (
                    <span className="h-6 w-6 rounded-full bg-color-primary dark:bg-teal-500 text-white flex items-center justify-center shadow-sm animate-in zoom-in-50 duration-200">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>
              </div>

              {/* Central Content */}
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-color-primary dark:group-hover:text-teal-400 transition-colors">
                  {vertical.nombre}
                </h4>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {vertical.subtitulo}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                  {vertical.descripcion}
                </p>
              </div>

              {/* Bottom Tags / Fondos */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-slate-500 dark:text-slate-400 font-semibold truncate max-w-[80%]">
                  Empareja con: <strong className="text-slate-700 dark:text-slate-200">{vertical.fondosDestacados[0]}</strong>
                </span>
                <span className="font-black text-color-primary dark:text-teal-400">
                  +3 Convocatorias
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
