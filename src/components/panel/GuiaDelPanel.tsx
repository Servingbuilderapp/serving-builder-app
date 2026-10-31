'use client'

import React, { useEffect, useRef } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { AYUDAS } from '@/lib/ayudas'

/**
 * "Conoce tu panel": una guía visible en la pantalla de Inicio que explica qué es cada
 * cosa del menú (decisión del dueño, 30 oct 2026). Usa los mismos textos de ayuda que
 * aparecen al pasar el cursor por el menú (src/lib/ayudas.ts), para que nunca se
 * contradigan. Está abierta la primera vez; si el cliente la cierra, se recuerda.
 */

const CLAVE_GUARDADO = 'guia-panel-cerrada'

const DEFINICIONES: { titulo: { es: string; en: string }; texto: { es: string; en: string } }[] = [
  {
    titulo: { es: '¿Qué es Centinela?', en: 'What is Centinela?' },
    texto: {
      es: 'Es nuestro servicio de búsqueda de convocatorias. Revisa fuentes todos los días y reúne en tu biblioteca las convocatorias de financiación que pueden servirle a tu proyecto, para que no tengas que rastrear fuente por fuente.',
      en: 'It is our funding-call search service. It reviews sources every day and gathers in your library the funding calls that could suit your project, so you do not have to track source by source.',
    },
  },
  {
    titulo: { es: '¿Qué es una membresía? ¿Cuántas hay?', en: 'What is a membership? How many are there?' },
    texto: {
      es: 'Es una suscripción en la que tú llevas el timón: te damos el método, los recursos y las oportunidades, y tú construyes tu propio proyecto. Hay tres niveles: Explorador, Constructor y Arquitecto.',
      en: 'It is a subscription where you take the helm: we give you the method, resources and opportunities, and you build your own project. There are three levels: Explorer, Builder and Architect.',
    },
  },
]

const SECCIONES: { nombre: string; clave: string }[] = [
  { nombre: 'Mi proyecto', clave: 'panel.avance' },
  { nombre: 'Convocatorias para ti', clave: 'panel.mis_convocatorias' },
  { nombre: 'Lo que me piden', clave: 'panel.pendientes' },
  { nombre: 'Mis documentos', clave: 'panel.documentos' },
  { nombre: 'Mi abanico', clave: 'panel.mi_abanico' },
  { nombre: 'App de Ideas', clave: 'panel.ideas' },
  { nombre: 'Academia', clave: 'panel.academia' },
  { nombre: 'Mi membresía', clave: 'panel.mi_membresia' },
  { nombre: 'Sesiones grupales', clave: 'panel.sesiones' },
  { nombre: 'Comunidad', clave: 'panel.comunidad' },
  { nombre: 'Acompañamiento', clave: 'panel.acompanamiento' },
  { nombre: 'Calificación final', clave: 'panel.calificacion' },
  { nombre: 'A tu medida', clave: 'panel.a_tu_medida' },
  { nombre: 'Ventajas del mes', clave: 'panel.convocatorias_mes' },
  { nombre: 'Calendario', clave: 'panel.calendario' },
  { nombre: 'Buscador de fondos', clave: 'panel.buscar_fondos' },
  { nombre: 'Mis proyectos', clave: 'panel.mis_proyectos' },
]

export function GuiaDelPanel() {
  const { language } = useLanguage()
  const idioma = language === 'es' ? 'es' : 'en'
  const caja = useRef<HTMLDetailsElement>(null)

  // Si el cliente ya la cerró antes, se abre cerrada (se ajusta el elemento directamente).
  useEffect(() => {
    try {
      if (window.localStorage.getItem(CLAVE_GUARDADO) === '1' && caja.current) caja.current.open = false
    } catch {
      /* sin almacenamiento local: se deja abierta */
    }
  }, [])

  const alCambiar = (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    try {
      window.localStorage.setItem(CLAVE_GUARDADO, e.currentTarget.open ? '0' : '1')
    } catch {
      /* no pasa nada */
    }
  }

  return (
    <details
      ref={caja}
      open
      onToggle={alCambiar}
      className="group mx-4 mt-3 lg:mx-6 rounded-xl border border-[#B08D57]/40 bg-[#4C2032] px-4 py-3 text-[#F3E7DC]"
    >
      <summary className="cursor-pointer text-sm font-extrabold">
        {idioma === 'es' ? 'Conoce tu panel: qué es cada cosa' : 'Get to know your panel: what each thing is'}
        <span className="ml-2 text-xs font-medium text-[#F3E7DC]/70">
          <span className="group-open:hidden">{idioma === 'es' ? 'toca para abrir' : 'tap to open'}</span>
          <span className="hidden group-open:inline">{idioma === 'es' ? 'toca para cerrar' : 'tap to close'}</span>
        </span>
      </summary>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {DEFINICIONES.map((d) => (
          <div key={d.titulo.es} className="rounded-lg border border-[#B08D57]/45 bg-[#3B1727] p-3">
            <div className="text-[13px] font-extrabold text-[#C9A46B]">{d.titulo[idioma]}</div>
            <p className="mt-1 text-[12.5px] leading-relaxed text-[#F3E7DC]/85">{d.texto[idioma]}</p>
          </div>
        ))}
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer text-[13px] font-bold text-[#C9A46B]">
          {idioma === 'es' ? 'Ver qué es cada sección del menú' : 'See what each menu section is'}
        </summary>
        <dl className="mt-3 grid gap-x-6 gap-y-3 md:grid-cols-2">
        {SECCIONES.map((s) => {
          const ayuda = AYUDAS[s.clave]
          if (!ayuda) return null
          return (
            <div key={s.clave}>
              <dt className="text-[13px] font-extrabold text-[#F3E7DC]">{s.nombre}</dt>
              <dd className="text-[12.5px] leading-relaxed text-[#F3E7DC]/75">{ayuda[idioma]}</dd>
            </div>
          )
        })}
        </dl>
      </details>
    </details>
  )
}
