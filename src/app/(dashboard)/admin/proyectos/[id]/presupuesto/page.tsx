import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  PresupuestoClient,
  type ActividadOpcion,
  type ItemVista,
  type ReglasVista,
} from '@/components/panel/PresupuestoClient'

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

type FilaProblema = { id: string; orden: number | null }

type FilaCadena = {
  id: string
  objetivo_especifico_id: string
  tareas_json: unknown
}

type FilaItem = {
  id: string
  cadena_valor_id: string
  actividad_indice: number | null
  rubro: string
  descripcion: string | null
  especificaciones: string | null
  justificacion: string | null
  unidad: string | null
  cantidad: number | string | null
  valor_unitario: number | string | null
  fuente: string | null
  orden: number | null
}

type FilaReglas = {
  moneda: string | null
  monto_maximo: number | string | null
  contrapartida_minima_pct: number | string | null
  imprevistos_pct: number | string | null
  rubros_no_financiables: string | null
  notas: string | null
}

/** tareas_json puede venir con formas distintas según qué motor la escribió. */
function aListaDeTextos(valor: unknown): string[] {
  if (Array.isArray(valor)) {
    return valor.map((v) => (typeof v === 'string' ? v : ''))
  }
  if (typeof valor === 'string') {
    try {
      const parseado = JSON.parse(valor)
      if (Array.isArray(parseado)) {
        return parseado.map((v) => (typeof v === 'string' ? v : ''))
      }
    } catch {
      return valor.trim() ? [valor.trim()] : []
    }
  }
  return []
}

const aTexto = (valor: number | string | null | undefined): string =>
  valor === null || valor === undefined ? '' : String(valor)

export default async function PaginaPresupuesto({
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

  const [objetivosRes, problemasRes, reglasRes] = await Promise.all([
    supabase
      .from('objetivos_proyecto')
      .select('id, problema_id, tipo, descripcion, created_at')
      .eq('proyecto_id', proyecto.id),
    supabase.from('problemas_proyecto').select('id, orden').eq('proyecto_id', proyecto.id),
    supabase
      .from('presupuesto_proyecto')
      .select(
        'moneda, monto_maximo, contrapartida_minima_pct, imprevistos_pct, rubros_no_financiables, notas',
      )
      .eq('proyecto_id', proyecto.id)
      .maybeSingle<FilaReglas>(),
  ])

  const objetivos = (objetivosRes.data || []) as FilaObjetivo[]
  const problemas = (problemasRes.data || []) as FilaProblema[]

  const ordenPorProblema = new Map<string, number>()
  for (const p of problemas) ordenPorProblema.set(p.id, p.orden ?? 0)

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
      .select('id, objetivo_especifico_id, tareas_json')
      .in('objetivo_especifico_id', idsEspecificos)
    cadena = (data || []) as FilaCadena[]
  }

  const cadenaPorObjetivo = new Map<string, FilaCadena>()
  for (const c of cadena) cadenaPorObjetivo.set(c.objetivo_especifico_id, c)

  // Cada actividad de la cadena de valor es una opción a la que colgarle
  // ítems de gasto.
  const actividades: ActividadOpcion[] = []
  especificos.forEach((objetivo, indiceObjetivo) => {
    const fila = cadenaPorObjetivo.get(objetivo.id)
    if (!fila) return
    aListaDeTextos(fila.tareas_json).forEach((texto, indice) => {
      const limpio = texto.trim()
      if (!limpio) return
      actividades.push({
        cadenaValorId: fila.id,
        actividadIndice: indice,
        clave: `${fila.id}:${indice}`,
        objetivoNumero: indiceObjetivo + 1,
        objetivoTexto: (objetivo.descripcion || '').trim(),
        actividadNumero: indice + 1,
        actividadTexto: limpio,
      })
    })
  })

  let items: ItemVista[] = []
  if (actividades.length > 0) {
    const { data } = await supabase
      .from('presupuesto_items')
      .select(
        'id, cadena_valor_id, actividad_indice, rubro, descripcion, especificaciones, justificacion, unidad, cantidad, valor_unitario, fuente, orden',
      )
      .eq('proyecto_id', proyecto.id)

    const clavesValidas = new Set(actividades.map((a) => a.clave))

    items = ((data || []) as FilaItem[])
      .map((f) => ({
        id: f.id,
        cadenaValorId: f.cadena_valor_id,
        actividadIndice: f.actividad_indice ?? 0,
        clave: `${f.cadena_valor_id}:${f.actividad_indice ?? 0}`,
        rubro: f.rubro || 'OTROS',
        descripcion: f.descripcion || '',
        especificaciones: f.especificaciones || '',
        justificacion: f.justificacion || '',
        unidad: f.unidad || 'unidad',
        cantidad: aTexto(f.cantidad),
        valorUnitario: aTexto(f.valor_unitario),
        fuente: f.fuente || 'SOLICITADO',
        orden: f.orden ?? 1,
      }))
      // Un ítem cuya actividad ya no existe (la borraron de la cadena) se
      // deja fuera en vez de mostrarlo colgando de la nada.
      .filter((i) => clavesValidas.has(i.clave))
      .sort((a, b) => a.orden - b.orden)
  }

  const reglasBD = reglasRes.data
  const reglas: ReglasVista = {
    moneda: reglasBD?.moneda || 'COP',
    montoMaximo: aTexto(reglasBD?.monto_maximo),
    contrapartidaMinimaPct: aTexto(reglasBD?.contrapartida_minima_pct) || '0',
    imprevistosPct: aTexto(reglasBD?.imprevistos_pct) || '5',
    rubrosNoFinanciables: reglasBD?.rubros_no_financiables || '',
    notas: reglasBD?.notas || '',
  }

  return (
    <PresupuestoClient
      proyectoId={proyecto.id}
      nombreProyecto={proyecto.nombre_iniciativa || 'Proyecto sin nombre'}
      nombreCliente={proyecto.nombre_cliente || proyecto.correo_cliente || ''}
      actividades={actividades}
      items={items}
      reglas={reglas}
    />
  )
}
