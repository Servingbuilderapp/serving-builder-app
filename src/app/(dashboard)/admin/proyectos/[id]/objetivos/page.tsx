import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArbolObjetivosClient, type ParEspejo } from '@/components/panel/ArbolObjetivosClient'
import type { TipoObjetivo } from './actions'

export const dynamic = 'force-dynamic'

const CORREO_ADMIN = 'servingbuilderapp@gmail.com'

type FilaProblema = {
  id: string
  tipo: string
  orden: number | null
  descripcion: string | null
  created_at: string | null
}

type FilaObjetivo = {
  id: string
  problema_id: string
  tipo: string
  descripcion: string | null
}

/** A qué se convierte cada parte del árbol de problemas. */
const EQUIVALENCIA: Record<string, TipoObjetivo> = {
  CENTRAL: 'GENERAL',
  CAUSA_DIRECTA: 'ESPECIFICO_TECNICO',
  CAUSA_INDIRECTA: 'ACTIVIDAD',
  EFECTO_DIRECTO: 'FIN_DIRECTO',
  EFECTO_INDIRECTO: 'FIN_INDIRECTO',
}

const ORDEN_FILAS = [
  'EFECTO_INDIRECTO',
  'EFECTO_DIRECTO',
  'CENTRAL',
  'CAUSA_DIRECTA',
  'CAUSA_INDIRECTA',
] as const

export default async function PaginaArbolObjetivos({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  let permitido = (user.email || '').toLowerCase().trim() === CORREO_ADMIN
  if (!permitido) {
    const { data: perfil } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle<{ role: string | null }>()
    permitido = perfil?.role === 'admin'
  }
  if (!permitido) redirect('/dashboard')

  const { data: proyecto } = await supabase
    .from('proyectos_clientes_serving')
    .select('id, nombre_iniciativa, nombre_cliente, correo_cliente')
    .eq('id', id)
    .maybeSingle<{
      id: string
      nombre_iniciativa: string | null
      nombre_cliente: string | null
      correo_cliente: string | null
    }>()

  if (!proyecto?.id) redirect('/admin/proyectos')

  const [problemasRes, objetivosRes] = await Promise.all([
    supabase
      .from('problemas_proyecto')
      .select('id, tipo, orden, descripcion, created_at')
      .eq('proyecto_id', proyecto.id),
    supabase
      .from('objetivos_proyecto')
      .select('id, problema_id, tipo, descripcion')
      .eq('proyecto_id', proyecto.id),
  ])

  const problemas = (problemasRes.data || []) as FilaProblema[]
  const objetivos = (objetivosRes.data || []) as FilaObjetivo[]

  const objetivoPorProblema = new Map<string, FilaObjetivo>()
  for (const o of objetivos) objetivoPorProblema.set(o.problema_id, o)

  const pares: ParEspejo[] = []

  for (const tipoProblema of ORDEN_FILAS) {
    const delTipo = problemas
      .filter((p) => p.tipo === tipoProblema && (p.descripcion || '').trim().length > 0)
      .sort((a, b) => {
        const oa = a.orden ?? 0
        const ob = b.orden ?? 0
        if (oa !== ob) return oa - ob
        return String(a.created_at || '').localeCompare(String(b.created_at || ''))
      })

    for (const p of delTipo) {
      pares.push({
        problemaId: p.id,
        tipoProblema,
        tipoObjetivo: EQUIVALENCIA[tipoProblema],
        orden: p.orden ?? 1,
        textoProblema: p.descripcion || '',
        textoObjetivo: objetivoPorProblema.get(p.id)?.descripcion || '',
      })
    }
  }

  return (
    <ArbolObjetivosClient
      proyectoId={proyecto.id}
      nombreProyecto={proyecto.nombre_iniciativa || 'Proyecto sin nombre'}
      nombreCliente={proyecto.nombre_cliente || proyecto.correo_cliente || ''}
      pares={pares}
    />
  )
}
