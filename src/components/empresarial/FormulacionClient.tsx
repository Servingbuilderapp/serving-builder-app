'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Sparkles, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  CONDICIONES,
  ESTADO_HIPOTESIS,
  TIPOS_PROYECTO,
  TIPO_HIPOTESIS,
  datosSinRespaldo,
  etiquetaCondicion,
  nuevoId,
  revisarFormulacion,
  type CampoTexto,
  type Condicion,
  type Formulacion,
  type HipotesisOrigen,
  type ItemFormulacion,
  type OrigenItem,
  type TipoItem,
} from '@/lib/empresarial/formulacion'
import type { SugerenciasFormulacion } from '@/lib/empresarial/iaFormulacion'

const RELIEVE_BOTON =
  'shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200'
const RELIEVE_TARJETA = 'shadow-[0_1px_2px_rgba(84,20,43,0.06),0_10px_28px_-14px_rgba(84,20,43,0.22)]'

interface Props {
  proyecto: { id: string; nombre: string; estado: string; profundidad: string | null; moneda: string | null }
  oportunidad: { id: string; nombre: string; proyectoOrigenId: string } | null
  formulacionInicial: Formulacion
  itemsIniciales: ItemFormulacion[]
  yaGuardada: boolean
  comprobadas: HipotesisOrigen[]
  pendientes: HipotesisOrigen[]
}

const CAMPO_ENTRADA =
  'mt-2 w-full rounded-xl border border-ca-oro/40 bg-ca-fondo px-4 py-3 text-ca-vino placeholder:text-ca-vino/65 focus:outline-none focus:ring-2 focus:ring-ca-oro-claro'

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

