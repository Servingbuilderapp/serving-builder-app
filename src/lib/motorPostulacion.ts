/**
 * Motor 4 — postulación.
 *
 * Toma el proyecto ya estructurado (el proyecto base) y una convocatoria de la
 * biblioteca, y prepara la postulación: qué hay que adaptar, qué documentos
 * exige la convocatoria, cómo queda el proyecto frente a la matriz de
 * evaluación de 100 puntos, y una carta de intención de borrador.
 *
 * Dos reglas del método que este archivo hace cumplir:
 *   * No se radica con menos de 90 puntos.
 *   * El evaluador se corre al menos dos veces (columna `corrida`): la
 *     primera muestra qué falta, la segunda comprueba que se corrigió.
 *
 * Y la regla de siempre: nada de cifras inventadas. Todo número que aparezca
 * y no esté en el proyecto ni en la convocatoria se reporta como alerta para
 * que el equipo lo verifique antes de enviar nada.
 */

import { callGemini } from '@/lib/gemini'
import { cifrasSinRespaldo } from '@/lib/motorEstructuracion'

export const PUNTAJE_MINIMO_PARA_RADICAR = 90
export const DIAS_MINIMOS_ANTES_DEL_CIERRE = 20

export type RequisitoPostulacion = {
  requisito: string
  tipo: 'documento' | 'formulario' | 'condicion'
  obligatorio: boolean
  nota: string
}

export type EvaluacionPostulacion = {
  tecnica: number
  impacto: number
  capacidades: number
  sostenibilidad: number
  replicabilidad: number
  total: number
  veredicto: string
  comentarios: Record<string, string>
  mejoras: string[]
}

export type PaquetePostulacion = {
  requisitos: RequisitoPostulacion[]
  adaptaciones: { que_cambia: string; por_que: string }[]
  cartaIntencion: string
  evaluacion: EvaluacionPostulacion
  alertas: string[]
}

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : ''
}

function enRango(valor: unknown, maximo: number): number {
  const numero = Math.round(Number(valor))
  if (!Number.isFinite(numero) || numero < 0) return 0
  return Math.min(numero, maximo)
}

function veredictoPorPuntaje(total: number): string {
  if (total >= PUNTAJE_MINIMO_PARA_RADICAR) return 'aprobar'
  if (total >= 70) return 'aprobar con modificaciones'
  return 'no aprobar'
}

/* ==========================================================================
   El proyecto base, resumido para el prompt
   ========================================================================== */

export type ProyectoBase = {
  id: string
  nombre: string
  montoSolicitado: number | null
  duracionMeses: number | null
  territorio: string
  dossier: string
  arbol: string
  cadenaValor: string
  presupuesto: string
}

export async function leerProyectoBase(supabase: any, proyectoId: string): Promise<ProyectoBase | null> {
  const { data: proyecto } = await supabase
    .from('proyectos_clientes_serving')
    .select('id, nombre_iniciativa, monto_solicitado_cop, dossier_markdown, respuestas_fase1_json, respuestas_fase2_json')
    .eq('id', proyectoId)
    .maybeSingle()

  if (!proyecto) return null

  const { data: nodos } = await supabase
    .from('problemas_proyecto')
    .select('tipo, orden, descripcion')
    .eq('proyecto_id', proyectoId)
    .order('tipo')
    .order('orden')

  const { data: objetivos } = await supabase
    .from('objetivos_proyecto')
    .select('id, tipo, descripcion')
    .eq('proyecto_id', proyectoId)

  const idsEspecificos = (objetivos || [])
    .filter((o: any) => o.tipo === 'ESPECIFICO_TECNICO')
    .map((o: any) => o.id)

  const { data: cadena } = idsEspecificos.length
    ? await supabase
        .from('cadena_valor_actividades')
        .select('objetivo_especifico_id, producto_mga, unidad_medida, meta, tareas_json, duracion_meses')
        .in('objetivo_especifico_id', idsEspecificos)
    : { data: [] }

  const { data: presupuesto } = await supabase
    .from('presupuesto_proyecto')
    .select('moneda, monto_maximo, contrapartida_minima_pct, imprevistos_pct')
    .eq('proyecto_id', proyectoId)
    .maybeSingle()

  const arbol = (nodos || [])
    .map((n: any) => `- [${n.tipo} ${n.orden}] ${n.descripcion}`)
    .join('\n')

  const cadenaTexto = (cadena || [])
    .map(
      (c: any) =>
        `- Producto: ${c.producto_mga} | meta: ${c.meta} ${c.unidad_medida} | duración: ${c.duracion_meses} meses | actividades: ${(c.tareas_json || []).join('; ')}`,
    )
    .join('\n')

  const presupuestoTexto = presupuesto
    ? `Moneda ${presupuesto.moneda || 'COP'} | tope ${presupuesto.monto_maximo ?? 'sin definir'} | contrapartida mínima ${presupuesto.contrapartida_minima_pct ?? 0}% | imprevistos ${presupuesto.imprevistos_pct ?? 0}%`
    : 'Todavía no hay presupuesto cargado.'

  const fase1 = proyecto.respuestas_fase1_json || {}
  const fase2 = proyecto.respuestas_fase2_json || {}

  return {
    id: proyecto.id,
    nombre: proyecto.nombre_iniciativa || 'Iniciativa sin nombre',
    montoSolicitado: proyecto.monto_solicitado_cop || null,
    duracionMeses: parseInt(fase2.f2_q18_tiempo_ejecucion, 10) || null,
    territorio: texto(fase1.q2_ubicacion),
    dossier: texto(proyecto.dossier_markdown).slice(0, 12000),
    arbol,
    cadenaValor: cadenaTexto,
    presupuesto: presupuestoTexto,
  }
}

