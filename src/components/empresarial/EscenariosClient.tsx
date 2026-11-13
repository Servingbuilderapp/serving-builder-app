'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Alertas, BOTON_ORO, BOTON_SUAVE, CAMPO_ENTRADA, CAMPO_CELDA, RELIEVE_TARJETA, SOLO_DECIMAL, SelectorCondicion, Seccion } from '@/components/empresarial/CalculadorasUI'
import { BarrasH, MarcoGrafico, compacto } from '@/components/empresarial/Graficos'
import { formatoDinero } from '@/lib/empresarial/mercadoDemanda'
import {
  CLAVES,
  COLOR_ESCENARIO,
  NOMBRE_ESCENARIO,
  alertasEscenarios,
  calcularTodos,
  type Ajustes,
  type ClaveEscenario,
  type Escenarios,
  type ResultadoEscenario,
} from '@/lib/empresarial/escenarios'

interface Props {
  proyecto: { id: string; nombre: string; moneda: string | null }
  inicial: Escenarios
  yaGuardado: boolean
  copiadoDeFinanciero: boolean
}

/** Deja escribir un signo menos al inicio: un ajuste puede bajar la cifra. */
const CON_SIGNO = (v: string) => {
  const neg = v.trim().startsWith('-')
  const r = SOLO_DECIMAL(v.replace('-', '').slice(0, 6))
  return neg ? `-${r}` : r
}
const SOLO_ENTERO = (v: string) => v.replace(/\D/g, '').slice(0, 1)

const SEMAFORO: Record<ResultadoEscenario['semaforo'], { texto: string; punto: string; borde: string }> = {
  verde: { texto: 'Aguanta y vale la pena', punto: '#3F8A76', borde: 'border-[#3F8A76]/70' },
  amarillo: { texto: 'Aguanta, con cuidado', punto: '#B08D57', borde: 'border-ca-oro/70' },
  rojo: { texto: 'En riesgo', punto: '#B3261E', borde: 'border-ca-rojo/70' },
  sin_datos: { texto: 'Faltan cifras', punto: '#9A8A7A', borde: 'border-ca-oro/40' },
}

const FILAS_AJUSTE: { campo: keyof Ajustes; etiqueta: string; ayuda: string; signo: boolean; unidad: string }[] = [
  { campo: 'ventasPct', etiqueta: 'Ventas', ayuda: 'Cuánto más (+) o menos (−) vendes que en la cifra base.', signo: true, unidad: '%' },
  { campo: 'crecimientoPct', etiqueta: 'Crecimiento de ventas por mes', ayuda: 'Cuánto suben las ventas cada mes después de empezar. Puede ser 0.', signo: true, unidad: '%' },
  { campo: 'costoVenderPct', etiqueta: 'Costo de vender', ayuda: 'Cuánto más (+) o menos (−) te cuesta producir o entregar cada venta.', signo: true, unidad: '%' },
  { campo: 'fijosPct', etiqueta: 'Costos fijos', ayuda: 'Cuánto más (+) o menos (−) pagas de costos fijos.', signo: true, unidad: '%' },
  { campo: 'inversionPct', etiqueta: 'Inversión inicial', ayuda: 'Cuánto más (+) o menos (−) cuesta arrancar.', signo: true, unidad: '%' },
  { campo: 'mesesCobro', etiqueta: 'Meses que tardas en cobrar', ayuda: '0 = te pagan al contado. Máximo 3.', signo: false, unidad: 'meses' },
  { campo: 'mesesSinVentas', etiqueta: 'Meses antes de la primera venta', ayuda: 'Tiempo de preparación sin vender. Máximo 6.', signo: false, unidad: 'meses' },
]

