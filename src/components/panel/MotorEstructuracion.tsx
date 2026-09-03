'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle2, FileWarning, Loader2, Play, RefreshCw } from 'lucide-react'

export type DocumentoDePartida = {
  nombre: string
  ruta: string
  tipo: 'pdf' | 'imagen' | 'word'
}

const RELIEVE_TARJETA =
  'shadow-[0_1px_2px_rgba(11,42,74,0.04),0_8px_24px_-14px_rgba(11,42,74,0.18)]'

const RELIEVE_BOTON =
  'shadow-[0_1px_2px_rgba(11,42,74,0.10),0_10px_20px_-12px_rgba(29,78,216,0.55)]'

/**
 * El botón que arranca la estructuración automática (Motor 1).
 *
 * Hasta ahora el motor existía pero no había forma de encenderlo: el único
 * sitio que lo llamaba era un componente que ya nadie usa, así que un proyecto
 * pagado se quedaba en cero esperando a que alguien empujara una máquina que
 * nadie podía empujar. Esta tarjeta es ese empujón, y vive en la pantalla del
 * equipo porque es el equipo quien decide con qué documento se arranca.
 *
 * Mientras el motor trabaja se refresca la pantalla cada pocos segundos, así
 * que los contadores de arriba ("pasos escritos") van subiendo solos.
 */
export function MotorEstructuracion({
  proyectoId,
  documentos,
  pasosEscritos,
  totalPasos,
}: {
  proyectoId: string
  documentos: DocumentoDePartida[]
  pasosEscritos: number
  totalPasos: number
}) {
  const router = useRouter()
  const [rutaElegida, setRutaElegida] = useState(documentos[0]?.ruta || '')
  const [corriendo, setCorriendo] = useState(false)
  const [error, setError] = useState('')
  const [resultado, setResultado] = useState<{
    pasos: number
    listoParaEncaje: boolean
  } | null>(null)

  // Mientras el motor trabaja, volvemos a pedirle los datos al servidor cada
  // ocho segundos para que el avance se vea moverse sin recargar a mano.
  useEffect(() => {
    if (!corriendo) return
    const reloj = setInterval(() => router.refresh(), 8000)
    return () => clearInterval(reloj)
  }, [corriendo, router])

  const arrancar = async () => {
    const documento = documentos.find((d) => d.ruta === rutaElegida)
    if (!documento) {
      setError('Elige primero el documento con el que quieres arrancar.')
      return
    }

    setCorriendo(true)
    setError('')
    setResultado(null)

    try {
      const respuesta = await fetch('/api/estructurar-proyecto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_proyecto: proyectoId,
          ruta_documento: documento.ruta,
          tipo_archivo: documento.tipo,
        }),
      })

      const datos = await respuesta.json().catch(() => ({}))

      if (!respuesta.ok) {
        throw new Error(
          datos?.error ||
            'La estructuración no pudo terminar. Vuelve a intentarlo en un momento.',
        )
      }

      setResultado({
        pasos: Number(datos?.pasos_procesados || 0),
        listoParaEncaje: datos?.listo_para_encaje === true,
      })
      router.refresh()
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'La estructuración no pudo terminar. Vuelve a intentarlo en un momento.',
      )
      router.refresh()
    } finally {
      setCorriendo(false)
    }
  }

  const yaHayContenido = pasosEscritos > 0

  return (
    <div className={`rounded-2xl border border-[#E4EAF3] bg-white p-5 ${RELIEVE_TARJETA}`}>
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
        <Play className="h-3.5 w-3.5" />
        Estructuración automática
      </div>

      <h2 className="mt-1 text-[16px] font-extrabold leading-tight text-[#0B2A4A]">
        {yaHayContenido
          ? 'Completar el proyecto con un documento nuevo'
          : 'Arrancar la estructuración de este proyecto'}
      </h2>

      <p className="mt-2 text-[13px] leading-relaxed text-[#5B6B84]">
        {yaHayContenido
          ? 'Vuelve a pasar la información por el motor. Lo que ya está escrito no se borra: el documento nuevo sirve para completar lo que quedó en blanco o débil.'
          : 'El motor lee el documento del cliente y escribe el contenido de cada paso. Tarda un par de minutos y no hay que hacer nada más mientras tanto.'}
      </p>

      {documentos.length === 0 ? (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#FDE6C8] bg-[#FFFBF3] px-4 py-3">
          <FileWarning className="mt-0.5 h-4 w-4 shrink-0 text-[#8A5307]" />
          <div>
            <p className="text-[13px] font-bold text-[#8A5307]">
              El cliente todavía no ha subido ningún documento que sirva
            </p>
            <p className="mt-0.5 text-[12.5px] text-[#5B6B84]">
              La estructuración necesita al menos un PDF, un Word o una imagen. El cliente los
              sube desde «Lo que me piden».
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="min-w-0 flex-1">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#5B6B84]">
              Documento de partida
            </span>
            <select
              value={rutaElegida}
              onChange={(e) => setRutaElegida(e.target.value)}
              disabled={corriendo}
              className="w-full rounded-xl border border-[#E4EAF3] bg-[#F8FAFD] px-3 py-2.5 text-[13.5px] font-semibold text-[#0B2A4A] outline-none transition focus:border-[#1D4ED8] disabled:opacity-60"
            >
              {documentos.map((d) => (
                <option key={d.ruta} value={d.ruta}>
                  {d.nombre}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={arrancar}
            disabled={corriendo}
            className={`inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-[13.5px] font-extrabold text-white transition-transform hover:-translate-y-px disabled:translate-y-0 disabled:opacity-70 ${RELIEVE_BOTON}`}
          >
            {corriendo ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Trabajando…
              </>
            ) : (
              <>
                {yaHayContenido ? (
                  <RefreshCw className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {yaHayContenido ? 'Volver a pasar el motor' : 'Arrancar la estructuración'}
              </>
            )}
          </button>
        </div>
      )}

      {corriendo ? (
        <div className="mt-4 rounded-xl border border-[#CFE0FB] bg-[#EFF6FF] px-4 py-3">
          <p className="text-[13px] font-bold text-[#1D4ED8]">
            Escribiendo el proyecto… {pasosEscritos} de {totalPasos} pasos van escritos
          </p>
          <p className="mt-0.5 text-[12.5px] text-[#5B6B84]">
            No cierres esta pantalla. El avance de aquí arriba se actualiza solo.
          </p>
        </div>
      ) : null}

      {resultado ? (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#BFE7D2] bg-[#F1FBF6] px-4 py-3">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#186A46]" />
          <div>
            <p className="text-[13px] font-bold text-[#186A46]">
              Listo. El motor trabajó {resultado.pasos}{' '}
              {resultado.pasos === 1 ? 'paso' : 'pasos'}.
            </p>
            <p className="mt-0.5 text-[12.5px] text-[#5B6B84]">
              {resultado.listoParaEncaje
                ? 'El proyecto quedó completo, así que la búsqueda de convocatorias arrancó sola.'
                : 'Revisa abajo lo que quedó escrito y corrige lo que haga falta.'}
            </p>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#F5C2C2] bg-[#FDF3F3] px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B42318]" />
          <div>
            <p className="text-[13px] font-bold text-[#B42318]">{error}</p>
            <p className="mt-0.5 text-[12.5px] text-[#5B6B84]">
              Si alcanzó a escribir algo, ya quedó guardado abajo.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
