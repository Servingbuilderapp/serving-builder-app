'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Alertas, BOTON_ORO, BOTON_SUAVE, CAMPO_ENTRADA, CAMPO_CELDA, BarrasSaldo, Cifra, SOLO_DECIMAL, SelectorCondicion, Seccion } from '@/components/empresarial/CalculadorasUI'
import { formatoDinero } from '@/lib/empresarial/mercadoDemanda'
import { MAX_ANIOS, alertasVan, calcularVan, type VanTir } from '@/lib/empresarial/calculadoras'

interface Props {
  proyecto: { id: string; nombre: string; moneda: string | null }
  inicial: VanTir
  yaGuardado: boolean
  copiadoDeFinanciero: boolean
}

/** Deja escribir un signo menos al inicio: un año puede dejar pérdida. */
const CON_SIGNO = (v: string) => {
  const neg = v.trim().startsWith('-')
  const r = SOLO_DECIMAL(v.replace('-', ''))
  return neg ? `-${r}` : r
}

export function VanTirClient({ proyecto, inicial, yaGuardado, copiadoDeFinanciero }: Props) {
  const [v, setV] = useState<VanTir>(inicial)
  const [guardado, setGuardado] = useState(yaGuardado)
  const [sucio, setSucio] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const r = useMemo(() => calcularVan(v), [v])
  const alertas = useMemo(() => alertasVan(v, r), [v, r])
  const din = (n: number | null) => formatoDinero(n, proyecto.moneda)
  const pct = (n: number | null) => (n === null ? '—' : `${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(n)} %`)
  const n = Math.min(MAX_ANIOS, Math.max(1, Math.round(v.numAnios)))

  const poner = (cambio: Partial<VanTir>) => {
    setV((p) => ({ ...p, ...cambio }))
    setSucio(true)
  }

  async function guardar() {
    setAviso(null)
    setGuardando(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('sfpe_calculadoras')
      .upsert({ proyecto_id: proyecto.id, tipo: 'van_tir', datos: v, actualizada_en: new Date().toISOString() }, { onConflict: 'proyecto_id,tipo' })
    setGuardando(false)
    if (error) return setAviso({ tipo: 'error', texto: 'No pudimos guardar el cálculo. Intenta de nuevo.' })
    setGuardado(true)
    setSucio(false)
    setAviso({ tipo: 'ok', texto: 'Cálculo guardado.' })
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino">
      <div className="max-w-[900px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <Link href={`/empresarial/camino?proyecto=${proyecto.id}`} className="inline-flex items-center gap-2 text-sm text-ca-vino/75 hover:text-ca-vino-hondo">
          <ArrowLeft className="h-4 w-4" /> Volver a mi camino
        </Link>
        <div className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-ca-oro-texto">VAN y TIR · {proyecto.nombre}</div>
        <h1 className="mt-3 text-3xl lg:text-4xl font-extrabold">¿Vale la pena la inversión?</h1>
        <p className="mt-3 text-ca-vino/80 leading-relaxed">
          El VAN dice cuánto vale hoy, en dinero, lo que dejará el proyecto después de restar la inversión. La TIR dice a qué rentabilidad anual equivale. Varias convocatorias piden estas dos cifras. Las cuentas las hace el sistema con lo que escribes.
        </p>

        {copiadoDeFinanciero && !guardado && (
          <div className="mt-6 rounded-2xl border border-ca-oro/60 bg-ca-fondo p-4 text-sm">
            <p className="font-semibold">Traímos la inversión y un flujo anual del Financiero básico.</p>
            <p className="mt-1 text-ca-vino/80">Pusimos el mismo valor en todos los años; corrígelo año por año. Hasta que guardes, nada queda registrado.</p>
          </div>
        )}

        <Seccion titulo="1. La inversión y la rentabilidad mínima" ayuda="Lo que pones al inicio y lo mínimo que exiges a cambio.">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block font-semibold" htmlFor="vt-inv">Inversión inicial</label>
              <p className="text-xs text-ca-vino/75">Todo lo que se paga al comenzar (equipos, adecuaciones, trámites).</p>
              <input id="vt-inv" inputMode="decimal" value={v.inversion} onChange={(e) => poner({ inversion: SOLO_DECIMAL(e.target.value) })} className={CAMPO_ENTRADA} />
              <SelectorCondicion valor={v.inversionCondicion} onCambio={(c) => poner({ inversionCondicion: c })} etiqueta="Inversión inicial" />
            </div>
            <div>
              <label className="block font-semibold" htmlFor="vt-tasa">Tasa de descuento anual (en %)</label>
              <p className="text-xs text-ca-vino/75">La rentabilidad mínima que exiges. Si la convocatoria fija una, usa esa.</p>
              <input id="vt-tasa" inputMode="decimal" value={v.tasaPct} onChange={(e) => poner({ tasaPct: SOLO_DECIMAL(e.target.value) })} className={CAMPO_ENTRADA} />
              <SelectorCondicion valor={v.tasaCondicion} onCambio={(c) => poner({ tasaCondicion: c })} etiqueta="Tasa de descuento" />
            </div>
          </div>
        </Seccion>

        <Seccion titulo="2. Lo que deja cada año" ayuda="Dinero que entra menos dinero que sale en cada año. Si un año deja pérdida, escríbelo con un signo menos (por ejemplo -5000000).">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block font-semibold" htmlFor="vt-anios">¿Cuántos años analizas? (1 a {MAX_ANIOS})</label>
              <input
                id="vt-anios"
                type="number"
                min={1}
                max={MAX_ANIOS}
                value={v.numAnios}
                onChange={(e) => poner({ numAnios: Math.min(MAX_ANIOS, Math.max(1, Math.round(Number(e.target.value) || 1))) })}
                className={CAMPO_ENTRADA}
              />
            </div>
            <div>
              <label className="block font-semibold" htmlFor="vt-res">Dinero que recuperas al final (opcional)</label>
              <p className="text-xs text-ca-vino/75">Por ejemplo, lo que valdrían los equipos al vender.</p>
              <input id="vt-res" inputMode="decimal" value={v.rescate} onChange={(e) => poner({ rescate: SOLO_DECIMAL(e.target.value) })} className={CAMPO_ENTRADA} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {v.flujos.slice(0, n).map((f, i) => (
              <div key={i}>
                <label className="block text-sm font-semibold" htmlFor={`vt-f${i}`}>Año {i + 1}</label>
                <input id={`vt-f${i}`} inputMode="decimal" value={f} onChange={(e) => poner({ flujos: v.flujos.map((x, j) => (j === i ? CON_SIGNO(e.target.value) : x)) })} className={CAMPO_CELDA} />
              </div>
            ))}
          </div>
          <SelectorCondicion valor={v.flujosCondicion} onCambio={(c) => poner({ flujosCondicion: c })} etiqueta="Dinero de cada año" />
          <div>
            <label className="block font-semibold" htmlFor="vt-nota">Notas o fuentes de estas cifras (opcional)</label>
            <textarea id="vt-nota" rows={3} value={v.nota} onChange={(e) => poner({ nota: e.target.value })} className={CAMPO_ENTRADA} />
          </div>
        </Seccion>

        <Seccion titulo="3. El resultado" ayuda="Se recalcula cada vez que cambias una cifra.">
          {!r.hayDatos ? (
            <p className="text-sm text-ca-vino/75">Escribe cifras arriba para ver el resultado.</p>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Cifra fuerte etiqueta="VAN (valor de hoy, ya restada la inversión)" valor={r.van === null ? '—' : din(r.van)} />
                <Cifra fuerte etiqueta="TIR (rentabilidad anual)" valor={pct(r.tir)} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Cifra etiqueta="Dinero total que deja en los años analizados" valor={din(r.totalFlujos)} />
                <Cifra etiqueta="Año en que se recupera la inversión" valor={r.anioRecuperacion === null ? 'No dentro del plazo' : `Año ${r.anioRecuperacion}`} />
              </div>
              {r.van !== null && <BarrasSaldo saldos={r.acumulado} titulo="Dinero acumulado a valor de hoy (año 0 es la inversión)" primero={0} unidad="año" />}
              <p className="text-xs text-ca-vino/75">
                Cómo se calcula: VAN = suma de (dinero de cada año ÷ (1 + tasa) elevado al año) − inversión. La TIR es la tasa con la que el VAN daría cero.
              </p>
              <Alertas alertas={alertas} />
            </>
          )}
        </Seccion>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button type="button" onClick={guardar} disabled={guardando} className={BOTON_ORO}>
            {guardando ? 'Guardando…' : 'Guardar VAN y TIR'}
          </button>
          {guardado && !sucio && (
            <Link href={`/empresarial/riesgos?proyecto=${proyecto.id}`} className={BOTON_SUAVE}>
              Seguir: Termómetro de Riesgos
            </Link>
          )}
          {sucio && !guardando && <span className="text-sm text-ca-oro-texto">Tienes cambios sin guardar.</span>}
        </div>
        {aviso && (
          <div role={aviso.tipo === 'error' ? 'alert' : 'status'} className={`mt-4 rounded-2xl border p-4 text-sm ${aviso.tipo === 'error' ? 'border-ca-rojo/60 bg-ca-rojo/10' : 'border-ca-oro/60 bg-ca-fondo'}`}>
            {aviso.texto}
          </div>
        )}
        <p className="mt-6 text-xs text-ca-vino/75">Esto es una guía básica para ordenar tus cuentas; no reemplaza a un contador ni garantiza resultados.</p>
      </div>
    </main>
  )
}
