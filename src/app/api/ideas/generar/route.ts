import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callGemini } from '@/lib/gemini'

export const maxDuration = 120

// Tope por modelo: con 3 modelos de respaldo, ninguno puede gastarse todo el tiempo de la ruta.
const TOPE_POR_MODELO_IDEAS_MS = 55000

export interface IdeasGenerarInput {
  // Descripción libre de lo que el usuario está pensando (obligatorio). Puede ser "no tengo idea todavía".
  descripcionIdea: string
  sectorActual?: string

  // Herramienta 1: Matriz de Reinvención (respuestas opcionales, texto libre por pregunta)
  matrizReinvencion?: {
    eliminar?: string
    reducir?: string
    incrementar?: string
    crear?: string
  }

  // Herramienta 2: Mapa de Convergencia Tecnológica (hasta 2 tecnologías elegidas)
  tecnologiasSeleccionadas?: string[]

  // Herramienta 3: Brújula de Necesidades Humanas
  necesidadSeleccionada?: string
  formaSeleccionada?: string
}

export interface IdeaPropuesta {
  titulo: string
  descripcion: string
  porQueFunciona: string
  primerPaso: string
}

export interface IdeasResultado {
  // Comentario breve sobre la Matriz de Reinvención: qué le sugiere la IA eliminar/reducir/incrementar/crear
  sugerenciasReinvencion?: {
    eliminar: string
    reducir: string
    incrementar: string
    crear: string
  }
  // Ideas concretas nacidas del cruce sector x tecnología elegida
  ideasConvergencia?: IdeaPropuesta[]
  // Cómo la necesidad humana elegida ancla el proyecto
  notaNecesidades?: string
  // Ideas de negocio (siempre presentes, mínimo 20)
  ideas: IdeaPropuesta[]
  // Ideas de innovación (siempre presentes, mínimo 20)
  ideasInnovacion?: IdeaPropuesta[]
  notaConceptoMarkdown: string
  disponible: boolean
  proximaFechaDisponible?: string
}

const DIAS_VENTANA_LIMITE = 15

// Correos del equipo administrador (sin tope de generaciones)
const ADMIN_EMAILS = ['servingbuilderapp@gmail.com', 'contacto@portalarquitecturadigital.com']

/**
 * El administrador no tiene tope: necesita poder generar documentos las veces
 * que quiera para demos y pruebas de la plataforma.
 */
async function esAdministrador(supabase: any, user: { id: string; email?: string | null }) {
  if (ADMIN_EMAILS.includes((user.email || '').toLowerCase().trim())) return true

  const { data: perfil } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  return perfil?.role === 'admin'
}

async function calcularDisponibilidad(supabase: any, userId: string) {
  const { data } = await supabase
    .from('app_ideas_documentos')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) return { disponible: true, proximaFechaDisponible: undefined as string | undefined }

  const proximaFecha = new Date(new Date(data.created_at).getTime() + DIAS_VENTANA_LIMITE * 24 * 60 * 60 * 1000)
  const disponible = proximaFecha.getTime() <= Date.now()
  return { disponible, proximaFechaDisponible: disponible ? undefined : proximaFecha.toISOString() }
}

