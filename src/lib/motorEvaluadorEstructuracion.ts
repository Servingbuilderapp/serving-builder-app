/**
 * Evaluador automático de estructuración.
 *
 * Después de que el Motor 1 deja un proyecto "listo para encaje" (completo y
 * sin preguntas críticas pendientes), este evaluador entra ANTES de disparar
 * el Motor 2. Compara el proyecto YA ESTRUCTURADO contra el documento
 * ORIGINAL que mandó el cliente, y decide si de verdad quedó bien hecho.
 *
 * Por qué existe: la decisión del 9 sep 2026 fue que nadie del equipo revisa
 * los proyectos manualmente — ni con 10 corriendo a la vez, ni con 40. Este
 * archivo es el reemplazo automático de esa revisión humana.
 *
 * Cómo decide:
 *   - Si el proyecto está bien calificado (por encima del umbral, sin
 *     hallazgos críticos): queda aprobado y el Motor 2 arranca solo.
 *   - Si encuentra un error puntual (territorio, objetivos, beneficiarios,
 *     etc.): NO avisa a una persona. Usa el mismo canal que ya existe para
 *     pedirle al cliente que lo aclare (`preguntas_pendientes_proyecto`, lo
 *     que el cliente ve en "Lo que me piden"). El proyecto se queda esperando
 *     esa respuesta — cuando el cliente la da, el Motor 1 vuelve a correr y
 *     este evaluador se vuelve a correr también.
 *
 * REGLA DE ORO, igual que en el resto de los motores: nada de inventar. Si el
 * modelo no puede leer el documento original o el proyecto estructurado está
 * vacío, el evaluador no aprueba nada — deja el proyecto en espera en vez de
 * adivinar que está bien.
 */

import { after } from 'next/server'
import mammoth from 'mammoth'
import { cabecerasInternas } from '@/lib/candadoMotores'

const BUCKET = 'documentos-proyectos'
const UMBRAL_APROBACION = 90

export type HallazgoEvaluacion = {
  categoria: string
  descripcion: string
  critico: boolean
  idPasoRelacionado: number | null
}

export type ResultadoEvaluacion = {
  puntaje: number
  veredicto: 'aprobado' | 'con_observaciones'
  hallazgos: HallazgoEvaluacion[]
}

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : ''
}

function enRango0a100(valor: unknown): number {
  const numero = Math.round(Number(valor))
  if (!Number.isFinite(numero) || numero < 0) return 0
  return Math.min(numero, 100)
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

function tipoDeArchivo(nombre: string): 'pdf' | 'imagen' | 'word' | null {
  const extension = nombre.split('.').pop()?.toLowerCase() || ''
  if (extension === 'pdf') return 'pdf'
  if (['jpg', 'jpeg', 'png'].includes(extension)) return 'imagen'
  if (['doc', 'docx'].includes(extension)) return 'word'
  return null
}

/**
 * Modelos de Gemini que sabe usar el evaluador, en el mismo orden de
 * preferencia que usa el Motor 1: si el primero está saturado (503/429), pasa
 * al siguiente en vez de dejar el proyecto sin evaluar.
 */
const MODELOS_GEMINI = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.5-flash']
const TOPE_POR_MODELO_MS = 80000

async function llamarGeminiConReintentos(apiKey: string, body: any): Promise<{ ok: boolean; data: any }> {
  let ultimoResultado: { ok: boolean; data: any } = {
    ok: false,
    data: { error: { message: 'Ningún modelo de Gemini pudo atender' } },
  }

  for (const modelo of MODELOS_GEMINI) {
    try {
      const respuesta = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(TOPE_POR_MODELO_MS),
        },
      )

      const data = await respuesta.json()
      if (respuesta.ok) return { ok: true, data }

      ultimoResultado = { ok: false, data }
      const esErrorTemporal = respuesta.status === 503 || respuesta.status === 429
      if (!esErrorTemporal) return ultimoResultado
    } catch {
      ultimoResultado = { ok: false, data: { error: { message: `El modelo ${modelo} no respondió a tiempo` } } }
    }
  }

  return ultimoResultado
}

/* ==========================================================================
   Leer el documento original del cliente (todos los que haya subido)
   ========================================================================== */

type PartePrompt = { text?: string; inlineData?: { mimeType: string; data: string } }

async function leerDocumentosOriginales(supabase: any, proyectoId: string): Promise<PartePrompt[]> {
  const { data: archivos } = await supabase.storage
    .from(BUCKET)
    .list(proyectoId, { limit: 100, sortBy: { column: 'created_at', order: 'asc' } })

  const documentos = (archivos || [])
    .filter((a: any) => a.name && a.name !== '.emptyFolderPlaceholder')
    .map((a: any) => ({ nombre: a.name, tipo: tipoDeArchivo(a.name) }))
    .filter((a: any) => a.tipo !== null)

  const partes: PartePrompt[] = []

  for (const documento of documentos) {
    const { data: archivo } = await supabase.storage.from(BUCKET).download(`${proyectoId}/${documento.nombre}`)
    if (!archivo) continue

    const buffer = Buffer.from(await archivo.arrayBuffer())

    if (documento.tipo === 'word') {
      const resultado = await mammoth.extractRawText({ buffer })
      partes.push({ text: `--- Documento original "${documento.nombre}" ---\n${resultado.value}` })
    } else {
      const mimeType = documento.tipo === 'imagen' ? 'image/jpeg' : 'application/pdf'
      partes.push({ text: `--- Documento original "${documento.nombre}" ---` })
      partes.push({ inlineData: { mimeType, data: buffer.toString('base64') } })
    }
  }

  return partes
}

