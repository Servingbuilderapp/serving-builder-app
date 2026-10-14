import { NextRequest, NextResponse } from 'next/server'
import { urlGemini, fetchGemini } from '@/lib/geminiEndpoint'
import { createClient } from '@supabase/supabase-js'
import { listarBoletines, type CorreoBoletin } from '@/lib/gmailBoletines'
import { guardarEnBiblioteca, type ConvocatoriaEncontrada } from '@/lib/bibliotecaConvocatorias'
import { motorAutorizado } from '@/lib/candadoMotores'

/**
 * CENTINELA — lectura de BOLETINES por Gmail.
 *
 * Hermano de /api/centinela/leer-alertas. Las Alertas de Google traen enlaces
 * sueltos; los boletines traen el texto de varias convocatorias en un solo
 * correo. Este proceso:
 *
 *   1. Lee los boletines nuevos de la bandeja (solo lectura)
 *   2. Le pide a Gemini UNA vez por boletín que saque las convocatorias que
 *      menciona, SIN inventar nada que el boletín no diga
 *   3. Guarda lo encontrado en la misma biblioteca de convocatorias
 *   4. Marca el correo como procesado para no gastar cuota dos veces
 *
 * Por corrida se leen como máximo 12 boletines nuevos, para no pasarse del
 * tiempo permitido. Lo que quede pendiente se lee en la siguiente corrida.
 */

export const maxDuration = 300

