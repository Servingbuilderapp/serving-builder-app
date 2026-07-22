'use client'

import React, { useState } from 'react'
import { DollarSign, Calendar, PieChart, AlertCircle, Plus, Trash2, CheckCircle2, Sliders, ShieldCheck } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'

export interface RubroPresupuestal {
  id: string
  categoria: 'maquinaria' | 'talento' | 'insumos' | 'software' | 'operacion'
  descripcion: string
  montoSolicitadoFondo: number
  montoContrapartida: number
  mesInicio: number
  mesFin: number
}

interface FichaPresupuestalCronogramaProps {
  topeMaximoFondo?: number
  onBudgetChange?: (totals: { totalFondo: number; totalContrapartida: number; totalProyecto: number }) => void
}

export function FichaPresupuestalCronograma({
  topeMaximoFondo = 180000000,
  onBudgetChange
}: FichaPresupuestalCronogramaProps) {
  const [rubros, setRubros] = useState<RubroPresupuestal[]>([
    {
      id: 'rub-1',
      categoria: 'maquinaria',
      descripcion: 'Adquisición de maquinaria principal y automatización industrial',
      montoSolicitadoFondo: 65000000,
      montoContrapartida: 15000000,
      mesInicio: 1,
      mesFin: 3
    },
    {
      id: 'rub-2',
      categoria: 'talento',
      descripcion: 'Honorarios de equipo especializado en desarrollo e ingeniería',
      montoSolicitadoFondo: 45000000,
      montoContrapartida: 10000000,
      mesInicio: 1,
      mesFin: 12
    },
    {
      id: 'rub-3',
      categoria: 'software',
      descripcion: 'Licenciamiento en la nube, plataforma IoT e infraestructura digital',
      montoSolicitadoFondo: 25000000,
      montoContrapartida: 5000000,
      mesInicio: 2,
      mesFin: 6
    },
    {
      id: 'rub-4',
      categoria: 'insumos',
      descripcion: 'Materia prima, insumos técnicos y pruebas de laboratorio',
      montoSolicitadoFondo: 15000000,
      montoContrapartida: 5000000,
      mesInicio: 3,
      mesFin: 9
    }
  ])

  const [nuevoRubro, setNuevoRubro] = useState<{
    categoria: RubroPresupuestal['categoria']
    descripcion: string
    montoSolicitadoFondo: string
    montoContrapartida: string
    mesInicio: number
    mesFin: number
  }>({
    categoria: 'maquinaria',
    descripcion: '',
    montoSolicitadoFondo: '',
    montoContrapartida: '',
    mesInicio: 1,
    mesFin: 6
  })

  const [mostrarForm, setMostrarForm] = useState(false)

  // Cálculos consolidados
  const totalFondo = rubros.reduce((acc, r) => acc + r.montoSolicitadoFondo, 0)
  const totalContrapartida = rubros.reduce((acc, r) => acc + r.montoContrapartida, 0)
  const totalProyecto = totalFondo + totalContrapartida
  const porcentajeFondo = totalProyecto > 0 ? Math.round((totalFondo / totalProyecto) * 100) : 0
  const porcentajeContrapartida = 100 - porcentajeFondo

  const excedidoTope = totalFondo > topeMaximoFondo

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
  }

  const handleAgregarRubro = () => {
    if (!nuevoRubro.descripcion || !nuevoRubro.montoSolicitadoFondo) return
    const item: RubroPresupuestal = {
      id: `rub-${Date.now()}`,
      categoria: nuevoRubro.categoria,
      descripcion: nuevoRubro.descripcion,
      montoSolicitadoFondo: parseFloat(nuevoRubro.montoSolicitadoFondo) || 0,
      montoContrapartida: parseFloat(nuevoRubro.montoContrapartida) || 0,
      mesInicio: nuevoRubro.mesInicio,
      mesFin: nuevoRubro.mesFin
    }
    const updated = [...rubros, item]
    setRubros(updated)
    setNuevoRubro({
      categoria: 'maquinaria',
      descripcion: '',
      montoSolicitadoFondo: '',
      montoContrapartida: '',
      mesInicio: 1,
      mesFin: 6
    })
    setMostrarForm(false)
    onBudgetChange?.({
      totalFondo: updated.reduce((acc, r) => acc + r.montoSolicitadoFondo, 0),
      totalContrapartida: updated.reduce((acc, r) => acc + r.montoContrapartida, 0),
      totalProyecto: updated.reduce((acc, r) => acc + r.montoSolicitadoFondo + r.montoContrapartida, 0)
    })
  }

  const handleEliminarRubro = (id: string) => {
    const updated = rubros.filter(r => r.id !== id)
    setRubros(updated)
    onBudgetChange?.({
      totalFondo: updated.reduce((acc, r) => acc + r.montoSolicitadoFondo, 0),
      totalContrapartida: updated.reduce((acc, r) => acc + r.montoContrapartida, 0),
      totalProyecto: updated.reduce((acc, r) => acc + r.montoSolicitadoFondo + r.montoContrapartida, 0)
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cards Resumen Financiero */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-4 border-l-4 border-l-color-primary">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
            Financiamiento Solicitado al Fondo
          </span>
          <span className="text-xl md:text-2xl font-black text-color-base-content block mt-1">
            {formatCOP(totalFondo)}
          </span>
          <span className="text-xs font-bold text-color-primary mt-1 inline-block">
            {porcentajeFondo}% del Inversión Total (Tope: {formatCOP(topeMaximoFondo)})
          </span>
        </GlassCard>

        <GlassCard className="p-4 border-l-4 border-l-teal-500">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
            Contrapartida & Capital Propio
          </span>
          <span className="text-xl md:text-2xl font-black text-color-base-content block mt-1">
            {formatCOP(totalContrapartida)}
          </span>
          <span className="text-xs font-bold text-teal-600 mt-1 inline-block">
            {porcentajeContrapartida}% Aporte de la Empresa / Emprendedor
          </span>
        </GlassCard>

        <GlassCard className="p-4 border-l-4 border-l-slate-900 bg-slate-900 text-white">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 block">
            Presupuesto Total MGA Compilado
          </span>
          <span className="text-xl md:text-2xl font-black text-white block mt-1">
            {formatCOP(totalProyecto)}
          </span>
          <span className="text-xs font-bold text-emerald-400 mt-1 inline-block flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Estructuración Técnica Validada
          </span>
        </GlassCard>
      </div>

      {excedidoTope && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 flex items-center gap-3 text-xs font-bold">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <span>
            Atención: El monto solicitado ({formatCOP(totalFondo)}) supera el tope máximo asignado por la convocatoria ({formatCOP(topeMaximoFondo)}). Ajuste los rubros antes de exportar la ficha MGA.
          </span>
        </div>
      )}

      {/* Tabla Interactiva de Rubros Financiables */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <PieChart className="h-4 w-4 text-color-primary" />
              Desglose de Rubros Financiables y Cronograma de Ejecución
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Estructura técnica de inversión dividida por categorías MGA y contrapartida del convocante.
            </p>
          </div>
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-color-primary text-white text-xs font-black uppercase tracking-wider hover:brightness-110 transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" />
            {mostrarForm ? 'Cancelar' : 'Agregar Rubro Presupuestal'}
          </button>
        </div>

        {mostrarForm && (
          <div className="p-5 bg-slate-100 border-b border-slate-200 space-y-4">
            <h5 className="text-xs font-black uppercase tracking-wider text-slate-700">Nuevo Rubro de Inversión MGA</h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Categoría</label>
                <select
                  value={nuevoRubro.categoria}
                  onChange={(e) => setNuevoRubro({ ...nuevoRubro, categoria: e.target.value as any })}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="maquinaria">Maquinaria & Equipos</option>
                  <option value="talento">Talento Técnico / Honorarios</option>
                  <option value="software">Licenciamiento & Software</option>
                  <option value="insumos">Insumos & Materia Prima</option>
                  <option value="operacion">Operación & Logística</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Descripción del Rubro</label>
                <input
                  type="text"
                  placeholder="Ej. Adquisición de servidor dedicado y licencias de IA"
                  value={nuevoRubro.descripcion}
                  onChange={(e) => setNuevoRubro({ ...nuevoRubro, descripcion: e.target.value })}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Solicitado al Fondo (COP)</label>
                <input
                  type="number"
                  placeholder="30000000"
                  value={nuevoRubro.montoSolicitadoFondo}
                  onChange={(e) => setNuevoRubro({ ...nuevoRubro, montoSolicitadoFondo: e.target.value })}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Contrapartida (COP)</label>
                <input
                  type="number"
                  placeholder="5000000"
                  value={nuevoRubro.montoContrapartida}
                  onChange={(e) => setNuevoRubro({ ...nuevoRubro, montoContrapartida: e.target.value })}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Mes Inicio</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={nuevoRubro.mesInicio}
                    onChange={(e) => setNuevoRubro({ ...nuevoRubro, mesInicio: parseInt(e.target.value) || 1 })}
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Mes Fin</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={nuevoRubro.mesFin}
                    onChange={(e) => setNuevoRubro({ ...nuevoRubro, mesFin: parseInt(e.target.value) || 12 })}
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleAgregarRubro}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-black text-xs uppercase tracking-wider hover:bg-slate-800 transition-all"
            >
              Guardar Rubro en la Ficha MGA
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Categoría</th>
                <th className="p-3">Descripción</th>
                <th className="p-3 text-right">Solicitado Fondo</th>
                <th className="p-3 text-right">Contrapartida</th>
                <th className="p-3 text-center">Cronograma</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {rubros.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-bold text-slate-800 uppercase text-[10px]">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                      {r.categoria}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-800">{r.descripcion}</td>
                  <td className="p-3 font-black text-right text-color-primary">{formatCOP(r.montoSolicitadoFondo)}</td>
                  <td className="p-3 font-black text-right text-teal-700">{formatCOP(r.montoContrapartida)}</td>
                  <td className="p-3 text-center font-bold text-slate-600">
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200 text-[10px]">
                      <Calendar className="h-3 w-3" /> Mes {r.mesInicio} - Mes {r.mesFin}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleEliminarRubro(r.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                      title="Eliminar rubro"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
