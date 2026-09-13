/**
 * Motor de Nota de Concepto.
 *
 * La Nota de Concepto es un documento corto (1 a 3 páginas) que resume el
 * proyecto para que un financiador decida si invita a postular en detalle.
 * Es la "fase 1"; la formulación completa (el dossier de ~75-150 páginas que
 * arma el Motor 1) es la "fase 2".
 *
 * REGLA DE FONDO (decidida por el dueño): se entrega SIEMPRE, sin pago
 * aparte ni límite, junto con el documento completo del proyecto, en el
 * momento en que la estructuración queda lista (`listo_para_encaje`). No
 * depende de una convocatoria concreta todavía — cuando el Motor 3 encaje el
 * proyecto con una convocatoria real, esa pantalla puede pedir una nota
 * ajustada a esa convocatoria; esta es la nota general del proyecto.
 *
 * Sigue la misma filosofía que el Motor 1 (`motorEstructuracion.ts`): no se
 * inventa nada. La nota se arma ORDENANDO lo que el proyecto ya tiene en
 * `contenido_pasos_proyecto` — no se le vuelve a preguntar al cliente lo que
 * ya contestó. Si un tema no tiene con qué responderse, se dice así.
 */

import { callGemini } from '@/lib/gemini'
import { cifrasSinRespaldo } from '@/lib/motorEstructuracion'

export type TemaNotaConcepto =
  | 'tipo_de_proyecto'
  | 'problema_central'
  | 'poblacion_objetivo'
  | 'ubicacion_geografica'
  | 'solucion_propuesta'
  | 'vision_largo_plazo'
  | 'modelo_sostenibilidad'
  | 'impacto_esperado'
  | 'escalabilidad'
  | 'experiencia_equipo'
  | 'credibilidad_entidad'

export const TEMAS_NOTA_CONCEPTO: { clave: TemaNotaConcepto; titulo: string }[] = [
  { clave: 'tipo_de_proyecto', titulo: 'Tipo de proyecto' },
  { clave: 'problema_central', titulo: 'Problema central' },
  { clave: 'poblacion_objetivo', titulo: 'Población o mercado objetivo' },
  { clave: 'ubicacion_geografica', titulo: 'Ubicación geográfica' },
  { clave: 'solucion_propuesta', titulo: 'Solución propuesta' },
  { clave: 'vision_largo_plazo', titulo: 'Visión a largo plazo' },
  { clave: 'modelo_sostenibilidad', titulo: 'Modelo de sostenibilidad' },
  { clave: 'impacto_esperado', titulo: 'Impacto esperado' },
  { clave: 'escalabilidad', titulo: 'Escalabilidad' },
  { clave: 'experiencia_equipo', titulo: 'Experiencia del equipo' },
  { clave: 'credibilidad_entidad', titulo: 'Credibilidad de la entidad' },
]

export type ContenidoNotaConcepto = Record<TemaNotaConcepto, string>

