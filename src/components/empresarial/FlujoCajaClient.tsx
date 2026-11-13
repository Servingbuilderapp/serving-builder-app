'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { compacto } from '@/components/empresarial/Graficos'
import {
  Alertas,
  BOTON_ORO,
  BOTON_SUAVE,
  BarrasSaldo,
  CAMPO_CELDA,
  CAMPO_ENTRADA,
  Cifra,
  SOLO_DECIMAL,
  SelectorCondicion,
  Seccion,
} from '@/components/empresarial/CalculadorasUI'
import { formatoDinero } from '@/lib/empresarial/mercadoDemanda'
import { alertasFlujo, calcularFlujo, type FlujoCaja, type MesFlujo } from '@/lib/empresarial/calculadoras'

interface Props {
  proyecto: { id: string; nombre: string; moneda: string | null }
  inicial: FlujoCaja
  yaGuardado: boolean
  copiadoDeFinanciero: boolean
}

const COLUMNAS: { campo: keyof MesFlujo; titulo: string; ayuda: string }[] = [
  { campo: 'ventas', titulo: 'Ventas del mes', ayuda: 'Lo que vendes (aunque se cobre después).' },
  { campo: 'variables', titulo: 'Costos por vender', ayuda: 'Insumos, empaque, comisiones.' },
  { campo: 'fijos', titulo: 'Costos fijos', ayuda: 'Personal, arriendo, internet…' },
  { campo: 'inversion', titulo: 'Inversión', ayuda: 'Equipos, adecuaciones, trámites.' },
  { campo: 'aportes', titulo: 'Dinero que entra de fuera', ayuda: 'Aportes, préstamos, subvención.' },
]

