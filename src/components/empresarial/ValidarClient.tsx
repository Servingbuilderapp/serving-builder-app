'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  ESTADOS_HIPOTESIS,
  ESTADOS_QUE_EXIGEN_EVIDENCIA,
  EXPERIMENTOS_CON_PERSONAS,
  IMPORTANCIAS,
  NIVELES_EVIDENCIA,
  TIPOS_EVIDENCIA,
  TIPOS_EXPERIMENTO,
  TIPOS_HIPOTESIS,
  mejorNivel,
  puedeAfirmar,
  sugerirHipotesis,
  type Evidencia,
  type EstadoHipotesis,
  type Experimento,
  type Hipotesis,
  type HipotesisSugerida,
  type NivelEvidencia,
  type OportunidadFicha,
  type TipoEvidencia,
  type TipoHipotesis,
} from '@/lib/empresarial/hipotesis'

const RELIEVE_BOTON =
  'shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200'
const RELIEVE_TARJETA = 'shadow-[0_1px_2px_rgba(84,20,43,0.06),0_10px_28px_-14px_rgba(84,20,43,0.22)]'

const campoClase =
  'mt-1 w-full rounded-xl border border-ca-oro/40 bg-ca-fondo px-4 py-3 text-ca-vino placeholder:text-ca-vino/65 focus:outline-none focus:ring-2 focus:ring-ca-oro-claro'

interface OportunidadCorta extends OportunidadFicha {
  id: string
  estado: string
}

interface Props {
  proyecto: { id: string; nombre: string }
  oportunidadInicial: string | null
  oportunidades: OportunidadCorta[]
  hipotesisIniciales: Hipotesis[]
  experimentosIniciales: Experimento[]
  evidenciasIniciales: Evidencia[]
}

const COL_HIP = 'id, oportunidad_id, tipo, enunciado, importancia, riesgo_si_falsa, estado, fecha_limite, creada_en'
const COL_EXP =
  'id, hipotesis_id, tipo, objetivo, metodo, muestra, resultado, conclusion, declara_consentimiento, inicia_en, termina_en, creada_en'
const COL_EVI = 'id, oportunidad_id, hipotesis_id, experimento_id, enlace, fuente, tipo, nivel, descripcion, estado_revision, creada_en'

const nuevaEvidenciaVacia = {
  tipo: 'entrevista' as TipoEvidencia,
  nivel: 'E2' as NivelEvidencia,
  descripcion: '',
  fuente: '',
  enlace: '',
  experimento_id: '',
}
const nuevoExperimentoVacio = { tipo: TIPOS_EXPERIMENTO[0] as string, objetivo: '', metodo: '', muestra: '', consentimiento: false }

