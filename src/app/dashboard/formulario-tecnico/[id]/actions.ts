'use server'

import { createClient } from '@supabase/supabase-js'
import { evaluateProjectViability } from '@/lib/evaluatorEngine'
import {
  construirDossier,
  derivarEstructura,
  guardarEstructura,
  resumenDelMotor,
  type EstructuraProyecto,
  type InsumosProyecto,
  type RelacionRevisada,
} from '@/lib/motorEstructuracion'
import { arrancaConInfinitivo, espejoPositivo } from '@/lib/espejoObjetivos'

export async function simulatePaymentAction(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('proyectos_clientes_serving')
    .update({ estado_comercial: 'PAGADO' })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error("Error al simular pago en Supabase:", error)
    throw new Error(error.message)
  }
  return data
}

export async function submitFase2Action(
  id: string,
  fase2Data: any,
  planPago: string,
  archivoUrl: string | null,
  archivoNombre: string | null
) {
  // Inicializamos Supabase con la Llave Maestra (Service Role Key)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 0. Validar que el proyecto esté pagado antes de recibir insumos y estructurar
  const { data: currentProj, error: fetchError } = await supabase
    .from('proyectos_clientes_serving')
    .select('estado_comercial')
    .eq('id', id)
    .single()

  if (fetchError || !currentProj) {
    console.error("Error consultando el proyecto en backend:", fetchError)
    throw new Error("No se pudo verificar el estado de transacción del proyecto en la base de datos.")
  }

  const isPaid = ['PAGADO', 'Pago Realizado', 'Pago Confirmado'].includes(currentProj.estado_comercial || '');
  if (!isPaid) {
    throw new Error("Acceso bloqueado: Se requiere la confirmación de pago del plan comercial ('PAGADO') en el backend para desbloquear este módulo.")
  }

  // 1. Actualizar el proyecto con Fase 2, plan, archivo y cambiar estado a 'Estructurando_IA'
  const { data, error } = await supabase
    .from('proyectos_clientes_serving')
    .update({
      respuestas_fase2_json: fase2Data,
      plan_pago: planPago,
      archivo_proyecto_url: archivoUrl,
      archivo_proyecto_nombre: archivoNombre,
      estado_actual: 'Estructurando_IA',
      progreso_estructuracion: 0,
      transferido_agente_convocatorias: false,
      agente_evaluacion_status: 'Pendiente',
      resultado_agente_json: null,
      dossier_markdown: null
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error("Error actualizando Fase 2 en Supabase:", error)
    throw new Error(error.message)
  }

  const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/cfb0f1be-7104-4c48-bbf7-9bf429c31fa7';

  console.log(`[Next.js] Offloading structuring to n8n webhook: ${webhookUrl}`);
  fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id,
      fase2Data,
      planPago,
      nombreProyecto: data.nombre_iniciativa || 'Iniciativa Sin Nombre'
    })
  }).then(res => {
    if (!res.ok) {
      throw new Error(`Webhook returned status ${res.status}`);
    }
  }).catch(err => {
    console.warn("Error triggering n8n webhook, falling back to local background structuring:", err.message);
    ejecutarEstructuracion(id, fase2Data, planPago, data.nombre_iniciativa || 'Iniciativa Sin Nombre')
      .catch((errorMotor) => console.error("[Motor] La estructuración de respaldo falló:", errorMotor));
  });

  return data
}

/* ==========================================================================
   Revisión de coherencia interna

   Se calcula sobre lo que REALMENTE quedó estructurado, no sobre frases
   fijas. Antes había tres relaciones que decían "Validado" pasara lo que
   pasara: eso se quitó.
   ========================================================================== */

function palabrasCompartidas(texto1: string, texto2: string): number {
  if (!texto1 || !texto2) return 0
  const palabras1 = new Set(texto1.toLowerCase().match(/[a-záéíóúñ]{4,}/g) || [])
  const palabras2 = new Set(texto2.toLowerCase().match(/[a-záéíóúñ]{4,}/g) || [])
  let cuenta = 0
  for (const palabra of palabras1) {
    if (palabras2.has(palabra)) cuenta++
  }
  return cuenta
}

