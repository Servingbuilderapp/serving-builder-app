'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ETAPAS_PROYECTO,
  TODOS_LOS_PASOS,
  campoCompleto,
  pasoCompleto,
  porcentajeProyecto,
  type RespuestasProyecto,
} from '@/lib/miProyectoPasos'

const CAMPO = 'mt-1 w-full rounded-xl border border-white/10 bg-[#3B1727] px-3 py-2 text-[13.5px] text-[#F3E7DC] placeholder:text-[#F3E7DC]/30'

/** El miembro llena su proyecto paso a paso. Se guarda solo mientras escribe. */
export function EditorProyectoMembresia({
  proyectoId,
  nombre,
  inicial,
  terminado,
}: {
  proyectoId: string
  nombre: string
  inicial: RespuestasProyecto
  terminado: boolean
}) {
  const router = useRouter()
  const [respuestas, setRespuestas] = useState<RespuestasProyecto>(inicial)
  const [pasoAbierto, setPasoAbierto] = useState<number>(() => TODOS_LOS_PASOS.find((p) => !pasoCompleto(p, inicial))?.n ?? 1)
  const [estado, setEstado] = useState<'guardado' | 'guardando' | 'error'>('guardado')
  const [error, setError] = useState<string | null>(null)
  const [cerrando, setCerrando] = useState(false)
  const [verTodo, setVerTodo] = useState(false)
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ultimo = useRef<RespuestasProyecto>(inicial)

  const guardar = async (r: RespuestasProyecto) => {
    setEstado('guardando')
    try {
      const res = await fetch('/api/membresias/proyectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'guardar', id: proyectoId, respuestas: r }),
      })
      setEstado(res.ok ? 'guardado' : 'error')
    } catch {
      setEstado('error')
    }
  }

  const cambiar = (id: string, valor: string) => {
    const nuevo = { ...respuestas, [id]: valor }
    setRespuestas(nuevo)
    ultimo.current = nuevo
    if (temporizador.current) clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => guardar(nuevo), 1200)
  }

  useEffect(() => () => {
    if (temporizador.current) clearTimeout(temporizador.current)
  }, [])

  const terminar = async () => {
    setCerrando(true)
    setError(null)
    if (temporizador.current) clearTimeout(temporizador.current)
    try {
      const res = await fetch('/api/membresias/proyectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'terminar', id: proyectoId, respuestas: ultimo.current }),
      })
      const datos = await res.json().catch(() => ({}))
      if (!res.ok) setError(datos.error || 'No se pudo cerrar el proyecto.')
      else router.refresh()
    } catch {
      setError('No se pudo cerrar el proyecto.')
    } finally {
      setCerrando(false)
    }
  }

  const pct = porcentajeProyecto(respuestas)
  const todoListo = TODOS_LOS_PASOS.every((p) => pasoCompleto(p, respuestas))

  return (
    <div>
      <div className="mb-4 rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[13.5px] font-bold text-[#F3E7DC]">Avance de tu proyecto: {pct} %</p>
          <p className="text-[12px] text-[#F3E7DC]/50">
            {terminado ? 'Proyecto terminado' : estado === 'guardando' ? 'Guardando…' : estado === 'error' ? 'No se pudo guardar. Revisa tu conexión.' : 'Todo guardado'}
          </p>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#3B1727]">
          <div className="h-full rounded-full bg-[#C9A46B]" style={{ width: `${Math.max(pct, 3)}%` }} />
        </div>
        <button onClick={() => setVerTodo((v) => !v)} className="mt-3 text-[12.5px] font-bold text-[#C9A46B] underline">
          {verTodo ? 'Volver a llenar paso a paso' : 'Ver mi proyecto completo'}
        </button>
      </div>

      {verTodo ? (
        <div className="space-y-4 rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-5 text-[13.5px] text-[#F3E7DC]/85">
          <h2 className="text-[17px] font-extrabold text-[#F3E7DC]">{respuestas.titulo_elegido?.trim() || nombre}</h2>
          {TODOS_LOS_PASOS.map((p) => (
            <div key={p.n}>
              <h3 className="font-extrabold text-[#E0B868]">{p.titulo}</h3>
              {p.campos.filter((c) => c.tipo !== 'check').map((c) => (
                <div key={c.id} className="mt-1">
                  {p.campos.filter((x) => x.tipo !== 'check').length > 1 && <p className="text-[12px] font-bold text-[#F3E7DC]/60">{c.etiqueta}</p>}
                  <p className="whitespace-pre-wrap">{respuestas[c.id]?.trim() || <span className="text-[#F3E7DC]/35">Sin completar</span>}</p>
                </div>
              ))}
            </div>
          ))}
          <button onClick={() => window.print()} className="rounded-xl bg-[#C9A46B] px-4 py-2 text-[13px] font-bold text-[#3B1727]">
            Imprimir o guardar en PDF
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {ETAPAS_PROYECTO.map((etapa) => (
            <section key={etapa.letra}>
              <h2 className="mb-2 text-[15px] font-extrabold text-[#E0B868]">Etapa {etapa.letra}. {etapa.titulo}</h2>
              <div className="space-y-2">
                {etapa.pasos.map((paso) => {
                  const completo = pasoCompleto(paso, respuestas)
                  const abierto = pasoAbierto === paso.n
                  return (
                    <div key={paso.n} className="rounded-2xl border border-[#B08D57]/30 bg-[#4C2032]">
                      <button
                        onClick={() => setPasoAbierto(abierto ? 0 : paso.n)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                      >
                        <span className="text-[14px] font-bold text-[#F3E7DC]">Paso {paso.n}. {paso.titulo}</span>
                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${completo ? 'bg-[#7A8B6F]/25 text-[#9BB18D]' : 'bg-[#C99A3D]/15 text-[#E0B868]'}`}>
                          {completo ? 'Listo' : 'Por completar'}
                        </span>
                      </button>
                      {abierto && (
                        <div className="space-y-3 px-4 pb-4">
                          <p className="text-[12.5px] leading-relaxed text-[#F3E7DC]/60">{paso.ayuda}</p>
                          {paso.campos.map((campo) =>
                            campo.tipo === 'check' ? (
                              <label key={campo.id} className="flex items-start gap-2 text-[13.5px] text-[#F3E7DC]">
                                <input
                                  type="checkbox"
                                  disabled={terminado}
                                  checked={respuestas[campo.id] === 'si'}
                                  onChange={(e) => cambiar(campo.id, e.target.checked ? 'si' : '')}
                                  className="mt-1"
                                />
                                <span>{campo.etiqueta}</span>
                              </label>
                            ) : (
                              <div key={campo.id}>
                                <label className="text-[13px] font-bold text-[#F3E7DC]">
                                  {campo.etiqueta}{campo.opcional ? ' (opcional)' : ''}
                                  {!campoCompleto(campo, respuestas) && !campo.opcional && <span className="text-[#C9A46B]"> *</span>}
                                </label>
                                <textarea
                                  rows={campo.filas || 4}
                                  maxLength={6000}
                                  disabled={terminado}
                                  value={respuestas[campo.id] || ''}
                                  onChange={(e) => cambiar(campo.id, e.target.value)}
                                  className={CAMPO}
                                />
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          ))}

          {!terminado && (
            <div className="rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-4">
              <p className="text-[13.5px] font-bold text-[#F3E7DC]">¿Terminaste tu proyecto?</p>
              <p className="mt-1 text-[12.5px] text-[#F3E7DC]/60">
                Cuando todos los pasos estén completos, márcalo como terminado. Después podrás pedir que lo postulemos a una convocatoria.
              </p>
              {error && <p className="mt-2 text-[13px] text-[#E0917E]">{error}</p>}
              <button
                onClick={terminar}
                disabled={cerrando || !todoListo}
                className="mt-3 rounded-xl bg-[#C9A46B] px-5 py-2.5 text-[13.5px] font-bold text-[#3B1727] disabled:opacity-50"
              >
                {cerrando ? 'Cerrando…' : todoListo ? 'Marcar mi proyecto como terminado' : 'Aún faltan pasos por completar'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
