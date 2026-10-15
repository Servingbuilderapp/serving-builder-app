import React from 'react'
import Link from 'next/link'

const SOMBRA_TARJETA =
  'shadow-[0_1px_2px_rgba(20,5,10,0.28),0_8px_24px_-14px_rgba(20,5,10,0.55)]'

/** Tarjeta que se muestra cuando la persona no tiene membresía, o su nivel no incluye la pantalla. */
export function AvisoMiembros({ titulo, texto, boton = 'Ver las membresías' }: { titulo: string; texto: string; boton?: string }) {
  return (
    <div className="min-h-full bg-[#54142B] px-4 py-6 lg:px-6">
      <h1 className="text-[19px] font-extrabold tracking-tight text-[#F3E7DC]">{titulo}</h1>
      <div className={`mx-auto mt-6 max-w-xl rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-8 text-center ${SOMBRA_TARJETA}`}>
        <p className="mx-auto max-w-md text-[13.5px] leading-relaxed text-[#F3E7DC]/70">{texto}</p>
        <Link href="/membresia" className="mt-4 inline-flex rounded-xl bg-[#C9A46B] px-4 py-2.5 text-[13px] font-bold text-[#3B1727]">
          {boton}
        </Link>
      </div>
    </div>
  )
}
