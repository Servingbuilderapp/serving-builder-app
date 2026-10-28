import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/**
 * Lo que se ve en una pestaña de la ficha cuando todavía no hay datos: la
 * ESTRUCTURA de la pantalla (las cajas que se van a llenar) y un aviso de que se
 * llena sola cuando avance el paso anterior. Antes solo salía un cartel de
 * "Todavía no hay…" y el equipo no podía ver cómo iba a quedar.
 */
export function EstructuraEnBlanco({
  titulo,
  aviso,
  bloques,
  enlace,
}: {
  titulo: string
  aviso: string
  bloques: { titulo: string; texto: string }[]
  enlace: { href: string; texto: string }
}) {
  return (
    <div className="min-h-full bg-[#54142B] mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-xl font-extrabold text-[#F3E7DC]">{titulo}</h1>
      <p className="mt-2 text-[14px] leading-relaxed text-[#F3E7DC]/70">{aviso}</p>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {bloques.map((b) => (
          <div
            key={b.titulo}
            className="rounded-xl border border-dashed border-[#B08D57]/50 bg-[#3B1727] p-4"
          >
            <div className="text-[11px] font-black uppercase tracking-wider text-[#B08D57]">{b.titulo}</div>
            <p className="mt-1 text-[12.5px] leading-snug text-[#F3E7DC]/60">{b.texto}</p>
            <div className="mt-3 h-8 rounded-lg border border-[#B08D57]/25 bg-[#54142B]/60" />
            <div className="mt-2 h-8 rounded-lg border border-[#B08D57]/25 bg-[#54142B]/60" />
          </div>
        ))}
      </div>

      <Link
        href={enlace.href}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#C9A46B] to-[#B08D57] px-4 py-2.5 text-[13px] font-extrabold text-[#3A1420] hover:brightness-110"
      >
        {enlace.texto} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
