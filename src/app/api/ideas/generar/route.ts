import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callGemini } from '@/lib/gemini'

export interface IdeasGenerarInput {
  // Descripción libre de lo que el usuario está pensando (obligatorio)
  descripcionIdea: string
  sectorActual?: string

  // Herramienta 1: Matriz de Reinvención (respuestas opcionales, texto libre por pregunta)
  matrizReinvencion?: {
    eliminar?: string
    reducir?: string
    incrementar?: string
    crear?: string
  }

  // Herramienta 2: Mapa de Convergencia Tecnológica (id de la tecnología elegida)
  tecnologiaSeleccionada?: string

  // Herramienta 3: Brújula de Necesidades Humanas (ids elegidos)
  necesidadSeleccionada?: string
  formaSeleccionada?: string

  // Si es true: genera el documento final descargable (cuenta contra el tope semanal de 4)
  generarDocumentoFinal: boolean
}

export interface IdeaPropuesta {
  titulo: string
  descripcion: string
  porQueFunciona: string
  primerPaso: string
}

export interface IdeasResultado {
  ideas: IdeaPropuesta[]
  notaConceptoMarkdown?: string
  documentosRestantesSemana?: number
}

const LIMITE_DOCUMENTOS = 1
const DIAS_VENTANA_LIMITE = 15

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Debes iniciar sesión para usar la App de Ideas' }, { status: 401 })
    }

    const body: IdeasGenerarInput = await req.json()

    if (!body.descripcionIdea || body.descripcionIdea.trim().length < 5) {
      return NextResponse.json({ error: 'Cuéntanos un poco más sobre tu idea o negocio' }, { status: 400 })
    }

    // Si pide documento final, primero validar el tope de 4 por semana
    if (body.generarDocumentoFinal) {
      const inicioVentana = new Date(Date.now() - DIAS_VENTANA_LIMITE * 24 * 60 * 60 * 1000).toISOString()
      const { count, error: countError } = await supabase
        .from('app_ideas_documentos')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', inicioVentana)

      if (countError) {
        console.error('No se pudo verificar el límite de documentos:', countError)
      } else if ((count || 0) >= LIMITE_DOCUMENTOS) {
        return NextResponse.json(
          { error: `Ya generaste tu documento de estos últimos ${DIAS_VENTANA_LIMITE} días. Vuelve a intentarlo más adelante, o sigue explorando ideas sin descargar el documento.` },
          { status: 429 }
        )
      }
    }

    // Construir el detalle de las herramientas usadas (solo las que el usuario llenó)
    const partesHerramientas: string[] = []

    if (body.sectorActual) {
      partesHerramientas.push(`Sector/industria actual del usuario: ${body.sectorActual}`)
    }

    if (body.matrizReinvencion && Object.values(body.matrizReinvencion).some(Boolean)) {
      partesHerramientas.push(`Respuestas de la Matriz de Reinvención:
- Qué eliminar: ${body.matrizReinvencion.eliminar || '(sin respuesta)'}
- Qué reducir: ${body.matrizReinvencion.reducir || '(sin respuesta)'}
- Qué incrementar: ${body.matrizReinvencion.incrementar || '(sin respuesta)'}
- Qué crear: ${body.matrizReinvencion.crear || '(sin respuesta)'}`)
    }

    if (body.tecnologiaSeleccionada) {
      partesHerramientas.push(`Tecnología emergente elegida para cruzar con el sector (Mapa de Convergencia Tecnológica): ${body.tecnologiaSeleccionada}`)
    }

    if (body.necesidadSeleccionada || body.formaSeleccionada) {
      partesHerramientas.push(`Brújula de Necesidades Humanas — necesidad humana a satisfacer: ${body.necesidadSeleccionada || '(sin elegir)'}, forma de satisfacerla: ${body.formaSeleccionada || '(sin elegir)'}`)
    }

    const contextoHerramientas = partesHerramientas.length > 0
      ? `\n\nEl usuario también usó estas herramientas de exploración, tenlas en cuenta como inspiración (no las menciones por nombre técnico en la respuesta, solo úsalas como insumo):\n${partesHerramientas.join('\n\n')}`
      : ''

    const prompt = `Eres un consultor experto en desarrollo de ideas de negocio y proyectos, especializado en Latinoamérica, subvenciones y cooperación internacional. Un usuario te describe una idea o negocio. Genera propuestas de proyecto concretas, realistas y accionables. Responde ÚNICAMENTE con un JSON válido (sin texto adicional, sin markdown, sin \`\`\`json), con exactamente esta forma:

{
  "ideas": [
    {
      "titulo": "<nombre corto y claro de la idea>",
      "descripcion": "<2-3 frases explicando en qué consiste>",
      "porQueFunciona": "<1-2 frases: por qué esta idea tiene potencial real>",
      "primerPaso": "<una acción concreta y específica para empezar esta semana>"
    }
    // exactamente 5 ideas, variadas entre sí
  ]${body.generarDocumentoFinal ? `,
  "notaConceptoMarkdown": "<documento en formato markdown, 1-2 páginas, con estas secciones: Resumen de la Idea, Problema que Resuelve, A Quién Ayuda, Cómo Funciona, Primeros Pasos Sugeridos, Posibles Fuentes de Financiación — listo para que el usuario lo use como punto de partida si decide estructurar el proyecto formalmente>` : ''}
}

LO QUE EL USUARIO CONTÓ SOBRE SU IDEA O NEGOCIO:
${body.descripcionIdea}${contextoHerramientas}`

    const respuestaIA = await callGemini(prompt)

    let resultado: IdeasResultado
    try {
      const jsonLimpio = respuestaIA.replace(/```json\n?|\n?```/g, '').trim()
      resultado = JSON.parse(jsonLimpio)
    } catch (parseError) {
      console.error('No se pudo interpretar la respuesta de la IA:', respuestaIA)
      throw new Error('No se pudieron generar las ideas, intenta de nuevo')
    }

    // Si era documento final, guardarlo (esto es lo que cuenta contra el tope de 4/semana)
    if (body.generarDocumentoFinal) {
      const { error: insertError } = await supabase.from('app_ideas_documentos').insert({
        user_id: user.id,
        sector_actual: body.sectorActual || null,
        descripcion_idea: body.descripcionIdea,
        matriz_reinvencion: body.matrizReinvencion || null,
        matriz_convergencia: body.tecnologiaSeleccionada ? { tecnologia: body.tecnologiaSeleccionada } : null,
        matriz_necesidades: (body.necesidadSeleccionada || body.formaSeleccionada)
          ? { necesidad: body.necesidadSeleccionada, forma: body.formaSeleccionada }
          : null,
        resultado
      })

      if (insertError) {
        console.error('No se pudo guardar el documento de ideas:', insertError)
      }
    }

    // Informar cuántos documentos le quedan esta semana
    const inicioVentanaActual = new Date(Date.now() - DIAS_VENTANA_LIMITE * 24 * 60 * 60 * 1000).toISOString()
    const { count: usadosAhora } = await supabase
      .from('app_ideas_documentos')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', inicioVentanaActual)

    resultado.documentosRestantesSemana = Math.max(0, LIMITE_DOCUMENTOS - (usadosAhora || 0))

    return NextResponse.json(resultado)
  } catch (error: any) {
    console.error('Error en /api/ideas/generar:', error)
    return NextResponse.json(
      { error: error.message || 'Error al generar las ideas' },
      { status: 500 }
    )
  }
}
