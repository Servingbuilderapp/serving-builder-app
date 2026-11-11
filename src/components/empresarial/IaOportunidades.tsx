'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CAMPOS_FICHA_IA, type CampoFichaIA, type IdeaIA, type SugerenciaFichaIA } from '@/lib/empresarial/iaOportunidades'

const RELIEVE_BOTON =
  'shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200'
const RELIEVE_TARJETA = 'shadow-[0_1px_2px_rgba(11,42,74,0.06),0_10px_28px_-14px_rgba(11,42,74,0.22)]'

const botonSuave = `h-12 px-5 inline-flex items-center justify-center gap-2 rounded-xl border border-[#B08D57]/50 bg-[#3B1727] text-[#F3E7DC] font-semibold disabled:opacity-40 ${RELIEVE_BOTON}`

const ETIQUETA_CAMPO: Record<CampoFichaIA, string> = {
  cliente_o_beneficiario: 'Para quién genera valor',
  solucion_propuesta: 'Qué solución podrías desarrollar',
  valor_generado: 'Qué beneficio produciría',
  sector: 'Sector',
  ubicacion: 'Dónde',
}

const AVISO_IA = 'Es una sugerencia de la IA, no una prueba. Revísala y cámbiala: solo tú sabes si es cierta.'

async function pedirIA(cuerpo: Record<string, string>): Promise<{ ok: boolean; datos?: Record<string, unknown>; error?: string }> {
  try {
    const r = await fetch('/api/empresarial/ia-oportunidades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
    })
    const datos = (await r.json().catch(() => ({}))) as Record<string, unknown>
    if (!r.ok) return { ok: false, error: typeof datos.error === 'string' ? datos.error : 'La IA no pudo responder ahora. Intenta de nuevo.' }
    return { ok: true, datos }
  } catch {
    return { ok: false, error: 'No pudimos conectar con la IA. Revisa tu conexión e intenta de nuevo.' }
  }
}

/* ------------------------------------------------------------------ */
/* Ideas nuevas de oportunidades                                       */
/* ------------------------------------------------------------------ */

interface PropsIdeas {
  proyectoId: string
  ideasIniciales: IdeaIA[]
  /** Crea la oportunidad en la lista de la persona. Devuelve true si se guardó. */
  onCrearOportunidad: (nombre: string, descripcion: string) => Promise<boolean>
}

