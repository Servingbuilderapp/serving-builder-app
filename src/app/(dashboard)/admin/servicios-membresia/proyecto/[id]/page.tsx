import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { TODOS_LOS_PASOS, porcentajeProyecto, type RespuestasProyecto } from '@/lib/miProyectoPasos'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/** El equipo lee el proyecto completo que armó el miembro, para poder postularlo. */
export default async function ProyectoMiembroAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const s = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: p } = await s
    .from('membresias_proyectos')
    .select('id, nombre, correo_cliente, estado, respuestas')
    .eq('id', id)
    .maybeSingle<{ id: string; nombre: string; correo_cliente: string; estado: string; respuestas: RespuestasProyecto }>()
  if (!p) notFound()
  const r = p.respuestas || {}

  return (
    <div className="min-h-full bg-[#54142B] px-4 py-6 lg:px-6">
      <Link href="/admin/servicios-membresia" className="text-[12.5px] font-bold text-[#C9A46B] underline">← Servicios de membresía</Link>
      <h1 className="mt-2 text-[19px] font-extrabold tracking-tight text-[#F3E7DC]">{r.titulo_elegido?.trim() || p.nombre}</h1>
      <p className="mb-5 text-[13px] text-[#F3E7DC]/55">
        {p.correo_cliente} · {p.estado === 'terminado' ? 'Terminado' : `En proceso (${porcentajeProyecto(r)} %)`}
      </p>
      <div className="space-y-4 rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-5 text-[13.5px] text-[#F3E7DC]/85">
        {TODOS_LOS_PASOS.map((paso) => (
          <div key={paso.n}>
            <h2 className="font-extrabold text-[#E0B868]">Paso {paso.n}. {paso.titulo}</h2>
            {paso.campos.filter((c) => c.tipo !== 'check').map((c) => (
              <div key={c.id} className="mt-1">
                <p className="text-[12px] font-bold text-[#F3E7DC]/55">{c.etiqueta}</p>
                <p className="whitespace-pre-wrap">{r[c.id]?.trim() || <span className="text-[#F3E7DC]/35">Sin completar</span>}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
