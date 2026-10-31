'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * "Quiero postular": el cliente decide seguir con esta convocatoria y la
 * plataforma prepara la postulación sola. El equipo recibe el informe.
 */
export function BotonQuieroPostular({
  proyectoId,
  bibliotecaId,
  candidataId,
  enEspera = false,
  permisoPedido = false,
}: {
  proyectoId: string
  bibliotecaId: string
  candidataId: string
  enEspera?: boolean
  permisoPedido?: boolean
}) {
  const router = useRouter()
  const [estado, setEstado] = useState<'libre' | 'enviando' | 'listo' | 'confirmar' | 'descartando' | 'sin_cupo' | 'pidiendo'>('libre')
  const [error, setError] = useState<string | null>(null)

  const postular = async () => {
    setEstado('enviando')
    setError(null)
    try {
      const respuesta = await fetch('/api/postulacion/quiero-postular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_proyecto: proyectoId, id_biblioteca: bibliotecaId, id_candidata: candidataId }),
      })
      const datos = await respuesta.json().catch(() => ({}))
      if (respuesta.status === 409 && datos?.necesita_permiso) {
        setError(datos.error)
        setEstado('sin_cupo')
        return
      }
      if (!respuesta.ok) throw new Error(datos?.error || 'No se pudo iniciar la postulación.')
      setEstado('listo')
      router.refresh()
    } catch (e) {
      setError((e as Error).message)
      setEstado('libre')
    }
  }

  const pedirPermiso = async () => {
    setEstado('pidiendo')
    setError(null)
    try {
      const respuesta = await fetch('/api/postulacion/quiero-postular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'pedir_permiso', id_proyecto: proyectoId, id_candidata: candidataId }),
      })
      const datos = await respuesta.json().catch(() => ({}))
      if (!respuesta.ok) throw new Error(datos?.error || 'No se pudo pedir el permiso.')
      router.refresh()
    } catch (e) {
      setError((e as Error).message)
      setEstado('sin_cupo')
    }
  }

  const esperar = async () => {
    setEstado('enviando')
    setError(null)
    try {
      const respuesta = await fetch('/api/postulacion/quiero-postular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'esperar', id_proyecto: proyectoId, id_candidata: candidataId }),
      })
      const datos = await respuesta.json().catch(() => ({}))
      if (!respuesta.ok) throw new Error(datos?.error || 'No se pudo guardar.')
      router.refresh()
    } catch (e) {
      setError((e as Error).message)
    }
    setEstado('libre')
  }

  const descartar = async () => {
    setEstado('descartando')
    setError(null)
    try {
      const respuesta = await fetch('/api/postulacion/quiero-postular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'descartar', id_proyecto: proyectoId, id_candidata: candidataId }),
      })
      const datos = await respuesta.json().catch(() => ({}))
      if (!respuesta.ok) throw new Error(datos?.error || 'No se pudo descartar.')
      router.refresh()
    } catch (e) {
      setError((e as Error).message)
      setEstado('libre')
    }
  }

  if (permisoPedido) {
    return (
      <p className="mt-3 text-[13px] font-bold text-[#E0B868]">
        Pediste permiso para postular a esta convocatoria. Te respondemos pronto.
      </p>
    )
  }

  if (estado === 'sin_cupo' || estado === 'pidiendo') {
    return (
      <div className="mt-3">
        <p className="text-[13px] font-bold text-[#E0B868]">{error}</p>
        <button
          type="button"
          onClick={pedirPermiso}
          disabled={estado === 'pidiendo'}
          className="mt-2 rounded-xl bg-gradient-to-b from-[#C9A46B] to-[#B08D57] px-5 py-2.5 text-[14px] font-extrabold text-[#3A1420] shadow-[0_1px_2px_rgba(20,5,10,0.4)] hover:brightness-110 disabled:opacity-50"
        >
          {estado === 'pidiendo' ? 'Pidiendo…' : 'Pedir permiso para otra'}
        </button>
      </div>
    )
  }

  if (estado === 'listo') {
    return (
      <p className="mt-3 text-[13px] font-bold text-[#C9A46B]">
        ✔ Listo. Estamos preparando tu postulación; en unos minutos verás aquí el avance.
      </p>
    )
  }

  return (
    <div className="mt-3">
      {enEspera ? (
        <p className="mb-2 text-[12.5px] font-bold text-[#E0B868]">En espera: la dejaste para decidir más adelante.</p>
      ) : null}
      <button
        type="button"
        onClick={postular}
        disabled={estado === 'enviando'}
        className="rounded-xl bg-gradient-to-b from-[#C9A46B] to-[#B08D57] px-5 py-2.5 text-[14px] font-extrabold text-[#3A1420] shadow-[0_1px_2px_rgba(20,5,10,0.4),0_8px_20px_-12px_rgba(20,5,10,0.6)] hover:brightness-110 disabled:opacity-50"
      >
        {estado === 'enviando' ? 'Iniciando…' : 'Quiero postular'}
      </button>
      {estado === 'confirmar' || estado === 'descartando' ? (
        <span className="ml-3 inline-flex items-center gap-2 text-[13px] text-[#F3E7DC]/80">
          ¿Descartar esta convocatoria?
          <button
            type="button"
            onClick={descartar}
            disabled={estado === 'descartando'}
            className="rounded-lg border border-[#E0917E]/60 px-3 py-1.5 text-[13px] font-bold text-[#E0917E] disabled:opacity-50"
          >
            {estado === 'descartando' ? 'Descartando…' : 'Sí, descartar'}
          </button>
          <button type="button" onClick={() => setEstado('libre')} className="text-[13px] font-bold text-[#F3E7DC]/70 underline">
            No
          </button>
        </span>
      ) : (
        <>
          {enEspera ? null : (
            <button
              type="button"
              onClick={esperar}
              disabled={estado === 'enviando'}
              className="ml-3 rounded-xl border border-[#B08D57]/50 px-4 py-2.5 text-[14px] font-bold text-[#F3E7DC]/80 hover:border-[#C9A46B] disabled:opacity-50"
            >
              Esperar
            </button>
          )}
        <button
          type="button"
          onClick={() => setEstado('confirmar')}
          disabled={estado === 'enviando'}
          className="ml-3 rounded-xl border border-[#B08D57]/50 px-4 py-2.5 text-[14px] font-bold text-[#F3E7DC]/80 hover:border-[#C9A46B] disabled:opacity-50"
        >
          Descartar
        </button>
        </>
      )}
      {error ? <p className="mt-1.5 text-[12.5px] font-bold text-[#E0917E]">{error}</p> : null}
    </div>
  )
}