function revisarCoherencia(
  estructura: EstructuraProyecto,
  fase2Data: any,
): { relaciones: RelacionRevisada[]; totalScore: number; maxScore: number; porcentaje: number } {
  const relaciones: RelacionRevisada[] = []

  const agregar = (nombre: string, aprobado: boolean, comentario: string, medio = false) => {
    relaciones.push({ nombre, aprobado, score: aprobado ? 1 : medio ? 0.5 : 0, comentario })
  }

  // 1. Problema central <-> objetivo general
  const generalEnInfinitivo = arrancaConInfinitivo(estructura.objetivoGeneral)
  const generalComparte = palabrasCompartidas(estructura.problemaCentral, estructura.objetivoGeneral) > 0
  agregar(
    'Problema central ↔ objetivo general',
    generalEnInfinitivo && generalComparte,
    generalEnInfinitivo && generalComparte
      ? 'El objetivo general es el problema central en positivo y arranca con verbo en infinitivo.'
      : 'Revisar: el objetivo general debe repetir el problema central en positivo y empezar con verbo en infinitivo.',
    generalEnInfinitivo || generalComparte,
  )

  // 2. Cada causa directa tiene su objetivo espejo
  const causasConEspejo = estructura.causas.filter((c) => espejoPositivo(c.directa)).length
  agregar(
    'Causas directas ↔ objetivos específicos',
    causasConEspejo === estructura.causas.length && estructura.causas.length >= 2,
    `${causasConEspejo} de ${estructura.causas.length} causas directas tienen su objetivo espejo. Las que no, hay que redactarlas a mano en el árbol de objetivos.`,
    causasConEspejo > 0,
  )

  // 3. Cada causa directa tiene causa de fondo
  const conIndirecta = estructura.causas.filter((c) => c.indirecta).length
  agregar(
    'Causas directas ↔ causas indirectas',
    conIndirecta === estructura.causas.length && estructura.causas.length > 0,
    `${conIndirecta} de ${estructura.causas.length} causas tienen identificada su causa de fondo. Sin causa de fondo no hay actividades.`,
    conIndirecta > 0,
  )

  // 4. Efectos con su efecto de largo plazo
  const conIndirecto = estructura.efectos.filter((e) => e.indirecto).length
  agregar(
    'Efectos directos ↔ efectos indirectos',
    conIndirecto === estructura.efectos.length && estructura.efectos.length > 0,
    `${conIndirecto} de ${estructura.efectos.length} efectos tienen su consecuencia de largo plazo.`,
    conIndirecto > 0,
  )

  // 5. Cadena de valor: producto por cada objetivo
  const conProducto = estructura.objetivos.filter((o) => o.producto && o.unidadMedida).length
  agregar(
    'Objetivos específicos ↔ productos de la cadena de valor',
    conProducto === estructura.objetivos.length && estructura.objetivos.length > 0,
    `${conProducto} de ${estructura.objetivos.length} objetivos tienen producto y unidad de medida.`,
    conProducto > 0,
  )

  // 6. Metas cuantificadas
  const conMeta = estructura.objetivos.filter((o) => o.meta !== null).length
  agregar(
    'Productos ↔ metas cuantificadas',
    conMeta === estructura.objetivos.length && estructura.objetivos.length > 0,
    conMeta === estructura.objetivos.length
      ? 'Todos los productos tienen meta numérica.'
      : `Faltan ${estructura.objetivos.length - conMeta} metas. Se le preguntaron al cliente: no se inventan.`,
    conMeta > 0,
  )

  // 7. Actividades en infinitivo
  const actividades = estructura.objetivos.flatMap((o) => o.actividades)
  const enInfinitivo = actividades.filter((a) => arrancaConInfinitivo(a)).length
  agregar(
    'Actividades redactadas en infinitivo',
    actividades.length > 0 && enInfinitivo === actividades.length,
    actividades.length === 0
      ? 'Todavía no hay actividades propias: se completan en la cadena de valor.'
      : `${enInfinitivo} de ${actividades.length} actividades arrancan con verbo en infinitivo.`,
    enInfinitivo > 0,
  )

  // 8. Línea base
  agregar(
    'Magnitud del problema (línea base)',
    estructura.lineaBase.length > 0,
    estructura.lineaBase.length > 0
      ? 'El problema tiene un dato que muestra su tamaño, con fuente.'
      : 'Falta la línea base con fuente. Es requisito de la metodología oficial y se le pidió al cliente.',
  )

  // 9. Presupuesto y tiempo declarados
  const desglose = (fase2Data?.f2_q19_desglose_fondos || '').trim()
  const tiempo = (fase2Data?.f2_q18_tiempo_ejecucion || '').toString().trim()
  agregar(
    'Presupuesto y cronograma declarados',
    desglose.length > 10 && tiempo.length > 0,
    desglose.length > 10 && tiempo.length > 0
      ? 'El destino de los fondos y la duración están declarados.'
      : 'Revisar: falta el destino de los fondos o la duración del proyecto.',
    desglose.length > 10 || tiempo.length > 0,
  )

  const totalScore = relaciones.reduce((suma, r) => suma + r.score, 0)
  const maxScore = relaciones.length
  return { relaciones, totalScore, maxScore, porcentaje: Math.round((totalScore / maxScore) * 100) }
}

