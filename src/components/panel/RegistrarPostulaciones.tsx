'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MAX_POSTULACIONES_POR_PROYECTO, type PostulacionRegistrada } from '@/lib/miProyectoListo'

export type OpcionConvocatoria = { id: string; etiqueta: string }

const CAMPO = 'mt-1 w-full rounded-xl border border-white/10 bg-[#54142B] px-3 py-2 text-[13px] text-[#F3E7DC] placeholder:text-[#F3E7DC]/30'

/** Las postulaciones de un proyecto: máximo 3. Cada una que el miembro registra gasta una y no se devuelve. */
export function RegistrarPostulaciones({
  proyectoId,
  opciones,
  usadas,
}: {
  proyectoId: string
  opciones: OpcionConvocatoria[]
  usadas: PostulacionRegistrada[]
}) {
  const router = useRouter()
  const [convocatoriaId, setConvocatoriaId] = useState('')
  const [otra, setOtra] = useState('')
  const [acepto, setAcepto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const quedan = MAX_POSTULACIONES_POR_PROYECTO - usadas.length

  const registrar = async () => {
    setCargando(true)
    setError(null)
    try {
      const res = await fetch('/api/membresias/proyectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'registrar_postulacion', id: proyectoId, convocatoriaId, convocatoriaTexto: otra, acepto }),
      })
      const datos = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(datos.error || 'No se pudo registrar.')
        return
      }
      setConvocatoriaId('')
      setOtra('')
      setAcepto(false)
      router.refresh()
    } catch {
      setError('No se pudo registrar.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <p className="text-[14px] font-extrabold text-[#E0B868]">
        Postulaciones de este proyecto: {usadas.length} de {MAX_POSTULACIONES_POR_PROYECTO} usadas
      </p>

      {usadas.map((u, i) => (
        <div key={`${u.id || u.texto}-${i}`} className="rounded-xl bg-[#3B1727] p-3 text-[13px] text-[#F3E7DC]/85">
          <p className="font-bold text-[#F3E7DC]">{i + 1}. {u.texto}</p>
          {u.mecanismo && <p className="mt-1"><span className="font-bold text-[#F3E7DC]/60">Cómo se postula: </span>{u.mecanismo}</p>}
          {u.requisitos && <p className="mt-1 whitespace-pre-wrap"><span className="font-bold text-[#F3E7DC]/60">Requisitos: </span>{u.requisitos}</p>}
          {u.fuente_oficial && (
            <p className="mt-1 break-all">
              <span className="font-bold text-[#F3E7DC]/60">Página oficial: </span>
              {/^https?:\/\//.test(u.fuente_oficial) ? (
                <a href={u.fuente_oficial} target="_blank" rel="noreferrer" className="text-[#C9A46B] underline">{u.fuente_oficial}</a>
              ) : (
                u.fuente_oficial
              )}
            </p>
          )}
        </div>
      ))}

      {quedan <= 0 ? (
        <p className="text-[13px] text-[#F3E7DC]/65">
          Ya usaste las {MAX_POSTULACIONES_POR_PROYECTO} postulaciones de este proyecto. Para postular más, necesitas otro proyecto.
        </p>
      ) : (
        <div className="space-y-3 rounded-xl bg-[#3B1727] p-3">
          <p className="text-[13.5px] font-bold text-[#F3E7DC]">Registrar una postulación (te quedan {quedan})</p>
          <div>
            <label className="text-[12px] text-[#F3E7DC]/60">¿A qué convocatoria vas a postular?</label>
            <select value={convocatoriaId} onChange={(e) => setConvocatoriaId(e.target.value)} className={CAMPO}>
              <option value="">Elige una de la biblioteca…</option>
              {opciones.map((o) => <option key={o.id} value={o.id}>{o.etiqueta}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[12px] text-[#F3E7DC]/60">O escribe cuál es, si no está en la lista</label>
            <input value={otra} onChange={(e) => setOtra(e.target.value)} maxLength={300} className={CAMPO} />
          </div>
          <label className="flex items-start gap-2 text-[12.5px] text-[#F3E7DC]">
            <input type="checkbox" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} className="mt-1" />
            <span>Entiendo que esto usa 1 de las {MAX_POSTULACIONES_POR_PROYECTO} postulaciones de este proyecto y que no se devuelve.</span>
          </label>
          {error && <p className="text-[13px] text-[#E0917E]">{error}</p>}
          <button
            onClick={registrar}
            disabled={cargando || !acepto || (!convocatoriaId && !otra.trim())}
            className="rounded-xl bg-[#C9A46B] px-5 py-2.5 text-[13.5px] font-bold text-[#3B1727] disabled:opacity-50"
          >
            {cargando ? 'Registrando…' : 'Registrar esta postulación'}
          </button>
        </div>
      )}
    </div>
  )
}
