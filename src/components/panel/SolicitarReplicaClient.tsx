'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  CheckCircle2,
  ChevronRight,
  FileText,
  Loader2,
  Paperclip,
  Upload,
} from 'lucide-react'
import { PRECIOS_REPLICA, precioReplicaConEquivalencia, type ModalidadReplica } from '@/lib/precioReplicas'

/* ========================================================================== */
/* Estilo del panel (mismo lenguaje que el resto de pantallas del cliente)    */
/* ========================================================================== */

const RELIEVE_TARJETA =
  'shadow-[0_1px_2px_rgba(20,5,10,0.28),0_8px_24px_-14px_rgba(20,5,10,0.55)]'

const BOTON_DORADO =
  'bg-gradient-to-b from-[#E8C777] via-[#C9A46B] to-[#9C7A3E] text-[#2E0E1A] border border-[#7A5A2E]/60 ' +
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_4px_0_#7A5A2E,0_12px_20px_-6px_rgba(20,5,10,0.55)] ' +
  'hover:brightness-105 hover:-translate-y-0.5 ' +
  'active:translate-y-[3px] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_1px_0_#7A5A2E,0_4px_10px_-4px_rgba(20,5,10,0.5)] ' +
  'disabled:translate-y-0 disabled:hover:translate-y-0 disabled:brightness-90 disabled:shadow-none ' +
  'transition-all duration-150'

const BUCKET = 'documentos-proyectos'

