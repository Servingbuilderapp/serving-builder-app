import React from 'react'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { esEquipoServing } from '@/lib/guardiaEquipo'
import { ResultadoDiagnosticoVista } from '@/components/diagnostico/ResultadoDiagnosticoVista'
import type { DiagnosticoResultadoV2 } from '@/app/api/diagnostico-v2/route'

export const dynamic = 'force-dynamic'

/** Un diagnóstico completo: datos de quien lo hizo, lo que escribió y lo que le salió. */
export default async function AdminDiagnosticoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  if (!(await esEquipoServing())) redirect('/dashboard')

  const { id } = await params
  const { data } = await supabaseAdmin.from('diagnosticos').select('*').eq('id', id).maybeSingle()
  if (!data) notFound()

  const resultado = data.resultado_completo as DiagnosticoResultadoV2 | null
  const f = (data.datos_formulario || {}) as Record<string, string>
  const origen = process.env.NEXT_PUBLIC_SITE_URL || ''
  const enlace = data.codigo_acceso ? `${origen}/diagnostico/resultado/${data.codigo_acceso}` : ''

  const campos: [string, string | undefined][] = [
    ['Representante', data.nombre],
    ['Empresa / organización', data.empresa],
    ['Correo', data.email],
    ['WhatsApp', data.whatsapp],
    ['Ciudad / país', f.ciudadPais],
    ['Proyecto', data.tipo_proyecto],
    ['Beneficiarios', f.beneficiarios],
    ['Ubicación del proyecto', f.ubicacionProyecto],
    ['Problema', f.problema],
    ['Solución', f.solucion],
    ['Objetivo general', f.objetivoGeneral],
    ['Presupuesto', data.monto_objetivo],
    ['Tiempo de ejecución', f.tiempoEjecucion],
    ['Resultados esperados', f.resultadosEsperados],
    ['Sostenibilidad', f.modeloSostenibilidad],
    ['Escalabilidad', f.estrategiaEscalabilidad],
  ]

  return (
    <div className="space-y-8">
      <Link href="/admin/diagnosticos" className="text-xs font-black uppercase tracking-widest text-color-primary hover:underline">
        ← Volver a diagnósticos
      </Link>

      <section className="rounded-2xl border border-color-base-200 bg-white p-6 space-y-3">
        <h2 className="text-sm font-black uppercase tracking-wider">Quién lo hizo y qué escribió</h2>
        <dl className="grid md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          {campos
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <dt className="text-[11px] font-black uppercase text-color-base-content/60">{k}</dt>
                <dd className="whitespace-pre-line">{v}</dd>
              </div>
            ))}
        </dl>
        {data.codigo_acceso && (
          <p className="text-xs text-color-base-content/70 pt-2 break-all">
            Enlace del cliente (para enviárselo, abre con su correo): {enlace || `/diagnostico/resultado/${data.codigo_acceso}`}
          </p>
        )}
      </section>

      {resultado ? (
        <ResultadoDiagnosticoVista
          resultado={resultado}
          nombreProyecto={data.tipo_proyecto || ''}
          mostrarCierre={false}
        />
      ) : (
        <p className="text-sm text-color-base-content/70">
          Este diagnóstico es anterior: solo se guardaron los datos de contacto y el puntaje.
        </p>
      )}
    </div>
  )
}
