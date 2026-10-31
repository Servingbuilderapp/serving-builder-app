'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

/**
 * Siete fichas sencillas que van justo debajo del video y antes del diagnóstico
 * (decisión del dueño, 30 oct 2026). Las tres primeras son definiciones cortas;
 * las otras cuatro se abren para ver su lista de seis (o cuatro) elementos.
 * Sin precios ni cifras (reglas fijas del proyecto).
 */

const RELIEVE_TARJETA =
  'shadow-[0_1px_2px_rgba(60,20,32,0.08),0_12px_30px_-14px_rgba(60,20,32,0.30)] hover:shadow-[0_2px_6px_rgba(60,20,32,0.12),0_22px_46px_-16px_rgba(60,20,32,0.38)] transition-all duration-300'

const DEFINICIONES = ['subvencion', 'convocatoria', 'terminos'] as const

const LISTAS: { clave: string; cantidad: number; cierre?: boolean }[] = [
  { clave: 'pasos', cantidad: 6 },
  { clave: 'madurez', cantidad: 4 },
  { clave: 'fuentes', cantidad: 6, cierre: true },
  { clave: 'criterios', cantidad: 6 },
]

function FichaLista({ clave, cantidad, cierre }: { clave: string; cantidad: number; cierre?: boolean }) {
  const { t } = useTranslation()
  const [abierta, setAbierta] = useState(false)

  return (
    <div className={`rounded-2xl border border-[#B08D57]/50 bg-white p-6 self-start ${RELIEVE_TARJETA}`}>
      <h3 className="text-xl font-extrabold text-[#3A1420]">{t(`w.tips.${clave}.titulo`)}</h3>
      <p className="mt-2 text-[14px] text-[#5A3A2E] leading-relaxed">{t(`w.tips.${clave}.texto`)}</p>

      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        aria-expanded={abierta}
        className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#8C3654] hover:text-[#54142B]"
      >
        {abierta ? t('w.tips.ocultar') : t('w.tips.ver')}
        <ChevronDown className={`h-4 w-4 transition-transform ${abierta ? 'rotate-180' : ''}`} />
      </button>

      {abierta ? (
        <div className="mt-4">
          <ol className="space-y-3">
            {Array.from({ length: cantidad }, (_, i) => i + 1).map((n) => (
              <li key={n} className="flex items-start gap-3">
                <span className="h-6 w-6 shrink-0 rounded-full bg-gradient-to-br from-[#C9A46B] to-[#B08D57] text-[12px] font-extrabold text-[#3A1420] flex items-center justify-center mt-0.5">
                  {n}
                </span>
                <div>
                  <div className="text-[14px] font-bold text-[#3A1420] leading-snug">{t(`w.tips.${clave}.i${n}.t`)}</div>
                  <div className="text-[13px] text-[#5A3A2E] leading-snug">{t(`w.tips.${clave}.i${n}.d`)}</div>
                </div>
              </li>
            ))}
          </ol>
          {cierre ? (
            <p className="mt-4 pt-4 border-t border-[#B08D57]/40 text-[13px] font-semibold text-[#3A1420] leading-snug">
              {t(`w.tips.${clave}.cierre`)}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export function FichasTips() {
  const { t } = useTranslation()

  return (
    <section id="tips" className="bg-[#F3E7DC] py-16 lg:py-20 border-y-2 border-[#B08D57]/45">
      <div className="max-w-[1400px] mx-auto px-5 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8C3654] mb-3">{t('w.tips.eyebrow')}</div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#3A1420] leading-tight">{t('w.tips.titulo')}</h2>
          <p className="mt-3 text-base text-[#5A3A2E] leading-relaxed">{t('w.tips.subtitulo')}</p>
        </div>

        <div className={`mb-5 rounded-2xl border border-[#B08D57]/50 bg-gradient-to-b from-[#4C2032] to-[#3B1727] p-7 md:p-9 text-center ${RELIEVE_TARJETA}`}>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C9A46B] mb-2">{t('w.tips.fabrica.eyebrow')}</div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-[#F3E7DC]">{t('w.tips.fabrica.titulo')}</h3>
          <p className="mt-3 max-w-3xl mx-auto text-[15px] text-[#F3E7DC]/80 leading-relaxed">{t('w.tips.fabrica.texto')}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {DEFINICIONES.map((clave) => (
            <div key={clave} className={`h-full rounded-2xl border border-[#B08D57]/50 bg-white p-6 ${RELIEVE_TARJETA}`}>
              <h3 className="text-xl font-extrabold text-[#3A1420]">{t(`w.tips.${clave}.titulo`)}</h3>
              <p className="mt-2 text-[14px] text-[#5A3A2E] leading-relaxed">{t(`w.tips.${clave}.texto`)}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4 items-start">
          {LISTAS.map((l) => (
            <FichaLista key={l.clave} clave={l.clave} cantidad={l.cantidad} cierre={l.cierre} />
          ))}
        </div>

        <h3 className="mt-12 mb-5 text-center text-2xl font-extrabold text-[#3A1420]">{t('w.tips.antes.titulo')}</h3>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className={`h-full rounded-2xl border border-[#B08D57]/50 bg-white p-6 ${RELIEVE_TARJETA}`}>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#C9A46B] to-[#B08D57] text-[#3A1420] text-[15px] font-extrabold flex items-center justify-center mb-3">
                {n}
              </div>
              <h4 className="text-[17px] font-extrabold text-[#3A1420] leading-snug">{t(`w.tips.antes.${n}.titulo`)}</h4>
              <p className="mt-2 text-[14px] text-[#5A3A2E] leading-relaxed">{t(`w.tips.antes.${n}.texto`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