function Tarjeta({ children }: { children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border border-[#6E4A50] bg-[#4C2032] ${RELIEVE_TARJETA}`}>{children}</div>
  )
}

const CAMPO =
  'w-full rounded-xl border border-[#6E4A50] bg-[#3B1727] px-3.5 py-3 text-[13.5px] leading-relaxed text-[#F3E7DC] outline-none transition-colors placeholder:text-[#F3E7DC]/40 focus:border-[#C9A46B] focus:bg-[#3B1727]'

const ETIQUETA = 'mb-1.5 block text-[12.5px] font-bold text-[#F3E7DC]/70'

/* ========================================================================== */
/* Paso 1: los datos de la solicitud                                         */
/* ========================================================================== */

function PasoDatos({
  onListo,
}: {
  /** Avisa hacia afuera el proyecto creado y la modalidad elegida, para que el
   *  paso 2 sepa si debe pedir el archivo de retroalimentación. */
  onListo: (proyectoId: string, modalidad: ModalidadReplica) => void
}) {
  const [nombreCliente, setNombreCliente] = useState('')
  const [telefonoWhatsapp, setTelefonoWhatsapp] = useState('')
  const [nombreIniciativa, setNombreIniciativa] = useState('')
  const [modalidad, setModalidad] = useState<ModalidadReplica | ''>('')
  const [retroalimentacionTexto, setRetroalimentacionTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const necesitaRetroalimentacion = modalidad === 'ya_presentado'

  const enviar = async () => {
    setError('')
    if (!nombreCliente.trim() || !telefonoWhatsapp.trim() || !nombreIniciativa.trim() || !modalidad) {
      setError('Completa el nombre, el WhatsApp, el proyecto y si ya se presentó antes.')
      return
    }
    if (necesitaRetroalimentacion && !retroalimentacionTexto.trim()) {
      setError('Cuéntanos qué retroalimentación les dieron. Después puedes subir el documento con más detalle.')
      return
    }

    setEnviando(true)
    try {
      const respuesta = await fetch('/api/replica/solicitar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreCliente,
          telefonoWhatsapp,
          nombreIniciativa,
          modalidad,
          retroalimentacionTexto,
        }),
      })
      const datos = await respuesta.json().catch(() => ({}))
      if (!respuesta.ok) throw new Error(datos?.error || 'No se pudo registrar la solicitud.')
      onListo(datos.proyectoId, modalidad)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar la solicitud.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Tarjeta>
      <div className="border-b border-[#6E4A50] px-5 py-4">
        <h2 className="text-[15px] font-extrabold tracking-tight text-[#F3E7DC]">
          Cuéntanos de tu proyecto
        </h2>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-[#F3E7DC]/70">
          Con esto registramos la solicitud. El documento se sube en el siguiente paso.
        </p>
      </div>

      <div className="space-y-4 px-5 py-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={ETIQUETA}>Tu nombre</label>
            <input
              value={nombreCliente}
              onChange={(e) => setNombreCliente(e.target.value)}
              placeholder="Nombre completo"
              className={CAMPO}
            />
          </div>
          <div>
            <label className={ETIQUETA}>WhatsApp de contacto</label>
            <input
              value={telefonoWhatsapp}
              onChange={(e) => setTelefonoWhatsapp(e.target.value)}
              placeholder="Ej: 300 000 0000"
              className={CAMPO}
            />
          </div>
        </div>

        <div>
          <label className={ETIQUETA}>Nombre del proyecto</label>
          <input
            value={nombreIniciativa}
            onChange={(e) => setNombreIniciativa(e.target.value)}
            placeholder="Con este nombre lo vamos a identificar"
            className={CAMPO}
          />
        </div>

        <div>
          <label className={ETIQUETA}>¿Ya presentaste este proyecto a una convocatoria?</label>
          <div className="grid gap-3 sm:grid-cols-2">
            {(['ya_presentado', 'no_presentado'] as ModalidadReplica[]).map((id) => {
              const opcion = PRECIOS_REPLICA[id]
              const elegida = modalidad === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setModalidad(id)}
                  className={`rounded-xl border px-4 py-3.5 text-left transition-colors ${
                    elegida
                      ? 'border-[#C9A46B] bg-[#3B1727]'
                      : 'border-[#6E4A50] bg-[#3B1727] hover:bg-[#4C2032]'
                  }`}
                >
                  <p className="text-[13.5px] font-bold text-[#F3E7DC]">
                    {id === 'ya_presentado' ? 'Sí, ya la presenté' : 'No, todavía no'}
                  </p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-[#F3E7DC]/70">{opcion.descripcionCorta}</p>
                  <p className="mt-2 text-[12px] font-bold text-[#C9A46B]">{precioReplicaConEquivalencia(id)}</p>
                </button>
              )
            })}
          </div>
        </div>

        {necesitaRetroalimentacion ? (
          <div>
            <label className={ETIQUETA}>¿Qué retroalimentación te dieron?</label>
            <textarea
              value={retroalimentacionTexto}
              onChange={(e) => setRetroalimentacionTexto(e.target.value)}
              rows={4}
              placeholder="Cuéntanos qué te dijeron — aprobado, no aprobado, qué observaciones hicieron…"
              className={CAMPO}
            />
            <p className="mt-1.5 text-[12px] text-[#F3E7DC]/50">
              Si tienes el documento con la retroalimentación, lo subes en el siguiente paso.
            </p>
          </div>
        ) : null}

        {error ? <p className="text-[12.5px] font-semibold text-[#E0917E]">{error}</p> : null}

        <button
          type="button"
          onClick={enviar}
          disabled={enviando}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-extrabold disabled:cursor-not-allowed disabled:opacity-70 ${BOTON_DORADO}`}
        >
          {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
          {enviando ? 'Guardando…' : 'Continuar'}
        </button>
      </div>
    </Tarjeta>
  )
}

/* ========================================================================== */
/* Paso 2: subir el documento (y la retroalimentación, si aplica)             */
/* ========================================================================== */

function PasoDocumentos({
  proyectoId,
  necesitaRetroalimentacion,
}: {
  proyectoId: string
  necesitaRetroalimentacion: boolean
}) {
  const [documentoSubido, setDocumentoSubido] = useState<string | null>(null)
  const [feedbackSubido, setFeedbackSubido] = useState<string | null>(null)
  const [subiendoDocumento, setSubiendoDocumento] = useState(false)
  const [subiendoFeedback, setSubiendoFeedback] = useState(false)
  const [error, setError] = useState('')
  const [arrancado, setArrancado] = useState(false)

  const subirDocumento = async (evento: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0]
    if (!archivo) return
    setSubiendoDocumento(true)
    setError('')
    try {
      const supabase = createClient()
      const ruta = `${proyectoId}/${Date.now()}-${archivo.name}`
      const { error: errorSubida } = await supabase.storage.from(BUCKET).upload(ruta, archivo)
      if (errorSubida) throw errorSubida

      await supabase
        .from('proyectos_clientes_serving')
        .update({ archivo_proyecto_url: ruta, archivo_proyecto_nombre: archivo.name })
        .eq('id', proyectoId)

      setDocumentoSubido(archivo.name)

      // Con el documento en la mano, arranca el Motor 1 — la misma cadena que
      // usa cualquier proyecto de la plataforma.
      const respuesta = await fetch('/api/arrancar-estructuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proyectoId }),
      })
      const datos = await respuesta.json().catch(() => ({}))
      setArrancado(Boolean(datos?.arrancado))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir el documento.')
    } finally {
      setSubiendoDocumento(false)
      evento.target.value = ''
    }
  }

  const subirFeedback = async (evento: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0]
    if (!archivo) return
    setSubiendoFeedback(true)
    setError('')
    try {
      const supabase = createClient()
      const ruta = `${proyectoId}/retroalimentacion-${Date.now()}-${archivo.name}`
      const { error: errorSubida } = await supabase.storage.from(BUCKET).upload(ruta, archivo)
      if (errorSubida) throw errorSubida

      const { data: urlData } = await supabase.storage.from(BUCKET).createSignedUrl(ruta, 60 * 60 * 24 * 365)

      const respuesta = await fetch('/api/replica/solicitar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proyectoId,
          retroalimentacionArchivoUrl: urlData?.signedUrl || ruta,
          retroalimentacionArchivoNombre: archivo.name,
        }),
      })
      if (!respuesta.ok) {
        const datos = await respuesta.json().catch(() => ({}))
        throw new Error(datos?.error || 'No se pudo guardar el archivo de retroalimentación.')
      }

      setFeedbackSubido(archivo.name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir el archivo.')
    } finally {
      setSubiendoFeedback(false)
      evento.target.value = ''
    }
  }

  return (
    <Tarjeta>
      <div className="border-b border-[#6E4A50] px-5 py-4">
        <h2 className="text-[15px] font-extrabold tracking-tight text-[#F3E7DC]">
          Sube tu proyecto
        </h2>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-[#F3E7DC]/70">
          El documento con tu proyecto ya estructurado. PDF o Word.
        </p>
      </div>

      <div className="space-y-5 px-5 py-5">
        <div>
          {documentoSubido ? (
            <div className="flex items-center gap-2.5 rounded-xl border border-[#7A8B6F]/40 bg-[#7A8B6F]/15 px-3.5 py-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#A9BC9C]" />
              <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-[#F3E7DC]">
                {documentoSubido}
              </span>
            </div>
          ) : (
            <label
              className={`flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-[#B08D57]/40 bg-[#3B1727] px-4 py-5 text-[13.5px] font-bold text-[#C9A46B] transition-colors hover:bg-[#4C2032] ${
                subiendoDocumento ? 'pointer-events-none opacity-70' : ''
              }`}
            >
              {subiendoDocumento ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
              {subiendoDocumento ? 'Subiendo…' : 'Subir el documento de tu proyecto'}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={subirDocumento}
                disabled={subiendoDocumento}
                className="hidden"
              />
            </label>
          )}
        </div>

        {necesitaRetroalimentacion ? (
          <div>
            <p className={ETIQUETA}>Documento de la retroalimentación (opcional)</p>
            {feedbackSubido ? (
              <div className="flex items-center gap-2.5 rounded-xl border border-[#7A8B6F]/40 bg-[#7A8B6F]/15 px-3.5 py-3">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#A9BC9C]" />
                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-[#F3E7DC]">
                  {feedbackSubido}
                </span>
              </div>
            ) : (
              <label
                className={`flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-[#6E4A50] bg-[#3B1727] px-4 py-4 text-[13px] font-bold text-[#F3E7DC]/70 transition-colors hover:bg-[#4C2032] ${
                  subiendoFeedback ? 'pointer-events-none opacity-70' : ''
                }`}
              >
                {subiendoFeedback ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                {subiendoFeedback ? 'Subiendo…' : 'Subir documento de retroalimentación'}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={subirFeedback}
                  disabled={subiendoFeedback}
                  className="hidden"
                />
              </label>
            )}
          </div>
        ) : null}

        {error ? <p className="text-[12.5px] font-semibold text-[#E0917E]">{error}</p> : null}

        {documentoSubido ? (
          <div className="rounded-xl border border-[#7A8B6F]/40 bg-[#7A8B6F]/15 px-4 py-3.5">
            <p className="flex items-center gap-2 text-[13px] font-bold text-[#A9BC9C]">
              <FileText className="h-4 w-4" /> Quedó registrado
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-[#A9BC9C]">
              {arrancado
                ? 'Ya empezamos a trabajar tu proyecto. Nuestro equipo revisa la solicitud y te contacta por WhatsApp.'
                : 'Tu proyecto quedó guardado. Nuestro equipo lo revisa y te contacta por WhatsApp.'}
            </p>
            <Link
              href="/mis-replicas"
              className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#C9A46B] underline underline-offset-2"
            >
              Ver mis réplicas <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : null}
      </div>
    </Tarjeta>
  )
}

/* ========================================================================== */
/* Pantalla                                                                   */
/* ========================================================================== */

export function SolicitarReplicaClient() {
  const [proyectoId, setProyectoId] = useState<string | null>(null)
  const [modalidadElegida, setModalidadElegida] = useState<ModalidadReplica | null>(null)

  return (
    <div className="min-h-full bg-[#54142B] px-4 py-6 lg:px-6">
      <header className="mb-5">
        <h1 className="text-[19px] font-extrabold tracking-tight text-[#F3E7DC]">Solicitar una réplica</h1>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[#F3E7DC]/70">
          Súbenos tu proyecto ya estructurado y lo que necesites replicar — otro territorio, otra
          convocatoria, otro presupuesto — y nuestro equipo se encarga del resto.
        </p>
      </header>

      <div className="max-w-2xl">
        {!proyectoId ? (
          <PasoDatos
            onListo={(id, modalidad) => {
              setProyectoId(id)
              setModalidadElegida(modalidad)
            }}
          />
        ) : (
          <PasoDocumentos
            proyectoId={proyectoId}
            necesitaRetroalimentacion={modalidadElegida === 'ya_presentado'}
          />
        )}
      </div>
    </div>
  )
}
