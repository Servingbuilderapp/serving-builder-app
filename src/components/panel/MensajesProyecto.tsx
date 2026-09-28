'use client'

import React, { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send } from 'lucide-react'

type Mensaje = {
  id: string
  autor_tipo: 'cliente' | 'equipo'
  autor_correo: string
  mensaje: string
  creado_en: string
}

function formatearHora(valor: string): string {
  try {
    return new Date(valor).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch {
    return valor
  }
}

/**
 * Chat sencillo entre el cliente y el equipo, por proyecto. Se usa igual en
 * el panel del cliente y en el panel del equipo — lo único que cambia es
 * cómo se ven los mensajes propios vs los del otro lado, según `soyEquipo`.
 */
export function MensajesProyecto({ proyectoId, soyEquipo = false }: { proyectoId: string; soyEquipo?: boolean }) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [texto, setTexto] = useState('')
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const finRef = useRef<HTMLDivElement>(null)

  const cargar = async () => {
    try {
      const res = await fetch(`/api/mensajes-proyecto?proyectoId=${proyectoId}`)
      const datos = await res.json()
      if (res.ok && datos.ok) setMensajes(datos.mensajes)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
    // Se refresca solo cada 20 segundos: es un chat de acompañamiento, no
    // necesita tiempo real y así no se gasta de más.
    const intervalo = setInterval(cargar, 20000)
    return () => clearInterval(intervalo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proyectoId])

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes.length])

  const enviar = async () => {
    const contenido = texto.trim()
    if (!contenido || enviando) return
    setEnviando(true)
    setTexto('')
    try {
      const res = await fetch('/api/mensajes-proyecto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proyectoId, mensaje: contenido }),
      })
      const datos = await res.json()
      if (res.ok && datos.ok) setMensajes((prev) => [...prev, datos.mensaje])
      else setTexto(contenido)
    } catch {
      setTexto(contenido)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] shadow-[0_1px_2px_rgba(20,5,10,0.28),0_8px_24px_-14px_rgba(20,5,10,0.55)]">
      <div className="flex items-center gap-2 border-b border-[#B08D57]/35 px-5 py-3.5">
        <MessageCircle className="h-4 w-4 text-[#C9A46B]" />
        <h3 className="text-[13.5px] font-extrabold text-[#F3E7DC]">
          {soyEquipo ? 'Mensajes con el cliente' : 'Habla con el equipo'}
        </h3>
      </div>

      <div className="max-h-80 min-h-[140px] space-y-3 overflow-y-auto px-5 py-4">
        {cargando ? (
          <p className="text-[13px] text-[#F3E7DC]/50">Cargando…</p>
        ) : mensajes.length === 0 ? (
          <p className="text-[13px] text-[#F3E7DC]/50">
            {soyEquipo
              ? 'Todavía no hay mensajes de este cliente.'
              : 'Escríbenos si tienes una pregunta sobre tu proyecto, en cualquier momento del proceso.'}
          </p>
        ) : (
          mensajes.map((m) => {
            const esPropio = (m.autor_tipo === 'equipo') === soyEquipo
            return (
              <div key={m.id} className={`flex ${esPropio ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${
                    esPropio
                      ? 'bg-gradient-to-b from-[#E8C777] via-[#C9A46B] to-[#9C7A3E] text-[#2E0E1A]'
                      : 'bg-[#3B1727] text-[#F3E7DC]/85 border border-[#B08D57]/35'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.mensaje}</p>
                  <p className={`mt-1 text-[10.5px] ${esPropio ? 'text-[#2E0E1A]/60' : 'text-[#F3E7DC]/50'}`}>
                    {m.autor_tipo === 'equipo' ? 'Serving' : 'Cliente'} · {formatearHora(m.creado_en)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={finRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-[#B08D57]/35 px-4 py-3">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              enviar()
            }
          }}
          placeholder="Escribe un mensaje…"
          rows={1}
          className="h-10 flex-1 resize-none rounded-lg border border-[#B08D57]/35 bg-[#3B1727] px-3 py-2 text-[13px] text-[#F3E7DC] outline-none focus:border-[#B08D57]"
        />
        <button
          type="button"
          onClick={enviar}
          disabled={enviando || !texto.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-b from-[#E8C777] via-[#C9A46B] to-[#9C7A3E] text-[#2E0E1A] disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
