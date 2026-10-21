'use client'

import React from 'react'
import { HeartHandshake } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { useTranslation } from '@/hooks/useTranslation'
import { ACOMPANAMIENTO_POSTGANE, formatoUsd } from '@/lib/acompanamientoPostGane'

/**
 * Informa, dentro de la pantalla de contratar, que existe un acompañamiento
 * aparte para cuando el cliente gane los recursos. No se contrata aquí: es un
 * servicio posterior al éxito, con su propio valor según el monto ganado.
 */
export function AcompanamientoPostGane() {
  const { t } = useTranslation()
  const { filas, mesesDuracion, desdeUsdGanados } = ACOMPANAMIENTO_POSTGANE

  return (
    <GlassCard className="p-6 space-y-4">
      <div className="flex items-start gap-3">
        <HeartHandshake className="h-6 w-6 text-color-primary shrink-0 mt-0.5" />
        <div>
          <h3 className="font-black text-color-base-content">{t('contratar.postgane_titulo')}</h3>
          <p className="text-color-base-content/60 text-sm mt-1">
            {t('contratar.postgane_texto')}
          </p>
          <p className="text-color-base-content/80 text-sm mt-2">
            {t('contratar.postgane_condicion_1')} {formatoUsd(desdeUsdGanados)} {t('contratar.postgane_condicion_2')}{' '}
            {mesesDuracion} {t('contratar.postgane_condicion_3')}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-color-base-content/50">
              <th className="py-2 pr-4 font-bold">{t('contratar.postgane_col_monto')}</th>
              <th className="py-2 pr-4 font-bold">{t('contratar.postgane_col_mensual')}</th>
              <th className="py-2 font-bold">{t('contratar.postgane_col_total')}</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.desde} className="border-t border-color-base-content/10 text-color-base-content/80">
                <td className="py-2 pr-4">
                  {formatoUsd(f.desde)} – {formatoUsd(f.hasta)}
                </td>
                <td className="py-2 pr-4 font-bold text-color-base-content">{formatoUsd(f.mensualUsd)}</td>
                <td className="py-2">{formatoUsd(f.mensualUsd * mesesDuracion)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-color-base-content/50">{t('contratar.postgane_nota')}</p>
    </GlassCard>
  )
}
