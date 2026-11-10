'use client'

import React, { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  calcularDiagnostico,
  type EstadoRespuesta,
  type ResultadoDiagnostico,
} from '@/lib/empresarial/calculoDiagnostico'

const RELIEVE_BOTON =
  'shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200'
const RELIEVE_TARJETA = 'shadow-[0_1px_2px_rgba(11,42,74,0.06),0_10px_28px_-14px_rgba(11,42,74,0.22)]'

interface Dimension {
  id: string
  codigo: string
  nombre: string
  descripcion: string | null
  peso: number
  orden: number
}
interface Pregunta {
  id: string
  dimension_id: string
  codigo: string
  texto: string
  ayuda: string | null
  tipo: string
  anclajes: Record<string, string> | null
  peso: number
  orden: number
}
interface RespuestaGuardada {
  pregunta_id: string
  estado_respuesta: string
  valor: number | null
  texto: string | null
}
interface Props {
  proyecto: { id: string; nombre: string }
  perfil: 'A' | 'C' | 'D'
  plantillaId: string
  metodologiaId: string | null
  dimensiones: Dimension[]
  preguntas: Pregunta[]
  sesionId: string | null
  respuestasIniciales: RespuestaGuardada[]
}

/** Niveles de madurez: solo para negocios en marcha (perfiles C y D). */
const NIVELES = [
  { valor: 1, nombre: 'Inicial', texto: 'No hay práctica estructurada o es improvisada.' },
  { valor: 2, nombre: 'Básico', texto: 'Prácticas elementales, informales o inconsistentes.' },
  { valor: 3, nombre: 'En desarrollo', texto: 'Procesos definidos, aplicados o medidos en parte.' },
  { valor: 4, nombre: 'Consolidado', texto: 'Documentado, aplicado y controlado con regularidad.' },
  { valor: 5, nombre: 'Avanzado', texto: 'Optimizado con datos, evaluación y mejora continua.' },
]

/** Perfil A: se mide la preparación de la oportunidad, no la madurez de una empresa. */
const BANDAS_PREPARACION: [number, number, string][] = [
  [0, 30, 'Idea por aclarar'],
  [30, 55, 'Idea en construcción'],
  [55, 80, 'Lista para validar'],
  [80, 100.01, 'Lista para formular'],
]
function bandaPreparacion(puntaje100: number): string {
  const b = BANDAS_PREPARACION.find(([desde, hasta]) => puntaje100 >= desde && puntaje100 < hasta)
  return b ? b[2] : 'Lista para formular'
}

/** Sí / En parte / No se guardan como 5 / 3 / 1. */
const OPCIONES_SI_NO = [
  { valor: 5, texto: 'Sí' },
  { valor: 3, texto: 'En parte' },
  { valor: 1, texto: 'No' },
]

const EXTRAS: { estado: Exclude<EstadoRespuesta, 'respondida'>; texto: string }[] = [
  { estado: 'no_aplica', texto: 'No aplica' },
  { estado: 'no_se', texto: 'No sé' },
  { estado: 'sin_informacion', texto: 'No tengo la información' },
  { estado: 'prefiere_no', texto: 'Prefiero no responder' },
]

type Respuesta = { estado: EstadoRespuesta; valor: number | null; texto: string | null }

