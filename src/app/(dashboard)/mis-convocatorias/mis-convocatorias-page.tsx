import React from 'react'
import { createClient } from '@/lib/supabase/server'
import {
  ConvocatoriasCliente,
  ConvocatoriasEnBusqueda,
  ConvocatoriasSinProyecto,
  type ConvocatoriaCliente,
  type PostulacionCliente,
  type EstadoPostulacion,
} from '@/components/panel/ConvocatoriasCliente'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * "Mis convocatorias" — la pantalla del CLIENTE.
 *
 * El Motor 2 busca las oportunidades y el Motor 3 calcula el encaje, pero hasta
 * ahora el resultado solo se veía por dentro. El cliente pagaba por una
 * búsqueda cuyo resultado no podía abrir.
 *
 * Aquí ve las que quedaron seleccionadas para él, con el análisis en palabras
 * y no en jerga de tablas.
 */

type FilaConvocatoria = {
  id: string
  nombre: string | null
  entidad: string | null
  tipo: string | null
  fecha_cierre: string | null
  monto: string | null
  fuente_oficial: string | null
}

type FilaEncaje = {
  id_convocatoria: string
  resumen_convocatoria: string | null
  encaje_actual: string | null
  encaje_potencial: string | null
  semaforo: string | null
  puntaje_general: number | null
  recomendaciones: string | null
  checklist_preparacion: string[] | null
  documentacion_faltante: string | null
}

type FilaPostulacion = {
  convocatoria_nombre: string
  estado: string
  fecha_radicacion: string | null
  puntaje_total: number | null
}

/**
 * El Motor 4 guarda la postulación por nombre de convocatoria, no por su id
 * (así quedó la tabla `postulaciones`: único por proyecto + convocatoria_nombre).
 * Por eso el cruce con las candidatas del cliente se hace por nombre,
 * normalizado para no fallar por mayúsculas o espacios de más.
 */
function normalizarNombre(valor: string | null | undefined): string {
  return String(valor || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function aLista(valor: unknown): string[] {
  if (Array.isArray(valor)) return valor.map((v) => String(v)).filter(Boolean)
  if (typeof valor === 'string' && valor.trim()) {
    return valor
      .split(/\n|•|·/)
      .map((v) => v.trim())
      .filter(Boolean)
  }
  return []
}

export default async function MisConvocatoriasPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const correo = user?.email || ''

  const { data: proyecto } = await supabase
    .from('proyectos_clientes_serving')
    .select('id')
    .eq('correo_cliente', correo)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!proyecto?.id) return <ConvocatoriasSinProyecto />

  const proyectoId = String(proyecto.id)

  const { data: filas } = await supabase
    .from('convocatorias_candidatas_proyecto')
    .select('id, nombre, entidad, tipo, fecha_cierre, monto, fuente_oficial')
    .eq('id_proyecto', proyectoId)
    .eq('seleccionada', true)
    .order('lote', { ascending: false })
    .order('creado_en', { ascending: false })

  const candidatas = (filas || []) as FilaConvocatoria[]
  if (candidatas.length === 0) return <ConvocatoriasEnBusqueda />

  const { data: filasEncaje } = await supabase
    .from('encajes_convocatoria_proyecto')
    .select(
      'id_convocatoria, resumen_convocatoria, encaje_actual, encaje_potencial, semaforo, puntaje_general, recomendaciones, checklist_preparacion, documentacion_faltante'
    )
    .eq('id_proyecto', proyectoId)

  const mapaEncajes = new Map(
    ((filasEncaje || []) as FilaEncaje[]).map((e) => [String(e.id_convocatoria), e])
  )

  const { data: filasPostulacion } = await supabase
    .from('postulaciones')
    .select('convocatoria_nombre, estado, fecha_radicacion, puntaje_total')
    .eq('proyecto_id', proyectoId)

  const mapaPostulaciones = new Map(
    ((filasPostulacion || []) as FilaPostulacion[]).map((p) => [
      normalizarNombre(p.convocatoria_nombre),
      p,
    ])
  )

  const convocatorias: ConvocatoriaCliente[] = candidatas.map((c) => {
    const e = mapaEncajes.get(String(c.id))
    const p = mapaPostulaciones.get(normalizarNombre(c.nombre))

    const postulacion: PostulacionCliente = p
      ? {
          estado: p.estado as EstadoPostulacion,
          fechaRadicacion: p.fecha_radicacion || null,
          puntaje: typeof p.puntaje_total === 'number' ? p.puntaje_total : null,
        }
      : null

    return {
      id: String(c.id),
      nombre: String(c.nombre || 'Convocatoria sin nombre'),
      entidad: c.entidad || null,
      tipo: c.tipo || null,
      fechaCierre: c.fecha_cierre || null,
      monto: c.monto || null,
      fuenteOficial: c.fuente_oficial || null,
      encaje: e
        ? {
            resumen: e.resumen_convocatoria || null,
            encajeActual: e.encaje_actual || null,
            encajePotencial: e.encaje_potencial || null,
            semaforo: e.semaforo || null,
            puntaje: typeof e.puntaje_general === 'number' ? e.puntaje_general : null,
            recomendaciones: e.recomendaciones || null,
            checklist: aLista(e.checklist_preparacion),
            documentacionFaltante: e.documentacion_faltante || null,
          }
        : null,
      postulacion,
    }
  })

  return <ConvocatoriasCliente convocatorias={convocatorias} />
}
