import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { esEquipoServing } from '@/lib/guardiaEquipo'

/**
 * LOS TÉRMINOS DE REFERENCIA DE UNA CONVOCATORIA
 *
 * Es la pieza que sostiene todo radar: sin el texto del pliego no hay contra
 * qué encajar el proyecto. Un resumen no sirve — las reglas están en el
 * documento.
 *
 * Entra de dos maneras:
 *
 *   POST (multipart/form-data)  archivo=<pdf|docx|txt>  convocatoriaId=...
 *        El equipo sube el documento que ya tiene en la mano.
 *
 *   POST (application/json)     { convocatoriaId, url, clase? }
 *        Se baja de la web de la convocatoria.
 *
 * En los dos casos lo que queda guardado es el TEXTO extraído. El archivo
 * original no se guarda: lo que lee el motor es el texto, y guardar PDFs de
 * cincuenta megas para volver a extraer lo mismo cada vez no compra nada.
 *
 * GET /api/convocatorias/documentos?convocatoriaId=...
 *     Lista los documentos de esa convocatoria, sin el texto completo (solo
 *     el tamaño), para no arrastrar megas a la pantalla.
 */

const LIMITE_BYTES = 20 * 1024 * 1024 // 20 MB
const LIMITE_TEXTO = 900_000 // caracteres que se guardan como máximo

function cliente() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

type Extraccion = { texto: string; paginas: number | null; error: string | null }

/**
 * Saca el texto del documento. Reconoce PDF, Word y texto plano.
 *
 * OJO con los PDF escaneados: son una foto de la hoja, no traen texto. Cuando
 * pasa eso el resultado sale casi vacío y hay que decirlo, porque un texto de
 * treinta caracteres haría que el motor de encaje "lea" un pliego en blanco y
 * conteste cualquier cosa con toda seguridad.
 */
async function extraerTexto(bytes: Buffer, nombre: string): Promise<Extraccion> {
  const minuscula = (nombre || '').toLowerCase()

  try {
    if (minuscula.endsWith('.pdf')) {
      const modulo = await import('pdf-parse')
      const pdfParse = (modulo as unknown as { default: (b: Buffer) => Promise<{ text: string; numpages?: number }> }).default
        || (modulo as unknown as (b: Buffer) => Promise<{ text: string; numpages?: number }>)
      const salida = await pdfParse(bytes)
      const texto = (salida?.text || '').trim()
      const paginas = salida?.numpages ?? null

      if (texto.length < 200) {
        return {
          texto,
          paginas,
          error:
            'El PDF casi no trae texto. Lo más probable es que sea escaneado (una foto de la hoja). ' +
            'Hay que pasarle un reconocimiento de texto o pegar el contenido a mano.',
        }
      }
      return { texto, paginas, error: null }
    }

    if (minuscula.endsWith('.docx')) {
      const mammoth = await import('mammoth')
      const salida = await mammoth.extractRawText({ buffer: bytes })
      return { texto: (salida?.value || '').trim(), paginas: null, error: null }
    }

    if (minuscula.endsWith('.txt') || minuscula.endsWith('.md')) {
      return { texto: bytes.toString('utf-8').trim(), paginas: null, error: null }
    }

    return {
      texto: '',
      paginas: null,
      error: `No sé leer archivos "${minuscula.split('.').pop()}". Sirven PDF, DOCX y TXT.`,
    }
  } catch (e) {
    return {
      texto: '',
      paginas: null,
      error: `No se pudo leer el documento: ${(e as Error).message}`,
    }
  }
}

