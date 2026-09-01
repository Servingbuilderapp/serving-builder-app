'use client'

import React from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
  Link2,
  Loader2,
  MessageSquarePlus,
  Minus,
  Save,
  ShieldCheck,
} from 'lucide-react'
import {
  crearPregunta,
  guardarArbol,
  guardarValidacion,
} from '@/app/(dashboard)/admin/proyectos/[id]/arbol/actions'

/* ==========================================================================
   Pantalla INTERNA del árbol de problemas.

   La usa el equipo de estructuración, no el cliente. El cliente solo ve sus
   pasos y las preguntas que aquí se le dejan escritas.
   ========================================================================== */

export type TipoNodo =
  | 'CENTRAL'
  | 'CAUSA_DIRECTA'
  | 'CAUSA_INDIRECTA'
  | 'EFECTO_DIRECTO'
  | 'EFECTO_INDIRECTO'

export type NodoVista = {
  tipo: TipoNodo
  orden: number
  descripcion: string
  evidenciaFuente: string
  evidenciaUrl: string
  evidenciaNota: string
}

export type PasoOpcion = { id: string; nombre: string; orden: number }

export type PreguntaVista = {
  id: string
  texto: string
  critica: boolean
  respondida: boolean
  respuesta: string
  nombrePaso: string
}

type Props = {
  proyectoId: string
  nombreProyecto: string
  nombreCliente: string
  nodos: NodoVista[]
  lineaBase: string
  respuestas: Record<string, string>
  notas: Record<string, string>
  pasos: PasoOpcion[]
  preguntas: PreguntaVista[]
}

/* -------------------------------------------------------------------------- */
/* Estilo, igual al del resto del panel                                       */
/* -------------------------------------------------------------------------- */

const SOMBRA = 'shadow-[0_1px_2px_rgba(11,42,74,0.06),0_8px_24px_-14px_rgba(11,42,74,0.20)]'
const TINTA = 'text-[#0B2A4A]'
const TINTA_SUAVE = 'text-[#5B6B84]'
const TINTA_TENUE = 'text-[#7C8CA5]'
const BORDE = 'border-[#E4EAF3]'
const CAMPO = `w-full rounded-lg border ${BORDE} bg-white px-2.5 py-1.5 text-[12px] ${TINTA} placeholder:text-[#A9B6C8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/25`

const COLOR_FILA: Record<
  TipoNodo,
  { fondo: string; borde: string; etiqueta: string }
> = {
  EFECTO_INDIRECTO: { fondo: 'bg-[#FFF7ED]', borde: 'border-[#FBD9A5]', etiqueta: 'text-[#8A5307]' },
  EFECTO_DIRECTO: { fondo: 'bg-[#FEF3E7]', borde: 'border-[#F6C98A]', etiqueta: 'text-[#8A5307]' },
  CENTRAL: { fondo: 'bg-[#0B2A4A]', borde: 'border-[#0B2A4A]', etiqueta: 'text-white' },
  CAUSA_DIRECTA: { fondo: 'bg-[#EFF5FF]', borde: 'border-[#BCD4F5]', etiqueta: 'text-[#1E427E]' },
  CAUSA_INDIRECTA: { fondo: 'bg-[#F5F9FF]', borde: 'border-[#D3E3F8]', etiqueta: 'text-[#1E427E]' },
}

const TITULO_FILA: Record<TipoNodo, string> = {
  EFECTO_INDIRECTO: 'Efectos indirectos',
  EFECTO_DIRECTO: 'Efectos directos',
  CENTRAL: 'Problema central',
  CAUSA_DIRECTA: 'Causas directas',
  CAUSA_INDIRECTA: 'Causas indirectas',
}

const AYUDA_FILA: Record<TipoNodo, string> = {
  EFECTO_INDIRECTO: 'Lo que ocurre más adelante, a largo plazo, si el problema sigue.',
  EFECTO_DIRECTO: 'Lo que ya está pasando hoy por causa del problema.',
  CENTRAL: 'Una sola frase. Situación negativa que existe hoy, no la ausencia de una solución.',
  CAUSA_DIRECTA: 'Lo que produce el problema de manera inmediata.',
  CAUSA_INDIRECTA: 'La causa de fondo que explica cada causa directa.',
}

