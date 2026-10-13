import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { urlGemini, fetchGemini } from '@/lib/geminiEndpoint'
import { guardarEnBiblioteca, type ConvocatoriaEncontrada } from '@/lib/bibliotecaConvocatorias'
import { motorAutorizado } from '@/lib/candadoMotores'

/**
 * CENTINELA — llenar la biblioteca desde el catálogo de fuentes.
 *
 * Hasta hoy la biblioteca solo crecía por tres caminos que dependen de otros
 * (Motor 2 por proyecto, alertas de Gmail, boletines subidos a mano). Este
 * camino es el que faltaba: recorre las fuentes del Centinela (BID, CAF, GIZ,
 * fundaciones...) y le pide a Gemini, con búsqueda web, las convocatorias que
 * cada una tiene abiertas o por abrir. Lo que encuentra se guarda en la misma
 * biblioteca (`guardarEnBiblioteca`), así que no duplica ni pisa lo del equipo.
 *
 * Cada llamada revisa un lote de fuentes: las que llevan más tiempo sin
 * revisarse (o nunca). Basta con volver a visitar la dirección para pasar al
 * siguiente lote. El reloj diario de Vercel también la llama sola.
 *
 *   /api/centinela/sembrar-desde-fuentes            → lote de 8 fuentes
 *   /api/centinela/sembrar-desde-fuentes?lote=12    → lote más grande
 *
 * Regla de honestidad: "Llegando al buzón" significa que llegó un correo. Por
 * eso aquí NO se cambia el estado de las fuentes de nivel 1. Solo las de
 * nivel 2 y 3 (lectura automática y robot) pasan a "confirmado" cuando se
 * les encontró al menos una convocatoria.
 */

export const maxDuration = 300

const MODELOS_GEMINI = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.5-flash']
const EN_PARALELO = 4

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

type Fuente = {
  id: string
  nombre: string
  categoria: string
  nivel: number
  estado: string
  url: string | null
}

type RespuestaGemini = {
  candidates?: { content?: { parts?: { text?: string }[] } }[]
  error?: { message?: string }
}

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function promptDeFuente(fuente: Fuente, hoy: string): string {
  return `
Actúa como experto en grants, subvenciones y cooperación internacional.
Hoy es ${hoy}.

Fuente a revisar: "${fuente.nombre}" (categoría: ${fuente.categoria})${fuente.url ? `\nSitio oficial: ${fuente.url}` : ''}

USA LA HERRAMIENTA DE BÚSQUEDA WEB y lista las convocatorias, becas, premios o líneas de
financiación de esta fuente que estén ABIERTAS HOY, o que abran en los próximos 6 meses, y a
las que pueda postular una organización, emprendimiento o persona de Colombia o de América
Latina. Máximo 10. Si la fuente tiene líneas permanentes (ventanilla abierta todo el año),
inclúyelas con fecha_cierre "permanente".

Reglas:
- Solo convocatorias reales que hayas verificado en la búsqueda, cada una con su enlace oficial.
- No inventes montos, fechas ni requisitos: lo que no aparezca va en "informacion_faltante".
- Si la fuente no tiene nada vigente para Colombia o América Latina, responde [].

Responde ÚNICAMENTE con un JSON válido (una lista), sin texto antes ni después:
[
  {
    "nombre": "...",
    "entidad": "${fuente.nombre}",
    "tipo": "abierta actualmente | próxima apertura | permanente | periódica",
    "estado_convocatoria": "...",
    "fecha_cierre": "AAAA-MM-DD o permanente",
    "monto": "...",
    "beneficiarios": "...",
    "territorio": "...",
    "linea_tematica": "...",
    "requisitos": "...",
    "mecanismo_postulacion": "...",
    "fuente_oficial": "URL real y verificable",
    "informacion_faltante": "...",
    "tipo_financiador": "estado_nacional | estado_local | cooperacion_bilateral | cooperacion_multilateral | onu | banca_desarrollo | filantropia_privada | filantropia_corporativa | academia | empresa_privada | ong | por_clasificar",
    "ambito": "municipal | departamental | nacional | regional | internacional | por_definir"
  }
]
`
}

async function llamarGemini(apiKey: string, texto: string): Promise<RespuestaGemini | null> {
  const cuerpo = {
    contents: [{ role: 'user', parts: [{ text: texto }] }],
    tools: [{ google_search: {} }],
  }

  for (let intento = 0; intento < MODELOS_GEMINI.length; intento++) {
    const respuesta = await fetchGemini(urlGemini(MODELOS_GEMINI[intento], apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
    })
    const data = (await respuesta.json()) as RespuestaGemini
    if (respuesta.ok) return data

    const temporal = respuesta.status === 503 || respuesta.status === 429
    if (!temporal || intento === MODELOS_GEMINI.length - 1) {
      console.error('[Centinela fuentes] Gemini falló:', respuesta.status, JSON.stringify(data).slice(0, 400))
      return null
    }
    await esperar(4000)
  }
  return null
}