/* ==========================================================================
   Articulación con los planes de desarrollo del territorio
   ========================================================================== */

async function articularConPlanesTerritoriales(
  supabase: any,
  proyectoId: string,
  fase1Data: any,
  fase2Data: any,
  archivoNombre: string | null,
) {
  const ubicacion = (fase1Data?.q2_ubicacion || '').trim()
  let municipio = ''
  let departamento = ''

  if (ubicacion) {
    const partes = ubicacion.split(',').map((p: string) => p.trim().toUpperCase())
    if (partes.length >= 2) {
      municipio = partes[0]
      departamento = partes[1]
    } else {
      departamento = partes[0]
    }
  }

  // Sin territorio declarado no se puede articular nada: se deja constancia.
  if (!departamento) {
    await supabase.from('articulacion_politica').upsert(
      {
        proyecto_id: proyectoId,
        departamento: '',
        municipio: '',
        texto_articulacion_departamental: '',
        texto_articulacion_municipal: '',
        registro_etnico_status: 'NO APLICA',
        alerta_etnica_disparada: false,
        palabras_clave_etnicas_detectadas: [],
        observaciones_agente: 'El cliente no indicó el territorio: falta para poder articular con los planes de desarrollo.',
      },
      { onConflict: 'proyecto_id' },
    )
    return
  }

  const { data: planDep } = await supabase
    .from('planes_desarrollo_territorial')
    .select('*')
    .eq('nivel', 'DEPARTAMENTAL')
    .eq('departamento', departamento)
    .limit(1)
    .maybeSingle()

  const { data: planMun } = municipio
    ? await supabase
        .from('planes_desarrollo_territorial')
        .select('*')
        .eq('nivel', 'MUNICIPAL')
        .eq('departamento', departamento)
        .eq('municipio', municipio)
        .limit(1)
        .maybeSingle()
    : { data: null }

  // Si el plan no está cargado no se afirma ninguna alineación: se deja vacío.
  const textoDep = planDep
    ? `Alineado con el eje "${planDep.lineas_estrategicas?.[0]?.eje || 'no especificado'}" del plan "${planDep.nombre_plan}", en la meta "${planDep.lineas_estrategicas?.[0]?.meta || 'no especificada'}".`
    : ''

  const textoMun = planMun
    ? `Alineado con el programa "${planMun.lineas_estrategicas?.[0]?.eje || 'no especificado'}" del plan "${planMun.nombre_plan}", aportando a "${planMun.lineas_estrategicas?.[0]?.meta || 'no especificada'}".`
    : ''

  // Filtro étnico: solo señala que hay que revisarlo, no concluye nada.
  const palabrasEtnicas = ['etnico', 'étnico', 'indigena', 'indígena', 'afro', 'palenquero', 'rom', 'cabildo', 'resguardo', 'comunidad negra', 'consejo comunitario', 'comunidades negras']
  const textoAnalisis = `${fase2Data?.f2_q1_causas || ''} ${fase2Data?.f2_q2_efectos || ''} ${fase2Data?.f2_q13_cliente_final || ''} ${fase2Data?.f2_q6_objetivo_impacto || ''} ${archivoNombre || ''}`.toLowerCase()
  const detectadas = palabrasEtnicas.filter((palabra) => textoAnalisis.includes(palabra))

  const observaciones: string[] = []
  if (!planDep) observaciones.push(`No está cargado el plan de desarrollo de ${departamento}: la articulación se escribe a mano.`)
  if (municipio && !planMun) observaciones.push(`No está cargado el plan de desarrollo de ${municipio}: la articulación se escribe a mano.`)
  if (detectadas.length > 0) observaciones.push(`Se mencionan comunidades étnicas (${detectadas.join(', ')}): revisar si el proyecto requiere consulta previa o registro.`)

  await supabase.from('articulacion_politica').upsert(
    {
      proyecto_id: proyectoId,
      departamento,
      municipio,
      plan_departamental_id: planDep?.id || null,
      plan_municipal_id: planMun?.id || null,
      texto_articulacion_departamental: textoDep,
      texto_articulacion_municipal: textoMun,
      registro_etnico_status: detectadas.length > 0 ? 'ALERTA_REVISION' : 'NO APLICA',
      alerta_etnica_disparada: detectadas.length > 0,
      palabras_clave_etnicas_detectadas: detectadas,
      observaciones_agente: observaciones.join(' ') || 'Sin observaciones.',
    },
    { onConflict: 'proyecto_id' },
  )
}

