'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, Lock } from 'lucide-react'
import { useCamino, type EstadoPaso } from '@/components/empresarial/MenuCamino'

const RELIEVE_BOTON =
  'shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200'
const RELIEVE_TARJETA = 'shadow-[0_1px_2px_rgba(11,42,74,0.06),0_10px_28px_-14px_rgba(11,42,74,0.22)]'

const ETIQUETA: Record<EstadoPaso, string> = {
  hecho: 'Hecho',
  en_curso: 'En curso',
  por_hacer: 'Por hacer',
  bloqueado: 'Aún no disponible',
  proximamente: 'Muy pronto',
}

export function CaminoClient({ proyectoId }: { proyectoId: string }) {
  const { datos, cargando } = useCamino(proyectoId)

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2E0E1A] via-[#3B1727] to-[#54142B] text-[#F3E7DC]">
      <div className="max-w-[900px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <Link href="/empresarial" className="inline-flex items-center gap-2 text-sm text-[#F3E7DC]/70 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Mis proyectos
        </Link>

        {cargando && <p className="mt-8 text-[#F3E7DC]/70">Cargando tu camino…</p>}
        {!cargando && !datos && (
          <p className="mt-8 rounded-2xl bg-[#2E0E1A] p-4">No encontramos ese proyecto. Revisa que hayas entrado con tu cuenta.</p>
        )}

        {datos && (
          <>
            <div className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-[#C9A46B]">Mi camino</div>
            <h1 className="mt-3 text-3xl lg:text-4xl font-extrabold">{datos.nombre}</h1>
            <p className="mt-3 text-[#F3E7DC]/80 leading-relaxed">
              Estos son los pasos de tu proyecto, en orden. Entra al que quieras desde aquí o desde el menú de la izquierda.
            </p>

            {datos.siguiente?.href && (
              <div className={`mt-6 rounded-2xl border border-[#C9A46B]/60 bg-[#2E0E1A] p-5 ${RELIEVE_TARJETA}`}>
                <p className="text-sm text-[#F3E7DC]/70">Lo siguiente para ti</p>
                <p className="mt-1 text-xl font-extrabold">{datos.siguiente.titulo}</p>
                <p className="mt-1 text-sm text-[#F3E7DC]/80">{datos.siguiente.ayuda}</p>
                <Link
                  href={datos.siguiente.href}
                  className={`mt-4 h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#C9A46B] to-[#B08D57] text-[#3A1420] font-extrabold ${RELIEVE_BOTON}`}
                >
                  Continuar <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            <ol className="mt-6 space-y-3">
              {datos.pasos.map((p, i) => (
                <li key={p.clave} className={`rounded-2xl border border-[#B08D57]/35 bg-[#3B1727] p-5 ${RELIEVE_TARJETA}`}>
                  <div className="flex flex-wrap items-start gap-4">
                    <span
                      aria-hidden
                      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-extrabold ${
                        p.estado === 'hecho' ? 'bg-[#C9A46B] text-[#3A1420]' : 'border border-[#B08D57]/60 text-[#F3E7DC]/70'
                      }`}
                    >
                      {p.estado === 'hecho' ? <Check className="h-5 w-5" /> : p.href ? i + 1 : <Lock className="h-4 w-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-lg font-extrabold">{p.titulo}</div>
                      <div className="text-sm text-[#F3E7DC]/75">{p.ayuda}</div>
                      <div className="mt-1 text-xs font-semibold text-[#C9A46B]">{ETIQUETA[p.estado]}</div>
                    </div>
                    {p.href && (
                      <Link
                        href={p.href}
                        className={`h-11 px-4 inline-flex items-center justify-center rounded-xl border border-[#B08D57]/50 bg-[#3B1727] font-semibold ${RELIEVE_BOTON}`}
                      >
                        {p.estado === 'hecho' ? 'Revisar' : 'Entrar'}
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </main>
  )
}