/** Una línea por escenario con el saldo de caja mes a mes. Debajo de la línea punteada = falta plata. */
function LineasSaldo({ r }: { r: Record<ClaveEscenario, ResultadoEscenario> }) {
  const ancho = 640
  const alto = 220
  const mi = 52
  const todos = CLAVES.flatMap((k) => r[k].filas.map((f) => f.saldo))
  const hasta = Math.max(...todos, 0)
  const desde = Math.min(...todos, 0)
  const rango = Math.max(1, hasta - desde)
  const x = (i: number) => mi + (i * (ancho - mi - 12)) / 11
  const y = (s: number) => 12 + ((hasta - s) / rango) * alto
  const ceroY = y(0)
  return (
    <figure>
      <svg viewBox={`0 0 ${ancho} ${alto + 52}`} role="img" aria-label="Dinero en caja mes a mes en cada escenario" className="w-full">
        <line x1={mi} x2={ancho - 12} y1={ceroY} y2={ceroY} stroke="#54142B" strokeOpacity="0.55" strokeDasharray="5 4" />
        <text x={mi - 6} y={ceroY + 4} textAnchor="end" fontSize="11" fill="#54142B">
          0
        </text>
        <text x={mi - 6} y={y(hasta) + 4} textAnchor="end" fontSize="10" fill="#54142B">
          {compacto(hasta)}
        </text>
        {desde < 0 && (
          <text x={mi - 6} y={y(desde) + 4} textAnchor="end" fontSize="10" fill="#B3261E">
            {compacto(desde)}
          </text>
        )}
        {CLAVES.map((k) => (
          <g key={k}>
            <polyline
              fill="none"
              stroke={COLOR_ESCENARIO[k]}
              strokeWidth={k === 'normal' ? 3.5 : 2.5}
              strokeLinejoin="round"
              strokeDasharray={k === 'normal' ? undefined : k === 'pesimista' ? '2 5' : '9 5'}
              points={r[k].filas.map((f, i) => `${x(i)},${y(f.saldo)}`).join(' ')}
            />
            {r[k].filas.map((f, i) => (
              <circle key={i} cx={x(i)} cy={y(f.saldo)} r="3" fill={COLOR_ESCENARIO[k]} />
            ))}
          </g>
        ))}
        {r.normal.filas.map((f, i) => (
          <text key={i} x={x(i)} y={alto + 36} textAnchor="middle" fontSize="12" fill="#54142B">
            {f.mes}
          </text>
        ))}
      </svg>
      <figcaption className="mt-1 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-ca-vino/80">
        {CLAVES.map((k) => (
          <span key={k} className="inline-flex items-center gap-2">
            <span aria-hidden className="inline-block h-1 w-6 rounded" style={{ background: COLOR_ESCENARIO[k] }} />
            {NOMBRE_ESCENARIO[k]}
          </span>
        ))}
        <span>(número de mes abajo)</span>
      </figcaption>
    </figure>
  )
}

