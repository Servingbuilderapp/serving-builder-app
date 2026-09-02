import React from 'react'
import Link from 'next/link'
import {
  CalendarRange,
  Coins,
  Copy,
  ListTree,
  Send,
  Target,
  Workflow,
} from 'lucide-react'

/* ========================================================================== */
/* Ficha del proyecto — la portada de las pantallas internas del equipo.      */
/* Reúne los datos del cliente y el estado de cada área, para saber de un     */
/* vistazo qué está lleno y qué falta antes de entrar a cada pantalla.        */
/* ========================================================================== */

export type AreaFicha = {
  nombre: string
  ruta: string
  cantidad: number
  unidad: string
}

export type DatosFicha = {
  proyectoId: string
  nombreCliente: string
  correoCliente: string
  modalidad: string
  creado: string
  estado: string
  porcentaje: number
  areas: AreaFicha[]
}

const ICONOS: Record<string, React.ComponentType<{ className?: string }>> = {
  arbol: ListTree,
  objetivos: Target,
  'cadena-valor': Workflow,
  presupuesto: Coins,
  cronograma: CalendarRange,
  postulaciones: Send,
  replicas: Copy,
}

const SOMBRA =
  'shadow-[0_1px_2px_rgba(11,42,74,0.06),0_8px_24px_-14px_rgba(11,42,74,0.20)]'

const ESTADOS: Record<string, string> = {
  pendiente_pago: 'Pendiente de pago',
  pagado: 'Listo para iniciar',
  estructurando_ia: 'En estructuración',
  en_estructuracion: 'En estructuración',
  estructurado: 'Estructurado',
}

function Tarjeta({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-[#E4EAF3] bg-white ${SOMBRA} ${className}`}>
      {children}
    </div>
  )
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">{etiqueta}</div>
      <div className="mt-0.5 text-[13.5px] font-semibold text-[#0B2A4A]">{valor}</div>
    </div>
  )
}


export function FichaProyecto({ datos }: { datos: DatosFicha }) {
  const { proyectoId, porcentaje, areas } = datos

  return (
    <div className="space-y-5 p-4 lg:p-6">
      {/* datos del proyecto ------------------------------------------------ */}
      <Tarjeta className="p-5 lg:p-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Dato etiqueta="Cliente" valor={datos.nombreCliente} />
          <Dato etiqueta="Correo" valor={datos.correoCliente} />
          <Dato etiqueta="Modalidad" valor={datos.modalidad} />
          <Dato etiqueta="Contratado el" valor={datos.creado} />
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-[#EEF2F8] pt-4 sm:flex-row sm:items-center">
          <span className="inline-flex w-fit items-center rounded-full border border-[#DCE4F0] bg-[#F4F7FC] px-3 py-1 text-[12px] font-semibold text-[#0B2A4A]">
            {datos.estado}
          </span>

          <div className="flex flex-1 items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#EEF2F8]">
              <div
                className="h-full rounded-full bg-[#1D4ED8] transition-all duration-500"
                style={{ width: `${porcentaje}%` }}
              />
            </div>
            <span className="shrink-0 text-[12.5px] font-bold tabular-nums text-[#0B2A4A]">
              {porcentaje}%
            </span>
          </div>
        </div>
      </Tarjeta>

      {/* áreas de trabajo --------------------------------------------------- */}
      <div>
        <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wider text-[#0B2A4A]">
          Áreas de trabajo
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {areas.map((area) => {
            const Icono = ICONOS[area.ruta] || ListTree
            const vacia = area.cantidad === 0

            return (
              <Link key={area.ruta} href={`/admin/proyectos/${proyectoId}/${area.ruta}`}>
                <Tarjeta className="h-full p-4 transition-shadow hover:shadow-[0_2px_4px_rgba(11,42,74,0.08),0_14px_30px_-16px_rgba(11,42,74,0.30)]">
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        vacia ? 'bg-[#F1F5FA] text-[#94A3B8]' : 'bg-[#EAF1FE] text-[#1D4ED8]'
                      }`}
                    >
                      <Icono className="h-4 w-4" />
                    </span>

                    <div className="min-w-0">
                      <div className="text-[13.5px] font-bold text-[#0B2A4A]">{area.nombre}</div>
                      <div
                        className={`mt-0.5 text-[12px] ${vacia ? 'text-[#94A3B8]' : 'text-[#5B6B84]'}`}
                      >
                        {vacia ? 'Todavía sin datos' : `${area.cantidad} ${area.unidad}`}
                      </div>
                    </div>
                  </div>
                </Tarjeta>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
