'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Alertas, BOTON_ORO, BOTON_SUAVE, CAMPO_ENTRADA, Cifra, SOLO_DECIMAL, SelectorCondicion, Seccion } from '@/components/empresarial/CalculadorasUI'
import { BarrasH } from '@/components/empresarial/Graficos'
import { formatoDinero } from '@/lib/empresarial/mercadoDemanda'
import { alertasCapital, calcularCapital, type CampoCapital, type CapitalTrabajo } from '@/lib/empresarial/calculadoras'

interface Props {
  proyecto: { id: string; nombre: string; moneda: string | null }
  inicial: CapitalTrabajo
  yaGuardado: boolean
  copiadoDeFinanciero: boolean
}

interface Campo {
  campo: CampoCapital
  titulo: string
  ayuda: string
  unidad: string
}

const GASTOS: Campo[] = [
  { campo: 'fijosMes', titulo: 'Costos fijos por mes', ayuda: 'Lo que pagas cada mes venda o no venda: personal, arriendo, internet.', unidad: 'dinero' },
  { campo: 'variablesMes', titulo: 'Costos por vender, por mes', ayuda: 'Insumos, empaque, comisiones en un mes normal de ventas.', unidad: 'dinero' },
]
const PLAZOS: Campo[] = [
  { campo: 'diasInventario', titulo: 'Días que guardas mercancía o materiales antes de vender', ayuda: 'Si prestas un servicio sin inventario, déjalo en 0.', unidad: 'días' },
  { campo: 'diasCobro', titulo: 'Días que tardan tus clientes en pagarte', ayuda: '0 si cobras al contado.', unidad: 'días' },
  { campo: 'diasPago', titulo: 'Días que te dan tus proveedores para pagarles', ayuda: '0 si pagas al comprar. Solo cuenta si el plazo ya está acordado.', unidad: 'días' },
]
const ARRANQUE: Campo[] = [
  { campo: 'mesesSinVentas', titulo: 'Meses que pasarán antes de la primera venta', ayuda: 'Tiempo de montaje, trámites, producción o primeras pruebas.', unidad: 'meses' },
  { campo: 'mesesReserva', titulo: 'Meses de gastos que quieres tener de reserva (opcional)', ayuda: 'Un colchón para imprevistos.', unidad: 'meses' },
]

