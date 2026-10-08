import { callGemini } from '@/lib/gemini'
import { cifrasSinRespaldo } from '@/lib/motorEstructuracion'
import { TEMAS_NOTA_CONCEPTO, type ContenidoNotaConcepto, type TemaNotaConcepto } from '@/lib/motorNotaConcepto'

/**
 * Nota de Concepto para MIEMBROS (membresía).
 *
 * A diferencia de la nota que arma el Motor 1 (que parte de un proyecto ya
 * estructurado y pagado), aquí el miembro responde un formulario corto con sus
 * propias palabras y la IA SOLO redacta y ordena lo que él escribió.
 * No agrega datos, cifras ni logros que el miembro no haya dicho.
 */

export type RespuestasNota = Record<TemaNotaConcepto, string>
export type IdiomaNota = 'es' | 'es_en'

export type ResultadoNotaMiembro = {
  ok: boolean
  mensaje: string
  documento?: string
  contenido?: ContenidoNotaConcepto
  faltantes?: string[]
}

const TITULOS_EN: Record<TemaNotaConcepto, string> = {
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

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : ''
}

function interpretarJson(bruto: string): Record<string, unknown> | null {
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

function construirPrompt(nombreProyecto: string, respuestas: RespuestasNota): string {
  const bloque = TEMAS_NOTA_CONCEPTO.map(
    ({ clave, titulo }) => `- ${titulo}: ${texto(respuestas[clave]) || '(sin respuesta)'}`,
  ).join('\n')

  return `Eres un redactor especializado en notas de concepto para convocatorias de financiación y cooperación internacional.

Una Nota de Concepto es un documento corto (1 a 3 páginas) que presenta de forma clara y sintética una idea de proyecto, para que un financiador decida si invita a postular en detalle.

Una persona respondió un formulario sobre su idea. Tu trabajo es redactar, para cada uno de los once temas, un párrafo corto, coherente y persuasivo (3 a 6 frases) usando ÚNICAMENTE lo que ella escribió. REGLAS:
- NO inventes datos, cifras, porcentajes, logros, aliados ni lugares que ella no haya dicho.
- Si un tema dice "(sin respuesta)" o lo escrito no alcanza para un párrafo, devuelve el texto exacto "SIN INFORMACIÓN SUFICIENTE" para ese tema.
- Mejora la redacción y el orden, pero conserva el sentido de lo que dijo.

PROYECTO: ${nombreProyecto}

RESPUESTAS DE LA PERSONA:
${bloque}

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

async function traducirAIngles(contenido: ContenidoNotaConcepto): Promise<ContenidoNotaConcepto | null> {
  const prompt = `Traduce a inglés técnico, en el mismo tono formal, cada uno de estos campos de una nota de concepto de un proyecto de financiación. No agregues nada que no esté en el original. Si un campo está vacío, déjalo vacío. Devuelve ÚNICAMENTE un JSON con las mismas claves:

${JSON.stringify(contenido, null, 2)}`
  try {
    const datos = interpretarJson(await callGemini(prompt))
    if (!datos) return null
    const traducido = {} as ContenidoNotaConcepto
    for (const { clave } of TEMAS_NOTA_CONCEPTO) traducido[clave] = texto(datos[clave])
    return traducido
  } catch (error) {
    console.error('[Nota miembro] No se pudo traducir:', error)
    return null
  }
}

function armarSeccion(contenido: ContenidoNotaConcepto, idioma: 'es' | 'en'): string {
  const pendiente = idioma === 'en' ? '_Pending — not enough information yet._' : '_Pendiente — falta información._'
  return TEMAS_NOTA_CONCEPTO.map(({ clave, titulo }) => {
    const encabezado = idioma === 'en' ? TITULOS_EN[clave] : titulo
    return `### ${encabezado}\n\n${contenido[clave] || pendiente}`
  }).join('\n\n')
}

export async function generarNotaDesdeRespuestas(
  nombreProyecto: string,
  respuestas: RespuestasNota,
  idioma: IdiomaNota,
): Promise<ResultadoNotaMiembro> {
  let datos: Record<string, unknown> | null = null
  try {
    datos = interpretarJson(await callGemini(construirPrompt(nombreProyecto, respuestas)))
  } catch (error) {
    console.error('[Nota miembro] Falló la IA:', error)
    return { ok: false, mensaje: 'La IA no pudo redactar la nota en este momento. Intenta de nuevo en unos minutos.' }
  }
  if (!datos) return { ok: false, mensaje: 'La IA devolvió una respuesta que no se pudo leer. Intenta de nuevo.' }

  const referencia = TEMAS_NOTA_CONCEPTO.map(({ clave }) => texto(respuestas[clave])).join('\n') + '\n' + nombreProyecto
  const contenido = {} as ContenidoNotaConcepto
  const faltantes: string[] = []
  for (const { clave, titulo } of TEMAS_NOTA_CONCEPTO) {
    const bruto = texto(datos[clave])
    // Si el párrafo trae cifras que la persona no escribió, se descarta.
    if (!bruto || bruto.toUpperCase().includes('SIN INFORMACIÓN') || cifrasSinRespaldo(bruto, referencia).length > 0) {
      contenido[clave] = ''
      faltantes.push(titulo)
    } else {
      contenido[clave] = bruto
    }
  }

  if (faltantes.length === TEMAS_NOTA_CONCEPTO.length) {
    return { ok: false, mensaje: 'Con lo escrito no alcanza para armar la nota. Cuéntanos un poco más en cada pregunta.' }
  }

  let documento = `# Nota de Concepto\n\n## ${nombreProyecto}\n\n${armarSeccion(contenido, 'es')}`
  if (idioma === 'es_en') {
    const ingles = await traducirAIngles(contenido)
    if (ingles) documento += `\n\n---\n\n# Concept Note\n\n## ${nombreProyecto}\n\n${armarSeccion(ingles, 'en')}`
  }
  documento += `\n\n---\n*Serving Proyectos Estratégicos SAS · ${new Date().getFullYear()}*\n`

  return { ok: true, mensaje: 'Nota lista.', documento, contenido, faltantes }
}
