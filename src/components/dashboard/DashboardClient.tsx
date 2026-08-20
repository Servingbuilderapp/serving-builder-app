'use client'

import React from 'react'
import { SubirDocumentoProyecto } from '@/components/dashboard/SubirDocumentoProyecto'
import { SaludoCliente } from '@/components/dashboard/SaludoCliente'
import { ChecklistEstructuracion } from '@/components/dashboard/ChecklistEstructuracion'
import { PreguntasPendientesProyecto } from '@/components/dashboard/PreguntasPendientesProyecto'
import { EstadoProyecto } from '@/components/dashboard/EstadoProyecto'
import { ConvocatoriasEncontradas } from '@/components/dashboard/ConvocatoriasEncontradas'
import { useTranslation } from '@/hooks/useTranslation'

interface DashboardClientProps {
  proyecto: any
  nombreMostrar: string
}

export function DashboardClient({ proyecto, nombreMostrar }: DashboardClientProps) {
  const { t } = useTranslation()

  const mensajePortalReplica = proyecto
    ? `Hola, quiero información sobre el Portal Réplica para mi proyecto "${proyecto.nombre_iniciativa}".`
    : 'Hola, quiero información sobre el Portal Réplica.'
  const portalReplicaWhatsappUrl = 'https://wa.me/573227008727?text=' + encodeURIComponent(mensajePortalReplica)

  return (
    <div className="w-full max-w-4xl mx-auto p-6 md:p-8 space-y-8 pb-12">
      <div>
        <SaludoCliente nombreMostrar={nombreMostrar} />
      </div>

      {!proyecto && (
        <div className="p-10 rounded-3xl border border-color-base-content/10 bg-color-base-content/5 text-center space-y-3">
          <h3 className="text-lg font-bold text-color-base-content">{t('dashboard.sin_proyecto_titulo')}</h3>
          <p className="text-color-base-content/60 text-sm">
            {t('dashboard.sin_proyecto_texto')}
          </p>
        </div>
      )}

      {proyecto && proyecto.estado_actual === 'pendiente_pago' && (
        <div className="p-8 rounded-3xl border border-amber-300 bg-amber-50 text-center space-y-3">
          <h3 className="text-lg font-black text-amber-800">{t('dashboard.pendiente_pago_titulo')}</h3>
          <p className="text-amber-700 text-sm max-w-md mx-auto">
            {t('dashboard.pendiente_pago_texto_1')} <strong>{proyecto.nombre_iniciativa}</strong> {t('dashboard.pendiente_pago_texto_2')}
          </p>
        </div>
      )}

      {proyecto && proyecto.estado_actual === 'pagado' && (
        <div className="p-8 rounded-3xl border border-emerald-300 bg-emerald-50 space-y-4">
          <h3 className="text-lg font-black text-emerald-800">{t('dashboard.pagado_titulo')}</h3>
          <p className="text-emerald-700 text-sm">
            {t('dashboard.pagado_texto_1')}{proyecto.nombre_iniciativa}{t('dashboard.pagado_texto_2')}
          </p>
          <SubirDocumentoProyecto
            proyectoId={proyecto.id}
            archivoActualNombre={proyecto.archivo_proyecto_nombre}
            archivoActualUrl={proyecto.archivo_proyecto_url}
          />
        </div>
      )}

      {proyecto && proyecto.estado_actual === 'pagado' && (
        <ChecklistEstructuracion proyectoId={proyecto.id} />
      )}

      {proyecto && proyecto.estado_actual === 'pagado' && (
        <EstadoProyecto proyectoId={proyecto.id} />
      )}

      {proyecto && proyecto.estado_actual === 'pagado' && (
        <PreguntasPendientesProyecto proyectoId={proyecto.id} />
      )}

      {proyecto && proyecto.estado_actual === 'pagado' && (
        <ConvocatoriasEncontradas proyectoId={proyecto.id} />
      )}

      {proyecto && (
        <div className="p-8 rounded-3xl border border-color-base-content/10 bg-color-base-content/5 space-y-3">
          <h3 className="text-lg font-black text-color-base-content">{t('dashboard.portal_replica_titulo')}</h3>
          <p className="text-color-base-content/60 text-sm max-w-md">
            {t('dashboard.portal_replica_texto')}
          </p>
          <a
            href={portalReplicaWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-color-primary hover:underline"
          >
            {t('dashboard.portal_replica_boton')}
          </a>
        </div>
      )}
    </div>
  )
}
