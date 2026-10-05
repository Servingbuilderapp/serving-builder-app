'use client'

import React from 'react'
import { FileText, Download, Eye, X } from 'lucide-react'
import { descargarComoWord, guardarComoPdf } from '@/lib/descargarDocumento'

const RELIEVE_TARJETA = 'shadow-[0_1px_2px_rgba(20,5,10,0.28),0_8px_24px_-14px_rgba(20,5,10,0.55)]'

function VistaDocumento({ titulo, contenido, onCerrar }: { titulo: string; contenido: string; onCerrar: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#B08D57]/35 px-5 py-3.5">
          <h3 className="text-[14px] font-extrabold text-[#F3E7DC]">{titulo}</h3>
          <button type="button" onClick={onCerrar} className="rounded-lg p-1.5 hover:bg-[#3B1727]">
            <X className="h-4.5 w-4.5 text-[#F3E7DC]/70" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">
          <pre className="whitespace-pre-wrap font-sans text-[13.5px] leading-relaxed text-[#F3E7DC]/85">{contenido}</pre>
        </div>
      </div>
    </div>
  )
}

function TarjetaEntregable({
  icono: Icono,
  titulo,
  descripcion,
  nombreArchivo,
  contenido,
}: {
  icono: typeof FileText
  titulo: string
  descripcion: string
  nombreArchivo: string
  contenido: string
}) {
  const [viendo, setViendo] = React.useState(false)

  return (
    <div className={`flex items-start gap-3.5 rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-4 ${RELIEVE_TARJETA}`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#B08D57]/15 text-[#C9A46B]">
        <Icono className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h4 className="text-[14px] font-extrabold text-[#F3E7DC]">{titulo}</h4>
        <p className="mt-0.5 text-[12.5px] text-[#F3E7DC]/70">{descripcion}</p>
        <div className="mt-2.5 flex gap-2">
          <button
            type="button"
            onClick={() => setViendo(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#B08D57]/40 bg-[#B08D57]/10 px-3 text-[12px] font-bold text-[#C9A46B] hover:bg-[#B08D57]/20"
          >
            <Eye className="h-3.5 w-3.5" /> Ver
          </button>
          <button
            type="button"
            onClick={() => descargarComoWord(nombreArchivo.replace(/\.md$/, ''), titulo, contenido)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-b from-[#E8C777] via-[#C9A46B] to-[#9C7A3E] px-3 text-[12px] font-bold text-[#2E0E1A] hover:brightness-105"
          >
            <Download className="h-3.5 w-3.5" /> Word
          </button>
          <button
            type="button"
            onClick={() => guardarComoPdf(titulo, contenido)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-b from-[#E8C777] via-[#C9A46B] to-[#9C7A3E] px-3 text-[12px] font-bold text-[#2E0E1A] hover:brightness-105"
          >
            <Download className="h-3.5 w-3.5" /> PDF
          </button>
        </div>
      </div>
      {viendo ? <VistaDocumento titulo={titulo} contenido={contenido} onCerrar={() => setViendo(false)} /> : null}
    </div>
  )
}

export function EntregablesProyecto({
  nombreProyecto,
  dossierMarkdown,
  notaConceptoMarkdown,
}: {
  nombreProyecto: string
  dossierMarkdown: string | null
  notaConceptoMarkdown: string | null
}) {
  if (!dossierMarkdown && !notaConceptoMarkdown) return null

  const slug = nombreProyecto.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'proyecto'

  return (
    <div className="space-y-3">
      <h3 className="px-1 text-[13px] font-bold uppercase tracking-[0.1em] text-[#F3E7DC]/60">Tus entregables</h3>
      {dossierMarkdown ? (
        <TarjetaEntregable
          icono={FileText}
          titulo="Tu proyecto completo"
          descripcion="El documento técnico completo de tu proyecto, ya estructurado."
          nombreArchivo={`${slug}-proyecto-completo.md`}
          contenido={dossierMarkdown}
        />
      ) : null}
      {notaConceptoMarkdown ? (
        <TarjetaEntregable
          icono={FileText}
          titulo="Nota de Concepto"
          descripcion="Resumen corto de tu proyecto, listo para presentar a un financiador."
          nombreArchivo={`${slug}-nota-de-concepto.md`}
          contenido={notaConceptoMarkdown}
        />
      ) : null}
    </div>
  )
}