async function convocatoriasDeLaFuente(
  apiKey: string,
  fuente: Fuente,
  hoy: string,
): Promise<{ lista: ConvocatoriaEncontrada[]; fallo: boolean }> {
  const data = await llamarGemini(apiKey, promptDeFuente(fuente, hoy))
  if (!data) return { lista: [], fallo: true }

  const texto = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('')
  const limpio = texto.replace(/```json|```/g, '').trim()
  const inicio = limpio.indexOf('[')
  const fin = limpio.lastIndexOf(']')
  if (inicio === -1 || fin === -1) return { lista: [], fallo: true }

  try {
    const lista = JSON.parse(limpio.slice(inicio, fin + 1)) as ConvocatoriaEncontrada[]
    const utiles = (Array.isArray(lista) ? lista : [])
      .filter((c) => c && typeof c.nombre === 'string' && c.nombre.length > 3)
      .map((c) => ({ ...c, entidad: c.entidad || fuente.nombre }))
    return { lista: utiles, fallo: false }
  } catch {
    console.error('[Centinela fuentes] JSON inválido para', fuente.nombre, limpio.slice(0, 300))
    return { lista: [], fallo: true }
  }
}

async function ejecutar(lote: number) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY
  if (!apiKey) {
    return { status: 500, body: { error: 'Falta configurar GEMINI_API_KEY en el servidor' } }
  }

  // Las que llevan más tiempo sin revisarse van primero; las nunca revisadas, antes que todas.
  const { data: fuentes, error } = await supabase
    .from('centinela_fuentes')
    .select('id, nombre, categoria, nivel, estado, url')
    .in('nivel', [1, 2, 3])
    .neq('estado', 'descartada')
    .order('ultima_revision', { ascending: true, nullsFirst: true })
    .limit(lote)

  if (error) {
    return { status: 500, body: { error: 'No se pudo leer el catálogo de fuentes', detalle: error.message } }
  }

  const hoy = new Date().toISOString().slice(0, 10)
  const lista = (fuentes || []) as Fuente[]
  const resumen: { fuente: string; nivel: number; encontradas: number; fallo: boolean }[] = []
  let guardadasEnTotal = 0

  for (let i = 0; i < lista.length; i += EN_PARALELO) {
    const grupo = lista.slice(i, i + EN_PARALELO)
    const resultados = await Promise.all(grupo.map((f) => convocatoriasDeLaFuente(apiKey, f, hoy)))

    for (let j = 0; j < grupo.length; j++) {
      const fuente = grupo[j]
      const { lista: halladas, fallo } = resultados[j]

      if (halladas.length > 0) {
        const mapa = await guardarEnBiblioteca(supabase, halladas)
        guardadasEnTotal += mapa.size
      }

      // Si Gemini falló, la fuente NO se marca como revisada: vuelve a salir en el próximo lote.
      if (!fallo) {
        const cambios: Record<string, unknown> = {
          ultima_revision: new Date().toISOString(),
          actualizado_en: new Date().toISOString(),
        }
        if ((fuente.nivel === 2 || fuente.nivel === 3) && halladas.length > 0) {
          cambios.estado = 'confirmado'
        }
        await supabase.from('centinela_fuentes').update(cambios).eq('id', fuente.id)
      }

      resumen.push({ fuente: fuente.nombre, nivel: fuente.nivel, encontradas: halladas.length, fallo })
    }
  }

  const { count: totalBiblioteca } = await supabase
    .from('biblioteca_convocatorias')
    .select('id', { count: 'exact', head: true })

  return {
    status: 200,
    body: {
      ok: true,
      fuentes_revisadas: resumen.filter((r) => !r.fallo).length,
      fuentes_con_error: resumen.filter((r) => r.fallo).length,
      convocatorias_guardadas_en_este_lote: guardadasEnTotal,
      total_en_la_biblioteca: totalBiblioteca ?? null,
      detalle: resumen,
      siguiente: 'Vuelve a visitar esta misma dirección para revisar el siguiente lote de fuentes.',
    },
  }
}

export async function GET(req: NextRequest) {
  if (!(await motorAutorizado(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const pedido = Number(req.nextUrl.searchParams.get('lote'))
  const lote = Number.isFinite(pedido) && pedido > 0 ? Math.min(Math.floor(pedido), 16) : 8
  const resultado = await ejecutar(lote)
  return NextResponse.json(resultado.body, { status: resultado.status })
}

export async function POST(req: NextRequest) {
  return GET(req)
}
