'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  ListChecks,
  FolderKanban,
  Inbox,
  Settings,
  Lightbulb,
  Radar,
  Satellite,
  Target,
  Copy,
  Wallet,
  CheckSquare,
  GraduationCap,
  Building2,
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
      { nombre: 'Calificación final', href: '/calificacion', icono: CheckSquare },
      { nombre: 'Lo que me piden', href: '/pendientes', icono: Inbox },
      { nombre: 'Mis convocatorias', href: '/mis-convocatorias', icono: Target },
      { nombre: 'Mis réplicas', href: '/mis-replicas', icono: Copy },
      { nombre: 'App de Ideas', href: '/ideas', icono: Lightbulb },
      { nombre: 'Academia', href: '/academia', icono: GraduationCap },
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
      { nombre: 'Centinela Digital', href: '/admin/centinela', icono: Satellite },
      { nombre: 'Membresías', href: '/admin/membresias', icono: Wallet },
      { nombre: 'Academia', href: '/admin/academia', icono: GraduationCap },
      { nombre: 'Marca blanca', href: '/admin/marca-blanca', icono: Building2 },
      { nombre: 'Administración', href: '/admin', icono: Settings },
    ],
  },
]

/**
 * Nombres que quedan afuera del menú de un cliente que entró por el enlace
 * de un socio de marca blanca (acuerdo del 13 sep 2026): App de Ideas y
 * Academia son cosas de la marca propia de Serving, no del servicio que
 * contrató el socio. Réplicas tampoco entra en marca blanca.
 */
const NOMBRES_OCULTOS_MARCA_BLANCA = new Set(['App de Ideas', 'Academia', 'Mis réplicas'])

/**
 * Lo que ve un socio de marca blanca. A propósito es UNA sola entrada:
 * el socio no debe ver ni el menú del cliente (árbol, cadena de valor,
 * etc. — eso es trabajo interno de Serving) ni el panel completo del
 * equipo. Solo su propio resumen de proyectos.
 */
const SECCIONES_SOCIO: Seccion[] = [
  {
    items: [{ nombre: 'Mis proyectos', href: '/socio', icono: FolderKanban }],
  },
]

export function MenuLateral({
  abiertoEnMovil,
  onCerrar,
  esEquipo = false,
  esSocio = false,
  esClienteMarcaBlanca = false,
}: {
  abiertoEnMovil: boolean
  onCerrar: () => void
  /** true solo para el equipo de Serving: le agrega sus secciones internas. */
  esEquipo?: boolean
  /** true solo para un socio de marca blanca: reemplaza TODO el menú por el suyo. */
  esSocio?: boolean
  /** true solo para un cliente final que entró por el enlace de un socio de marca blanca. */
  esClienteMarcaBlanca?: boolean
}) {
  const ruta = usePathname()

  const seccionesBase = esSocio
    ? SECCIONES_SOCIO
    : esEquipo
      ? [...SECCIONES_CLIENTE, ...SECCIONES_EQUIPO]
      : SECCIONES_CLIENTE

  const secciones = esClienteMarcaBlanca
    ? seccionesBase.map((seccion) => ({
        ...seccion,
        items: seccion.items.filter((item) => !NOMBRES_OCULTOS_MARCA_BLANCA.has(item.nombre)),
      }))
    : seccionesBase

  const contenido = (
    <div className="flex h-full flex-col bg-color-base-200 text-color-base-content border-r border-color-base-300/40 shadow-[2px_0_12px_-8px_rgba(0,0,0,0.5)]">
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {secciones.map((seccion, i) => (
          <div key={seccion.titulo || `seccion-${i}`}>
            {seccion.titulo ? (
              <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-color-base-content/45">
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
                    ? 'bg-color-primary/15 font-semibold text-color-primary shadow-[inset_3px_0_0_0_#B08D57,0_1px_2px_rgba(0,0,0,0.3)]'
                    : disponible
                      ? 'text-color-base-content/70 hover:bg-color-primary/10 hover:text-color-base-content'
                      : 'text-color-base-content/35 cursor-default',
                ].join(' ')

                const interior = (
                  <>
                    <Icono className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.nombre}</span>
                    {!disponible ? (
                      <span
                        className="ml-auto h-1.5 w-1.5 rounded-full bg-color-base-content/25 shrink-0"
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

      <div className="border-t border-color-base-300/40 p-3">
        <div className="px-3 py-2 text-[12px] leading-relaxed text-color-base-content/70">
          ¿Necesitas ayuda?
          <br />
          <a
            href="https://wa.me/573227008727"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-color-primary underline hover:brightness-110"
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
              className="absolute right-2 top-2 z-10 h-8 w-8 rounded-lg border border-color-base-300/40 bg-color-base-200 text-color-base-content flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
            {contenido}
          </div>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={onCerrar}
            className="flex-1 bg-black/50 backdrop-blur-sm"
          />
        </div>
      ) : null}
    </>
  )
}