export type ResultadoNotaConcepto = {
  ok: boolean
  notaId?: string
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

/**
 * Decide el idioma según el país/territorio del proyecto, no según una
 * convocatoria (esta nota todavía no apunta a ninguna en concreto).
 *
 * Colombia y el resto de Latinoamérica → solo español.
 * Cualquier otro caso → español e inglés técnico juntos.
 */
const PAISES_LATAM = [
  'colombia', 'méxico', 'mexico', 'argentina', 'chile', 'perú', 'peru', 'ecuador',
  'bolivia', 'venezuela', 'paraguay', 'uruguay', 'panamá', 'panama', 'costa rica',
  'guatemala', 'honduras', 'el salvador', 'nicaragua', 'república dominicana',
  'republica dominicana', 'cuba', 'puerto rico',
]

export function decidirIdioma(territorio: string): 'es' | 'es_en' {
  const t = texto(territorio).toLowerCase()
  if (!t) return 'es'
  const esLatam = PAISES_LATAM.some((p) => t.includes(p))
  return esLatam ? 'es' : 'es_en'
}

/* ==========================================================================
   Paso 1: leer todo lo que el proyecto ya tiene estructurado
   ========================================================================== */

async function leerContenidoEstructurado(
  supabase: any,
  proyectoId: string,
): Promise<{ nombreProyecto: string; territorio: string; textoCompleto: string } | null> {
  const { data: proyecto } = await supabase
    .from('proyectos_clientes_serving')
    .select('nombre_iniciativa, respuestas_fase1_json, dossier_markdown')
    .eq('id', proyectoId)
    .maybeSingle()

  if (!proyecto) return null

  const { data: contenido } = await supabase
    .from('contenido_pasos_proyecto')
    .select('id_paso, contenido')
    .eq('id_proyecto', proyectoId)

  const { data: pasos } = await supabase.from('pasos_estructuracion').select('id, nombre_paso')
  const mapaNombres = new Map((pasos || []).map((p: any) => [p.id, p.nombre_paso]))

  const textoPorPasos = (contenido || [])
    .map((c: any) => `--- ${mapaNombres.get(c.id_paso) || 'paso'} ---\n${c.contenido}`)
    .join('\n\n')

  // Si por algún motivo no hay contenido por pasos, se usa el dossier ya
  // armado como respaldo: mismo principio de "ordenar lo que ya existe".
  const textoCompleto = textoPorPasos.trim() || texto(proyecto.dossier_markdown)

  if (!textoCompleto) return null

  return {
    nombreProyecto: texto(proyecto.nombre_iniciativa) || 'Iniciativa sin nombre',
    territorio: texto(proyecto.respuestas_fase1_json?.q2_ubicacion),
    textoCompleto,
  }
}

/* ==========================================================================
   Paso 2: pedirle al modelo que ubique, tema por tema, la respuesta
   ========================================================================== */

function construirPrompt(nombreProyecto: string, textoCompleto: string): string {
  return `Eres un redactor especializado en notas de concepto para convocatorias de financiación y cooperación internacional.

Una Nota de Concepto es un documento corto (1 a 3 páginas) que presenta de forma clara y sintética una idea de proyecto, para que un financiador decida si invita a postular en detalle. NO es la formulación completa: es un resumen ejecutivo persuasivo.

Te entrego TODO el contenido que ya quedó estructurado de este proyecto. Tu trabajo es UBICAR, para cada uno de los once temas de abajo, la respuesta que ya está en ese contenido, y redactarla en un párrafo corto, coherente y persuasivo (3 a 6 frases). NO inventes nada que no esté respaldado en el contenido. Si un tema no tiene con qué responderse, devuelve el texto exacto "SIN INFORMACIÓN SUFICIENTE" para ese tema — no lo rellenes con generalidades.

PROYECTO: ${nombreProyecto}

CONTENIDO YA ESTRUCTURADO DEL PROYECTO:
${textoCompleto.slice(0, 40000)}

DEVUELVE ÚNICAMENTE UN JSON con esta forma exacta, sin explicaciones y sin marcas de código:
{
  "tipo_de_proyecto": "...",
  "problema_central": "...",
  "poblacion_objetivo": "...",
  "ubicacion_geografica": "...",
  "solucion_propuesta": "...",
  "vision_largo_plazo": "...",
  "modelo_sostenibilidad": "...",
  "impacto_esperado": "...",
  "escalabilidad": "...",
  "experiencia_equipo": "...",
  "credibilidad_entidad": "..."
}`
}

function normalizar(datos: any, referencia: string): { contenido: ContenidoNotaConcepto; temasFaltantes: string[] } {
  const contenido = {} as ContenidoNotaConcepto
  const temasFaltantes: string[] = []

  for (const { clave, titulo } of TEMAS_NOTA_CONCEPTO) {
    const bruto = texto(datos?.[clave])
    if (!bruto || bruto.toUpperCase().includes('SIN INFORMACIÓN')) {
      contenido[clave] = ''
      temasFaltantes.push(titulo)
      continue
    }
    // Misma red de seguridad que el Motor 1: si trae cifras que no están en
    // el contenido de origen, se descarta ese párrafo entero.
    const cifrasDudosas = cifrasSinRespaldo(bruto, referencia)
    if (cifrasDudosas.length > 0) {
      contenido[clave] = ''
      temasFaltantes.push(titulo)
      continue
    }
    contenido[clave] = bruto
  }

  return { contenido, temasFaltantes }
}

/* ==========================================================================
   Paso 3: traducir a inglés técnico cuando el proyecto no es de Latam
   ========================================================================== */

async function traducirAIngles(contenido: ContenidoNotaConcepto): Promise<ContenidoNotaConcepto | null> {
  const prompt = `Traduce a inglés técnico, en el mismo tono formal, cada uno de estos campos de una nota de concepto de un proyecto de financiación. No agregues nada que no esté en el original. Devuelve ÚNICAMENTE un JSON con las mismas claves:

${JSON.stringify(contenido, null, 2)}`

  try {
    const respuesta = await callGemini(prompt)
    const datos = interpretarJson(respuesta)
    if (!datos) return null
    const traducido = {} as ContenidoNotaConcepto
    for (const { clave } of TEMAS_NOTA_CONCEPTO) {
      traducido[clave] = texto(datos[clave])
    }
    return traducido
  } catch (error) {
    console.error('[Nota de Concepto] No se pudo traducir:', error)
    return null
  }
}

/* ==========================================================================
   Paso 4: armar el documento final en Markdown
   ========================================================================== */

function armarDocumento(nombreProyecto: string, contenido: ContenidoNotaConcepto, idioma: 'es' | 'en'): string {
  const titulo = idioma === 'en' ? 'Concept Note' : 'Nota de Concepto'
  const pendiente = idioma === 'en' ? '_Pending — not enough information yet._' : '_Pendiente — todavía no hay información suficiente._'

  const titulosEn: Record<TemaNotaConcepto, string> = {
    tipo_de_proyecto: 'Type of project',
    problema_central: 'Core problem',
    poblacion_objetivo: 'Target population / market',
    ubicacion_geografica: 'Geographic location',
    solucion_propuesta: 'Proposed solution',
    vision_largo_plazo: 'Long-term vision',
    modelo_sostenibilidad: 'Sustainability model',
    impacto_esperado: 'Expected impact',
    escalabilidad: 'Scalability',
    experiencia_equipo: 'Team experience',
    credibilidad_entidad: 'Credibility of the organization',
  }

  const secciones = TEMAS_NOTA_CONCEPTO.map(({ clave, titulo: tituloEs }) => {
    const encabezado = idioma === 'en' ? titulosEn[clave] : tituloEs
    const cuerpo = contenido[clave] || pendiente
    return `### ${encabezado}\n\n${cuerpo}`
  }).join('\n\n')

  return `# ${titulo}\n\n## ${nombreProyecto}\n\n${secciones}\n\n---\n*Serving Proyectos Estratégicos SAS · ${new Date().getFullYear()}*\n`
}

/* ==========================================================================
   Función principal
   ========================================================================== */

/**
 * Genera la Nota de Concepto de un proyecto y la guarda. Se llama sola,
 * automáticamente, cuando la estructuración queda lista — no hace falta que
 * nadie la pida a mano.
 */
export async function generarNotaConcepto(supabase: any, proyectoId: string): Promise<ResultadoNotaConcepto> {
  const base = await leerContenidoEstructurado(supabase, proyectoId)
  if (!base) {
    return { ok: false, mensaje: 'El proyecto todavía no tiene contenido estructurado: no hay de dónde sacar la nota.' }
  }

  let datos: any = null
  try {
    datos = interpretarJson(await callGemini(construirPrompt(base.nombreProyecto, base.textoCompleto)))
  } catch (error) {
    console.error('[Nota de Concepto] No se pudo consultar el modelo:', error)
    return { ok: false, mensaje: 'No se pudo generar la nota de concepto: el modelo no respondió.' }
  }
  if (!datos) return { ok: false, mensaje: 'El modelo no devolvió una respuesta interpretable.' }

  const { contenido, temasFaltantes } = normalizar(datos, base.textoCompleto.toLowerCase())

  const idioma = decidirIdioma(base.territorio)
  const documentoEs = armarDocumento(base.nombreProyecto, contenido, 'es')

  let documentoEn: string | null = null
  if (idioma === 'es_en') {
    const traducido = await traducirAIngles(contenido)
    if (traducido) documentoEn = armarDocumento(base.nombreProyecto, traducido, 'en')
  }

  const { data, error } = await supabase
    .from('notas_concepto')
    .insert({
      proyecto_id: proyectoId,
      idioma: documentoEn ? 'es_en' : 'es',
      contenido_es: documentoEs,
      contenido_en: documentoEn,
      temas_faltantes: temasFaltantes,
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('[Nota de Concepto] No se pudo guardar:', error)
    return { ok: false, mensaje: 'No se pudo guardar la nota de concepto.' }
  }

  return { ok: true, notaId: data.id, mensaje: 'Nota de concepto generada.' }
}
