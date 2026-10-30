import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { motorAutorizado } from '@/lib/candadoMotores'
import { extraerTexto } from '@/lib/extraerDocumento'
import { esConvocatoriaNoDeseada } from '@/lib/bibliotecaConvocatorias'
import { urlGemini, fetchGemini } from '@/lib/geminiEndpoint'

/**
 * CENTINELA — DESCARGAR LOS TÉRMINOS DE REFERENCIA.
 *
 * Para cada convocatoria ABIERTA de la biblioteca que tenga enlace oficial y todavía no tenga su
 * pliego guardado, esta ruta:
 *   1. Abre la página oficial y busca ahí el documento de los términos de referencia (PDF o Word),
 *      puntuando cada enlace por su texto y su dirección («términos de referencia», «bases»,
 *      «guidelines», «call for proposals»…).
 *   2. Si la página no lo muestra, le pide a Gemini (con búsqueda web) que encuentre el enlace
 *      directo al documento oficial.
 *   3. Descarga el documento, extrae el TEXTO y lo guarda en `convocatoria_documentos`.
 *
 * Reglas:
 *  - Nunca se inventa un documento: lo que se guarda es lo que de verdad se descargó y se pudo leer.
 *  - Si el PDF es escaneado, se guarda el aviso (no el texto vacío) para que el equipo lo vea.
 *  - Cada ficha se intenta una vez por día durante 3 días; después se deja para completar a mano.
 *  - No cambia ningún dato de la ficha, solo agrega el documento (y el enlace del pliego si no había).
 *
 *   /api/centinela/descargar-terminos            → lote de 5 convocatorias
 *   /api/centinela/descargar-terminos?lote=8     → lote más grande (máximo 8)
 *   /api/centinela/descargar-terminos?probar=1   → dice cuántas faltan, sin descargar nada
 */

export const maxDuration = 300

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const MODELOS_GEMINI = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.5-flash']
const LIMITE_BYTES = 20 * 1024 * 1024
const LIMITE_TEXTO = 900_000
const MAX_INTENTOS = 3
const NAVEGADOR = 'Mozilla/5.0 (compatible; CentinelaDigital/1.0; +https://portalarquitecturadigital.com)'

const PALABRAS_BUENAS = [
  'terminos de referencia', 'términos de referencia', 'terminos', 'bases', 'pliego', 'tdr', 'lineamientos',
  'reglamento', 'guidelines', 'guide', 'call for', 'rfp', 'application', 'requisitos', 'convocatoria', 'manual',
]
const PALABRAS_MALAS = ['privacidad', 'privacy', 'cookies', 'newsletter', 'logo', 'brochure', 'presentacion', 'presentación', 'resultados', 'preguntas frecuentes', 'faq', 'acta']

type Ficha = { id: string; nombre: string | null; entidad: string | null; fuente_oficial: string | null; enlace_aplicacion: string | null; terminos_referencia: string | null; fecha_cierre: string | null }
type Candidato = { url: string; puntos: number }

const sinTildes = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