/* ==========================================================================
   El motor
   ========================================================================== */

/**
 * Estructura el proyecto de punta a punta y deja todo escrito en la base de
 * datos: árbol de problemas completo (con causas y efectos indirectos), árbol
 * de objetivos espejo, cadena de valor, resultados, entregables, preguntas
 * para el cliente y el dossier.
 *
 * El progreso se actualiza a medida que avanza el trabajo real. Antes subía
 * de a 10% cada tres segundos aunque no estuviera pasando nada.
 */
async function ejecutarEstructuracion(
  id: string,
  fase2Data: any,
  planPago: string,
  nombreProyecto: string,
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const avanzar = async (progreso: number) => {
    await supabase
      .from('proyectos_clientes_serving')
      .update({ progreso_estructuracion: progreso })
      .eq('id', id)
  }

  console.log(`[Motor] Estructurando el proyecto ${id}`)
  await avanzar(10)

  const { data: proyecto } = await supabase
    .from('proyectos_clientes_serving')
    .select('respuestas_fase1_json, archivo_proyecto_nombre')
    .eq('id', id)
    .single()

  const fase1Data = proyecto?.respuestas_fase1_json || {}

  const insumos: InsumosProyecto = {
    nombreProyecto,
    ubicacion: (fase1Data?.q2_ubicacion || '').trim(),
    poblacion: (fase1Data?.q6_afectados || '').trim(),
    mesesEjecucion: parseInt(fase2Data?.f2_q18_tiempo_ejecucion, 10) || 12,
    archivoNombre: proyecto?.archivo_proyecto_nombre || null,
    fase1Data,
    fase2Data,
  }

  // 1. Derivar la estructura a partir de lo que escribió el cliente
  await avanzar(25)
  const estructura = await derivarEstructura(insumos)

  // 2. Escribirla en las tablas que usan las pantallas del equipo
  await avanzar(55)
  const guardado = await guardarEstructura(supabase, id, estructura, insumos)

  // 3. Articulación territorial
  await avanzar(70)
  try {
    await articularConPlanesTerritoriales(supabase, id, fase1Data, fase2Data, insumos.archivoNombre)
  } catch (error) {
    console.warn('[Motor] No se pudo articular con los planes de desarrollo:', error)
  }

  // 4. Revisión de coherencia y evaluación ex-ante
  await avanzar(85)
  const revision = revisarCoherencia(estructura, fase2Data)
  const evaluacion = evaluateProjectViability(fase1Data, fase2Data, revision.porcentaje)

  await supabase.from('evaluacion_multicriterio').upsert(
    {
      proyecto_id: id,
      puntaje_propuesta_tecnica: evaluacion.puntaje_propuesta_tecnica,
      puntaje_impacto_potencial: evaluacion.puntaje_impacto_potencial,
      puntaje_capacidades_locales: evaluacion.puntaje_capacidades_locales,
      puntaje_sostenibilidad: evaluacion.puntaje_sostenibilidad,
      puntaje_replicabilidad: evaluacion.puntaje_replicabilidad,
      score_total: evaluacion.score_total,
      comentarios_criterios: evaluacion.comentarios_criterios,
      recomendaciones_mejora: evaluacion.recomendaciones_mejora,
    },
    { onConflict: 'proyecto_id' },
  )

  // 5. Dossier y cierre
  const dossier = construirDossier(nombreProyecto, planPago, estructura, revision, insumos, guardado.avisos)
  const resumen = resumenDelMotor(estructura, revision, guardado)

  const { translateBrandsInObject } = require('@/lib/brandProtector')

  const { data: proyectoFinal, error: errorFinal } = await supabase
    .from('proyectos_clientes_serving')
    .update({
      progreso_estructuracion: 100,
      estado_actual: 'En_Revision_Tecnica',
      estado_comercial: 'Estructuración Completada',
      transferido_agente_convocatorias: true,
      agente_evaluacion_status: 'Evaluado',
      resultado_agente_json: translateBrandsInObject(resumen),
      dossier_markdown: translateBrandsInObject(dossier),
    })
    .eq('id', id)
    .select()
    .single()

  if (errorFinal) {
    console.error('[Motor] No se pudo guardar el resultado final:', errorFinal)
    throw errorFinal
  }

  console.log(
    `[Motor] Proyecto ${id} estructurado. Coherencia ${revision.porcentaje}%, ` +
      `${guardado.preguntasDejadas} preguntas dejadas al cliente, ${guardado.avisos.length} pendientes.`,
  )

  // 6. Enganche con la búsqueda de convocatorias.
  //
  // Un proyecto estructurado por este camino no llenaba contenido_pasos_proyecto,
  // así que nunca quedaba marcado como listo y nunca entraba a buscar
  // convocatorias: la cadena se cortaba aquí. Ahora, si no quedaron preguntas
  // críticas sin responder, el proyecto queda listo y se dispara la búsqueda.
  await marcarListoParaEncaje(supabase, id)

  return proyectoFinal
}

