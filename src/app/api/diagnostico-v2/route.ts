import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { callGemini } from '@/lib/gemini'
import { CRITERIOS_ADN } from '@/lib/relojProyecto'

export const maxDuration = 60

export interface DiagnosticoInputV2 {
  // Datos del solicitante
  nombreEmpresa: string
  nombreRepresentante: string
  documentoIdentidad: string
  email: string
  whatsapp: string
  ciudadPais: string

  // Caracterización del proyecto
  nombreProyecto: string
  beneficiarios: string
  ubicacionProyecto: string
  problema: string
  solucion: string
  objetivoGeneral: string
  objetivosEspecificos: string
  descripcionGeneral: string

  // Requerimientos, viabilidad y sostenibilidad
  presupuesto: string
  moneda: string
  fasesProyecto: string
  tiempoEjecucion: string
  resultadosEsperados: string
  modeloSostenibilidad: string
  estrategiaEscalabilidad: string

  // ADN de la iniciativa (los 6 criterios de autoevaluación). Opcionales: los diagnósticos
  // viejos no los traen. Los cuatro primeros los escoge el cliente; escala de recursos sale
  // del presupuesto y el tiempo de ejecución.
  tipoOrganizacion?: string
  naturalezaIniciativa?: string
  capacidadInstalada?: string
  etapaMadurez?: string
  alcance?: string
}

export interface SectorSugerido {
  nombre: string
  porcentaje: number
}

export interface MecanismoSugerido {
  nombre: string
  porcentaje: number
  descripcion: string
}

export interface EjeRueda {
  label: string
  score: number
  recomendacion: string
}

export interface DiagnosticoResultadoV2 {
  scoreGeneral: number
  esViable: boolean
  resumenEjecutivo: string
  sectoresSugeridos: SectorSugerido[]
  mecanismosSugeridos: MecanismoSugerido[]
  brechasCriticas: string[]
  pasosRecomendados: string[]
  notaConceptoMarkdown: string
  ejesRueda: EjeRueda[]
  /** Etapa de madurez (1 a 4) = la manecilla del Reloj del proyecto. Falta en diagnósticos viejos. */
  nivelMadurez?: number
  /** Por qué la IA puso esa etapa; sobre todo si es distinta a la que declaró el cliente. */
  justificacionNivel?: string
  /** Código largo al azar del enlace personal del cliente (se agrega al guardar). */
  codigoAcceso?: string
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data: DiagnosticoInputV2 = body

    const prompt = `Eres un analista experto en estructuración de proyectos para postulación a fondos, subvenciones, cooperación internacional y capital semilla en Latinoamérica. Analiza el siguiente proyecto y responde ÚNICAMENTE con un JSON válido (sin texto adicional, sin markdown, sin \`\`\`json), con exactamente esta forma:

{
  "scoreGeneral": <número entero 0-100, qué tan viable/preparado está el proyecto>,
  "esViable": <true o false>,
  "resumenEjecutivo": "<3-4 frases resumiendo el proyecto y su potencial>",
  "sectoresSugeridos": [
    { "nombre": "<sector, ej: Educación>", "porcentaje": <0-100> }
    // hasta 4 sectores, el de mayor porcentaje es el principal, ordenados de mayor a menor
  ],
  "mecanismosSugeridos": [
    { "nombre": "<ej: Capital Semilla / Fondo Emprender>", "porcentaje": <0-100>, "descripcion": "<1 frase de por qué>" }
    // hasta 3 mecanismos, escogidos SOLO entre estas seis fuentes: cooperación internacional, convocatorias públicas, fundaciones, crowdfunding, banca de desarrollo, inversión privada
  ],
  "brechasCriticas": ["<brecha 1>", "<brecha 2>", "<brecha 3>"],
  "pasosRecomendados": ["<paso 1>", "<paso 2>", "<paso 3>"],
  "nivelMadurez": <entero 1, 2, 3 o 4: 1 = idea inicial (evidencia baja), 2 = validación o plan piloto (evidencia media), 3 = escalamiento (evidencia medio-alta), 4 = consolidación (evidencia alta). Decídelo por la EVIDENCIA que describe el cliente, no solo por lo que él declaró>,
  "justificacionNivel": "<1 o 2 frases simples de por qué esa etapa. Si es distinta a la que declaró el cliente, dilo con respeto y explica la evidencia>",
  "ejesRueda": [
    { "label": "Tipo de organización", "score": <0-10>, "recomendacion": "<empieza con lo que detectaste, ej: 'Detectamos: ONG.' y luego 1 frase sobre qué tan bien coincide este tipo de organización con las fuentes de dinero que le convienen>" },
    { "label": "Naturaleza", "score": <0-10>, "recomendacion": "<empieza con lo que detectaste (impacto social, ambiental, retorno financiero, híbrido u otra) y 1 frase de si coincide con la fuente sugerida; si hay choque, señálalo>" },
    { "label": "Capacidad", "score": <0-10>, "recomendacion": "<empieza con lo que detectaste; 1 frase sobre si podría cumplir los requisitos administrativos y de reporte, y si le conviene un aliado>" },
    { "label": "Etapa de madurez", "score": <0-10, coherente con nivelMadurez: 1 → 2 a 3, 2 → 4 a 5, 3 → 6 a 8, 4 → 9 a 10>, "recomendacion": "<empieza con la etapa, ej: 'Etapa: validación.' y 1 frase de qué evidencia le falta para subir>" },
    { "label": "Alcance", "score": <0-10>, "recomendacion": "<empieza con lo que detectaste (geografía y sector) y 1 frase de si está bien definido>" },
    { "label": "Escala", "score": <0-10>, "recomendacion": "<empieza con monto y plazo, y 1 frase de si son realistas para su etapa>" }
  ],
  "notaConceptoMarkdown": "<una nota concepto profesional en formato markdown, de 1 a 5 páginas equivalentes de extensión, con secciones: Resumen Ejecutivo, Problema, Solución, Objetivos, Beneficiarios, Presupuesto Estimado, Resultados Esperados, Sostenibilidad y Escalabilidad — lista para usarse como base de un pitch deck. IMPORTANTE: escribe este campo AL FINAL, después de completar todos los demás campos del JSON>"
}

DATOS DEL PROYECTO:
Nombre del proyecto: ${data.nombreProyecto}
Beneficiarios: ${data.beneficiarios}
Ubicación: ${data.ubicacionProyecto}
Problema que resuelve: ${data.problema}
Solución propuesta: ${data.solucion}
Objetivo general: ${data.objetivoGeneral}
Objetivos específicos: ${data.objetivosEspecificos}
Descripción general: ${data.descripcionGeneral}
Presupuesto: ${data.presupuesto} ${data.moneda}
Fases del proyecto: ${data.fasesProyecto}
Tiempo estimado de ejecución: ${data.tiempoEjecucion}
Resultados esperados: ${data.resultadosEsperados}
Modelo de sostenibilidad: ${data.modeloSostenibilidad}
Estrategia de escalabilidad: ${data.estrategiaEscalabilidad}

ADN DE LA INICIATIVA (lo que declaró el cliente; puede venir vacío):
Tipo de organización: ${data.tipoOrganizacion || 'no indicó'}
Naturaleza de la iniciativa: ${data.naturalezaIniciativa || 'no indicó'}
Capacidad instalada (cumplir requisitos administrativos y de reporte): ${data.capacidadInstalada || 'no indicó'}
Etapa de madurez declarada: ${data.etapaMadurez || 'no indicó'}
Alcance (geografía y sector): ${data.alcance || 'no indicó'}`

