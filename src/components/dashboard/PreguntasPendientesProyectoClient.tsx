'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertTriangle } from 'lucide-react'

interface Pregunta {
  id: string
  idPaso: number
  nombrePaso: string
  pregunta: string
  critico: boolean
}

interface Props {
  proyectoId: string
  preguntasIniciales: Pregunta[]
}

export function PreguntasPendientesProyectoClient({ preguntasIniciales }: Props) {
  const router = useRouter()
  const [preguntas, setPreguntas] = useState<Pregunta[]>(preguntasIniciales)
  const [indiceActual, setIndiceActual] = useState(0)
  const [respuestaTexto, setRespuestaTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const preguntaActual = preguntas[indiceActual]

  if (!preguntaActual) {
    return (
      <div className="p-8 rounded-3xl border border-[#7A8B6F]/40 bg-[#7A8B6F]/10 text-center">
        <p className="text-sm font-bold text-[#A9BC9C]">
          ¡Ya respondiste todas las preguntas pendientes por ahora!
        </p>
      </div>
    )
  }

  const handleEnviar = async () => {
    if (!respuestaTexto.trim()) return
    setEnviando(true)
    setError('')
    try {
      const res = await fetch('/api/responder-pregunta-proyecto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_pregunta: preguntaActual.id,
          respuesta: respuestaTexto,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Hubo un problema al enviar tu respuesta.')

      setRespuestaTexto('')

      if (indiceActual + 1 < preguntas.length) {
        setIndiceActual(indiceActual + 1)
      } else {
        // Ya no quedan más preguntas en este lote; refrescamos por si el servidor generó nuevas
        router.refresh()
        setPreguntas([])
      }
    } catch (err: any) {
      setError(err.message || 'Hubo un problema al enviar tu respuesta.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="p-8 rounded-3xl border border-[#6E4A50] bg-[#4C2032] space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-[#F3E7DC]">
          Nos falta un poco de información
        </h3>
        <span className="text-xs font-bold text-[#F3E7DC]/50">
          {indiceActual + 1} de {preguntas.length}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wide text-[#C9A46B]">
            {preguntaActual.nombrePaso}
          </span>
          {preguntaActual.critico && (
            <span className="flex items-center gap-1 text-xs font-bold text-[#E0B868] bg-[#C99A3D]/15 px-2 py-0.5 rounded-full">
              <AlertTriangle className="w-3 h-3" />
              Punto clave
            </span>
          )}
        </div>
        <p className="text-sm text-[#F3E7DC]">{preguntaActual.pregunta}</p>
      </div>

      <textarea
        value={respuestaTexto}
        onChange={(e) => setRespuestaTexto(e.target.value)}
        placeholder="Escribe tu respuesta aquí..."
        rows={4}
        disabled={enviando}
        className="w-full p-4 rounded-2xl border border-[#6E4A50] bg-[#3B1727] text-[#F3E7DC] text-sm placeholder:text-[#F3E7DC]/40 focus:outline-none focus:ring-2 focus:ring-[#C9A46B]/30"
      />

      {error && <p className="text-xs text-[#E0917E] font-bold">{error}</p>}

      <button
        onClick={handleEnviar}
        disabled={enviando || !respuestaTexto.trim()}
        className="w-full py-3 rounded-2xl bg-[#C9A46B] text-[#3B1727] font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {enviando ? 'Enviando...' : 'Enviar respuesta'}
      </button>
    </div>
  )
}
