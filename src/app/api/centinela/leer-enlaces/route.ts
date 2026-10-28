import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { urlGemini, fetchGemini } from '@/lib/geminiEndpoint'
import { motorAutorizado } from '@/lib/candadoMotores'
import { TIPOS_POSTULANTE } from '@/lib/radiografiaPliego'

/**
 * CENTINELA — LEER LOS ENLACES OFICIALES.
 *
 * Hay convocatorias que entran a la biblioteca solo con nombre, entidad y enlace
 * oficial (por ejemplo, las que se suben por la pantalla "Subir un boletín"). Esta
 * ruta recorre las fichas que tienen enlace oficial pero les falta el detalle, le
 * pide a Gemini (con búsqueda web) que lea la página oficial de cada una, y
 * completa lo que encuentre.
 *
 * Reglas:
 *  - SOLO rellena huecos: nunca pisa lo que el equipo o el motor ya habían puesto.
 *  - No inventa: si la página no dice algo, queda vacío.
 *  - Empieza por las que cierran más pronto, y se salta las que ya cerraron.
 *  - Cada ficha se intenta UNA vez (queda marcada con `enlace_leido_en`), para no
 *    gastar saldo de Gemini repitiendo las que no se dejan leer. Las que no se
 *    pudieron leer se completan a mano con el botón "Completar condiciones".
 *
 *   /api/centinela/leer-enlaces            → lote de 5 fichas
 *   /api/centinela/leer-enlaces?lote=8     → lote más grande (máximo 10)
 *
 * Antes de usarla hay que correr el SQL que crea la columna `enlace_leido_en`.
 */

export const maxDuration = 300

const MODELOS_GEMINI = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.5-flash']

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const COLUMNAS = [
  'id',
  'nombre',
  'entidad',
  'fuente_oficial',
  'fecha_cierre',
  'objetivo',
  'sector',
  'tipo_postulante',
  'paises_elegibles',
  'monto_maximo',
  'moneda',
  'contrapartida_exigida',
  'contrapartida_detalle',
  'consorcio_obligatorio',
  'financiacion_maxima_pct',
  'madurez_financiable',
  'idiomas',
  'edicion',
  'instrumento',
  'territorios_prioritarios',
  'duracion_proyecto',
  'requisitos_habilitantes',
  'criterios_evaluacion',
  'fecha_apertura',
  'enlace_aplicacion',
].join(', ')

type Ficha = Record<string, unknown> & { id: string; nombre: string | null; entidad: string | null; fuente_oficial: string | null }

type RespuestaGemini = {
  candidates?: { content?: { parts?: { text?: string }[] } }[]
}

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function llamarGemini(apiKey: string, prompt: string): Promise<string | null> {
  const cuerpo = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    tools: [{ google_search: {} }],
  }
  for (let intento = 0; intento < MODELOS_GEMINI.length; intento++) {
    const respuesta = await fetchGemini(urlGemini(MODELOS_GEMINI[intento], apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
    })
    if (respuesta.ok) {
      const data = (await respuesta.json()) as RespuestaGemini
      return (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('')
    }
    const temporal = respuesta.status === 503 || respuesta.status === 429
    if (!temporal || intento === MODELOS_GEMINI.length - 1) return null
    await esperar((intento + 1) * 5000)
  }
  return null
}

function armarPrompt(f: Ficha): string {
  return `
Actúa como experto en subvenciones y términos de referencia.

Lee la PÁGINA OFICIAL de esta convocatoria y saca sus condiciones. Usa la búsqueda web para
abrir ese enlace y sus documentos oficiales.

Convocatoria: ${f.nombre}
Entidad: ${f.entidad || 'no indicada'}
Enlace oficial: ${f.fuente_oficial}

Reglas:
- NO inventes nada. Si la página no dice algo, deja ese campo vacío (null).
- Si no puedes abrir o leer la página, responde exactamente: {}
- Las fechas van en formato AAAA-MM-DD, solo si la página las dice con claridad.
- "tipo_postulante" es una lista con valores SOLO de esta lista: ${TIPOS_POSTULANTE.join(', ')}.
- "monto_maximo" es un número (sin símbolos) y "moneda" su código (COP, USD, EUR).

Responde ÚNICAMENTE con un JSON válido (un objeto), sin texto antes ni después:
{
  "objetivo": "para qué entrega el dinero de verdad esta convocatoria",
  "sector": "...",
  "tipo_postulante": ["..."],
  "paises_elegibles": ["..."],
  "monto_maximo": 0,
  "moneda": "...",
  "contrapartida_exigida": true,
  "contrapartida_detalle": "...",
  "consorcio_obligatorio": true,
  "financiacion_maxima_pct": 0,
  "madurez_financiable": "...",
  "idiomas": "...",
  "edicion": "...",
  "instrumento": "subvención, crédito, premio, beca...",
  "territorios_prioritarios": "...",
  "duracion_proyecto": "...",
  "requisitos_habilitantes": "documentos y condiciones sin los cuales no reciben la postulación",
  "criterios_evaluacion": "cómo puntúan y con qué peso",
  "fecha_apertura": "AAAA-MM-DD",
  "fecha_cierre": "AAAA-MM-DD",
  "enlace_aplicacion": "enlace directo donde se postula, si existe"
}
`
}

const vacio = (v: unknown) =>
  v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)

