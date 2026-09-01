/**
 * Motor de estructuración.
 *
 * Toma lo que el cliente escribió en el formulario (y el documento que subió)
 * y arma con eso el proyecto: árbol de problemas completo, árbol de objetivos
 * espejo, cadena de valor, resultados y la lista de preguntas que el equipo
 * le debe hacer al cliente.
 *
 * REGLA DE ORO DE ESTE ARCHIVO: no se inventa nada.
 *   - Ninguna cifra, porcentaje, fuente ni año sale de aquí si el cliente no
 *     lo escribió. Lo que falta se deja vacío y se convierte en una pregunta
 *     para el cliente.
 *   - Antes de guardar, todo lo que trae número se contrasta contra el texto
 *     del cliente (ver `cifrasSinRespaldo`). Si no está respaldado, se cae.
 *
 * Antes este motor escribía "brecha del 38.5% en adopción tecnológica (fuente:
 * DANE 2024)", "TIR del 18.5%" y "300 personas capacitadas" en TODOS los
 * proyectos, fueran del sector que fueran. Eso es lo que se quitó.
 */

import { callGemini } from '@/lib/gemini'
import { espejoObjetivoGeneral, espejoPositivo } from '@/lib/espejoObjetivos'

/* ==========================================================================
   Tipos
   ========================================================================== */

export type Causa = { directa: string; indirecta: string }
export type Efecto = { directo: string; indirecto: string }

export type ObjetivoEstructurado = {
  /** Bien o servicio que se entrega (producto MGA). */
  producto: string
  unidadMedida: string
  /** Solo si sale de un dato del cliente; si no, null. */
  meta: number | null
  /** Cuatro actividades propias, en infinitivo. Las dos fijas se agregan al guardar. */
  actividades: string[]
}

export type DatoLineaBase = { indicador: string; valor: string; fuente: string }
export type PreguntaAlCliente = { pregunta: string; critico: boolean }

export type EstructuraProyecto = {
  problemaCentral: string
  objetivoGeneral: string
  causas: Causa[]
  efectos: Efecto[]
  objetivos: ObjetivoEstructurado[]
  descripcionProblema: string
  lineaBase: DatoLineaBase[]
  resultados: {
    cortoRegional: string
    cortoNacional: string
    medianoRegional: string
    medianoNacional: string
    largoRegional: string
    largoNacional: string
  }
  preguntas: PreguntaAlCliente[]
  /** 'ia' cuando la derivó el modelo; 'respaldo' cuando hubo que armarla sin él. */
  origen: 'ia' | 'respaldo'
}

export type InsumosProyecto = {
  nombreProyecto: string
  ubicacion: string
  poblacion: string
  mesesEjecucion: number
  archivoNombre: string | null
  fase1Data: any
  fase2Data: any
}

/* ==========================================================================
   Utilidades de texto
   ========================================================================== */

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : ''
}

function mayusculaInicial(valor: string): string {
  return valor.charAt(0).toUpperCase() + valor.slice(1)
}

/** Parte un texto libre en renglones limpios (quita viñetas y numeración). */
export function partirEnRenglones(valor: unknown): string[] {
  return texto(valor)
    .split(/\r?\n|(?:^|\s)[•*]\s|;\s/)
    .map((linea) => linea.trim().replace(/^[\d\-*•.\s)(]+/g, '').trim())
    .filter((linea) => linea.length > 2)
}

/** Todo lo que el cliente escribió, en un solo texto, para poder contrastar. */
export function textoDelCliente(insumos: InsumosProyecto): string {
  const partes: string[] = [insumos.nombreProyecto, insumos.ubicacion, insumos.poblacion]
  for (const fuente of [insumos.fase1Data, insumos.fase2Data]) {
    if (fuente && typeof fuente === 'object') {
      for (const valor of Object.values(fuente)) {
        if (typeof valor === 'string' || typeof valor === 'number') partes.push(String(valor))
      }
    }
  }
  return partes.join(' \n ').toLowerCase()
}

/**
 * Devuelve las cifras de un texto que NO aparecen en lo que escribió el
 * cliente. Si devuelve algo, ese texto trae datos inventados y no se guarda.
 *
 * Se ignoran los números de una sola cifra (van en frases normales: "3 meses",
 * "las 6 actividades") y los años del rango del proyecto.
 */
export function cifrasSinRespaldo(candidato: string, referencia: string): string[] {
  const numeros = candidato.match(/\d+[.,]?\d*\s?%?/g) || []
  const sinRespaldo: string[] = []

  for (const bruto of numeros) {
    const limpio = bruto.replace(/\s/g, '')
    const soloNumero = limpio.replace('%', '')
    if (soloNumero.replace(/[.,]/g, '').length <= 1) continue

    const variantes = [limpio, soloNumero, soloNumero.replace(',', '.'), soloNumero.replace('.', ',')]
    const respaldado = variantes.some((v) => referencia.includes(v.toLowerCase()))
    if (!respaldado) sinRespaldo.push(bruto.trim())
  }

  return sinRespaldo
}

