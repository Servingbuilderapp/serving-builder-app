import React from 'react'
import { ETIQUETA_BENEFICIO } from '@/lib/membresias'
import type { LineaBeneficio } from '@/lib/membresiasUso'

/** Una barra por beneficio: cuánto se usó y cuánto queda este mes. */
export function BeneficiosMes({ lineas }: { lineas: LineaBeneficio[] }) {
  return (
    <div className="space-y-4">
      {lineas.map((l) => {
        const noIncluido = l.limite === 0
        const ilimitado = l.limite === null
        const pct = ilimitado || noIncluido ? 0 : Math.min(100, Math.round((l.usados / (l.limite as number)) * 100))
        return (
          <div key={l.clave}>
            <div className="flex items-baseline justify-between gap-3">
              <span className={`text-[13.5px] font-bold ${noIncluido ? 'text-[#F3E7DC]/35' : 'text-[#F3E7DC]'}`}>
                {ETIQUETA_BENEFICIO[l.clave]}
              </span>
              <span className="text-[12.5px] text-[#F3E7DC]/65">
                {noIncluido
                  ? 'No incluido en tu nivel'
                  : ilimitado
                    ? `Sin límite · usadas ${l.usados}`
                    : `Te quedan ${l.restante} de ${l.limite}`}
              </span>
            </div>
            {!noIncluido && !ilimitado && (
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#3B1727]">
                <div className="h-full rounded-full bg-[#C9A46B]" style={{ width: `${Math.max(pct, l.usados > 0 ? 4 : 0)}%` }} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