async function bajar(url: string): Promise<{ bytes: Buffer; tipo: string; url: string } | null> {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': NAVEGADOR, Accept: '*/*' }, redirect: 'follow', signal: AbortSignal.timeout(25000) })
    if (!r.ok) return null
    const largo = Number(r.headers.get('content-length') || 0)
    if (largo > LIMITE_BYTES) return null
    const bytes = Buffer.from(await r.arrayBuffer())
    if (bytes.length > LIMITE_BYTES) return null
    return { bytes, tipo: (r.headers.get('content-type') || '').toLowerCase(), url: r.url || url }
  } catch {
    return null
  }
}

const esDocumento = (url: string, tipo: string) => /\.(pdf|docx)(\?|#|$)/i.test(url) || tipo.includes('pdf') || tipo.includes('wordprocessingml')

/** Busca en el HTML de la página los enlaces que parecen ser el documento de los términos de referencia. */
function buscarEnlaces(html: string, base: string): Candidato[] {
  const salida = new Map<string, number>()
  const re = /<a\b[^>]*href\s*=\s*["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    let url: string
    try {
      url = new URL(m[1].trim().replace(/&amp;/g, '&'), base).toString()
    } catch {
      continue
    }
    if (!/^https?:/i.test(url)) continue
    const texto = sinTildes(m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')).slice(0, 200)
    const dir = sinTildes(decodeURIComponent(url.split('?')[0]).slice(-160))
    const esArchivo = /\.(pdf|docx)$/i.test(url.split('?')[0].split('#')[0])
    if (!esArchivo) continue
    let puntos = 1
    for (const p of PALABRAS_BUENAS) {
      const q = sinTildes(p)
      if (texto.includes(q)) puntos += 3
      if (dir.includes(q)) puntos += 2
    }
    for (const p of PALABRAS_MALAS) {
      const q = sinTildes(p)
      if (texto.includes(q) || dir.includes(q)) puntos -= 4
    }
    salida.set(url, Math.max(salida.get(url) || -99, puntos))
  }
  return [...salida.entries()].map(([url, puntos]) => ({ url, puntos })).filter((c) => c.puntos > 0).sort((a, b) => b.puntos - a.puntos)
}

/** Última opción: Gemini con búsqueda web encuentra el enlace directo. Se valida bajándolo de verdad. */
async function pedirEnlaceAGemini(apiKey: string, ficha: Ficha): Promise<string | null> {
  const prompt = `Busca en la web el documento OFICIAL de los términos de referencia (bases, pliego o guía para postular, en PDF o Word) de esta convocatoria. Devuelve SOLO la dirección web directa del documento, sin texto adicional. Si no lo encuentras con seguridad, responde exactamente: NINGUNO.
Convocatoria: ${ficha.nombre}
Entidad: ${ficha.entidad || 'no indicada'}
Página oficial: ${ficha.fuente_oficial || 'no indicada'}`
  for (const modelo of MODELOS_GEMINI) {
    try {
      const r = await fetchGemini(urlGemini(modelo, apiKey), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], tools: [{ google_search: {} }] }),
        signal: AbortSignal.timeout(60000),
      })
      if (!r.ok) {
        if (r.status === 503 || r.status === 429) continue
        return null
      }
      const d = (await r.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
      const texto = (d.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('').trim()
      const url = texto.match(/https?:\/\/[^\s)\]">]+/)?.[0]
      return url && !/NINGUNO/i.test(texto.slice(0, 20)) ? url.replace(/[.,;]+$/, '') : null
    } catch {
      continue
    }
  }
  return null
}