export function FlujoCajaClient({ proyecto, inicial, yaGuardado, copiadoDeFinanciero }: Props) {
  const [f, setF] = useState<FlujoCaja>(inicial)
  const [guardado, setGuardado] = useState(yaGuardado)
  const [sucio, setSucio] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const r = useMemo(() => calcularFlujo(f), [f])
  const alertas = useMemo(() => alertasFlujo(f, r), [f, r])
  const din = (n: number | null) => formatoDinero(n, proyecto.moneda)

  const cambiar = (x: Partial<FlujoCaja>) => {
    setF((p) => ({ ...p, ...x }))
    setSucio(true)
  }
  const cambiarMes = (i: number, campo: keyof MesFlujo, valor: string) => {
    setF((p) => ({ ...p, meses: p.meses.map((m, k) => (k === i ? { ...m, [campo]: SOLO_DECIMAL(valor) } : m)) }))
    setSucio(true)
  }
  const repetirMes1 = () => {
    setF((p) => ({
      ...p,
      meses: p.meses.map((m, k) => (k === 0 ? m : { ...m, ventas: p.meses[0].ventas, variables: p.meses[0].variables, fijos: p.meses[0].fijos })),
    }))
    setSucio(true)
  }

  async function guardar() {
    setAviso(null)
    setGuardando(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('sfpe_calculadoras')
      .upsert({ proyecto_id: proyecto.id, tipo: 'flujo_caja', datos: f, actualizada_en: new Date().toISOString() }, { onConflict: 'proyecto_id,tipo' })
    setGuardando(false)
    if (error) return setAviso({ tipo: 'error', texto: 'No pudimos guardar el flujo de caja. Intenta de nuevo.' })
    setGuardado(true)
    setSucio(false)
    setAviso({ tipo: 'ok', texto: 'Flujo de caja guardado.' })
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino">
      <div className="max-w-[1000px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <Link href={`/empresarial/camino?proyecto=${proyecto.id}`} className="inline-flex items-center gap-2 text-sm text-ca-vino/75 hover:text-ca-vino-hondo">
          <ArrowLeft className="h-4 w-4" /> Volver a mi camino
        </Link>
        <div className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-ca-oro-texto">Flujo de caja · {proyecto.nombre}</div>
        <h1 className="mt-3 text-3xl lg:text-4xl font-extrabold">¿En qué mes te quedas sin plata?</h1>
        <p className="mt-3 text-ca-vino/80 leading-relaxed">
          Escribe cuánto vendes y cuánto gastas en cada uno de los próximos 12 meses. El sistema suma lo que entra, resta lo que sale y te
          muestra cuánto dinero queda en caja cada mes. Las cuentas las hace el sistema; no se inventa ninguna cifra.
        </p>

        {copiadoDeFinanciero && !guardado && (
          <div className="mt-6 rounded-2xl border border-ca-oro/60 bg-ca-fondo p-4 text-sm">
            <p className="font-semibold">Traímos tus cifras del Financiero básico y las repetimos en los 12 meses.</p>
            <p className="mt-1 text-ca-vino/80">Cámbialas mes a mes si tu negocio arranca despacio o tiene temporadas. Hasta que guardes, nada queda registrado.</p>
          </div>
        )}

        <Seccion titulo="1. Con cuánto empiezas y cuándo cobras" ayuda="Dos datos que cambian toda la historia.">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block font-semibold" htmlFor="fc-caja">
                Dinero en caja al empezar
              </label>
              <input id="fc-caja" inputMode="decimal" value={f.cajaInicial} onChange={(e) => cambiar({ cajaInicial: SOLO_DECIMAL(e.target.value) })} className={CAMPO_ENTRADA} />
              <SelectorCondicion valor={f.cajaCondicion} onCambio={(c) => cambiar({ cajaCondicion: c })} etiqueta="Dinero en caja" />
            </div>
            <div>
              <label className="block font-semibold" htmlFor="fc-cobro">
                ¿Cuánto tardas en cobrar lo que vendes?
              </label>
              <select id="fc-cobro" value={f.mesesCobro} onChange={(e) => cambiar({ mesesCobro: Number(e.target.value) })} className={CAMPO_ENTRADA}>
                <option value={0}>Cobro al instante (contado)</option>
                <option value={1}>Cobro 1 mes después</option>
                <option value={2}>Cobro 2 meses después</option>
                <option value={3}>Cobro 3 meses después</option>
              </select>
              <p className="mt-1 text-xs text-ca-vino/75">Vender no es cobrar: el dinero entra a caja cuando te pagan.</p>
            </div>
          </div>
        </Seccion>

        <Seccion titulo="2. Los 12 meses" ayuda="Deja vacío lo que no aplique. Todo va en la misma moneda del proyecto.">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={repetirMes1} className={BOTON_SUAVE}>
              Repetir el mes 1 en todos los meses
            </button>
            <span className="text-xs text-ca-vino/75">Copia ventas y costos del mes 1 a los demás (no toca inversión ni aportes).</span>
          </div>
          <div className="overflow-x-auto rounded-xl bg-ca-fondo p-3">
            <table className="w-full border-separate border-spacing-y-1 text-sm">
              <thead>
                <tr className="text-left align-bottom">
                  <th className="pr-2 font-bold">Mes</th>
                  {COLUMNAS.map((c) => (
                    <th key={c.campo} className="px-1 font-bold">
                      <span className="block">{c.titulo}</span>
                      <span className="block text-xs font-normal text-ca-vino/75">{c.ayuda}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {f.meses.map((m, i) => (
                  <tr key={i}>
                    <td className="pr-2 font-bold">{i + 1}</td>
                    {COLUMNAS.map((c) => (
                      <td key={c.campo} className="px-1">
                        <input
                          aria-label={`${c.titulo}, mes ${i + 1}`}
                          inputMode="decimal"
                          value={m[c.campo]}
                          onChange={(e) => cambiarMes(i, c.campo, e.target.value)}
                          className={CAMPO_CELDA}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <label className="block font-semibold" htmlFor="fc-fuente">
              ¿De dónde salen las ventas?
            </label>
            <p className="text-xs text-ca-vino/75">Pedidos, preventas, estudio de mercado. Una venta deseada no es una venta esperada.</p>
            <textarea id="fc-fuente" rows={3} value={f.ventasFuente} onChange={(e) => cambiar({ ventasFuente: e.target.value })} className={CAMPO_ENTRADA} />
            <SelectorCondicion valor={f.ventasCondicion} onCambio={(c) => cambiar({ ventasCondicion: c })} etiqueta="Ventas" />
          </div>
        </Seccion>

        <Seccion titulo="3. Qué pasa con tu caja" ayuda="Se recalcula cada vez que cambias una cifra.">
          {!r.hayDatos ? (
            <p className="text-sm text-ca-vino/75">Escribe cifras arriba para ver el resultado.</p>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <Cifra
                  fuerte
                  etiqueta="¿Se queda sin plata?"
                  valor={r.primerMesNegativo !== null ? `Sí, en el mes ${r.primerMesNegativo}` : 'No en estos 12 meses'}
                />
                <Cifra etiqueta="Dinero extra que haría falta" valor={din(r.necesidadMaxima)} />
                <Cifra etiqueta={`Punto más bajo (mes ${r.mesMinimo})`} valor={din(r.saldoMinimo)} />
                <Cifra etiqueta="Caja al final del mes 12" valor={din(r.saldoFinal)} />
                <Cifra etiqueta="Total que entra" valor={din(r.totalCobros)} />
                <Cifra etiqueta="Total que sale" valor={din(r.totalSalidas)} />
              </div>
              {r.porCobrarAlCierre > 0 && <p className="text-sm">Quedan por cobrar al cierre: <span className="font-extrabold text-ca-oro-texto">{din(r.porCobrarAlCierre)}</span>.</p>}
              <BarrasSaldo saldos={r.filas.map((x) => x.saldo)} titulo="Dinero en caja al final de cada mes" />
              <details className="rounded-xl bg-ca-fondo p-3 text-sm">
                <summary className="cursor-pointer font-semibold">Ver los valores mes a mes</summary>
                <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                  {r.filas.map((x) => (
                    <li key={x.mes}>
                      Mes {x.mes}: entra {compacto(x.cobros)}, sale {compacto(x.salidas)}, queda <span className={x.saldo < 0 ? 'font-extrabold text-ca-rojo' : 'font-extrabold'}>{din(x.saldo)}</span>
                    </li>
                  ))}
                </ul>
              </details>
              <Alertas alertas={alertas} />
            </>
          )}
        </Seccion>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button type="button" onClick={guardar} disabled={guardando} className={BOTON_ORO}>
            {guardando ? 'Guardando…' : 'Guardar flujo de caja'}
          </button>
          {guardado && !sucio && (
            <Link href={`/empresarial/calculadoras/capital-trabajo?proyecto=${proyecto.id}`} className={BOTON_SUAVE}>
              Seguir: Capital de trabajo
            </Link>
          )}
          {sucio && !guardando && <span className="text-sm text-ca-oro-texto">Tienes cambios sin guardar.</span>}
        </div>
        {aviso && (
          <div role={aviso.tipo === 'error' ? 'alert' : 'status'} className={`mt-4 rounded-2xl border p-4 text-sm ${aviso.tipo === 'error' ? 'border-ca-rojo/60 bg-ca-rojo/10' : 'border-ca-oro/60 bg-ca-fondo'}`}>
            {aviso.texto}
          </div>
        )}
        <p className="mt-6 text-xs text-ca-vino/75">
          Esto es una guía básica para ordenar tus cuentas; no reemplaza a un contador ni garantiza resultados. No incluye impuestos ni intereses de préstamos: súmalos como costos si aplican.
        </p>
      </div>
    </main>
  )
}
