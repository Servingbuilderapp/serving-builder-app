'use client'

import React from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  LayoutDashboard,
  TrendingUp,
  ClipboardList,
  Search,
  Lightbulb,
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

/**
 * Vista de ejemplo del panel del cliente.
 * Pública, sin cuenta y con datos inventados: solo muestra cómo se ve el panel por dentro.
 */

const RELIEVE_TARJETA =
  'shadow-[0_1px_2px_rgba(20,5,10,0.28),0_8px_24px_-14px_rgba(20,5,10,0.55)]'
const RELIEVE_BOTON =
  'shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200'

const MENU = [
  { icono: LayoutDashboard, clave: 'w.ejemplo.menu1' },
  { icono: TrendingUp, clave: 'w.ejemplo.menu2' },
  { icono: ClipboardList, clave: 'w.ejemplo.menu3' },
  { icono: Search, clave: 'w.ejemplo.menu4' },
  { icono: Lightbulb, clave: 'w.ejemplo.menu5' },
]

const CONVOCATORIAS = [
  { letra: 'A', encaje: 88 },
  { letra: 'B', encaje: 76 },
  { letra: 'C', encaje: 64 },
]

export function EjemploPanelClient() {
  const { t } = useTranslation()
  const longitud = 2 * Math.PI * 42

  return (
    <main className="min-h-screen bg-[#54142B] text-[#F3E7DC]">
      <div className="max-w-[1200px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#F3E7DC]/75 hover:text-[#F3E7DC]"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('w.ejemplo.volver')}
        </Link>

        <div className="mt-6 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t('w.ejemplo.titulo')}</h1>
          <p className="mt-3 text-base md:text-lg text-[#F3E7DC]/70 leading-relaxed">{t('w.ejemplo.subtitulo')}</p>
        </div>

        {/* Ventana del panel */}
        <div
          className={`mt-10 overflow-hidden rounded-3xl border border-[#B08D57]/45 bg-gradient-to-br from-[#3B1727] to-[#2E0E1A] ${RELIEVE_TARJETA}`}
        >
          <div className="grid lg:grid-cols-12">
            {/* Menú lateral */}
            <aside className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-[#B08D57]/30 p-4 lg:p-5">
              <div className="flex lg:flex-col gap-1.5 overflow-x-auto">
                {MENU.map(({ icono: Icono, clave }, i) => (
                  <div
                    key={clave}
                    className={`flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-[13px] font-semibold ${
                      i === 0
                        ? 'bg-gradient-to-b from-[#C9A46B] to-[#B08D57] text-[#3A1420]'
                        : 'text-[#F3E7DC]/75'
                    }`}
                  >
                    <Icono className="h-4 w-4 shrink-0" />
                    {t(clave)}
                  </div>
                ))}
              </div>
            </aside>

            {/* Contenido */}
            <div className="lg:col-span-9 p-5 lg:p-7 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xl font-extrabold">{t('w.ejemplo.menu1')}</div>
                  <div className="text-[13px] text-[#F3E7DC]/65">{t('w.ejemplo.proyecto')}</div>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#B08D57]/20 text-[#E0B868] border border-[#B08D57]/40">
                  {t('w.ejemplo.aviso')}
                </span>
              </div>

              {/* Avance + cifras */}
              <div className="grid md:grid-cols-12 gap-4">
                <div className={`md:col-span-4 rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-5 flex items-center gap-4 ${RELIEVE_TARJETA}`}>
                  <div className="relative h-24 w-24 shrink-0">
                    <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#6E4A50" strokeWidth="10" />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="#B08D57"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${longitud * 0.78} ${longitud}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xl font-extrabold">78%</div>
                  </div>
                  <div className="text-[13px] font-semibold text-[#F3E7DC]/85 leading-snug">{t('w.ejemplo.avance')}</div>
                </div>

                <div className="md:col-span-8 grid sm:grid-cols-3 gap-4">
                  {[
                    { valor: '12', clave: 'w.ejemplo.stat1' },
                    { valor: '84%', clave: 'w.ejemplo.stat2' },
                    { valor: '9/12', clave: 'w.ejemplo.stat3' },
                  ].map((s) => (
                    <div key={s.clave} className={`rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-5 ${RELIEVE_TARJETA}`}>
                      <div className="text-3xl font-extrabold bg-gradient-to-r from-white to-[#E0B868] bg-clip-text text-transparent">
                        {s.valor}
                      </div>
                      <div className="mt-1.5 text-[12px] text-[#F3E7DC]/70 leading-snug">{t(s.clave)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Convocatorias + pendientes */}
              <div className="grid md:grid-cols-12 gap-4">
                <div className={`md:col-span-7 rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-5 ${RELIEVE_TARJETA}`}>
                  <div className="text-[12px] font-bold uppercase tracking-wider text-[#F3E7DC]/70 mb-4">
                    {t('w.ejemplo.conv_titulo')}
                  </div>
                  <div className="space-y-4">
                    {CONVOCATORIAS.map((c) => (
                      <div key={c.letra}>
                        <div className="flex items-center justify-between text-[13px] font-semibold">
                          <span>
                            {t('w.ejemplo.conv_nombre')} {c.letra}
                          </span>
                          <span className="text-[#E0B868]">{c.encaje}%</span>
                        </div>
                        <div className="mt-1.5 h-2 rounded-full bg-[#6E4A50]">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-[#B08D57] to-[#C9A46B]"
                            style={{ width: `${c.encaje}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`md:col-span-5 rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-5 ${RELIEVE_TARJETA}`}>
                  <div className="text-[12px] font-bold uppercase tracking-wider text-[#F3E7DC]/70 mb-4">
                    {t('w.ejemplo.pide_titulo')}
                  </div>
                  <div className="space-y-3">
                    {['w.ejemplo.pide1', 'w.ejemplo.pide2'].map((clave) => (
                      <div key={clave} className="flex items-start gap-2.5 text-[13px] text-[#F3E7DC]/85 leading-snug">
                        <Check className="h-4 w-4 text-[#B08D57] shrink-0 mt-0.5" />
                        {t(clave)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/diagnostico"
            className={`h-12 px-7 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#C9A46B] to-[#B08D57] text-[#3A1420] text-sm font-semibold hover:from-[#C9A46B] hover:to-[#8A6636] ${RELIEVE_BOTON}`}
          >
            {t('w.ejemplo.cta')}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="mt-2 text-[12px] text-[#F3E7DC]/55">{t('w.ejemplo.nota')}</div>
        </div>
      </div>
    </main>
  )
}
