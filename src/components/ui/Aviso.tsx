import * as React from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export type TipoAviso = 'exito' | 'error' | 'alerta' | 'info'

const ESTILOS: Record<TipoAviso, { borde: string; icono: string; Icono: React.ElementType }> = {
  exito: { borde: '#7A8B6F', icono: '#9BB18D', Icono: CheckCircle2 },
  error: { borde: '#C0604A', icono: '#E0917E', Icono: AlertCircle },
  alerta: { borde: '#C99A3D', icono: '#E0B868', Icono: AlertTriangle },
  info: { borde: '#8C93A6', icono: '#AEB4C4', Icono: Info },
}

/**
 * Mensaje de aviso (Dirección 5, 9 sep 2026). Cuatro colores propios, aparte
 * del dorado de acento y del vino de fondo, para que un error nunca se
 * confunda con un éxito ni con una simple advertencia.
 */
export function Aviso({
  tipo,
  titulo,
  children,
  className = '',
}: {
  tipo: TipoAviso
  titulo: string
  children?: React.ReactNode
  className?: string
}) {
  const estilo = ESTILOS[tipo]
  const Icono = estilo.Icono

  return (
    <div
      className={`flex gap-3.5 items-start rounded-md p-4 bg-[rgba(0,0,0,0.14)] ${className}`}
      style={{ borderLeft: `3px solid ${estilo.borde}` }}
    >
      <Icono className="h-[19px] w-[19px] shrink-0 mt-0.5" style={{ color: estilo.icono }} />
      <div>
        <h5 className="text-[13px] font-semibold text-[#F3E7DC] m-0 mb-0.5">{titulo}</h5>
        {children ? <p className="text-[12.5px] text-[#D9C6BA] leading-relaxed m-0">{children}</p> : null}
      </div>
    </div>
  )
}
