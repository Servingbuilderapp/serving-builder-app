'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Botón del Documento final: pide a la IA el texto "Qué significa en tu proyecto" y lo guarda.
 * No se ve al imprimir. Al terminar, recarga la página para mostrar el texto guardado.
 */
export function TextoProyectoIA({ proyectoId, seccion, hayTexto }: { proyectoId: string; seccion: string; hayTexto: boolean }) {
  const router = useRouter()
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  async function pedir() {
    setCargando(true)
    setError('')
    try {
      const res = await fetch('/api/empresarial/ia-documento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proyecto_id: proyectoId, seccion }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'No se pudo redactar. Intenta de nuevo.')
      } else {
        router.refresh()
      }
    } catch {
      setError('No se pudo conectar. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="print:hidden">
      <button
        type="button"
        onClick={pedir}
        disabled={cargando}
        className="rounded-lg border border-ca-oro px-3 py-1.5 text-sm font-semibold text-ca-vino hover:bg-ca-suave disabled:opacity-60"
      >
        {cargando ? 'Redactando…' : hayTexto ? 'Volver a redactar' : 'Redactar con IA'}
      </button>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  )
}