/** Deja el texto solo si todas sus cifras están respaldadas por el cliente. */
function soloSiEstaRespaldado(candidato: string, referencia: string): string {
  const limpio = texto(candidato)
  if (!limpio) return ''
  return cifrasSinRespaldo(limpio, referencia).length === 0 ? limpio : ''
}

/* ==========================================================================
   Paso 1: pedirle al modelo que derive la estructura
   ========================================================================== */

function construirPrompt(insumos: InsumosProyecto): string {
  const f2 = insumos.fase2Data || {}

  return `Eres un formulador de proyectos con veinte años de experiencia en cooperación internacional y en convocatorias públicas de Colombia. Trabajas con la metodología de marco lógico y la MGA del DNP.

Te entrego lo que el cliente escribió sobre su proyecto. Tu trabajo es ORDENARLO con método, NO ampliarlo con información que no está.

REGLAS QUE NO PUEDES ROMPER:
1. Está PROHIBIDO inventar cifras, porcentajes, líneas base, fuentes, entidades, años o nombres de estudios. Si el cliente no lo escribió, no existe.
2. Cuando falte un dato necesario, NO lo rellenes: agrégalo a "preguntas" como una pregunta concreta para el cliente.
3. Escribe en español neutro, en tercera persona, sin adjetivos comerciales.
4. Las causas y los efectos van redactados en NEGATIVO y empiezan por una palabra de polaridad: Bajo, Baja, Escaso, Limitado, Insuficiente, Deficiente, Inadecuado, Alto, Falta de, Ausencia de, Desconocimiento de, Pérdida de.
5. Cada causa directa tiene EXACTAMENTE una causa indirecta (la causa de fondo que explica esa causa). Cada efecto directo tiene EXACTAMENTE un efecto indirecto (lo que pasa más adelante si el problema sigue).
6. Las actividades empiezan SIEMPRE con un verbo en infinitivo (terminado en ar, er o ir).
7. En "resultados" no uses porcentajes ni metas numéricas: se redactan con "contribuye a" o "sienta las bases para", nunca con "garantiza".

INFORMACIÓN DEL CLIENTE
- Nombre de la iniciativa: ${insumos.nombreProyecto || 'no indicado'}
- Ubicación: ${insumos.ubicacion || 'no indicada'}
- Población afectada: ${insumos.poblacion || 'no indicada'}
- Duración declarada: ${insumos.mesesEjecucion} meses
- Documento que adjuntó: ${insumos.archivoNombre || 'ninguno'}
- Causas que él identifica: ${texto(f2.f2_q1_causas) || 'no indicadas'}
- Efectos que él identifica: ${texto(f2.f2_q2_efectos) || 'no indicados'}
- Por qué no lo resuelve el mercado: ${texto(f2.f2_q3_soluciones_mercado) || 'no indicado'}
- Objetivo técnico que propone: ${texto(f2.f2_q4_objetivo_tecnico) || 'no indicado'}
- Objetivo comercial que propone: ${texto(f2.f2_q5_objetivo_comercial) || 'no indicado'}
- Objetivo de impacto que propone: ${texto(f2.f2_q6_objetivo_impacto) || 'no indicado'}
- Procesos y tecnologías: ${texto(f2.f2_q7_procesos_tecnicos) || 'no indicados'}
- Insumos clave: ${texto(f2.f2_q8_insumos) || 'no indicados'}
- Infraestructura actual: ${texto(f2.f2_q9_infraestructura_actual) || 'no indicada'}
- Equipamiento nuevo requerido: ${texto(f2.f2_q10_infraestructura_nueva) || 'no indicado'}
- Capacidad de producción: ${texto(f2.f2_q11_capacidad_produccion) || 'no indicada'}
- Normatividad: ${texto(f2.f2_q12_normatividad) || 'no indicada'}
- Beneficiario o cliente final: ${texto(f2.f2_q13_cliente_final) || 'no indicado'}
- Tamaño del mercado: ${texto(f2.f2_q14_tamano_mercado) || 'no indicado'}
- Competidores: ${texto(f2.f2_q15_competidores) || 'no indicados'}
- Estrategia comercial: ${texto(f2.f2_q16_estrategia_comercial) || 'no indicada'}
- Aliados: ${texto(f2.f2_q17_aliados) || 'no indicados'}
- Destino de los fondos: ${texto(f2.f2_q19_desglose_fondos) || 'no indicado'}
- Estructura de costos: ${texto(f2.f2_q20_estructura_costos) || 'no indicada'}
- Fuentes de ingresos: ${texto(f2.f2_q21_fuentes_ingresos) || 'no indicadas'}
- Cofinanciación: ${texto(f2.f2_q22_cofinanciacion) || 'no indicada'}

DEVUELVE ÚNICAMENTE UN JSON con esta forma exacta, sin explicaciones y sin marcas de código:
{
  "problema_central": "el problema en negativo, una sola frase, sin la palabra proyecto",
  "verbo_objetivo_general": "uno de: Mejorar, Fortalecer, Incrementar, Ampliar, Reducir, Promover, Establecer, Garantizar",
  "causas": [{ "directa": "...", "indirecta": "..." }],
  "efectos": [{ "directo": "...", "indirecto": "..." }],
  "objetivos": [{ "producto": "bien o servicio entregable", "unidad_medida": "ej. personas capacitadas", "meta": null, "actividades": ["Verbo en infinitivo ...", "...", "...", "..."] }],
  "descripcion_problema": "dos o tres párrafos describiendo el problema con las palabras del cliente, sin cifras que él no haya dado",
  "linea_base": [{ "indicador": "...", "valor": "...", "fuente": "..." }],
  "resultados": {
    "corto_regional": "", "corto_nacional": "",
    "mediano_regional": "", "mediano_nacional": "",
    "largo_regional": "", "largo_nacional": ""
  },
  "preguntas": [{ "pregunta": "pregunta concreta para el cliente", "critico": true }]
}

"causas" y "efectos" llevan entre 2 y 4 entradas. "objetivos" lleva exactamente una entrada por cada causa directa, en el mismo orden. "meta" va en null salvo que el cliente haya dado el número. "linea_base" va en [] si el cliente no dio datos con fuente.`
}