export function ValidarClient({
  proyecto,
  oportunidadInicial,
  oportunidades,
  hipotesisIniciales,
  experimentosIniciales,
  evidenciasIniciales,
}: Props) {
  const [oportunidadId, setOportunidadId] = useState<string>(
    oportunidades.find((o) => o.id === oportunidadInicial)?.id ?? oportunidades[0]?.id ?? '',
  )
  const [hipotesis, setHipotesis] = useState<Hipotesis[]>(hipotesisIniciales)
  const [experimentos, setExperimentos] = useState<Experimento[]>(experimentosIniciales)
  const [evidencias, setEvidencias] = useState<Evidencia[]>(evidenciasIniciales)
  const [error, aviso] = useState<string | null>(null)
  const [guardando, setGuardando] = useState<string | null>(null)
  const [nueva, setNueva] = useState({ tipo: 'problema' as TipoHipotesis, enunciado: '', importancia: 'alta', riesgo: '' })
  const [formEvidencia, setFormEvidencia] = useState<Record<string, typeof nuevaEvidenciaVacia>>({})
  const [formExperimento, setFormExperimento] = useState<Record<string, typeof nuevoExperimentoVacio>>({})

  const botonOro = `h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-ca-oro-claro to-ca-oro text-ca-vino-hondo font-extrabold disabled:opacity-50 disabled:cursor-not-allowed ${RELIEVE_BOTON}`
  const botonSuave = `h-12 px-5 inline-flex items-center justify-center gap-2 rounded-xl border border-ca-oro/50 bg-ca-tarjeta text-ca-vino font-semibold disabled:opacity-40 ${RELIEVE_BOTON}`

  const oportunidad = oportunidades.find((o) => o.id === oportunidadId)
  const deEsta = useMemo(() => hipotesis.filter((h) => h.oportunidad_id === oportunidadId), [hipotesis, oportunidadId])
  const sugeridas = useMemo(
    () => (oportunidad ? sugerirHipotesis(oportunidad, deEsta) : []),
    [oportunidad, deEsta],
  )
  const validadas = deEsta.filter((h) => h.estado === 'validada').length

  async function crearHipotesis(h: HipotesisSugerida | { tipo: TipoHipotesis; enunciado: string; importancia: string; riesgo_si_falsa: string }, clave: string) {
    aviso(null)
    setGuardando(clave)
    const supabase = createClient()
    const { data, error: e } = await supabase
      .from('sfpe_hipotesis')
      .insert({
        proyecto_id: proyecto.id,
        oportunidad_id: oportunidadId,
        tipo: h.tipo,
        enunciado: h.enunciado,
        importancia: h.importancia,
        riesgo_si_falsa: h.riesgo_si_falsa || null,
      })
      .select(COL_HIP)
      .single()
    setGuardando(null)
    if (e || !data) {
      aviso('No pudimos guardar la hipótesis. Intenta de nuevo.')
      return false
    }
    setHipotesis((prev) => [...prev, data as Hipotesis])
    return true
  }

  async function agregarMia() {
    if (!nueva.enunciado.trim()) return aviso('Escribe qué crees que es cierto.')
    const ok = await crearHipotesis(
      { tipo: nueva.tipo, enunciado: nueva.enunciado.trim(), importancia: nueva.importancia, riesgo_si_falsa: nueva.riesgo.trim() },
      'nueva',
    )
    if (ok) setNueva({ tipo: 'problema', enunciado: '', importancia: 'alta', riesgo: '' })
  }

  async function cambiarEstado(h: Hipotesis, estado: EstadoHipotesis) {
    aviso(null)
    const evH = evidencias.filter((e) => e.hipotesis_id === h.id)
    if (ESTADOS_QUE_EXIGEN_EVIDENCIA.includes(estado) && !puedeAfirmar(evH)) {
      return aviso('Para marcarla como validada necesitas al menos una evidencia (de nivel E1 o más). Agrégala abajo y vuelve a intentarlo.')
    }
    setGuardando(h.id)
    const supabase = createClient()
    const { error: e } = await supabase.from('sfpe_hipotesis').update({ estado }).eq('id', h.id)
    setGuardando(null)
    if (e) return aviso('No pudimos cambiar el estado. Intenta de nuevo.')
    setHipotesis((prev) => prev.map((x) => (x.id === h.id ? { ...x, estado } : x)))
  }

  async function agregarExperimento(h: Hipotesis) {
    const f = formExperimento[h.id] ?? nuevoExperimentoVacio
    if (!f.objetivo.trim()) return aviso('Cuenta qué quieres averiguar con este experimento.')
    const conPersonas = EXPERIMENTOS_CON_PERSONAS.includes(f.tipo)
    if (conPersonas && !f.consentimiento)
      return aviso('Marca que las personas que participan te dieron permiso. Es necesario antes de guardar este tipo de experimento.')
    aviso(null)
    setGuardando('exp' + h.id)
    const supabase = createClient()
    const { data, error: e } = await supabase
      .from('sfpe_experimentos')
      .insert({
        proyecto_id: proyecto.id,
        hipotesis_id: h.id,
        tipo: f.tipo,
        objetivo: f.objetivo.trim(),
        metodo: f.metodo.trim() || null,
        muestra: f.muestra.trim() || null,
        declara_consentimiento: f.consentimiento,
      })
      .select(COL_EXP)
      .single()
    setGuardando(null)
    if (e || !data) return aviso('No pudimos guardar el experimento. Intenta de nuevo.')
    setExperimentos((prev) => [...prev, data as Experimento])
    setFormExperimento((prev) => ({ ...prev, [h.id]: nuevoExperimentoVacio }))
  }

  function cambiarExperimento(id: string, clave: 'resultado' | 'conclusion', valor: string) {
    setExperimentos((prev) => prev.map((x) => (x.id === id ? { ...x, [clave]: valor } : x)))
  }

  async function guardarResultado(x: Experimento) {
    aviso(null)
    setGuardando(x.id)
    const supabase = createClient()
    const { error: e } = await supabase
      .from('sfpe_experimentos')
      .update({ resultado: x.resultado, conclusion: x.conclusion })
      .eq('id', x.id)
    setGuardando(null)
    if (e) aviso('No pudimos guardar el resultado. Intenta de nuevo.')
  }

  async function agregarEvidencia(h: Hipotesis) {
    const f = formEvidencia[h.id] ?? nuevaEvidenciaVacia
    if (!f.descripcion.trim()) return aviso('Describe qué muestra esta evidencia.')
    if (f.nivel !== 'E0' && !f.fuente.trim() && !f.enlace.trim())
      return aviso('Dinos de dónde salió: escribe la fuente o pega un enlace. No guardamos evidencias sin origen.')
    aviso(null)
    setGuardando('evi' + h.id)
    const supabase = createClient()
    const { data, error: e } = await supabase
      .from('sfpe_evidencias')
      .insert({
        proyecto_id: proyecto.id,
        oportunidad_id: oportunidadId,
        hipotesis_id: h.id,
        experimento_id: f.experimento_id || null,
        tipo: f.tipo,
        nivel: f.nivel,
        descripcion: f.descripcion.trim(),
        fuente: f.fuente.trim() || null,
        enlace: f.enlace.trim() || null,
      })
      .select(COL_EVI)
      .single()
    setGuardando(null)
    if (e || !data) return aviso('No pudimos guardar la evidencia. Intenta de nuevo.')
    setEvidencias((prev) => [...prev, data as Evidencia])
    setFormEvidencia((prev) => ({ ...prev, [h.id]: nuevaEvidenciaVacia }))
  }

  async function quitarEvidencia(ev: Evidencia, h: Hipotesis) {
    aviso(null)
    setGuardando(ev.id)
    const supabase = createClient()
    const { error: e } = await supabase.from('sfpe_evidencias').delete().eq('id', ev.id)
    if (e) {
      setGuardando(null)
      return aviso('No pudimos quitar la evidencia. Intenta de nuevo.')
    }
    const quedan = evidencias.filter((x) => x.id !== ev.id)
    setEvidencias(quedan)
    // Si ya no queda evidencia y la hipótesis estaba validada, vuelve a "Por comprobar".
    if (ESTADOS_QUE_EXIGEN_EVIDENCIA.includes(h.estado) && !puedeAfirmar(quedan.filter((x) => x.hipotesis_id === h.id))) {
      await supabase.from('sfpe_hipotesis').update({ estado: 'pendiente' }).eq('id', h.id)
      setHipotesis((prev) => prev.map((x) => (x.id === h.id ? { ...x, estado: 'pendiente' } : x)))
      aviso('Quitaste la única evidencia, así que la hipótesis volvió a “Por comprobar”.')
    }
    setGuardando(null)
  }

  const etiquetaTipo = (v: string) => TIPOS_HIPOTESIS.find((t) => t.valor === v)?.etiqueta ?? v

  return (
    <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino">
      <div className="max-w-[900px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <Link
          href={`/empresarial/oportunidades?proyecto=${proyecto.id}`}
          className="inline-flex items-center gap-2 text-sm text-ca-vino/75 hover:text-ca-vino-hondo"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a mis oportunidades
        </Link>

        <div className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-ca-oro-texto">Validar · {proyecto.nombre}</div>
        <h1 className="mt-3 text-3xl lg:text-4xl font-extrabold">¿Qué tienes que comprobar antes de apostarle?</h1>
        <p className="mt-3 text-ca-vino/80 leading-relaxed">
          Cada oportunidad se apoya en cosas que crees. Aquí las escribes como hipótesis, las pruebas con experimentos
          pequeños y guardas la evidencia. Una hipótesis solo queda validada cuando hay evidencia que lo respalde.
        </p>

        {error && (
          <div role="alert" className="mt-6 rounded-2xl border border-ca-rojo/60 bg-ca-rojo/10 p-4 text-sm">
            {error}
          </div>
        )}

        {oportunidades.length === 0 ? (
          <p className={`mt-8 rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-5 text-sm text-ca-vino/80 ${RELIEVE_TARJETA}`}>
            Primero guarda al menos una oportunidad para poder validarla.
          </p>
        ) : (
          <>
            <label className="mt-8 block text-sm font-semibold">
              Oportunidad que vas a validar
              <select className={campoClase} value={oportunidadId} onChange={(e) => setOportunidadId(e.target.value)}>
                {oportunidades.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.nombre}
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-2 text-sm text-ca-vino/75">
              {deEsta.length === 0
                ? 'Todavía no tiene hipótesis.'
                : `${validadas} de ${deEsta.length} hipótesis validadas.`}
            </p>

            {/* SUGERIDAS */}
            {sugeridas.length > 0 && (
              <section className="mt-10">
                <h2 className="text-xl font-extrabold">Hipótesis sugeridas</h2>
                <p className="mt-1 text-sm text-ca-vino/75">
                  Salen de la ficha de tu oportunidad. Guarda las que te sirvan; puedes cambiarlas después.
                </p>
                <div className="mt-4 space-y-3">
                  {sugeridas.map((s) => (
                    <div key={s.tipo + s.enunciado} className={`rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-5 ${RELIEVE_TARJETA}`}>
                      <div className="flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="rounded-full bg-ca-fondo border border-ca-oro/40 px-3 py-1">{etiquetaTipo(s.tipo)}</span>
                        <span className="rounded-full bg-ca-fondo border border-ca-oro/40 px-3 py-1">Importancia {s.importancia}</span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed">{s.enunciado}</p>
                      <p className="mt-1 text-xs text-ca-vino/75">Si fuera falsa: {s.riesgo_si_falsa}</p>
                      <button
                        type="button"
                        className={`${botonSuave} mt-4`}
                        disabled={guardando === s.tipo + s.enunciado}
                        onClick={() => crearHipotesis(s, s.tipo + s.enunciado)}
                      >
                        {guardando === s.tipo + s.enunciado ? 'Guardando…' : 'Guardar esta hipótesis'}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* MIS HIPÓTESIS */}
            <section className="mt-12">
              <h2 className="text-xl font-extrabold">Mis hipótesis</h2>
              {deEsta.length === 0 ? (
                <p className={`mt-4 rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-5 text-sm text-ca-vino/80 ${RELIEVE_TARJETA}`}>
                  Aún no hay hipótesis para esta oportunidad. Guarda una sugerida o escribe la tuya abajo.
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {deEsta.map((h) => {
                    const exps = experimentos.filter((x) => x.hipotesis_id === h.id)
                    const evs = evidencias.filter((x) => x.hipotesis_id === h.id)
                    const fe = formEvidencia[h.id] ?? nuevaEvidenciaVacia
                    const fx = formExperimento[h.id] ?? nuevoExperimentoVacio
                    const estado = ESTADOS_HIPOTESIS.find((s) => s.valor === h.estado)
                    return (
                      <details key={h.id} className={`rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-5 ${RELIEVE_TARJETA}`}>
                        <summary className="cursor-pointer list-none">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="font-bold">{h.enunciado}</div>
                            <div className="flex flex-wrap gap-2 text-xs font-semibold">
                              <span className="rounded-full bg-gradient-to-b from-ca-oro-claro to-ca-oro text-ca-vino-hondo px-3 py-1">
                                {estado?.etiqueta}
                              </span>
                              <span className="rounded-full bg-ca-fondo border border-ca-oro/40 px-3 py-1">{etiquetaTipo(h.tipo)}</span>
                              <span className="rounded-full bg-ca-fondo border border-ca-oro/40 px-3 py-1">
                                Evidencia {mejorNivel(evs)}
                              </span>
                            </div>
                          </div>
                          <p className="mt-2 text-xs text-ca-vino/75">
                            {exps.length} {exps.length === 1 ? 'experimento' : 'experimentos'} · {evs.length}{' '}
                            {evs.length === 1 ? 'evidencia' : 'evidencias'}. Ábrela para trabajarla.
                          </p>
                        </summary>

                        <div className="mt-5 space-y-6">
                          {h.riesgo_si_falsa && <p className="text-sm text-ca-vino/75">Si fuera falsa: {h.riesgo_si_falsa}</p>}

                          {/* ESTADO */}
                          <div>
                            <div className="text-sm font-bold">¿Cómo va?</div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {ESTADOS_HIPOTESIS.map((s) => {
                                const activo = h.estado === s.valor
                                return (
                                  <button
                                    key={s.valor}
                                    type="button"
                                    aria-pressed={activo}
                                    disabled={guardando === h.id}
                                    onClick={() => cambiarEstado(h, s.valor)}
                                    className={`rounded-xl border px-4 py-2 text-sm font-semibold ${RELIEVE_BOTON} ${
                                      activo ? 'border-ca-oro bg-gradient-to-b from-ca-oro-claro to-ca-oro text-ca-vino-hondo' : 'border-ca-oro/40 bg-ca-fondo'
                                    }`}
                                  >
                                    {s.etiqueta}
                                  </button>
                                )
                              })}
                            </div>
                            <p className="mt-2 text-xs text-ca-vino/75">
                              “Validada” y “Validada en parte” solo se permiten cuando hay al menos una evidencia.
                            </p>
                          </div>

                          {/* EXPERIMENTOS */}
                          <div className="border-t border-ca-oro/40 pt-5">
                            <div className="text-sm font-bold">Experimentos</div>
                            {exps.length === 0 && <p className="mt-2 text-sm text-ca-vino/75">Aún no has hecho ninguno.</p>}
                            <div className="mt-2 space-y-3">
                              {exps.map((x) => (
                                <div key={x.id} className="rounded-xl bg-ca-fondo p-4 text-sm space-y-3">
                                  <div className="font-semibold">{x.tipo}</div>
                                  <p className="text-ca-vino/80">Qué querías averiguar: {x.objetivo}</p>
                                  {x.metodo && <p className="text-ca-vino/75">Cómo: {x.metodo}</p>}
                                  {x.muestra && <p className="text-ca-vino/75">A quiénes: {x.muestra}</p>}
                                  <label className="block font-semibold">
                                    Qué encontraste
                                    <textarea
                                      rows={2}
                                      className={campoClase}
                                      value={x.resultado ?? ''}
                                      onChange={(e) => cambiarExperimento(x.id, 'resultado', e.target.value)}
                                    />
                                  </label>
                                  <label className="block font-semibold">
                                    Qué concluyes
                                    <textarea
                                      rows={2}
                                      className={campoClase}
                                      value={x.conclusion ?? ''}
                                      onChange={(e) => cambiarExperimento(x.id, 'conclusion', e.target.value)}
                                    />
                                  </label>
                                  <button type="button" className={botonSuave} disabled={guardando === x.id} onClick={() => guardarResultado(x)}>
                                    {guardando === x.id ? 'Guardando…' : 'Guardar resultado'}
                                  </button>
                                </div>
                              ))}
                            </div>

                            <div className="mt-4 rounded-xl border border-dashed border-ca-oro/40 p-4 space-y-3">
                              <div className="text-sm font-semibold">Nuevo experimento</div>
                              <label className="block text-sm font-semibold">
                                Tipo
                                <select
                                  className={campoClase}
                                  value={fx.tipo}
                                  onChange={(e) => setFormExperimento((p) => ({ ...p, [h.id]: { ...fx, tipo: e.target.value } }))}
                                >
                                  {TIPOS_EXPERIMENTO.map((t) => (
                                    <option key={t} value={t}>
                                      {t}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="block text-sm font-semibold">
                                Qué quieres averiguar
                                <input
                                  className={campoClase}
                                  value={fx.objetivo}
                                  onChange={(e) => setFormExperimento((p) => ({ ...p, [h.id]: { ...fx, objetivo: e.target.value } }))}
                                />
                              </label>
                              <label className="block text-sm font-semibold">
                                Cómo lo harás
                                <input
                                  className={campoClase}
                                  value={fx.metodo}
                                  onChange={(e) => setFormExperimento((p) => ({ ...p, [h.id]: { ...fx, metodo: e.target.value } }))}
                                />
                              </label>
                              <label className="block text-sm font-semibold">
                                A cuántas personas y quiénes
                                <input
                                  className={campoClase}
                                  value={fx.muestra}
                                  placeholder="Por ejemplo: 10 dueños de tiendas del barrio"
                                  onChange={(e) => setFormExperimento((p) => ({ ...p, [h.id]: { ...fx, muestra: e.target.value } }))}
                                />
                              </label>
                              {EXPERIMENTOS_CON_PERSONAS.includes(fx.tipo) && (
                                <label className="flex items-start gap-3 text-sm">
                                  <input
                                    type="checkbox"
                                    className="mt-1 h-4 w-4"
                                    checked={fx.consentimiento}
                                    onChange={(e) => setFormExperimento((p) => ({ ...p, [h.id]: { ...fx, consentimiento: e.target.checked } }))}
                                  />
                                  <span>Declaro que las personas que participan están de acuerdo y me dieron permiso para usar lo que cuenten.</span>
                                </label>
                              )}
                              <button type="button" className={botonSuave} disabled={guardando === 'exp' + h.id} onClick={() => agregarExperimento(h)}>
                                {guardando === 'exp' + h.id ? 'Guardando…' : 'Guardar experimento'}
                              </button>
                            </div>
                          </div>

                          {/* EVIDENCIAS */}
                          <div className="border-t border-ca-oro/40 pt-5">
                            <div className="text-sm font-bold">Evidencias</div>
                            {evs.length === 0 && <p className="mt-2 text-sm text-ca-vino/75">Aún no hay evidencias.</p>}
                            <ul className="mt-2 space-y-2">
                              {evs.map((ev) => (
                                <li key={ev.id} className="rounded-xl bg-ca-fondo px-4 py-3 text-sm">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="font-semibold">
                                      {TIPOS_EVIDENCIA.find((t) => t.valor === ev.tipo)?.etiqueta} · {ev.nivel}
                                    </span>
                                    <button
                                      type="button"
                                      className="text-xs underline text-ca-vino/75 hover:text-ca-vino-hondo disabled:opacity-40"
                                      disabled={guardando === ev.id}
                                      onClick={() => quitarEvidencia(ev, h)}
                                    >
                                      Quitar
                                    </button>
                                  </div>
                                  <p className="mt-1 text-ca-vino/85">{ev.descripcion}</p>
                                  {(ev.fuente || ev.enlace) && (
                                    <p className="mt-1 text-xs text-ca-vino/75 break-words">
                                      Fuente: {ev.fuente}
                                      {ev.fuente && ev.enlace ? ' · ' : ''}
                                      {ev.enlace}
                                    </p>
                                  )}
                                </li>
                              ))}
                            </ul>

                            <div className="mt-4 rounded-xl border border-dashed border-ca-oro/40 p-4 space-y-3">
                              <div className="text-sm font-semibold">Nueva evidencia</div>
                              <label className="block text-sm font-semibold">
                                Tipo
                                <select
                                  className={campoClase}
                                  value={fe.tipo}
                                  onChange={(e) => setFormEvidencia((p) => ({ ...p, [h.id]: { ...fe, tipo: e.target.value as TipoEvidencia } }))}
                                >
                                  {TIPOS_EVIDENCIA.map((t) => (
                                    <option key={t.valor} value={t.valor}>
                                      {t.etiqueta}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="block text-sm font-semibold">
                                Qué tan sólida es
                                <span className="block text-xs font-normal text-ca-vino/75">
                                  {NIVELES_EVIDENCIA.find((n) => n.valor === fe.nivel)?.ayuda}
                                </span>
                                <select
                                  className={campoClase}
                                  value={fe.nivel}
                                  onChange={(e) => setFormEvidencia((p) => ({ ...p, [h.id]: { ...fe, nivel: e.target.value as NivelEvidencia } }))}
                                >
                                  {NIVELES_EVIDENCIA.map((n) => (
                                    <option key={n.valor} value={n.valor}>
                                      {n.etiqueta}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="block text-sm font-semibold">
                                Qué muestra
                                <textarea
                                  rows={2}
                                  className={campoClase}
                                  value={fe.descripcion}
                                  onChange={(e) => setFormEvidencia((p) => ({ ...p, [h.id]: { ...fe, descripcion: e.target.value } }))}
                                />
                              </label>
                              <label className="block text-sm font-semibold">
                                De dónde salió
                                <input
                                  className={campoClase}
                                  value={fe.fuente}
                                  placeholder="Persona, documento, organización…"
                                  onChange={(e) => setFormEvidencia((p) => ({ ...p, [h.id]: { ...fe, fuente: e.target.value } }))}
                                />
                              </label>
                              <label className="block text-sm font-semibold">
                                Enlace (opcional)
                                <input
                                  className={campoClase}
                                  value={fe.enlace}
                                  onChange={(e) => setFormEvidencia((p) => ({ ...p, [h.id]: { ...fe, enlace: e.target.value } }))}
                                />
                              </label>
                              {exps.length > 0 && (
                                <label className="block text-sm font-semibold">
                                  ¿Viene de un experimento? (opcional)
                                  <select
                                    className={campoClase}
                                    value={fe.experimento_id}
                                    onChange={(e) => setFormEvidencia((p) => ({ ...p, [h.id]: { ...fe, experimento_id: e.target.value } }))}
                                  >
                                    <option value="">No</option>
                                    {exps.map((x) => (
                                      <option key={x.id} value={x.id}>
                                        {x.tipo}: {x.objetivo}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                              )}
                              <button type="button" className={botonSuave} disabled={guardando === 'evi' + h.id} onClick={() => agregarEvidencia(h)}>
                                {guardando === 'evi' + h.id ? 'Guardando…' : 'Guardar evidencia'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </details>
                    )
                  })}
                </div>
              )}
            </section>

            {/* AGREGAR LA MÍA */}
            <section className="mt-12">
              <h2 className="text-xl font-extrabold">Agregar una hipótesis mía</h2>
              <div className={`mt-4 rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-5 space-y-4 ${RELIEVE_TARJETA}`}>
                <label className="block text-sm font-semibold">
                  Sobre qué es
                  <select className={campoClase} value={nueva.tipo} onChange={(e) => setNueva({ ...nueva, tipo: e.target.value as TipoHipotesis })}>
                    {TIPOS_HIPOTESIS.map((t) => (
                      <option key={t.valor} value={t.valor}>
                        {t.etiqueta}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-semibold">
                  Qué crees que es cierto
                  <textarea
                    rows={2}
                    className={campoClase}
                    value={nueva.enunciado}
                    placeholder="Por ejemplo: los tenderos pagarían $50.000 al mes por reducir el desperdicio"
                    onChange={(e) => setNueva({ ...nueva, enunciado: e.target.value })}
                  />
                </label>
                <label className="block text-sm font-semibold">
                  Qué tan importante es
                  <select className={campoClase} value={nueva.importancia} onChange={(e) => setNueva({ ...nueva, importancia: e.target.value })}>
                    {IMPORTANCIAS.map((i) => (
                      <option key={i.valor} value={i.valor}>
                        {i.etiqueta}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-semibold">
                  Qué pasaría si fuera falsa (opcional)
                  <input className={campoClase} value={nueva.riesgo} onChange={(e) => setNueva({ ...nueva, riesgo: e.target.value })} />
                </label>
                <button type="button" className={botonOro} disabled={guardando === 'nueva'} onClick={agregarMia}>
                  {guardando === 'nueva' ? 'Guardando…' : 'Guardar hipótesis'}
                </button>
              </div>
            </section>
          </>
        )}

        <p className="mt-12 text-center text-sm text-ca-vino/75">
          Esta pantalla no valida nada por sí sola: te ayuda a ordenar lo que debes comprobar. La evidencia la pones tú, y
          cada una debe tener su origen.
        </p>
      </div>
    </main>
  )
}
