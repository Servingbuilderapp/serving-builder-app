'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Embudo } from '@/components/empresarial/Graficos'
import { CONDICIONES, type Condicion } from '@/lib/empresarial/formulacion'
import { COBERTURAS, etiquetaDe } from '@/lib/empresarial/mercado'
import {
  CAMPOS_DEMANDA,
  alertasMercado,
  calcularMercado,
  formatoDinero,
  formatoNumero,
  num,
  revisarMercadoDemanda,
  type Cifra,
  type CampoDemanda,
  type Tamano,
} from '@/lib/empresarial/mercadoDemanda'

const RELIEVE_BOTON =
  'shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200'
const RELIEVE_TARJETA = 'shadow-[0_1px_2px_rgba(84,20,43,0.06),0_10px_28px_-14px_rgba(84,20,43,0.22)]'
const CAMPO_ENTRADA =
  'mt-2 w-full rounded-xl border border-ca-oro/40 bg-ca-fondo px-4 py-3 text-ca-vino placeholder:text-ca-vino/65 focus:outline-none focus:ring-2 focus:ring-ca-oro-claro'

interface Props {
  proyecto: { id: string; nombre: string; moneda: string | null }
  inicial: Tamano
  yaGuardado: boolean
  referencia: { producto: string; cobertura: string; ubicacion: string; segmentos: string[] }
}

function SelectorCondicion({ valor, onCambio, etiqueta }: { valor: Condicion; onCambio: (c: Condicion) => void; etiqueta: string }) {
  return (
    <label className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ca-vino/75">
      <span>¿Qué tan seguro es este dato?</span>
      <select
        aria-label={`Condición del dato: ${etiqueta}`}
        value={valor}
        onChange={(e) => onCambio(e.target.value as Condicion)}
        className="h-9 rounded-lg border border-ca-oro/50 bg-ca-tarjeta px-2 text-ca-vino"
      >
        {CONDICIONES.map((c) => (
          <option key={c.valor} value={c.valor}>
            {c.etiqueta}
          </option>
        ))}
      </select>
      <span className="text-ca-vino/75">{CONDICIONES.find((c) => c.valor === valor)?.ayuda}</span>
    </label>
  )
}

function Seccion({ titulo, ayuda, children }: { titulo: string; ayuda: string; children: React.ReactNode }) {
  return (
    <section className={`mt-6 rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-5 lg:p-6 ${RELIEVE_TARJETA}`}>
      <h2 className="text-xl font-extrabold">{titulo}</h2>
      <p className="mt-1 text-sm text-ca-vino/75">{ayuda}</p>
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  )
}

const SOLO_NUMERO = (v: string) => v.replace(/\D/g, '').slice(0, 15)
const SOLO_DECIMAL = (v: string) => {
  const limpio = v.replace(/[^\d.]/g, '')
  const [entero, ...resto] = limpio.split('.')
  return (entero.slice(0, 13) + (resto.length ? '.' + resto.join('').slice(0, 2) : '')).replace(/^\./, '0.')
}

const COLOR_ALERTA: Record<string, string> = {
  Crítica: 'border-ca-rojo/70 bg-ca-rojo/10',
  Importante: 'border-ca-oro/70 bg-ca-fondo',
  Preventiva: 'border-ca-oro/50 bg-ca-fondo',
  Informativa: 'border-ca-oro/45 bg-ca-fondo',
}

