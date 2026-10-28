'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import { Aviso } from '@/components/ui/Aviso'
import { CheckCircle2, Sparkles } from 'lucide-react'

export type HallazgoParaMostrar = {
  categoria: string
  descripcion: string
  critico: boolean
}

export type CalificacionFinalDatos = {
  idProyecto: string
  nombreProyecto: string
  puntaje: number
  veredicto: 'aprobado' | 'con_observaciones'
  hallazgos: HallazgoParaMostrar[]
  /** true cuando el Motor 2 ya arrancó (por el cliente o por el reloj de 3 días). */
  busquedaIniciada: boolean
  /** cuándo aprobó el evaluador, para calcular cuánto falta del plazo de 3 días. */
  aprobadoEnISO: string | null
}


export function CalificacionFinal({ datos, soloLectura = false }: { datos: CalificacionFinalDatos; soloLectura?: boolean }) {
  const router = useRouter()
  const [trabajando, setTrabajando] = useState(false)
  const [aviso, setAviso] = useState<{ tono: 'exito' | 'error'; texto: string } | null>(null)

  const aprobar = async () => {
    setTrabajando(true)
    setAviso(null)
    try {
      const res = await fetch('/api/aprobar-busqueda-convocatorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_proyecto: datos.idProyecto }),
      })
      const cuerpo = await res.json()
      if (!res.ok || cuerpo?.ok === false) {
        setAviso({ tono: 'error', texto: cuerpo?.error || 'No se pudo guardar tu decisión.' })
        return
      }
      setAviso({ tono: 'exito', texto: cuerpo?.mensaje || 'Listo.' })
      router.refresh()
    } catch {
      setAviso({ tono: 'error', texto: 'Se cayó la conexión. Intenta otra vez.' })
    } finally {
      setTrabajando(false)
    }
  }

  const hallazgosCriticos = datos.hallazgos.filter((h) => h.critico)
  const hallazgosNormales = datos.hallazgos.filter((h) => !h.critico)

  return (
    <div className="min-h-screen bg-color-base-100 py-10 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-color-base-content">Calificación final</h1>
          <p className="text-color-base-content/60 text-sm mt-1">
            La nota que le puso el evaluador automático a la estructuración de tu proyecto.
          </p>
        </div>

        <GlassCard className="p-8 text-center space-y-2">
          <div className="text-5xl font-black text-color-primary">{datos.puntaje}</div>
          <p className="text-color-base-content/60 text-sm">sobre 100</p>
          {datos.veredicto === 'aprobado' ? (
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-color-base-content">
              <CheckCircle2 className="h-4 w-4 text-color-primary" /> Aprobado
            </p>
          ) : (
            <p className="text-sm font-semibold text-color-base-content">Con observaciones</p>
          )}
        </GlassCard>

        {datos.veredicto === 'aprobado' ? (
          <GlassCard className="p-6 space-y-4">
            <h2 className="text-base font-black text-color-base-content">
              ¿Buscamos convocatorias para tu proyecto?
            </h2>

            {datos.busquedaIniciada ? (
              <Aviso tipo="exito" titulo="Ya empezamos">
                La búsqueda de convocatorias para tu proyecto ya está en marcha.
              </Aviso>
            ) : (
              <>
                <p className="text-sm text-color-base-content/80 leading-relaxed">
                  Tu proyecto quedó aprobado. Si estás de acuerdo con el resultado, dale a
                  &ldquo;Sí, busquemos convocatorias&rdquo; y arrancamos ya mismo.
                </p>
                <Aviso tipo="info" titulo="La búsqueda arranca sola">
                  No tienes que esperar ni aprobar nada: la búsqueda de convocatorias empieza
                  automáticamente en pocos minutos.
                </Aviso>
                {soloLectura ? null : (
                  <GlowButton onClick={aprobar} disabled={trabajando} className="w-full sm:w-auto">
                    <Sparkles className="h-4 w-4" />
                    {trabajando ? 'Guardando…' : 'Sí, busquemos convocatorias'}
                  </GlowButton>
                )}
                {aviso ? (
                  <Aviso tipo={aviso.tono} titulo={aviso.tono === 'exito' ? 'Listo' : 'No se pudo'}>
                    {aviso.texto}
                  </Aviso>
                ) : null}
              </>
            )}
          </GlassCard>
        ) : (
          <Aviso tipo="alerta" titulo="Todavía con observaciones">
            El evaluador encontró puntos por confirmar. Ya te los dejamos preguntando en
            &ldquo;Lo que me piden&rdquo; para que los resuelvas cuando puedas. Mientras tanto la
            búsqueda de convocatorias sigue su camino con lo que ya tenemos, sin inventar nada.
          </Aviso>
        )}

        {hallazgosCriticos.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-base font-black text-color-base-content">Para confirmar</h2>
            {hallazgosCriticos.map((h, i) => (
              <Aviso key={i} tipo="alerta" titulo={h.categoria}>
                {h.descripcion}
              </Aviso>
            ))}
          </div>
        ) : null}

        {hallazgosNormales.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-base font-black text-color-base-content">Otros detalles revisados</h2>
            {hallazgosNormales.map((h, i) => (
              <GlassCard key={i} className="p-5 space-y-1">
                <p className="text-xs font-bold uppercase tracking-wide text-color-primary">{h.categoria}</p>
                <p className="text-sm text-color-base-content/80 leading-relaxed">{h.descripcion}</p>
              </GlassCard>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function CalificacionFinalSinProyecto() {
  return (
    <div className="min-h-screen bg-color-base-100 flex items-center justify-center px-4">
      <GlassCard className="p-8 max-w-md text-center">
        <p className="text-color-base-content/70 text-sm">
          Todavía no tienes un proyecto activo. Esta pantalla se llena apenas
          contrates tu estructuración.
        </p>
      </GlassCard>
    </div>
  )
}

export function CalificacionFinalSinEvaluar({ nombreProyecto }: { nombreProyecto: string }) {
  return (
    <div className="min-h-screen bg-color-base-100 flex items-center justify-center px-4">
      <GlassCard className="p-8 max-w-md text-center space-y-2">
        <h2 className="text-base font-black text-color-base-content">{nombreProyecto}</h2>
        <p className="text-color-base-content/70 text-sm">
          Todavía no hay una calificación: se genera sola cuando tu estructuración
          llegue al final.
        </p>
      </GlassCard>
    </div>
  )
}
