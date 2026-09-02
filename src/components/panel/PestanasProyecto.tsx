'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowLeft,
  CalendarRange,
  Coins,
  Copy,
  FileText,
  LayoutGrid,
  ListTree,
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
] as const

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
    <div className="border-b border-[#E4EAF3] bg-white">
      <div className="px-4 pt-4 lg:px-6">
        <Link
          href="/admin/proyectos"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#7C8CA5] hover:text-[#1D4ED8]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver a proyectos
        </Link>

        <h1 className="mt-1 text-[17px] font-extrabold tracking-tight text-[#0B2A4A]">
          {nombreProyecto}
        </h1>
        {nombreCliente ? (
          <p className="text-[12.5px] text-[#7C8CA5]">{nombreCliente}</p>
        ) : null}
      </div>

      <nav className="mt-3 flex gap-1 overflow-x-auto px-2 lg:px-4">
        {PESTANAS.map((pestana) => {
          const destino = pestana.clave ? `${base}/${pestana.clave}` : base
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
                  ? 'border-[#1D4ED8] text-[#1D4ED8]'
                  : 'border-transparent text-[#5B6B84] hover:border-[#DCE4F0] hover:text-[#0B2A4A]'
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