export function CapitalTrabajoClient({ proyecto, inicial, yaGuardado, copiadoDeFinanciero }: Props) {
  const [c, setC] = useState<CapitalTrabajo>(inicial)
  const [guardado, setGuardado] = useState(yaGuardado)
  const [sucio, setSucio] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const r = useMemo(() => calcularCapital(c), [c])
  const alertas = useMemo(() => alertasCapital(c, r), [c, r])
  const din = (n: number | null) => formatoDinero(n, proyecto.moneda)

  const cambiar = (campo: CampoCapital, valor: string) => {
    setC((p) => ({ ...p, [campo]: SOLO_DECIMAL(valor) }))
    setSucio(true)
  }

  async function guardar() {
    setAviso(null)
    setGuardando(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('sfpe_calculadoras')
      .upsert({ proyecto_id: proyecto.id, tipo: 'capital_trabajo', datos: c, actualizada_en: new Date().toISOString() }, { onConflict: 'proyecto_id,tipo' })
    setGuardando(false)
    if (error) return setAviso({ tipo: 'error', texto: 'No pudimos guardar el capital de trabajo. Intenta de nuevo.' })
    setGuardado(true)
    setSucio(false)
    setAviso({ tipo: 'ok', texto: 'Capital de trabajo guardado.' })
  }

  const campos = (lista: Campo[]) => (
    <div className="grid gap-5 sm:grid-cols-2">
      {lista.map((x) => (
        <div key={x.campo}>
          <label className="block font-semibold" htmlFor={`ct-${x.campo}`}>
            {x.titulo}
          </label>
          <p className="text-xs text-ca-vino/75">{x.ayuda}</p>
          <input id={`ct-${x.campo}`} inputMode="decimal" value={c[x.campo]} onChange={(e) => cambiar(x.campo, e.target.value)} className={CAMPO_ENTRADA} />
          <SelectorCondicion
            valor={c.condiciones[x.campo]}
            onCambio={(v) => {
              setC((p) => ({ ...p, condiciones: { ...p.condiciones, [x.campo]: v } }))
              setSucio(true)
            }}
            etiqueta={x.titulo}
          />
        </div>
      ))}
    </div>
  )

  return (
    <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino">
      <div className="max-w-[900px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <Link href={`/empresarial/camino?proyecto=${proyecto.id}`} className="inline-flex items-center gap-2 text-sm text-ca-vino/75 hover:text-ca-vino-hondo">
          <ArrowLeft className="h-4 w-4" /> Volver a mi camino
        </Link>
        <div className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-ca-oro-texto">Capital de trabajo · {proyecto.nombre}</div>
        <h1 className="mt-3 text-3xl lg:text-4xl font-extrabold">¿Cuánta plata necesitas antes de vender?</h1>
        <p className="mt-3 text-ca-vino/80 leading-relaxed">
          Es el dinero que debe haber en caja para pagar el día a día mientras todavía no te pagan: desde que compras o produces hasta que
          cobras. Es distinto de la inversión inicial (equipos y adecuaciones). Las cuentas las hace el sistema con lo que escribes.
        </p>

        {copiadoDeFinanciero && !guardado && (
          <div className="mt-6 rounded-2xl border border-ca-oro/60 bg-ca-fondo p-4 text-sm">
            <p className="font-semibold">Traímos tus costos del Financiero básico.</p>
            <p className="mt-1 text-ca-vino/80">Revísalos. Hasta que guardes, nada queda registrado.</p>
          </div>
        )}

        <Seccion titulo="1. Tus gastos de cada mes" ayuda="Para saber cuánto cuesta mantener el negocio andando.">
          {campos(GASTOS)}
        </Seccion>
        <Seccion titulo="2. Los plazos" ayuda="Cuánto tiempo pasa entre que pagas y que te pagan.">
          {campos(PLAZOS)}
        </Seccion>
        <Seccion titulo="3. Arranque y reserva" ayuda="Gastos que tendrás antes de que las ventas te sostengan.">
          {campos(ARRANQUE)}
          <div>
            <label className="block font-semibold" htmlFor="ct-nota">
              Notas o fuentes de estas cifras (opcional)
            </label>
            <textarea
              id="ct-nota"
              rows={3}
              value={c.nota}
              onChange={(e) => {
                setC((p) => ({ ...p, nota: e.target.value }))
                setSucio(true)
              }}
              className={CAMPO_ENTRADA}
            />
          </div>
        </Seccion>

        <Seccion titulo="4. Cuánta plata necesitas" ayuda="Se recalcula cada vez que cambias una cifra.">
          {!r.hayDatos ? (
            <p className="text-sm text-ca-vino/75">Escribe cifras arriba para ver el resultado.</p>
          ) : (
            <>
              <Cifra fuerte etiqueta="Capital de trabajo necesario" valor={din(r.total)} />
              <div className="grid gap-3 sm:grid-cols-3">
                <Cifra etiqueta={`Cubrir el ciclo (${Math.round(r.cicloDias)} días)`} valor={din(r.necesidadCiclo)} />
                <Cifra etiqueta="Gastos antes de la primera venta" valor={din(r.necesidadAntesDeVender)} />
                <Cifra etiqueta="Reserva" valor={din(r.reserva)} />
              </div>
              <BarrasH
                titulo="De dónde sale el capital de trabajo"
                formato={(n) => din(n)}
                barras={[
                  { etiqueta: 'Cubrir el ciclo', valor: r.necesidadCiclo },
                  { etiqueta: 'Antes de la primera venta', valor: r.necesidadAntesDeVender },
                  { etiqueta: 'Reserva', valor: r.reserva },
                ]}
              />
              <p className="text-xs text-ca-vino/75">
                Cómo se calcula: (costos fijos + costos por vender) ÷ 30 × (días de inventario + días de cobro − días de pago) + costos fijos × meses sin ventas + gastos del mes × meses de reserva.
              </p>
              <Alertas alertas={alertas} />
            </>
          )}
        </Seccion>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button type="button" onClick={guardar} disabled={guardando} className={BOTON_ORO}>
            {guardando ? 'Guardando…' : 'Guardar capital de trabajo'}
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
