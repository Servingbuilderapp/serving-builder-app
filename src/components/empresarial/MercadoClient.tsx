'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CONDICIONES, etiquetaCondicion, type Condicion } from '@/lib/empresarial/formulacion'
import {
  ATENCION_REMOTA,
  COBERTURAS,
  ETAPAS_MERCADO,
  NATURALEZAS,
  ROLES,
  TIPOS_COMPRADOR,
  datosSinRespaldoMercado,
  esSegmentoGenerico,
  revisarMercado,
  segmentoVacio,
  type CampoMercado,
  type Mercado,
  type Segmento,
} from '@/lib/empresarial/mercado'

const RELIEVE_BOTON =
  'shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200'
const RELIEVE_TARJETA = 'shadow-[0_1px_2px_rgba(84,20,43,0.06),0_10px_28px_-14px_rgba(84,20,43,0.22)]'

const CAMPO_ENTRADA =
  'mt-2 w-full rounded-xl border border-ca-oro/40 bg-ca-fondo px-4 py-3 text-ca-vino placeholder:text-ca-vino/65 focus:outline-none focus:ring-2 focus:ring-ca-oro-claro'
const CAMPO_INTERNO =
  'mt-1 w-full rounded-lg border border-ca-oro/40 bg-ca-tarjeta px-3 py-2 text-ca-vino placeholder:text-ca-vino/65 focus:outline-none focus:ring-2 focus:ring-ca-oro-claro'

