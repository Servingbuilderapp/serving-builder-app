import React from 'react'

/** Muestra el texto de una nota (escrito con # y ###) con títulos y párrafos legibles. */
export function NotaConceptoTexto({ documento }: { documento: string }) {
  const bloques = documento.split('\n').filter((l) => l.trim() !== '')
  return (
    <div className="space-y-2 text-[13.5px] leading-relaxed text-[#F3E7DC]/80">
      {bloques.map((linea, i) => {
        if (linea.startsWith('### ')) return <h4 key={i} className="pt-2 font-extrabold text-[#C9A46B]">{linea.slice(4)}</h4>
        if (linea.startsWith('## ')) return <h3 key={i} className="text-[15px] font-extrabold text-[#F3E7DC]">{linea.slice(3)}</h3>
        if (linea.startsWith('# ')) return <h2 key={i} className="pt-2 text-[17px] font-extrabold text-[#F3E7DC]">{linea.slice(2)}</h2>
        if (linea.trim() === '---') return <hr key={i} className="my-3 border-[#B08D57]/30" />
        return <p key={i}>{linea.replace(/^_|_$/g, '').replace(/^\*|\*$/g, '')}</p>
      })}
    </div>
  )
}
