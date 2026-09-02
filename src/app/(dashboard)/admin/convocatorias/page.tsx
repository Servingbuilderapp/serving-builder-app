import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ConvocatoriasClient } from '@/components/admin/ConvocatoriasClient'

export const dynamic = 'force-dynamic'

/**
 * LA BIBLIOTECA DE CONVOCATORIAS — pantalla del equipo.
 *
 * Es la puerta de radar: aquí se busca con los filtros de la anatomía, se
 * cargan a mano las convocatorias que llegan por fuera del motor (boletines,
 * redes, un aliado) y se guardan los términos de referencia.
 */
export default async function AdminConvocatoriasPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const correo = (user.email || '').toLowerCase().trim()
  let esEquipo = correo === 'servingbuilderapp@gmail.com'

  if (!esEquipo) {
    const { data: perfil } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle<{ role: string | null }>()
    esEquipo = perfil?.role === 'admin'
  }

  if (!esEquipo) redirect('/dashboard')

  const { data: convocatorias, error } = await supabase
    .from('biblioteca_convocatorias')
    .select(
      'id, nombre, entidad, tipo_financiador, ambito, pais, paises_elegibles, tipo_postulante, ' +
        'sector, objetivo, monto, monto_maximo, moneda, contrapartida_exigida, ' +
        'fecha_cierre, fecha_cierre_texto, fecha_apertura, abierta_todo_el_anio, ' +
        'mes_apertura_tipico, periodicidad, enlace_aplicacion, fuente_oficial, ' +
        'linea_tematica, territorio, origen_ficha, actualizado_en',
    )
    .order('fecha_cierre', { ascending: true, nullsFirst: false })
    .limit(1000)

  // Cuántos documentos tiene cada convocatoria: es lo que dice si ya se puede
  // encajar contra ella o si todavía es solo un resumen.
  const { data: documentos } = await supabase
    .from('convocatoria_documentos')
    .select('convocatoria_id')

  const conteoDocumentos: Record<string, number> = {}
  ;(documentos || []).forEach((d: { convocatoria_id: string }) => {
    conteoDocumentos[d.convocatoria_id] = (conteoDocumentos[d.convocatoria_id] || 0) + 1
  })

  return (
    <ConvocatoriasClient
      convocatorias={convocatorias || []}
      conteoDocumentos={conteoDocumentos}
      errorCarga={error?.message || null}
      correoEquipo={correo}
    />
  )
}