/* ==========================================================================
   La convocatoria
   ========================================================================== */

export type FichaConvocatoria = {
  id: string | null
  nombre: string
  entidad: string
  fechaCierre: string | null
  fechaCierreTexto: string
  monto: string
  beneficiarios: string
  territorio: string
  lineaTematica: string
  requisitos: string
  mecanismoPostulacion: string
  terminosReferencia: string
  fuenteOficial: string
}

export async function leerFichaConvocatoria(supabase: any, convocatoriaId: string): Promise<FichaConvocatoria | null> {
  const { data } = await supabase
    .from('biblioteca_convocatorias')
    .select('*')
    .eq('id', convocatoriaId)
    .maybeSingle()

  if (!data) return null

  return {
    id: data.id,
    nombre: data.nombre,
    entidad: data.entidad || '',
    fechaCierre: data.fecha_cierre || null,
    fechaCierreTexto: data.fecha_cierre_texto || '',
    monto: data.monto || '',
    beneficiarios: data.beneficiarios || '',
    territorio: data.territorio || '',
    lineaTematica: data.linea_tematica || '',
    requisitos: data.requisitos || '',
    mecanismoPostulacion: data.mecanismo_postulacion || '',
    terminosReferencia: data.terminos_referencia || '',
    fuenteOficial: data.fuente_oficial || '',
  }
}

/* ==========================================================================
   El paquete de postulación
   ========================================================================== */

