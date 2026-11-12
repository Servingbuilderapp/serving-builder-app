import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ResumenVisual } from '@/components/empresarial/ResumenVisual'
import { BotonImprimir } from '@/components/empresarial/BotonImprimir'
import { etiquetaCondicion } from '@/lib/empresarial/formulacion'
import { COBERTURAS, ETAPAS_MERCADO, NATURALEZAS, TIPOS_COMPRADOR, etiquetaDe } from '@/lib/empresarial/mercado'
import { ESTADOS_SOLUCION, TIPOS_SOLUCION, formatoMinutos, tiempoTotalMin } from '@/lib/empresarial/tecnico'
import { PREGUNTAS, conteoPorRegion, lectura as lecturaIkigai, mascara, nombreRegion, type ItemIkigai } from '@/lib/empresarial/ikigai'
import { GUIAS, CRUCES, calcularBalance, lecturaPosicion, type ItemDofa } from '@/lib/empresarial/dofa'
import { formatoDinero, formatoNumero, num } from '@/lib/empresarial/mercadoDemanda'
import { calcular, formatoMeses, financieroVacio, type ItemFinanciero, type TipoItem } from '@/lib/empresarial/financiero'
import { FACTORES as FACTORES_ENTORNO, calcularRadar as radarEntorno, lecturaRadar as lecturaEntorno, type ItemEntorno } from '@/lib/empresarial/entorno'
import { FACTORES as FACTORES_PRESION, calcularRadar as radarPresiones, lecturaRadar as lecturaPresiones, type ItemPresion } from '@/lib/empresarial/presiones'
import { RadarEntorno } from '@/components/empresarial/Graficos'
import { MapaCalor } from '@/components/empresarial/RiesgosClient'
import { BLOQUES, lecturaLienzo, type ItemLienzo } from '@/lib/empresarial/lienzo'
import {
  COLOR_NIVEL,
  contarPorNivel,
  etiquetaRespuesta,
  lecturaRiesgos,
  ordenarRiesgos,
  tituloCategoria,
  type ItemRiesgo,
} from '@/lib/empresarial/riesgos'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Documento final | Serving',
}

const s = (x: unknown) => (x === null || x === undefined ? '' : String(x).trim())

const mensaje = (titulo: string, texto: string) => (
  <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino flex items-center justify-center px-5">
    <div className="max-w-md text-center">
      <h1 className="text-2xl font-extrabold">{titulo}</h1>
      <p className="mt-3 text-ca-vino/80">{texto}</p>
      <Link href="/empresarial" className="mt-6 inline-block underline">
        Volver
      </Link>
    </div>
  </main>
)

type Fila = { dato: string; valor: string; cond?: string }

function Bloque({ titulo, href, vacio, children }: { titulo: string; href: string; vacio: boolean; children?: React.ReactNode }) {
  return (
    <section className="mt-8 break-inside-avoid-page">
      <h2 className="border-b-2 border-ca-oro pb-1 text-xl font-extrabold text-ca-vino">{titulo}</h2>
      {vacio ? (
        <p className="mt-3 text-sm text-[#6B5A4F]">
          Esta parte todavía no está completa.{' '}
          <Link href={href} className="font-semibold underline print:hidden">
            Completarla
          </Link>
        </p>
      ) : (
        <div className="mt-3 space-y-3 text-[15px] leading-relaxed">{children}</div>
      )}
    </section>
  )
}

function Texto({ t, v, cond }: { t: string; v: string; cond?: string }) {
  if (!v) return null
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wider text-ca-oro-texto">
        {t}
        {cond ? <span className="ml-2 font-normal normal-case tracking-normal text-[#6B5A4F]">({etiquetaCondicion(cond)})</span> : null}
      </div>
      <p className="whitespace-pre-line">{v}</p>
    </div>
  )
}

