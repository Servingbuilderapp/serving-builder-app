'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  BUCKET_PROYECTOS,
  EXTENSIONES_PERMITIDAS,
  MAX_BYTES_PROYECTO_LISTO,
  TEXTO_DECLARACION_AUTORIA,
} from '@/lib/miProyectoListo'

const CAMPO = 'mt-1 w-full rounded-xl border border-white/10 bg-[#3B1727] px-3 py-2 text-[13.5px] text-[#F3E7DC] placeholder:text-[#F3E7DC]/30'
const BOTON = 'rounded-xl bg-[#C9A46B] px-5 py-2.5 text-[13.5px] font-bold text-[#3B1727] disabled:opacity-50'

/**
 * Abre un proyecto nuevo (descuenta 1 del cupo). Dos caminos:
 * - Armarlo aquí, paso a paso.
 * - Traer un proyecto ya hecho: se sube el archivo y se firma la declaración de autoría.
 */
export function NuevoProyectoMembresia({ sinCupo }: { sinCupo: boolean }) {
  const router = useRouter()
  const [camino, setCamino] = useState<'armar' | 'listo'>('armar')
  const [nombre, setNombre] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [declarante, setDeclarante] = useState('')
  const [acepto, setAcepto] = useState(false)

  const llamar = async (cuerpo: Record<string, unknown>) => {
    const res = await fetch('/api/membresias/proyectos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
    })
    const datos = await res.json().catch(() => ({}))
    return { ok: res.ok, datos }
  }

  const crear = async () => {
    setCargando(true)
    setError(null)
    try {
      const { ok, datos } = await llamar({ accion: 'crear', nombre })
      if (!ok) {
        setError(datos.error || 'No se pudo crear el proyecto.')
        return
      }
      router.push(`/mis-proyectos/${datos.id}`)
    } catch {
      setError('No se pudo crear el proyecto.')
    } finally {
      setCargando(false)
    }
  }

  const subirListo = async () => {
    if (!archivo) return
    setCargando(true)
    setError(null)
    try {
      const preparado = await llamar({ accion: 'preparar_listo', nombreArchivo: archivo.name })
      if (!preparado.ok) {
        setError(preparado.datos.error || 'No se pudo preparar la subida.')
        return
      }
      const supabase = createClient()
      const { error: errorSubida } = await supabase.storage
        .from(BUCKET_PROYECTOS)
        .uploadToSignedUrl(preparado.datos.ruta, preparado.datos.token, archivo)
      if (errorSubida) {
        setError('No se pudo subir el archivo. Revisa tu conexión e intenta de nuevo.')
        return
      }
      const confirmado = await llamar({
        accion: 'confirmar_listo',
        nombre,
        ruta: preparado.datos.ruta,
        nombreArchivo: archivo.name,
        declarante,
        acepto,
      })
      if (!confirmado.ok) {
        setError(confirmado.datos.error || 'No se pudo guardar el proyecto.')
        return
      }
      router.push(`/mis-proyectos/${confirmado.datos.id}`)
    } catch {
      setError('No se pudo subir el proyecto. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  const alElegirArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    setError(null)
    if (!f) return setArchivo(null)
    const extension = f.name.split('.').pop()?.toLowerCase() || ''
    if (!EXTENSIONES_PERMITIDAS.includes(extension)) {
      setArchivo(null)
      return setError('Sube tu proyecto en PDF o Word (.pdf, .doc o .docx).')
    }
    if (f.size > MAX_BYTES_PROYECTO_LISTO) {
      setArchivo(null)
      return setError('El archivo debe pesar menos de 30 MB.')
    }
    setArchivo(f)
  }

  const opcion = (activa: boolean) =>
    `flex-1 rounded-xl border px-4 py-3 text-left text-[13px] ${activa ? 'border-[#C9A46B] bg-[#C9A46B]/15 text-[#F3E7DC]' : 'border-white/10 text-[#F3E7DC]/60'}`

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={() => { setCamino('armar'); setError(null) }} className={opcion(camino === 'armar')}>
          <span className="block font-bold">Armo mi proyecto aquí</span>
          <span className="block text-[12px] opacity-70">Lo escribo paso a paso, con ayuda en cada pregunta.</span>
        </button>
        <button type="button" onClick={() => { setCamino('listo'); setError(null) }} className={opcion(camino === 'listo')}>
          <span className="block font-bold">Traigo mi proyecto ya hecho</span>
          <span className="block text-[12px] opacity-70">Subo el archivo y firmo que es mío.</span>
        </button>
      </div>

      <div>
        <label className="text-[13.5px] font-bold text-[#F3E7DC]">Nombre de tu proyecto</label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          maxLength={150}
          className={CAMPO}
          placeholder={camino === 'armar' ? 'Puede ser un nombre provisional; el título final lo defines en el paso 1.' : 'El nombre con el que lo conoces.'}
        />
      </div>

      {camino === 'listo' && (
        <>
          <div>
            <label className="text-[13.5px] font-bold text-[#F3E7DC]">Tu proyecto (PDF o Word, hasta 30 MB)</label>
            <input type="file" accept=".pdf,.doc,.docx" onChange={alElegirArchivo} className="mt-1 block w-full text-[13px] text-[#F3E7DC]/80" />
            {archivo && <p className="mt-1 text-[12px] text-[#9BB18D]">Listo para subir: {archivo.name}</p>}
          </div>
          <div className="rounded-xl border border-[#B08D57]/35 bg-[#3B1727] p-3">
            <p className="text-[13px] font-bold text-[#E0B868]">Declaración de autoría</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-[#F3E7DC]/75">{TEXTO_DECLARACION_AUTORIA}</p>
            <label className="mt-3 block text-[13px] font-bold text-[#F3E7DC]">Tu nombre completo, como firma</label>
            <input value={declarante} onChange={(e) => setDeclarante(e.target.value)} maxLength={150} className={CAMPO} />
            <label className="mt-3 flex items-start gap-2 text-[13px] text-[#F3E7DC]">
              <input type="checkbox" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} className="mt-1" />
              <span>Leí y acepto esta declaración. Entiendo que queda registrada con mi nombre, la fecha, la hora y el archivo exacto que subo.</span>
            </label>
          </div>
        </>
      )}

      {error && <p className="text-[13px] text-[#E0917E]">{error}</p>}

      {camino === 'armar' ? (
        <button onClick={crear} disabled={cargando || sinCupo || !nombre.trim()} className={BOTON}>
          {cargando ? 'Creando…' : sinCupo ? 'Sin cupo disponible' : 'Empezar este proyecto (usa 1 del cupo)'}
        </button>
      ) : (
        <button
          onClick={subirListo}
          disabled={cargando || sinCupo || !nombre.trim() || !archivo || declarante.trim().length < 5 || !acepto}
          className={BOTON}
        >
          {cargando ? 'Subiendo…' : sinCupo ? 'Sin cupo disponible' : 'Subir mi proyecto (usa 1 del cupo)'}
        </button>
      )}
    </div>
  )
}
