import React from 'react'
import { BellRing } from 'lucide-react'
import { BotonQuieroPostular } from '@/components/panel/BotonQuieroPostular'

const SOMBRA = 'shadow-[0_1px_2px_rgba(20,5,10,0.28),0_8px_24px_-14px_rgba(20,5,10,0.55)]'

export type ConvocatoriaPorResponder = {
  id: string
  bibliotecaId: string | null
  nombre: string
  entidad: string | null
  fechaCierre: string | null
  monto: string | null
}

/**
 * Pantalla obligatoria de notificación (regla del dueño, 28 nov 2026): cuando
 * la plataforma le encuentra convocatorias al cliente, él debe responder cada
 * una —«Quiero postular», «Esperar» o «Descartar»— antes de seguir usando el
 * panel. No es un aviso que se pueda ignorar.
 */
export function PuertaConvocatorias({
  proyectoId,
  nombre,
  convocatorias,
}: {
  proyectoId: string
  nombre: string | null
  convocatorias: ConvocatoriaPorResponder[]
}) {
  const total = convocatorias.length
  return (
    <div className="min-h-full bg-[#54142B] px-4 py-6 lg:px-6">
      <header className="mb-5">
        <h1 className="flex items-center gap-2 text-[19px] font-extrabold tracking-tight text-[#F3E7DC]">
          <BellRing className="h-5 w-5 text-[#C9A46B]" />
          {total === 1 ? 'Encontramos una convocatoria para ti' : `Encontramos ${total} convocatorias para ti`}
        </h1>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[#F3E7DC]/60">
          {nombre ? `${nombre}, ` : ''}para seguir necesitamos tu respuesta en cada una: «Quiero postular», «Esperar» o
          «Descartar». Las que dejes en espera las puedes retomar después desde Mis convocatorias.
        </p>
      </header>

      <div className="max-w-2xl space-y-4">
        {convocatorias.map((c) => (
          <section key={c.id} className={`rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-5 ${SOMBRA}`}>
            <h2 className="text-[15px] font-extrabold text-[#F3E7DC]">{c.nombre}</h2>
            <p className="mt-1 text-[13px] text-[#F3E7DC]/70">
              {[c.entidad, c.monto, c.fechaCierre ? `cierra ${c.fechaCierre}` : null].filter(Boolean).join(' · ')}
            </p>
            <BotonQuieroPostular proyectoId={proyectoId} bibliotecaId={c.bibliotecaId || ''} candidataId={c.id} />
          </section>
        ))}
      </div>
    </div>
  )
}