/** Saca el JSON de la respuesta del modelo, venga como venga. */
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

/* ==========================================================================
   Paso 2: limpiar lo que devolvió el modelo
   ========================================================================== */

function normalizar(datos: any, insumos: InsumosProyecto): EstructuraProyecto | null {
  if (!datos || typeof datos !== 'object') return null

  const referencia = textoDelCliente(insumos)

  const causas: Causa[] = (Array.isArray(datos.causas) ? datos.causas : [])
    .slice(0, 4)
    .map((c: any) => ({ directa: texto(c?.directa), indirecta: texto(c?.indirecta) }))
    .filter((c: Causa) => c.directa.length > 3)

  const efectos: Efecto[] = (Array.isArray(datos.efectos) ? datos.efectos : [])
    .slice(0, 4)
    .map((e: any) => ({ directo: texto(e?.directo), indirecto: texto(e?.indirecto) }))
    .filter((e: Efecto) => e.directo.length > 3)

  if (causas.length === 0) return null

  const objetivos: ObjetivoEstructurado[] = causas.map((_, indice) => {
    const bruto = Array.isArray(datos.objetivos) ? datos.objetivos[indice] : null
    const actividades = (Array.isArray(bruto?.actividades) ? bruto.actividades : [])
      .map((a: any) => texto(a))
      .filter((a: string) => a.length > 3)
      .slice(0, 4)

    // La meta solo vale si el número salió de algo que escribió el cliente.
    const metaBruta = Number(bruto?.meta)
    const meta =
      Number.isFinite(metaBruta) && metaBruta > 0 && referencia.includes(String(metaBruta))
        ? metaBruta
        : null

    return {
      producto: texto(bruto?.producto),
      unidadMedida: texto(bruto?.unidad_medida),
      meta,
      actividades,
    }
  })

  // Línea base: se queda solo lo que el cliente dio con su propio dato.
  const lineaBase: DatoLineaBase[] = (Array.isArray(datos.linea_base) ? datos.linea_base : [])
    .slice(0, 6)
    .map((d: any) => ({ indicador: texto(d?.indicador), valor: texto(d?.valor), fuente: texto(d?.fuente) }))
    .filter((d: DatoLineaBase) => d.indicador.length > 2 && d.valor.length > 0)
    .filter((d: DatoLineaBase) => cifrasSinRespaldo(d.valor, referencia).length === 0)

  const resultadosBrutos = datos.resultados || {}
  const resultados = {
    cortoRegional: soloSiEstaRespaldado(resultadosBrutos.corto_regional, referencia),
    cortoNacional: soloSiEstaRespaldado(resultadosBrutos.corto_nacional, referencia),
    medianoRegional: soloSiEstaRespaldado(resultadosBrutos.mediano_regional, referencia),
    medianoNacional: soloSiEstaRespaldado(resultadosBrutos.mediano_nacional, referencia),
    largoRegional: soloSiEstaRespaldado(resultadosBrutos.largo_regional, referencia),
    largoNacional: soloSiEstaRespaldado(resultadosBrutos.largo_nacional, referencia),
  }

  const preguntas: PreguntaAlCliente[] = (Array.isArray(datos.preguntas) ? datos.preguntas : [])
    .slice(0, 8)
    .map((p: any) => ({ pregunta: texto(p?.pregunta), critico: Boolean(p?.critico) }))
    .filter((p: PreguntaAlCliente) => p.pregunta.length > 8)

  const problemaCentral = texto(datos.problema_central) || insumos.nombreProyecto
  const verbo = texto(datos.verbo_objetivo_general) || 'Mejorar'
  const objetivoGeneral =
    espejoObjetivoGeneral(problemaCentral, verbo) || `${verbo} la situación descrita como problema central`

  return {
    problemaCentral,
    objetivoGeneral,
    causas,
    efectos,
    objetivos,
    descripcionProblema: soloSiEstaRespaldado(texto(datos.descripcion_problema), referencia),
    lineaBase,
    resultados,
    preguntas,
    origen: 'ia',
  }
}

