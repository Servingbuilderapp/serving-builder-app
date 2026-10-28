'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  ArrowLeft,
  BadgeCheck,
  CalendarRange,
  ClipboardList,
  FolderOpen,
  Coins,
  Copy,
  FileText,
  Gauge,
  LayoutGrid,
  ListTree,
  Radar,
  Send,
  Target,
  Workflow,
} from 'lucide-react'

/**
 * Barra de pestañas del proyecto (equipo Serving).
 *
 * Antes, para pasar del árbol al presupuesto había que devolverse a la lista de
 * proyectos: las siete pantallas internas solo se alcanzaban desde la tabla.
 * Esta barra vive en el layout de /admin/proyectos/[id], así que aparece en
 * todas ellas sin tocar cada pantalla.
 */

export const PESTANAS = [
  { clave: '', nombre: 'Ficha', icono: LayoutGrid },
  { clave: 'estructuracion', nombre: 'Estructuración', icono: FileText },
  { clave: 'arbol', nombre: 'Problemas', icono: ListTree },
  { clave: 'objetivos', nombre: 'Objetivos', icono: Target },
  { clave: 'cadena-valor', nombre: 'Cadena de valor', icono: Workflow },
  { clave: 'presupuesto', nombre: 'Presupuesto', icono: Coins },
  { clave: 'cronograma', nombre: 'Cronograma', icono: CalendarRange },
  { clave: 'postulaciones', nombre: 'Postulaciones', icono: Send },
  { clave: 'replicas', nombre: 'Réplicas', icono: Copy },
  { clave: 'resumen', nombre: 'Resumen', icono: Gauge },
  { clave: 'avance', nombre: 'Avance', icono: Activity },
  { clave: 'calificacion', nombre: 'Calificación', icono: BadgeCheck },
  { clave: 'convocatorias', nombre: 'Convocatorias y encaje', icono: Radar },
  { clave: 'coincidencias', nombre: 'Coincidencias', icono: Radar },
  { clave: 'pendientes', nombre: 'Lo que me piden', icono: ClipboardList },
  { clave: 'documentos', nombre: 'Documentos', icono: FolderOpen },
] as const

/**
 * Pestañas que abren la pantalla del CLIENTE de este proyecto (solo lectura para
 * el equipo): la dirección lleva ?proyecto=<id> para que muestre ese proyecto y
 * no el que esté atado al correo de quien entra.
 */
const PANTALLAS_DEL_CLIENTE: Record<string, string> = {
  resumen: '/dashboard',
  avance: '/mi-proyecto',
  calificacion: '/calificacion',
  convocatorias: '/mis-convocatorias',
  coincidencias: '/coincidencias',
  pendientes: '/pendientes',
  documentos: '/mis-documentos',
}

export function PestanasProyecto({
  proyectoId,
  nombreProyecto,
  nombreCliente,
}: {
  proyectoId: string
  nombreProyecto: string
  nombreCliente?: string | null
}) {
  const ruta = usePathname() || ''
  const base = `/admin/proyectos/${proyectoId}`

  return (
    <div className="border-b border-[#B08D57]/35 bg-[#4C2032]">
      <div className="px-4 pt-4 lg:px-6">
        <Link
          href="/admin/proyectos"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#F3E7DC]/60 hover:text-[#C9A46B]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver a proyectos
        </Link>

        <h1 className="mt-1 text-[17px] font-extrabold tracking-tight text-[#F3E7DC]">
          {nombreProyecto}
        </h1>
        {nombreCliente ? (
          <p className="text-[12.5px] text-[#F3E7DC]/60">{nombreCliente}</p>
        ) : null}
      </div>

      <nav className="mt-3 flex gap-1 overflow-x-auto px-2 lg:px-4">
        {PESTANAS.map((pestana) => {
          // Las pantallas del cliente apuntan a ESTE proyecto con ?proyecto=<id>.
          const pantallaCliente = PANTALLAS_DEL_CLIENTE[pestana.clave]
          const destino = pantallaCliente
            ? `${pantallaCliente}?proyecto=${proyectoId}`
            : pestana.clave
                ? `${base}/${pestana.clave}`
                : base
          const activa = pestana.clave
            ? ruta === destino || ruta.startsWith(`${destino}/`)
            : ruta === base
          const Icono = pestana.icono

          return (
            <Link
              key={pestana.nombre}
              href={destino}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-[12.5px] font-semibold transition-colors ${
                activa
                  ? 'border-[#C9A46B] text-[#C9A46B]'
                  : 'border-transparent text-[#F3E7DC]/60 hover:border-[#B08D57]/40 hover:text-[#F3E7DC]'
              }`}
            >
              <Icono className="h-4 w-4 shrink-0" />
              {pestana.nombre}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