export function DemandaClient({ proyecto, inicial, yaGuardado, referencia }: Props) {
  const [tm, setTm] = useState<Tamano>(inicial)
  const [guardado, setGuardado] = useState(yaGuardado)
  const [sucio, setSucio] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const botonOro = `h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-ca-oro-claro to-ca-oro text-ca-vino-hondo font-extrabold disabled:opacity-50 disabled:cursor-not-allowed ${RELIEVE_BOTON}`
  const botonSuave = `h-11 px-4 inline-flex items-center justify-center gap-2 rounded-xl border border-ca-oro/50 bg-ca-tarjeta text-ca-vino font-semibold ${RELIEVE_BOTON}`

  const dinero = useMemo(() => calcularMercado(tm), [tm])
  const alertas = useMemo(() => alertasMercado(tm), [tm])
  const revision = useMemo(() => revisarMercadoDemanda(tm), [tm])
  const faltan = revision.filter((r) => r.obligatorio && !r.cumple)
  const faltanRec = revision.filter((r) => !r.obligatorio && !r.cumple)

  function cambiarCifra(c: Cifra, cambios: Partial<Tamano['cifras'][Cifra]>) {
    setTm((p) => ({ ...p, cifras: { ...p.cifras, [c]: { ...p.cifras[c], ...cambios } } }))
    setSucio(true)
  }
  function cambiarTexto(campo: CampoDemanda, valor: string) {
    setTm((p) => ({ ...p, [campo]: valor }))
    setSucio(true)
  }
  function cambiarCondicion(campo: CampoDemanda, c: Condicion) {
    setTm((p) => ({ ...p, condiciones: { ...p.condiciones, [campo]: c } }))
    setSucio(true)
  }

  async function guardar() {
    setAviso(null)
    setGuardando(true)
    const supabase = createClient()
    const fila: Record<string, unknown> = {
      proyecto_id: proyecto.id,
      capacidad_clientes: num(tm.capacidad_clientes),
      frecuencia_compra: tm.frecuencia_compra.trim() || null,
      estacionalidad: tm.estacionalidad.trim() || null,
      intencion_compra: tm.intencion_compra.trim() || null,
      demanda_insatisfecha: tm.demanda_insatisfecha.trim() || null,
      condiciones: tm.condiciones,
      actualizada_en: new Date().toISOString(),
    }
    for (const c of ['gasto', 'tam', 'sam', 'som'] as Cifra[]) {
      fila[`${c}_valor`] = num(tm.cifras[c].valor)
      fila[`${c}_fuente`] = tm.cifras[c].fuente.trim() || null
      fila[`${c}_condicion`] = tm.cifras[c].condicion
    }
    const { error } = await supabase.from('sfpe_mercado_tamano').upsert(fila, { onConflict: 'proyecto_id' })
    setGuardando(false)
    if (error) return setAviso({ tipo: 'error', texto: 'No pudimos guardar. Intenta de nuevo.' })
    setGuardado(true)
    setSucio(false)
    setAviso({ tipo: 'ok', texto: 'Demanda y tamaño guardados.' })
  }

  const campoCifra = (c: Cifra, titulo: string, ayuda: string, unidad: string, ejemplo: string) => {
    const d = tm.cifras[c]
    const resultado = c === 'gasto' ? null : dinero[c]
    return (
      <div className="rounded-xl bg-ca-fondo p-4">
        <h3 className="font-extrabold">{titulo}</h3>
        <p className="text-xs text-ca-vino/75">{ayuda}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold" htmlFor={`c-${c}`}>
              {unidad}
            </label>
            <input
              id={`c-${c}`}
              inputMode={c === 'gasto' ? 'decimal' : 'numeric'}
              value={d.valor}
              onChange={(e) => cambiarCifra(c, { valor: c === 'gasto' ? SOLO_DECIMAL(e.target.value) : SOLO_NUMERO(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-ca-oro/40 bg-ca-tarjeta px-3 py-2 text-ca-vino focus:outline-none focus:ring-2 focus:ring-ca-oro-claro"
            />
          </div>
          {resultado !== null && (
            <div className="rounded-lg border border-dashed border-ca-oro/60 p-3 text-sm">
              <div className="text-xs text-ca-vino/75">Equivale a, por año</div>
              <div className="text-lg font-extrabold text-ca-oro-texto">{formatoDinero(resultado, proyecto.moneda)}</div>
            </div>
          )}
        </div>
        <label className="mt-3 block text-sm font-semibold" htmlFor={`f-${c}`}>
          ¿De dónde sale y cómo lo calculaste?
        </label>
        <textarea
          id={`f-${c}`}
          rows={3}
          value={d.fuente}
          placeholder={ejemplo}
          onChange={(e) => cambiarCifra(c, { fuente: e.target.value })}
          className="mt-1 w-full rounded-lg border border-ca-oro/40 bg-ca-tarjeta px-3 py-2 text-ca-vino placeholder:text-ca-vino/65 focus:outline-none focus:ring-2 focus:ring-ca-oro-claro"
        />
        <SelectorCondicion valor={d.condicion} onCambio={(x) => cambiarCifra(c, { condicion: x })} etiqueta={titulo} />
      </div>
    )
  }

  const campoLargo = (campo: CampoDemanda, etiqueta: string, ayuda: string, filas = 3) => (
    <div>
      <label className="block font-semibold" htmlFor={`d-${campo}`}>
        {etiqueta}
      </label>
      <p className="text-xs text-ca-vino/75">{ayuda}</p>
      <textarea id={`d-${campo}`} rows={filas} value={tm[campo]} onChange={(e) => cambiarTexto(campo, e.target.value)} className={CAMPO_ENTRADA} />
      <SelectorCondicion valor={tm.condiciones[campo] ?? 'aportado'} onCambio={(c) => cambiarCondicion(campo, c)} etiqueta={etiqueta} />
    </div>
  )
  void CAMPOS_DEMANDA

  return (
    <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino">
      <div className="max-w-[900px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <Link href={`/empresarial/mercado?proyecto=${proyecto.id}`} className="inline-flex items-center gap-2 text-sm text-ca-vino/75 hover:text-ca-vino-hondo">
          <ArrowLeft className="h-4 w-4" /> Volver a clientes y territorio
        </Link>

        <div className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-ca-oro-texto">Estudio de mercado · {proyecto.nombre}</div>
        <h1 className="mt-3 text-3xl lg:text-4xl font-extrabold">¿Cuánta gente lo necesita y cuánto vale?</h1>
        <p className="mt-3 text-ca-vino/80 leading-relaxed">
          Aquí calculas el tamaño de tu mercado en tres niveles, de lo más grande a lo más realista. Cada cifra pide su fuente: no se
          acepta un número sin decir de dónde sale. Todavía no es una proyección de ventas; esa viene después.
        </p>

        {(referencia.producto || referencia.segmentos.length > 0 || referencia.cobertura) && (
          <section className={`mt-6 rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-5 ${RELIEVE_TARJETA}`}>
            <h2 className="text-lg font-extrabold">Lo que ya definiste en la pantalla anterior</h2>
            <p className="mt-1 text-sm text-ca-vino/75">Solo lectura. Tus cifras deben hablar de estos clientes y de este territorio.</p>
            <ul className="mt-3 space-y-2 text-sm">
              {referencia.producto && <li className="rounded-xl bg-ca-fondo p-3">Ofreces: {referencia.producto}</li>}
              {referencia.cobertura && (
                <li className="rounded-xl bg-ca-fondo p-3">
                  Cobertura: {etiquetaDe(COBERTURAS, referencia.cobertura)}
                  {referencia.ubicacion ? ` · ${referencia.ubicacion}` : ''}
                </li>
              )}
              {referencia.segmentos.length > 0 && <li className="rounded-xl bg-ca-fondo p-3">Clientes: {referencia.segmentos.join('; ')}</li>}
            </ul>
          </section>
        )}

        <Seccion titulo="1. Cuánto gasta un cliente al año" ayuda="Lo que un cliente típico te pagaría en un año. Es la base para pasar de clientes a dinero.">
          {campoCifra('gasto', 'Gasto anual por cliente', `En ${proyecto.moneda ?? 'tu moneda'}. Si compra varias veces, suma el año completo.`, 'Valor por cliente al año', 'Ejemplo: precio de 15.000 × 2 compras al mes × 12 meses; precio visto en 3 competidores.')}
        </Seccion>

        <Seccion
          titulo="2. Cuántos clientes: de lo más grande a lo más realista"
          ayuda="Cuenta clientes por año, siempre en la misma unidad. Cada nivel es parte del anterior. Si tu cobertura es local, no uses un dato de todo el país sin acotarlo a tu zona."
        >
          {campoCifra('tam', 'TAM · mercado total', 'Todos los clientes que podrían necesitar lo que ofreces, sin importar si los puedes atender.', 'Cantidad de clientes', 'Ejemplo: 12.400 empresas del sector según el registro oficial, consultado en octubre de 2026.')}
          {campoCifra('sam', 'SAM · el que puedes atender', 'La parte del TAM que sí puedes servir por tu territorio, producto y forma de trabajar.', 'Cantidad de clientes', 'Ejemplo: de las 12.400, las 1.800 que están en Medellín y tienen entre 10 y 50 empleados.')}
          {campoCifra('som', 'SOM · el que puedes captar', 'Cuántos clientes puedes conseguir de verdad en un año. No es un porcentaje cualquiera: explica qué lo hace posible.', 'Cantidad de clientes', 'Ejemplo: 2 vendedores pueden visitar 30 empresas al mes; con 15 % de cierre logran 54 clientes al año.')}
        </Seccion>

        <Seccion titulo="3. Cuántos clientes puedes atender" ayuda="El límite real de tu equipo, tiempo o producción. Tu SOM no puede pasar de aquí.">
          <div>
            <label className="block font-semibold" htmlFor="m-cap">
              Clientes que puedes atender al año
            </label>
            <input
              id="m-cap"
              inputMode="numeric"
              value={tm.capacidad_clientes}
              onChange={(e) => {
                setTm((p) => ({ ...p, capacidad_clientes: SOLO_NUMERO(e.target.value) }))
                setSucio(true)
              }}
              className={CAMPO_ENTRADA}
            />
          </div>
        </Seccion>

        <Seccion titulo="4. Cómo compra la gente" ayuda="Detalles que hacen creíble tu demanda.">
          {campoLargo('frecuencia_compra', 'Cada cuánto compra un cliente', 'Y cuánto compra cada vez.')}
          {campoLargo('estacionalidad', 'Épocas de más o menos compra', 'Meses fuertes y flojos, si los hay.')}
          {campoLargo('intencion_compra', 'Qué muestra que alguien compraría', 'Pedidos, preventas, entrevistas, cartas de interés. Una encuesta de interés no es lo mismo que ventas reales.', 4)}
          {campoLargo('demanda_insatisfecha', 'Qué parte de la necesidad hoy nadie la atiende bien', 'La brecha que tu proyecto puede ocupar.', 4)}
        </Seccion>

        <section className={`mt-6 rounded-2xl border border-ca-oro/60 bg-ca-fondo p-5 ${RELIEVE_TARJETA}`}>
          <h2 className="text-xl font-extrabold">Resumen de tu mercado, por año</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {(['tam', 'sam', 'som'] as const).map((c) => (
              <div key={c} className="rounded-xl bg-ca-tarjeta p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-ca-oro-texto">{c.toUpperCase()}</div>
                <div className="mt-1 text-lg font-extrabold">{formatoDinero(dinero[c], proyecto.moneda)}</div>
                <div className="text-xs text-ca-vino/75">{formatoNumero(num(tm.cifras[c].valor))} clientes</div>
              </div>
            ))}
          </div>
          {(['tam', 'sam', 'som'] as const).every((c) => dinero[c] !== null) && (
            <Embudo
              titulo="Embudo de tu mercado: del mercado total a lo que puedes captar"
              etapas={[
                { etiqueta: 'TAM · mercado total', valor: formatoDinero(dinero.tam, proyecto.moneda), detalle: `${formatoNumero(num(tm.cifras.tam.valor))} clientes` },
                { etiqueta: 'SAM · el que puedes atender', valor: formatoDinero(dinero.sam, proyecto.moneda), detalle: `${formatoNumero(num(tm.cifras.sam.valor))} clientes` },
                { etiqueta: 'SOM · lo que puedes captar', valor: formatoDinero(dinero.som, proyecto.moneda), detalle: `${formatoNumero(num(tm.cifras.som.valor))} clientes` },
              ]}
            />
          )}
          <p className="mt-3 text-xs text-ca-vino/75">Son cuentas con tus propias cifras: clientes × gasto anual. Valen lo que valgan tus fuentes.</p>
        </section>

        {alertas.length > 0 && (
          <section className="mt-6 space-y-3" aria-label="Alertas">
            {alertas.map((a, i) => (
              <div key={i} role={a.nivel === 'Crítica' ? 'alert' : 'note'} className={`rounded-2xl border p-4 text-sm ${COLOR_ALERTA[a.nivel]}`}>
                <span className="mr-2 text-xs font-bold uppercase tracking-wider text-ca-oro-texto">{a.nivel}</span>
                {a.texto}
              </div>
            ))}
          </section>
        )}

        <section className={`mt-6 rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-5 ${RELIEVE_TARJETA}`}>
          <h2 className="text-xl font-extrabold">Revisión</h2>
          <p className="mt-1 text-sm text-ca-vino/75">
            {faltan.length === 0
              ? 'Tienes lo necesario para seguir. Los recomendados puedes completarlos después.'
              : `Falta${faltan.length === 1 ? '' : 'n'} ${faltan.length} ${faltan.length === 1 ? 'parte necesaria' : 'partes necesarias'}.`}
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {revision.map((r) => (
              <li key={r.clave} className="flex items-start gap-3 rounded-xl bg-ca-fondo px-4 py-3">
                <span
                  aria-hidden
                  className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                    r.cumple ? 'bg-ca-oro-claro text-ca-vino-hondo' : 'border border-ca-oro/60 text-ca-vino/75'
                  }`}
                >
                  {r.cumple ? '✓' : '·'}
                </span>
                <span>
                  <span className="block">
                    {r.texto} <span className="text-xs text-ca-vino/75">({r.obligatorio ? 'necesario' : 'recomendado'})</span>
                  </span>
                  {!r.cumple && <span className="block text-xs text-ca-vino/75">{r.ayuda}</span>}
                </span>
              </li>
            ))}
          </ul>
          {faltanRec.length > 0 && faltan.length === 0 && <p className="mt-3 text-xs text-ca-vino/75">Quedan {faltanRec.length} detalles recomendados.</p>}
        </section>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button type="button" onClick={guardar} disabled={guardando} className={botonOro}>
            {guardando ? 'Guardando…' : 'Guardar demanda y tamaño'}
          </button>
          {guardado && !sucio && (
            <Link href={`/empresarial/mercado/competencia?proyecto=${proyecto.id}`} className={botonSuave}>
              Seguir: competencia y precios
            </Link>
          )}
          {sucio && !guardando && <span className="text-sm text-ca-oro-texto">Tienes cambios sin guardar.</span>}
        </div>
        {aviso && (
          <div
            role={aviso.tipo === 'error' ? 'alert' : 'status'}
            className={`mt-4 rounded-2xl border p-4 text-sm ${aviso.tipo === 'error' ? 'border-ca-rojo/60 bg-ca-rojo/10' : 'border-ca-oro/60 bg-ca-fondo'}`}
          >
            {aviso.texto}
          </div>
        )}
        <p className="mt-6 text-xs text-ca-vino/75">
          Esto es una guía para ordenar tus cifras; no garantiza ventas ni resultados. La competencia, los precios y la proyección de ventas se trabajan en las siguientes pantallas.
        </p>
      </div>
    </main>
  )
}
