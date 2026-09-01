import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CadenaValorClient, type FilaCadena } from '@/components/panel/CadenaValorClient'

export const dynamic = 'force-dynamic'

const CORREO_ADMIN = 'servingbuilderapp@gmail.com'

/** Los tres tipos que el árbol de objetivos considera "objetivo específico". */
const TIPOS_ESPECIFICOS = ['ESPECIFICO_TECNICO', 'ESPECIFICO_COMERCIAL', 'ESPECIFICO_IMPACTO']

type FilaObjetivo = {
  id: string
  problema_id: string
  tipo: string
  descripcion: string | null
  created_at: string | null
}

type FilaProblema = {
  id: string
  tipo: string
  orden: number | null
  padre_id: string | null
}

type FilaCadenaBD = {
  id: string
  objetivo_especifico_id: string
  producto_mga: string | null
  unidad_medida: string | null
  meta: number | string | null
  responsable: string | null
  duracion_meses: number | null
  ruta_critica: boolean | null
  tareas_json: unknown
}

/** tareas_json puede venir con formas distintas según qué motor la escribió. */
function aListaDeTextos(valor: unknown): string[] {
  if (Array.isArray(valor)) {
    return valor.map((v) => (typeof v === 'string' ? v : '')).filter((v) => v.length > 0)
  }
  if (typeof valor === 'string') {
    try {
      const parseado = JSON.parse(valor)
      if (Array.isArray(parseado)) {
        return parseado.map((v) => (typeof v === 'string' ? v : '')).filter((v) => v.length > 0)
      }
    } catch {
      return valor.trim() ? [valor.trim()] : []
    }
  }
  return []
}

export default async function PaginaCadenaValor({
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

  const [objetivosRes, problemasRes] = await Promise.all([
    supabase
      .from('objetivos_proyecto')
      .select('id, problema_id, tipo, descripcion, created_at')
      .eq('proyecto_id', proyecto.id),
    supabase
      .from('problemas_proyecto')
      .select('id, tipo, orden, padre_id')
      .eq('proyecto_id', proyecto.id),
  ])

  const objetivos = (objetivosRes.data || []) as FilaObjetivo[]
  const problemas = (problemasRes.data || []) as FilaProblema[]

  const problemaPorId = new Map<string, FilaProblema>()
  for (const p of problemas) problemaPorId.set(p.id, p)

  const general = objetivos.find((o) => o.tipo === 'GENERAL')

  const especificos = objetivos
    .filter(
      (o) => TIPOS_ESPECIFICOS.includes(o.tipo) && (o.descripcion || '').trim().length > 0,
    )
    .sort((a, b) => {
      const oa = problemaPorId.get(a.problema_id)?.orden ?? 0
      const ob = problemaPorId.get(b.problema_id)?.orden ?? 0
      if (oa !== ob) return oa - ob
      return String(a.created_at || '').localeCompare(String(b.created_at || ''))
    })

  // Las actividades del árbol de objetivos cuelgan de una causa indirecta,
  // y esa causa indirecta cuelga de la causa directa que es este objetivo
  // específico. Con eso se sabe qué actividad sugerirle a cada fila.
  const actividadesPorObjetivo = new Map<string, string[]>()
  for (const o of objetivos) {
    if (o.tipo !== 'ACTIVIDAD') continue
    const texto = (o.descripcion || '').trim()
    if (!texto) continue

    const problemaDeLaActividad = problemaPorId.get(o.problema_id)
    const idCausaDirecta = problemaDeLaActividad?.padre_id
    if (!idCausaDirecta) continue

    const objetivoPadre = especificos.find((e) => e.problema_id === idCausaDirecta)
    if (!objetivoPadre) continue

    const previas = actividadesPorObjetivo.get(objetivoPadre.id) || []
    actividadesPorObjetivo.set(objetivoPadre.id, [...previas, texto])
  }

  const idsEspecificos = especificos.map((e) => e.id)
  let guardadas: FilaCadenaBD[] = []

  if (idsEspecificos.length > 0) {
    const { data } = await supabase
      .from('cadena_valor_actividades')
      .select(
        'id, objetivo_especifico_id, producto_mga, unidad_medida, meta, responsable, duracion_meses, ruta_critica, tareas_json',
      )
      .in('objetivo_especifico_id', idsEspecificos)
    guardadas = (data || []) as FilaCadenaBD[]
  }

  const guardadaPorObjetivo = new Map<string, FilaCadenaBD>()
  for (const g of guardadas) guardadaPorObjetivo.set(g.objetivo_especifico_id, g)

  const filas: FilaCadena[] = especificos.map((o, indice) => {
    const g = guardadaPorObjetivo.get(o.id)
    return {
      objetivoId: o.id,
      numero: indice + 1,
      objetivoTexto: (o.descripcion || '').trim(),
      sugerencias: actividadesPorObjetivo.get(o.id) || [],
      producto: g?.producto_mga || '',
      unidadMedida: g?.unidad_medida || '',
      meta: g?.meta === null || g?.meta === undefined ? '' : String(g.meta),
      responsable: g?.responsable || '',
      duracionMeses:
        g?.duracion_meses === null || g?.duracion_meses === undefined
          ? ''
          : String(g.duracion_meses),
      rutaCritica: Boolean(g?.ruta_critica),
      actividades: aListaDeTextos(g?.tareas_json),
    }
  })

  return (
    <CadenaValorClient
      proyectoId={proyecto.id}
      nombreProyecto={proyecto.nombre_iniciativa || 'Proyecto sin nombre'}
      nombreCliente={proyecto.nombre_cliente || proyecto.correo_cliente || ''}
      objetivoGeneral={(general?.descripcion || '').trim()}
      filas={filas}
    />
  )
}
