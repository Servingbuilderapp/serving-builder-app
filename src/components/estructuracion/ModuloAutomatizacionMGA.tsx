'use client'

import React, { useState } from 'react'
import { Layers, FileSpreadsheet, Sparkles, CheckCircle2, DollarSign, Target, Activity, FileText, ShieldAlert, PieChart } from 'lucide-react'
import { IdiomaSeguimiento, traduccionesSeguimiento } from '@/lib/seguimientoTranslations'
import { FichaPresupuestalCronograma } from './FichaPresupuestalCronograma'

interface ModuloAutomatizacionMGAProps {
  idioma: IdiomaSeguimiento
}

export function ModuloAutomatizacionMGA({ idioma }: ModuloAutomatizacionMGAProps) {
  const t = traduccionesSeguimiento[idioma]
  const [tabActiva, setTabActiva] = useState<'mml' | 'arboles' | 'riesgos' | 'presupuesto'>('mml')

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-color-base-300 shadow-md space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-color-base-200 pb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-color-primary bg-color-primary/10 px-3 py-1 rounded-full border border-color-primary/20">
            ESTÁNDAR MGA & FONDO EMPRENDER SENA
          </span>
          <h3 className="text-xl md:text-2xl font-black text-color-base-content uppercase italic mt-1">
            {t.mgaTitle}
          </h3>
          <p className="text-xs text-color-base-content/70 font-medium">
            Procesamiento inteligente del diagnóstico para compilar la Ficha Técnica, Marco Lógico y Presupuesto oficial.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setTabActiva('mml')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              tabActiva === 'mml' ? 'bg-color-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Marco Lógico & KPIs
          </button>
          <button
            onClick={() => setTabActiva('arboles')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              tabActiva === 'arboles' ? 'bg-color-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Árbol Problema/Objetivos
          </button>
          <button
            onClick={() => setTabActiva('riesgos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              tabActiva === 'riesgos' ? 'bg-color-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Matriz de Riesgos
          </button>
          <button
            onClick={() => setTabActiva('presupuesto')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              tabActiva === 'presupuesto' ? 'bg-color-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ficha Presupuestal & Cronograma
          </button>
        </div>
      </div>

      {/* TAB 1: MATRIZ DE MARCO LÓGICO (MML) */}
      {tabActiva === 'mml' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 flex items-center justify-between">
            <span>Matriz de Marco Lógico (MML) MGA oficial con Indicadores Clave de Desempeño (KPIs):</span>
            <span className="text-[10px] font-black uppercase tracking-wider bg-color-primary/10 text-color-primary px-2.5 py-1 rounded-md border border-color-primary/20">
              Validado MGA 2026
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Nivel MGA</th>
                  <th className="p-3">Resumen Narrativo</th>
                  <th className="p-3">Indicadores Clave (KPIs)</th>
                  <th className="p-3">Medios de Verificación</th>
                  <th className="p-3">Supuestos Críticos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                <tr>
                  <td className="p-3 font-bold text-color-primary bg-color-primary/5">FIN ULTIMO</td>
                  <td className="p-3 text-slate-800">Contribuir a la productividad regional, transición digital y sostenibilidad operativa.</td>
                  <td className="p-3 text-slate-600 font-medium">Incremento del 35% en rentabilidad neta en 24 meses.</td>
                  <td className="p-3 text-slate-600 font-medium">Informes de estados financieros auditados.</td>
                  <td className="p-3 text-slate-600 font-medium">Estabilidad macroeconómica y demanda sostenida.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-emerald-700 bg-emerald-50/50">PROPÓSITO CENTRAL</td>
                  <td className="p-3 text-slate-800">Implementar la solución tecnológica/industrial objeto de la cofinanciación pública.</td>
                  <td className="p-3 text-slate-600 font-medium">100% de la capacidad instalada operativa en Mes 12.</td>
                  <td className="p-3 text-slate-600 font-medium">Actas de entrega técnica y puesta en marcha.</td>
                  <td className="p-3 text-slate-600 font-medium">Adopción por parte del mercado objetivo superior al 75%.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-teal-700 bg-teal-50/50">COMPONENTES (PRODUCTOS)</td>
                  <td className="p-3 text-slate-800">1. Infraestructura y maquinaria.<br />2. Modelo operativo y talento.<br />3. Plataforma comercial/digital.</td>
                  <td className="p-3 text-slate-600 font-medium">3 componentes principales entregados bajo norma MGA.</td>
                  <td className="p-3 text-slate-600 font-medium">Dossier técnico, facturas y registros de propiedad.</td>
                  <td className="p-3 text-slate-600 font-medium">Disponibilidad oportuna de proveedores autorizados.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-700 bg-slate-100">ACTIVIDADES CLAVE</td>
                  <td className="p-3 text-slate-800">Adquisición de activos, contratación técnica, pruebas piloto y radicación final.</td>
                  <td className="p-3 text-slate-600 font-medium">Presupuesto ejecutado al 100% en 12 meses cronograma.</td>
                  <td className="p-3 text-slate-600 font-medium">Comprobantes de egreso, contratos y bitácora.</td>
                  <td className="p-3 text-slate-600 font-medium">Desembolso oportuno de los recursos del fondo.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ÁRBOLES PROBLEMA & OBJETIVOS */}
      {tabActiva === 'arboles' && (
        <div className="grid md:grid-cols-2 gap-6 animate-in fade-in duration-300">
          <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-600" />
              Árbol de Problemas (Diagnóstico de Causas MGA)
            </h4>
            <div className="p-3 rounded-xl bg-white border border-amber-200 text-xs font-bold text-amber-900">
              Problema Central: Ineficiencia operativa y limitaciones de escala para acceder a convocatorias de capital no reembolsable.
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <div>
                  <strong>Causa Raíz 1:</strong> Falta de infraestructura tecnológica moderna y maquinaria especializada.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <div>
                  <strong>Causa Directa 2:</strong> Ausencia de estructuración técnica previa bajo estándar MGA / SENA.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <div>
                  <strong>Efecto Directo:</strong> Baja competitividad comercial y pérdida de margen operativo.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <div>
                  <strong>Efecto Final:</strong> Riesgo de estancamiento financiero y vulnerabilidad ante competidores.
                </div>
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-600" />
              Árbol de Objetivos (Matriz de Soluciones MGA)
            </h4>
            <div className="p-3 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-emerald-900">
              Objetivo General: Desarrollar la capacidad productiva y estructuración técnica integral para captura de cofinanciación pública/privada.
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <div>
                  <strong>Medio Directo 1:</strong> Adquirir e instalar activos productivos de última generación.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <div>
                  <strong>Medio Directo 2:</strong> Formular la propuesta técnica formal con garantía de acompañamiento extendido.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <div>
                  <strong>Fin Directo:</strong> Incrementar la productividad y generar empleos directos verificables.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <div>
                  <strong>Fin Ultimo:</strong> Consolidar la sostenibilidad financiera y el liderazgo territorial.
                </div>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 3: MATRIZ DE RIESGOS */}
      {tabActiva === 'riesgos' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 flex items-center justify-between">
            <span>Matriz de Control y Mitigación de Riesgos (Exigencia MGA / SENA):</span>
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-800 px-2.5 py-1 rounded-md border border-amber-500/20">
              Evaluación Técnica de Riesgo
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Categoría de Riesgo</th>
                  <th className="p-3">Descripción del Riesgo</th>
                  <th className="p-3 text-center">Probabilidad</th>
                  <th className="p-3 text-center">Impacto</th>
                  <th className="p-3">Plan de Mitigación / Estrategia MGA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                <tr>
                  <td className="p-3 font-bold text-rose-700 bg-rose-50/50">TÉCNICO / OPERATIVO</td>
                  <td className="p-3 text-slate-800">Retraso en la entrega o instalación de maquinaria importada/especializada.</td>
                  <td className="p-3 text-center font-bold text-amber-600">Media</td>
                  <td className="p-3 text-center font-bold text-rose-600">Alto</td>
                  <td className="p-3 text-slate-600">Cláusulas de penalización a proveedores y stock crítico de contingencia.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-amber-700 bg-amber-50/50">FINANCIERO</td>
                  <td className="p-3 text-slate-800">Fluctuación en precios de insumos o descalce en el flujo de desembolsos del fondo.</td>
                  <td className="p-3 text-center font-bold text-amber-600">Media</td>
                  <td className="p-3 text-center font-bold text-amber-600">Medio</td>
                  <td className="p-3 text-slate-600">Reserva de contrapartida del 15% y cotizaciones garantizadas por 90 días.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-700 bg-slate-100">LEGAL / NORMATIVO</td>
                  <td className="p-3 text-slate-800">Demoras en trámites de permisos ambientales o registros ante Invima/Cámara Comercio.</td>
                  <td className="p-3 text-center font-bold text-emerald-600">Baja</td>
                  <td className="p-3 text-center font-bold text-rose-600">Alto</td>
                  <td className="p-3 text-slate-600">Pre-radicación de requisitos legales durante el Day Zero con acompañamiento jurídico.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PRESUPUESTO & CRONOGRAMA */}
      {tabActiva === 'presupuesto' && (
        <FichaPresupuestalCronograma topeMaximoFondo={180000000} />
      )}
    </div>
  )
}
