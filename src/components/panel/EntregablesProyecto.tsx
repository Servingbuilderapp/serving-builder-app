'use client'

import React from 'react'
import { FileText, Download, Eye, X } from 'lucide-react'

const SOMBRA_TARJETA = 'shadow-[0_1px_2px_rgba(11,42,74,0.06),0_8px_24px_-14px_rgba(11,42,74,0.20)]'

function descargar(nombreArchivo: string, contenido: string) {
  const blob = new Blob([contenido], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombreArchivo
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function VistaDocumento({ titulo, contenido, onCerrar }: { titulo: string; contenido: string; onCerrar: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E4EAF3] px-5 py-3.5">
          <h3 className="text-[14px] font-extrabold text-[#0B2A4A]">{titulo}</h3>
          <button type="button" onClick={onCerrar} className="rounded-lg p-1.5 hover:bg-[#F8FAFD]">
            <X className="h-4.5 w-4.5 text-[#5B6B84]" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">
          <pre className="whitespace-pre-wrap font-sans text-[13.5px] leading-relaxed text-[#334155]">{contenido}</pre>
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
    <div className={`flex items-start gap-3.5 rounded-2xl border border-[#E4EAF3] bg-white p-4 ${SOMBRA_TARJETA}`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#1D4ED8]">
        <Icono className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h4 className="text-[14px] font-extrabold text-[#0B2A4A]">{titulo}</h4>
        <p className="mt-0.5 text-[12.5px] text-[#5B6B84]">{descripcion}</p>
        <div className="mt-2.5 flex gap-2">
          <button
            type="button"
            onClick={() => setViendo(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#DCE4F0] bg-[#F8FAFD] px-3 text-[12px] font-bold text-[#1D4ED8] hover:bg-[#EFF6FF]"
          >
            <Eye className="h-3.5 w-3.5" /> Ver
          </button>
          <button
            type="button"
            onClick={() => descargar(nombreArchivo, contenido)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#1D4ED8] px-3 text-[12px] font-bold text-white hover:brightness-110"
          >
            <Download className="h-3.5 w-3.5" /> Descargar
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
      <h3 className="px-1 text-[13px] font-bold uppercase tracking-[0.1em] text-[#7C8CA5]">Tus entregables</h3>
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