/**
 * Marca el proyecto como listo para buscar convocatorias cuando no le quedan
 * preguntas críticas pendientes, y arranca el Motor 2.
 *
 * Si no hay dirección del sitio configurada (NEXT_PUBLIC_SITE_URL), no pasa
 * nada malo: el proyecto queda marcado y la búsqueda masiva lo recoge en su
 * siguiente corrida.
 */
async function marcarListoParaEncaje(supabase: any, id: string) {
  try {
    const { data: criticas } = await supabase
      .from('preguntas_pendientes_proyecto')
      .select('id')
      .eq('id_proyecto', id)
      .eq('respondida', false)
      .eq('critico', true)

    const listo = !criticas || criticas.length === 0

    const { data: antes } = await supabase
      .from('proyectos_clientes_serving')
      .select('listo_para_encaje')
      .eq('id', id)
      .maybeSingle()

    await supabase
      .from('proyectos_clientes_serving')
      .update({ listo_para_encaje: listo })
      .eq('id', id)

    if (!listo || antes?.listo_para_encaje === true) return

    const sitio = process.env.NEXT_PUBLIC_SITE_URL
    if (!sitio) {
      console.log('[Motor] Proyecto listo para encaje. Sin NEXT_PUBLIC_SITE_URL: lo recogerá la búsqueda masiva.')
      return
    }

    await fetch(`${sitio.replace(/\/$/, '')}/api/buscar-convocatorias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_proyecto: id }),
    })
  } catch (error) {
    console.warn('[Motor] No se pudo arrancar la búsqueda de convocatorias:', error)
  }
}

/** Punto de entrada que usa n8n cuando el webhook sí responde. */
export async function finalizeProjectStructuring(
  id: string,
  fase2Data: any,
  planPago: string,
  nombreProyecto: string
) {
  return ejecutarEstructuracion(id, fase2Data, planPago, nombreProyecto)
}

/**
 * Reprocesa un proyecto ya estructurado. Sirve para volver a correr el motor
 * después de que el cliente responde las preguntas pendientes.
 */
export async function reestructurarProyecto(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: proyecto, error } = await supabase
    .from('proyectos_clientes_serving')
    .select('respuestas_fase2_json, plan_pago, nombre_iniciativa')
    .eq('id', id)
    .single()

  if (error || !proyecto) throw new Error('No se encontró el proyecto.')

  return ejecutarEstructuracion(
    id,
    proyecto.respuestas_fase2_json || {},
    proyecto.plan_pago || 'No indicado',
    proyecto.nombre_iniciativa || 'Iniciativa sin nombre',
  )
}