/* ==========================================================================
   Paso 3: estructura de respaldo (si el modelo no responde)
   ========================================================================== */

function estructuraDeRespaldo(insumos: InsumosProyecto): EstructuraProyecto {
  const f2 = insumos.fase2Data || {}
  const causasTexto = partirEnRenglones(f2.f2_q1_causas).slice(0, 3)
  const efectosTexto = partirEnRenglones(f2.f2_q2_efectos).slice(0, 3)

  const objetivosPropuestos = [
    texto(f2.f2_q4_objetivo_tecnico),
    texto(f2.f2_q5_objetivo_comercial),
    texto(f2.f2_q6_objetivo_impacto),
  ]

  const preguntas: PreguntaAlCliente[] = [
    {
      pregunta:
        'Para terminar el árbol de problemas necesitamos, por cada causa que usted mencionó, la causa de fondo que la explica. ¿Nos ayuda a completarla?',
      critico: true,
    },
  ]
  if (causasTexto.length < 2) {
    preguntas.push({
      pregunta: 'Necesitamos al menos dos causas del problema, escritas por separado. ¿Cuáles son?',
      critico: true,
    })
  }
  if (efectosTexto.length < 2) {
    preguntas.push({
      pregunta: 'Necesitamos al menos dos efectos del problema, escritos por separado. ¿Cuáles son?',
      critico: true,
    })
  }

  return {
    problemaCentral: insumos.nombreProyecto,
    objetivoGeneral: espejoObjetivoGeneral(insumos.nombreProyecto, 'Mejorar') || '',
    causas: causasTexto.map((directa) => ({ directa, indirecta: '' })),
    efectos: efectosTexto.map((directo) => ({ directo, indirecto: '' })),
    objetivos: causasTexto.map((_, indice) => ({
      producto: '',
      unidadMedida: '',
      meta: null,
      actividades: objetivosPropuestos[indice] ? [objetivosPropuestos[indice]] : [],
    })),
    descripcionProblema: '',
    lineaBase: [],
    resultados: {
      cortoRegional: '',
      cortoNacional: '',
      medianoRegional: '',
      medianoNacional: '',
      largoRegional: '',
      largoNacional: '',
    },
    preguntas,
    origen: 'respaldo',
  }
}

/** Deriva la estructura con el modelo; si falla, devuelve la de respaldo. */
export async function derivarEstructura(insumos: InsumosProyecto): Promise<EstructuraProyecto> {
  try {
    const respuesta = await callGemini(construirPrompt(insumos))
    const normalizada = normalizar(interpretarJson(respuesta), insumos)
    if (normalizada) return normalizada
    console.warn('[Motor] El modelo respondió algo que no se pudo interpretar. Se usa la estructura de respaldo.')
  } catch (error) {
    console.warn('[Motor] No se pudo consultar el modelo:', error)
  }
  return estructuraDeRespaldo(insumos)
}

/* ==========================================================================
   Paso 4: guardar la estructura en la base de datos
   ========================================================================== */

const ACTIVIDADES_FIJAS = ['Administrar el proyecto', 'Supervisar el proyecto']

type NodoGuardado = { id: string; tipo: string; orden: number; descripcion: string }

export type ResultadoGuardado = {
  avisos: string[]
  nodos: NodoGuardado[]
  objetivosEspecificos: { id: string; descripcion: string }[]
  preguntasDejadas: number
}

/**
 * Escribe el árbol, los objetivos, la cadena de valor, los resultados y las
 * preguntas. Todo lo que no tenga respaldo se queda sin escribir a propósito.
 */
