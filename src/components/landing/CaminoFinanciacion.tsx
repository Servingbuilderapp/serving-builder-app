'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, Briefcase, Crown, Check } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

/**
 * Bloque que va justo debajo del video de bienvenida (decisión del dueño, 29-30 oct 2026):
 *   1. Tres ofertas muy claras y separadas: Membresías, Academia y Estructuración.
 *   2. Un consejo sobre el rol del estructurador.
 * El «¿a dónde dirigirte?» NO va aquí: lo dice el propio diagnóstico (el reloj del proyecto).
 * Sin precios (regla fija): solo descriptores.
 */

const RELIEVE_BOTON = 'shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200'
const RELIEVE_TARJETA =
  'shadow-[0_1px_2px_rgba(60,20,32,0.08),0_12px_30px_-14px_rgba(60,20,32,0.30)] hover:shadow-[0_2px_6px_rgba(60,20,32,0.12),0_22px_46px_-16px_rgba(60,20,32,0.38)] hover:-translate-y-1 transition-all duration-300'

const OFERTAS = [
  { clave: 'membresias', icono: Crown, href: '/membresia' },
  { clave: 'academia', icono: BookOpen, href: '/academia' },
  { clave: 'estructuracion', icono: Briefcase, href: '/contratar' },
] as const

export function CaminoFinanciacion() {
  const { t } = useTranslation()

  return (
    <section id="a-donde-dirigirte" className="bg-[#F3E7DC] py-16 lg:py-20 border-y-2 border-[#B08D57]/45">
      <div className="max-w-[1400px] mx-auto px-5 lg:px-8">
        {/* ---------- 1. Tres ofertas ---------- */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8C3654] mb-3">{t('w.camino.ofertas.eyebrow')}</div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#3A1420] leading-tight">{t('w.camino.ofertas.titulo')}</h2>
          <p className="mt-3 text-base text-[#5A3A2E] leading-relaxed">{t('w.camino.ofertas.subtitulo')}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {OFERTAS.map(({ clave, icono: Icono, href }) => (
            <div key={clave} className={`h-full flex flex-col rounded-2xl border border-[#B08D57]/50 bg-white p-7 ${RELIEVE_TARJETA}`}>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#C9A46B] to-[#B08D57] flex items-center justify-center mb-4">
                <Icono className="h-6 w-6 text-[#3A1420]" />
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#8C3654]">{t(`w.camino.${clave}.para`)}</div>
              <h3 className="mt-1 text-2xl font-extrabold text-[#3A1420]">{t(`w.camino.${clave}.titulo`)}</h3>
              <p className="mt-2 text-[14px] text-[#5A3A2E] leading-relaxed">{t(`w.camino.${clave}.texto`)}</p>
              <ul className="mt-4 space-y-2 flex-1">
                {[1, 2, 3].map((n) => (
                  <li key={n} className="flex items-start gap-2 text-[13px] text-[#3A1420]/85 leading-snug">
                    <Check className="h-3.5 w-3.5 text-[#B08D57] shrink-0 mt-0.5" />
                    <span>{t(`w.camino.${clave}.i${n}`)}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={href}
                className={`mt-6 h-11 px-5 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#C9A46B] to-[#B08D57] text-[#3A1420] text-sm font-semibold ${RELIEVE_BOTON}`}
              >
                {t(`w.camino.${clave}.boton`)}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* ---------- 2. Consejo ---------- */}
        <div className="mt-10 max-w-3xl mx-auto text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8C3654] mb-2">{t('w.camino.tip.eyebrow')}</div>
          <p className="text-lg md:text-xl font-extrabold text-[#3A1420] leading-snug">{t('w.camino.tip.titulo')}</p>
          <p className="mt-2 text-[14px] text-[#5A3A2E] leading-relaxed">{t('w.camino.tip.texto')}</p>
        </div>
      </div>
    </section>
  )
}
