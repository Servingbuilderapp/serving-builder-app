'use client'

import React from 'react'
import { FileText, Clock } from 'lucide-react'
import { TarjetaEntregable } from '@/components/panel/EntregablesProyecto'

export type DocumentoCliente = {
  titulo: string
  descripcion: string
  nombreArchivo: string
  /** Null = todavía no está listo. */
  contenido: string | null
  pendiente?: string
}

export type EtapaDocumentos = {
  etapa: string
  documentos: DocumentoCliente[]
}

const RELIEVE_TARJETA = 'shadow-[0_1px_2px_rgba(20,5,10,0.28),0_8px_24px_-14px_rgba(20,5,10,0.55)]'

/** "Mis documentos": todo lo que el cliente puede ver, bajar en Word o guardar en PDF, por etapa. */
export function MisDocumentosClient({ etapas }: { etapas: EtapaDocumentos[] }) {
  return (
    <div className="space-y-8 px-4 pb-10 pt-6 lg:px-6">
      <div>
        <h1 className="text-[22px] font-extrabold text-[#F3E7DC]">Mis documentos</h1>
        <p className="mt-1 text-[13.5px] text-[#F3E7DC]/70">
          Aquí está todo lo que se ha preparado para ti, en orden. Cada documento lo puedes ver, bajar en Word o guardar en PDF para imprimirlo.
        </p>
      </div>

      {etapas.map((et) => (
        <section key={et.etapa} className="space-y-3">
          <h2 className="px-1 text-[13px] font-bold uppercase tracking-[0.1em] text-[#F3E7DC]/60">{et.etapa}</h2>
          {et.documentos.map((d, i) =>
            d.contenido ? (
              <TarjetaEntregable
                key={`${d.titulo}-${i}`}
                icono={FileText}
                titulo={d.titulo}
                descripcion={d.descripcion}
                nombreArchivo={d.nombreArchivo}
                contenido={d.contenido}
              />
            ) : (
              <div
                key={`${d.titulo}-${i}`}
                className={`flex items-start gap-3.5 rounded-2xl border border-[#B08D57]/20 bg-[#4C2032]/60 p-4 ${RELIEVE_TARJETA}`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3E7DC]/10 text-[#F3E7DC]/50">
                  <Clock className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h4 className="text-[14px] font-extrabold text-[#F3E7DC]/70">{d.titulo}</h4>
                  <p className="mt-0.5 text-[12.5px] text-[#F3E7DC]/50">{d.pendiente || 'Todavía no está listo.'}</p>
                </div>
              </div>
            ),
          )}
        </section>
      ))}
    </div>
  )
}
