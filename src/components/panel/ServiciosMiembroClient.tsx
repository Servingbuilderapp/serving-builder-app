'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

async function enviar(url: string, cuerpo: unknown): Promise<string | null> {
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) })
    const datos = await res.json().catch(() => ({}))
    return res.ok ? null : datos.error || 'No se pudo completar. Intenta de nuevo.'
  } catch {
    return 'No se pudo completar. Intenta de nuevo.'
  }
}

const BOTON = 'rounded-xl bg-[#C9A46B] px-4 py-2 text-[13px] font-bold text-[#3B1727] disabled:opacity-50'
const CAMPO = 'mt-1 w-full rounded-xl border border-white/10 bg-[#3B1727] px-3 py-2 text-[13.5px] text-[#F3E7DC] placeholder:text-[#F3E7DC]/30'

export function ReservarSesion({ sesionId, inscrito, sinCupo }: { sesionId: string; inscrito: boolean; sinCupo: boolean }) {
  const router = useRouter()
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const accion = async () => {
    setCargando(true)
    setError(null)
    const e = await enviar('/api/membresias/sesiones', { sesionId, accion: inscrito ? 'cancelar' : 'reservar' })
    setCargando(false)
    if (e) setError(e)
    else router.refresh()
  }
  return (
    <div>
      <button onClick={accion} disabled={cargando || (!inscrito && sinCupo)} className={BOTON}>
        {cargando ? 'Un momento…' : inscrito ? 'Cancelar mi reserva' : sinCupo ? 'Sin cupo este mes' : 'Reservar mi lugar'}
      </button>
      {error && <p className="mt-1 text-[12.5px] text-[#E0917E]">{error}</p>}
    </div>
  )
}

export function PublicarComunidad() {
  const router = useRouter()
  const [texto, setTexto] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const publicar = async () => {
    setCargando(true)
    setError(null)
    const e = await enviar('/api/membresias/comunidad', { texto })
    setCargando(false)
    if (e) setError(e)
    else {
      setTexto('')
      router.refresh()
    }
  }
  return (
    <div>
      <textarea rows={3} maxLength={1000} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Comparte una pregunta, un logro o una idea con la comunidad…" className={CAMPO} />
      {error && <p className="mt-1 text-[12.5px] text-[#E0917E]">{error}</p>}
      <button onClick={publicar} disabled={cargando || texto.trim().length < 2} className={`${BOTON} mt-2`}>
        {cargando ? 'Publicando…' : 'Publicar'}
      </button>
    </div>
  )
}

export function PedirAcompanamiento({ bloqueado }: { bloqueado: boolean }) {
  const router = useRouter()
  const [tema, setTema] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pedir = async () => {
    setCargando(true)
    setError(null)
    const e = await enviar('/api/membresias/acompanamiento', { tema })
    setCargando(false)
    if (e) setError(e)
    else {
      setTema('')
      router.refresh()
    }
  }
  return (
    <div>
      <label className="text-[13.5px] font-bold text-[#F3E7DC]">¿Sobre qué quieres hablar esta semana?</label>
      <textarea rows={3} maxLength={600} value={tema} onChange={(e) => setTema(e.target.value)} className={CAMPO} />
      {error && <p className="mt-1 text-[12.5px] text-[#E0917E]">{error}</p>}
      <button onClick={pedir} disabled={cargando || bloqueado || tema.trim().length < 5} className={`${BOTON} mt-2`}>
        {cargando ? 'Enviando…' : bloqueado ? 'Ya tienes un encuentro pendiente' : 'Pedir mi encuentro de la semana'}
      </button>
    </div>
  )
}
