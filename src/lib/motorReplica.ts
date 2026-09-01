/**
 * Motor de réplicas.
 *
 * Replicar es volver a usar un proyecto ya estructurado para otra convocatoria,
 * otro territorio u otros beneficiarios, sin volver a empezar de cero.
 *
 * Hace dos cosas, en dos pasos separados a propósito:
 *   1. `prepararReplica` piensa la réplica: separa el núcleo que no se toca,
 *      lo que sí se adapta y lo que la convocatoria obliga a cambiar.
 *   2. `crearProyectoReplica` crea el proyecto nuevo COPIANDO el árbol, los
 *      objetivos y la cadena de valor del original. De ahí en adelante el
 *      equipo lo ajusta con las mismas pantallas de siempre.
 *
 * El núcleo (propósito, enfoque de innovación, metodología) NO se toca nunca:
 * es lo que hace que el proyecto siga siendo el mismo proyecto.
 */

import { callGemini } from '@/lib/gemini'

export const TIPOS_REPLICA = [
  'misma convocatoria',
  'otra convocatoria',
  'otro territorio',
  'otros beneficiarios',
  'otro proponente',
  'otros aliados',
  'otra linea tematica',
  'otro enfoque sectorial',
  'otro enfoque de innovacion',
  'otro monto',
  'otro alcance de metas',
] as const

export type TipoReplica = (typeof TIPOS_REPLICA)[number]

export type PuntoDeReplica = { que: string; detalle: string }

export type PlanDeReplica = {
  nucleo: PuntoDeReplica[]
  adaptaciones: PuntoDeReplica[]
  obligados: PuntoDeReplica[]
  riesgos: string
}

export type ResultadoReplica = {
  ok: boolean
  replicaId?: string
  proyectoReplicaId?: string
  mensaje: string
}

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : ''
}

function interpretarJson(bruto: string): any | null {
  const limpio = texto(bruto).replace(/```json/gi, '').replace(/```/g, '')
  const inicio = limpio.indexOf('{')
  const fin = limpio.lastIndexOf('}')
  if (inicio === -1 || fin === -1 || fin <= inicio) return null
  try {
    return JSON.parse(limpio.slice(inicio, fin + 1))
  } catch {
    return null
  }
}

function listaDePuntos(valor: unknown, maximo = 12): PuntoDeReplica[] {
  return (Array.isArray(valor) ? valor : [])
    .slice(0, maximo)
    .map((p: any) => ({ que: texto(p?.que), detalle: texto(p?.detalle) }))
    .filter((p) => p.que.length > 2)
}

/* ==========================================================================
   Paso 1: pensar la réplica
   ========================================================================== */

