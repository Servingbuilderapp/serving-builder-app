import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { listarCorreosDeAlertas } from '@/lib/gmailAlertas'
import { guardarEnBiblioteca, type ConvocatoriaEncontrada } from '@/lib/bibliotecaConvocatorias'
import { motorAutorizado } from '@/lib/candadoMotores'

/**
 * CENTINELA — lectura de Alertas de Google por Gmail.
 *
 * Este es el "camino simple" del Motor 2, decidido para no depender de la
 * cuota de búsqueda de Gemini: en vez de que Gemini busque convocatorias por
 * su cuenta, las Alertas de Google (ya configuradas, gratis) le avisan por
 * correo a servingbuilderapp@gmail.com, y este proceso:
 *
 *   1. Lee esos correos con la API de Gmail (sin gastar cuota de Gemini)
 *   2. Saca los enlaces reales de convocatorias que traen
 *   3. Le pide a Gemini que analice cada enlace nuevo (prompt "Análisis TDR")
 *   4. Guarda el resultado en la misma biblioteca de convocatorias que ya
 *      usa el Motor 2 de siempre — así el Motor 3 (encaje) no tiene que
 *      saber de dónde vino cada ficha.
 *
 * No reemplaza el Motor 2 existente (/api/buscar-convocatorias): corre por
 * su lado, como una fuente más de convocatorias para la misma biblioteca.
 */

export const maxDuration = 300

const MODELOS_GEMINI = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.5-flash']

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const PROMPT_ANALISIS_TDR = `
Actúa como experto en grants, subvenciones, cooperación internacional y formulación de proyectos.

Analiza estratégicamente la convocatoria de este enlace: {ENLACE}
Si la página enlaza un documento de términos de referencia (TDR), analízalo también.

Identifica y resume: objetivo de la convocatoria, problemas que busca resolver, temáticas
financiables, beneficiarios, entidades elegibles, países o territorios, monto mínimo y máximo,
porcentaje de financiación, contrapartida, duración, gastos elegibles y no elegibles, requisitos
técnicos, jurídicos y financieros, documentos obligatorios, criterios de evaluación, puntajes,
causales de rechazo, fechas clave y proceso de postulación.

No inventes información: si un dato no aparece en la página ni en el TDR, dilo en
"informacion_faltante" en vez de inventarlo. USA LA HERRAMIENTA DE BÚSQUEDA WEB para verificar
cada dato antes de reportarlo.

Responde ÚNICAMENTE con un JSON válido, sin texto antes ni después, con este formato exacto:
{
  "nombre": "...",
  "entidad": "...",
  "tipo": "abierta actualmente | próxima apertura | recurrente | permanente | periódica | especial | cerrada pero reutilizable | futura | pendiente de nueva edición",
  "estado_convocatoria": "...",
  "fecha_cierre": "...",
  "monto": "...",
  "beneficiarios": "...",
  "territorio": "...",
  "linea_tematica": "...",
  "requisitos": "...",
  "mecanismo_postulacion": "...",
  "terminos_referencia": "...",
  "fuente_oficial": "URL real y verificable",
  "alertas": "...",
  "informacion_faltante": "...",
  "tipo_financiador": "una sola de la lista del mapa",
  "ambito": "una sola de la lista del mapa"
}

EL MAPA DE LA FINANCIACIÓN (obligatorio).

"tipo_financiador" — quién pone la plata. Escoge UNA:
  estado_nacional          ministerios, agencias y fondos del gobierno nacional
  estado_local             gobernaciones y alcaldías
  cooperacion_bilateral    embajadas y agencias de un país (USAID, GIZ, AECID, JICA)
  cooperacion_multilateral BID, Banco Mundial, CAF, Unión Europea
  onu                      PNUD, UNICEF, FAO, OIT, ONU Mujeres, UNESCO
  banca_desarrollo         Bancóldex, Findeter, IFC, KfW
  filantropia_privada      fundaciones familiares o independientes
  filantropia_corporativa  fundaciones de empresas
  academia                 universidades y centros de investigación
  empresa_privada          premios de empresa, aceleradoras, fondos de inversión
  ong                      corporaciones, federaciones y asociaciones sin ánimo de lucro
  por_clasificar           úsalo si de verdad no se puede saber; no adivines

"ambito" — hasta dónde llega. Escoge UNA: municipal, departamental, nacional, regional
(América Latina y el Caribe), internacional, o por_definir si no se puede saber.
`

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

type RespuestaGemini = {
  candidates?: { content?: { parts?: { text?: string }[] } }[]
  error?: { message?: string }
}

async function llamarGeminiConReintentos(
  apiKey: string,
  body: unknown,
  maxIntentos = MODELOS_GEMINI.length,
): Promise<{ ok: boolean; data: RespuestaGemini }> {
  let ultimoResultado: { ok: boolean; data: RespuestaGemini } = { ok: false, data: {} }

  for (let intento = 1; intento <= maxIntentos; intento++) {
    const respuesta = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODELOS_GEMINI[Math.min(intento - 1, MODELOS_GEMINI.length - 1)]}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    )

    const data = await respuesta.json()

    if (respuesta.ok) return { ok: true, data }

    ultimoResultado = { ok: false, data }

    const esErrorTemporal = respuesta.status === 503 || respuesta.status === 429
    if (esErrorTemporal && intento < maxIntentos) {
      await esperar(intento * 5000)
      continue
    }

    return ultimoResultado
  }

  return ultimoResultado
}

