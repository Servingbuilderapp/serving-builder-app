'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Alertas, BOTON_ORO, BOTON_SUAVE, CAMPO_ENTRADA, Cifra, SOLO_DECIMAL, SelectorCondicion, Seccion } from '@/components/empresarial/CalculadorasUI'
import { BarrasH } from '@/components/empresarial/Graficos'
import { formatoDinero } from '@/lib/empresarial/mercadoDemanda'
import { alertasCliente, calcularCliente, type CampoCliente, type CostoCliente } from '@/lib/empresarial/calculadoras'

interface Props {
  proyecto: { id: string; nombre: string; moneda: string | null }
  inicial: CostoCliente
  yaGuardado: boolean
  copiadoDeFinanciero: boolean
}

interface Campo {
  campo: CampoCliente
  titulo: string
  ayuda: string
}

const COSTO: Campo[] = [
  { campo: 'gastoComercial', titulo: 'Lo que gastaste en conseguir clientes en un periodo', ayuda: 'Publicidad, comisiones de venta, tiempo del vendedor, eventos. Usa el total de un mes o de un trimestre.' },
  { campo: 'clientesNuevos', titulo: 'Clientes nuevos que llegaron en ese mismo periodo', ayuda: 'Solo los que compraron por primera vez. Si aún no vendes, escribe tu meta y márcala como supuesto.' },
]
const VALOR: Campo[] = [
  { campo: 'precioCompra', titulo: 'Lo que paga un cliente en cada compra', ayuda: 'Precio promedio de una compra o de un mes de servicio.' },
  { campo: 'margenPct', titulo: 'De cada 100 que paga, cuánto te queda (en %)', ayuda: 'Después de restar lo que cuesta producir o entregar. Si no lo sabes, mira el margen en el Financiero básico.' },
  { campo: 'comprasAnio', titulo: 'Veces que compra un cliente en un año', ayuda: 'Un servicio mensual = 12. Una compra única = 1.' },
  { campo: 'aniosCliente', titulo: 'Años que un cliente sigue comprándote', ayuda: 'Puede llevar decimales (por ejemplo 1.5). Sé prudente: esta cifra es difícil de saber al inicio.' },
]

export function CostoClienteClient({ proyecto, inicial, yaGuardado, copiadoDeFinanciero }: Props) {
  const [c, setC] = useState<CostoCliente>(inicial)
  const [guardado, setGuardado] = useState(yaGuardado)
  const [sucio, setSucio] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const r = useMemo(() => calcularCliente(c), [c])
  const alertas = useMemo(() => alertasCliente(c, r), [c, r])
  const din = (n: number | null) => formatoDinero(n, proyecto.moneda)
  const dec = (n: number | null) => (n === null ? '—' : new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 }).format(n))

  const cambiar = (campo: CampoCliente, valor: string) => {
    setC((p) => ({ ...p, [campo]: SOLO_DECIMAL(valor) }))
    setSucio(true)
  }

  async function guardar() {
    setAviso(null)
    setGuardando(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('sfpe_calculadoras')
      .upsert({ proyecto_id: proyecto.id, tipo: 'costo_cliente', datos: c, actualizada_en: new Date().toISOString() }, { onConflict: 'proyecto_id,tipo' })
    setGuardando(false)
    if (error) return setAviso({ tipo: 'error', texto: 'No pudimos guardar el cálculo. Intenta de nuevo.' })
    setGuardado(true)
    setSucio(false)
    setAviso({ tipo: 'ok', texto: 'Cálculo guardado.' })
  }

  const campos = (lista: Campo[]) => (
    <div className="grid gap-5 sm:grid-cols-2">
      {lista.map((x) => (
        <div key={x.campo}>
          <label className="block font-semibold" htmlFor={`cc-${x.campo}`}>
            {x.titulo}
          </label>
          <p className="text-xs text-ca-vino/75">{x.ayuda}</p>
          <input id={`cc-${x.campo}`} inputMode="decimal" value={c[x.campo]} onChange={(e) => cambiar(x.campo, e.target.value)} className={CAMPO_ENTRADA} />
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
        <div className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-ca-oro-texto">Costo por cliente · {proyecto.nombre}</div>
        <h1 className="mt-3 text-3xl lg:text-4xl font-extrabold">¿Cada cliente deja más de lo que cuesta conseguirlo?</h1>
        <p className="mt-3 text-ca-vino/80 leading-relaxed">
          Compara dos cosas: cuánto gastas para que llegue un cliente nuevo y cuánto te deja ese cliente mientras te siga comprando. Las cuentas las hace el sistema con lo que escribes.
        </p>

        {copiadoDeFinanciero && !guardado && (
          <div className="mt-6 rounded-2xl border border-ca-oro/60 bg-ca-fondo p-4 text-sm">
            <p className="font-semibold">Traímos tu margen del Financiero básico, si estaba disponible.</p>
            <p className="mt-1 text-ca-vino/80">Revísalo. Hasta que guardes, nada queda registrado.</p>
          </div>
        )}

        <Seccion titulo="1. Lo que cuesta conseguir un cliente" ayuda="Todo lo que gastas para que alguien nuevo te compre.">
          {campos(COSTO)}
        </Seccion>
        <Seccion titulo="2. Lo que deja ese cliente" ayuda="Cuánto te queda por cada compra y cuánto tiempo se queda.">
          {campos(VALOR)}
          <div>
            <label className="block font-semibold" htmlFor="cc-nota">
              Notas o fuentes de estas cifras (opcional)
            </label>
            <textarea
              id="cc-nota"
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

        <Seccion titulo="3. El resultado" ayuda="Se recalcula cada vez que cambias una cifra.">
          {!r.hayDatos ? (
            <p className="text-sm text-ca-vino/75">Escribe cifras arriba para ver el resultado.</p>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Cifra etiqueta="Cuesta conseguir un cliente" valor={din(r.cac)} />
                <Cifra etiqueta="Un cliente te deja en total" valor={din(r.valorCliente)} />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Cifra fuerte etiqueta="Veces que recuperas lo gastado" valor={r.relacion === null ? '—' : `${dec(r.relacion)} veces`} />
                <Cifra etiqueta="Compras para recuperarlo" valor={dec(r.comprasParaRecuperar)} />
                <Cifra etiqueta="Meses para recuperarlo" valor={dec(r.mesesParaRecuperar)} />
              </div>
              {r.cac !== null && r.valorCliente !== null && (
                <BarrasH
                  titulo="Lo que cuesta vs lo que deja"
                  formato={(n) => din(n)}
                  barras={[
                    { etiqueta: 'Costo de conseguirlo', valor: r.cac },
                    { etiqueta: 'Lo que deja en total', valor: r.valorCliente },
                  ]}
                />
              )}
              <p className="text-xs text-ca-vino/75">
                Cómo se calcula: costo de conseguir un cliente = gasto ÷ clientes nuevos. Lo que deja = precio por compra × margen × compras al año × años. Veces recuperadas = lo que deja ÷ lo que cuesta.
              </p>
              <Alertas alertas={alertas} />
            </>
          )}
        </Seccion>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button type="button" onClick={guardar} disabled={guardando} className={BOTON_ORO}>
            {guardando ? 'Guardando…' : 'Guardar este cálculo'}
          </button>
          {guardado && !sucio && (
            <Link href={`/empresarial/calculadoras/van-tir?proyecto=${proyecto.id}`} className={BOTON_SUAVE}>
              Seguir: VAN y TIR
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
