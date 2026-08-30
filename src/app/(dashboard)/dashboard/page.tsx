import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ResumenProyecto, type DatosResumen, type EstadoSemaforo, type EstadoEtapa } from '@/components/panel/ResumenProyecto'

export const dynamic = 'force-dynamic'

/* ========================================================================== */
/* Ayudas de lectura tolerante                                                */
/* Los motores de IA guardan JSON con formas que pueden variar, así que aquí   */
/* se leen con cuidado: si algo no viene como se espera, se ignora en vez de   */
/* romper la pantalla.                                                        */
/* ========================================================================== */

function aNumero(valor: unknown): number | null {
  if (typeof valor === 'number' && Number.isFinite(valor)) return Math.round(valor)
  if (typeof valor === 'string') {
    const n = parseFloat(valor.replace('%', '').trim())
    if (Number.isFinite(n)) return Math.round(n)
  }
  return null
}

function aFecha(valor: unknown): Date | null {
  if (typeof valor !== 'string' || !valor.trim()) return null
  const d = new Date(valor)
  return Number.isNaN(d.getTime()) ? null : d
}

function formatoFecha(d: Date | null): string | null {
  if (!d) return null
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function diasHasta(d: Date | null): number | null {
  if (!d) return null
  const ms = d.getTime() - Date.now()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

function aSemaforo(valor: unknown): EstadoSemaforo {
  const t = String(valor || '').toLowerCase()
  if (t.includes('verde') || t === 'green' || t === 'ok') return 'verde'
  if (t.includes('amarillo') || t.includes('naranja') || t === 'yellow') return 'amarillo'
  if (t.includes('rojo') || t === 'red') return 'rojo'
  return 'gris'
}

function hace(desde: Date | null): string {
  if (!desde) return ''
  const minutos = Math.floor((Date.now() - desde.getTime()) / 60000)
  if (minutos < 60) return `Hace ${Math.max(1, minutos)} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `Hace ${horas} h`
  const dias = Math.floor(horas / 24)
  return dias === 1 ? 'Hace 1 día' : `Hace ${dias} días`
}

/* ========================================================================== */

export default async function PaginaResumen() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: proyecto } = await supabase
    .from('proyectos_clientes_serving')
    .select('*')
    .eq('correo_cliente', user.email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const vacio: DatosResumen = {
    proyecto: null,
    progresoGeneral: 0,
    pasos: { total: 0, completados: 0 },
    pasoActual: null,
    convocatoria: null,
    documentos: null,
    encaje: null,
    proximoPaso: null,
    semaforos: [],
    ruta: [],
    recomendacionIA: null,
    progresoAreas: [],
    ejesRueda: [],
    convocatoriasTop: [],
    alertas: [],
    actividades: [],
    pendientes: [],
  }

  if (!proyecto) {
    return <ResumenProyecto datos={vacio} />
  }

  /* ---------- consultas en paralelo ---------- */
  const [pasosRes, avanceRes, candidatasRes, encajesRes, preguntasRes] = await Promise.all([
    supabase.from('pasos_estructuracion').select('id, nombre_paso, orden_secuencia').order('orden_secuencia', { ascending: true }),
    supabase.from('avance_estructuracion_proyecto').select('paso_id, completado').eq('proyecto_id', proyecto.id),
    supabase.from('convocatorias_candidatas_proyecto').select('*').eq('id_proyecto', proyecto.id).order('creado_en', { ascending: false }),
    supabase.from('encajes_convocatoria_proyecto').select('*').eq('id_proyecto', proyecto.id),
    supabase.from('preguntas_pendientes_proyecto').select('*').eq('id_proyecto', proyecto.id).eq('respondida', false),
  ])

  const pasos = pasosRes.data || []
  const avance = avanceRes.data || []
  const candidatas = candidatasRes.data || []
  const encajes = encajesRes.data || []
  const preguntas = preguntasRes.data || []

  /* ---------- estructuración ---------- */
  const completados = new Set(avance.filter((a) => a.completado).map((a) => a.paso_id))
  const totalPasos = pasos.length
  const numCompletados = pasos.filter((p) => completados.has(p.id)).length
  const porcentajeEstructuracion = totalPasos ? Math.round((numCompletados / totalPasos) * 100) : 0

  const primerPendiente = pasos.find((p) => !completados.has(p.id)) || null
  const pasoActual = primerPendiente
    ? { orden: Number(primerPendiente.orden_secuencia) || 0, nombre: String(primerPendiente.nombre_paso || '') }
    : null

  /* ---------- convocatorias ---------- */
  const seleccionadas = candidatas.filter((c) => c.seleccionada)
  const activa = seleccionadas[0] || null
  const fechaCierreActiva = aFecha(activa?.fecha_cierre)

  const convocatoriasTop = seleccionadas.slice(0, 3).map((c) => {
    const f = aFecha(c.fecha_cierre)
    const enc = encajes.find((e) => e.id_convocatoria === c.id)
    const sem: EstadoSemaforo[] = []
    if (enc?.semaforo && typeof enc.semaforo === 'object') {
      const s = enc.semaforo as Record<string, unknown>
      if (s.tiempo) sem.push(aSemaforo(s.tiempo))
      if (s.documentos) sem.push(aSemaforo(s.documentos))
    }
    const dias = diasHasta(f)
    return {
      nombre: String(c.nombre || 'Convocatoria sin nombre'),
      entidad: c.entidad ? String(c.entidad) : null,
      afinidad: aNumero(enc?.encaje_actual ?? c.encaje),
      cierre: formatoFecha(f),
      dias,
      estado: dias === null ? 'Sin fecha' : dias > 0 ? 'Abierta' : 'Cerrada',
      semaforos: sem,
    }
  })

  /* ---------- encaje ---------- */
  const encajeActivo = activa ? encajes.find((e) => e.id_convocatoria === activa.id) || null : encajes[0] || null
  const encajeActual = aNumero(encajeActivo?.encaje_actual)
  const encajePotencial = aNumero(encajeActivo?.encaje_potencial)

  /* ---------- documentos ---------- */
  let documentos: { completos: number; total: number } | null = null
  const checklist = encajeActivo?.checklist_preparacion
  if (Array.isArray(checklist) && checklist.length) {
    const listos = checklist.filter((d: unknown) => {
      const item = d as Record<string, unknown>
      const estado = String(item?.estado || item?.status || '').toLowerCase()
      return estado.includes('complet') || estado.includes('listo') || item?.completo === true
    }).length
    documentos = { completos: listos, total: checklist.length }
  }

  /* ---------- semáforos ---------- */
  const semaforos: { etiqueta: string; estado: EstadoSemaforo }[] = []
  const semObj = (encajeActivo?.semaforo || {}) as Record<string, unknown>
  semaforos.push({
    etiqueta: 'Tiempo',
    estado: semObj.tiempo
      ? aSemaforo(semObj.tiempo)
      : (() => {
          const d = diasHasta(fechaCierreActiva)
          if (d === null) return 'gris'
          if (d > 30) return 'verde'
          if (d > 10) return 'amarillo'
          return 'rojo'
        })(),
  })
  semaforos.push({
    etiqueta: 'Documentos',
    estado: semObj.documentos
      ? aSemaforo(semObj.documentos)
      : documentos
        ? documentos.completos === documentos.total
          ? 'verde'
          : documentos.completos / Math.max(1, documentos.total) > 0.6
            ? 'amarillo'
            : 'rojo'
        : 'gris',
  })

  /* ---------- ruta ---------- */
  const hayConvocatorias = candidatas.length > 0
  const haySeleccion = seleccionadas.length > 0
  const hayEncaje = Boolean(encajeActivo)
  const estructuracionLista = porcentajeEstructuracion >= 100

  const definirEstado = (completo: boolean, activo: boolean): EstadoEtapa =>
    completo ? 'completado' : activo ? 'en_proceso' : 'pendiente'

  const ruta: { nombre: string; estado: EstadoEtapa }[] = [
    { nombre: 'Mi proyecto', estado: 'completado' },
    { nombre: 'Estructuración', estado: definirEstado(estructuracionLista, porcentajeEstructuracion > 0) },
    { nombre: 'Búsqueda', estado: definirEstado(hayConvocatorias, estructuracionLista) },
    { nombre: 'Convocatoria', estado: definirEstado(haySeleccion, hayConvocatorias) },
    { nombre: 'Encaje', estado: definirEstado(hayEncaje, haySeleccion) },
    { nombre: 'Adaptación', estado: definirEstado(false, hayEncaje) },
    { nombre: 'Documentos', estado: definirEstado(Boolean(documentos && documentos.completos === documentos.total), Boolean(documentos)) },
    { nombre: 'Postulación', estado: 'pendiente' },
    { nombre: 'Seguimiento', estado: 'pendiente' },
  ]

  /* ---------- progreso por áreas ---------- */
  const progresoAreas = [
    { nombre: 'Estructuración', valor: porcentajeEstructuracion },
    { nombre: 'Búsqueda de convocatorias', valor: hayConvocatorias ? 100 : 0 },
    { nombre: 'Encaje', valor: encajeActual ?? 0 },
    { nombre: 'Adaptación', valor: encajePotencial && encajeActual ? Math.max(0, encajePotencial - encajeActual) : 0 },
    {
      nombre: 'Documentos',
      valor: documentos ? Math.round((documentos.completos / Math.max(1, documentos.total)) * 100) : 0,
    },
    { nombre: 'Postulación', valor: 0 },
    { nombre: 'Seguimiento', valor: 0 },
  ]

  /* ---------- rueda ---------- */
  const ejesRueda: { nombre: string; puntaje: number }[] = []
  const detalle = encajeActivo?.puntaje_detalle
  if (Array.isArray(detalle)) {
    for (const d of detalle) {
      const item = d as Record<string, unknown>
      const nombre = String(item?.dimension || item?.nombre || item?.eje || '')
      const puntaje = aNumero(item?.puntaje ?? item?.score ?? item?.valor)
      if (nombre && puntaje !== null) ejesRueda.push({ nombre, puntaje: Math.min(10, puntaje) })
    }
  } else if (detalle && typeof detalle === 'object') {
    for (const [nombre, valor] of Object.entries(detalle as Record<string, unknown>)) {
      const puntaje = aNumero(valor)
      if (puntaje !== null) ejesRueda.push({ nombre, puntaje: Math.min(10, puntaje) })
    }
  }

  /* ---------- progreso general ---------- */
  const componentes = [porcentajeEstructuracion, hayConvocatorias ? 100 : 0, encajeActual ?? 0]
  const progresoGeneral = Math.round(componentes.reduce((a, b) => a + b, 0) / componentes.length)

  /* ---------- próximo paso y recomendación ---------- */
  let proximoPaso: { titulo: string; detalle: string } | null = null
  if (!estructuracionLista && pasoActual) {
    proximoPaso = { titulo: 'Continuar la estructuración', detalle: pasoActual.nombre }
  } else if (!hayConvocatorias) {
    proximoPaso = { titulo: 'Buscar convocatorias', detalle: 'Tu proyecto ya está listo para la búsqueda.' }
  } else if (!haySeleccion) {
    proximoPaso = { titulo: 'Elegir convocatoria', detalle: 'Revisa las oportunidades encontradas.' }
  } else if (!hayEncaje) {
    proximoPaso = { titulo: 'Analizar el encaje', detalle: 'Falta el análisis con la convocatoria elegida.' }
  } else if (documentos && documentos.completos < documentos.total) {
    proximoPaso = { titulo: 'Completar documentos', detalle: `Faltan ${documentos.total - documentos.completos} documentos.` }
  }

  const recomendaciones = encajeActivo?.recomendaciones
  const recomendacionIA = Array.isArray(recomendaciones)
    ? String(recomendaciones[0] || '') || null
    : typeof recomendaciones === 'string'
      ? recomendaciones
      : proximoPaso
        ? `Tu proyecto va en ${progresoGeneral}%. El punto prioritario ahora es ${proximoPaso.titulo.toLowerCase()}.`
        : null

  /* ---------- alertas ---------- */
  const alertas: DatosResumen['alertas'] = []
  const diasCierre = diasHasta(fechaCierreActiva)
  if (activa && diasCierre !== null && diasCierre <= 30) {
    alertas.push({
      tipo: diasCierre <= 10 ? 'critica' : 'atencion',
      titulo: `La convocatoria cierra en ${diasCierre} días`,
      detalle: String(activa.nombre || ''),
      fecha: formatoFecha(fechaCierreActiva) || undefined,
    })
  }
  if (documentos && documentos.completos < documentos.total) {
    alertas.push({
      tipo: 'atencion',
      titulo: `${documentos.total - documentos.completos} documentos pendientes`,
      detalle: 'Revisa la lista de documentos requeridos',
    })
  }
  const criticas = preguntas.filter((p) => p.critico)
  if (criticas.length) {
    alertas.push({
      tipo: 'critica',
      titulo: `${criticas.length} preguntas críticas sin responder`,
      detalle: 'Bloquean el análisis de encaje',
    })
  }
  if (candidatas.length && !haySeleccion) {
    alertas.push({
      tipo: 'info',
      titulo: 'Tienes convocatorias sin revisar',
      detalle: 'Elige una para continuar con el encaje',
    })
  }

  /* ---------- actividades ---------- */
  const actividades: DatosResumen['actividades'] = []
  if (numCompletados > 0 && primerPendiente) {
    actividades.push({ texto: `Estructuración: ${numCompletados} pasos completados`, cuando: '' })
  }
  if (activa) {
    actividades.push({ texto: `Convocatoria encontrada: ${String(activa.nombre || '')}`, cuando: hace(aFecha(activa.creado_en)) })
  }
  if (encajeActivo) {
    actividades.push({ texto: 'Análisis de encaje completado', cuando: '' })
  }
  if (proyecto.archivo_proyecto_nombre) {
    actividades.push({ texto: `Documento cargado: ${proyecto.archivo_proyecto_nombre}`, cuando: '' })
  }

  /* ---------- pendientes ---------- */
  const pendientes: DatosResumen['pendientes'] = preguntas.slice(0, 5).map((p) => ({
    texto: String(p.pregunta || ''),
    prioridad: p.critico ? ('alta' as const) : ('media' as const),
  }))

  const datos: DatosResumen = {
    proyecto: {
      id: String(proyecto.id),
      nombre: String(proyecto.nombre_iniciativa || 'Proyecto sin nombre'),
      estado: String(proyecto.estado_actual || ''),
    },
    progresoGeneral,
    pasos: { total: totalPasos, completados: numCompletados },
    pasoActual,
    convocatoria: activa
      ? {
          nombre: String(activa.nombre || ''),
          entidad: activa.entidad ? String(activa.entidad) : null,
          fechaCierre: formatoFecha(fechaCierreActiva),
          diasRestantes: diasCierre,
        }
      : null,
    documentos,
    encaje: encajeActual !== null ? { actual: encajeActual, potencial: encajePotencial } : null,
    proximoPaso,
    semaforos,
    ruta,
    recomendacionIA,
    progresoAreas,
    ejesRueda,
    convocatoriasTop,
    alertas,
    actividades,
    pendientes,
  }

  return <ResumenProyecto datos={datos} />
}
