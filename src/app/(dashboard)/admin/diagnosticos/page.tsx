import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { esEquipoServing } from '@/lib/guardiaEquipo'

export const dynamic = 'force-dynamic'

interface FilaDiagnostico {
  id: string
  created_at?: string | null
  nombre?: string | null
  empresa?: string | null
  email?: string | null
  whatsapp?: string | null
  tipo_proyecto?: string | null
  score_preparacion_convocatorias?: number | null
  plan_recomendado?: string | null
  resultado_completo?: unknown
}

/** Diagnósticos gratuitos: quién lo hizo y qué le salió. Solo el equipo de Serving. */
export default async function AdminDiagnosticosPage() {
  if (!(await esEquipoServing())) redirect('/dashboard')

  const { data, error } = await supabaseAdmin.from('diagnosticos').select('*').limit(1000)

  const filas = ((data || []) as FilaDiagnostico[]).sort((a, b) =>
    String(b.created_at || '').localeCompare(String(a.created_at || '')),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-color-base-content">Diagnósticos</h1>
        <p className="text-sm text-color-base-content/70 mt-1">
          Cada persona que hizo el diagnóstico gratuito, con su puntaje. Abre uno para ver el resultado completo.
        </p>
      </div>

      {error && (
        <p className="text-sm font-bold text-red-600">No se pudo cargar la lista: {error.message}</p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-color-base-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-color-base-200/60 text-left text-[11px] uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Quién</th>
              <th className="px-4 py-3">Correo / WhatsApp</th>
              <th className="px-4 py-3">Proyecto</th>
              <th className="px-4 py-3">Puntaje</th>
              <th className="px-4 py-3">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {filas.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-color-base-content/60">
                  Todavía no hay diagnósticos.
                </td>
              </tr>
            )}
            {filas.map((f) => (
              <tr key={f.id} className="border-t border-color-base-200 align-top">
                <td className="px-4 py-3 whitespace-nowrap">
                  {f.created_at ? new Date(f.created_at).toLocaleDateString('es-CO') : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="font-bold">{f.nombre || '—'}</div>
                  <div className="text-xs text-color-base-content/60">{f.empresa || ''}</div>
                </td>
                <td className="px-4 py-3 text-xs">
                  <div>{f.email || '—'}</div>
                  <div className="text-color-base-content/60">{f.whatsapp || ''}</div>
                </td>
                <td className="px-4 py-3">{f.tipo_proyecto || '—'}</td>
                <td className="px-4 py-3 font-black text-color-primary">
                  {f.score_preparacion_convocatorias ?? '—'}
                  {f.score_preparacion_convocatorias != null ? '%' : ''}
                </td>
                <td className="px-4 py-3">
                  {f.resultado_completo ? (
                    <Link href={`/admin/diagnosticos/${f.id}`} className="text-xs font-black uppercase text-color-primary hover:underline">
                      Ver completo
                    </Link>
                  ) : (
                    <span className="text-xs text-color-base-content/50">No guardado (anterior)</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