export function EscenariosClient({ proyecto, inicial, yaGuardado, copiadoDeFinanciero }: Props) {
  const [e, setE] = useState<Escenarios>(inicial)
  const [guardado, setGuardado] = useState(yaGuardado)
  const [sucio, setSucio] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const r = useMemo(() => calcularTodos(e), [e])
  const alertas = useMemo(() => alertasEscenarios(e, r), [e, r])
  const din = (n: number | null) => formatoDinero(n, proyecto.moneda)
  const pct = (n: number | null) => (n === null ? '—' : `${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(n)} %`)
  const mes = (n: number | null, vacio: string) => (n === null ? vacio : `Mes ${n}`)
  const hayDatos = r.normal.hayDatos

  const poner = (cambio: Partial<Escenarios>) => {
    setE((p) => ({ ...p, ...cambio }))
    setSucio(true)
  }
  const ponerAjuste = (k: ClaveEscenario, campo: keyof Ajustes, valor: string) => {
    setE((p) => ({ ...p, ajustes: { ...p.ajustes, [k]: { ...p.ajustes[k], [campo]: valor } } }))
    setSucio(true)
  }

  async function guardar() {
    setAviso(null)
    setGuardando(true)
    const supabase = createClient()
    const { error } = await supabase.from('sfpe_escenarios').upsert({ proyecto_id: proyecto.id, datos: e, actualizada_en: new Date().toISOString() }, { onConflict: 'proyecto_id' })
    setGuardando(false)
    if (error) return setAviso({ tipo: 'error', texto: 'No pudimos guardar el tablero. Intenta de nuevo.' })
    setGuardado(true)
    setSucio(false)
    setAviso({ tipo: 'ok', texto: 'Tablero guardado.' })
  }

  const campoBase = (id: string, etiqueta: string, ayuda: string, valor: string, clave: 'ventasMes' | 'variablesMes' | 'fijosMes' | 'inversion' | 'cajaInicial' | 'tasaPct') => (
    <div>
      <label className="block font-semibold" htmlFor={id}>
        {etiqueta}
      </label>
      <p className="text-xs text-ca-vino/75">{ayuda}</p>
      <input id={id} inputMode="decimal" value={valor} onChange={(ev) => poner({ [clave]: SOLO_DECIMAL(ev.target.value) })} className={CAMPO_ENTRADA} />
    </div>
  )

  const barrasVan = CLAVES.filter((k) => r[k].van !== null).map((k) => ({ etiqueta: NOMBRE_ESCENARIO[k], valor: r[k].van as number, destacada: k === 'normal' }))
  const barrasGanancia = CLAVES.map((k) => ({ etiqueta: NOMBRE_ESCENARIO[k], valor: r[k].gananciaAnio, destacada: k === 'normal' }))

  return (
    <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino">
      <div className="max-w-[1200px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <Link href={`/empresarial/camino?proyecto=${proyecto.id}`} className="inline-flex items-center gap-2 text-sm text-ca-vino/75 hover:text-ca-vino-hondo">
          <ArrowLeft className="h-4 w-4" /> Volver a mi camino
        </Link>
        <div className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-ca-oro-texto">Tablero de escenarios · {proyecto.nombre}</div>
        <h1 className="mt-3 text-3xl lg:text-4xl font-extrabold">¿Qué pasa si las cosas salen mejor o peor de lo esperado?</h1>
        <p className="mt-3 max-w-3xl text-ca-vino/80 leading-relaxed">
          Escribe tus cifras base una sola vez. El tablero las mueve en tres escenarios (pesimista, normal y optimista) y te muestra, mes a mes, si la plata te alcanza y si la inversión vale la pena. Son proyecciones con las mismas cuentas del flujo de caja y del VAN; las hace el sistema, sin inteligencia artificial.
        </p>

        {copiadoDeFinanciero && !guardado && (
          <div className="mt-6 rounded-2xl border border-ca-oro/60 bg-ca-fondo p-4 text-sm">
            <p className="font-semibold">Traímos tus cifras del Financiero básico.</p>
            <p className="mt-1 text-ca-vino/80">Revísalas. Hasta que guardes, nada queda registrado.</p>
          </div>
        )}

        <Seccion titulo="1. Tus cifras base" ayuda="Lo que esperas en un mes normal ya funcionando, con precios de hoy.">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {campoBase('es-ventas', 'Ventas por mes', 'Cuánto esperas vender en un mes normal.', e.ventasMes, 'ventasMes')}
            {campoBase('es-var', 'Costos por vender, por mes', 'Lo que cuesta producir o entregar esas ventas.', e.variablesMes, 'variablesMes')}
            {campoBase('es-fijos', 'Costos fijos por mes', 'Lo que pagas aunque no vendas (personal, arriendo, servicios).', e.fijosMes, 'fijosMes')}
            {campoBase('es-inv', 'Inversión inicial', 'Todo lo que se paga al comenzar (equipos, adecuaciones, trámites).', e.inversion, 'inversion')}
            {campoBase('es-caja', 'Dinero con el que arrancas', 'Lo que tienes en caja el día uno.', e.cajaInicial, 'cajaInicial')}
            {campoBase('es-tasa', 'Tasa de descuento anual (%)', 'La rentabilidad mínima que exiges. Sirve para el VAN.', e.tasaPct, 'tasaPct')}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block font-semibold" htmlFor="es-anios">
                Años para el VAN y la TIR (1 a 10)
              </label>
              <input
                id="es-anios"
                type="number"
                min={1}
                max={10}
                value={e.numAnios}
                onChange={(ev) => poner({ numAnios: Math.min(10, Math.max(1, Math.round(Number(ev.target.value) || 1))) })}
                className={CAMPO_ENTRADA}
              />
            </div>
            <div>
              <span className="block font-semibold">¿Qué tan seguras son estas cifras?</span>
              <SelectorCondicion valor={e.baseCondicion} onCambio={(c) => poner({ baseCondicion: c })} etiqueta="Cifras base" />
            </div>
          </div>
        </Seccion>

        <Seccion
          titulo="2. Qué cambia en cada escenario"
          ayuda="Cada columna dice cuánto se mueve cada cosa respecto a tu cifra base. Los valores que ves al empezar son un punto de partida (supuestos): cámbialos según tu negocio. Usa un signo menos para bajar."
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <caption className="sr-only">Cambios de cada escenario respecto a las cifras base</caption>
              <thead>
                <tr>
                  <th scope="col" className="pb-3 text-left font-semibold">
                    Qué cambia
                  </th>
                  {CLAVES.map((k) => (
                    <th key={k} scope="col" className="pb-3 text-center font-extrabold" style={{ color: k === 'normal' ? '#7A5B2C' : COLOR_ESCENARIO[k] }}>
                      {NOMBRE_ESCENARIO[k]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FILAS_AJUSTE.map((f) => (
                  <tr key={f.campo} className="border-t border-ca-oro/30">
                    <th scope="row" className="py-3 pr-4 text-left font-normal align-top">
                      <span className="font-semibold">{f.etiqueta}</span>
                      <span className="block text-xs text-ca-vino/75">{f.ayuda}</span>
                    </th>
                    {CLAVES.map((k) => (
                      <td key={k} className="px-2 py-3 align-top">
                        <div className="flex items-center gap-1">
                          <input
                            aria-label={`${f.etiqueta}, escenario ${NOMBRE_ESCENARIO[k].toLowerCase()}`}
                            inputMode={f.signo ? 'decimal' : 'numeric'}
                            value={e.ajustes[k][f.campo]}
                            onChange={(ev) => ponerAjuste(k, f.campo, f.signo ? CON_SIGNO(ev.target.value) : SOLO_ENTERO(ev.target.value))}
                            className={CAMPO_CELDA}
                          />
                          <span className="text-xs text-ca-vino/75">{f.unidad}</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <label className="block font-semibold" htmlFor="es-nota">
              Notas o fuentes de estas cifras (opcional)
            </label>
            <textarea id="es-nota" rows={3} value={e.nota} onChange={(ev) => poner({ nota: ev.target.value })} className={CAMPO_ENTRADA} />
          </div>
        </Seccion>

        <Seccion titulo="3. El tablero" ayuda="Se recalcula cada vez que cambias una cifra.">
          {!hayDatos ? (
            <p className="text-sm text-ca-vino/75">Escribe tus cifras base arriba para ver el tablero.</p>
          ) : (
            <>
              <div className="grid gap-4 lg:grid-cols-3">
                {CLAVES.map((k) => {
                  const x = r[k]
                  const s = SEMAFORO[x.semaforo]
                  return (
                    <article key={k} aria-label={`Escenario ${NOMBRE_ESCENARIO[k].toLowerCase()}`} className={`relative overflow-hidden rounded-2xl border-2 bg-gradient-to-b from-[#FBF7F0] to-[#EADBC6] p-5 ${s.borde} ${RELIEVE_TARJETA}`}>
                      <span aria-hidden className="absolute inset-x-0 top-0 h-1.5" style={{ background: COLOR_ESCENARIO[k] }} />
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-extrabold">{NOMBRE_ESCENARIO[k]}</h3>
                        <span className="inline-flex items-center gap-2 rounded-full bg-ca-tarjeta px-3 py-1 text-xs font-bold shadow-sm">
                          <span aria-hidden className="inline-block h-3 w-3 rounded-full" style={{ background: s.punto }} />
                          {s.texto}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-ca-vino/85">{x.lectura}</p>
                      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
                        <div>
                          <dt className="text-xs text-ca-vino/75">Ventas del año 1</dt>
                          <dd className="font-extrabold">{din(x.ventasAnio)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-ca-vino/75">Lo que deja el año 1</dt>
                          <dd className="font-extrabold" style={{ color: x.gananciaAnio < 0 ? '#B3261E' : undefined }}>
                            {din(x.gananciaAnio)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-ca-vino/75">Punto más bajo de la caja</dt>
                          <dd className="font-extrabold" style={{ color: x.saldoMinimo < 0 ? '#B3261E' : undefined }}>
                            {din(x.saldoMinimo)} <span className="font-normal text-xs">({mes(x.mesMinimo, '—')})</span>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-ca-vino/75">Dinero extra que haría falta</dt>
                          <dd className="font-extrabold">{x.necesidadMaxima > 0 ? din(x.necesidadMaxima) : 'Ninguno'}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-ca-vino/75">Ventas cubren todos los gastos</dt>
                          <dd className="font-extrabold">{mes(x.mesEquilibrio, 'No en 12 meses')}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-ca-vino/75">Se recupera la inversión</dt>
                          <dd className="font-extrabold">{x.inversion > 0 ? mes(x.mesRecuperacion, 'No en 12 meses') : '—'}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-ca-vino/75">VAN</dt>
                          <dd className="font-extrabold" style={{ color: x.van !== null && x.van < 0 ? '#B3261E' : undefined }}>
                            {din(x.van)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-ca-vino/75">TIR</dt>
                          <dd className="font-extrabold">{pct(x.tir)}</dd>
                        </div>
                      </dl>
                    </article>
                  )
                })}
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <MarcoGrafico titulo="Dinero en caja mes a mes">
                    <LineasSaldo r={r} />
                  </MarcoGrafico>
                </div>
                <div className="space-y-4">
                  <MarcoGrafico titulo="Lo que deja el año 1">
                    <BarrasH barras={barrasGanancia} formato={din} titulo="Lo que deja el primer año en cada escenario" />
                  </MarcoGrafico>
                  {barrasVan.length > 0 && (
                    <MarcoGrafico titulo="VAN: valor de hoy de la inversión">
                      <BarrasH barras={barrasVan} formato={din} titulo="VAN en cada escenario" />
                    </MarcoGrafico>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <caption className="mb-2 text-left text-xs text-ca-vino/75">Los mismos números del tablero, en tabla.</caption>
                  <thead>
                    <tr className="text-left">
                      <th scope="col" className="pb-2">
                        Mes
                      </th>
                      {CLAVES.map((k) => (
                        <th key={k} scope="col" className="pb-2 text-right" style={{ color: k === 'normal' ? '#7A5B2C' : COLOR_ESCENARIO[k] }}>
                          Caja · {NOMBRE_ESCENARIO[k]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {r.normal.filas.map((f, i) => (
                      <tr key={f.mes} className="border-t border-ca-oro/25">
                        <th scope="row" className="py-1.5 text-left font-normal">
                          {f.mes}
                        </th>
                        {CLAVES.map((k) => {
                          const s = r[k].filas[i].saldo
                          return (
                            <td key={k} className="py-1.5 text-right" style={{ color: s < 0 ? '#B3261E' : undefined }}>
                              {din(s)}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-ca-vino/75">
                Cómo se calcula: cada mes, ventas menos costos por vender menos costos fijos; la caja suma lo cobrado (con el retraso de cada escenario) y resta lo pagado, incluida la inversión en el mes 1. Para el VAN, el año 1 es lo de los 12 meses y los años siguientes repiten el ritmo de los últimos 3 meses.
              </p>
              <Alertas alertas={alertas} />
            </>
          )}
        </Seccion>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button type="button" onClick={guardar} disabled={guardando} className={BOTON_ORO}>
            {guardando ? 'Guardando…' : 'Guardar el tablero'}
          </button>
          {guardado && !sucio && (
            <Link href={`/empresarial/documento?proyecto=${proyecto.id}`} className={BOTON_SUAVE}>
              Volver al Documento final
            </Link>
          )}
          {sucio && !guardando && <span className="text-sm text-ca-oro-texto">Tienes cambios sin guardar.</span>}
        </div>
        {aviso && (
          <div role={aviso.tipo === 'error' ? 'alert' : 'status'} className={`mt-4 rounded-2xl border p-4 text-sm ${aviso.tipo === 'error' ? 'border-ca-rojo/60 bg-ca-rojo/10' : 'border-ca-oro/60 bg-ca-fondo'}`}>
            {aviso.texto}
          </div>
        )}
        <p className="mt-6 text-xs text-ca-vino/75">Esto es una guía básica para prepararte; no reemplaza a un contador ni garantiza resultados.</p>
      </div>
    </main>
  )
}