export async function guardarEstructura(
  supabase: any,
  proyectoId: string,
  estructura: EstructuraProyecto,
  insumos: InsumosProyecto,
): Promise<ResultadoGuardado> {
  const avisos: string[] = []
  const nodos: NodoGuardado[] = []
  const objetivosEspecificos: { id: string; descripcion: string }[] = []

  /* --- Árbol de problemas ------------------------------------------------ */

  // Si el equipo ya trabajó este árbol (dejó evidencia), no se pisa.
  const { data: yaExiste } = await supabase
    .from('problemas_proyecto')
    .select('id, evidencia_fuente, evidencia_nota')
    .eq('proyecto_id', proyectoId)

  const equipoYaTrabajo = (yaExiste || []).some(
    (n: any) => texto(n?.evidencia_fuente) || texto(n?.evidencia_nota),
  )

  if (equipoYaTrabajo) {
    avisos.push('El árbol ya tenía trabajo del equipo: no se sobrescribió.')
    return { avisos, nodos, objetivosEspecificos, preguntasDejadas: 0 }
  }

  await supabase.from('problemas_proyecto').delete().eq('proyecto_id', proyectoId)

  const insertarNodo = async (
    tipo: string,
    orden: number,
    descripcion: string,
    padreId: string | null,
    lineaBase?: string,
  ): Promise<string | null> => {
    if (!texto(descripcion)) return null
    const { data, error } = await supabase
      .from('problemas_proyecto')
      .insert({
        proyecto_id: proyectoId,
        tipo,
        orden,
        descripcion: mayusculaInicial(texto(descripcion)),
        padre_id: padreId,
        linea_base: lineaBase || null,
      })
      .select('id')
      .single()
    if (error || !data) {
      console.error('[Motor] No se pudo guardar un nodo del árbol:', error)
      return null
    }
    nodos.push({ id: data.id, tipo, orden, descripcion })
    return data.id as string
  }

  const lineaBaseTexto = estructura.lineaBase
    .map((d) => `${d.indicador}: ${d.valor}${d.fuente ? ` (${d.fuente})` : ''}`)
    .join(' · ')

  const idCentral = await insertarNodo('CENTRAL', 1, estructura.problemaCentral, null, lineaBaseTexto)

  const idsCausaDirecta: (string | null)[] = []
  for (let i = 0; i < estructura.causas.length; i++) {
    const idCausa = await insertarNodo('CAUSA_DIRECTA', i + 1, estructura.causas[i].directa, idCentral)
    idsCausaDirecta.push(idCausa)
    if (idCausa && estructura.causas[i].indirecta) {
      await insertarNodo('CAUSA_INDIRECTA', i + 1, estructura.causas[i].indirecta, idCausa)
    }
  }

  const idsEfectoDirecto: (string | null)[] = []
  for (let i = 0; i < estructura.efectos.length; i++) {
    const idEfecto = await insertarNodo('EFECTO_DIRECTO', i + 1, estructura.efectos[i].directo, idCentral)
    idsEfectoDirecto.push(idEfecto)
    if (idEfecto && estructura.efectos[i].indirecto) {
      await insertarNodo('EFECTO_INDIRECTO', i + 1, estructura.efectos[i].indirecto, idEfecto)
    }
  }

  if (!idCentral) {
    avisos.push('No se pudo escribir el problema central.')
    return { avisos, nodos, objetivosEspecificos, preguntasDejadas: 0 }
  }

  /* --- Árbol de objetivos (espejo) --------------------------------------- */

  const insertarObjetivo = async (
    problemaId: string,
    tipo: string,
    descripcion: string,
    padreId: string | null,
  ): Promise<string | null> => {
    if (!texto(descripcion)) return null
    const { data, error } = await supabase
      .from('objetivos_proyecto')
      .insert({
        proyecto_id: proyectoId,
        problema_id: problemaId,
        tipo,
        descripcion: mayusculaInicial(texto(descripcion)),
        padre_id: padreId,
      })
      .select('id')
      .single()
    if (error || !data) {
      console.error('[Motor] No se pudo guardar un objetivo:', error)
      return null
    }
    return data.id as string
  }

  const idObjGeneral = await insertarObjetivo(idCentral, 'GENERAL', estructura.objetivoGeneral, null)

  const nodoPorTipoYOrden = (tipo: string, orden: number) =>
    nodos.find((n) => n.tipo === tipo && n.orden === orden)

  for (let i = 0; i < estructura.causas.length; i++) {
    const idCausa = idsCausaDirecta[i]
    if (!idCausa) continue

    // El espejo cambia solo la palabra de polaridad. Si no la reconoce, se
    // deja sin objetivo antes que inventar una frase rara.
    const espejo = espejoPositivo(estructura.causas[i].directa)
    const idEspecifico = await insertarObjetivo(idCausa, 'ESPECIFICO_TECNICO', espejo, idObjGeneral)
    if (idEspecifico) {
      objetivosEspecificos.push({ id: idEspecifico, descripcion: espejo })
    } else if (!espejo) {
      avisos.push(`La causa ${i + 1} no arranca con una palabra que el espejo reconozca: su objetivo queda a mano.`)
    }

    const nodoIndirecta = nodoPorTipoYOrden('CAUSA_INDIRECTA', i + 1)
    if (nodoIndirecta) {
      await insertarObjetivo(
        nodoIndirecta.id,
        'ACTIVIDAD',
        espejoPositivo(estructura.causas[i].indirecta),
        idObjGeneral,
      )
    }
  }

  for (let i = 0; i < estructura.efectos.length; i++) {
    const idEfecto = idsEfectoDirecto[i]
    if (idEfecto) {
      await insertarObjetivo(idEfecto, 'FIN_DIRECTO', espejoPositivo(estructura.efectos[i].directo), idObjGeneral)
    }
    const nodoIndirecto = nodoPorTipoYOrden('EFECTO_INDIRECTO', i + 1)
    if (nodoIndirecto) {
      await insertarObjetivo(
        nodoIndirecto.id,
        'FIN_INDIRECTO',
        espejoPositivo(estructura.efectos[i].indirecto),
        idObjGeneral,
      )
    }
  }

  /* --- Cadena de valor ---------------------------------------------------- */

  const meses = insumos.mesesEjecucion > 0 ? insumos.mesesEjecucion : 12
  const preguntasExtra: PreguntaAlCliente[] = []

  for (let i = 0; i < objetivosEspecificos.length; i++) {
    const objetivo = objetivosEspecificos[i]
    const plan = estructura.objetivos[i]
    if (!plan || !texto(plan.producto) || !texto(plan.unidadMedida)) {
      avisos.push(`El objetivo específico ${i + 1} quedó sin producto: la cadena de valor se completa a mano.`)
      continue
    }

    const actividades = [...plan.actividades.slice(0, 4), ...ACTIVIDADES_FIJAS]

    if (plan.meta === null) {
      preguntasExtra.push({
        pregunta: `¿Cuál es la meta numérica de "${plan.producto}"? La necesitamos en ${plan.unidadMedida}.`,
        critico: true,
      })
    }

    const { error } = await supabase.from('cadena_valor_actividades').insert({
      objetivo_especifico_id: objetivo.id,
      producto_mga: plan.producto,
      unidad_medida: plan.unidadMedida.slice(0, 100),
      meta: plan.meta ?? 0,
      tareas_json: actividades,
      responsable: 'Por definir',
      duracion_meses: meses,
      ruta_critica: i === 0,
    })
    if (error) console.error('[Motor] No se pudo guardar la cadena de valor:', error)
  }

  /* --- Descripción del problema y línea base ------------------------------ */

  const espejoCausasEfectos = estructura.causas.map((causa, indice) => ({
    causa: causa.directa,
    efecto: estructura.efectos[indice]?.directo || '',
  }))

  const fuentes = estructura.lineaBase.map((d) => d.fuente).filter((f) => f.length > 0)

  await supabase.from('descripcion_problema_linea_base').upsert(
    {
      proyecto_id: proyectoId,
      descripcion_tecnica_dnp: estructura.descripcionProblema,
      datos_duros_json: estructura.lineaBase,
      fuentes_oficiales: fuentes,
      espejo_causas_efectos: espejoCausasEfectos,
      linea_base_indicadores: estructura.lineaBase,
    },
    { onConflict: 'proyecto_id' },
  )

  if (estructura.lineaBase.length === 0) {
    preguntasExtra.push({
      pregunta:
        'La convocatoria exige mostrar el tamaño del problema con un dato y su fuente (por ejemplo: cuántas familias, qué porcentaje, de qué informe). ¿Con qué dato contamos?',
      critico: true,
    })
  }

  /* --- Resultados e impactos --------------------------------------------- */

  const hayResultados = Object.values(estructura.resultados).some((v) => texto(v).length > 0)
  if (hayResultados) {
    await supabase.from('resultados_impactos').upsert(
      {
        proyecto_id: proyectoId,
        corto_plazo_regional: estructura.resultados.cortoRegional,
        corto_plazo_nacional: estructura.resultados.cortoNacional,
        mediano_plazo_regional: estructura.resultados.medianoRegional,
        mediano_plazo_nacional: estructura.resultados.medianoNacional,
        largo_plazo_regional: estructura.resultados.largoRegional,
        largo_plazo_nacional: estructura.resultados.largoNacional,
      },
      { onConflict: 'proyecto_id' },
    )
  } else {
    avisos.push('Los resultados e impactos quedaron sin escribir: no había con qué sustentarlos.')
  }

  /* --- Plan operativo (entregables) --------------------------------------- */

  await supabase.from('plan_operativo_detallado').delete().eq('proyecto_id', proyectoId)

  const entregables = estructura.objetivos.map((o) => texto(o.producto)).filter((p) => p.length > 0)
  if (entregables.length > 0) {
    const diasPorEntregable = Math.max(15, Math.round((meses * 30) / entregables.length))
    for (const entregable of entregables) {
      await supabase.from('plan_operativo_detallado').insert({
        proyecto_id: proyectoId,
        entregable,
        duracion_optimista_dias: Math.round(diasPorEntregable * 0.8),
        duracion_probable_dias: diasPorEntregable,
        duracion_pesimista_dias: Math.round(diasPorEntregable * 1.4),
        duracion_esperada_dias: Math.round(
          (diasPorEntregable * 0.8 + 4 * diasPorEntregable + diasPorEntregable * 1.4) / 6,
        ),
      })
    }
  }

  /* --- Monto solicitado --------------------------------------------------- */

  const montoBruto = texto(insumos.fase1Data?.q9_monto_solicitado).replace(/\D/g, '')
  const monto = montoBruto ? Number(montoBruto) : 0

  if (monto > 0) {
    await supabase
      .from('proyectos_clientes_serving')
      .update({
        monto_solicitado_cop: monto,
        aristas_impacto_json: {
          ...(insumos.fase1Data?.aristas_impacto_json || {}),
          desglose_financiero: {
            fuente_financiamiento: 'Subvención (convocatoria)',
            monto_solicitado: monto,
            cofinanciacion_declarada: texto(insumos.fase2Data?.f2_q22_cofinanciacion) || null,
          },
        },
      })
      .eq('id', proyectoId)
  } else {
    preguntasExtra.push({
      pregunta: '¿Cuál es el monto que se va a solicitar en la convocatoria? Lo necesitamos para armar el presupuesto.',
      critico: true,
    })
    avisos.push('No había monto solicitado: no se escribió ninguno.')
  }

  /* --- Preguntas para el cliente ------------------------------------------ */

  const preguntasDejadas = await dejarPreguntas(supabase, proyectoId, [
    ...estructura.preguntas,
    ...preguntasExtra,
  ])

  return { avisos, nodos, objetivosEspecificos, preguntasDejadas }
}