export async function GET(req: NextRequest) {
  try {
    if (!(await motorAutorizado(req, null))) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const soloProbar = req.nextUrl.searchParams.get('probar') === '1'
    const lote = Math.min(8, Math.max(1, Number(req.nextUrl.searchParams.get('lote')) || 5))
    const hoy = new Date().toISOString().slice(0, 10)

    const { data: fichas, error } = await supabase
      .from('biblioteca_convocatorias')
      .select('id, nombre, entidad, fuente_oficial, enlace_aplicacion, terminos_referencia, fecha_cierre')
      .or('fuente_oficial.not.is.null,enlace_aplicacion.not.is.null')
      .or(`fecha_cierre.is.null,fecha_cierre.gte.${hoy}`)
      .order('fecha_cierre', { ascending: true, nullsFirst: false })
      .limit(400)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const abiertas = ((fichas || []) as Ficha[]).filter((f) => !esConvocatoriaNoDeseada(f.nombre))
    if (abiertas.length === 0) return NextResponse.json({ ok: true, mensaje: 'No hay convocatorias abiertas con enlace oficial.' })

    const ids = abiertas.map((f) => f.id)
    const { data: docs } = await supabase.from('convocatoria_documentos').select('convocatoria_id').eq('clase', 'terminos_referencia').in('convocatoria_id', ids)
    const conPliego = new Set((docs || []).map((d) => String(d.convocatoria_id)))
    const { data: marcas } = await supabase.from('seguimientos_cliente').select('proyecto_id, veces').eq('clave', 'tdr').in('proyecto_id', ids.map((i) => `tdr:${i}`))
    const intentos = new Map(((marcas || []) as { proyecto_id: string; veces: number }[]).map((m) => [m.proyecto_id, m.veces]))

    const faltan = abiertas.filter((f) => !conPliego.has(f.id) && (intentos.get(`tdr:${f.id}`) || 0) < MAX_INTENTOS)
    if (soloProbar) {
      return NextResponse.json({
        ok: true,
        modo: 'prueba (no se descargó nada)',
        abiertas_con_enlace: abiertas.length,
        ya_tienen_pliego: conPliego.size,
        faltan_por_descargar: faltan.length,
        proximas: faltan.slice(0, lote).map((f) => f.nombre),
      })
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY
    const resultado: { nombre: string | null; resultado: string }[] = []

    for (const ficha of faltan.slice(0, lote)) {
      const clave = `tdr:${ficha.id}`
      const marcar = (veces: number) =>
        supabase.from('seguimientos_cliente').upsert({ proyecto_id: clave, clave: 'tdr', veces, ultimo_envio: new Date().toISOString() }, { onConflict: 'proyecto_id,clave' })
      const intento = (intentos.get(clave) || 0) + 1
      try {
        const paginas = [ficha.terminos_referencia, ficha.enlace_aplicacion, ficha.fuente_oficial].filter((u): u is string => Boolean(u && /^https?:/i.test(u)))
        let doc: { bytes: Buffer; tipo: string; url: string } | null = null
        const probados = new Set<string>()

        // 1. ¿El propio enlace ya es el documento? ¿O la página lo muestra?
        for (const pagina of paginas) {
          if (doc) break
          const bajado = await bajar(pagina)
          if (!bajado) continue
          probados.add(pagina)
          if (esDocumento(bajado.url, bajado.tipo)) {
            doc = bajado
            break
          }
          const enlaces = buscarEnlaces(bajado.bytes.toString('utf-8'), bajado.url)
          for (const c of enlaces.slice(0, 3)) {
            if (probados.has(c.url)) continue
            probados.add(c.url)
            const d = await bajar(c.url)
            if (d && esDocumento(d.url, d.tipo)) {
              doc = d
              break
            }
          }
        }

        // 2. Si no apareció, Gemini lo busca; se valida igual bajándolo.
        if (!doc && apiKey) {
          const url = await pedirEnlaceAGemini(apiKey, ficha)
          if (url && !probados.has(url)) {
            const d = await bajar(url)
            if (d && esDocumento(d.url, d.tipo)) doc = d
          }
        }

        if (!doc) {
          await marcar(intento)
          resultado.push({ nombre: ficha.nombre, resultado: intento >= MAX_INTENTOS ? 'no se encontró el documento (queda para completar a mano)' : 'no se encontró el documento (se reintenta mañana)' })
          continue
        }

        let nombreArchivo = decodeURIComponent(doc.url.split('?')[0].split('/').pop() || 'documento')
        if (!/\.(pdf|docx)$/i.test(nombreArchivo)) nombreArchivo += doc.tipo.includes('pdf') ? '.pdf' : '.docx'
        const extraccion = await extraerTexto(doc.bytes, nombreArchivo)
        const texto = extraccion.texto.slice(0, LIMITE_TEXTO)

        const { error: errorGuardar } = await supabase.from('convocatoria_documentos').insert({
          convocatoria_id: ficha.id,
          clase: 'terminos_referencia',
          nombre_archivo: nombreArchivo,
          url_origen: doc.url,
          origen: 'enlace',
          texto,
          caracteres: texto.length,
          paginas: extraccion.paginas,
          error_extraccion: extraccion.error,
        })
        if (errorGuardar) throw new Error(errorGuardar.message)
        await supabase.from('biblioteca_convocatorias').update({ terminos_referencia: doc.url }).eq('id', ficha.id).is('terminos_referencia', null)
        await marcar(extraccion.error ? MAX_INTENTOS : intento)
        resultado.push({ nombre: ficha.nombre, resultado: extraccion.error ? `guardado, pero ${extraccion.error}` : `guardado (${texto.length} caracteres)` })
      } catch (e) {
        await marcar(intento)
        resultado.push({ nombre: ficha.nombre, resultado: `falló: ${(e as Error).message}` })
      }
    }

    return NextResponse.json({ ok: true, revisadas: resultado.length, faltan_por_descargar: Math.max(0, faltan.length - resultado.length), resultado })
  } catch (e) {
    console.error('[Centinela descargar-terminos]', e)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
