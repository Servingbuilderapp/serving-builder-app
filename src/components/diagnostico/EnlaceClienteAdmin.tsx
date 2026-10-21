'use client'

import React, { useState } from 'react'

/** Caja bien visible, arriba del diagnóstico en admin: el enlace que se le manda al cliente. */
export function EnlaceClienteAdmin({ enlace, correo }: { enlace: string; correo: string }) {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(enlace)
      setCopiado(true)
    } catch {
      setCopiado(false)
    }
  }

  const mensaje = `Hola, este es tu diagnóstico completo con la rueda y todas las referencias: ${enlace}\nPara abrirlo escribe tu correo: ${correo}`
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(mensaje)}`

  return (
    <section className="rounded-2xl border-2 border-color-primary/40 bg-white text-[#2B1220] p-6 space-y-3 shadow-lg">
      <h2 className="text-sm font-black uppercase tracking-wider">Enlace del cliente</h2>
      <p className="text-xs">
        Mándale este enlace al cliente. Al abrirlo escribe el correo con el que hizo el diagnóstico
        {correo ? <> (<strong>{correo}</strong>)</> : null} y ve su diagnóstico completo, con la rueda y las referencias.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input readOnly value={enlace} className="flex-1 px-3 py-2 rounded-xl border border-color-base-300 text-xs bg-white break-all" />
        <button onClick={copiar} className="px-4 py-2 rounded-xl bg-color-primary text-white text-xs font-black uppercase tracking-wider">
          {copiado ? 'Copiado' : 'Copiar enlace'}
        </button>
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-wider text-center">
          Enviar por WhatsApp
        </a>
      </div>
    </section>
  )
}