function construirPrompt(proyecto: ProyectoBase, convocatoria: FichaConvocatoria): string {
  return `Eres el evaluador y el formulador de una firma que estructura proyectos para convocatorias de cooperación y de fondos públicos. Vas a preparar la postulación de un proyecto YA ESTRUCTURADO a una convocatoria concreta.

REGLAS QUE NO PUEDES ROMPER:
1. PROHIBIDO inventar cifras, fechas, requisitos o entidades. Si un dato de la convocatoria no está abajo, dilo como "falta verificar en los términos de referencia", no lo supongas.
2. No cambies el núcleo del proyecto (su problema, su enfoque, su metodología). Solo se adapta lo que la convocatoria obliga a adaptar: formato, territorio, perfil de beneficiarios, metas, tope de presupuesto y requisitos habilitantes.
3. Evalúa con severidad. El puntaje sirve para decidir si se radica o no: un puntaje regalado hace perder la convocatoria.

PROYECTO BASE
- Nombre: ${proyecto.nombre}
- Territorio: ${proyecto.territorio || 'no indicado'}
- Monto solicitado: ${proyecto.montoSolicitado ?? 'no definido'}
- Duración: ${proyecto.duracionMeses ?? 'no definida'} meses
- Presupuesto: ${proyecto.presupuesto}

Árbol del proyecto:
${proyecto.arbol || 'todavía sin árbol'}

Cadena de valor:
${proyecto.cadenaValor || 'todavía sin cadena de valor'}

Dossier:
${proyecto.dossier || 'sin dossier'}

CONVOCATORIA
- Nombre: ${convocatoria.nombre}
- Entidad: ${convocatoria.entidad || 'sin dato'}
- Cierra: ${convocatoria.fechaCierre || convocatoria.fechaCierreTexto || 'sin fecha confirmada'}
- Monto: ${convocatoria.monto || 'sin dato'}
- Beneficiarios que exige: ${convocatoria.beneficiarios || 'sin dato'}
- Territorio: ${convocatoria.territorio || 'sin dato'}
- Línea temática: ${convocatoria.lineaTematica || 'sin dato'}
- Requisitos conocidos: ${convocatoria.requisitos || 'sin dato'}
- Mecanismo de postulación: ${convocatoria.mecanismoPostulacion || 'sin dato'}
- Términos de referencia: ${convocatoria.terminosReferencia || 'sin dato'}
- Enlace oficial: ${convocatoria.fuenteOficial || 'sin enlace'}

DEVUELVE ÚNICAMENTE UN JSON, sin explicaciones y sin marcas de código:
{
  "requisitos": [{ "requisito": "...", "tipo": "documento|formulario|condicion", "obligatorio": true, "nota": "qué falta o dónde se consigue" }],
  "adaptaciones": [{ "que_cambia": "...", "por_que": "la convocatoria lo exige porque..." }],
  "carta_intencion": "carta formal de una página dirigida a la entidad, en el idioma de la convocatoria",
  "evaluacion": {
    "tecnica": 0,
    "impacto": 0,
    "capacidades": 0,
    "sostenibilidad": 0,
    "replicabilidad": 0,
    "comentarios": { "tecnica": "...", "impacto": "...", "capacidades": "...", "sostenibilidad": "...", "replicabilidad": "..." },
    "mejoras": ["qué corregir concretamente para subir el puntaje"]
  },
  "alertas": ["riesgos, incompatibilidades o datos que hay que verificar antes de radicar"]
}

Los máximos de la matriz son: técnica 30, impacto 30, capacidades locales 15, sostenibilidad 15, replicabilidad 10. Suman 100.`
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

export async function prepararPaquete(
  proyecto: ProyectoBase,
  convocatoria: FichaConvocatoria,
): Promise<PaquetePostulacion | null> {
  let datos: any = null
  try {
    datos = interpretarJson(await callGemini(construirPrompt(proyecto, convocatoria)))
  } catch (error) {
    console.error('[Motor 4] No se pudo consultar el modelo:', error)
    return null
  }
  if (!datos) return null

  const requisitos: RequisitoPostulacion[] = (Array.isArray(datos.requisitos) ? datos.requisitos : [])
    .slice(0, 30)
    .map((r: any) => ({
      requisito: texto(r?.requisito),
      tipo: ['documento', 'formulario', 'condicion'].includes(r?.tipo) ? r.tipo : 'documento',
      obligatorio: r?.obligatorio !== false,
      nota: texto(r?.nota),
    }))
    .filter((r: RequisitoPostulacion) => r.requisito.length > 3)

  const adaptaciones = (Array.isArray(datos.adaptaciones) ? datos.adaptaciones : [])
    .slice(0, 20)
    .map((a: any) => ({ que_cambia: texto(a?.que_cambia), por_que: texto(a?.por_que) }))
    .filter((a: any) => a.que_cambia.length > 3)

  const e = datos.evaluacion || {}
  const tecnica = enRango(e.tecnica, 30)
  const impacto = enRango(e.impacto, 30)
  const capacidades = enRango(e.capacidades, 15)
  const sostenibilidad = enRango(e.sostenibilidad, 15)
  const replicabilidad = enRango(e.replicabilidad, 10)
  const total = tecnica + impacto + capacidades + sostenibilidad + replicabilidad

  const comentarios: Record<string, string> = {}
  if (e.comentarios && typeof e.comentarios === 'object') {
    for (const [clave, valor] of Object.entries(e.comentarios)) {
      if (typeof valor === 'string' && valor.trim()) comentarios[clave] = valor.trim()
    }
  }

  const mejoras = (Array.isArray(e.mejoras) ? e.mejoras : [])
    .map((m: any) => texto(m))
    .filter((m: string) => m.length > 3)
    .slice(0, 12)

  const alertas = (Array.isArray(datos.alertas) ? datos.alertas : [])
    .map((a: any) => texto(a))
    .filter((a: string) => a.length > 3)
    .slice(0, 12)

  const cartaIntencion = texto(datos.carta_intencion)

  // Red de seguridad: cualquier cifra de la carta que no esté ni en el
  // proyecto ni en la convocatoria se reporta para que el equipo la revise.
  const referencia = [
    proyecto.dossier,
    proyecto.arbol,
    proyecto.cadenaValor,
    proyecto.presupuesto,
    String(proyecto.montoSolicitado ?? ''),
    String(proyecto.duracionMeses ?? ''),
    convocatoria.monto,
    convocatoria.requisitos,
    convocatoria.terminosReferencia,
    convocatoria.fechaCierre || '',
    convocatoria.fechaCierreTexto,
  ]
    .join(' ')
    .toLowerCase()

  const cifrasDudosas = cifrasSinRespaldo(cartaIntencion, referencia)
  if (cifrasDudosas.length > 0) {
    alertas.push(
      `La carta trae cifras que no están ni en el proyecto ni en la convocatoria (${cifrasDudosas.join(', ')}): verificarlas antes de enviarla.`,
    )
  }

  return {
    requisitos,
    adaptaciones,
    cartaIntencion,
    evaluacion: {
      tecnica,
      impacto,
      capacidades,
      sostenibilidad,
      replicabilidad,
      total,
      veredicto: veredictoPorPuntaje(total),
      comentarios,
      mejoras,
    },
    alertas,
  }
}

/* ==========================================================================
   Guardar la postulación
   ========================================================================== */

export type ResultadoPostulacion = {
  ok: boolean
  postulacionId?: string
  puntaje?: number
  veredicto?: string
  corrida?: number
  puedeRadicar?: boolean
  diasParaCierre?: number | null
  mensaje: string
}

/**
 * Prepara la postulación de un proyecto a una convocatoria y la deja guardada.
 * Si ya existía, la actualiza y cuenta una corrida más del evaluador.
 */
export async function prepararPostulacion(
  supabase: any,
  proyectoId: string,
  convocatoriaId: string,
): Promise<ResultadoPostulacion> {
  const proyecto = await leerProyectoBase(supabase, proyectoId)
  if (!proyecto) return { ok: false, mensaje: 'No se encontró el proyecto.' }

  const convocatoria = await leerFichaConvocatoria(supabase, convocatoriaId)
  if (!convocatoria) return { ok: false, mensaje: 'Esa convocatoria no está en la biblioteca.' }

  if (!proyecto.arbol && !proyecto.dossier) {
    return { ok: false, mensaje: 'El proyecto todavía no está estructurado: primero hay que pasarlo por el motor de estructuración.' }
  }

  const paquete = await prepararPaquete(proyecto, convocatoria)
  if (!paquete) return { ok: false, mensaje: 'No se pudo preparar la postulación: el modelo no respondió. Inténtalo otra vez.' }

  const { data: anterior } = await supabase
    .from('postulaciones')
    .select('id, corrida')
    .eq('proyecto_id', proyectoId)
    .eq('convocatoria_nombre', convocatoria.nombre)
    .maybeSingle()

  const corrida = anterior ? (anterior.corrida || 1) + 1 : 1

  const diasParaCierre = convocatoria.fechaCierre
    ? Math.round(
        (new Date(convocatoria.fechaCierre + 'T00:00:00Z').getTime() - Date.now()) / (24 * 60 * 60 * 1000),
      )
    : null

  const alertas = [...paquete.alertas]
  if (diasParaCierre !== null && diasParaCierre < DIAS_MINIMOS_ANTES_DEL_CIERRE) {
    alertas.push(
      `Faltan ${diasParaCierre} días para el cierre. El método pide tener el formulario final diligenciado ${DIAS_MINIMOS_ANTES_DEL_CIERRE} días antes.`,
    )
  }

  // Solo queda lista si pasa los 90 puntos y ya se corrió el evaluador dos veces.
  const puedeRadicar = paquete.evaluacion.total >= PUNTAJE_MINIMO_PARA_RADICAR && corrida >= 2
  if (paquete.evaluacion.total < PUNTAJE_MINIMO_PARA_RADICAR) {
    alertas.push(
      `Puntaje ${paquete.evaluacion.total}/100: por debajo de ${PUNTAJE_MINIMO_PARA_RADICAR}, no se radica todavía.`,
    )
  } else if (corrida < 2) {
    alertas.push('Falta la segunda corrida del evaluador: corrige lo señalado y vuelve a prepararla.')
  }

  const fila = {
    proyecto_id: proyectoId,
    biblioteca_id: convocatoria.id,
    convocatoria_nombre: convocatoria.nombre,
    entidad: convocatoria.entidad || null,
    fecha_cierre: convocatoria.fechaCierre,
    estado: puedeRadicar ? 'Lista para radicar' : 'Preparando',
    puntaje_tecnica: paquete.evaluacion.tecnica,
    puntaje_impacto: paquete.evaluacion.impacto,
    puntaje_capacidades: paquete.evaluacion.capacidades,
    puntaje_sostenibilidad: paquete.evaluacion.sostenibilidad,
    puntaje_replicabilidad: paquete.evaluacion.replicabilidad,
    puntaje_total: paquete.evaluacion.total,
    veredicto: paquete.evaluacion.veredicto,
    corrida,
    comentarios_json: paquete.evaluacion.comentarios,
    mejoras_json: paquete.evaluacion.mejoras,
    adaptaciones_json: paquete.adaptaciones,
    carta_intencion: paquete.cartaIntencion || null,
    alertas: alertas.join(' · ') || null,
    actualizada_en: new Date().toISOString(),
  }

  let postulacionId = anterior?.id as string | undefined

  if (postulacionId) {
    const { error } = await supabase.from('postulaciones').update(fila).eq('id', postulacionId)
    if (error) {
      console.error('[Motor 4] No se pudo actualizar la postulación:', error)
      return { ok: false, mensaje: 'No se pudo guardar la postulación.' }
    }
  } else {
    const { data, error } = await supabase.from('postulaciones').insert(fila).select('id').single()
    if (error || !data) {
      console.error('[Motor 4] No se pudo crear la postulación:', error)
      return { ok: false, mensaje: 'No se pudo guardar la postulación.' }
    }
    postulacionId = data.id as string
  }

  // La lista de requisitos se rehace, pero se respeta lo que el equipo ya marcó.
  const { data: marcados } = await supabase
    .from('postulacion_requisitos')
    .select('requisito, cumplido, responsable, nota')
    .eq('postulacion_id', postulacionId)

  const yaCumplidos = new Map<string, any>(
    ((marcados || []) as any[]).map((r) => [r.requisito.toLowerCase().trim(), r]),
  )

  await supabase.from('postulacion_requisitos').delete().eq('postulacion_id', postulacionId)

  if (paquete.requisitos.length > 0) {
    const filas = paquete.requisitos.map((r, indice) => {
      const previo = yaCumplidos.get(r.requisito.toLowerCase().trim())
      return {
        postulacion_id: postulacionId,
        requisito: r.requisito,
        tipo: r.tipo,
        obligatorio: r.obligatorio,
        cumplido: previo?.cumplido || false,
        responsable: previo?.responsable || null,
        nota: previo?.nota || r.nota || null,
        orden: indice + 1,
      }
    })
    const { error } = await supabase.from('postulacion_requisitos').insert(filas)
    if (error) console.error('[Motor 4] No se pudieron guardar los requisitos:', error)
  }

  // Queda también en la bitácora que ya existía.
  await supabase.from('logs_postulacion').insert({
    proyecto_id: proyectoId,
    nombre_proyecto: proyecto.nombre,
    convocatoria_nombre: convocatoria.nombre,
    estado: 'En Proceso',
  })

  return {
    ok: true,
    postulacionId,
    puntaje: paquete.evaluacion.total,
    veredicto: paquete.evaluacion.veredicto,
    corrida,
    puedeRadicar,
    diasParaCierre,
    mensaje: puedeRadicar
      ? 'La postulación quedó lista para radicar.'
      : 'La postulación quedó preparada, pero todavía no se puede radicar.',
  }
}

/** Marca la postulación como radicada. Solo si el puntaje lo permite. */
export async function registrarRadicacion(
  supabase: any,
  postulacionId: string,
): Promise<ResultadoPostulacion> {
  const { data: postulacion } = await supabase
    .from('postulaciones')
    .select('id, puntaje_total, corrida, estado')
    .eq('id', postulacionId)
    .maybeSingle()

  if (!postulacion) return { ok: false, mensaje: 'No se encontró la postulación.' }

  if ((postulacion.puntaje_total || 0) < PUNTAJE_MINIMO_PARA_RADICAR) {
    return {
      ok: false,
      mensaje: `No se radica con ${postulacion.puntaje_total || 0}/100. El mínimo acordado es ${PUNTAJE_MINIMO_PARA_RADICAR}.`,
    }
  }

  if ((postulacion.corrida || 1) < 2) {
    return { ok: false, mensaje: 'Falta la segunda corrida del evaluador antes de radicar.' }
  }

  const { error } = await supabase
    .from('postulaciones')
    .update({
      estado: 'Radicada',
      fecha_radicacion: new Date().toISOString(),
      actualizada_en: new Date().toISOString(),
    })
    .eq('id', postulacionId)

  if (error) return { ok: false, mensaje: 'No se pudo registrar la radicación.' }

  return { ok: true, postulacionId, mensaje: 'Postulación registrada como radicada.' }
}
