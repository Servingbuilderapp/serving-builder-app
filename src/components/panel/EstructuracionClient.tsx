'use client'

import React, { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  Loader2,
  Pencil,
  X,
} from 'lucide-react'
import {
  MotorEstructuracion,
  type DocumentoDePartida,
} from '@/components/panel/MotorEstructuracion'

export type PasoEstructuracion = {
  id: number
  orden: number
  nombre: string
  completado: boolean
  contenido: string
  advertencia: string | null
}

/**
 * Las cuatro etapas del acompañamiento. Son las mismas de "Avance de mi
 * proyecto" para que el equipo y el cliente vean el trabajo partido igual.
 */
const ETAPAS = [
  { nombre: 'Diagnóstico', desde: 1, hasta: 19, color: '#1D4ED8' },
  { nombre: 'Objetivos y solución', desde: 20, hasta: 26, color: '#2563EB' },
  { nombre: 'Ejecución', desde: 27, hasta: 37, color: '#8A5307' },
  { nombre: 'Cierre', desde: 38, hasta: 42, color: '#186A46' },
]

type Filtro = 'todos' | 'escritos' | 'vacios' | 'reforzar'

const RELIEVE_TARJETA =
  'shadow-[0_1px_2px_rgba(11,42,74,0.04),0_8px_24px_-14px_rgba(11,42,74,0.18)]'

/**
 * "Estructuración" — la pantalla donde el equipo LEE y CORRIGE lo que la IA
 * escribió en cada paso del proyecto.
 *
 * Hasta ahora ese texto se guardaba en la base de datos y no se podía ver
 * desde ningún lado: el panel solo mostraba nombres de pasos con palomita.
 * Aquí sale el contenido de verdad, agrupado por etapas para que 42 renglones
 * seguidos no aplasten la pantalla, y con el aviso en ámbar de los pasos que
 * la propia IA marcó como flojos.
 */