export function SeccionIdeasIA({ proyectoId, ideasIniciales, onCrearOportunidad }: PropsIdeas) {
  const [ideas, setIdeas] = useState<IdeaIA[]>(ideasIniciales)
  const [cargando, setCargando] = useState(false)
  const [trabajando, setTrabajando] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function pedirIdeas() {
    setError(null)
    setCargando(true)
    const r = await pedirIA({ proyecto_id: proyectoId, accion: 'ideas' })
    setCargando(false)
    if (!r.ok) return setError(r.error ?? 'No pudimos pedir ideas.')
    const nuevas = (r.datos?.ideas as IdeaIA[] | undefined) ?? []
    setIdeas((prev) => [...nuevas, ...prev])
  }

  async function marcar(id: string, estado: 'combinada' | 'descartada') {
    const supabase = createClient()
    const { error: e } = await supabase.from('sfpe_ideas').update({ estado }).eq('id', id)
    if (!e) setIdeas((prev) => prev.filter((i) => i.id !== id))
  }

  async function convertir(i: IdeaIA) {
    setError(null)
    setTrabajando(i.id)
    const ok = await onCrearOportunidad(i.titulo, i.descripcion)
    if (ok) await marcar(i.id, 'combinada')
    else setError('No pudimos guardar la oportunidad. Intenta de nuevo.')
    setTrabajando(null)
  }

  async function descartar(i: IdeaIA) {
    setTrabajando(i.id)
    await marcar(i.id, 'descartada')
    setTrabajando(null)
  }

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold">Ideas con ayuda de la IA</h2>
        <button type="button" className={botonSuave} disabled={cargando} onClick={pedirIdeas}>
          {cargando ? 'Pensando…' : 'Pedir ideas a la IA'}
        </button>
      </div>
      <p className="mt-1 text-sm text-[#F3E7DC]/70">
        La IA mira tu diagnóstico y lo que contaste, y propone oportunidades nuevas. {AVISO_IA}
      </p>

      {error && (
        <div role="alert" className="mt-4 rounded-2xl border border-[#B3261E]/60 bg-[#B3261E]/15 p-4 text-sm">
          {error}
        </div>
      )}

      {ideas.length > 0 && (
        <div className="mt-4 space-y-3">
          {ideas.map((i) => (
            <div key={i.id} className={`rounded-2xl border border-[#B08D57]/35 bg-[#3B1727] p-5 ${RELIEVE_TARJETA}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="font-bold">{i.titulo}</div>
                <span className="rounded-full bg-[#2E0E1A] border border-[#B08D57]/40 px-3 py-1 text-xs font-semibold">
                  Sugerida por la IA
                </span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#F3E7DC]/85">{i.descripcion}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" className={botonSuave} disabled={trabajando === i.id} onClick={() => convertir(i)}>
                  {trabajando === i.id ? 'Guardando…' : 'Convertir en oportunidad'}
                </button>
                <button type="button" className="text-sm underline text-[#F3E7DC]/70 hover:text-white disabled:opacity-40" disabled={trabajando === i.id} onClick={() => descartar(i)}>
                  Descartar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Completar la ficha de una oportunidad                               */
/* ------------------------------------------------------------------ */

interface PropsFicha {
  proyectoId: string
  oportunidad: { id: string } & Partial<Record<CampoFichaIA, string | null>>
  /** Pone el texto en el campo de la ficha (todavía sin guardar). */
  onUsar: (campo: CampoFichaIA, texto: string) => void
}

export function AyudaFichaIA({ proyectoId, oportunidad, onUsar }: PropsFicha) {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [sugerencias, setSugerencias] = useState<SugerenciaFichaIA>({})

  const hayVacios = CAMPOS_FICHA_IA.some((c) => !String(oportunidad[c] ?? '').trim())

  async function pedir() {
    setError(null)
    setAviso(null)
    setCargando(true)
    const r = await pedirIA({ proyecto_id: proyectoId, accion: 'ficha', oportunidad_id: oportunidad.id })
    setCargando(false)
    if (!r.ok) return setError(r.error ?? 'No pudimos pedir la sugerencia.')
    const s = (r.datos?.sugerencias as SugerenciaFichaIA | undefined) ?? {}
    setSugerencias(s)
    if (Object.keys(s).length === 0) setAviso('La IA no tiene datos suficientes para proponer algo. Completa la ficha tú y vuelve a intentarlo.')
  }

  function usar(campo: CampoFichaIA) {
    const t = sugerencias[campo]
    if (!t) return
    onUsar(campo, t)
    setSugerencias((prev) => {
      const { [campo]: _quitado, ...resto } = prev
      void _quitado
      return resto
    })
  }

  function quitar(campo: CampoFichaIA) {
    setSugerencias((prev) => {
      const { [campo]: _quitado, ...resto } = prev
      void _quitado
      return resto
    })
  }

  if (!hayVacios && Object.keys(sugerencias).length === 0) return null

  const campos = CAMPOS_FICHA_IA.filter((c) => sugerencias[c])

  return (
    <div className="rounded-xl border border-dashed border-[#B08D57]/50 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm">
          <span className="font-bold">¿Te falta algo en la ficha?</span>
          <span className="block text-xs text-[#F3E7DC]/65">La IA propone texto solo para los campos vacíos.</span>
        </div>
        {hayVacios && (
          <button type="button" className={botonSuave} disabled={cargando} onClick={pedir}>
            {cargando ? 'Pensando…' : 'Completar con IA'}
          </button>
        )}
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-[#B3261E]/60 bg-[#B3261E]/15 p-3 text-sm">
          {error}
        </div>
      )}
      {aviso && <p className="text-sm text-[#F3E7DC]/80">{aviso}</p>}

      {campos.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-[#F3E7DC]/65">{AVISO_IA} Al usarla, se escribe en la ficha pero no se guarda hasta que pulses “Guardar ficha”.</p>
          {campos.map((c) => (
            <div key={c} className="rounded-xl bg-[#2E0E1A] p-4 text-sm">
              <div className="font-semibold">{ETIQUETA_CAMPO[c]}</div>
              <p className="mt-1 text-[#F3E7DC]/85">{sugerencias[c]}</p>
              <div className="mt-3 flex flex-wrap gap-4">
                <button type="button" className="text-sm font-bold underline text-[#C9A46B] hover:text-white" onClick={() => usar(c)}>
                  Usar este texto
                </button>
                <button type="button" className="text-sm underline text-[#F3E7DC]/70 hover:text-white" onClick={() => quitar(c)}>
                  Descartar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
