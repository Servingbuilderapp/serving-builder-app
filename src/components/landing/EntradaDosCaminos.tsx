'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Building2, Landmark, Sprout, TrendingUp, Search, FileCheck2 } from 'lucide-react'

/* Relieve: mismos efectos que el resto del website */
const RELIEVE_BOTON =
  'shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200'
const RELIEVE_TARJETA =
  'shadow-[0_1px_2px_rgba(11,42,74,0.06),0_10px_28px_-14px_rgba(11,42,74,0.22)] hover:shadow-[0_2px_6px_rgba(11,42,74,0.10),0_20px_44px_-16px_rgba(11,42,74,0.32)] hover:-translate-y-1 transition-all duration-300'

/**
 * Portada de Serving: dos líneas comerciales con el mismo peso visual.
 * - Línea 1 (proyectos empresariales) lleva a /empresarial.
 * - Línea 2 (acceso a recursos) es el flujo que ya funciona: /diagnostico.
 * Las imágenes son elementos propios (iconos), sin fotos ni marcas de terceros.
 */
const LINEAS = [
  {
    numero: '01',
    etiqueta: 'Primera línea',
    titulo: 'Arquitectura de Proyectos Empresariales',
    lema: 'Crea. Fortalece. Crece.',
    frase: 'De una idea a una empresa. De una empresa a nuevas oportunidades.',
    texto:
      'Diseñamos proyectos para crear empresas, consolidar negocios y abrir nuevas oportunidades de crecimiento: ideas claras de negocio llevadas a la realidad para competir.',
    boton: 'Quiero desarrollar mi proyecto',
    href: '/empresarial',
    iconos: [Sprout, Building2, TrendingUp],
    claro: false,
  },
  {
    numero: '02',
    etiqueta: 'Segunda línea',
    titulo: 'Arquitectura de Proyectos Financiables',
    lema: 'Identifica. Estructura. Postula.',
    frase: 'Estructuramos tu proyecto para que pueda presentarse ante fondos, entidades y convocatorias.',
    texto:
      'Identificamos las convocatorias y estructuramos tu proyecto financiable para que pueda competir por recursos no reembolsables: dinero que no se devuelve.',
    boton: 'Estructuremos mi proyecto',
    href: '/diagnostico',
    iconos: [Search, FileCheck2, Landmark],
    claro: true,
  },
]

export function EntradaDosCaminos() {
  return (
    <section
      id="dos-lineas"
      className="relative overflow-hidden bg-gradient-to-b from-[#2E0E1A] via-[#3B1727] to-[#54142B] py-16 lg:py-24 border-y-2 border-[#B08D57]/45"
    >
      <div className="max-w-[1100px] mx-auto px-5 lg:px-8">
        <div className="text-center">
          <div className="text-sm font-bold uppercase tracking-[0.3em] text-[#C9A46B] mb-4">Serving</div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#F3E7DC] leading-tight uppercase">
            Fábrica de proyectos estratégicos
          </h2>
          <p className="mt-5 max-w-2xl mx-auto text-lg md:text-xl text-[#F3E7DC]/80 leading-relaxed">
            Convertimos oportunidades en proyectos y proyectos en resultados.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6 lg:gap-8">
          {LINEAS.map((l) => (
            <div
              key={l.numero}
              className={`rounded-3xl border overflow-hidden flex flex-col ${RELIEVE_TARJETA} ${
                l.claro
                  ? 'bg-[#F3E7DC] border-[#B08D57]/60 text-[#3A1420]'
                  : 'bg-gradient-to-br from-[#4C2032] to-[#3B1727] border-[#B08D57]/45 text-[#F3E7DC]'
              }`}
            >
              {/* Imagen propia: tres iconos sobre un fondo con retícula */}
              <div
                aria-hidden
                className={`relative h-36 flex items-center justify-center gap-5 ${
                  l.claro ? 'bg-gradient-to-br from-[#E9D5BF] to-[#F3E7DC]' : 'bg-gradient-to-br from-[#2E0E1A] to-[#4C2032]'
                }`}
              >
                <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgba(176,141,87,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(176,141,87,0.18)_1px,transparent_1px)] [background-size:32px_32px]" />
                {l.iconos.map((Icono, i) => (
                  <div
                    key={i}
                    className={`relative rounded-2xl flex items-center justify-center ring-1 shadow-md ${
                      i === 1 ? 'h-20 w-20' : 'h-14 w-14'
                    } ${l.claro ? 'bg-white ring-[#B08D57]/40' : 'bg-[#3B1727] ring-[#B08D57]/40'}`}
                  >
                    <Icono className={`${i === 1 ? 'h-9 w-9' : 'h-6 w-6'} text-[#B08D57]`} />
                  </div>
                ))}
              </div>

              <div className="p-7 md:p-8 flex flex-col flex-1 items-center text-center">
                <div className={`text-xs font-bold uppercase tracking-[0.2em] ${l.claro ? 'text-[#8A6636]' : 'text-[#C9A46B]'}`}>
                  {l.numero} · {l.etiqueta}
                </div>
                <h3 className="mt-3 min-h-[5.5rem] flex items-center justify-center text-balance text-2xl md:text-[1.7rem] font-extrabold uppercase leading-tight">
                  {l.titulo}
                </h3>
                <div className={`mt-2 text-sm font-bold uppercase tracking-[0.15em] ${l.claro ? 'text-[#8A6636]' : 'text-[#C9A46B]'}`}>
                  {l.lema}
                </div>
                <p className="mt-4 text-lg font-semibold leading-snug">{l.frase}</p>
                <p className={`mt-3 text-[15px] leading-relaxed ${l.claro ? 'text-[#3A1420]/80' : 'text-[#F3E7DC]/80'}`}>{l.texto}</p>

                <div className="mt-auto pt-7 w-full">
                  <Link
                    href={l.href}
                    className={`min-h-14 px-6 py-3 w-full inline-flex items-center justify-center gap-2 rounded-xl text-[15px] font-extrabold uppercase tracking-wide text-center ${RELIEVE_BOTON} ${
                      l.claro
                        ? 'bg-gradient-to-b from-[#6B1F3A] to-[#54142B] text-[#F3E7DC]'
                        : 'bg-gradient-to-b from-[#C9A46B] to-[#B08D57] text-[#3A1420]'
                    }`}
                  >
                    {l.boton}
                    <ArrowRight className="h-5 w-5 shrink-0" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