const PREGUNTAS_REVISION: { n: number; texto: string }[] = [
  { n: 1, texto: '¿Los términos están claros? ¿Alguien de fuera entendería cada frase?' },
  { n: 2, texto: '¿La relación entre una cosa y la otra tiene sentido?' },
  { n: 3, texto: '¿Hay una prueba que la respalde?' },
  { n: 4, texto: '¿La causa sucede antes que el efecto?' },
  { n: 5, texto: '¿El efecto es del tamaño que uno esperaría, dada la causa?' },
  { n: 6, texto: '¿Hay otras explicaciones más fuertes que esta?' },
  { n: 7, texto: '¿Se usan las mismas palabras y los mismos datos en todo el árbol?' },
  { n: 8, texto: '¿Cada causa directa lleva de verdad al problema central, y este a cada efecto?' },
  { n: 9, texto: '¿Se puede seguir el hilo de arriba abajo sin saltos?' },
  { n: 10, texto: '¿No hay contradicciones ni relaciones al revés?' },
  { n: 11, texto: '¿Qué condiciones tienen que cumplirse y qué riesgos podrían cortar la cadena?' },
  { n: 12, texto: '¿Las personas que conocen el tema coinciden, y hay forma sencilla de comprobarlo?' },
]

const VEREDICTOS = [
  { valor: 'ok', texto: 'Bien', activo: 'bg-[#DCF3E6] text-[#186A46] border-[#9FD9BC]' },
  { valor: 'debil', texto: 'Débil', activo: 'bg-[#FCEFD2] text-[#8A5307] border-[#F0CE86]' },
  { valor: 'falta', texto: 'Falta info', activo: 'bg-[#FBE3E3] text-[#9B2C2C] border-[#F0AFAF]' },
] as const

/* -------------------------------------------------------------------------- */