    const respuestaIA = await callGemini(prompt)

    let resultado: DiagnosticoResultadoV2
    try {
      const jsonLimpio = respuestaIA.replace(/```json\n?|\n?```/g, '').trim()
      resultado = JSON.parse(jsonLimpio)
    } catch (parseError) {
      console.error('No se pudo interpretar la respuesta de la IA:', respuestaIA)
      throw new Error('La IA no devolvió un formato válido, intenta de nuevo')
    }

    // Respaldo: si por cualquier motivo la IA no devolvió ejesRueda (ej. respuesta cortada
    // por longitud), lo calculamos aquí mismo a partir del score general para que la Rueda
    // de Diagnóstico nunca desaparezca en silencio.
    if (!resultado.ejesRueda || resultado.ejesRueda.length === 0) {
      const scorePromedio = (resultado.scoreGeneral || 50) / 10
      resultado.ejesRueda = CRITERIOS_ADN.map((label) => ({
        label,
        score: scorePromedio,
        recomendacion: 'Vuelve a generar el diagnóstico para una recomendación más precisa en este criterio.',
      }))
    }

    // La etapa debe ser un número de 1 a 4. Si la IA no la devolvió bien, se toma la que declaró
    // el cliente y, si tampoco, la 1 (la más prudente).
    const nivelIA = Math.round(Number(resultado.nivelMadurez))
    if (!(nivelIA >= 1 && nivelIA <= 4)) {
      const declarada = String(data.etapaMadurez || '').toLowerCase()
      resultado.nivelMadurez = declarada.includes('consolid')
        ? 4
        : declarada.includes('escal')
          ? 3
          : declarada.includes('valid') || declarada.includes('piloto')
            ? 2
            : 1
    } else {
      resultado.nivelMadurez = nivelIA
    }

    // Guardar el diagnóstico COMPLETO (resultado + lo que escribió el cliente) con un código
    // al azar. Se guarda con la llave de servicio para no depender de permisos de lectura.
    const codigoAcceso = randomBytes(18).toString('base64url')
    try {
      const filaBasica = {
        nombre: data.nombreRepresentante,
        empresa: data.nombreEmpresa,
        email: (data.email || '').trim().toLowerCase(),
        whatsapp: data.whatsapp,
        tipo_proyecto: data.nombreProyecto,
        estado_legal: data.documentoIdentidad,
        tipo_financiamiento: resultado.mecanismosSugeridos?.[0]?.nombre || 'no_definido',
        monto_objetivo: `${data.presupuesto} ${data.moneda}`,
        descripcion: data.descripcionGeneral,
        score_preparacion_convocatorias: resultado.scoreGeneral,
        plan_recomendado: resultado.scoreGeneral >= 70 ? 'completo' : 'esencial',
      }
      const { error: dbError } = await supabaseAdmin.from('diagnosticos').insert({
        ...filaBasica,
        codigo_acceso: codigoAcceso,
        resultado_completo: resultado,
        datos_formulario: data,
      })
      if (dbError) {
        // Si todavía no se corrió el SQL de columnas nuevas, no se pierde el cliente potencial:
        // se guarda la fila de siempre y el resultado sale sin enlace personal.
        console.error('No se pudo guardar el resultado completo:', dbError)
        const { error: errorBasico } = await supabaseAdmin.from('diagnosticos').insert(filaBasica)
        if (errorBasico) throw errorBasico
      } else {
        resultado.codigoAcceso = codigoAcceso
      }
    } catch (dbError) {
      // Si no se pudo guardar, el cliente igual ve su resultado, pero sin enlace personal.
      console.error('No se pudo guardar el diagnóstico:', dbError)
    }

    return NextResponse.json(resultado)
  } catch (error: any) {
    console.error('Error en /api/diagnostico-v2:', error)
    return NextResponse.json(
      { error: error.message || 'Error al procesar el diagnóstico' },
      { status: 500 }
    )
  }
}