export async function prepararReplica(
  supabase: any,
  proyectoOrigenId: string,
  opciones: { tipo: TipoReplica; destino?: string; convocatoriaId?: string },
): Promise<ResultadoReplica> {
  if (!TIPOS_REPLICA.includes(opciones.tipo)) {
    return { ok: false, mensaje: 'Ese tipo de réplica no existe.' }
  }

  const { data: origen } = await supabase
    .from('proyectos_clientes_serving')
    .select('id, nombre_iniciativa, dossier_markdown, monto_solicitado_cop, respuestas_fase1_json')
    .eq('id', proyectoOrigenId)
    .maybeSingle()

  if (!origen) return { ok: false, mensaje: 'No se encontró el proyecto de origen.' }

  const { data: nodos } = await supabase
    .from('problemas_proyecto')
    .select('tipo, orden, descripcion')
    .eq('proyecto_id', proyectoOrigenId)
    .order('tipo')
    .order('orden')

  if (!nodos || nodos.length === 0) {
    return { ok: false, mensaje: 'El proyecto de origen todavía no está estructurado: no hay qué replicar.' }
  }

  let convocatoria: any = null
  if (opciones.convocatoriaId) {
    const { data } = await supabase
      .from('biblioteca_convocatorias')
      .select('nombre, entidad, fecha_cierre, monto, beneficiarios, territorio, linea_tematica, requisitos, terminos_referencia')
      .eq('id', opciones.convocatoriaId)
      .maybeSingle()
    convocatoria = data
  }

  const arbol = nodos.map((n: any) => `- [${n.tipo} ${n.orden}] ${n.descripcion}`).join('\n')

  const prompt = `Eres un formulador de proyectos. Vas a planear la RÉPLICA de un proyecto que ya está estructurado.

Replicar NO es escribir otro proyecto: es volver a usar el mismo, cambiando solo lo que hay que cambiar.

REGLAS:
1. El NÚCLEO no se toca nunca: el propósito, el enfoque de innovación y la metodología base. Enúncialo, no lo modifiques.
2. Solo se adapta lo que el tipo de réplica exige, más lo que la convocatoria de destino obligue.
3. PROHIBIDO inventar cifras, fechas, requisitos o entidades. Si un dato no está abajo, dilo como "falta verificar".

PROYECTO DE ORIGEN: ${origen.nombre_iniciativa}
Territorio actual: ${texto(origen.respuestas_fase1_json?.q2_ubicacion) || 'no indicado'}
Población actual: ${texto(origen.respuestas_fase1_json?.q6_afectados) || 'no indicada'}
Monto actual: ${origen.monto_solicitado_cop ?? 'no definido'}

Árbol:
${arbol}

Dossier:
${texto(origen.dossier_markdown).slice(0, 8000) || 'sin dossier'}

TIPO DE RÉPLICA PEDIDA: ${opciones.tipo}
DESTINO: ${texto(opciones.destino) || 'no indicado'}

CONVOCATORIA DE DESTINO: ${
    convocatoria
      ? `${convocatoria.nombre} (${convocatoria.entidad || 'sin entidad'}) | cierra: ${convocatoria.fecha_cierre || 'sin fecha'} | monto: ${convocatoria.monto || 'sin dato'} | beneficiarios: ${convocatoria.beneficiarios || 'sin dato'} | territorio: ${convocatoria.territorio || 'sin dato'} | línea: ${convocatoria.linea_tematica || 'sin dato'} | requisitos: ${convocatoria.requisitos || 'sin dato'}`
      : 'ninguna todavía'
  }

DEVUELVE ÚNICAMENTE UN JSON:
{
  "nucleo": [{ "que": "qué es", "detalle": "por qué no se toca" }],
  "adaptaciones": [{ "que": "qué se adapta", "detalle": "cómo queda" }],
  "obligados": [{ "que": "qué obliga la convocatoria", "detalle": "qué hay que hacer" }],
  "riesgos": "en qué se puede caer esta réplica"
}`

  let plan: PlanDeReplica
  try {
    const datos = interpretarJson(await callGemini(prompt))
    if (!datos) return { ok: false, mensaje: 'El modelo no respondió bien. Inténtalo otra vez.' }
    plan = {
      nucleo: listaDePuntos(datos.nucleo),
      adaptaciones: listaDePuntos(datos.adaptaciones),
      obligados: listaDePuntos(datos.obligados),
      riesgos: texto(datos.riesgos),
    }
  } catch (error) {
    console.error('[Réplicas] No se pudo consultar el modelo:', error)
    return { ok: false, mensaje: 'No se pudo preparar la réplica.' }
  }

  const { data, error } = await supabase
    .from('replicas')
    .insert({
      proyecto_origen_id: proyectoOrigenId,
      biblioteca_id: opciones.convocatoriaId || null,
      tipo: opciones.tipo,
      destino: texto(opciones.destino) || (convocatoria?.nombre ?? null),
      nucleo_json: plan.nucleo,
      adaptaciones_json: plan.adaptaciones,
      obligados_json: plan.obligados,
      riesgos: plan.riesgos || null,
      estado: 'Planeada',
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('[Réplicas] No se pudo guardar la réplica:', error)
    return { ok: false, mensaje: 'No se pudo guardar la réplica.' }
  }

  return { ok: true, replicaId: data.id, mensaje: 'Réplica planeada.' }
}

/* ==========================================================================
   Paso 2: crear el proyecto de la réplica copiando la estructura
   ========================================================================== */

// Lo que NO se copia: es del proyecto original y tiene que empezar limpio.
const NO_SE_COPIA = new Set([
  'id',
  'created_at',
  'updated_at',
  'dossier_markdown',
  'resultado_agente_json',
  'progreso_estructuracion',
  'listo_para_encaje',
  'transferido_agente_convocatorias',
  'agente_evaluacion_status',
  'fecha_ultimo_lote_convocatorias',
  'archivo_proyecto_url',
  'archivo_proyecto_nombre',
  'replica_de_proyecto_id',
])

export async function crearProyectoReplica(supabase: any, replicaId: string): Promise<ResultadoReplica> {
  const { data: replica } = await supabase
    .from('replicas')
    .select('id, proyecto_origen_id, proyecto_replica_id, tipo, destino')
    .eq('id', replicaId)
    .maybeSingle()

  if (!replica) return { ok: false, mensaje: 'No se encontró la réplica.' }
  if (replica.proyecto_replica_id) {
    return { ok: true, proyectoReplicaId: replica.proyecto_replica_id, replicaId, mensaje: 'Esta réplica ya tenía su proyecto creado.' }
  }

  const { data: origen } = await supabase
    .from('proyectos_clientes_serving')
    .select('*')
    .eq('id', replica.proyecto_origen_id)
    .maybeSingle()

  if (!origen) return { ok: false, mensaje: 'No se encontró el proyecto de origen.' }

  // Se copia la fila entera menos lo que debe empezar limpio, así no hace falta
  // conocer todas las columnas de la tabla.
  const nueva: Record<string, any> = {}
  for (const [columna, valor] of Object.entries(origen)) {
    if (!NO_SE_COPIA.has(columna)) nueva[columna] = valor
  }

  nueva.nombre_iniciativa = `${origen.nombre_iniciativa || 'Proyecto'} — réplica: ${replica.destino || replica.tipo}`
  nueva.estado_actual = 'En_Revision_Tecnica'
  nueva.replica_de_proyecto_id = origen.id

  const { data: proyectoNuevo, error: errorProyecto } = await supabase
    .from('proyectos_clientes_serving')
    .insert(nueva)
    .select('id')
    .single()

  if (errorProyecto || !proyectoNuevo) {
    console.error('[Réplicas] No se pudo crear el proyecto de la réplica:', errorProyecto)
    return { ok: false, mensaje: 'No se pudo crear el proyecto de la réplica.' }
  }

  const nuevoId = proyectoNuevo.id as string

  // --- Copiar el árbol, manteniendo quién cuelga de quién --------------------
  const { data: nodos } = await supabase
    .from('problemas_proyecto')
    .select('id, tipo, orden, descripcion, padre_id, linea_base, evidencia_fuente, evidencia_url, evidencia_nota')
    .eq('proyecto_id', replica.proyecto_origen_id)

  const equivalencia = new Map<string, string>()
  const porNiveles = ['CENTRAL', 'CAUSA_DIRECTA', 'EFECTO_DIRECTO', 'CAUSA_INDIRECTA', 'EFECTO_INDIRECTO']

  for (const tipo of porNiveles) {
    for (const nodo of (nodos || []).filter((n: any) => n.tipo === tipo)) {
      const { data: copia } = await supabase
        .from('problemas_proyecto')
        .insert({
          proyecto_id: nuevoId,
          tipo: nodo.tipo,
          orden: nodo.orden,
          descripcion: nodo.descripcion,
          padre_id: nodo.padre_id ? equivalencia.get(nodo.padre_id) || null : null,
          linea_base: nodo.linea_base,
          evidencia_fuente: nodo.evidencia_fuente,
          evidencia_url: nodo.evidencia_url,
          evidencia_nota: nodo.evidencia_nota,
        })
        .select('id')
        .single()
      if (copia) equivalencia.set(nodo.id, copia.id)
    }
  }

  // --- Copiar los objetivos, amarrados al nodo copiado ----------------------
  const { data: objetivos } = await supabase
    .from('objetivos_proyecto')
    .select('id, problema_id, tipo, descripcion, padre_id')
    .eq('proyecto_id', replica.proyecto_origen_id)

  const equivalenciaObjetivos = new Map<string, string>()
  const general = (objetivos || []).find((o: any) => o.tipo === 'GENERAL')
  const resto = (objetivos || []).filter((o: any) => o.tipo !== 'GENERAL')

  for (const objetivo of general ? [general, ...resto] : resto) {
    const problemaNuevo = equivalencia.get(objetivo.problema_id)
    if (!problemaNuevo) continue
    const { data: copia } = await supabase
      .from('objetivos_proyecto')
      .insert({
        proyecto_id: nuevoId,
        problema_id: problemaNuevo,
        tipo: objetivo.tipo,
        descripcion: objetivo.descripcion,
        padre_id: objetivo.padre_id ? equivalenciaObjetivos.get(objetivo.padre_id) || null : null,
      })
      .select('id')
      .single()
    if (copia) equivalenciaObjetivos.set(objetivo.id, copia.id)
  }

  // --- Copiar la cadena de valor -------------------------------------------
  const idsOrigen = [...equivalenciaObjetivos.keys()]
  if (idsOrigen.length > 0) {
    const { data: cadena } = await supabase
      .from('cadena_valor_actividades')
      .select('objetivo_especifico_id, producto_mga, unidad_medida, meta, tareas_json, responsable, duracion_meses, ruta_critica')
      .in('objetivo_especifico_id', idsOrigen)

    for (const fila of cadena || []) {
      const objetivoNuevo = equivalenciaObjetivos.get(fila.objetivo_especifico_id)
      if (!objetivoNuevo) continue
      await supabase.from('cadena_valor_actividades').insert({
        objetivo_especifico_id: objetivoNuevo,
        producto_mga: fila.producto_mga,
        unidad_medida: fila.unidad_medida,
        meta: fila.meta,
        tareas_json: fila.tareas_json,
        responsable: fila.responsable,
        duracion_meses: fila.duracion_meses,
        ruta_critica: fila.ruta_critica,
      })
    }
  }

  await supabase
    .from('replicas')
    .update({
      proyecto_replica_id: nuevoId,
      estado: 'Proyecto creado',
      actualizada_en: new Date().toISOString(),
    })
    .eq('id', replicaId)

  return {
    ok: true,
    replicaId,
    proyectoReplicaId: nuevoId,
    mensaje: 'Se creó el proyecto de la réplica con el árbol, los objetivos y la cadena de valor copiados. Falta adaptarlo.',
  }
}
