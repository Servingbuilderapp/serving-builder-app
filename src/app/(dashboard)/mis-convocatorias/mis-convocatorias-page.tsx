import React from 'react'
import { resolverProyectoVisto, type ProyectoVisto } from '@/lib/proyectoVisto'
import { BannerProyectoVisto } from '@/components/panel/BannerProyectoVisto'
import { veredictoElegibilidad, type CondicionesConvocatoria } from '@/lib/elegibilidad'
import {
  ConvocatoriasCliente,
  ConvocatoriasEnBusqueda,
  ConvocatoriasSinProyecto,
  type ConvocatoriaCliente,
  type PostulacionCliente,
  type EstadoPostulacion,
} from '@/components/panel/ConvocatoriasCliente'
import { ElegirConvocatorias, type ConvocatoriaPendiente } from '@/components/panel/ElegirConvocatorias'

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
  linea_tematica?: string | null
  territorio?: string | null
  beneficiarios?: string | null
  razon_relevancia?: string | null
  biblioteca_id?: string | null
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

export default async function MisConvocatoriasPage({
  searchParams,
}: {
  searchParams?: Promise<{ proyecto?: string }>
}) {
  const params = searchParams ? await searchParams : undefined
  const vista = await resolverProyectoVisto(params?.proyecto)
  const contenido = await contenidoConvocatorias(vista)
  return (
    <>
      <BannerProyectoVisto vista={vista} />
      {contenido}
    </>
  )
}

/** Lo que ve el equipo cuando el cliente todavía no ha elegido: solo lectura, sin botones. */
function AvisoPorElegir({ cantidad }: { cantidad: number }) {
  return (
    <div className="mb-4 rounded-xl border border-[#B08D57]/40 bg-[#4C2032] p-4 text-sm text-[#F3E7DC]">
      El cliente tiene <strong>{cantidad}</strong> convocatorias encontradas por elegir. Solo él puede elegirlas.
    </div>
  )
}

async function contenidoConvocatorias(vista: ProyectoVisto) {
  // Si el equipo abrió el proyecto de un cliente, las consultas van con la llave
  // de servicio (solo lectura) para ver lo mismo que ve el cliente.
  const supabase = vista.db

  if (!vista.proyectoId) return <ConvocatoriasSinProyecto />

  const proyectoId = vista.proyectoId

  // "Parada 1" (26 sep 2026): lo que el Motor 2 encuentra ya no pasa directo
  // al encaje. Primero se le muestra al cliente para que elija cuál o cuáles
  // seguir (eleccion_cliente = null, pendiente). Solo lo que el cliente ya
  // eligió (o que el reloj de 3 días eligió por él) entra a la lista de
  // abajo con su análisis de encaje.
  const { data: filasPendientes } = await supabase
    .from('convocatorias_candidatas_proyecto')
    .select('id, nombre, entidad, tipo, fecha_cierre, monto, fuente_oficial, linea_tematica, territorio, beneficiarios, razon_relevancia')
    .eq('id_proyecto', proyectoId)
    .eq('seleccionada', true)
    .is('eleccion_cliente', null)
    .order('lote', { ascending: false })
    .order('creado_en', { ascending: false })

  const pendientes: ConvocatoriaPendiente[] = (
    (filasPendientes || []) as FilaConvocatoria[]
  ).map((c) => ({
    id: String(c.id),
    nombre: String(c.nombre || 'Convocatoria sin nombre'),
    entidad: c.entidad || null,
    tipo: c.tipo || null,
    fechaCierre: c.fecha_cierre || null,
    monto: c.monto || null,
    fuenteOficial: c.fuente_oficial || null,
    lineaTematica: c.linea_tematica || null,
    territorio: c.territorio || null,
    beneficiarios: c.beneficiarios || null,
    razon: c.razon_relevancia || null,
  }))

  const { data: filas } = await supabase
    .from('convocatorias_candidatas_proyecto')
    .select('id, nombre, entidad, tipo, fecha_cierre, monto, fuente_oficial, linea_tematica, territorio, beneficiarios, biblioteca_id')
    .eq('id_proyecto', proyectoId)
    .eq('seleccionada', true)
    .eq('eleccion_cliente', 'elegida')
    .order('lote', { ascending: false })
    .order('creado_en', { ascending: false })

  const candidatas = (filas || []) as FilaConvocatoria[]

  if (candidatas.length === 0) {
    if (pendientes.length > 0) {
      return vista.vistaEquipo ? (
        <AvisoPorElegir cantidad={pendientes.length} />
      ) : (
        <ElegirConvocatorias proyectoId={proyectoId} convocatorias={pendientes} />
      )
    }
    return <ConvocatoriasEnBusqueda />
  }

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

  // Veredicto de elegibilidad: las condiciones salen de la biblioteca de convocatorias
  // y se comparan con el perfil del proyecto. Si algo no se puede leer (por ejemplo
  // porque todavía no existen las columnas nuevas), simplemente no se muestra.
  const idsBiblioteca = candidatas.map((c) => c.biblioteca_id).filter((v): v is string => Boolean(v))
  const condicionesPor = new Map<string, CondicionesConvocatoria>()
  if (idsBiblioteca.length > 0) {
    const { data: filasBib } = await supabase
      .from('biblioteca_convocatorias')
      .select(
        'id, tipo_postulante, monto_maximo, moneda, contrapartida_exigida, contrapartida_detalle, consorcio_obligatorio, requisitos_habilitantes, madurez_financiable, verificada_en',
      )
      .in('id', idsBiblioteca)
    ;((filasBib || []) as (CondicionesConvocatoria & { id: string })[]).forEach((f) => condicionesPor.set(String(f.id), f))
  }
  const { data: perfilFila } = await supabase
    .from('proyectos_clientes_serving')
    .select('monto_solicitado_cop, respuestas_fase1_json')
    .eq('id', proyectoId)
    .maybeSingle()
  const perfil = {
    tipoSolicitante: String((perfilFila?.respuestas_fase1_json as Record<string, unknown> | null)?.q4_tipo_solicitante || '') || null,
    montoSolicitadoCop: Number(perfilFila?.monto_solicitado_cop || 0) || null,
  }

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
      lineaTematica: c.linea_tematica || null,
      territorio: c.territorio || null,
      beneficiarios: c.beneficiarios || null,
      elegibilidad:
        c.biblioteca_id && condicionesPor.has(String(c.biblioteca_id))
          ? veredictoElegibilidad(condicionesPor.get(String(c.biblioteca_id))!, perfil)
          : null,
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

  if (pendientes.length > 0) {
    return (
      <div className="px-4 pt-6 lg:px-6">
        {vista.vistaEquipo ? (
          <AvisoPorElegir cantidad={pendientes.length} />
        ) : (
          <ElegirConvocatorias proyectoId={proyectoId} convocatorias={pendientes} />
        )}
        <div className="-mx-4 lg:-mx-6">
          <ConvocatoriasCliente convocatorias={convocatorias} />
        </div>
      </div>
    )
  }

  return <ConvocatoriasCliente convocatorias={convocatorias} />
}
