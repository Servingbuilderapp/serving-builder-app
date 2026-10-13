'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, BookOpen, Printer } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlowButton } from '@/components/ui/GlowButton'
import type { Bloque, Guia } from '@/lib/ideas/guias-data'

/** Convierte **texto** en negrita. */
function conNegrita(texto: string): React.ReactNode[] {
  return texto.split('**').map((trozo, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-bold text-color-base-content">
        {trozo}
      </strong>
    ) : (
      <React.Fragment key={i}>{trozo}</React.Fragment>
    )
  )
}

function BloqueVista({ bloque }: { bloque: Bloque }) {
  switch (bloque.tipo) {
    case 'p':
      return <p className="text-sm text-color-base-content/75 leading-relaxed">{conNegrita(bloque.texto)}</p>
    case 'lista':
      return (
        <ul className="text-sm text-color-base-content/75 leading-relaxed space-y-1.5 list-disc pl-5">
          {bloque.items.map((it, i) => (
            <li key={i}>{conNegrita(it)}</li>
          ))}
        </ul>
      )
    case 'numerada':
      return (
        <ol className="text-sm text-color-base-content/75 leading-relaxed space-y-1.5 list-decimal pl-5">
          {bloque.items.map((it, i) => (
            <li key={i}>{conNegrita(it)}</li>
          ))}
        </ol>
      )
    case 'cita':
      return (
        <blockquote className="rounded-xl border-l-4 border-color-primary/60 bg-color-primary/[0.06] px-4 py-3 text-sm font-semibold text-color-base-content">
          {bloque.texto}
        </blockquote>
      )
    case 'tabla':
      return (
        <div className="overflow-x-auto rounded-xl border border-color-base-content/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-color-base-content/[0.05] text-left">
                {bloque.cabecera.map((c) => (
                  <th key={c} className="px-4 py-2.5 text-xs font-black uppercase tracking-wider text-color-base-content/60">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-color-base-content/10">
              {bloque.filas.map((fila, i) => (
                <tr key={i}>
                  {fila.map((celda, j) => (
                    <td
                      key={j}
                      className={`px-4 py-2.5 align-top ${j === 0 ? 'font-bold text-color-base-content' : 'text-color-base-content/75'}`}
                    >
                      {celda}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
  }
}

export default function GuiaLectura({ guia }: { guia: Guia }) {
  return (
    <div className="max-w-3xl mx-auto w-full space-y-8 py-12 px-6">
      <div className="space-y-4 print:hidden">
        <Link
          href="/ideas"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-color-base-content/50 hover:text-color-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a la App de Ideas
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-color-primary/10 border border-color-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-color-primary ml-3">
          <BookOpen className="h-3 w-3" />
          Guía
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-color-base-content tracking-tight">{guia.titulo}</h1>
        <p className="text-color-base-content/60 font-medium">{guia.subtitulo}</p>
      </div>

      <div className="hidden print:block">
        <h1 className="text-2xl font-black">{guia.titulo}</h1>
        <p className="text-sm">{guia.subtitulo}</p>
      </div>

      {guia.intro.length > 0 && (
        <GlassCard className="p-6 md:p-8 border-color-base-content/10 space-y-4">
          {guia.intro.map((b, i) => (
            <BloqueVista key={i} bloque={b} />
          ))}
        </GlassCard>
      )}

      {guia.secciones.map((s) => (
        <GlassCard key={s.titulo} className="p-6 md:p-8 border-color-base-content/10 space-y-4">
          <h2 className="text-lg font-black text-color-base-content">{s.titulo}</h2>
          {s.bloques.map((b, i) => (
            <BloqueVista key={i} bloque={b} />
          ))}
        </GlassCard>
      ))}

      {guia.cierre && guia.cierre.length > 0 && (
        <div className="space-y-3">
          {guia.cierre.map((b, i) => (
            <BloqueVista key={i} bloque={b} />
          ))}
        </div>
      )}

      <div className="space-y-4 print:hidden">
        {guia.enlaces.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-color-base-content/40">
              Hojas para llenar que acompañan esta guía
            </p>
            <div className="flex flex-wrap gap-3">
              {guia.enlaces.map((e) => (
                <Link key={e.href} href={e.href}>
                  <GlowButton variant="ghost" className="gap-2 text-xs">
                    {e.nombre}
                    <ArrowRight className="h-4 w-4" />
                  </GlowButton>
                </Link>
              ))}
            </div>
          </div>
        )}
        <GlowButton onClick={() => window.print()} className="gap-2 text-xs">
          <Printer className="h-4 w-4" />
          Imprimir o guardar en PDF
        </GlowButton>
      </div>
    </div>
  )
}