function Tarjeta({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border ${BORDE} bg-white ${SOMBRA} ${className}`}>{children}</div>
}

function Semaforo({ estado }: { estado: 'verde' | 'amarillo' | 'rojo' }) {
  const mapa = {
    verde: { color: 'bg-[#16A34A]', texto: 'Va bien' },
    amarillo: { color: 'bg-[#D97706]', texto: 'Le falta' },
    rojo: { color: 'bg-[#DC2626]', texto: 'Incompleto' },
  } as const
  const m = mapa[estado]
  return (
    <span className={`inline-flex items-center gap-2 text-[12px] font-semibold ${TINTA}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${m.color}`} aria-hidden="true" />
      {m.texto}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* Una casilla del árbol                                                      */
/* -------------------------------------------------------------------------- */

function Casilla({
  nodo,
  onCambio,
  pideEvidencia,
}: {
  nodo: NodoVista
  onCambio: (cambios: Partial<NodoVista>) => void
  pideEvidencia: boolean
}) {
  const [abierto, setAbierto] = React.useState(false)
  const color = COLOR_FILA[nodo.tipo]
  const esCentral = nodo.tipo === 'CENTRAL'
  const tieneTexto = nodo.descripcion.trim().length > 0
  const tieneFuente = nodo.evidenciaFuente.trim().length > 0

  return (
    <div className={`rounded-xl border ${color.borde} ${color.fondo} p-3`}>
      <div className="mb-1.5 flex items-center justify-between">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${color.etiqueta}`}>
          {esCentral ? 'Problema central' : `Rama ${nodo.orden}`}
        </span>
        {!esCentral && tieneTexto ? (
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
              tieneFuente ? 'text-[#186A46]' : 'text-[#8A5307]'
            }`}
          >
            {tieneFuente ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
            {tieneFuente ? 'Con fuente' : 'Sin fuente'}
          </span>
        ) : null}
      </div>

      <textarea
        value={nodo.descripcion}
        onChange={(e) => onCambio({ descripcion: e.target.value })}
        rows={esCentral ? 2 : 3}
        placeholder={esCentral ? 'Problema central, en una sola frase' : 'Escribe aquí…'}
        className={
          esCentral
            ? 'w-full resize-none rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-[15px] font-semibold leading-snug text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-white/40'
            : `w-full resize-none rounded-lg border ${BORDE} bg-white px-2.5 py-2 text-[13px] leading-snug ${TINTA} placeholder:text-[#A9B6C8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/25`
        }
      />

      {pideEvidencia ? (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            className={`inline-flex items-center gap-1 text-[11px] font-semibold ${color.etiqueta} hover:underline`}
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${abierto ? 'rotate-180' : ''}`} />
            {abierto ? 'Ocultar evidencia' : tieneFuente ? 'Ver evidencia' : 'Agregar evidencia'}
          </button>

          {abierto ? (
            <div className="mt-2 space-y-2">
              <input
                value={nodo.evidenciaFuente}
                onChange={(e) => onCambio({ evidenciaFuente: e.target.value })}
                placeholder="Fuente: estudio, informe oficial, censo…"
                className={CAMPO}
              />
              <div className="relative">
                <Link2 className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#A9B6C8]" />
                <input
                  value={nodo.evidenciaUrl}
                  onChange={(e) => onCambio({ evidenciaUrl: e.target.value })}
                  placeholder="Enlace al documento"
                  className={`${CAMPO} pl-8`}
                />
              </div>
              <textarea
                value={nodo.evidenciaNota}
                onChange={(e) => onCambio({ evidenciaNota: e.target.value })}
                rows={2}
                placeholder="En una línea: por qué esa fuente respalda esto"
                className={`${CAMPO} resize-none`}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function FilaDelArbol({
  tipo,
  nodos,
  onCambio,
}: {
  tipo: TipoNodo
  nodos: NodoVista[]
  onCambio: (tipo: TipoNodo, orden: number, cambios: Partial<NodoVista>) => void
}) {
  const esCentral = tipo === 'CENTRAL'
  return (
    <section className="mb-4">
      <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className={`text-[12px] font-bold uppercase tracking-wider ${TINTA}`}>{TITULO_FILA[tipo]}</h3>
        <p className={`text-[12px] ${TINTA_TENUE}`}>{AYUDA_FILA[tipo]}</p>
      </div>
      <div className={esCentral ? '' : 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3'}>
        {nodos.map((n) => (
          <Casilla
            key={`${n.tipo}-${n.orden}`}
            nodo={n}
            pideEvidencia={!esCentral}
            onCambio={(cambios) => onCambio(n.tipo, n.orden, cambios)}
          />
        ))}
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* Pantalla                                                                   */
/* -------------------------------------------------------------------------- */

export function ArbolProblemasClient({
  proyectoId,
  nombreProyecto,
  nombreCliente,
  nodos: nodosIniciales,
  lineaBase: lineaBaseInicial,
  respuestas: respuestasIniciales,
  notas: notasIniciales,
  pasos,
  preguntas,
}: Props) {
  const [nodos, setNodos] = React.useState<NodoVista[]>(nodosIniciales)
  const [lineaBase, setLineaBase] = React.useState(lineaBaseInicial)
  const [respuestas, setRespuestas] = React.useState<Record<string, string>>(respuestasIniciales)
  const [notas, setNotas] = React.useState<Record<string, string>>(notasIniciales)
  const [aviso, setAviso] = React.useState<{ ok: boolean; texto: string } | null>(null)

  const [pasoElegido, setPasoElegido] = React.useState<string>(pasos[0]?.id || '')
  const [textoPregunta, setTextoPregunta] = React.useState('')
  const [preguntaCritica, setPreguntaCritica] = React.useState(false)

  const [guardando, empezarGuardado] = React.useTransition()
  const [guardandoRevision, empezarRevision] = React.useTransition()
  const [enviandoPregunta, empezarPregunta] = React.useTransition()

  const cambiarNodo = React.useCallback(
    (tipo: TipoNodo, orden: number, cambios: Partial<NodoVista>) => {
      setAviso(null)
      setNodos((previos) =>
        previos.map((n) => (n.tipo === tipo && n.orden === orden ? { ...n, ...cambios } : n)),
      )
    },
    [],
  )

  const de = React.useCallback(
    (tipo: TipoNodo) => nodos.filter((n) => n.tipo === tipo).sort((a, b) => a.orden - b.orden),
    [nodos],
  )

  /* Revisión rápida: se calcula sola, sin pedir nada -------------------- */
  const revision = React.useMemo(() => {
    const conTexto = (n: NodoVista) => n.descripcion.trim().length > 0
    const central = nodos.find((n) => n.tipo === 'CENTRAL')
    const ramas = nodos.filter((n) => n.tipo !== 'CENTRAL')
    const llenas = ramas.filter(conTexto)
    const conFuente = llenas.filter((n) => n.evidenciaFuente.trim().length > 0)

    const huerfanos = ramas.filter((n) => {
      if (!conTexto(n)) return false
      if (n.tipo === 'CAUSA_INDIRECTA') {
        const padre = nodos.find((p) => p.tipo === 'CAUSA_DIRECTA' && p.orden === n.orden)
        return !padre || !conTexto(padre)
      }
      if (n.tipo === 'EFECTO_INDIRECTO') {
        const padre = nodos.find((p) => p.tipo === 'EFECTO_DIRECTO' && p.orden === n.orden)
        return !padre || !conTexto(padre)
      }
      return false
    })

    const puntos: { texto: string; bien: boolean }[] = [
      { texto: 'El problema central está escrito', bien: Boolean(central && conTexto(central)) },
      { texto: `Las 12 ramas están completas (${llenas.length} de 12)`, bien: llenas.length === 12 },
      {
        texto: `Cada causa y cada efecto tiene fuente (${conFuente.length} de ${llenas.length || 12})`,
        bien: llenas.length > 0 && conFuente.length === llenas.length,
      },
      { texto: 'La magnitud del problema tiene dato y fuente', bien: lineaBase.trim().length > 0 },
      { texto: 'Ninguna rama de fondo quedó sin su rama directa', bien: huerfanos.length === 0 },
    ]

    const fallas = puntos.filter((p) => !p.bien).length
    const estado: 'verde' | 'amarillo' | 'rojo' = fallas === 0 ? 'verde' : fallas <= 2 ? 'amarillo' : 'rojo'
    return { puntos, estado }
  }, [nodos, lineaBase])

  const respondidas = PREGUNTAS_REVISION.filter((p) => respuestas[String(p.n)]).length
  const abiertas = preguntas.filter((p) => !p.respondida)

  /* Guardado ------------------------------------------------------------- */
  const alGuardarArbol = () => {
    setAviso(null)
    empezarGuardado(async () => {
      const r = await guardarArbol(proyectoId, nodos, lineaBase)
      setAviso({ ok: r.ok, texto: r.mensaje })
    })
  }

  const alGuardarRevision = () => {
    setAviso(null)
    empezarRevision(async () => {
      const r = await guardarValidacion(proyectoId, respuestas, notas)
      setAviso({ ok: r.ok, texto: r.mensaje })
    })
  }

  const alEnviarPregunta = () => {
    setAviso(null)
    empezarPregunta(async () => {
      const r = await crearPregunta(proyectoId, pasoElegido, textoPregunta, preguntaCritica)
      setAviso({ ok: r.ok, texto: r.mensaje })
      if (r.ok) {
        setTextoPregunta('')
        setPreguntaCritica(false)
      }
    })
  }

  /* ---------------------------------------------------------------------- */

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6">
      <header className="mb-5">
        <Link
          href="/admin/proyectos"
          className={`mb-2 inline-flex items-center gap-1.5 text-[12px] font-semibold ${TINTA_SUAVE} hover:text-[#1D4ED8]`}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver a proyectos
        </Link>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className={`text-[19px] font-extrabold uppercase tracking-tight ${TINTA}`}>
            Árbol de problemas
          </h1>
          <span className="rounded-full bg-[#0B2A4A] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            Interno
          </span>
        </div>
        <p className={`text-[13px] ${TINTA_TENUE}`}>
          {nombreProyecto}
          {nombreCliente ? ` · ${nombreCliente}` : ''} · esta pantalla no la ve el cliente
        </p>
      </header>

      {aviso ? (
        <div
          className={`mb-4 rounded-xl border px-4 py-3 text-[13px] font-medium ${
            aviso.ok
              ? 'border-[#9FD9BC] bg-[#DCF3E6] text-[#186A46]'
              : 'border-[#F0AFAF] bg-[#FBE3E3] text-[#9B2C2C]'
          }`}
          role="status"
        >
          {aviso.texto}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* El árbol -------------------------------------------------------- */}
        <div>
          <Tarjeta className="p-4 sm:p-5">
            <FilaDelArbol tipo="EFECTO_INDIRECTO" nodos={de('EFECTO_INDIRECTO')} onCambio={cambiarNodo} />
            <FilaDelArbol tipo="EFECTO_DIRECTO" nodos={de('EFECTO_DIRECTO')} onCambio={cambiarNodo} />

            <div className="my-4 border-t border-dashed border-[#DCE4F0]" />

            <FilaDelArbol tipo="CENTRAL" nodos={de('CENTRAL')} onCambio={cambiarNodo} />

            <div className="mb-4">
              <label className={`mb-1.5 block text-[12px] font-bold uppercase tracking-wider ${TINTA}`}>
                Magnitud del problema
              </label>
              <p className={`mb-2 text-[12px] ${TINTA_TENUE}`}>
                El dato duro que muestra de qué tamaño es el problema, con su fuente. Sin esto, el evaluador
                no tiene contra qué comparar los resultados.
              </p>
              <textarea
                value={lineaBase}
                onChange={(e) => {
                  setAviso(null)
                  setLineaBase(e.target.value)
                }}
                rows={3}
                placeholder="Ejemplo: el 63% de las familias del sector sur no accede regularmente a frutas y verduras frescas (relevamiento vecinal, 2024)."
                className={`${CAMPO} resize-none px-3 py-2 text-[13px] leading-snug`}
              />
            </div>

            <div className="my-4 border-t border-dashed border-[#DCE4F0]" />

            <FilaDelArbol tipo="CAUSA_DIRECTA" nodos={de('CAUSA_DIRECTA')} onCambio={cambiarNodo} />
            <FilaDelArbol tipo="CAUSA_INDIRECTA" nodos={de('CAUSA_INDIRECTA')} onCambio={cambiarNodo} />

            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#EEF2F8] pt-4">
              <button
                type="button"
                onClick={alGuardarArbol}
                disabled={guardando}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_6px_16px_-8px_rgba(29,78,216,0.9)] transition hover:-translate-y-px disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {guardando ? 'Guardando…' : 'Guardar el árbol'}
              </button>
              <p className={`max-w-md text-[12px] ${TINTA_TENUE}`}>
                Si dejas una casilla en blanco, esa rama se borra. Al borrar una causa también se borra el
                objetivo que salía de ella.
              </p>
            </div>
          </Tarjeta>
        </div>

        {/* Columna derecha -------------------------------------------------- */}
        <aside className="space-y-4">
          <Tarjeta className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className={`text-[13px] font-bold uppercase tracking-wider ${TINTA}`}>Revisión rápida</h2>
              <Semaforo estado={revision.estado} />
            </div>
            <ul className="space-y-2">
              {revision.puntos.map((p) => (
                <li key={p.texto} className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full ${
                      p.bien ? 'bg-[#DCF3E6] text-[#186A46]' : 'bg-[#FCEFD2] text-[#8A5307]'
                    }`}
                  >
                    {p.bien ? <Check className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                  </span>
                  <span className={`text-[12.5px] leading-snug ${p.bien ? TINTA_SUAVE : TINTA}`}>
                    {p.texto}
                  </span>
                </li>
              ))}
            </ul>
          </Tarjeta>

          {/* Preguntas al cliente ------------------------------------------ */}
          <Tarjeta className="p-4">
            <div className="mb-1 flex items-center gap-2">
              <MessageSquarePlus className="h-4 w-4 text-[#1D4ED8]" />
              <h2 className={`text-[13px] font-bold uppercase tracking-wider ${TINTA}`}>
                Preguntar al cliente
              </h2>
            </div>
            <p className={`mb-3 text-[12px] ${TINTA_TENUE}`}>
              Lo que falte aclarar se le deja escrito aquí. Le aparece en su panel, colgado del paso que
              elijas.
            </p>

            <label className={`mb-1 block text-[11px] font-bold uppercase tracking-wider ${TINTA_TENUE}`}>
              Paso al que pertenece
            </label>
            <select
              value={pasoElegido}
              onChange={(e) => setPasoElegido(e.target.value)}
              className={`${CAMPO} mb-2`}
            >
              {pasos.length === 0 ? <option value="">No hay pasos cargados</option> : null}
              {pasos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.orden ? `${p.orden}. ` : ''}
                  {p.nombre}
                </option>
              ))}
            </select>

            <textarea
              value={textoPregunta}
              onChange={(e) => setTextoPregunta(e.target.value)}
              rows={3}
              placeholder="Ejemplo: ¿de dónde sale el dato del 63%? Necesitamos la fuente para poder citarla."
              className={`${CAMPO} resize-none`}
            />

            <label className={`mt-2 flex items-center gap-2 text-[12px] ${TINTA_SUAVE}`}>
              <input
                type="checkbox"
                checked={preguntaCritica}
                onChange={(e) => setPreguntaCritica(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-[#BCD4F5] text-[#1D4ED8] focus:ring-[#1D4ED8]/30"
              />
              Sin esta respuesta no podemos avanzar
            </label>

            <button
              type="button"
              onClick={alEnviarPregunta}
              disabled={enviandoPregunta || !textoPregunta.trim() || !pasoElegido}
              className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#BCD4F5] bg-white px-4 py-2.5 text-[13px] font-bold text-[#1D4ED8] ${SOMBRA} transition hover:-translate-y-px disabled:opacity-50 disabled:hover:translate-y-0`}
            >
              {enviandoPregunta ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageSquarePlus className="h-4 w-4" />
              )}
              {enviandoPregunta ? 'Enviando…' : 'Dejar la pregunta'}
            </button>

            {abiertas.length > 0 ? (
              <div className="mt-4 border-t border-[#EEF2F8] pt-3">
                <p className={`mb-2 text-[11px] font-bold uppercase tracking-wider ${TINTA_TENUE}`}>
                  Sin responder ({abiertas.length})
                </p>
                <ul className="space-y-2">
                  {abiertas.map((p) => (
                    <li key={p.id} className="rounded-lg border border-[#EEF2F8] bg-[#FAFCFF] p-2">
                      <p className={`text-[12px] leading-snug ${TINTA}`}>{p.texto}</p>
                      <p className={`mt-1 text-[11px] ${TINTA_TENUE}`}>
                        {p.nombrePaso}
                        {p.critica ? ' · bloquea el avance' : ''}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Tarjeta>

          {/* Las doce preguntas -------------------------------------------- */}
          <Tarjeta className="p-4">
            <div className="mb-1 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#1D4ED8]" />
              <h2 className={`text-[13px] font-bold uppercase tracking-wider ${TINTA}`}>
                Las doce preguntas
              </h2>
            </div>
            <p className={`mb-3 text-[12px] ${TINTA_TENUE}`}>
              Revisión interna, enlace por enlace. Respondidas: {respondidas} de {PREGUNTAS_REVISION.length}.
            </p>

            <ol className="space-y-3">
              {PREGUNTAS_REVISION.map((p) => {
                const valor = respuestas[String(p.n)] || ''
                return (
                  <li key={p.n} className="rounded-xl border border-[#EEF2F8] bg-[#FAFCFF] p-2.5">
                    <p className={`mb-2 text-[12.5px] leading-snug ${TINTA}`}>
                      <span className={`font-bold ${TINTA_TENUE}`}>{p.n}.</span> {p.texto}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {VEREDICTOS.map((v) => {
                        const activo = valor === v.valor
                        return (
                          <button
                            key={v.valor}
                            type="button"
                            onClick={() => {
                              setAviso(null)
                              setRespuestas((prev) => ({
                                ...prev,
                                [String(p.n)]: activo ? '' : v.valor,
                              }))
                            }}
                            aria-pressed={activo}
                            className={`rounded-lg border px-2 py-1 text-[11.5px] font-semibold transition ${
                              activo ? v.activo : `border-[#E4EAF3] bg-white ${TINTA_SUAVE} hover:border-[#BCD4F5]`
                            }`}
                          >
                            {v.texto}
                          </button>
                        )
                      })}
                    </div>
                    {valor && valor !== 'ok' ? (
                      <input
                        value={notas[String(p.n)] || ''}
                        onChange={(e) => {
                          setAviso(null)
                          setNotas((prev) => ({ ...prev, [String(p.n)]: e.target.value }))
                        }}
                        placeholder="¿Qué hay que arreglar?"
                        className={`${CAMPO} mt-2`}
                      />
                    ) : null}
                  </li>
                )
              })}
            </ol>

            <button
              type="button"
              onClick={alGuardarRevision}
              disabled={guardandoRevision}
              className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#BCD4F5] bg-white px-4 py-2.5 text-[13px] font-bold text-[#1D4ED8] ${SOMBRA} transition hover:-translate-y-px disabled:opacity-60 disabled:hover:translate-y-0`}
            >
              {guardandoRevision ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {guardandoRevision ? 'Guardando…' : 'Guardar la revisión'}
            </button>
          </Tarjeta>
        </aside>
      </div>
    </div>
  )
}