const MAX_BOLETINES_POR_CORRIDA = 12
const MAX_CARACTERES_POR_BOLETIN = 30000
const MODELOS_GEMINI = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.5-flash']

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const PROMPT_BOLETIN = `
Actúa como experto en grants, subvenciones, cooperación internacional y formulación de proyectos.

A continuación está el texto de un boletín recibido por correo. Cada enlace aparece escrito
como "texto (url)". Saca ÚNICAMENTE las convocatorias, fondos, becas, premios o
subvenciones que el boletín menciona. Ignora publicidad, noticias, artículos de opinión,
cursos de pago y avisos del sistema.

Reglas:
- NO inventes datos. Si el boletín no dice algo (monto, fecha de cierre, requisitos),
  déjalo vacío y anótalo en "informacion_faltante".
- "fuente_oficial" debe ser un enlace que aparezca en el boletín para esa convocatoria.
  Si no hay ninguno, déjalo vacío.
- Si el boletín no menciona ninguna convocatoria, responde exactamente: []

Responde ÚNICAMENTE con un JSON válido (una lista), sin texto antes ni después, así:
[
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
    "fuente_oficial": "...",
    "alertas": "...",
    "informacion_faltante": "...",
    "tipo_financiador": "una sola de la lista del mapa",
    "ambito": "una sola de la lista del mapa"
  }
]

EL MAPA DE LA FINANCIACIÓN (obligatorio).

"tipo_financiador" — quién pone la plata. Escoge UNA:
  estado_nacional, estado_local, cooperacion_bilateral, cooperacion_multilateral, onu,
  banca_desarrollo, filantropia_privada, filantropia_corporativa, academia,
  empresa_privada, ong, por_clasificar (si de verdad no se puede saber; no adivines)

"ambito" — hasta dónde llega. Escoge UNA: municipal, departamental, nacional, regional
(América Latina y el Caribe), internacional, o por_definir si no se puede saber.

BOLETÍN
Asunto: {ASUNTO}
De: {REMITENTE}
Fecha: {FECHA}

{TEXTO}
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
    const respuesta = await fetchGemini(
      urlGemini(MODELOS_GEMINI[Math.min(intento - 1, MODELOS_GEMINI.length - 1)], apiKey),
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

/** Devuelve las convocatorias del boletín, o null si Gemini falló (para reintentar luego). */
async function extraerConvocatorias(
  apiKey: string,
  boletin: CorreoBoletin,
): Promise<ConvocatoriaEncontrada[] | null> {
  const prompt = PROMPT_BOLETIN.replace('{ASUNTO}', boletin.asunto)
    .replace('{REMITENTE}', boletin.remitente)
    .replace('{FECHA}', boletin.fecha)
    .replace('{TEXTO}', boletin.texto.slice(0, MAX_CARACTERES_POR_BOLETIN))

  const { ok, data } = await llamarGeminiConReintentos(apiKey, {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  })

  if (!ok) {
    console.error('[Centinela Boletines] Gemini no pudo leer el boletín:', boletin.asunto, JSON.stringify(data))
    return null
  }

  const partesTexto = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('')
  const jsonLimpio = partesTexto.replace(/```json|```/g, '').trim()

  try {
    const lista = JSON.parse(jsonLimpio)
    if (!Array.isArray(lista)) return []
    return (lista as ConvocatoriaEncontrada[]).filter((c) => c && typeof c === 'object' && c.nombre)
  } catch {
    console.error('[Centinela Boletines] Respuesta no válida para', boletin.asunto, partesTexto.slice(0, 300))
    return null
  }
}

/**
 * Modo diagnóstico: /api/centinela/leer-boletines?diagnostico=1&pagina=0
 * Lee los boletines de esa página (12 por página), muestra qué vio en cada
 * uno y NO guarda nada ni los marca como leídos.
 */
async function ejecutarLecturaDeBoletines(diagnostico = false, pagina = 0) {
  const apiKeyGemini = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY
  if (!apiKeyGemini) {
    return { status: 500, body: { error: 'Falta configurar GEMINI_API_KEY en el servidor' } }
  }

  // Cuáles de estos correos ya se leyeron antes (misma tabla que usa leer-alertas).
  const yaProcesados = async (ids: string[]): Promise<Set<string>> => {
    if (diagnostico) return new Set<string>()
    const vistos = new Set<string>()
    for (let i = 0; i < ids.length; i += 100) {
      const { data, error } = await supabase
        .from('centinela_correos_procesados')
        .select('id_mensaje_gmail')
        .in('id_mensaje_gmail', ids.slice(i, i + 100))
      if (error) {
        console.error('[Centinela Boletines] No se pudo leer la tabla de correos procesados:', error)
        continue
      }
      for (const fila of (data || []) as { id_mensaje_gmail: string }[]) vistos.add(fila.id_mensaje_gmail)
    }
    return vistos
  }

  let lectura
  try {
    lectura = await listarBoletines(yaProcesados, MAX_BOLETINES_POR_CORRIDA, diagnostico ? pagina * MAX_BOLETINES_POR_CORRIDA : 0)
  } catch (err: unknown) {
    console.error('[Centinela Boletines] Error leyendo Gmail:', err)
    const detalle = err instanceof Error ? err.message : String(err)
    return { status: 500, body: { error: 'No se pudo leer la bandeja de Gmail', detalle } }
  }

  if (diagnostico) {
    const detalle = []
    for (const b of lectura.nuevos) {
      const r = await extraerConvocatorias(apiKeyGemini, b)
      detalle.push({
        asunto: b.asunto.slice(0, 90),
        de: b.remitente.slice(0, 60),
        caracteres_de_texto: b.texto.length,
        enlaces: b.enlaces,
        convocatorias: r === null ? 'FALLO' : r.length,
        muestra_del_texto: b.texto.slice(0, 160),
      })
    }
    return { status: 200, body: { diagnostico: true, pagina, correos_en_bandeja: lectura.revisados, detalle } }
  }

  const encontradas: ConvocatoriaEncontrada[] = []
  const procesados: CorreoBoletin[] = []
  let conFallo = 0

  for (const boletin of lectura.nuevos) {
    const resultado = await extraerConvocatorias(apiKeyGemini, boletin)
    if (resultado === null) {
      // Falló Gemini: NO se marca como procesado, se reintenta en la próxima corrida.
      conFallo++
      continue
    }
    encontradas.push(...resultado)
    procesados.push(boletin)
  }

  let convocatoriasGuardadas = 0
  if (encontradas.length > 0) {
    const mapaGuardadas = await guardarEnBiblioteca(supabase, encontradas)
    convocatoriasGuardadas = mapaGuardadas.size
  }

  if (procesados.length > 0) {
    const { error: errorInsertar } = await supabase.from('centinela_correos_procesados').insert(
      procesados.map((c) => ({
        id_mensaje_gmail: c.idMensaje,
        asunto: c.asunto,
        enlaces_encontrados: c.enlaces,
      })),
    )
    if (errorInsertar) {
      console.error('[Centinela Boletines] No se pudo registrar los correos como procesados:', errorInsertar)
    }
  }

  return {
    status: 200,
    body: {
      ok: true,
      correos_en_bandeja: lectura.revisados,
      boletines_leidos: procesados.length,
      boletines_con_fallo: conFallo,
      boletines_pendientes: lectura.pendientes,
      convocatorias_encontradas: encontradas.length,
      convocatorias_guardadas: convocatoriasGuardadas,
    },
  }
}

// Disparo manual, útil para pruebas: visita /api/centinela/leer-boletines
// Disparo automático: Vercel Cron llama a esta misma ruta por GET.
export async function GET(req: NextRequest) {
  if (!(await motorAutorizado(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const parametros = req.nextUrl.searchParams
  const resultado = await ejecutarLecturaDeBoletines(
    parametros.get('diagnostico') === '1',
    Number(parametros.get('pagina') || 0) || 0,
  )
  return NextResponse.json(resultado.body, { status: resultado.status })
}

export async function POST(req: NextRequest) {
  if (!(await motorAutorizado(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const resultado = await ejecutarLecturaDeBoletines()
  return NextResponse.json(resultado.body, { status: resultado.status })
}