/**
 * Deja las preguntas en la bandeja que el cliente ya ve en su panel.
 * Cuelgan del primer paso de la estructuración, que es donde tienen sentido.
 */
async function dejarPreguntas(
  supabase: any,
  proyectoId: string,
  preguntas: PreguntaAlCliente[],
): Promise<number> {
  if (preguntas.length === 0) return 0

  const { data: paso } = await supabase
    .from('pasos_estructuracion')
    .select('id')
    .order('orden_secuencia', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!paso?.id) {
    console.warn('[Motor] No hay pasos de estructuración cargados: las preguntas no se pudieron dejar.')
    return 0
  }

  const filas = preguntas.slice(0, 10).map((p) => ({
    id_proyecto: proyectoId,
    id_paso: paso.id,
    pregunta: p.pregunta,
    critico: p.critico,
  }))

  const { error } = await supabase.from('preguntas_pendientes_proyecto').insert(filas)
  if (error) {
    console.error('[Motor] No se pudieron dejar las preguntas:', error)
    return 0
  }
  return filas.length
}

/* ==========================================================================
   Paso 5: el dossier que ve el cliente
   ========================================================================== */

export type RelacionRevisada = { nombre: string; aprobado: boolean; score: number; comentario: string }

/**
 * Arma el dossier con lo que de verdad quedó estructurado.
 * Antes este texto traía TIR, huella de carbono y empleo inventados: eso ya no
 * está. Lo que falta se nombra como falta.
 */