async function analizarEnlace(apiKey: string, enlace: string): Promise<ConvocatoriaEncontrada | null> {
  const cuerpoSolicitud = {
    contents: [{ role: 'user', parts: [{ text: PROMPT_ANALISIS_TDR.replace('{ENLACE}', enlace) }] }],
    tools: [{ google_search: {} }],
  }

  const { ok, data } = await llamarGeminiConReintentos(apiKey, cuerpoSolicitud)

  if (!ok) {
    console.error('[Centinela Gmail] Gemini no pudo analizar el enlace:', enlace, JSON.stringify(data))
    return null
  }

  const partesTexto = (data.candidates?.[0]?.content?.parts || [])
    .map((p) => p.text || '')
    .join('')
  const jsonLimpio = partesTexto.replace(/```json|```/g, '').trim()

  try {
    const resultado = JSON.parse(jsonLimpio)
    return { ...resultado, fuente_oficial: resultado.fuente_oficial || enlace } as ConvocatoriaEncontrada
  } catch {
    console.error('[Centinela Gmail] La respuesta de Gemini no fue JSON válido para', enlace, partesTexto.slice(0, 500))
    return null
  }
}

async function ejecutarLecturaDeAlertas() {
  const apiKeyGemini = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY
  if (!apiKeyGemini) {
    return { status: 500, body: { error: 'Falta configurar GEMINI_API_KEY en el servidor' } }
  }

  let correos
  try {
    correos = await listarCorreosDeAlertas()
  } catch (err: unknown) {
    console.error('[Centinela Gmail] Error leyendo Gmail:', err)
    const detalle = err instanceof Error ? err.message : String(err)
    return {
      status: 500,
      body: { error: 'No se pudo leer la bandeja de Gmail', detalle },
    }
  }

  if (correos.length === 0) {
    return {
      status: 200,
      body: { ok: true, correos_revisados: 0, correos_nuevos: 0, enlaces_analizados: 0, convocatorias_guardadas: 0 },
    }
  }

  // Cuáles de estos correos ya se leyeron en una corrida anterior, para no
  // volver a gastar cuota de Gemini analizando lo mismo otra vez.
  const idsCorreos = correos.map((c) => c.idMensaje)
  const { data: yaProcesados, error: errorLectura } = await supabase
    .from('centinela_correos_procesados')
    .select('id_mensaje_gmail')
    .in('id_mensaje_gmail', idsCorreos)

  if (errorLectura) {
    console.error('[Centinela Gmail] No se pudo leer la tabla de correos procesados:', errorLectura)
  }

  const idsYaProcesados = new Set(
    (yaProcesados || []).map((r: { id_mensaje_gmail: string }) => r.id_mensaje_gmail),
  )
  const correosNuevos = correos.filter((c) => !idsYaProcesados.has(c.idMensaje))

  // Enlaces únicos entre todos los correos nuevos: si dos alertas distintas
  // avisaron la misma convocatoria, se analiza una sola vez.
  const enlacesUnicos = [...new Set(correosNuevos.flatMap((c) => c.enlaces))]

  const encontradas: ConvocatoriaEncontrada[] = []
  for (const enlace of enlacesUnicos) {
    const resultado = await analizarEnlace(apiKeyGemini, enlace)
    if (resultado) encontradas.push(resultado)
  }

  let convocatoriasGuardadas = 0
  if (encontradas.length > 0) {
    const mapaGuardadas = await guardarEnBiblioteca(supabase, encontradas)
    convocatoriasGuardadas = mapaGuardadas.size
  }

  // Se marcan como procesados aunque el correo no haya traído enlaces, o
  // el análisis haya fallado: la alerta ya se revisó, no hay que repetirla.
  if (correosNuevos.length > 0) {
    const { error: errorInsertar } = await supabase.from('centinela_correos_procesados').insert(
      correosNuevos.map((c) => ({
        id_mensaje_gmail: c.idMensaje,
        asunto: c.asunto,
        enlaces_encontrados: c.enlaces.length,
      })),
    )
    if (errorInsertar) {
      console.error('[Centinela Gmail] No se pudo registrar los correos como procesados:', errorInsertar)
    }
  }

  return {
    status: 200,
    body: {
      ok: true,
      correos_revisados: correos.length,
      correos_nuevos: correosNuevos.length,
      enlaces_analizados: enlacesUnicos.length,
      convocatorias_guardadas: convocatoriasGuardadas,
    },
  }
}

// Disparo manual, útil para pruebas: visita /api/centinela/leer-alertas
// Disparo automático: Vercel Cron llama a esta misma ruta por GET.
export async function GET(req: NextRequest) {
  if (!(await motorAutorizado(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const resultado = await ejecutarLecturaDeAlertas()
  return NextResponse.json(resultado.body, { status: resultado.status })
}

export async function POST(req: NextRequest) {
  if (!(await motorAutorizado(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const resultado = await ejecutarLecturaDeAlertas()
  return NextResponse.json(resultado.body, { status: resultado.status })
}
