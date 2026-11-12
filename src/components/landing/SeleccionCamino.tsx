import React from 'react'
import Link from 'next/link'
import { ArrowRight, Building2, Landmark } from 'lucide-react'

const RELIEVE_BOTON =
  'shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200'
const RELIEVE_TARJETA =
  'shadow-[0_1px_2px_rgba(11,42,74,0.06),0_10px_28px_-14px_rgba(11,42,74,0.22)] hover:shadow-[0_2px_6px_rgba(11,42,74,0.10),0_20px_44px_-16px_rgba(11,42,74,0.32)] hover:-translate-y-1 transition-all duration-300'

const CAMINOS = [
  {
    icono: Building2,
    etiqueta: 'Proyectos empresariales',
    titulo: 'Mis proyectos empresariales',
    texto: 'Crea, fortalece o haz crecer tu empresa: diagnóstico, oportunidades, mercado, cifras y documento final.',
    boton: 'Entrar a mis proyectos empresariales',
    href: '/empresarial',
    claro: false,
  },
  {
    icono: Landmark,
    etiqueta: 'Proyectos financiables',
    titulo: 'Mi panel de financiación',
    texto: 'Estructura tu proyecto y búscale convocatorias y recursos no reembolsables: dinero que no se devuelve.',
    boton: 'Entrar a mi panel de financiación',
    href: '/dashboard',
    claro: true,
  },
]

/** Pantalla a la que llega la persona después de iniciar sesión: elige a cuál de los dos caminos entra. */
export function SeleccionCamino() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2E0E1A] via-[#3B1727] to-[#54142B] text-[#F3E7DC] flex items-center">
      <div className="mx-auto w-full max-w-[1000px] px-5 lg:px-8 py-12">
        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-[0.3em] text-[#C9A46B]">Serving · Fábrica de proyectos estratégicos</div>
          <h1 className="mt-3 text-3xl md:text-4xl font-extrabold">¿A dónde quieres entrar?</h1>
          <p className="mt-3 text-[#F3E7DC]/75">Puedes trabajar en los dos. Elige por dónde empezar hoy.</p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {CAMINOS.map((c) => (
            <div
              key={c.href}
              className={`flex flex-col rounded-3xl border p-6 text-center ${RELIEVE_TARJETA} ${
                c.claro ? 'bg-[#F3E7DC] border-[#B08D57]/60 text-[#3A1420]' : 'bg-gradient-to-br from-[#4C2032] to-[#3B1727] border-[#B08D57]/45 text-[#F3E7DC]'
              }`}
            >
              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ring-1 shadow-md ${c.claro ? 'bg-white ring-[#B08D57]/40' : 'bg-[#2E0E1A] ring-[#B08D57]/40'}`}>
                <c.icono className="h-7 w-7 text-[#B08D57]" />
              </div>
              <div className={`mt-4 text-xs font-bold uppercase tracking-[0.2em] ${c.claro ? 'text-[#8A6636]' : 'text-[#C9A46B]'}`}>{c.etiqueta}</div>
              <h2 className="mt-2 text-2xl font-extrabold">{c.titulo}</h2>
              <p className={`mt-3 text-sm leading-relaxed ${c.claro ? 'text-[#3A1420]/80' : 'text-[#F3E7DC]/80'}`}>{c.texto}</p>
              <div className="mt-auto pt-6">
                <Link
                  href={c.href}
                  className={`min-h-12 px-5 py-2.5 w-full inline-flex items-center justify-center gap-2 rounded-xl text-sm font-extrabold uppercase tracking-wide text-center ${RELIEVE_BOTON} ${
                    c.claro ? 'bg-gradient-to-b from-[#6B1F3A] to-[#54142B] text-[#F3E7DC]' : 'bg-gradient-to-b from-[#C9A46B] to-[#B08D57] text-[#3A1420]'
                  }`}
                >
                  {c.boton}
                  <ArrowRight className="h-5 w-5 shrink-0" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