export function construirDossier(
  nombreProyecto: string,
  planPago: string,
  estructura: EstructuraProyecto,
  revision: { relaciones: RelacionRevisada[]; totalScore: number; maxScore: number; porcentaje: number },
  insumos: InsumosProyecto,
  avisos: string[],
): string {
  const f2 = insumos.fase2Data || {}
  const sinDato = '_Pendiente por definir con el cliente_'

  const filaArbol = (etiqueta: string, problema: string, objetivo: string) =>
    `| **${etiqueta}** | ${problema || '—'} | ${objetivo || '—'} |`

  const filas: string[] = [
    filaArbol('Problema central / Objetivo general', estructura.problemaCentral, estructura.objetivoGeneral),
  ]

  estructura.causas.forEach((causa, i) => {
    filas.push(filaArbol(`Causa directa ${i + 1} / Objetivo específico ${i + 1}`, causa.directa, espejoPositivo(causa.directa)))
    if (causa.indirecta) {
      filas.push(filaArbol(`Causa indirecta ${i + 1} / Actividad ${i + 1}`, causa.indirecta, espejoPositivo(causa.indirecta)))
    }
  })

  estructura.efectos.forEach((efecto, i) => {
    filas.push(filaArbol(`Efecto directo ${i + 1} / Resultado ${i + 1}`, efecto.directo, espejoPositivo(efecto.directo)))
    if (efecto.indirecto) {
      filas.push(filaArbol(`Efecto indirecto ${i + 1} / Impacto ${i + 1}`, efecto.indirecto, espejoPositivo(efecto.indirecto)))
    }
  })

  const cadena = estructura.objetivos
    .map((o, i) => {
      if (!o.producto) return `${i + 1}. _Producto pendiente por definir_`
      const meta = o.meta === null ? 'meta por definir' : `meta: ${o.meta} ${o.unidadMedida}`
      const actividades = [...o.actividades, ...ACTIVIDADES_FIJAS].map((a) => `   - ${a}`).join('\n')
      return `${i + 1}. **${o.producto}** (${meta})\n${actividades}`
    })
    .join('\n')

  const lineaBase =
    estructura.lineaBase.length > 0
      ? estructura.lineaBase.map((d) => `*   **${d.indicador}**: ${d.valor}${d.fuente ? ` — fuente: ${d.fuente}` : ''}`).join('\n')
      : '*   Sin línea base todavía. Es un requisito de la metodología oficial y se le preguntó al cliente.'

  const pendientes = avisos.length > 0 ? avisos.map((a) => `*   ${a}`).join('\n') : '*   Sin pendientes técnicos.'

  return `
# Dossier de estructuración técnica

## Proyecto: ${nombreProyecto}
### Modalidad contratada: **${planPago}**

---

## 1. Estado de la estructuración

*   **Método aplicado**: marco lógico y MGA (metodología oficial del DNP).
*   **Árbol**: ${estructura.causas.length} causas directas con su causa de fondo y ${estructura.efectos.length} efectos directos con su efecto de largo plazo.
*   **Origen de la estructura**: ${estructura.origen === 'ia' ? 'derivada del formulario y el documento del cliente' : 'armada directamente con las respuestas del formulario'}.

> Este documento solo contiene información entregada por el cliente o derivada de ella. Los datos que faltan aparecen señalados como pendientes: no se completan con supuestos.

### Pendientes que quedaron abiertos

${pendientes}

---

## 2. Revisión de coherencia interna

### Puntaje: **${revision.totalScore} / ${revision.maxScore} (${revision.porcentaje}%)**

| Relación evaluada | Estado | Calificación | Comentario |
| :--- | :---: | :---: | :--- |
${revision.relaciones.map((r) => `| ${r.nombre} | ${r.aprobado ? '✔️ Conforme' : '⚠️ Por revisar'} | ${r.score} | ${r.comentario} |`).join('\n')}

---

## 3. Árbol de problemas y árbol de objetivos

| Nodo | Árbol de problemas | Árbol de objetivos (espejo) |
| :--- | :--- | :--- |
${filas.join('\n')}

---

## 4. Descripción del problema

${estructura.descripcionProblema || sinDato}

### Línea base

${lineaBase}

---

## 5. Cadena de valor

${cadena || sinDato}

---

## 6. Componente técnico

*   **Procesos y tecnologías**: ${texto(f2.f2_q7_procesos_tecnicos) || sinDato}
*   **Insumos clave**: ${texto(f2.f2_q8_insumos) || sinDato}
*   **Infraestructura actual**: ${texto(f2.f2_q9_infraestructura_actual) || sinDato}
*   **Equipamiento por adquirir**: ${texto(f2.f2_q10_infraestructura_nueva) || sinDato}
*   **Capacidad de producción**: ${texto(f2.f2_q11_capacidad_produccion) || sinDato}
*   **Normatividad y licencias**: ${texto(f2.f2_q12_normatividad) || sinDato}

---

## 7. Componente comercial

*   **Beneficiario o cliente final**: ${texto(f2.f2_q13_cliente_final) || sinDato}
*   **Demanda potencial**: ${texto(f2.f2_q14_tamano_mercado) || sinDato}
*   **Competidores**: ${texto(f2.f2_q15_competidores) || sinDato}
*   **Aliados**: ${texto(f2.f2_q17_aliados) || sinDato}

---

## 8. Componente financiero

*   **Duración**: ${insumos.mesesEjecucion} meses
*   **Destino de los fondos**: ${texto(f2.f2_q19_desglose_fondos) || sinDato}
*   **Estructura de costos**: ${texto(f2.f2_q20_estructura_costos) || sinDato}
*   **Fuentes de ingresos**: ${texto(f2.f2_q21_fuentes_ingresos) || sinDato}
*   **Cofinanciación**: ${texto(f2.f2_q22_cofinanciacion) || sinDato}

---
*Serving Proyectos Estratégicos SAS · ${new Date().getFullYear()}*
`
}

/** Resumen que se guarda en resultado_agente_json, sin cifras inventadas. */
export function resumenDelMotor(
  estructura: EstructuraProyecto,
  revision: { porcentaje: number },
  resultado: { avisos: string[]; preguntasDejadas: number },
) {
  return {
    origen_estructura: estructura.origen,
    causas_directas: estructura.causas.length,
    causas_indirectas: estructura.causas.filter((c) => c.indirecta).length,
    efectos_directos: estructura.efectos.length,
    efectos_indirectos: estructura.efectos.filter((e) => e.indirecto).length,
    productos_definidos: estructura.objetivos.filter((o) => o.producto).length,
    linea_base_con_fuente: estructura.lineaBase.length,
    coherencia_interna_porcentaje: revision.porcentaje,
    preguntas_dejadas_al_cliente: resultado.preguntasDejadas,
    pendientes: resultado.avisos,
  }
}
