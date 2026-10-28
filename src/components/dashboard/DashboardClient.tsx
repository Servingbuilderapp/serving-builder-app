'use client'

import React from 'react'
import { SaludoCliente } from '@/components/dashboard/SaludoCliente'
import { useTranslation } from '@/hooks/useTranslation'
import { PLAN_EMPRENDEDOR } from '@/lib/planEmprendedor'
import { BotonPagoBold } from '@/components/pagos/BotonPagoBold'

interface DashboardClientProps {
  proyecto: any
  nombreMostrar: string
  subirDocumento?: React.ReactNode
  otrosPagado?: React.ReactNode
}

export function DashboardClient({ proyecto, nombreMostrar, subirDocumento, otrosPagado }: DashboardClientProps) {
  const { t } = useTranslation()

  const mensajePortalReplica = proyecto
    ? `Hola, quiero información sobre el Portal Réplica para mi proyecto "${proyecto.nombre_iniciativa}".`
    : 'Hola, quiero información sobre el Portal Réplica.'
  const portalReplicaWhatsappUrl = 'https://wa.me/573123335966?text=' + encodeURIComponent(mensajePortalReplica)

  return (
    <div className="w-full max-w-4xl mx-auto p-6 md:p-8 space-y-8 pb-12">
      <div>
        <SaludoCliente nombreMostrar={nombreMostrar} />
        <p className="mt-2 text-sm text-color-base-content/60">{t('dashboard.ventaja_frase')}</p>
      </div>

      {!proyecto && (
        <div className="p-10 rounded-3xl border border-color-base-content/10 bg-color-base-content/5 text-center space-y-3">
          <h3 className="text-lg font-bold text-color-base-content">{t('dashboard.sin_proyecto_titulo')}</h3>
          <p className="text-color-base-content/60 text-sm">
            {t('dashboard.sin_proyecto_texto')}
          </p>
        </div>
      )}

      {proyecto && proyecto.estado_actual === 'pendiente_aval' && (
        <div className="p-8 rounded-3xl border border-amber-300 bg-amber-50 text-center space-y-3">
          <h3 className="text-lg font-black text-amber-800">Tu solicitud está en revisión</h3>
          <p className="text-amber-700 text-sm max-w-md mx-auto">
            Serving está revisando que el plan Estructuración Emprendedor sea el adecuado para <strong>{proyecto.nombre_iniciativa}</strong>.
            Cuando te aprueben, aquí aparece el botón de pago. No tienes que pagar nada todavía.
          </p>
        </div>
      )}

      {proyecto && proyecto.estado_actual === 'aval_rechazado' && (
        <div className="p-8 rounded-3xl border border-amber-300 bg-amber-50 text-center space-y-3">
          <h3 className="text-lg font-black text-amber-800">Tu solicitud no fue aprobada para este plan</h3>
          <p className="text-amber-700 text-sm max-w-md mx-auto">
            Este plan es solo para quien no tiene recursos para estructurar su proyecto. Escríbenos por WhatsApp y te
            contamos qué otra modalidad te corresponde.
          </p>
        </div>
      )}

      {proyecto && proyecto.estado_actual === 'pendiente_pago' && proyecto.plan_pago === PLAN_EMPRENDEDOR && (
        <div className="p-8 rounded-3xl border border-emerald-300 bg-emerald-50 text-center space-y-3">
          <h3 className="text-lg font-black text-emerald-800">Tu solicitud fue aprobada</h3>
          <p className="text-emerald-700 text-sm max-w-md mx-auto">
            Ya puedes pagar tu plan Estructuración Emprendedor de <strong>{proyecto.nombre_iniciativa}</strong>.
            Valor: $6.000.000 + IVA ($7.140.000 en total).
          </p>
          <div className="max-w-sm mx-auto">
            <BotonPagoBold
              endpoint="/api/proyectos/bold/iniciar"
              campoId="proyectoId"
              id={proyecto.id}
            />
          </div>
        </div>
      )}

      {proyecto && proyecto.estado_actual === 'pendiente_pago' && proyecto.plan_pago !== PLAN_EMPRENDEDOR && (
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
          {subirDocumento}
        </div>
      )}

      {otrosPagado}

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
