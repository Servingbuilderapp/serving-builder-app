'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  FileText,
  Loader2,
  MessageSquare,
  Paperclip,
  Upload,
} from 'lucide-react'

/* ========================================================================== */
/* Tipos                                                                      */
/* ========================================================================== */

export type PreguntaPendiente = {
  id: string
  nombrePaso: string
  pregunta: string
  critico: boolean
}

export type DocumentoPedido = {
  id: string
  requisito: string
  obligatorio: boolean
  nota: string | null
  origen: string | null
}

export type ArchivoSubido = {
  nombre: string
  ruta: string
  url: string | null
  fecha: string | null
}

export type DatosPendientes = {
  proyectoId: string
  nombreProyecto: string
  preguntas: PreguntaPendiente[]
  documentosPedidos: DocumentoPedido[]
  archivoBase: { nombre: string; url: string | null } | null
  archivosSubidos: ArchivoSubido[]
}

/* ========================================================================== */
/* Estilo del panel (mismo lenguaje que Avance de mi proyecto)                */
/* ========================================================================== */

const SOMBRA_TARJETA =
  'shadow-[0_1px_2px_rgba(11,42,74,0.06),0_8px_24px_-14px_rgba(11,42,74,0.20)]'

const RELIEVE_BOTON =
  'shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_2px_4px_rgba(11,42,74,0.18),0_8px_18px_-10px_rgba(29,78,216,0.55)]'

const BUCKET = 'documentos-proyectos'