const aTexto = (v: unknown): string | null =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, 2000) : null
const aNumero = (v: unknown): number | null => {
  const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(/[^0-9.-]/g, ''))
  return Number.isFinite(n) && n > 0 ? n : null
}
const aBooleano = (v: unknown): boolean | null => (typeof v === 'boolean' ? v : null)
const aFecha = (v: unknown): string | null => {
  const t = aTexto(v)
  return t && /^\d{4}-\d{2}-\d{2}$/.test(t) ? t : null
}
const aLista = (v: unknown, permitidos?: readonly string[]): string[] | null => {
  if (!Array.isArray(v)) return null
  const lista = v
    .map((x) => (typeof x === 'string' ? x.trim() : ''))
    .filter((x) => x && (!permitidos || permitidos.includes(x)))
  return lista.length > 0 ? lista : null
}

/** Lo que Gemini leyó, limpio y con el tipo correcto. */
function limpiar(bruto: Record<string, unknown>): Record<string, unknown> {
  return {
    objetivo: aTexto(bruto.objetivo),
    sector: aTexto(bruto.sector),
    tipo_postulante: aLista(bruto.tipo_postulante, TIPOS_POSTULANTE),
    paises_elegibles: aLista(bruto.paises_elegibles),
    monto_maximo: aNumero(bruto.monto_maximo),
    moneda: aTexto(bruto.moneda),
    contrapartida_exigida: aBooleano(bruto.contrapartida_exigida),
    contrapartida_detalle: aTexto(bruto.contrapartida_detalle),
    consorcio_obligatorio: aBooleano(bruto.consorcio_obligatorio),
    financiacion_maxima_pct: aNumero(bruto.financiacion_maxima_pct),
    madurez_financiable: aTexto(bruto.madurez_financiable),
    idiomas: aTexto(bruto.idiomas),
    edicion: aTexto(bruto.edicion),
    instrumento: aTexto(bruto.instrumento),
    territorios_prioritarios: aTexto(bruto.territorios_prioritarios),
    duracion_proyecto: aTexto(bruto.duracion_proyecto),
    requisitos_habilitantes: aTexto(bruto.requisitos_habilitantes),
    criterios_evaluacion: aTexto(bruto.criterios_evaluacion),
    fecha_apertura: aFecha(bruto.fecha_apertura),
    fecha_cierre: aFecha(bruto.fecha_cierre),
    enlace_aplicacion: aTexto(bruto.enlace_aplicacion),
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!(await motorAutorizado(req))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Falta configurar GEMINI_API_KEY en el servidor' }, { status: 500 })
    }

    const lote = Math.min(10, Math.max(1, Number(req.nextUrl.searchParams.get('lote')) || 5))
    const hoy = new Date().toISOString().slice(0, 10)

    const { data: fichas, error } = await supabase
      .from('biblioteca_convocatorias')
      .select(COLUMNAS)
      .not('fuente_oficial', 'is', null)
      .is('enlace_leido_en', null)
      .or('objetivo.is.null,monto_maximo.is.null')
      .or(`fecha_cierre.is.null,fecha_cierre.gte.${hoy}`)
      .order('fecha_cierre', { ascending: true, nullsFirst: false })
      .limit(lote)

    if (error) {
      return NextResponse.json(
        {
          error: `No se pudieron leer las fichas: ${error.message}. ¿Ya corriste el SQL de la columna enlace_leido_en en Supabase?`,
        },
        { status: 500 },
      )
    }

    const lista = (fichas || []) as unknown as Ficha[]
    const resumen: { nombre: string; resultado: string }[] = []

    for (const ficha of lista) {
      const ahora = new Date().toISOString()
      try {
        const texto = await llamarGemini(apiKey, armarPrompt(ficha))
        let leido: Record<string, unknown> = {}
        if (texto) {
          try {
            const bruto = JSON.parse(texto.replace(/```json|```/g, '').trim())
            if (bruto && typeof bruto === 'object' && !Array.isArray(bruto)) leido = limpiar(bruto as Record<string, unknown>)
          } catch {
            leido = {}
          }
        }

        // Solo se rellenan los huecos: lo que la ficha ya tenía, no se toca.
        const parche: Record<string, unknown> = {}
        for (const [clave, valor] of Object.entries(leido)) {
          if (!vacio(valor) && vacio(ficha[clave])) parche[clave] = valor
        }
        const completo = Object.keys(parche).length > 0
        if (completo) parche.verificada_en = hoy

        const { error: errorGuardado } = await supabase
          .from('biblioteca_convocatorias')
          .update({ ...parche, enlace_leido_en: ahora, actualizado_en: ahora })
          .eq('id', ficha.id)

        if (errorGuardado) {
          resumen.push({ nombre: String(ficha.nombre), resultado: `error al guardar: ${errorGuardado.message}` })
        } else {
          resumen.push({
            nombre: String(ficha.nombre),
            resultado: completo ? `completada (${Object.keys(parche).length - 1} datos)` : 'no se pudo leer la página',
          })
        }
      } catch (e) {
        // La ficha queda sin marcar para reintentarla en la siguiente pasada.
        resumen.push({ nombre: String(ficha.nombre), resultado: `falló: ${(e as Error).message}` })
      }
    }

    return NextResponse.json({ ok: true, revisadas: lista.length, detalle: resumen })
  } catch (e) {
    console.error('[Centinela leer-enlaces] Error:', e)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