export function FormulacionClient({
  proyecto,
  oportunidad,
  formulacionInicial,
  itemsIniciales,
  yaGuardada,
  comprobadas,
  pendientes,
}: Props) {
  const [f, setF] = useState<Formulacion>(formulacionInicial)
  const [nombre, setNombre] = useState(proyecto.nombre)
  const [items, setItems] = useState<ItemFormulacion[]>(itemsIniciales)
  const [idsGuardados, setIdsGuardados] = useState<string[]>(yaGuardada ? itemsIniciales.map((i) => i.id) : [])
  const [guardada, setGuardada] = useState(yaGuardada)
  const [sucio, setSucio] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)
  const [pensandoIA, setPensandoIA] = useState(false)
  const [errorIA, setErrorIA] = useState<string | null>(null)
  const [sugerencias, setSugerencias] = useState<SugerenciasFormulacion | null>(null)

  const botonOro = `h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-ca-oro-claro to-ca-oro text-ca-vino-hondo font-extrabold disabled:opacity-50 disabled:cursor-not-allowed ${RELIEVE_BOTON}`
  const botonSuave = `h-11 px-4 inline-flex items-center justify-center gap-2 rounded-xl border border-ca-oro/50 bg-ca-tarjeta text-ca-vino font-semibold disabled:opacity-40 ${RELIEVE_BOTON}`

  const revision = useMemo(() => revisarFormulacion(f, items), [f, items])
  const faltanObligatorios = revision.filter((r) => r.obligatorio && !r.cumple)
  const faltanRecomendados = revision.filter((r) => !r.obligatorio && !r.cumple)
  const sinRespaldo = datosSinRespaldo(f, items)

  function cambiarTexto(campo: keyof Omit<Formulacion, 'condiciones'>, valor: string) {
    setF((prev) => ({ ...prev, [campo]: valor }))
    setSucio(true)
  }
  function cambiarCondicion(campo: CampoTexto, c: Condicion) {
    setF((prev) => ({ ...prev, condiciones: { ...prev.condiciones, [campo]: c } }))
    setSucio(true)
  }
  function agregarItem(tipo: TipoItem, texto = '', origen: OrigenItem = 'persona', condicion: Condicion = 'aportado') {
    setItems((prev) => [...prev, { id: nuevoId(), tipo, texto, condicion, origen }])
    setSucio(true)
  }
  function cambiarItem(id: string, cambios: Partial<ItemFormulacion>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...cambios } : i)))
    setSucio(true)
  }
  function quitarItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
    setSucio(true)
  }

  async function guardar() {
    setAviso(null)
    setGuardando(true)
    const supabase = createClient()
    const meses = f.duracion_meses.trim() ? Number(f.duracion_meses) : null
    if (meses !== null && (!Number.isInteger(meses) || meses < 1 || meses > 240)) {
      setGuardando(false)
      return setAviso({ tipo: 'error', texto: 'La duración debe ser un número de meses entre 1 y 240.' })
    }
    if (!nombre.trim()) {
      setGuardando(false)
      return setAviso({ tipo: 'error', texto: 'El proyecto necesita un nombre.' })
    }

    const { error: e1 } = await supabase.from('sfpe_formulacion').upsert(
      {
        proyecto_id: proyecto.id,
        oportunidad_id: oportunidad?.id ?? null,
        tipo_proyecto: f.tipo_proyecto || null,
        sector: f.sector.trim() || null,
        ubicacion: f.ubicacion.trim() || null,
        duracion_meses: meses,
        problema: f.problema.trim() || null,
        justificacion: f.justificacion.trim() || null,
        antecedentes: f.antecedentes.trim() || null,
        objetivo_general: f.objetivo_general.trim() || null,
        alcance: f.alcance.trim() || null,
        exclusiones: f.exclusiones.trim() || null,
        condiciones: f.condiciones,
        actualizada_en: new Date().toISOString(),
      },
      { onConflict: 'proyecto_id' },
    )
    if (e1) {
      setGuardando(false)
      return setAviso({ tipo: 'error', texto: 'No pudimos guardar la formulación. Intenta de nuevo.' })
    }

    const { error: eNombre } = await supabase
      .from('sfpe_proyectos')
      .update({ nombre: nombre.trim(), actualizada_en: new Date().toISOString() })
      .eq('id', proyecto.id)

    // Listas: se guardan las que tienen texto, con su orden dentro de cada tipo.
    const conTexto = items.filter((i) => i.texto.trim())
    const contador: Record<string, number> = {}
    const filas = conTexto.map((i) => {
      contador[i.tipo] = (contador[i.tipo] ?? 0) + 1
      const id = i.id.startsWith('nuevo-') ? crypto.randomUUID() : i.id
      return {
        fila: {
          id,
          proyecto_id: proyecto.id,
          tipo: i.tipo,
          texto: i.texto.trim(),
          condicion: i.condicion,
          origen: i.origen,
          orden: contador[i.tipo],
        },
        anterior: i.id,
      }
    })
    if (filas.length > 0) {
      const { error: e2 } = await supabase.from('sfpe_formulacion_items').upsert(filas.map((x) => x.fila), { onConflict: 'id' })
      if (e2) {
        setGuardando(false)
        return setAviso({
          tipo: 'error',
          texto: 'Se guardó el texto, pero no pudimos guardar las listas (objetivos, beneficiarios o resultados). Intenta de nuevo.',
        })
      }
    }
    const nuevosIds = filas.map((x) => x.fila.id)
    const borrar = idsGuardados.filter((id) => !nuevosIds.includes(id))
    if (borrar.length > 0) {
      await supabase.from('sfpe_formulacion_items').delete().in('id', borrar)
    }

    const mapa = new Map(filas.map((x) => [x.anterior, x.fila.id]))
    setItems(conTexto.map((i) => ({ ...i, id: mapa.get(i.id) ?? i.id })))
    setIdsGuardados(nuevosIds)
    setGuardada(true)
    setSucio(false)
    setGuardando(false)
    setAviso({
      tipo: 'ok',
      texto: eNombre
        ? 'Formulación guardada. El nombre del proyecto no se pudo cambiar; intenta de nuevo.'
        : 'Formulación guardada.',
    })
  }

  async function pedirIA() {
    setErrorIA(null)
    setSugerencias(null)
    setPensandoIA(true)
    try {
      const r = await fetch('/api/empresarial/ia-formulacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proyecto_id: proyecto.id }),
      })
      const datos = (await r.json().catch(() => null)) as { error?: string; mensaje?: string; sugerencias?: SugerenciasFormulacion } | null
      if (!r.ok || !datos?.sugerencias) {
        setErrorIA(datos?.error ?? 'La IA no pudo responder ahora.')
      } else {
        setSugerencias(datos.sugerencias)
        if (datos.mensaje) setErrorIA(datos.mensaje)
      }
    } catch {
      setErrorIA('No pudimos comunicarnos con la IA. Revisa tu conexión.')
    }
    setPensandoIA(false)
  }

  function usarCampo(campo: 'justificacion' | 'objetivo_general' | 'alcance' | 'exclusiones') {
    const texto = sugerencias?.campos[campo]
    if (!texto) return
    setF((prev) => ({ ...prev, [campo]: texto, condiciones: { ...prev.condiciones, [campo]: 'supuesto' } }))
    setSucio(true)
    setSugerencias((prev) => (prev ? { ...prev, campos: { ...prev.campos, [campo]: undefined } } : prev))
  }
  function usarLista(tipo: 'objetivo_especifico' | 'resultado', texto: string) {
    agregarItem(tipo, texto, 'ia', 'supuesto')
    setSugerencias((prev) =>
      prev
        ? {
            ...prev,
            objetivos_especificos: tipo === 'objetivo_especifico' ? prev.objetivos_especificos.filter((x) => x !== texto) : prev.objetivos_especificos,
            resultados: tipo === 'resultado' ? prev.resultados.filter((x) => x !== texto) : prev.resultados,
          }
        : prev,
    )
  }

  const campoLargo = (campo: CampoTexto, etiqueta: string, ayuda: string, filas = 4) => (
    <div>
      <label className="block font-semibold" htmlFor={`f-${campo}`}>
        {etiqueta}
      </label>
      <p className="text-xs text-ca-vino/75">{ayuda}</p>
      <textarea
        id={`f-${campo}`}
        rows={filas}
        value={f[campo]}
        onChange={(e) => cambiarTexto(campo, e.target.value)}
        className={CAMPO_ENTRADA}
      />
      <SelectorCondicion valor={f.condiciones[campo] ?? 'aportado'} onCambio={(c) => cambiarCondicion(campo, c)} etiqueta={etiqueta} />
      {sugerencias?.campos[campo as 'justificacion' | 'objetivo_general' | 'alcance' | 'exclusiones'] && (
        <CajaSugerencia
          texto={sugerencias.campos[campo as 'justificacion' | 'objetivo_general' | 'alcance' | 'exclusiones'] as string}
          onUsar={() => usarCampo(campo as 'justificacion' | 'objetivo_general' | 'alcance' | 'exclusiones')}
          botonSuave={botonSuave}
        />
      )}
    </div>
  )

  const lista = (tipo: TipoItem, etiquetaAgregar: string, marcador: string, conCondicion: boolean, sugeridos: string[]) => {
    const propios = items.filter((i) => i.tipo === tipo)
    return (
      <div>
        {propios.length === 0 && <p className="text-sm text-ca-vino/75">Todavía no hay ninguno.</p>}
        <ul className="space-y-3">
          {propios.map((i) => (
            <li key={i.id} className="rounded-xl bg-ca-fondo p-3">
              <div className="flex items-start gap-2">
                <textarea
                  aria-label={marcador}
                  rows={2}
                  value={i.texto}
                  placeholder={marcador}
                  onChange={(e) => cambiarItem(i.id, { texto: e.target.value })}
                  className="w-full rounded-lg border border-ca-oro/40 bg-ca-tarjeta px-3 py-2 text-ca-vino placeholder:text-ca-vino/65 focus:outline-none focus:ring-2 focus:ring-ca-oro-claro"
                />
                <button
                  type="button"
                  onClick={() => quitarItem(i.id)}
                  aria-label="Quitar"
                  className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ca-oro/40 text-ca-vino/80 hover:text-ca-vino-hondo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {i.origen !== 'persona' && (
                <p className="mt-1 text-xs text-ca-oro-texto">
                  {i.origen === 'ia' ? 'Sugerido por la IA · no cuenta como evidencia' : 'Traído de tu oportunidad'}
                </p>
              )}
              {conCondicion && (
                <SelectorCondicion valor={i.condicion} onCambio={(c) => cambiarItem(i.id, { condicion: c })} etiqueta={marcador} />
              )}
            </li>
          ))}
        </ul>
        {sugeridos.length > 0 && (
          <div className="mt-3 space-y-2">
            {sugeridos.map((s) => (
              <CajaSugerencia
                key={s}
                texto={s}
                onUsar={() => usarLista(tipo as 'objetivo_especifico' | 'resultado', s)}
                botonSuave={botonSuave}
                etiquetaBoton="Agregar a la lista"
              />
            ))}
          </div>
        )}
        <button type="button" onClick={() => agregarItem(tipo)} className={`mt-3 ${botonSuave}`}>
          <Plus className="h-4 w-4" /> {etiquetaAgregar}
        </button>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino">
      <div className="max-w-[900px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        {oportunidad ? (
          <Link
            href={`/empresarial/oportunidades?proyecto=${oportunidad.proyectoOrigenId}`}
            className="inline-flex items-center gap-2 text-sm text-ca-vino/75 hover:text-ca-vino-hondo"
          >
            <ArrowLeft className="h-4 w-4" /> Volver a mis oportunidades
          </Link>
        ) : (
          <Link href="/empresarial" className="inline-flex items-center gap-2 text-sm text-ca-vino/75 hover:text-ca-vino-hondo">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
        )}

        <div className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-ca-oro-texto">Formulación · {nombre || proyecto.nombre}</div>
        <h1 className="mt-3 text-3xl lg:text-4xl font-extrabold">Formula tu proyecto</h1>
        <p className="mt-3 text-ca-vino/80 leading-relaxed">
          Aquí describes tu proyecto con claridad: qué problema atiende, para quién, qué quieres lograr y hasta dónde llega.
          Cada dato dice qué tan seguro es, para que nadie confunda lo comprobado con lo que solo se supone.
        </p>

        {!guardada && (
          <div className="mt-6 rounded-2xl border border-ca-oro/60 bg-ca-fondo p-4 text-sm">
            <p className="font-semibold">Este es un borrador.</p>
            <p className="mt-1 text-ca-vino/80">
              {oportunidad
                ? `Copiamos lo que ya trabajaste en “${oportunidad.nombre}”, sin agregar nada nuevo. Revísalo, complétalo y pulsa “Guardar formulación”. Hasta que lo guardes, nada queda registrado.`
                : 'Escribe cada parte y pulsa “Guardar formulación”. Hasta que lo guardes, nada queda registrado.'}
            </p>
          </div>
        )}

        {/* Lo que ya se comprobó */}
        {(comprobadas.length > 0 || pendientes.length > 0) && (
          <section className={`mt-6 rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-5 ${RELIEVE_TARJETA}`}>
            <h2 className="text-lg font-extrabold">Lo que ya comprobaste en tu oportunidad</h2>
            <p className="mt-1 text-sm text-ca-vino/75">Solo lectura. Es lo que respalda o todavía no respalda tu proyecto.</p>
            {comprobadas.length > 0 && (
              <ul className="mt-3 space-y-2 text-sm">
                {comprobadas.map((h) => (
                  <li key={h.id} className="rounded-xl bg-ca-fondo p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-gradient-to-b from-ca-oro-claro to-ca-oro px-3 py-0.5 text-xs font-semibold text-ca-vino-hondo">
                        {ESTADO_HIPOTESIS[h.estado] ?? h.estado}
                      </span>
                      <span className="text-xs text-ca-vino/75">{TIPO_HIPOTESIS[h.tipo] ?? h.tipo}</span>
                    </div>
                    <p className="mt-1">{h.enunciado}</p>
                    <p className="mt-1 text-xs text-ca-vino/75">
                      {h.evidencias.length === 0
                        ? 'Sin evidencia registrada.'
                        : `${h.evidencias.length} ${h.evidencias.length === 1 ? 'evidencia' : 'evidencias'}: ${h.evidencias
                            .map((e) => e.descripcion || e.fuente || e.tipo)
                            .slice(0, 2)
                            .join('; ')}`}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            {pendientes.length > 0 && (
              <>
                <p className="mt-4 text-sm font-semibold">Aún sin comprobar</p>
                <ul className="mt-2 space-y-2 text-sm">
                  {pendientes.map((h) => (
                    <li key={h.id} className="rounded-xl border border-dashed border-ca-oro/50 p-3 text-ca-vino/85">
                      {h.enunciado} <span className="text-xs text-ca-vino/75">({ESTADO_HIPOTESIS[h.estado] ?? h.estado})</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )}

        {/* IA */}
        <section className={`mt-6 rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-5 ${RELIEVE_TARJETA}`}>
          <h2 className="text-lg font-extrabold">Ayuda de la IA (opcional)</h2>
          <p className="mt-1 text-sm text-ca-vino/75">
            Propone texto solo para lo que esté vacío, usando únicamente lo que ya escribiste. No inventa cifras ni fuentes. Lo que
            propone es un supuesto: tú decides si lo usas.
          </p>
          <button type="button" onClick={pedirIA} disabled={pensandoIA || !guardada} className={`mt-3 ${botonSuave}`}>
            <Sparkles className="h-4 w-4" /> {pensandoIA ? 'Pensando…' : 'Sugerir lo que falta'}
          </button>
          {!guardada && <p className="mt-2 text-xs text-ca-vino/75">Primero guarda tu formulación: la IA lee lo guardado.</p>}
          {guardada && sucio && (
            <p className="mt-2 text-xs text-ca-vino/75">Tienes cambios sin guardar; la IA solo ve lo último que guardaste.</p>
          )}
          {errorIA && (
            <p role="alert" className="mt-3 rounded-xl bg-ca-fondo p-3 text-sm">
              {errorIA}
            </p>
          )}
          {sugerencias && !errorIA && (
            <p className="mt-3 text-sm text-ca-vino/80">Las sugerencias aparecen debajo de cada parte, marcadas como “Sugerida por la IA”.</p>
          )}
        </section>

        <Seccion titulo="Identificación" ayuda="Datos básicos para reconocer tu proyecto.">
          <div>
            <label className="block font-semibold" htmlFor="f-nombre">
              Nombre del proyecto
            </label>
            <input
              id="f-nombre"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value)
                setSucio(true)
              }}
              className={CAMPO_ENTRADA}
            />
          </div>
          <div>
            <label className="block font-semibold" htmlFor="f-tipo">
              Tipo de proyecto
            </label>
            <select
              id="f-tipo"
              value={f.tipo_proyecto}
              onChange={(e) => cambiarTexto('tipo_proyecto', e.target.value)}
              className={CAMPO_ENTRADA}
            >
              <option value="">Elige uno…</option>
              {TIPOS_PROYECTO.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="block font-semibold" htmlFor="f-sector">
                Sector
              </label>
              <input id="f-sector" value={f.sector} onChange={(e) => cambiarTexto('sector', e.target.value)} className={CAMPO_ENTRADA} />
            </div>
            <div>
              <label className="block font-semibold" htmlFor="f-ubicacion">
                Dónde
              </label>
              <input
                id="f-ubicacion"
                value={f.ubicacion}
                onChange={(e) => cambiarTexto('ubicacion', e.target.value)}
                className={CAMPO_ENTRADA}
              />
            </div>
            <div>
              <label className="block font-semibold" htmlFor="f-meses">
                Duración (meses)
              </label>
              <input
                id="f-meses"
                inputMode="numeric"
                value={f.duracion_meses}
                onChange={(e) => cambiarTexto('duracion_meses', e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="Aproximada"
                className={CAMPO_ENTRADA}
              />
            </div>
          </div>
          <p className="text-xs text-ca-vino/75">
            Profundidad: {proyecto.profundidad ?? 'sin definir'}
            {proyecto.moneda ? ` · Moneda: ${proyecto.moneda}` : ''}. Vienen de tu proyecto de origen.
          </p>
        </Seccion>

        <Seccion
          titulo="Problema u oportunidad y justificación"
          ayuda="Describe la situación, no la solución. Ejemplo: “los pedidos se demoran y se pierden clientes”, no “necesitamos una app”."
        >
          {campoLargo('problema', 'Qué situación se quiere resolver o aprovechar', 'A quién afecta, dónde, desde cuándo y qué consecuencias tiene.', 5)}
          {campoLargo('justificacion', 'Por qué vale la pena hacerlo', 'Qué valor genera, quién se beneficia y por qué actuar ahora.', 4)}
        </Seccion>

        <Seccion titulo="Antecedentes" ayuda="Lo que ya se sabe o se comprobó antes de formular.">
          {campoLargo('antecedentes', 'Qué se sabe hasta ahora', 'Intentos previos, datos que ya tienes, pruebas que hiciste.', 5)}
        </Seccion>

        <Seccion titulo="Beneficiarios o clientes" ayuda="Las personas o grupos para quienes el proyecto genera valor.">
          {lista('beneficiario', 'Agregar beneficiario o cliente', 'Por ejemplo: pequeñas tiendas de barrio en Medellín', true, [])}
        </Seccion>

        <Seccion titulo="Objetivos" ayuda="Un objetivo dice qué quieres lograr. Empieza con un verbo: Crear, Reducir, Aumentar…">
          {campoLargo('objetivo_general', 'Objetivo general', 'El cambio principal que quieres conseguir, en una sola frase.', 3)}
          <div>
            <div className="font-semibold">Objetivos específicos</div>
            <p className="mb-3 text-xs text-ca-vino/75">Cada uno es un paso que ayuda a lograr el objetivo general.</p>
            {lista('objetivo_especifico', 'Agregar objetivo específico', 'Por ejemplo: Reducir el tiempo de atención de pedidos', false, sugerencias?.objetivos_especificos ?? [])}
          </div>
        </Seccion>

        <Seccion titulo="Alcance" ayuda="Hasta dónde llega el proyecto y hasta dónde no.">
          {campoLargo('alcance', 'Qué incluye el proyecto', 'Lo que sí se va a hacer o entregar.', 4)}
          {campoLargo('exclusiones', 'Qué NO incluye (opcional)', 'Lo que queda por fuera, para evitar malentendidos.', 3)}
        </Seccion>

        <Seccion titulo="Resultados esperados" ayuda="Cambios que se podrán comprobar cuando el proyecto termine. Los indicadores se definen en otra etapa.">
          {lista('resultado', 'Agregar resultado esperado', 'Por ejemplo: Los pedidos se atienden en menos tiempo', true, sugerencias?.resultados ?? [])}
        </Seccion>

        {/* Revisión */}
        <section className={`mt-6 rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-5 ${RELIEVE_TARJETA}`}>
          <h2 className="text-xl font-extrabold">Revisión</h2>
          <p className="mt-1 text-sm text-ca-vino/75">
            {faltanObligatorios.length === 0
              ? 'Tienes lo necesario para seguir. Los pendientes recomendados puedes completarlos después.'
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
              {etiquetaCondicion('pendiente')}”. Compruébalos antes de tratarlos como hechos.
            </p>
          )}
          {faltanRecomendados.length > 0 && faltanObligatorios.length === 0 && (
            <p className="mt-3 text-xs text-ca-vino/75">Quedan {faltanRecomendados.length} detalles recomendados por completar.</p>
          )}
        </section>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button type="button" onClick={guardar} disabled={guardando} className={botonOro}>
            {guardando ? 'Guardando…' : 'Guardar formulación'}
          </button>
          {sucio && !guardando && <span className="text-sm text-ca-oro-texto">Tienes cambios sin guardar.</span>}
          {guardada && !sucio && (
            <Link href={`/empresarial/mercado?proyecto=${proyecto.id}`} className={botonSuave}>
              Seguir con el estudio de mercado
            </Link>
          )}
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
          Esto es una guía para ordenar tus ideas; no garantiza resultados. Las siguientes etapas (mercado, técnico, financiero y
          documento final) se trabajan aparte.
        </p>
      </div>
    </main>
  )
}

function CajaSugerencia({
  texto,
  onUsar,
  botonSuave,
  etiquetaBoton = 'Usar este texto',
}: {
  texto: string
  onUsar: () => void
  botonSuave: string
  etiquetaBoton?: string
}) {
  return (
    <div className="mt-3 rounded-xl border border-dashed border-ca-oro/70 bg-ca-fondo p-3 text-sm">
      <div className="text-xs font-semibold text-ca-oro-texto">Sugerida por la IA · es un supuesto, no evidencia</div>
      <p className="mt-1">{texto}</p>
      <button type="button" onClick={onUsar} className={`mt-2 ${botonSuave}`}>
        {etiquetaBoton}
      </button>
    </div>
  )
}