/* ==========================================================================
   Leer el proyecto ya estructurado
   ========================================================================== */

type PasoEstructurado = { idPaso: number; nombrePaso: string; contenido: string }

async function leerProyectoEstructurado(supabase: any, proyectoId: string): Promise<PasoEstructurado[]> {
  const { data: pasos } = await supabase
    .from('pasos_estructuracion')
    .select('id, nombre_paso, orden_secuencia')
    .order('orden_secuencia')

  const { data: contenido } = await supabase
    .from('contenido_pasos_proyecto')
    .select('id_paso, contenido')
    .eq('id_proyecto', proyectoId)

  const contenidoPorPaso = new Map<number, string>((contenido || []).map((c: any) => [c.id_paso, c.contenido]))

  return (pasos || [])
    .map((p: any) => ({ idPaso: p.id, nombrePaso: p.nombre_paso, contenido: contenidoPorPaso.get(p.id) || '' }))
    .filter((p: PasoEstructurado) => p.contenido.length > 0)
}

/* ==========================================================================
   El prompt de comparación
   ========================================================================== */

function construirInstruccion(pasos: PasoEstructurado[]): string {
  const proyectoEstructuradoTexto = pasos
    .map((p) => `--- Paso ${p.idPaso}: ${p.nombrePaso} ---\n${p.contenido}`)
    .join('\n\n')

  return `Eres el EVALUADOR AUTOMÁTICO de estructuración del sistema de Arquitectura Digital de Proyectos.

Ya viste arriba el o los documentos ORIGINALES que el cliente subió. Ahora compáralos contra el PROYECTO YA ESTRUCTURADO que aparece abajo, que fue armado a partir de esos mismos documentos.

TU ÚNICO TRABAJO: decir qué tan fiel y coherente quedó la estructuración frente a lo que el cliente realmente dijo. NO evalúas si el proyecto es bueno o malo como idea — evalúas si el proceso de estructurarlo lo respetó.

REGLAS QUE NO PUEDES ROMPER:
1. Sé estricto. Un puntaje regalado deja pasar errores que después el cliente descubre tarde.
2. Busca específicamente: territorio equivocado o inventado, objetivos que no corresponden a lo que el cliente pidió, población o beneficiarios mal descritos, cifras que no están en el documento original, o cualquier dato que contradiga lo que el cliente escribió.
3. Si algo del proyecto estructurado simplemente completa un vacío razonable (el cliente no dio ese dato y quedó marcado como pendiente), eso NO es un error — no lo reportes como hallazgo.
4. Solo reporta hallazgos cuando haya una diferencia real y verificable contra el documento original. No inventes dudas por inventar.

PROYECTO YA ESTRUCTURADO:
${proyectoEstructuradoTexto || '(sin contenido estructurado todavía)'}

Para cada hallazgo que reportes, indica a cuál de estos pasos pertenece (usa el número exacto, o null si no aplica a uno en concreto):
${pasos.map((p) => `- ${p.idPaso}: ${p.nombrePaso}`).join('\n') || '(sin pasos con contenido)'}

DEVUELVE ÚNICAMENTE UN JSON, sin explicaciones y sin marcas de código:
{
  "puntaje": 0,
  "hallazgos": [
    { "categoria": "territorio|objetivos|beneficiarios|cifras|otro", "descripcion": "qué está mal y por qué, en una frase clara para el cliente", "critico": true, "id_paso_relacionado": 3 }
  ]
}

El puntaje va de 0 a 100: 100 significa que la estructuración es completamente fiel al documento original. Un hallazgo "critico": true es uno que el cliente debe aclarar antes de seguir; "critico": false es una observación menor que no bloquea nada.`
}

/* ==========================================================================
   Correr la evaluación completa y guardarla
   ========================================================================== */

export type ResultadoCorridaEvaluador = {
  ok: boolean
  aprobado?: boolean
  puntaje?: number
  mensaje: string
}

/**
 * Corre el evaluador para un proyecto, guarda el resultado, y — según lo que
 * encuentre — deja el proyecto aprobado (y dispara el Motor 2) o le pide al
 * cliente que aclare un punto puntual (usando el canal que ya existe).
 *
 * Se llama desde el Motor 1, en segundo plano, cada vez que el proyecto llega
 * a "listo para encaje" (completo y sin preguntas críticas de estructuración
 * pendientes).
 */