function Tabla({ filas }: { filas: Fila[] }) {
  if (filas.length === 0) return null
  return (
    <table className="w-full text-sm">
      <tbody>
        {filas.map((f, i) => (
          <tr key={i} className="border-b border-[#E7DCCB] align-top">
            <td className="py-1.5 pr-3 font-semibold">{f.dato}</td>
            <td className="py-1.5 pr-3">{f.valor}</td>
            <td className="py-1.5 text-xs text-[#6B5A4F]">{f.cond ? etiquetaCondicion(f.cond) : ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/**
 * Documento final: reúne en una sola hoja lo que la persona escribió en cada paso.
 * No inventa nada ni usa IA: solo ordena lo guardado. Lo que falta se marca como pendiente.
 */
export default async function DocumentoPage({ searchParams }: { searchParams: Promise<{ proyecto?: string }> }) {
  const { proyecto: proyectoId } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/empresarial')
  if (!proyectoId) return mensaje('Falta el proyecto', 'Entra desde tu proyecto para ver el documento.')

  const { data: proyecto } = await supabase.from('sfpe_proyectos').select('id, nombre, pais, moneda').eq('id', proyectoId).maybeSingle()
  if (!proyecto) return mensaje('No encontramos ese proyecto', 'Revisa que hayas entrado con tu cuenta.')
  const id = proyecto.id as string
  const moneda = (proyecto.moneda as string | null) ?? null
  const din = (n: number | null) => formatoDinero(n, moneda)

  const [form, formItems, merc, segs, tam, precio, comps, canales, tec, specs, pasos, fin, finItems, dofaQ, ikiQ, entQ, preQ, lieQ, rieQ] = await Promise.all([
    supabase.from('sfpe_formulacion').select('*').eq('proyecto_id', id).maybeSingle(),
    supabase.from('sfpe_formulacion_items').select('tipo, texto, condicion').eq('proyecto_id', id).order('orden', { ascending: true }),
    supabase.from('sfpe_mercado').select('*').eq('proyecto_id', id).maybeSingle(),
    supabase.from('sfpe_mercado_segmentos').select('nombre, descripcion, necesidades, capacidad_compra, barreras').eq('proyecto_id', id),
    supabase.from('sfpe_mercado_tamano').select('*').eq('proyecto_id', id).maybeSingle(),
    supabase.from('sfpe_mercado_precio').select('*').eq('proyecto_id', id).maybeSingle(),
    supabase.from('sfpe_mercado_competidores').select('nombre, tipo, producto, precio, unidad_precio, fortalezas, debilidades, fuente, condicion').eq('proyecto_id', id),
    supabase.from('sfpe_mercado_canales').select('tipo, descripcion, costo_adquisicion, conversion, condicion').eq('proyecto_id', id),
    supabase.from('sfpe_tecnico').select('*').eq('proyecto_id', id).maybeSingle(),
    supabase.from('sfpe_tecnico_specs').select('caracteristica, especificacion, unidad, criterio, condicion').eq('proyecto_id', id),
    supabase.from('sfpe_tecnico_pasos').select('nombre, responsable, duracion_min, recursos, condicion').eq('proyecto_id', id),
    supabase.from('sfpe_financiero').select('*').eq('proyecto_id', id).maybeSingle(),
    supabase.from('sfpe_financiero_items').select('tipo, concepto, categoria, valor, fuente, condicion').eq('proyecto_id', id).order('orden', { ascending: true }),
    supabase.from('sfpe_dofa_items').select('cuadrante, texto, impacto, fuente, condicion').eq('proyecto_id', id).order('orden', { ascending: true }),
    supabase.from('sfpe_ikigai_items').select('texto, ama, bueno, necesita, pagan, fuente, condicion').eq('proyecto_id', id).order('orden', { ascending: true }),
    supabase.from('sfpe_entorno_items').select('factor, texto, efecto, peso, fuente, condicion').eq('proyecto_id', id).order('orden', { ascending: true }),
    supabase.from('sfpe_presiones_items').select('factor, texto, efecto, peso, fuente, condicion').eq('proyecto_id', id).order('orden', { ascending: true }),
    supabase.from('sfpe_lienzo_items').select('bloque, texto, fuente, condicion').eq('proyecto_id', id).order('orden', { ascending: true }),
    supabase.from('sfpe_riesgos_items').select('categoria, texto, probabilidad, impacto, respuesta, plan, responsable, fuente, condicion').eq('proyecto_id', id).order('orden', { ascending: true }),
  ])
  const itemsEnt: ItemEntorno[] = (entQ.data ?? []).map((x, i) => ({
    id: String(i),
    factor: x.factor,
    texto: s(x.texto),
    efecto: x.efecto,
    peso: s(x.peso) || '3',
    fuente: s(x.fuente),
    condicion: x.condicion,
  }))
  const itemsPre: ItemPresion[] = (preQ.data ?? []).map((x, i) => ({
    id: String(i),
    factor: x.factor,
    texto: s(x.texto),
    efecto: x.efecto,
    peso: s(x.peso) || '3',
    fuente: s(x.fuente),
    condicion: x.condicion,
  }))
  const itemsLie: ItemLienzo[] = (lieQ.data ?? []).map((x, i) => ({
    id: String(i),
    bloque: x.bloque,
    texto: s(x.texto),
    fuente: s(x.fuente),
    condicion: x.condicion,
  }))
  const itemsRie: ItemRiesgo[] = (rieQ.data ?? []).map((x, i) => ({
    id: String(i),
    categoria: x.categoria,
    texto: s(x.texto),
    probabilidad: String(x.probabilidad ?? 3),
    impacto: String(x.impacto ?? 3),
    respuesta: x.respuesta ?? '',
    plan: s(x.plan),
    responsable: s(x.responsable),
    fuente: s(x.fuente),
    condicion: x.condicion,
  }))
  const llenosEnt = itemsEnt.filter((x) => x.texto)
  const llenosPre = itemsPre.filter((x) => x.texto)
  const llenosLie = itemsLie.filter((x) => x.texto)
  const riesgosOrd = ordenarRiesgos(itemsRie)
  const lecEnt = lecturaEntorno(radarEntorno(itemsEnt))
  const lecPre = lecturaPresiones(radarPresiones(itemsPre))
  const lecLie = lecturaLienzo(itemsLie)
  const lecRie = lecturaRiesgos(itemsRie)
  const itemsIki: ItemIkigai[] = (ikiQ.data ?? []).map((x, i) => ({
    id: String(i),
    texto: s(x.texto),
    ama: Boolean(x.ama),
    bueno: Boolean(x.bueno),
    necesita: Boolean(x.necesita),
    pagan: Boolean(x.pagan),
    fuente: s(x.fuente),
    condicion: x.condicion,
  }))
  const lecIki = lecturaIkigai(itemsIki)
  const itemsDofa: ItemDofa[] = (dofaQ.data ?? []).map((x, i) => ({
    id: String(i),
    cuadrante: x.cuadrante,
    texto: s(x.texto),
    impacto: s(x.impacto) || '3',
    fuente: s(x.fuente),
    condicion: x.condicion,
  }))
  const balanceDofa = calcularBalance(itemsDofa)
  const lecturaDofa = lecturaPosicion(balanceDofa)

  const f = form.data
  const m = merc.data
  const t = tam.data
  const p = precio.data
  const te = tec.data
  const fi = fin.data
  const objetivos = (formItems.data ?? []).filter((x) => x.tipo === 'objetivo_especifico')
  const beneficiarios = (formItems.data ?? []).filter((x) => x.tipo === 'beneficiario')
  const resultados = (formItems.data ?? []).filter((x) => x.tipo === 'resultado')

  // Cálculos financieros: los mismos de la pantalla de financiero.
  const itemsFin: ItemFinanciero[] = (finItems.data ?? []).map((x, i) => ({
    id: String(i),
    tipo: x.tipo as TipoItem,
    concepto: s(x.concepto),
    categoria: s(x.categoria),
    valor: s(x.valor),
    fuente: s(x.fuente),
    condicion: x.condicion,
  }))
  const r = fi
    ? calcular(
        {
          ...financieroVacio(),
          precio_unitario: s(fi.precio_unitario),
          costo_variable_unitario: s(fi.costo_variable_unitario),
          unidades_mes: s(fi.unidades_mes),
          aporte_propio: s(fi.aporte_propio),
        },
        itemsFin,
      )
    : null

  const gasto = t?.gasto_valor === null || t?.gasto_valor === undefined ? null : Number(t.gasto_valor)
  const enDinero = (v: unknown) => (gasto !== null && v !== null && v !== undefined ? din(Number(v) * gasto) : '—')

  const pasosT = (pasos.data ?? []).map((x) => ({ ...x, duracion_min: s(x.duracion_min) }))
  const tiempo = tiempoTotalMin(pasosT as never)

  const q = `?proyecto=${id}`
  const lista = (xs: { texto: unknown; condicion: unknown }[]) => (
    <ul className="list-disc space-y-1 pl-5">
      {xs.map((x, i) => (
        <li key={i}>
          {s(x.texto)} <span className="text-xs text-[#6B5A4F]">({etiquetaCondicion(s(x.condicion))})</span>
        </li>
      ))}
    </ul>
  )

  const completos = [
    Boolean(f),
    Boolean(m),
    Boolean(t),
    Boolean(p) || (comps.data ?? []).length > 0 || (canales.data ?? []).length > 0,
    itemsIki.length > 0,
    itemsDofa.length > 0,
    Boolean(te),
    Boolean(fi),
    llenosEnt.length > 0,
    llenosPre.length > 0,
    llenosLie.length > 0,
    riesgosOrd.length > 0,
  ].filter(Boolean).length
  const hayTam = t?.tam_valor != null && t?.sam_valor != null && t?.som_valor != null && gasto !== null
  const precioN = p?.precio != null ? Number(p.precio) : null
  const costoN = p?.costo_unitario != null ? Number(p.costo_unitario) : null
  const mgn = precioN && costoN !== null && precioN > 0 ? (precioN - costoN) / precioN : null
  const inv = itemsFin.filter((x) => x.tipo === 'inversion').map((x) => ({ etiqueta: x.concepto || 'Sin nombre', valor: num(x.valor) ?? 0 }))
  const barrasMes = r && r.ingresosMes !== null && r.variablesMes !== null ? [
    { etiqueta: 'Ingresos por mes', valor: r.ingresosMes },
    { etiqueta: 'Costos variables', valor: r.variablesMes },
    { etiqueta: 'Costos fijos', valor: r.fijosMes },
    { etiqueta: 'Utilidad por mes', valor: r.utilidadMes ?? 0, destacada: true },
  ] : []
  const hoy = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino print:bg-white">
      <div className="max-w-[900px] mx-auto px-5 lg:px-8 py-10 lg:py-14 print:p-0">
        <div className="print:hidden">
          <Link href={`/empresarial/camino${q}`} className="inline-flex items-center gap-2 text-sm text-ca-vino/75 hover:text-ca-vino-hondo">
            ← Volver a mi camino
          </Link>
          <h1 className="mt-6 text-3xl lg:text-4xl font-extrabold">Tu documento final</h1>
          <p className="mt-3 text-ca-vino/80 leading-relaxed">
            Aquí se reúne, en una sola hoja, todo lo que escribiste en cada paso. No se agrega nada nuevo: si algo falta, aparece marcado para que lo completes.
          </p>
          <div className="mt-5 mb-6">
            <BotonImprimir />
          </div>
        </div>

        <article className="rounded-2xl bg-ca-tarjeta p-6 lg:p-10 text-[#2B1A14] shadow-[0_10px_40px_-12px_rgba(0,0,0,0.5)] print:shadow-none print:rounded-none">
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-ca-oro-texto">Documento del proyecto</div>
          <h1 className="mt-2 text-3xl font-extrabold text-ca-vino">{proyecto.nombre as string}</h1>
          <p className="mt-1 text-sm text-[#6B5A4F]">
            {s(proyecto.pais) ? `${s(proyecto.pais)} · ` : ''}Generado el {hoy}
          </p>

          <ResumenVisual
            precio={precioN}
            unidadPrecio={s(p?.unidad_precio)}
            margen={mgn}
            utilidadMes={r ? r.utilidadMes : null}
            recuperacion={r ? formatoMeses(r.mesesRecuperacion) : '—'}
            completos={completos}
            total={12}
            interno={balanceDofa.interno}
            externo={balanceDofa.externo}
            embudo={hayTam ? [
              { etiqueta: 'TAM · mercado total', valor: enDinero(t?.tam_valor), detalle: `${formatoNumero(Number(t?.tam_valor))} clientes` },
              { etiqueta: 'SAM · el que puedes atender', valor: enDinero(t?.sam_valor), detalle: `${formatoNumero(Number(t?.sam_valor))} clientes` },
              { etiqueta: 'SOM · lo que puedes captar', valor: enDinero(t?.som_valor), detalle: `${formatoNumero(Number(t?.som_valor))} clientes` },
            ] : []}
            barrasMes={barrasMes}
            inversion={inv}
            inversionTotal={r ? r.inversion : 0}
            moneda={moneda}
          />

          <Bloque titulo="1. El proyecto" href={`/empresarial/formulacion${q}`} vacio={!f}>
            <Tabla
              filas={[
                { dato: 'Tipo de proyecto', valor: s(f?.tipo_proyecto) },
                { dato: 'Sector', valor: s(f?.sector) },
                { dato: 'Ubicación', valor: s(f?.ubicacion) },
                { dato: 'Duración', valor: f?.duracion_meses ? `${f.duracion_meses} meses` : '' },
              ].filter((x) => x.valor)}
            />
            <Texto t="Problema" v={s(f?.problema)} />
            <Texto t="Por qué vale la pena" v={s(f?.justificacion)} />
            <Texto t="Antecedentes" v={s(f?.antecedentes)} />
            <Texto t="Objetivo general" v={s(f?.objetivo_general)} />
            {objetivos.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-ca-oro-texto">Objetivos específicos</div>
                {lista(objetivos)}
              </div>
            )}
            {beneficiarios.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-ca-oro-texto">Quiénes se benefician</div>
                {lista(beneficiarios)}
              </div>
            )}
            {resultados.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-ca-oro-texto">Resultados esperados</div>
                {lista(resultados)}
              </div>
            )}
            <Texto t="Alcance" v={s(f?.alcance)} />
            <Texto t="Lo que no incluye" v={s(f?.exclusiones)} />
          </Bloque>

          <Bloque titulo="2. El mercado" href={`/empresarial/mercado${q}`} vacio={!m}>
            <Tabla
              filas={[
                { dato: 'Producto o servicio', valor: s(m?.producto) },
                { dato: 'Quién compra', valor: etiquetaDe(TIPOS_COMPRADOR, s(m?.tipo_comprador)) },
                { dato: 'Naturaleza', valor: etiquetaDe(NATURALEZAS, s(m?.naturaleza)) },
                { dato: 'Cobertura', valor: etiquetaDe(COBERTURAS, s(m?.cobertura)) },
                { dato: 'Etapa del mercado', valor: etiquetaDe(ETAPAS_MERCADO, s(m?.etapa_mercado)) },
                { dato: 'Ubicación', valor: s(m?.ubicacion) },
              ].filter((x) => x.valor && x.valor !== 'undefined')}
            />
            <Texto t="Descripción del mercado" v={s(m?.descripcion_mercado)} />
            <Texto t="Delimitación" v={s(m?.delimitacion)} />
            <Texto t="Restricciones" v={s(m?.restricciones)} />
            {(segs.data ?? []).length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-ca-oro-texto">Segmentos de clientes</div>
                <ul className="mt-1 space-y-2">
                  {(segs.data ?? []).map((x, i) => (
                    <li key={i}>
                      <span className="font-semibold">{s(x.nombre)}</span>
                      {s(x.descripcion) ? ` — ${s(x.descripcion)}` : ''}
                      {s(x.necesidades) ? <span className="block text-sm text-[#6B5A4F]">Necesita: {s(x.necesidades)}</span> : null}
                      {s(x.capacidad_compra) ? <span className="block text-sm text-[#6B5A4F]">Capacidad de compra: {s(x.capacidad_compra)}</span> : null}
                      {s(x.barreras) ? <span className="block text-sm text-[#6B5A4F]">Barreras: {s(x.barreras)}</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Bloque>

          <Bloque titulo="3. Tamaño y demanda" href={`/empresarial/mercado/demanda${q}`} vacio={!t}>
            <Tabla
              filas={[
                { dato: 'Gasto anual por cliente', valor: gasto !== null ? din(gasto) : '', cond: s(t?.gasto_condicion) },
                { dato: 'Mercado total (TAM)', valor: t?.tam_valor != null ? `${formatoNumero(Number(t.tam_valor))} clientes · ${enDinero(t.tam_valor)} al año` : '', cond: s(t?.tam_condicion) },
                { dato: 'Mercado que puedes atender (SAM)', valor: t?.sam_valor != null ? `${formatoNumero(Number(t.sam_valor))} clientes · ${enDinero(t.sam_valor)} al año` : '', cond: s(t?.sam_condicion) },
                { dato: 'Lo que puedes captar (SOM)', valor: t?.som_valor != null ? `${formatoNumero(Number(t.som_valor))} clientes · ${enDinero(t.som_valor)} al año` : '', cond: s(t?.som_condicion) },
              ].filter((x) => x.valor)}
            />
            <Texto t="Cuántos clientes puedes atender" v={s(t?.capacidad_clientes)} />
            <Texto t="Frecuencia de compra" v={s(t?.frecuencia_compra)} />
            <Texto t="Estacionalidad" v={s(t?.estacionalidad)} />
            <Texto t="Intención de compra" v={s(t?.intencion_compra)} />
            <Texto t="Demanda sin atender" v={s(t?.demanda_insatisfecha)} />
          </Bloque>

          <Bloque titulo="4. Competencia, precio y canales" href={`/empresarial/mercado/competencia${q}`} vacio={!p && (comps.data ?? []).length === 0 && (canales.data ?? []).length === 0}>
            {p && (
              <Tabla
                filas={[
                  { dato: 'Precio', valor: p.precio != null ? `${din(Number(p.precio))}${s(p.unidad_precio) ? ` ${s(p.unidad_precio)}` : ''}` : '' },
                  { dato: 'Costo por unidad', valor: p.costo_unitario != null ? din(Number(p.costo_unitario)) : '' },
                  { dato: 'Cómo se fijó el precio', valor: s(p.metodo) },
                  { dato: 'Por qué ese precio', valor: s(p.justificacion) },
                  { dato: 'Disposición a pagar', valor: s(p.disposicion_pago) },
                ].filter((x) => x.valor)}
              />
            )}
            {(comps.data ?? []).length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-ca-oro-texto">Competidores</div>
                <ul className="mt-1 space-y-2">
                  {(comps.data ?? []).map((x, i) => (
                    <li key={i}>
                      <span className="font-semibold">{s(x.nombre)}</span>
                      {s(x.producto) ? ` — ${s(x.producto)}` : ''}
                      {x.precio != null ? ` · ${din(Number(x.precio))}${s(x.unidad_precio) ? ` ${s(x.unidad_precio)}` : ''}` : ''}
                      {s(x.fortalezas) ? <span className="block text-sm text-[#6B5A4F]">Fortalezas: {s(x.fortalezas)}</span> : null}
                      {s(x.debilidades) ? <span className="block text-sm text-[#6B5A4F]">Debilidades: {s(x.debilidades)}</span> : null}
                      <span className="block text-xs text-[#6B5A4F]">
                        Fuente: {s(x.fuente) || 'sin fuente'} ({etiquetaCondicion(s(x.condicion))})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(canales.data ?? []).length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-ca-oro-texto">Canales para llegar al cliente</div>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {(canales.data ?? []).map((x, i) => (
                    <li key={i}>
                      {s(x.tipo)}
                      {s(x.descripcion) ? ` — ${s(x.descripcion)}` : ''}
                      {x.costo_adquisicion != null ? ` · costo por cliente ${din(Number(x.costo_adquisicion))}` : ''}{' '}
                      <span className="text-xs text-[#6B5A4F]">({etiquetaCondicion(s(x.condicion))})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Bloque>

          <Bloque titulo="5. Ikigai del proyecto" href={`/empresarial/ikigai${q}`} vacio={itemsIki.length === 0}>
            <ul className="list-disc space-y-1 pl-5">
              {itemsIki.filter((x) => x.texto).map((x, i) => (
                <li key={i}>
                  {x.texto}: <span className="text-[#6B5A4F]">{nombreRegion(mascara(x))}{x.fuente ? ` · ${x.fuente}` : ''}</span>
                </li>
              ))}
            </ul>
            {lecIki && <p>{lecIki.texto}</p>}
            <p className="text-xs text-[#6B5A4F]">Preguntas: {PREGUNTAS.map((p) => p.titulo).join(' · ')}. Ideas por zona: {Object.entries(conteoPorRegion(itemsIki)).length}.</p>
          </Bloque>

          <Bloque titulo="6. Análisis DOFA" href={`/empresarial/dofa${q}`} vacio={itemsDofa.length === 0}>
            {GUIAS.map((g) => {
              const xs = itemsDofa.filter((i) => i.cuadrante === g.clave && i.texto)
              if (xs.length === 0) return null
              return (
                <div key={g.clave}>
                  <div className="text-xs font-bold uppercase tracking-wider text-ca-oro-texto">{g.titulo}</div>
                  <ul className="list-disc space-y-1 pl-5">
                    {xs.map((x, i) => (
                      <li key={i}>
                        {x.texto} <span className="text-xs text-[#6B5A4F]">(peso {x.impacto} · {etiquetaCondicion(x.condicion)}{x.fuente ? ` · ${x.fuente}` : ''})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
            {lecturaDofa && (
              <p>
                <span className="font-semibold">Posición {lecturaDofa.nombre}:</span> {lecturaDofa.texto}
              </p>
            )}
            {CRUCES.map((c) => {
              const xs = itemsDofa.filter((i) => i.cuadrante === c.clave && i.texto)
              if (xs.length === 0) return null
              return (
                <div key={c.clave}>
                  <div className="text-xs font-bold uppercase tracking-wider text-ca-oro-texto">Estrategias para {c.titulo.toLowerCase()}</div>
                  <ul className="list-disc space-y-1 pl-5">
                    {xs.map((x, i) => (
                      <li key={i}>{x.texto}</li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </Bloque>

          <Bloque titulo="7. Estudio técnico" href={`/empresarial/tecnico${q}`} vacio={!te}>
            <Tabla
              filas={[
                { dato: 'Solución', valor: s(te?.nombre_solucion) },
                { dato: 'Tipo', valor: etiquetaDe(TIPOS_SOLUCION, s(te?.tipo_solucion)) },
                { dato: 'Se vende por', valor: s(te?.unidad_comercializacion) },
                { dato: 'Estado', valor: etiquetaDe(ESTADOS_SOLUCION, s(te?.estado_solucion)) },
              ].filter((x) => x.valor && x.valor !== 'undefined')}
            />
            <Texto t="Descripción" v={s(te?.descripcion)} />
            <Texto t="Calidad esperada" v={s(te?.calidad_esperada)} />
            <Texto t="Restricciones" v={s(te?.restricciones)} />
            {(specs.data ?? []).length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-ca-oro-texto">Especificaciones</div>
                <Tabla
                  filas={(specs.data ?? []).map((x) => ({
                    dato: s(x.caracteristica),
                    valor: `${s(x.especificacion)}${s(x.unidad) ? ` ${s(x.unidad)}` : ''}`,
                    cond: s(x.condicion),
                  }))}
                />
              </div>
            )}
            {(pasos.data ?? []).length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-ca-oro-texto">Cómo se produce o se presta</div>
                <ol className="mt-1 list-decimal space-y-1 pl-5">
                  {(pasos.data ?? []).map((x, i) => (
                    <li key={i}>
                      {s(x.nombre)}
                      {s(x.responsable) ? ` — responsable: ${s(x.responsable)}` : ''}
                      {x.duracion_min != null ? ` · ${formatoMinutos(Number(x.duracion_min))}` : ''}
                    </li>
                  ))}
                </ol>
                {tiempo > 0 && <p className="mt-2 text-sm">Tiempo total por unidad: {formatoMinutos(tiempo)}.</p>}
              </div>
            )}
          </Bloque>

          <Bloque titulo="8. Financiero básico" href={`/empresarial/financiero${q}`} vacio={!fi}>
            {r && (
              <Tabla
                filas={[
                  { dato: 'Precio por unidad', valor: din(num(s(fi?.precio_unitario))) },
                  { dato: 'Costo por unidad', valor: din(num(s(fi?.costo_variable_unitario))) },
                  { dato: 'Unidades por mes', valor: s(fi?.unidades_mes) ? formatoNumero(Number(fi?.unidades_mes)) : '', cond: s(fi?.unidades_condicion) },
                  { dato: 'Inversión inicial', valor: din(r.inversion) },
                  { dato: 'Costos fijos por mes', valor: din(r.fijosMes) },
                  { dato: 'Ingresos por mes', valor: din(r.ingresosMes) },
                  { dato: 'Utilidad por mes', valor: din(r.utilidadMes) },
                  { dato: 'Punto de equilibrio', valor: r.equilibrioUnidades === null ? '' : `${formatoNumero(Math.ceil(r.equilibrioUnidades))} unidades al mes` },
                  { dato: 'Recuperación de la inversión', valor: formatoMeses(r.mesesRecuperacion) },
                ].filter((x) => x.valor && x.valor !== '—')}
              />
            )}
            {itemsFin.filter((x) => x.tipo === 'inversion').length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-ca-oro-texto">Inversión inicial</div>
                <Tabla filas={itemsFin.filter((x) => x.tipo === 'inversion').map((x) => ({ dato: x.concepto, valor: din(num(x.valor)), cond: x.condicion }))} />
              </div>
            )}
            {itemsFin.filter((x) => x.tipo === 'costo_fijo').length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-ca-oro-texto">Costos fijos por mes</div>
                <Tabla filas={itemsFin.filter((x) => x.tipo === 'costo_fijo').map((x) => ({ dato: x.concepto, valor: din(num(x.valor)), cond: x.condicion }))} />
              </div>
            )}
            <p className="text-xs text-[#6B5A4F]">Cuentas hechas con las cifras que escribiste; valen lo que valgan sus fuentes. No son una promesa de resultados.</p>
          </Bloque>

          <Bloque titulo="9. Radar del entorno" href={`/empresarial/entorno${q}`} vacio={llenosEnt.length === 0}>
            {llenosEnt.length > 0 ? (
              <RadarEntorno titulo="Radar del entorno: lo que ayuda y lo que perjudica en cada frente" ejes={radarEntorno(itemsEnt).map((p) => ({ etiqueta: p.titulo, ayuda: p.ayuda, perjudica: p.perjudica }))} />
            ) : null}
            {FACTORES_ENTORNO.map((fa) => {
              const xs = llenosEnt.filter((i) => i.factor === fa.clave)
              if (xs.length === 0) return null
              return (
                <div key={fa.clave}>
                  <div className="text-xs font-bold uppercase tracking-wider text-ca-oro-texto">{fa.titulo}</div>
                  <ul className="list-disc space-y-1 pl-5">
                    {xs.map((x, i) => (
                      <li key={i}>
                        {x.texto}{' '}
                        <span className="text-xs text-[#6B5A4F]">
                          ({x.efecto === 'ayuda' ? 'te ayuda' : 'te perjudica'} · peso {x.peso} · {etiquetaCondicion(x.condicion)}
                          {x.fuente ? ` · ${x.fuente}` : ''})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
            {lecEnt.map((l, i) => (
              <p key={i}>
                <span className="font-semibold">{l.titulo}:</span> {l.texto}
              </p>
            ))}
          </Bloque>

          <Bloque titulo="10. Mapa de presiones del sector" href={`/empresarial/presiones${q}`} vacio={llenosPre.length === 0}>
            {llenosPre.length > 0 ? (
              <RadarEntorno titulo="Mapa de presiones: lo que te protege y lo que te presiona en cada frente" etiquetaAyuda="Lo que te protege" etiquetaDano="Lo que te presiona" textoAyuda="a favor" textoDano="de presión" ejes={radarPresiones(itemsPre).map((p) => ({ etiqueta: p.corto, ayuda: p.protege, perjudica: p.presiona }))} />
            ) : null}
            {FACTORES_PRESION.map((fa) => {
              const xs = llenosPre.filter((i) => i.factor === fa.clave)
              if (xs.length === 0) return null
              return (
                <div key={fa.clave}>
                  <div className="text-xs font-bold uppercase tracking-wider text-ca-oro-texto">{fa.titulo}</div>
                  <ul className="list-disc space-y-1 pl-5">
                    {xs.map((x, i) => (
                      <li key={i}>
                        {x.texto}{' '}
                        <span className="text-xs text-[#6B5A4F]">
                          ({x.efecto === 'presiona' ? 'te presiona' : 'te protege'} · peso {x.peso} · {etiquetaCondicion(x.condicion)}
                          {x.fuente ? ` · ${x.fuente}` : ''})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
            {lecPre.map((l, i) => (
              <p key={i}>
                <span className="font-semibold">{l.titulo}:</span> {l.texto}
              </p>
            ))}
          </Bloque>

          <Bloque titulo="11. Lienzo del modelo de negocio" href={`/empresarial/lienzo${q}`} vacio={llenosLie.length === 0}>
            {BLOQUES.map((b) => {
              const xs = llenosLie.filter((i) => i.bloque === b.clave)
              if (xs.length === 0) return null
              return (
                <div key={b.clave}>
                  <div className="text-xs font-bold uppercase tracking-wider text-ca-oro-texto">{b.titulo}</div>
                  <ul className="list-disc space-y-1 pl-5">
                    {xs.map((x, i) => (
                      <li key={i}>
                        {x.texto}{' '}
                        <span className="text-xs text-[#6B5A4F]">
                          ({etiquetaCondicion(x.condicion)}
                          {x.fuente ? ` · ${x.fuente}` : ''})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
            {lecLie.map((l, i) => (
              <p key={i}>
                <span className="font-semibold">{l.titulo}:</span> {l.texto}
              </p>
            ))}
          </Bloque>

          <Bloque titulo="12. Termómetro de riesgos" href={`/empresarial/riesgos${q}`} vacio={riesgosOrd.length === 0}>
            <div className="flex flex-wrap gap-2">
              {contarPorNivel(itemsRie).map((c) => (
                <span key={c.nivel} className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: COLOR_NIVEL[c.nivel] }}>
                  {c.nivel}: {c.cantidad}
                </span>
              ))}
            </div>
            <MapaCalor riesgos={riesgosOrd} />
            <ol className="space-y-3">
              {riesgosOrd.map((x) => (
                <li key={x.numero} className="break-inside-avoid">
                  <span className="mr-2 inline-block rounded px-2 py-0.5 text-xs font-bold text-white" style={{ backgroundColor: COLOR_NIVEL[x.nivel] }}>
                    {x.numero} · {x.nivel}
                  </span>
                  <span className="font-semibold">{x.item.texto}</span>
                  <span className="block text-sm text-[#6B5A4F]">
                    {tituloCategoria(x.item.categoria)} · probabilidad {x.item.probabilidad} × impacto {x.item.impacto} = {x.puntaje} de 25
                  </span>
                  {x.item.respuesta ? <span className="block text-sm text-[#6B5A4F]">Qué piensa hacer: {etiquetaRespuesta(x.item.respuesta)}</span> : null}
                  {x.item.plan ? <span className="block text-sm text-[#6B5A4F]">Plan: {x.item.plan}</span> : null}
                  {x.item.responsable ? <span className="block text-sm text-[#6B5A4F]">Responsable: {x.item.responsable}</span> : null}
                  <span className="block text-xs text-[#6B5A4F]">
                    Fuente: {x.item.fuente || 'sin fuente'} ({etiquetaCondicion(x.item.condicion)})
                  </span>
                </li>
              ))}
            </ol>
            {lecRie.map((l, i) => (
              <p key={i}>
                <span className="font-semibold">{l.titulo}:</span> {l.texto}
              </p>
            ))}
          </Bloque>

          <p className="mt-10 border-t border-[#E7DCCB] pt-3 text-xs text-[#6B5A4F]">
            Este documento ordena la información que aportó la persona; no la certifica. Cada dato lleva su condición (verificado, aportado, estimado, supuesto o pendiente).
            Antes de presentarlo a un tercero, comprueba lo que esté marcado como supuesto o pendiente.
          </p>
        </article>
      </div>
    </main>
  )
}
