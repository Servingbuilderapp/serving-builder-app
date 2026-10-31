import React from 'react'
import { Gift } from 'lucide-react'
import { AceptarCortesia } from '@/components/panel/AceptarCortesia'
import { textoCondiciones } from '@/lib/cortesias'

const SOMBRA = 'shadow-[0_1px_2px_rgba(20,5,10,0.28),0_8px_24px_-14px_rgba(20,5,10,0.55)]'

/**
 * Pantalla obligatoria: si el cliente tiene una cortesía y todavía no aceptó
 * las condiciones y el contrato, el panel solo le muestra esto. No puede
 * avanzar a ninguna otra sección hasta aceptar.
 */
export function PuertaCortesia({
  nombre,
  comisionPct,
  dias,
}: {
  nombre: string | null
  comisionPct: number
  dias: number
}) {
  return (
    <div className="min-h-full bg-[#54142B] px-4 py-6 lg:px-6">
      <header className="mb-5">
        <h1 className="flex items-center gap-2 text-[19px] font-extrabold tracking-tight text-[#F3E7DC]">
          <Gift className="h-5 w-5 text-[#C9A46B]" />
          Antes de empezar, acepta tu contrato
        </h1>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[#F3E7DC]/60">
          {nombre ? `${nombre}, ` : ''}para estructurar tu proyecto sin costo necesitamos que leas y aceptes estas condiciones.
          Sin este paso no se puede continuar.
        </p>
      </header>

      <section className={`max-w-2xl rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-5 ${SOMBRA}`}>
        <h2 className="text-[15px] font-extrabold text-[#F3E7DC]">Las condiciones</h2>
        <ul className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-[#F3E7DC]/80">
          {textoCondiciones(comisionPct, dias).map((t) => (
            <li key={t}>• {t}</li>
          ))}
        </ul>
        <AceptarCortesia />
      </section>
    </div>
  )
}