export function DiagnosticoEmpresarialClient(props: Props) {
  const { proyecto, perfil, plantillaId, metodologiaId, dimensiones, preguntas } = props
  const esA = perfil === 'A'

  const [respuestas, setRespuestas] = useState<Record<string, Respuesta>>(() => {
    const inicial: Record<string, Respuesta> = {}
    for (const r of props.respuestasIniciales) {
      inicial[r.pregunta_id] = { estado: r.estado_respuesta as EstadoRespuesta, valor: r.valor, texto: r.texto }
    }
    return inicial
  })
  const [borradores, setBorradores] = useState<Record<string, string>>({})
  const [indice, setIndice] = useState(0)
  const [resultado, setResultado] = useState<ResultadoDiagnostico | null>(null)
  const [faltaCobertura, setFaltaCobertura] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [cerrando, setCerrando] = useState(false)

  const sesionRef = useRef<Promise<string> | null>(props.sesionId ? Promise.resolve(props.sesionId) : null)

  const dimension = dimensiones[indice]
  const preguntasDeLaDimension = useMemo(
    () => preguntas.filter((p) => p.dimension_id === dimension?.id),
    [preguntas, dimension],
  )
  const total = preguntas.length
  const contestadas = Object.keys(respuestas).length
  const esUltima = indice === dimensiones.length - 1

  /** Crea la sesión del diagnóstico la primera vez que hace falta. */
  function asegurarSesion(): Promise<string> {
    if (!sesionRef.current) {
      sesionRef.current = (async () => {
        const supabase = createClient()
        const { data, error: e } = await supabase
          .from('sfpe_diag_sesiones')
          .insert({
            proyecto_id: proyecto.id,
            plantilla_id: plantillaId,
            metodologia_id: metodologiaId,
            perfil,
            estado: 'en_proceso',
          })
          .select('id')
          .single()
        if (e || !data) {
          sesionRef.current = null
          throw e ?? new Error('No se pudo iniciar el diagnóstico')
        }
        return data.id as string
      })()
    }
    return sesionRef.current
  }

  async function responder(pregunta: Pregunta, estado: EstadoRespuesta, valor: number | null, texto: string | null = null) {
    setError('')
    const anterior = respuestas[pregunta.id]
    setRespuestas((r) => ({ ...r, [pregunta.id]: { estado, valor, texto } }))
    try {
      const sesionId = await asegurarSesion()
      const supabase = createClient()
      const { error: e } = await supabase.from('sfpe_diag_respuestas').upsert(
        {
          proyecto_id: proyecto.id,
          sesion_id: sesionId,
          pregunta_id: pregunta.id,
          estado_respuesta: estado,
          valor,
          texto,
          nivel_evidencia: 'E1', // declaración de la persona
          respondida_en: new Date().toISOString(),
        },
        { onConflict: 'sesion_id,pregunta_id' },
      )
      if (e) throw e
    } catch (err) {
      // Si no se pudo guardar, se devuelve la pantalla a como estaba.
      setRespuestas((r) => {
        const copia = { ...r }
        if (anterior) copia[pregunta.id] = anterior
        else delete copia[pregunta.id]
        return copia
      })
      setError((err as { message?: string } | null)?.message || 'No se pudo guardar tu respuesta. Intenta de nuevo.')
    }
  }

  /** Guarda el texto libre cuando la persona sale del cuadro. */
  function guardarTexto(pregunta: Pregunta) {
    const escrito = (borradores[pregunta.id] ?? respuestas[pregunta.id]?.texto ?? '').trim()
    const actual = respuestas[pregunta.id]
    if (!escrito || (actual?.estado === 'respondida' && actual.texto === escrito)) return
    void responder(pregunta, 'respondida', null, escrito)
  }

  async function verResultado() {
    setCerrando(true)
    setError('')
    try {
      const calculo = calcularDiagnostico(
        dimensiones.map((d) => ({ id: d.id, codigo: d.codigo, peso: Number(d.peso) })),
        preguntas.map((p) => ({ id: p.id, dimension_id: p.dimension_id, peso: Number(p.peso) })),
        Object.entries(respuestas).map(([pregunta_id, r]) => ({
          pregunta_id,
          estado_respuesta: r.estado,
          valor: r.valor,
        })),
      )
      if (esA && calculo.puntaje_100 !== null) calculo.banda = bandaPreparacion(calculo.puntaje_100)

      const sesionId = await asegurarSesion()
      const supabase = createClient()

      if (!calculo.calculable) {
        setFaltaCobertura(calculo.cobertura)
        setResultado(null)
        return
      }

      const { error: eP } = await supabase.from('sfpe_diag_puntajes').upsert(
        calculo.dimensiones.map((d) => ({
          proyecto_id: proyecto.id,
          sesion_id: sesionId,
          dimension_id: d.dimension_id,
          puntaje_1_5: d.puntaje_1_5,
          puntaje_100: d.puntaje_100,
          cobertura: d.cobertura,
          confianza: d.informacion_suficiente ? calculo.confianza : 'provisional',
        })),
        { onConflict: 'sesion_id,dimension_id' },
      )
      if (eP) throw eP

      const { error: eS } = await supabase
        .from('sfpe_diag_sesiones')
        .update({
          puntaje_total: calculo.puntaje_100,
          cobertura: calculo.cobertura,
          confianza: calculo.confianza,
          estado: 'completado',
          completada_en: new Date().toISOString(),
        })
        .eq('id', sesionId)
      if (eS) throw eS

      setFaltaCobertura(null)
      setResultado(calculo)
    } catch (err) {
      setError((err as { message?: string } | null)?.message || 'No se pudo calcular tu resultado. Intenta de nuevo.')
    } finally {
      setCerrando(false)
    }
  }

  const botonOro = `h-14 px-8 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#C9A46B] to-[#B08D57] text-[#3A1420] text-base font-extrabold disabled:opacity-50 disabled:cursor-not-allowed ${RELIEVE_BOTON}`
  const botonSuave = `h-14 px-6 inline-flex items-center justify-center gap-2 rounded-xl border border-[#B08D57]/50 bg-[#3B1727] text-[#F3E7DC] font-semibold disabled:opacity-40 ${RELIEVE_BOTON}`
  const claseOpcion = (activa: boolean) =>
    `rounded-xl border px-1 py-2.5 text-center transition-all ${
      activa
        ? 'border-[#C9A46B] bg-gradient-to-b from-[#C9A46B] to-[#B08D57] text-[#3A1420]'
        : 'border-[#B08D57]/35 bg-[#2E0E1A] hover:bg-[#4C2032]'
    }`

  /* ----------------------------- RESULTADO ----------------------------- */
  if (resultado) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#2E0E1A] via-[#3B1727] to-[#54142B] text-[#F3E7DC]">
        <div className="max-w-[820px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
          <div className="text-center">
            <div className="text-sm font-bold uppercase tracking-[0.25em] text-[#C9A46B]">
              {esA ? 'Preparación de tu oportunidad' : 'Tu diagnóstico'}
            </div>
            <h1 className="mt-3 text-3xl md:text-4xl font-extrabold">{proyecto.nombre}</h1>
          </div>

          <div className={`mt-10 rounded-3xl border border-[#B08D57]/45 bg-[#3B1727] p-8 text-center ${RELIEVE_TARJETA}`}>
            <div className="text-6xl font-extrabold text-[#C9A46B]">{Math.round(resultado.puntaje_100 ?? 0)}</div>
            <div className="mt-1 text-sm text-[#F3E7DC]/70">de 100</div>
            <div className="mt-4 text-2xl font-extrabold">{resultado.banda}</div>
            <p className="mt-3 text-sm text-[#F3E7DC]/75">
              Respondiste el {Math.round(resultado.cobertura)} % de las preguntas que te aplican.{' '}
              {resultado.confianza === 'provisional'
                ? 'Por ahora el resultado es provisional: mientras más preguntas respondas, más confiable será.'
                : 'Con esa información, tu resultado es confiable.'}
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {dimensiones.map((d) => {
              const p = resultado.dimensiones.find((x) => x.dimension_id === d.id)
              return (
                <div key={d.id} className={`rounded-2xl border border-[#B08D57]/35 bg-[#3B1727] p-5 ${RELIEVE_TARJETA}`}>
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="font-bold">{d.nombre}</div>
                    <div className="text-sm text-[#F3E7DC]/75">
                      {p?.puntaje_100 === null || p?.puntaje_100 === undefined
                        ? 'Falta información'
                        : `${Math.round(p.puntaje_100)} / 100`}
                    </div>
                  </div>
                  <div className="mt-3 h-2.5 rounded-full bg-[#2E0E1A] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#C9A46B] to-[#B08D57]"
                      style={{ width: `${p?.puntaje_100 ?? 0}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <p className="mt-8 text-center text-sm text-[#F3E7DC]/70">
            {esA
              ? 'Este resultado mide qué tan lista está tu idea para el siguiente paso, no la madurez de una empresa. '
              : ''}
            Los hallazgos y las recomendaciones de tu diagnóstico se generan en el siguiente paso. Este resultado no
            es una auditoría ni una certificación, y no garantiza resultados.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button type="button" className={botonSuave} onClick={() => setResultado(null)}>
              Revisar mis respuestas
            </button>
            <Link href="/dashboard" className={botonOro}>
              Ir a mi panel
            </Link>
          </div>
        </div>
      </main>
    )
  }

  /* ----------------------------- PREGUNTAS ----------------------------- */
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2E0E1A] via-[#3B1727] to-[#54142B] text-[#F3E7DC]">
      <div className="max-w-[820px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <Link href="/empresarial" className="inline-flex items-center gap-2 text-sm text-[#F3E7DC]/70 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Salir (tu avance queda guardado)
        </Link>

        <div className="mt-6">
          <div className="text-sm font-bold uppercase tracking-[0.25em] text-[#C9A46B]">Diagnóstico · {proyecto.nombre}</div>
          <div className="mt-3 flex items-center justify-between gap-4 text-sm text-[#F3E7DC]/75">
            <span>
              Parte {indice + 1} de {dimensiones.length}
            </span>
            <span>
              {contestadas} de {total} preguntas
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-[#2E0E1A] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#C9A46B] to-[#B08D57] transition-all"
              style={{ width: `${total ? (contestadas / total) * 100 : 0}%` }}
            />
          </div>
        </div>

        <h1 className="mt-8 text-3xl font-extrabold">{dimension.nombre}</h1>
        {dimension.descripcion && <p className="mt-2 text-[#F3E7DC]/75">{dimension.descripcion}</p>}

        <div className={`mt-6 rounded-2xl border border-[#B08D57]/35 bg-[#3B1727]/70 p-4 text-[13px] text-[#F3E7DC]/80 ${RELIEVE_TARJETA}`}>
          <div className="font-semibold text-[#F3E7DC]">Cómo responder</div>
          {esA ? (
            <p className="mt-2">
              Responde con calma y con lo que hoy es cierto, no con lo que quisieras que fuera. Algunas preguntas son
              para escribir; esas no suman puntos, solo nos ayudan a entender tu idea. Si no sabes, usa las opciones de
              abajo: nunca cuentan como cero.
            </p>
          ) : (
            <>
              <ul className="mt-2 grid sm:grid-cols-2 gap-x-6 gap-y-1">
                {NIVELES.map((n) => (
                  <li key={n.valor}>
                    <strong>
                      {n.valor} · {n.nombre}:
                    </strong>{' '}
                    {n.texto}
                  </li>
                ))}
              </ul>
              <p className="mt-2">Si no sabes o no tienes la información, usa las opciones de abajo: nunca cuentan como cero.</p>
            </>
          )}
        </div>

        <div className="mt-6 space-y-5">
          {preguntasDeLaDimension.map((p, i) => {
            const r = respuestas[p.id]
            const tipo = esA ? p.tipo : 'escala'
            const anclajes = p.anclajes ?? {}
            return (
              <div key={p.id} className={`rounded-2xl border border-[#B08D57]/35 bg-[#3B1727] p-5 ${RELIEVE_TARJETA}`}>
                <div className="font-bold leading-snug">
                  {i + 1}. {p.texto}
                </div>
                {p.ayuda && <div className="mt-1 text-xs text-[#F3E7DC]/60">{p.ayuda}</div>}

                {tipo === 'texto' && (
                  <textarea
                    rows={3}
                    value={borradores[p.id] ?? (r?.estado === 'respondida' ? (r.texto ?? '') : '')}
                    onChange={(e) => setBorradores((b) => ({ ...b, [p.id]: e.target.value }))}
                    onBlur={() => guardarTexto(p)}
                    placeholder="Escribe aquí con tus palabras"
                    className="mt-4 w-full rounded-xl border border-[#B08D57]/35 bg-[#2E0E1A] p-3 text-sm text-[#F3E7DC] placeholder:text-[#F3E7DC]/40 focus:border-[#C9A46B] focus:outline-none"
                  />
                )}

                {tipo === 'si_no' && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {OPCIONES_SI_NO.map((o) => (
                      <button
                        key={o.valor}
                        type="button"
                        onClick={() => responder(p, 'respondida', o.valor)}
                        className={claseOpcion(r?.estado === 'respondida' && r.valor === o.valor)}
                      >
                        <div className="py-1 text-base font-extrabold">{o.texto}</div>
                      </button>
                    ))}
                  </div>
                )}

                {tipo === 'escala' && (
                  <>
                    {esA && (
                      <ul className="mt-3 space-y-0.5 text-xs text-[#F3E7DC]/70">
                        {['1', '3', '5'].map(
                          (k) =>
                            anclajes[k] && (
                              <li key={k}>
                                <strong>{k}:</strong> {anclajes[k]}
                              </li>
                            ),
                        )}
                      </ul>
                    )}
                    <div className="mt-4 grid grid-cols-5 gap-2">
                      {NIVELES.map((n) => (
                        <button
                          key={n.valor}
                          type="button"
                          onClick={() => responder(p, 'respondida', n.valor)}
                          className={claseOpcion(r?.estado === 'respondida' && r.valor === n.valor)}
                        >
                          <div className="text-lg font-extrabold">{n.valor}</div>
                          {!esA && <div className="text-[10px] sm:text-[11px] leading-tight">{n.nombre}</div>}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {EXTRAS.map((x) => {
                    const activa = r?.estado === x.estado
                    return (
                      <button
                        key={x.estado}
                        type="button"
                        onClick={() => responder(p, x.estado, null)}
                        className={`rounded-full border px-3 py-1.5 text-xs transition-all ${
                          activa
                            ? 'border-[#C9A46B] bg-[#4C2032] text-[#F3E7DC] font-bold'
                            : 'border-[#B08D57]/30 text-[#F3E7DC]/75 hover:bg-[#4C2032]'
                        }`}
                      >
                        {activa && <Check className="inline h-3 w-3 mr-1" />}
                        {x.texto}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {error && <p className="mt-6 text-center text-sm text-red-300">{error}</p>}
        {faltaCobertura !== null && (
          <p className="mt-6 text-center text-sm text-[#C9A46B]">
            Todavía no alcanza para calcular tu resultado: has respondido el {Math.round(faltaCobertura)} % y necesitamos
            al menos 40 %. Sigue respondiendo; lo que no sepas, déjalo en &quot;No sé&quot;.
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <button type="button" className={botonSuave} disabled={indice === 0} onClick={() => setIndice(indice - 1)}>
            <ArrowLeft className="h-5 w-5" /> Anterior
          </button>
          {esUltima ? (
            <button type="button" className={botonOro} disabled={cerrando} onClick={verResultado}>
              {cerrando ? 'Calculando…' : 'Ver mi resultado'} <ArrowRight className="h-5 w-5" />
            </button>
          ) : (
            <button type="button" className={botonOro} onClick={() => setIndice(indice + 1)}>
              Siguiente <ArrowRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