export function EstructuracionClient({
  proyectoId,
  nombreProyecto,
  nombreCliente,
  pasosIniciales,
  documentos = [],
}: {
  proyectoId: string
  nombreProyecto: string
  nombreCliente: string
  pasosIniciales: PasoEstructuracion[]
  documentos?: DocumentoDePartida[]
}) {
  const [pasos, setPasos] = useState<PasoEstructuracion[]>(pasosIniciales)

  // Mientras el motor trabaja, la pantalla se vuelve a pedir al servidor cada
  // pocos segundos. Sin esto los contadores se quedarían congelados en los
  // datos con los que se abrió la página. Se compara contra lo último que llegó
  // del servidor para no pisar una corrección a medio escribir.
  const [ultimoDelServidor, setUltimoDelServidor] = useState(pasosIniciales)
  if (pasosIniciales !== ultimoDelServidor) {
    setUltimoDelServidor(pasosIniciales)
    setPasos(pasosIniciales)
  }
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [abiertas, setAbiertas] = useState<string[] | null>(null)
  const [pasoAbierto, setPasoAbierto] = useState<number | null>(null)
  const [editando, setEditando] = useState<number | null>(null)
  const [borrador, setBorrador] = useState('')
  const [quitarAviso, setQuitarAviso] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const conContenido = pasos.filter((p) => p.contenido.trim().length > 0).length
  const porReforzar = pasos.filter((p) => (p.advertencia || '').trim().length > 0).length

  const visibles = useMemo(() => {
    if (filtro === 'escritos') return pasos.filter((p) => p.contenido.trim().length > 0)
    if (filtro === 'vacios') return pasos.filter((p) => p.contenido.trim().length === 0)
    if (filtro === 'reforzar') return pasos.filter((p) => (p.advertencia || '').trim().length > 0)
    return pasos
  }, [pasos, filtro])

  /** Etapa donde va el trabajo: la primera que todavía tiene pasos en blanco. */
  const etapaEnCurso = useMemo(() => {
    const pendiente = pasos.find((p) => p.contenido.trim().length === 0)
    if (!pendiente) return ETAPAS[ETAPAS.length - 1].nombre
    return (
      ETAPAS.find((e) => pendiente.orden >= e.desde && pendiente.orden <= e.hasta)?.nombre ||
      ETAPAS[0].nombre
    )
  }, [pasos])

  const estaAbierta = (nombre: string) =>
    abiertas === null ? nombre === etapaEnCurso || filtro !== 'todos' : abiertas.includes(nombre)

  const alternarEtapa = (nombre: string) => {
    setAbiertas((actuales) => {
      const base = actuales === null ? (estaAbierta(nombre) ? [nombre] : []) : actuales
      return base.includes(nombre) ? base.filter((n) => n !== nombre) : [...base, nombre]
    })
  }

  const abrirEdicion = (paso: PasoEstructuracion) => {
    setEditando(paso.id)
    setBorrador(paso.contenido)
    setQuitarAviso(false)
    setError(null)
  }

  const guardar = async (paso: PasoEstructuracion) => {
    const texto = borrador.trim()
    if (!texto) {
      setError('El contenido no puede quedar vacío.')
      return
    }

    setGuardando(true)
    setError(null)

    try {
      const respuesta = await fetch('/api/guardar-paso-estructuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proyectoId,
          pasoId: paso.id,
          contenido: texto,
          advertencia: quitarAviso ? null : paso.advertencia,
        }),
      })

      const datos = await respuesta.json().catch(() => ({}))

      if (!respuesta.ok) {
        setError(datos?.error || 'No se pudo guardar. Intenta de nuevo.')
        return
      }

      setPasos((actuales) =>
        actuales.map((p) =>
          p.id === paso.id
            ? {
                ...p,
                contenido: texto,
                completado: true,
                advertencia: quitarAviso ? null : p.advertencia,
              }
            : p,
        ),
      )
      setEditando(null)
    } catch {
      setError('No se pudo guardar. Revisa la conexión e intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  const FILTROS: { clave: Filtro; texto: string; cuantos: number }[] = [
    { clave: 'todos', texto: 'Todos', cuantos: pasos.length },
    { clave: 'escritos', texto: 'Con contenido', cuantos: conContenido },
    { clave: 'vacios', texto: 'Todavía en blanco', cuantos: pasos.length - conContenido },
    { clave: 'reforzar', texto: 'Por reforzar', cuantos: porReforzar },
  ]

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Encabezado */}
      <div className={`rounded-2xl border border-[#E4EAF3] bg-white p-5 ${RELIEVE_TARJETA}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              <FileText className="h-3.5 w-3.5" />
              Estructuración
            </div>
            <h1 className="mt-1 text-[20px] font-extrabold leading-tight text-[#0B2A4A]">
              {nombreProyecto}
            </h1>
            {nombreCliente ? (
              <p className="text-[13px] text-[#5B6B84]">{nombreCliente}</p>
            ) : null}
          </div>

          <div className="flex gap-3">
            <div className="rounded-xl border border-[#E4EAF3] bg-[#F8FAFD] px-4 py-2 text-center">
              <div className="text-[20px] font-black leading-none text-[#0B2A4A]">
                {conContenido}
                <span className="text-[13px] font-bold text-[#94A3B8]">/{pasos.length}</span>
              </div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#5B6B84]">
                pasos escritos
              </div>
            </div>
            <div
              className={`rounded-xl border px-4 py-2 text-center ${
                porReforzar > 0
                  ? 'border-[#F0D9A8] bg-[#FDF6E7]'
                  : 'border-[#E4EAF3] bg-[#F8FAFD]'
              }`}
            >
              <div
                className={`text-[20px] font-black leading-none ${
                  porReforzar > 0 ? 'text-[#8A5307]' : 'text-[#0B2A4A]'
                }`}
              >
                {porReforzar}
              </div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#5B6B84]">
                por reforzar
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-[13px] leading-relaxed text-[#5B6B84]">
          Aquí está el texto que escribió la estructuración automática para cada paso del
          proyecto. Ábrelo, léelo y corrígelo donde haga falta: lo que quede guardado aquí es lo
          que se usa después para buscar convocatorias y para postular.
        </p>

        {/* Filtros */}
        <div className="mt-4 flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <button
              key={f.clave}
              type="button"
              onClick={() => {
                setFiltro(f.clave)
                setAbiertas(null)
              }}
              className={`rounded-lg border px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                filtro === f.clave
                  ? 'border-[#1D4ED8] bg-[#EFF6FF] text-[#1D4ED8]'
                  : 'border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F1F5F9]'
              }`}
            >
              {f.texto}
              <span className="ml-1.5 text-[11px] font-bold text-[#94A3B8]">{f.cuantos}</span>
            </button>
          ))}
        </div>
      </div>

      {/* El botón que enciende el Motor 1 */}
      <MotorEstructuracion
        proyectoId={proyectoId}
        documentos={documentos}
        pasosEscritos={conContenido}
        totalPasos={pasos.length}
      />

      {/* Etapas */}
      {ETAPAS.map((etapa) => {
        const dentro = visibles.filter((p) => p.orden >= etapa.desde && p.orden <= etapa.hasta)
        if (dentro.length === 0) return null

        const escritos = dentro.filter((p) => p.contenido.trim().length > 0).length
        const abierta = estaAbierta(etapa.nombre)

        return (
          <div
            key={etapa.nombre}
            className={`overflow-hidden rounded-2xl border border-[#E4EAF3] bg-white ${RELIEVE_TARJETA}`}
          >
            <button
              type="button"
              onClick={() => alternarEtapa(etapa.nombre)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-[#F8FAFD]"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: etapa.color }}
              />
              <span className="text-[15px] font-bold text-[#0B2A4A]">{etapa.nombre}</span>
              <span className="text-[12.5px] text-[#94A3B8]">
                {escritos} de {dentro.length} escritos
              </span>
              <span className="ml-auto text-[#94A3B8]">
                {abierta ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </span>
            </button>

            {abierta ? (
              <ul className="border-t border-[#EEF2F8]">
                {dentro.map((paso) => {
                  const tieneContenido = paso.contenido.trim().length > 0
                  const aviso = (paso.advertencia || '').trim()
                  const desplegado = pasoAbierto === paso.id
                  const enEdicion = editando === paso.id

                  return (
                    <li key={paso.id} className="border-b border-[#F1F5F9] last:border-b-0">
                      <button
                        type="button"
                        onClick={() => {
                          setPasoAbierto(desplegado ? null : paso.id)
                          if (desplegado) setEditando(null)
                        }}
                        className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-[#F8FAFD]"
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            tieneContenido ? 'bg-[#186A46]' : 'border-2 border-[#DCE4F0]'
                          }`}
                        >
                          {tieneContenido ? <Check className="h-3 w-3 text-white" /> : null}
                        </span>
                        <span
                          className={`text-[13.5px] ${
                            tieneContenido ? 'text-[#0B2A4A]' : 'text-[#8496AE]'
                          }`}
                        >
                          {paso.nombre}
                        </span>
                        {aviso ? (
                          <span className="flex shrink-0 items-center gap-1 rounded-full border border-[#F0D9A8] bg-[#FDF6E7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#8A5307]">
                            <AlertTriangle className="h-3 w-3" />
                            por reforzar
                          </span>
                        ) : null}
                        <span className="ml-auto shrink-0 text-[#94A3B8]">
                          {desplegado ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </span>
                      </button>

                      {desplegado ? (
                        <div className="space-y-3 bg-[#FBFCFE] px-5 pb-5 pt-1">
                          {aviso ? (
                            <div className="flex gap-2 rounded-xl border border-[#F0D9A8] bg-[#FDF6E7] p-3">
                              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#8A5307]" />
                              <div className="text-[12.5px] leading-relaxed text-[#7A4A06]">
                                <span className="font-bold">Este paso quedó flojo. </span>
                                {aviso}
                              </div>
                            </div>
                          ) : null}

                          {enEdicion ? (
                            <div className="space-y-3">
                              <textarea
                                value={borrador}
                                onChange={(e) => setBorrador(e.target.value)}
                                rows={14}
                                className="w-full rounded-xl border border-[#CBD5E1] bg-white p-4 text-[13.5px] leading-relaxed text-[#0B2A4A] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15"
                              />

                              {aviso ? (
                                <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-[#5B6B84]">
                                  <input
                                    type="checkbox"
                                    checked={quitarAviso}
                                    onChange={(e) => setQuitarAviso(e.target.checked)}
                                    className="h-4 w-4 rounded border-[#CBD5E1]"
                                  />
                                  Ya lo reforcé: quitar el aviso de este paso
                                </label>
                              ) : null}

                              {error ? (
                                <div className="rounded-lg border border-[#F0C6C6] bg-[#FDF0F0] px-3 py-2 text-[12.5px] text-[#9B2C2C]">
                                  {error}
                                </div>
                              ) : null}

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  disabled={guardando}
                                  onClick={() => guardar(paso)}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#1D4ED8] px-4 py-2 text-[13px] font-bold text-white shadow-[0_2px_0_0_#1E3A8A] transition-transform active:translate-y-[1px] disabled:opacity-60"
                                >
                                  {guardando ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Check className="h-4 w-4" />
                                  )}
                                  Guardar cambios
                                </button>
                                <button
                                  type="button"
                                  disabled={guardando}
                                  onClick={() => setEditando(null)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-[13px] font-semibold text-[#475569] hover:bg-[#F1F5F9]"
                                >
                                  <X className="h-4 w-4" />
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {tieneContenido ? (
                                <div className="whitespace-pre-wrap rounded-xl border border-[#E8EDF5] bg-white p-4 text-[13.5px] leading-relaxed text-[#243B53]">
                                  {paso.contenido}
                                </div>
                              ) : (
                                <div className="rounded-xl border border-dashed border-[#DCE4F0] bg-white p-4 text-[13px] text-[#8496AE]">
                                  Este paso todavía no tiene contenido. Puedes escribirlo a mano
                                  aquí, o esperar a que la estructuración automática lo complete.
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => abrirEdicion(paso)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#1D4ED8] shadow-[0_1px_2px_rgba(11,42,74,0.06)] hover:bg-[#EFF6FF]"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                {tieneContenido ? 'Corregir este paso' : 'Escribir este paso'}
                              </button>
                            </>
                          )}
                        </div>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </div>
        )
      })}

      {visibles.length === 0 ? (
        <div
          className={`rounded-2xl border border-[#E4EAF3] bg-white p-8 text-center text-[13.5px] text-[#5B6B84] ${RELIEVE_TARJETA}`}
        >
          No hay pasos que cumplan ese filtro.
        </div>
      ) : null}
    </div>
  )
}
