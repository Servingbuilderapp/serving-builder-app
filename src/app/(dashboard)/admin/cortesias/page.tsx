import React from 'react'
import { Gift } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { CortesiasClient } from '@/components/admin/CortesiasClient'
import { Ayuda } from '@/components/ui/Ayuda'
import { CUPO_POR_ORIGEN, type Cortesia } from '@/lib/cortesias'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminCortesiasPage() {
  const { data, error } = await supabaseAdmin
    .from('cortesias')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300)
  const lista = (data || []) as Cortesia[]

  const porOrigen = new Map<string, number>()
  for (const c of lista) {
    const o = (c.origen || 'Sin origen').trim()
    porOrigen.set(o, (porOrigen.get(o) || 0) + 1)
  }

  return (
    <div className="min-h-full bg-[#54142B] px-4 py-6 lg:px-6">
      <header className="mb-5">
        <h1 className="flex items-center gap-2 text-[19px] font-extrabold tracking-tight text-[#F3E7DC]">
          <Gift className="h-5 w-5 text-[#C9A46B]" />
          <Ayuda clave="equipo.cortesias" claro={false}>Cortesías</Ayuda>
        </h1>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[#F3E7DC]/60">
          Proyectos que Serving estructura sin cobrar la estructuración. Solo se cobra la comisión de éxito si el proyecto gana.
        </p>
        {error && (
          <p className="mt-2 rounded-lg bg-[#7A2B2B]/40 p-3 text-[13px] text-[#F3E7DC]">
            Falta crear la tabla en Supabase (corre el archivo supabase_migration_cortesias.sql). Detalle: {error.message}
          </p>
        )}
      </header>
      <CortesiasClient
        cortesias={lista}
        conteoPorOrigen={Array.from(porOrigen.entries()).map(([origen, n]) => ({ origen, n }))}
        cupo={CUPO_POR_ORIGEN}
      />
    </div>
  )
}
