import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { urlGemini, fetchGemini } from '@/lib/geminiEndpoint'
import { guardarEnBiblioteca, type ConvocatoriaEncontrada } from '@/lib/bibliotecaConvocatorias'
import { esEquipoServing } from '@/lib/guardiaEquipo'

/**
 * CENTINELA — SUBIR UN BOLETÍN A MANO (PDF, CSV o texto pegado).
 *
 * Para los boletines y listas que no llegan por correo: un PDF consolidado, un
 * Excel guardado como CSV, o texto copiado. La plataforma lee el documento, saca las
 * convocatorias que menciona SIN inventar nada que el documento no diga, y las guarda
 * en la biblioteca con la misma función de siempre (`guardarEnBiblioteca`): si una ya
 * existía por nombre + entidad, solo se completan los huecos y nunca se pisa lo que
 * el equipo ya corrigió.
 *
 * Los textos largos se leen por partes (cada llamada lee una). La pantalla repite la
 * llamada hasta terminar, así ninguna petición se pasa del tiempo permitido.
 *
 * POST multipart/form-data: archivo (PDF, CSV o TXT) o texto, y parte (0, 1, 2…).
 * Solo el equipo de Serving.
 */

export const maxDuration = 300

const MODELOS_GEMINI = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.5-flash']
const CARACTERES_POR_PARTE = 20000
/** Vercel no deja pasar peticiones de más de 4,5 MB. */
const MAX_BYTES = 4_000_000

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const PROMPT = `
Actúa como experto en grants, subvenciones, cooperación internacional y formulación de proyectos.

A continuación está un documento: un boletín, una lista o una tabla de convocatorias. Saca
ÚNICAMENTE las convocatorias, fondos, becas, premios o subvenciones que el documento menciona.
Ignora publicidad, noticias, artículos de opinión y cursos de pago.

Reglas:
- NO inventes datos. Si el documento no dice algo (monto, fecha de cierre, requisitos), déjalo
  vacío y anótalo en "informacion_faltante".
- "fuente_oficial" debe ser un enlace que aparezca en el documento para esa convocatoria. Si no
  hay ninguno, déjalo vacío.
- "fecha_cierre" en formato AAAA-MM-DD solo si el documento la dice con claridad.
- Si el documento no menciona ninguna convocatoria, responde exactamente: []

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
`

type RespuestaGemini = {
  candidates?: { content?: { parts?: { text?: string }[] } }[]
  error?: { message?: string }
}

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function llamarGemini(apiKey: string, body: unknown): Promise<{ ok: boolean; data: RespuestaGemini }> {
  let ultimo: { ok: boolean; data: RespuestaGemini } = { ok: false, data: {} }
  for (let intento = 1; intento <= MODELOS_GEMINI.length; intento++) {
    const respuesta = await fetchGemini(urlGemini(MODELOS_GEMINI[intento - 1], apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = (await respuesta.json()) as RespuestaGemini
    if (respuesta.ok) return { ok: true, data }
    ultimo = { ok: false, data }
    if ((respuesta.status === 503 || respuesta.status === 429) && intento < MODELOS_GEMINI.length) {
      await esperar(intento * 5000)
      continue
    }
    return ultimo
  }
  return ultimo
}

/** Parte un texto largo en pedazos sin cortar una línea por la mitad. */
function partirTexto(texto: string): string[] {
  const partes: string[] = []
  let actual = ''
  for (const linea of texto.split('\n')) {
    if (actual.length + linea.length + 1 > CARACTERES_POR_PARTE && actual.length > 0) {
      partes.push(actual)
      actual = ''
    }
    actual += (actual ? '\n' : '') + linea
  }
  if (actual.trim()) partes.push(actual)
  return partes
}

export async function POST(req: NextRequest) {
  try {
    if (!(await esEquipoServing())) {
      return NextResponse.json({ error: 'Solo el equipo de Serving' }, { status: 401 })
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Falta configurar GEMINI_API_KEY en el servidor' }, { status: 500 })
    }

    const formulario = await req.formData()
    const archivo = formulario.get('archivo')
    const textoPegado = String(formulario.get('texto') || '').trim()
    const parte = Math.max(0, Number(formulario.get('parte') || 0) || 0)

    const hayArchivo = archivo instanceof File && archivo.size > 0
    if (!hayArchivo && !textoPegado) {
      return NextResponse.json({ error: 'Sube un archivo (PDF, CSV o TXT) o pega el texto del boletín.' }, { status: 400 })
    }
    if (hayArchivo && archivo.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'El archivo pesa más de 4 MB. Pártelo en dos archivos o pega el texto por partes.' },
        { status: 400 },
      )
    }

    let partesGemini: unknown[]
    let totalPartes = 1

    if (hayArchivo && (archivo.type.includes('pdf') || archivo.name.toLowerCase().endsWith('.pdf'))) {
      if (parte > 0) return NextResponse.json({ error: 'Un PDF se lee de una sola vez.' }, { status: 400 })
      const base64 = Buffer.from(await archivo.arrayBuffer()).toString('base64')
      partesGemini = [{ inlineData: { mimeType: 'application/pdf', data: base64 } }, { text: PROMPT }]
    } else {
      const texto = hayArchivo ? await archivo.text() : textoPegado
      const partes = partirTexto(texto)
      totalPartes = Math.max(1, partes.length)
      if (parte >= totalPartes) {
        return NextResponse.json({ error: 'Esa parte no existe.' }, { status: 400 })
      }
      partesGemini = [{ text: `${PROMPT}\n\nDOCUMENTO (parte ${parte + 1} de ${totalPartes}):\n\n${partes[parte] || ''}` }]
    }

    const { ok, data } = await llamarGemini(apiKey, { contents: [{ role: 'user', parts: partesGemini }] })
    if (!ok) {
      console.error('[Centinela subir-boletin] Gemini falló:', JSON.stringify(data))
      return NextResponse.json({ error: 'La IA no pudo leer esta parte. Intenta de nuevo en un momento.' }, { status: 502 })
    }

    const texto = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('')
    const limpio = texto.replace(/```json|```/g, '').trim()

    let lista: ConvocatoriaEncontrada[]
    try {
      const bruto = JSON.parse(limpio)
      lista = Array.isArray(bruto)
        ? (bruto as ConvocatoriaEncontrada[]).filter((c) => c && typeof c === 'object' && c.nombre)
        : []
    } catch {
      console.error('[Centinela subir-boletin] Respuesta no válida:', texto.slice(0, 300))
      return NextResponse.json({ error: 'La IA devolvió una respuesta que no se pudo leer. Intenta de nuevo.' }, { status: 502 })
    }

    const guardadas = lista.length > 0 ? await guardarEnBiblioteca(supabase, lista) : new Map<string, string>()

    return NextResponse.json({
      ok: true,
      parte,
      total_partes: totalPartes,
      leidas: lista.length,
      guardadas: guardadas.size,
      ejemplos: lista.slice(0, 5).map((c) => c.nombre),
    })
  } catch (e) {
    console.error('[Centinela subir-boletin] Error:', e)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