interface Props {
  proyecto: { id: string; nombre: string; pais: string | null; moneda: string | null; profundidad: string | null }
  mercadoInicial: Mercado
  segmentosIniciales: Segmento[]
  yaGuardado: boolean
  formulacion: { problema: string; alcance: string } | null
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

export function MercadoClient({ proyecto, mercadoInicial, segmentosIniciales, yaGuardado, formulacion }: Props) {
  const [m, setM] = useState<Mercado>(mercadoInicial)
  const [segs, setSegs] = useState<Segmento[]>(segmentosIniciales)
  const [idsGuardados, setIdsGuardados] = useState<string[]>(yaGuardado ? segmentosIniciales.map((s) => s.id) : [])
  const [guardado, setGuardado] = useState(yaGuardado)
  const [sucio, setSucio] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const botonOro = `h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-ca-oro-claro to-ca-oro text-ca-vino-hondo font-extrabold disabled:opacity-50 disabled:cursor-not-allowed ${RELIEVE_BOTON}`
  const botonSuave = `h-11 px-4 inline-flex items-center justify-center gap-2 rounded-xl border border-ca-oro/50 bg-ca-tarjeta text-ca-vino font-semibold disabled:opacity-40 ${RELIEVE_BOTON}`

  const revision = useMemo(() => revisarMercado(m, segs), [m, segs])
  const faltanObligatorios = revision.filter((r) => r.obligatorio && !r.cumple)
  const faltanRecomendados = revision.filter((r) => !r.obligatorio && !r.cumple)
  const sinRespaldo = datosSinRespaldoMercado(m, segs)

  function cambiar(campo: keyof Omit<Mercado, 'condiciones'>, valor: string) {
    setM((prev) => ({ ...prev, [campo]: valor }))
    setSucio(true)
  }
  function cambiarCondicion(campo: CampoMercado, c: Condicion) {
    setM((prev) => ({ ...prev, condiciones: { ...prev.condiciones, [campo]: c } }))
    setSucio(true)
  }
  function cambiarSegmento(id: string, cambios: Partial<Segmento>) {
    setSegs((prev) => prev.map((s) => (s.id === id ? { ...s, ...cambios } : s)))
    setSucio(true)
  }
  function alternarRol(id: string, rol: string) {
    setSegs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, roles: s.roles.includes(rol) ? s.roles.filter((r) => r !== rol) : [...s.roles, rol] } : s)),
    )
    setSucio(true)
  }
  function quitarSegmento(id: string) {
    setSegs((prev) => prev.filter((s) => s.id !== id))
    setSucio(true)
  }

  async function guardar() {
    setAviso(null)
    setGuardando(true)
    const supabase = createClient()
    const ahora = new Date().toISOString()

    const { error: e1 } = await supabase.from('sfpe_mercado').upsert(
      {
        proyecto_id: proyecto.id,
        producto: m.producto.trim() || null,
        tipo_comprador: m.tipo_comprador || null,
        naturaleza: m.naturaleza || null,
        cobertura: m.cobertura || null,
        etapa_mercado: m.etapa_mercado || 'no_se',
        sector: m.sector.trim() || null,
        ubicacion: m.ubicacion.trim() || null,
        atencion_remota: m.atencion_remota || null,
        descripcion_mercado: m.descripcion_mercado.trim() || null,
        delimitacion: m.delimitacion.trim() || null,
        restricciones: m.restricciones.trim() || null,
        condiciones: m.condiciones,
        actualizada_en: ahora,
      },
      { onConflict: 'proyecto_id' },
    )
    if (e1) {
      setGuardando(false)
      return setAviso({ tipo: 'error', texto: 'No pudimos guardar el estudio de mercado. Intenta de nuevo.' })
    }

    const conNombre = segs.filter((s) => s.nombre.trim())
    const filas = conNombre.map((s, i) => ({
      anterior: s.id,
      fila: {
        id: s.id.startsWith('nuevo-') ? crypto.randomUUID() : s.id,
        proyecto_id: proyecto.id,
        nombre: s.nombre.trim(),
        descripcion: s.descripcion.trim() || null,
        necesidades: s.necesidades.trim() || null,
        capacidad_compra: s.capacidad_compra.trim() || null,
        barreras: s.barreras.trim() || null,
        canales: s.canales.trim() || null,
        roles: s.roles,
        condicion: s.condicion,
        origen: s.origen,
        orden: i + 1,
      },
    }))
    if (filas.length > 0) {
      const { error: e2 } = await supabase.from('sfpe_mercado_segmentos').upsert(filas.map((x) => x.fila), { onConflict: 'id' })
      if (e2) {
        setGuardando(false)
        return setAviso({ tipo: 'error', texto: 'Se guardó la parte general, pero no pudimos guardar los grupos de clientes. Intenta de nuevo.' })
      }
    }
    const nuevos = filas.map((x) => x.fila.id)
    const borrar = idsGuardados.filter((id) => !nuevos.includes(id))
    if (borrar.length > 0) await supabase.from('sfpe_mercado_segmentos').delete().in('id', borrar)

    const mapa = new Map(filas.map((x) => [x.anterior, x.fila.id]))
    setSegs(conNombre.map((s) => ({ ...s, id: mapa.get(s.id) ?? s.id })))
    setIdsGuardados(nuevos)
    setGuardado(true)
    setSucio(false)
    setGuardando(false)
    setAviso({ tipo: 'ok', texto: 'Estudio de mercado guardado.' })
  }

  const campoLargo = (campo: CampoMercado, etiqueta: string, ayuda: string, filas = 4) => (
    <div>
      <label className="block font-semibold" htmlFor={`m-${campo}`}>
        {etiqueta}
      </label>
      <p className="text-xs text-ca-vino/75">{ayuda}</p>
      <textarea id={`m-${campo}`} rows={filas} value={m[campo]} onChange={(e) => cambiar(campo, e.target.value)} className={CAMPO_ENTRADA} />
      <SelectorCondicion valor={m.condiciones[campo] ?? 'aportado'} onCambio={(c) => cambiarCondicion(campo, c)} etiqueta={etiqueta} />
    </div>
  )

  const selector = (
    id: keyof Omit<Mercado, 'condiciones'>,
    etiqueta: string,
    ayuda: string,
    opciones: { valor: string; etiqueta: string }[],
    vacio = 'Elige una…',
  ) => (
    <div>
      <label className="block font-semibold" htmlFor={`m-${id}`}>
        {etiqueta}
      </label>
      {ayuda && <p className="text-xs text-ca-vino/75">{ayuda}</p>}
      <select id={`m-${id}`} value={m[id]} onChange={(e) => cambiar(id, e.target.value)} className={CAMPO_ENTRADA}>
        {opciones.every((o) => o.valor !== '') && <option value="">{vacio}</option>}
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.etiqueta}
          </option>
        ))}
      </select>
    </div>
  )

  return (
    <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino">
      <div className="max-w-[900px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <Link
          href={`/empresarial/formulacion?proyecto=${proyecto.id}`}
          className="inline-flex items-center gap-2 text-sm text-ca-vino/75 hover:text-ca-vino-hondo"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a la formulación
        </Link>

        <div className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-ca-oro-texto">Estudio de mercado · {proyecto.nombre}</div>
        <h1 className="mt-3 text-3xl lg:text-4xl font-extrabold">¿Para quién es y dónde?</h1>
        <p className="mt-3 text-ca-vino/80 leading-relaxed">
          Primera parte del estudio de mercado: defines qué mercado es, hasta dónde puedes atenderlo y quiénes son tus clientes. Todavía no
          se calculan cifras de ventas; eso viene en las siguientes pantallas. Cada dato dice qué tan seguro es.
        </p>

        {!guardado && (
          <div className="mt-6 rounded-2xl border border-ca-oro/60 bg-ca-fondo p-4 text-sm">
            <p className="font-semibold">Este es un borrador.</p>
            <p className="mt-1 text-ca-vino/80">
              {formulacion
                ? 'Copiamos el sector, el lugar y los beneficiarios que escribiste en tu formulación, sin agregar nada nuevo. Revísalo, complétalo y pulsa “Guardar estudio de mercado”. Hasta que lo guardes, nada queda registrado.'
                : 'Aún no tienes formulación guardada, así que empiezas en blanco. Escribe cada parte y pulsa “Guardar estudio de mercado”.'}
            </p>
          </div>
        )}

        {formulacion && (formulacion.problema || formulacion.alcance) && (
          <section className={`mt-6 rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-5 ${RELIEVE_TARJETA}`}>
            <h2 className="text-lg font-extrabold">Lo que escribiste en tu formulación</h2>
            <p className="mt-1 text-sm text-ca-vino/75">Solo lectura, para que lo tengas a la vista mientras describes el mercado.</p>
            {formulacion.problema && (
              <p className="mt-3 rounded-xl bg-ca-fondo p-3 text-sm">
                <span className="block text-xs font-semibold text-ca-oro-texto">Problema u oportunidad</span>
                {formulacion.problema}
              </p>
            )}
            {formulacion.alcance && (
              <p className="mt-3 rounded-xl bg-ca-fondo p-3 text-sm">
                <span className="block text-xs font-semibold text-ca-oro-texto">Alcance</span>
                {formulacion.alcance}
              </p>
            )}
          </section>
        )}

        <Seccion titulo="1. Qué mercado es" ayuda="Qué ofreces y a qué tipo de comprador.">
          <div>
            <label className="block font-semibold" htmlFor="m-producto">
              Qué producto o servicio ofreces
            </label>
            <p className="text-xs text-ca-vino/75">En una frase. Ejemplo: “servicio de entrega de almuerzos saludables a oficinas”.</p>
            <input id="m-producto" value={m.producto} onChange={(e) => cambiar('producto', e.target.value)} className={CAMPO_ENTRADA} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {selector('tipo_comprador', 'Quién compra', 'Cambia cómo se investiga y cómo se vende.', TIPOS_COMPRADOR)}
            {selector('naturaleza', 'Qué clase de oferta es', '', NATURALEZAS)}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block font-semibold" htmlFor="m-sector">
                Sector
              </label>
              <input id="m-sector" value={m.sector} onChange={(e) => cambiar('sector', e.target.value)} className={CAMPO_ENTRADA} />
            </div>
            {selector(
              'etapa_mercado',
              'En qué etapa está el mercado',
              'Elige una solo si tienes algo que lo respalde.',
              ETAPAS_MERCADO,
            )}
          </div>
          {campoLargo(
            'descripcion_mercado',
            'Describe el mercado',
            'Qué necesidad hay, quiénes la tienen y cómo la resuelven hoy.',
            5,
          )}
        </Seccion>

        <Seccion
          titulo="2. Dónde se puede atender"
          ayuda="El territorio que realmente puedes cubrir, no el que te gustaría. Un dato del país no sirve para demostrar demanda en tu municipio."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {selector('cobertura', 'Hasta dónde llega tu atención', '', COBERTURAS)}
            <div>
              <label className="block font-semibold" htmlFor="m-ubicacion">
                Lugar o zona
              </label>
              <p className="text-xs text-ca-vino/75">Ciudad, barrio, departamento o país.</p>
              <input id="m-ubicacion" value={m.ubicacion} onChange={(e) => cambiar('ubicacion', e.target.value)} className={CAMPO_ENTRADA} />
            </div>
          </div>
          {selector('atencion_remota', '¿Se puede atender a distancia?', 'Por ejemplo por internet o por teléfono.', ATENCION_REMOTA)}
          {campoLargo(
            'delimitacion',
            'Qué zona puedes atender de verdad',
            'Distancia máxima, barrios o municipios, y por qué ese límite.',
            3,
          )}
          {campoLargo(
            'restricciones',
            'Qué limita el territorio (opcional)',
            'Transporte, permisos, costos de envío, canales que no llegan.',
            3,
          )}
          <p className="text-xs text-ca-vino/75">
            País: {proyecto.pais ?? 'sin definir'}
            {proyecto.moneda ? ` · Moneda: ${proyecto.moneda}` : ''}. Vienen de tu proyecto.
          </p>
        </Seccion>

        <Seccion
          titulo="3. Tus clientes"
          ayuda="Un grupo de clientes es un conjunto de personas o empresas con necesidades parecidas. Mejor pocos grupos bien descritos que uno que diga “todos”."
        >
          {segs.length === 0 && <p className="text-sm text-ca-vino/75">Todavía no hay ningún grupo de clientes.</p>}
          <ul className="space-y-5">
            {segs.map((s, i) => (
              <li key={s.id} className="rounded-xl bg-ca-fondo p-4">
                <div className="flex items-start gap-2">
                  <div className="w-full">
                    <label className="block text-sm font-semibold" htmlFor={`s-${s.id}-nombre`}>
                      Grupo {i + 1}: ¿cómo lo llamas?
                    </label>
                    <input
                      id={`s-${s.id}-nombre`}
                      value={s.nombre}
                      placeholder="Por ejemplo: oficinas de 10 a 50 personas en el centro de Medellín"
                      onChange={(e) => cambiarSegmento(s.id, { nombre: e.target.value })}
                      className={CAMPO_INTERNO}
                    />
                    {esSegmentoGenerico(s.nombre) && (
                      <p role="alert" className="mt-1 text-xs text-ca-oro-texto">
                        Este grupo es muy amplio. Acótalo por edad, lugar, tamaño de empresa, sector u hábito de compra.
                      </p>
                    )}
                    {s.origen === 'formulacion' && <p className="mt-1 text-xs text-ca-oro-texto">Traído de tu formulación</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => quitarSegmento(s.id)}
                    aria-label={`Quitar el grupo ${i + 1}`}
                    className="mt-6 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ca-oro/40 text-ca-vino/80 hover:text-ca-vino-hondo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold" htmlFor={`s-${s.id}-nec`}>
                      Qué necesita o qué problema tiene
                    </label>
                    <textarea
                      id={`s-${s.id}-nec`}
                      rows={3}
                      value={s.necesidades}
                      onChange={(e) => cambiarSegmento(s.id, { necesidades: e.target.value })}
                      className={CAMPO_INTERNO}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold" htmlFor={`s-${s.id}-des`}>
                      Cómo es (características)
                    </label>
                    <textarea
                      id={`s-${s.id}-des`}
                      rows={3}
                      value={s.descripcion}
                      onChange={(e) => cambiarSegmento(s.id, { descripcion: e.target.value })}
                      className={CAMPO_INTERNO}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold" htmlFor={`s-${s.id}-cap`}>
                      Cuánto podría pagar (aproximado)
                    </label>
                    <input
                      id={`s-${s.id}-cap`}
                      value={s.capacidad_compra}
                      onChange={(e) => cambiarSegmento(s.id, { capacidad_compra: e.target.value })}
                      className={CAMPO_INTERNO}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold" htmlFor={`s-${s.id}-can`}>
                      Por dónde se le llega
                    </label>
                    <input
                      id={`s-${s.id}-can`}
                      value={s.canales}
                      placeholder="Redes, visitas, referidos, ferias…"
                      onChange={(e) => cambiarSegmento(s.id, { canales: e.target.value })}
                      className={CAMPO_INTERNO}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-semibold" htmlFor={`s-${s.id}-bar`}>
                    Qué le impide comprar (opcional)
                  </label>
                  <input
                    id={`s-${s.id}-bar`}
                    value={s.barreras}
                    placeholder="Precio, desconfianza, costumbre, falta de tiempo…"
                    onChange={(e) => cambiarSegmento(s.id, { barreras: e.target.value })}
                    className={CAMPO_INTERNO}
                  />
                </div>

                <fieldset className="mt-3">
                  <legend className="text-sm font-semibold">Qué papel tiene en la compra</legend>
                  <p className="text-xs text-ca-vino/75">Puede tener varios. A veces quien usa no es quien paga.</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ROLES.map((r) => {
                      const activo = s.roles.includes(r.valor)
                      return (
                        <label
                          key={r.valor}
                          title={r.ayuda}
                          className={`inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border px-3 text-sm ${
                            activo ? 'border-ca-oro bg-ca-oro-claro font-semibold text-ca-vino-hondo' : 'border-ca-oro/50 text-ca-vino'
                          }`}
                        >
                          <input type="checkbox" className="sr-only" checked={activo} onChange={() => alternarRol(s.id, r.valor)} />
                          {r.etiqueta}
                        </label>
                      )
                    })}
                  </div>
                </fieldset>

                <SelectorCondicion
                  valor={s.condicion}
                  onCambio={(c) => cambiarSegmento(s.id, { condicion: c })}
                  etiqueta={`grupo ${i + 1}`}
                />
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              setSegs((prev) => [...prev, segmentoVacio()])
              setSucio(true)
            }}
            className={botonSuave}
          >
            <Plus className="h-4 w-4" /> Agregar grupo de clientes
          </button>
        </Seccion>

        <section className={`mt-6 rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-5 ${RELIEVE_TARJETA}`}>
          <h2 className="text-xl font-extrabold">Revisión</h2>
          <p className="mt-1 text-sm text-ca-vino/75">
            {faltanObligatorios.length === 0
              ? 'Tienes lo necesario para pasar a la siguiente pantalla. Los pendientes recomendados puedes completarlos después.'
              : `Falta${faltanObligatorios.length === 1 ? '' : 'n'} ${faltanObligatorios.length} ${faltanObligatorios.length === 1 ? 'parte necesaria' : 'partes necesarias'}.`}
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
          {sinRespaldo > 0 && (
            <p className="mt-3 rounded-xl bg-ca-fondo p-3 text-sm">
              {sinRespaldo} {sinRespaldo === 1 ? 'dato está marcado' : 'datos están marcados'} como “{etiquetaCondicion('supuesto')}” o “
              {etiquetaCondicion('pendiente')}”. Compruébalos con entrevistas, encuestas o fuentes antes de tratarlos como hechos.
            </p>
          )}
          {faltanRecomendados.length > 0 && faltanObligatorios.length === 0 && (
            <p className="mt-3 text-xs text-ca-vino/75">Quedan {faltanRecomendados.length} detalles recomendados por completar.</p>
          )}
        </section>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button type="button" onClick={guardar} disabled={guardando} className={botonOro}>
            {guardando ? 'Guardando…' : 'Guardar estudio de mercado'}
          </button>
          {guardado && !sucio && (
            <Link href={`/empresarial/mercado/demanda?proyecto=${proyecto.id}`} className={botonSuave}>
              Seguir: demanda y tamaño
            </Link>
          )}
          {sucio && !guardando && <span className="text-sm text-ca-oro-texto">Tienes cambios sin guardar.</span>}
        </div>
        {aviso && (
          <div
            role={aviso.tipo === 'error' ? 'alert' : 'status'}
            className={`mt-4 rounded-2xl border p-4 text-sm ${
              aviso.tipo === 'error' ? 'border-ca-rojo/60 bg-ca-rojo/10' : 'border-ca-oro/60 bg-ca-fondo'
            }`}
          >
            {aviso.texto}
          </div>
        )}
        <p className="mt-6 text-xs text-ca-vino/75">
          Esto es una guía para ordenar tu información; no garantiza resultados. La demanda, el tamaño del mercado, la competencia, los
          precios y la proyección de ventas se trabajan en las siguientes pantallas.
        </p>
      </div>
    </main>
  )
}
