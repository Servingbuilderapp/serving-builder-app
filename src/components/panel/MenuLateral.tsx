'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Info,
  FileText,
  Users,
  UserCheck,
  MapPin,
  ListChecks,
  GitBranch,
  Target,
  Workflow,
  Wallet,
  BarChart3,
  ShieldCheck,
  Search,
  Inbox,
  Archive,
  Library,
  Crosshair,
  CheckSquare,
  Wand2,
  ScrollText,
  FileCheck2,
  Send,
  Activity,
  MessagesSquare,
  RefreshCw,
  Lightbulb,
  LifeBuoy,
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
 * Un item SIN `href` todavía no tiene pantalla construida: se muestra en gris
 * y no navega a ninguna parte, para que el usuario vea el mapa completo del
 * camino sin encontrarse con páginas vacías.
 */
const SECCIONES: Seccion[] = [
  {
    items: [{ nombre: 'Resumen general', href: '/dashboard', icono: Home }],
  },
  {
    titulo: 'Mi proyecto',
    items: [
      { nombre: 'Información general', icono: Info },
      { nombre: 'Documentos', icono: FileText },
      { nombre: 'Equipo y aliados', icono: Users },
      { nombre: 'Beneficiarios', icono: UserCheck },
      { nombre: 'Territorio', icono: MapPin },
    ],
  },
  {
    titulo: 'Estructuración',
    items: [
      { nombre: 'Estructura del proyecto', href: '/estructuracion', icono: ListChecks },
      { nombre: 'Árbol de problemas', icono: GitBranch },
      { nombre: 'Árbol de objetivos', icono: Target },
      { nombre: 'Cadena de valor', icono: Workflow },
      { nombre: 'Presupuesto', icono: Wallet },
      { nombre: 'Indicadores', icono: BarChart3 },
      { nombre: 'Validaciones', icono: ShieldCheck },
    ],
  },
  {
    titulo: 'Convocatorias',
    items: [
      { nombre: 'Búsqueda', icono: Search },
      { nombre: 'Convocatorias encontradas', icono: Inbox },
      { nombre: 'Convocatorias descartadas', icono: Archive },
      { nombre: 'Biblioteca', icono: Library },
    ],
  },
  {
    titulo: 'Encaje y adaptación',
    items: [
      { nombre: 'Análisis de encaje', icono: Crosshair },
      { nombre: 'Convocatoria seleccionada', icono: CheckSquare },
      { nombre: 'Adaptación del proyecto', icono: Wand2 },
      { nombre: 'Términos de referencia', icono: ScrollText },
    ],
  },
  {
    titulo: 'Postulación y seguimiento',
    items: [
      { nombre: 'Documentos requeridos', icono: FileCheck2 },
      { nombre: 'Postulación', icono: Send },
      { nombre: 'Seguimiento', icono: Activity },
      { nombre: 'Comunicaciones', icono: MessagesSquare },
    ],
  },
  {
    titulo: 'Réplicas',
    items: [{ nombre: 'Mis réplicas', icono: RefreshCw }],
  },
  {
    titulo: 'Herramientas',
    items: [{ nombre: 'App de Ideas', href: '/ideas', icono: Lightbulb }],
  },
]

export function MenuLateral({
  abiertoEnMovil,
  onCerrar,
}: {
  abiertoEnMovil: boolean
  onCerrar: () => void
}) {
  const ruta = usePathname()

  const contenido = (
    <div className="flex h-full flex-col bg-[#0C2E5C] text-white/85">
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {SECCIONES.map((seccion, i) => (
          <div key={seccion.titulo || `seccion-${i}`}>
            {seccion.titulo ? (
              <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
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
                    ? 'bg-white/[0.14] font-semibold text-white shadow-[inset_2px_0_0_0_#60A5FA]'
                    : disponible
                      ? 'text-white/80 hover:bg-white/[0.08] hover:text-white'
                      : 'text-white/35 cursor-default',
                ].join(' ')

                const interior = (
                  <>
                    <Icono className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.nombre}</span>
                    {!disponible ? (
                      <span
                        className="ml-auto h-1.5 w-1.5 rounded-full bg-white/25 shrink-0"
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

      <div className="border-t border-white/10 p-3">
        <div
          className="flex items-center gap-2.5 rounded-lg bg-white/[0.06] px-3 py-2.5 text-[13px] text-white/60"
          title="En construcción"
        >
          <LifeBuoy className="h-4 w-4 shrink-0" />
          <span>Centro de ayuda</span>
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
              className="absolute right-2 top-2 z-10 h-8 w-8 rounded-lg bg-white/10 text-white flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
            {contenido}
          </div>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={onCerrar}
            className="flex-1 bg-[#081F3F]/60 backdrop-blur-sm"
          />
        </div>
      ) : null}
    </>
  )
}