// GET: consultar si el usuario tiene disponible su generación quincenal (para deshabilitar el botón antes de intentar)
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    }
    // Último documento guardado: así el cliente siempre puede volver a verlo y descargarlo
    const { data: ultimoDoc } = await supabase
      .from('app_ideas_documentos')
      .select('resultado, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    const ultimo = ultimoDoc?.resultado ? { ...ultimoDoc.resultado, creadoEn: ultimoDoc.created_at } : null

    if (await esAdministrador(supabase, user)) {
      return NextResponse.json({ disponible: true, sinLimite: true, ultimo })
    }
    const estado = await calcularDisponibilidad(supabase, user.id)
    return NextResponse.json({ ...estado, ultimo })
  } catch (error: any) {
    console.error('Error en GET /api/ideas/generar:', error)
    return NextResponse.json({ error: 'Error al verificar disponibilidad' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Debes iniciar sesión para usar la App de Ideas' }, { status: 401 })
    }

    const body: IdeasGenerarInput = await req.json()

    if (!body.descripcionIdea || body.descripcionIdea.trim().length < 3) {
      return NextResponse.json({ error: 'Cuéntanos algo sobre ti o tu negocio, aunque sea que todavía no tienes una idea clara' }, { status: 400 })
    }

    // El administrador no tiene tope (necesita hacer demos sin restricción)
    const admin = await esAdministrador(supabase, user)

    // Un solo uso cada 15 días — se valida ANTES de gastar la llamada a Gemini
    const { disponible, proximaFechaDisponible } = admin
      ? { disponible: true, proximaFechaDisponible: undefined as string | undefined }
      : await calcularDisponibilidad(supabase, user.id)
    if (!disponible) {
      return NextResponse.json(
        {
          error: `Ya usaste tu generación de estos 15 días. Vuelve a intentarlo a partir del ${new Date(proximaFechaDisponible!).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}.`,
          disponible: false,
          proximaFechaDisponible
        },
        { status: 429 }
      )
    }

    // Construir el contexto de las 3 herramientas (solo lo que el usuario llenó)
    const tieneReinvencion = body.matrizReinvencion && Object.values(body.matrizReinvencion).some(Boolean)
    const tieneTecnologias = body.tecnologiasSeleccionadas && body.tecnologiasSeleccionadas.length > 0
    const tieneNecesidad = body.necesidadSeleccionada || body.formaSeleccionada

    const partesHerramientas: string[] = []

    if (body.sectorActual) {
      partesHerramientas.push(`Sector/industria actual o de interés: ${body.sectorActual}`)
    }
    if (tieneReinvencion) {
      partesHerramientas.push(`El usuario respondió (o dejó en blanco) estas preguntas de reinvención — si dejó algo en blanco, PROPÓN TÚ una sugerencia concreta y justificada, no genérica:
- Qué eliminar: ${body.matrizReinvencion?.eliminar || '(el usuario no respondió — sugiere tú algo concreto)'}
- Qué reducir: ${body.matrizReinvencion?.reducir || '(el usuario no respondió — sugiere tú algo concreto)'}
- Qué incrementar: ${body.matrizReinvencion?.incrementar || '(el usuario no respondió — sugiere tú algo concreto)'}
- Qué crear: ${body.matrizReinvencion?.crear || '(el usuario no respondió — sugiere tú algo concreto)'}`)
    }
    if (tieneTecnologias) {
      partesHerramientas.push(`Tecnologías emergentes elegidas para cruzar con su sector: ${body.tecnologiasSeleccionadas!.join(', ')}`)
    }
    if (tieneNecesidad) {
      partesHerramientas.push(`Necesidad humana a satisfacer: ${body.necesidadSeleccionada || '(no eligió, sugiere tú la más relevante)'}, forma de satisfacerla: ${body.formaSeleccionada || '(no eligió, sugiere tú la más relevante)'}`)
    }

    const contextoHerramientas = partesHerramientas.length > 0
      ? `\n\nHerramientas de exploración que el usuario usó:\n${partesHerramientas.join('\n\n')}`
      : '\n\nEl usuario no usó ninguna herramienta adicional — trabaja solo con su descripción libre.'

    const prompt = `Eres un consultor experto en desarrollo de ideas de negocio y proyectos, especializado en Latinoamérica, subvenciones y cooperación internacional. Un usuario puede llegar con una idea clara, o completamente sin ideas ("no sé qué hacer") — en ambos casos tu trabajo es darle algo concreto y accionable, nunca una lista fría de conceptos sin explicación.

Responde ÚNICAMENTE con un JSON válido (sin texto adicional, sin markdown, sin \`\`\`json), con exactamente esta forma:

{
  ${tieneReinvencion ? `"sugerenciasReinvencion": {
    "eliminar": "<1 frase concreta y justificada, como si le hablaras directo>",
    "reducir": "<1 frase concreta y justificada>",
    "incrementar": "<1 frase concreta y justificada>",
    "crear": "<1 frase concreta y justificada>"
  },` : ''}
  ${tieneTecnologias ? `"ideasConvergencia": [
    { "titulo": "...", "descripcion": "...", "porQueFunciona": "...", "primerPaso": "..." }
    // 3 a 5 ideas que nazcan ESPECÍFICAMENTE de cruzar su sector con las tecnologías elegidas
  ],` : ''}
  ${tieneNecesidad ? `"notaNecesidades": "<2-3 frases explicando cómo esa necesidad humana y esa forma de satisfacerla debería ser el punto de partida de sus proyectos, y qué necesitan sus clientes/beneficiarios reales a partir de ahí>",` : ''}
  "ideas": [
    { "titulo": "...", "descripcion": "...", "porQueFunciona": "...", "primerPaso": "..." }
    // EXACTAMENTE 20 ideas de NEGOCIO distintas entre sí (nada de repetir con otras palabras), variadas en tamaño, público y modelo de ingresos, tomando en cuenta TODO el contexto de arriba. Cada campo en 1 o 2 frases concretas.
  ],
  "notaConceptoMarkdown": "<documento en formato markdown, 1-2 páginas, con estas secciones: Resumen de la Idea, Problema que Resuelve, A Quién Ayuda, Cómo Funciona, Primeros Pasos Sugeridos, Posibles Fuentes de Financiación — listo para que el usuario lo use como punto de partida si decide estructurar el proyecto formalmente>"
}

LO QUE EL USUARIO CONTÓ SOBRE SÍ MISMO O SU IDEA:
${body.descripcionIdea}${contextoHerramientas}`

    // Segundo pedido, en paralelo: 20 ideas de INNOVACION (producto, servicio, proceso o modelo nuevo)
    const promptInnovacion = `Eres un consultor experto en innovación, especializado en Latinoamérica, subvenciones y cooperación internacional. Un usuario puede llegar con una idea clara, o completamente sin ideas — en ambos casos entrégale algo concreto y accionable.

Responde ÚNICAMENTE con un JSON válido (sin texto adicional, sin markdown, sin \`\`\`json), con exactamente esta forma:

{
  "ideasInnovacion": [
    { "titulo": "...", "descripcion": "...", "porQueFunciona": "...", "primerPaso": "..." }
    // EXACTAMENTE 20 ideas de INNOVACIÓN distintas entre sí: algo nuevo o mejorado en un producto, servicio, proceso, tecnología o modelo de negocio (no ideas de negocio comunes). Mezcla innovación pequeña y de gran alcance. Cada campo en 1 o 2 frases concretas.
  ]
}

LO QUE EL USUARIO CONTÓ SOBRE SÍ MISMO O SU IDEA:
${body.descripcionIdea}${contextoHerramientas}`

    // Si la IA devuelve algo ilegible o con menos de 20 ideas, se le pide una vez mas antes de rendirse.
    const MINIMO_IDEAS = 20
    async function pedirJson<T extends Partial<IdeasResultado>>(texto: string, clave: 'ideas' | 'ideasInnovacion'): Promise<T | null> {
      let mejor: T | null = null
      for (let intento = 1; intento <= 2; intento++) {
        const respuestaIA = await callGemini(texto, TOPE_POR_MODELO_IDEAS_MS)
        try {
          const jsonLimpio = respuestaIA.replace(/```json\n?|\n?```/g, '').trim()
          const candidato = JSON.parse(jsonLimpio) as T
          const cantidad = Array.isArray(candidato[clave]) ? candidato[clave].length : 0
          const cantidadMejor = mejor && Array.isArray(mejor[clave]) ? mejor[clave].length : -1
          if (cantidad > cantidadMejor) mejor = candidato
          if (cantidad >= MINIMO_IDEAS) return candidato
        } catch {
          console.error(`No se pudo interpretar la respuesta de la IA (intento ${intento}):`, respuestaIA)
        }
      }
      return mejor
    }

    const [resultado, resultadoInnovacion] = await Promise.all([
      pedirJson<Partial<IdeasResultado>>(prompt, 'ideas'),
      pedirJson<Partial<IdeasResultado>>(promptInnovacion, 'ideasInnovacion').catch((e) => {
        console.error('Fallaron las ideas de innovación:', e)
        return null
      }),
    ])
    if (!resultado) {
      throw new Error('No se pudieron generar las ideas, intenta de nuevo')
    }
    resultado.ideasInnovacion = resultadoInnovacion?.ideasInnovacion || []

    // Guardar el uso (esto es lo que cuenta contra el único uso cada 15 días)
    const { error: insertError } = await supabase.from('app_ideas_documentos').insert({
      user_id: user.id,
      sector_actual: body.sectorActual || null,
      descripcion_idea: body.descripcionIdea,
      matriz_reinvencion: body.matrizReinvencion || null,
      matriz_convergencia: tieneTecnologias ? { tecnologias: body.tecnologiasSeleccionadas } : null,
      matriz_necesidades: tieneNecesidad ? { necesidad: body.necesidadSeleccionada, forma: body.formaSeleccionada } : null,
      resultado
    })

    if (insertError) {
      console.error('No se pudo guardar el documento de ideas:', insertError)
    }

    const respuestaFinal: IdeasResultado = {
      ...resultado,
      ideas: resultado.ideas || [],
      notaConceptoMarkdown: resultado.notaConceptoMarkdown || '',
      // El administrador queda disponible de inmediato para la siguiente demo
      disponible: admin,
      proximaFechaDisponible: admin
        ? undefined
        : new Date(Date.now() + DIAS_VENTANA_LIMITE * 24 * 60 * 60 * 1000).toISOString()
    }

    return NextResponse.json(respuestaFinal)
  } catch (error: any) {
    console.error('Error en /api/ideas/generar:', error)
    return NextResponse.json(
      { error: error.message || 'Error al generar las ideas' },
      { status: 500 }
    )
  }
}