export async function correrEvaluadorEstructuracion(
  supabase: any,
  proyectoId: string,
  origen: string,
): Promise<ResultadoCorridaEvaluador> {
  const apiKeyGemini = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY
  if (!apiKeyGemini) return { ok: false, mensaje: 'Falta configurar GEMINI_API_KEY.' }

  const pasos = await leerProyectoEstructurado(supabase, proyectoId)
  if (pasos.length === 0) {
    return { ok: false, mensaje: 'El proyecto todavía no tiene contenido estructurado para evaluar.' }
  }

  const partesDocumentos = await leerDocumentosOriginales(supabase, proyectoId)
  if (partesDocumentos.length === 0) {
    return { ok: false, mensaje: 'No se encontró el documento original del cliente para comparar.' }
  }

  const { data: anterior } = await supabase
    .from('evaluaciones_estructuracion')
    .select('id, corrida')
    .eq('proyecto_id', proyectoId)
    .order('corrida', { ascending: false })
    .limit(1)
    .maybeSingle()

  const corrida = anterior ? (anterior.corrida || 1) + 1 : 1

  const cuerpoSolicitud = {
    contents: [
      {
        role: 'user',
        parts: [...partesDocumentos, { text: construirInstruccion(pasos) }],
      },
    ],
  }

  const { ok: geminiOk, data: dataGemini } = await llamarGeminiConReintentos(apiKeyGemini, cuerpoSolicitud)
  if (!geminiOk) {
    console.error('[Evaluador de estructuración] No se pudo consultar el modelo:', JSON.stringify(dataGemini))
    return { ok: false, mensaje: 'No se pudo consultar el modelo. Se reintentará en la próxima corrida del Motor 1.' }
  }

  const textoRespuesta = dataGemini.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const datos = interpretarJson(textoRespuesta)
  if (!datos) {
    console.error('[Evaluador de estructuración] Respuesta sin JSON válido:', textoRespuesta.slice(0, 500))
    return { ok: false, mensaje: 'El modelo no devolvió un resultado interpretable.' }
  }

  const puntaje = enRango0a100(datos.puntaje)

  const idsValidos = new Set(pasos.map((p) => p.idPaso))
  const hallazgos: HallazgoEvaluacion[] = (Array.isArray(datos.hallazgos) ? datos.hallazgos : [])
    .slice(0, 20)
    .map((h: any) => ({
      categoria: texto(h?.categoria) || 'otro',
      descripcion: texto(h?.descripcion),
      critico: h?.critico === true,
      idPasoRelacionado: idsValidos.has(Number(h?.id_paso_relacionado)) ? Number(h.id_paso_relacionado) : null,
    }))
    .filter((h: HallazgoEvaluacion) => h.descripcion.length > 3)

  const hayHallazgosCriticos = hallazgos.some((h) => h.critico)
  const aprobado = puntaje >= UMBRAL_APROBACION && !hayHallazgosCriticos
  const veredicto: ResultadoEvaluacion['veredicto'] = aprobado ? 'aprobado' : 'con_observaciones'

  const { error: errorGuardado } = await supabase.from('evaluaciones_estructuracion').insert({
    proyecto_id: proyectoId,
    corrida,
    puntaje,
    veredicto,
    hallazgos_json: hallazgos,
  })
  if (errorGuardado) {
    console.error('[Evaluador de estructuración] No se pudo guardar la evaluación:', errorGuardado)
  }

  // Los hallazgos críticos se convierten en preguntas para el cliente, por el
  // mismo canal que ya existe — nunca en una tarea para una persona del equipo.
  for (const hallazgo of hallazgos.filter((h) => h.critico)) {
    const idPaso = hallazgo.idPasoRelacionado ?? pasos[0].idPaso

    const { data: existente } = await supabase
      .from('preguntas_pendientes_proyecto')
      .select('id')
      .eq('id_proyecto', proyectoId)
      .eq('id_paso', idPaso)
      .eq('respondida', false)
      .limit(1)

    if (!existente || existente.length === 0) {
      await supabase.from('preguntas_pendientes_proyecto').insert({
        id_proyecto: proyectoId,
        id_paso: idPaso,
        pregunta: `El evaluador automático encontró algo para confirmar: ${hallazgo.descripcion}`,
        critico: true,
      })
    }
  }

  await supabase.from('proyectos_clientes_serving').update({ evaluacion_aprobada: aprobado }).eq('id', proyectoId)

  if (aprobado) {
    after(async () => {
      try {
        await fetch(`${origen}/api/buscar-convocatorias`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...cabecerasInternas() },
          body: JSON.stringify({ id_proyecto: proyectoId }),
        })
      } catch (e) {
        console.error('Error disparando Motor 2 desde el evaluador de estructuración:', e)
      }
    })
  }

  return {
    ok: true,
    aprobado,
    puntaje,
    mensaje: aprobado
      ? `Evaluación ${puntaje}/100: aprobado, el Motor 2 arranca solo.`
      : `Evaluación ${puntaje}/100: quedaron ${hallazgos.filter((h) => h.critico).length} punto(s) por aclarar con el cliente.`,
  }
}