function Tarjeta({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-2xl border border-[#E4EAF3] bg-white ${SOMBRA_TARJETA} ${className}`}>
      {children}
    </div>
  )
}

function TituloBloque({
  icono: Icono,
  titulo,
  descripcion,
  contador,
}: {
  icono: React.ElementType
  titulo: string
  descripcion: string
  contador?: string
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#EEF2F8] px-5 py-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#1D4ED8]">
          <Icono className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-[15px] font-extrabold tracking-tight text-[#0B2A4A]">{titulo}</h2>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-[#5B6B84]">{descripcion}</p>
        </div>
      </div>
      {contador ? (
        <span className="shrink-0 rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[11px] font-bold text-[#5B6B84]">
          {contador}
        </span>
      ) : null}
    </div>
  )
}

/* ========================================================================== */
/* Preguntas                                                                  */
/* ========================================================================== */

function BloquePreguntas({ preguntasIniciales }: { preguntasIniciales: PreguntaPendiente[] }) {
  const [preguntas, setPreguntas] = useState<PreguntaPendiente[]>(preguntasIniciales)
  const [indice, setIndice] = useState(0)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [respondidas, setRespondidas] = useState(0)

  const actual = preguntas[indice]

  const enviar = async () => {
    if (!actual || !texto.trim()) return
    setEnviando(true)
    setError('')
    try {
      const res = await fetch('/api/responder-pregunta-proyecto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_pregunta: actual.id, respuesta: texto }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'No se pudo enviar tu respuesta.')

      setTexto('')
      setRespondidas((n) => n + 1)

      if (indice + 1 < preguntas.length) {
        setIndice(indice + 1)
      } else {
        setPreguntas([])
        setIndice(0)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar tu respuesta.')
    } finally {
      setEnviando(false)
    }
  }

  if (!actual) {
    return (
      <Tarjeta>
        <TituloBloque
          icono={MessageSquare}
          titulo="Preguntas por responder"
          descripcion="Cuando al equipo le falte un dato tuyo, la pregunta aparece aquí."
        />
        <div className="flex items-center gap-3 px-5 py-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F6F0] text-[#186A46]">
            <Check className="h-4 w-4" />
          </span>
          <p className="text-[13.5px] font-semibold text-[#186A46]">
            {respondidas > 0
              ? 'Listo. Respondiste todo lo que estaba pendiente.'
              : 'No hay preguntas pendientes por ahora.'}
          </p>
        </div>
      </Tarjeta>
    )
  }

  return (
    <Tarjeta>
      <TituloBloque
        icono={MessageSquare}
        titulo="Preguntas por responder"
        descripcion="Responde con tus palabras. Con eso el equipo completa la parte del proyecto que quedó floja."
        contador={`${indice + 1} de ${preguntas.length}`}
      />

      <div className="space-y-4 px-5 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[11px] font-bold text-[#5B6B84]">
            {actual.nombrePaso}
          </span>
          {actual.critico ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2.5 py-1 text-[11px] font-bold text-[#8A5307]">
              <AlertTriangle className="h-3 w-3" /> Importante
            </span>
          ) : null}
        </div>

        <p className="text-[14.5px] font-semibold leading-relaxed text-[#0B2A4A]">
          {actual.pregunta}
        </p>

        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={5}
          placeholder="Escribe aquí tu respuesta…"
          className="w-full rounded-xl border border-[#DCE4F0] bg-[#FBFDFF] px-3.5 py-3 text-[13.5px] leading-relaxed text-[#0F172A] outline-none transition-colors placeholder:text-[#A3B0C2] focus:border-[#1D4ED8] focus:bg-white"
        />

        {error ? <p className="text-[12.5px] font-semibold text-[#B42318]">{error}</p> : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={enviar}
            disabled={enviando || !texto.trim()}
            className={`inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-[13px] font-bold text-white transition-transform ${RELIEVE_BOTON} hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0`}
          >
            {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {enviando ? 'Enviando…' : 'Enviar respuesta'}
          </button>

          {indice + 1 < preguntas.length ? (
            <button
              type="button"
              onClick={() => {
                setTexto('')
                setError('')
                setIndice(indice + 1)
              }}
              disabled={enviando}
              className="text-[12.5px] font-semibold text-[#5B6B84] underline underline-offset-2 hover:text-[#1D4ED8] disabled:opacity-50"
            >
              Responder esta después
            </button>
          ) : null}
        </div>
      </div>
    </Tarjeta>
  )
}

/* ========================================================================== */
/* Documentos                                                                 */
/* ========================================================================== */

function BloqueDocumentos({
  proyectoId,
  documentosPedidos,
  archivoBase,
  archivosIniciales,
}: {
  proyectoId: string
  documentosPedidos: DocumentoPedido[]
  archivoBase: { nombre: string; url: string | null } | null
  archivosIniciales: ArchivoSubido[]
}) {
  const [archivos, setArchivos] = useState<ArchivoSubido[]>(archivosIniciales)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')

  /**
   * La lista inicial la arma el servidor. Esto solo se vuelve a llamar después
   * de que el cliente sube un archivo, para que lo vea aparecer al instante sin
   * recargar la página.
   */
  const listar = async () => {
    try {
      const supabase = createClient()
      const { data, error: errorLista } = await supabase.storage
        .from(BUCKET)
        .list(proyectoId, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })

      if (errorLista || !data) return

      const entradas = data.filter((f) => f.name && f.name !== '.emptyFolderPlaceholder')
      if (entradas.length === 0) {
        setArchivos([])
        return
      }

      const rutas = entradas.map((f) => `${proyectoId}/${f.name}`)
      const { data: firmados } = await supabase.storage
        .from(BUCKET)
        .createSignedUrls(rutas, 60 * 60 * 24 * 7)

      const mapaUrls = new Map((firmados || []).map((f) => [f.path || '', f.signedUrl || null]))

      setArchivos(
        entradas.map((f) => ({
          nombre: f.name.replace(/^\d+-/, ''),
          ruta: `${proyectoId}/${f.name}`,
          url: mapaUrls.get(`${proyectoId}/${f.name}`) || null,
          fecha: f.created_at
            ? new Date(f.created_at).toLocaleDateString('es-CO', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
            : null,
        }))
      )
    } catch {
      /* si no se puede releer la lista, el archivo ya quedó subido igual */
    }
  }

  const subir = async (evento: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0]
    if (!archivo) return

    setSubiendo(true)
    setError('')
    try {
      const supabase = createClient()
      const ruta = `${proyectoId}/${Date.now()}-${archivo.name}`
      const { error: errorSubida } = await supabase.storage.from(BUCKET).upload(ruta, archivo)
      if (errorSubida) throw errorSubida
      await listar()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo subir el archivo. Intenta de nuevo en un momento.'
      )
    } finally {
      setSubiendo(false)
      evento.target.value = ''
    }
  }

  return (
    <Tarjeta>
      <TituloBloque
        icono={Paperclip}
        titulo="Documentos"
        descripcion="Lo que el equipo necesita de tu lado y lo que ya nos enviaste."
        contador={documentosPedidos.length > 0 ? `${documentosPedidos.length} por enviar` : undefined}
      />

      <div className="space-y-5 px-5 py-5">
        {documentosPedidos.length > 0 ? (
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
              Nos hace falta
            </h3>
            <ul className="mt-2.5 space-y-2">
              {documentosPedidos.map((doc) => (
                <li
                  key={doc.id}
                  className="rounded-xl border border-[#FDE6C8] bg-[#FFFBF3] px-3.5 py-3"
                >
                  <div className="flex items-start gap-2.5">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#8A5307]" />
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-semibold leading-snug text-[#0B2A4A]">
                        {doc.requisito}
                        {doc.obligatorio ? (
                          <span className="ml-2 rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10.5px] font-bold text-[#8A5307]">
                            Obligatorio
                          </span>
                        ) : null}
                      </p>
                      {doc.nota ? (
                        <p className="mt-1 text-[12.5px] leading-relaxed text-[#5B6B84]">{doc.nota}</p>
                      ) : null}
                      {doc.origen ? (
                        <p className="mt-1 text-[11.5px] text-[#94A3B8]">Para: {doc.origen}</p>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-[13.5px] text-[#5B6B84]">
            Ahora mismo no te estamos pidiendo ningún documento. Si aun así quieres enviarnos algo
            que ayude al proyecto, súbelo aquí abajo.
          </p>
        )}

        <div>
          <h3 className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
            Lo que ya nos enviaste
          </h3>

          <ul className="mt-2.5 space-y-2">
            {archivoBase ? (
              <li className="flex items-center gap-2.5 rounded-xl border border-[#D7EFE3] bg-[#F4FBF8] px-3.5 py-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#186A46]" />
                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-[#0B2A4A]">
                  {archivoBase.nombre}
                </span>
                <span className="shrink-0 text-[11px] font-semibold text-[#94A3B8]">
                  Documento del proyecto
                </span>
                {archivoBase.url ? (
                  <a
                    href={archivoBase.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-[12px] font-bold text-[#1D4ED8] underline underline-offset-2"
                  >
                    Ver
                  </a>
                ) : null}
              </li>
            ) : null}

            {archivos.length === 0 && !archivoBase ? (
              <li className="px-1 py-2 text-[13px] text-[#5B6B84]">
                Todavía no has subido ningún documento.
              </li>
            ) : null}

            {archivos.map((archivo) => (
              <li
                key={archivo.ruta}
                className="flex items-center gap-2.5 rounded-xl border border-[#E4EAF3] bg-[#FBFDFF] px-3.5 py-2.5"
              >
                <FileText className="h-4 w-4 shrink-0 text-[#5B6B84]" />
                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-[#0B2A4A]">
                  {archivo.nombre}
                </span>
                {archivo.fecha ? (
                  <span className="shrink-0 text-[11px] text-[#94A3B8]">{archivo.fecha}</span>
                ) : null}
                {archivo.url ? (
                  <a
                    href={archivo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-[12px] font-bold text-[#1D4ED8] underline underline-offset-2"
                  >
                    Ver
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label
            className={`flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-[#BFD2F5] bg-[#F7FAFF] px-4 py-5 text-[13.5px] font-bold text-[#1D4ED8] transition-colors hover:bg-[#EFF6FF] ${
              subiendo ? 'pointer-events-none opacity-70' : ''
            }`}
          >
            {subiendo ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
            {subiendo ? 'Subiendo…' : 'Subir un documento'}
            <input
              type="file"
              onChange={subir}
              disabled={subiendo}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.zip"
            />
          </label>
          <p className="mt-2 text-[12px] text-[#94A3B8]">
            PDF, Word, Excel, PowerPoint, imágenes o un comprimido. Un archivo a la vez.
          </p>
          {error ? <p className="mt-2 text-[12.5px] font-semibold text-[#B42318]">{error}</p> : null}
        </div>
      </div>
    </Tarjeta>
  )
}

/* ========================================================================== */
/* Pantalla                                                                   */
/* ========================================================================== */

export function PendientesCliente({ datos }: { datos: DatosPendientes }) {
  const total = datos.preguntas.length + datos.documentosPedidos.length

  return (
    <div className="px-4 py-6 lg:px-6">
      <header className="mb-5">
        <h1 className="text-[19px] font-extrabold tracking-tight text-[#0B2A4A]">Lo que me piden</h1>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[#5B6B84]">
          {total > 0
            ? 'Aquí está todo lo que depende de ti para que el proyecto siga avanzando. Nada más.'
            : 'No hay nada pendiente de tu lado. El equipo sigue trabajando en tu proyecto.'}
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <BloquePreguntas preguntasIniciales={datos.preguntas} />
        <BloqueDocumentos
          proyectoId={datos.proyectoId}
          documentosPedidos={datos.documentosPedidos}
          archivoBase={datos.archivoBase}
          archivosIniciales={datos.archivosSubidos}
        />
      </div>
    </div>
  )
}

/* --- estados sin proyecto ------------------------------------------------ */

export function PendientesSinProyecto() {
  return (
    <div className="px-4 py-10 lg:px-6">
      <div className="mx-auto max-w-xl rounded-2xl border border-[#E4EAF3] bg-white p-8 text-center shadow-[0_1px_2px_rgba(11,42,74,0.06),0_8px_24px_-14px_rgba(11,42,74,0.20)]">
        <h1 className="text-[17px] font-extrabold text-[#0B2A4A]">Todavía no hay proyecto</h1>
        <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-[#5B6B84]">
          Cuando contrates la estructuración, esta pantalla te va a mostrar las preguntas y los
          documentos que el equipo necesite de ti.
        </p>
      </div>
    </div>
  )
}
