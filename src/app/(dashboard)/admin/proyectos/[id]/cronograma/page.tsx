import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CronogramaClient, type BarraVista } from '@/components/panel/CronogramaClient'

export const dynamic = 'force-dynamic'

const CORREO_ADMIN = 'servingbuilderapp@gmail.com'

const TIPOS_ESPECIFICOS = ['ESPECIFICO_TECNICO', 'ESPECIFICO_COMERCIAL', 'ESPECIFICO_IMPACTO']

type FilaObjetivo = {
  id: string
  problema_id: string
  tipo: string
  descripcion: string | null
  created_at: string | null
}

type FilaCadena = {
  id: string
  objetivo_especifico_id: string
  tareas_json: unknown
  duracion_meses: number | null
  ruta_critica: boolean | null
}

type FilaCronograma = {
  cadena_valor_id: string
  actividad_indice: number | null
  mes_inicio: number | null
  mes_fin: number | null
  entregable: string | null
}

/** tareas_json puede venir con formas distintas según qué motor la escribió. */
function aListaDeTextos(valor: unknown): string[] {
  if (Array.isArray(valor)) return valor.map((v) => (typeof v === 'string' ? v : ''))
  if (typeof valor === 'string') {
    try {
      const parseado = JSON.parse(valor)
      if (Array.isArray(parseado)) return parseado.map((v) => (typeof v === 'string' ? v : ''))
    } catch {
      return valor.trim() ? [valor.trim()] : []
    }
  }
  return []
}

export default async function PaginaCronograma({
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

  const [objetivosRes, problemasRes, cronoProyectoRes] = await Promise.all([
    supabase
      .from('objetivos_proyecto')
      .select('id, problema_id, tipo, descripcion, created_at')
      .eq('proyecto_id', proyecto.id),
    supabase.from('problemas_proyecto').select('id, orden').eq('proyecto_id', proyecto.id),
    supabase
      .from('cronograma_proyecto')
      .select('duracion_total_meses, fecha_inicio, notas')
      .eq('proyecto_id', proyecto.id)
      .maybeSingle<{
        duracion_total_meses: number | null
        fecha_inicio: string | null
        notas: string | null
      }>(),
  ])

  const objetivos = (objetivosRes.data || []) as FilaObjetivo[]
  const ordenPorProblema = new Map<string, number>()
  for (const p of (problemasRes.data || []) as { id: string; orden: number | null }[]) {
    ordenPorProblema.set(p.id, p.orden ?? 0)
  }

  const especificos = objetivos
    .filter((o) => TIPOS_ESPECIFICOS.includes(o.tipo) && (o.descripcion || '').trim().length > 0)
    .sort((a, b) => {
      const oa = ordenPorProblema.get(a.problema_id) ?? 0
      const ob = ordenPorProblema.get(b.problema_id) ?? 0
      if (oa !== ob) return oa - ob
      return String(a.created_at || '').localeCompare(String(b.created_at || ''))
    })

  const idsEspecificos = especificos.map((e) => e.id)

  let cadena: FilaCadena[] = []
  if (idsEspecificos.length > 0) {
    const { data } = await supabase
      .from('cadena_valor_actividades')
      .select('id, objetivo_especifico_id, tareas_json, duracion_meses, ruta_critica')
      .in('objetivo_especifico_id', idsEspecificos)
    cadena = (data || []) as FilaCadena[]
  }

  const cadenaPorObjetivo = new Map<string, FilaCadena>()
  for (const c of cadena) cadenaPorObjetivo.set(c.objetivo_especifico_id, c)

  let guardadas: FilaCronograma[] = []
  if (cadena.length > 0) {
    const { data } = await supabase
      .from('cronograma_actividades')
      .select('cadena_valor_id, actividad_indice, mes_inicio, mes_fin, entregable')
      .eq('proyecto_id', proyecto.id)
    guardadas = (data || []) as FilaCronograma[]
  }

  const guardadaPorClave = new Map<string, FilaCronograma>()
  for (const g of guardadas) {
    guardadaPorClave.set(`${g.cadena_valor_id}:${g.actividad_indice ?? 0}`, g)
  }

  const duracionTotal = Math.max(1, cronoProyectoRes.data?.duracion_total_meses || 12)

  const barras: BarraVista[] = []
  especificos.forEach((objetivo, indiceObjetivo) => {
    const fila = cadenaPorObjetivo.get(objetivo.id)
    if (!fila) return

    // Cuánto dijo la cadena de valor que dura este objetivo: sirve para
    // proponer el tramo de las actividades que todavía no se han ubicado.
    const duracionObjetivo = Math.max(1, Math.min(duracionTotal, fila.duracion_meses || duracionTotal))

    aListaDeTextos(fila.tareas_json).forEach((texto, indice) => {
      const limpio = texto.trim()
      if (!limpio) return

      const clave = `${fila.id}:${indice}`
      const g = guardadaPorClave.get(clave)

      // Administrar y supervisar (las dos últimas) acompañan todo el
      // proyecto; las demás arrancan dentro del tramo del objetivo.
      const esTransversal = indice >= 4
      const inicioPropuesto = 1
      const finPropuesto = esTransversal ? duracionTotal : duracionObjetivo

      barras.push({
        cadenaValorId: fila.id,
        actividadIndice: indice,
        clave,
        objetivoNumero: indiceObjetivo + 1,
        objetivoTexto: (objetivo.descripcion || '').trim(),
        duracionObjetivo,
        rutaCritica: Boolean(fila.ruta_critica),
        actividadNumero: indice + 1,
        actividadTexto: limpio,
        transversal: esTransversal,
        mesInicio: g?.mes_inicio ?? inicioPropuesto,
        mesFin: g?.mes_fin ?? finPropuesto,
        entregable: g?.entregable || '',
        yaGuardada: Boolean(g),
      })
    })
  })

  return (
    <CronogramaClient
      proyectoId={proyecto.id}
      nombreProyecto={proyecto.nombre_iniciativa || 'Proyecto sin nombre'}
      nombreCliente={proyecto.nombre_cliente || proyecto.correo_cliente || ''}
      duracionTotalMeses={String(duracionTotal)}
      fechaInicio={cronoProyectoRes.data?.fecha_inicio || ''}
      notas={cronoProyectoRes.data?.notas || ''}
      barras={barras}
    />
  )
}
