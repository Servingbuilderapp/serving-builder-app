'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  ListChecks,
  FolderKanban,
  Settings,
  Lightbulb,
  Radar,
  X,
} from 'lucide-react'

type Item = {
  nombre: string
  href?: string
  icono: React.ElementType
}

type Seccion = {
  titulo?: string
  items: Item[]
}

/**
 * Menú del panel.
 *
 * REGLA DE FONDO: la estructuración la hace SERVING, no el cliente. Por eso el
 * cliente no ve en su menú el árbol de problemas, la cadena de valor, el
 * presupuesto ni las validaciones: ese es trabajo interno del equipo y, si lo
 * ve, entiende que le toca a él hacerlo.
 *
 * Tampoco se le muestran entradas en gris de pantallas que aún no existen: un
 * menú lleno de renglones apagados se lee como un producto a medio hacer. Aquí
 * solo va lo que se puede abrir.
 *
 * Un item SIN `href` se muestra en gris y no navega; se deja el soporte por si
 * hace falta anunciar algo que está por salir.
 */
const SECCIONES_CLIENTE: Seccion[] = [
  {
    items: [
      { nombre: 'Resumen general', href: '/dashboard', icono: Home },
      { nombre: 'Avance de mi proyecto', href: '/mi-proyecto', icono: ListChecks },
      { nombre: 'App de Ideas', href: '/ideas', icono: Lightbulb },
    ],
  },
]

/** Lo que solo ve el equipo de Serving. */
const SECCIONES_EQUIPO: Seccion[] = [
  {
    titulo: 'Equipo Serving',
    items: [
      { nombre: 'Proyectos de clientes', href: '/admin/proyectos', icono: FolderKanban },
      { nombre: 'Convocatorias', href: '/admin/convocatorias', icono: Radar },
      { nombre: 'Administración', href: '/admin', icono: Settings },
    ],
  },
]

export function MenuLateral({
  abiertoEnMovil,
  onCerrar,
  esEquipo = false,
}: {
  abiertoEnMovil: boolean
  onCerrar: () => void
  /** true solo para el equipo de Serving: le agrega sus secciones internas. */
  esEquipo?: boolean
}) {
  const ruta = usePathname()

  const secciones = esEquipo ? [...SECCIONES_CLIENTE, ...SECCIONES_EQUIPO] : SECCIONES_CLIENTE

  const contenido = (
    <div className="flex h-full flex-col bg-[#F8FAFD] text-[#334155] border-r border-[#E4EAF3] shadow-[2px_0_12px_-8px_rgba(11,42,74,0.25)]">
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {secciones.map((seccion, i) => (
          <div key={seccion.titulo || `seccion-${i}`}>
            {seccion.titulo ? (
              <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">
                {seccion.titulo}
              </div>
            ) : null}

            <ul className="space-y-0.5">
              {seccion.items.map((item) => {
                const Icono = item.icono
                const activo = item.href ? ruta === item.href : false
                const disponible = Boolean(item.href)

                const clases = [
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors',
                  activo
                    ? 'bg-[#EFF6FF] font-semibold text-[#1D4ED8] shadow-[inset_3px_0_0_0_#1D4ED8,0_1px_2px_rgba(11,42,74,0.06)]'
                    : disponible
                      ? 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B2A4A]'
                      : 'text-[#A3B0C2] cursor-default',
                ].join(' ')

                const interior = (
                  <>
                    <Icono className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.nombre}</span>
                    {!disponible ? (
                      <span
                        className="ml-auto h-1.5 w-1.5 rounded-full bg-[#CBD5E1] shrink-0"
                        title="En construcción"
                      />
                    ) : null}
                  </>
                )

                return (
                  <li key={item.nombre}>
                    {disponible ? (
                      <Link href={item.href as string} onClick={onCerrar} className={clases}>
                        {interior}
                      </Link>
                    ) : (
                      <div className={clases} title="En construcción">
                        {interior}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-[#E4EAF3] p-3">
        <div className="px-3 py-2 text-[12px] leading-relaxed text-[#5B6B84]">
          ¿Necesitas ayuda?
          <br />
          <a
            href="https://wa.me/573227008727"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#1D4ED8] underline hover:text-[#1E40AF]"
          >
            Escríbenos por WhatsApp
          </a>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* escritorio */}
      <aside className="hidden lg:block w-[248px] shrink-0 h-full">{contenido}</aside>

      {/* móvil */}
      {abiertoEnMovil ? (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-[268px] h-full shadow-2xl relative">
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar menú"
              className="absolute right-2 top-2 z-10 h-8 w-8 rounded-lg border border-[#E2E8F0] bg-[#F1F5F9] text-[#0B2A4A] flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
            {contenido}
          </div>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={onCerrar}
            className="flex-1 bg-[#0B2A4A]/35 backdrop-blur-sm"
          />
        </div>
      ) : null}
    </>
  )
}
