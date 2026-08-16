import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SubirDocumentoProyecto } from '@/components/dashboard/SubirDocumentoProyecto'
import { SaludoCliente } from '@/components/dashboard/SaludoCliente'
import { ChecklistEstructuracion } from '@/components/dashboard/ChecklistEstructuracion'
import { PreguntasPendientesProyecto } from '@/components/dashboard/PreguntasPendientesProyecto'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: proyecto } = await supabase
    .from('proyectos_clientes_serving')
    .select('id, nombre_iniciativa, plan_pago, estado_actual, archivo_proyecto_url, archivo_proyecto_nombre, created_at')
    .eq('correo_cliente', user.email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nombreMostrar = user.user_metadata?.first_name || user.email?.split('@')[0] || 'Usuario'

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
          <h3 className="text-lg font-bold text-color-base-content">Aún no tienes un proyecto activo</h3>
          <p className="text-color-base-content/60 text-sm">
            Cuando elijas un plan de estructuración y firmes el contrato, tu proyecto aparecerá aquí.
          </p>
        </div>
      )}

      {proyecto && proyecto.estado_actual === 'pendiente_pago' && (
        <div className="p-8 rounded-3xl border border-amber-300 bg-amber-50 text-center space-y-3">
          <h3 className="text-lg font-black text-amber-800">Esperando confirmación de pago</h3>
          <p className="text-amber-700 text-sm max-w-md mx-auto">
            Tu contrato para <strong>{proyecto.nombre_iniciativa}</strong> ya quedó firmado.
            En cuanto confirmemos tu pago, vas a poder subir aquí el documento de tu proyecto
            para arrancar la estructuración.
          </p>
        </div>
      )}

      {proyecto && proyecto.estado_actual === 'pagado' && (
        <div className="p-8 rounded-3xl border border-emerald-300 bg-emerald-50 space-y-4">
          <h3 className="text-lg font-black text-emerald-800">¡Pago confirmado! Vamos a estructurar tu proyecto</h3>
          <p className="text-emerald-700 text-sm">
            Sube el documento de tu proyecto ({proyecto.nombre_iniciativa}) para que empecemos a trabajar en tu estructuración.
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
        <PreguntasPendientesProyecto proyectoId={proyecto.id} />
      )}

      {proyecto && (
        <div className="p-8 rounded-3xl border border-color-base-content/10 bg-color-base-content/5 space-y-3">
          <h3 className="text-lg font-black text-color-base-content">Portal Réplica</h3>
          <p className="text-color-base-content/60 text-sm max-w-md">
            Tu proyecto se presenta, tal como fue estructurado, a todas las convocatorias
            identificadas. Si más adelante necesitas hacer ajustes o una nueva búsqueda,
            eso se gestiona en el Portal Réplica, una plataforma aparte con un valor de
            $1.800 USD. Ahí encontrarás todos los términos y condiciones.
          </p>
          
            href={portalReplicaWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-color-primary hover:underline"
          >
            Ir al Portal Réplica
          </a>
        </div>
      )}
    </div>
  )
}