export async function POST(req: Request) {
  try {
    if (!(await esEquipoServing())) {
      return NextResponse.json(
        { error: 'Solo el equipo de Serving puede cargar términos de referencia' },
        { status: 401 },
      )
    }

    const supabase = cliente()
    const tipoContenido = req.headers.get('content-type') || ''

    let convocatoriaId = ''
    let clase = 'terminos_referencia'
    let nombreArchivo = ''
    let urlOrigen: string | null = null
    let origen: 'archivo' | 'enlace' = 'archivo'
    let bytes: Buffer | null = null
    let textoPegado: string | null = null

    if (tipoContenido.includes('multipart/form-data')) {
      const formulario = await req.formData()
      convocatoriaId = String(formulario.get('convocatoriaId') || '')
      clase = String(formulario.get('clase') || 'terminos_referencia')

      const archivo = formulario.get('archivo')
      if (archivo && typeof archivo !== 'string') {
        if (archivo.size > LIMITE_BYTES) {
          return NextResponse.json(
            { error: 'El archivo pesa más de 20 MB. Súbelo partido o pega el texto.' },
            { status: 400 },
          )
        }
        nombreArchivo = archivo.name
        bytes = Buffer.from(await archivo.arrayBuffer())
      }
    } else {
      const cuerpo = await req.json()
      convocatoriaId = String(cuerpo?.convocatoriaId || '')
      clase = String(cuerpo?.clase || 'terminos_referencia')

      if (cuerpo?.texto) {
        // el equipo pegó el texto a mano (sirve para pliegos escaneados)
        textoPegado = String(cuerpo.texto)
        nombreArchivo = String(cuerpo?.nombre || 'texto pegado a mano')
        origen = 'archivo'
      } else if (cuerpo?.url) {
        urlOrigen = String(cuerpo.url)
        origen = 'enlace'
        const respuesta = await fetch(urlOrigen)
        if (!respuesta.ok) {
          return NextResponse.json(
            { error: `La página respondió ${respuesta.status}. Revisa el enlace o baja el archivo a mano.` },
            { status: 400 },
          )
        }
        const bruto = Buffer.from(await respuesta.arrayBuffer())
        if (bruto.length > LIMITE_BYTES) {
          return NextResponse.json({ error: 'El documento pesa más de 20 MB.' }, { status: 400 })
        }
        bytes = bruto
        nombreArchivo = urlOrigen.split('/').pop() || 'documento'
        // si el enlace no termina en .pdf pero el servidor dice que lo es
        const tipo = respuesta.headers.get('content-type') || ''
        if (!/\.(pdf|docx|txt|md)$/i.test(nombreArchivo)) {
          if (tipo.includes('pdf')) nombreArchivo += '.pdf'
          else if (tipo.includes('word')) nombreArchivo += '.docx'
          else nombreArchivo += '.txt'
        }
      }
    }

    if (!convocatoriaId) {
      return NextResponse.json({ error: 'Falta decir de qué convocatoria es' }, { status: 400 })
    }
    if (!bytes && !textoPegado) {
      return NextResponse.json({ error: 'No llegó ni archivo, ni enlace, ni texto' }, { status: 400 })
    }

    const extraccion: Extraccion = textoPegado
      ? { texto: textoPegado.trim(), paginas: null, error: null }
      : await extraerTexto(bytes as Buffer, nombreArchivo)

    const texto = extraccion.texto.slice(0, LIMITE_TEXTO)

    const { data, error } = await supabase
      .from('convocatoria_documentos')
      .insert({
        convocatoria_id: convocatoriaId,
        clase,
        nombre_archivo: nombreArchivo,
        url_origen: urlOrigen,
        origen,
        texto,
        caracteres: texto.length,
        paginas: extraccion.paginas,
        error_extraccion: extraccion.error,
      })
      .select('id, nombre_archivo, caracteres, paginas, error_extraccion, creado_en')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // si es el pliego principal y la ficha no tenía enlace de aplicación, se
    // aprovecha el que vino
    if (urlOrigen && clase === 'terminos_referencia') {
      await supabase
        .from('biblioteca_convocatorias')
        .update({ terminos_referencia: urlOrigen })
        .eq('id', convocatoriaId)
        .is('terminos_referencia', null)
    }

    return NextResponse.json({
      ok: true,
      documento: data,
      aviso: extraccion.error,
    })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    if (!(await esEquipoServing())) {
      return NextResponse.json({ error: 'Solo el equipo de Serving' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const convocatoriaId = searchParams.get('convocatoriaId')
    if (!convocatoriaId) {
      return NextResponse.json({ error: 'Falta convocatoriaId' }, { status: 400 })
    }

    const supabase = cliente()
    const { data, error } = await supabase
      .from('convocatoria_documentos')
      .select('id, clase, nombre_archivo, url_origen, origen, caracteres, paginas, error_extraccion, creado_en')
      .eq('convocatoria_id', convocatoriaId)
      .order('creado_en', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ documentos: data || [] })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
