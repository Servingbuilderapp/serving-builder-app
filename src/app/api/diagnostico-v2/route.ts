import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callGemini } from '@/lib/gemini'

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
    // hasta 3 mecanismos: capital semilla, cooperación internacional, becas/premios, cofinanciación, crédito/inversión
  ],
  "brechasCriticas": ["<brecha 1>", "<brecha 2>", "<brecha 3>"],
  "pasosRecomendados": ["<paso 1>", "<paso 2>", "<paso 3>"],
  "ejesRueda": [
    { "label": "Claridad de la Idea", "score": <0-10>, "recomendacion": "<1 frase corta y clara de qué hacer para mejorar este eje>" },
    { "label": "Viabilidad", "score": <0-10>, "recomendacion": "<1 frase>" },
    { "label": "Innovación/Diferenciación", "score": <0-10>, "recomendacion": "<1 frase>" },
    { "label": "Encaje con el Público", "score": <0-10>, "recomendacion": "<1 frase>" },
    { "label": "Recursos y Capacidad", "score": <0-10>, "recomendacion": "<1 frase>" }
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
Estrategia de escalabilidad: ${data.estrategiaEscalabilidad}`

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
      resultado.ejesRueda = [
        { label: 'Claridad de la Idea', score: scorePromedio, recomendacion: 'Vuelve a generar el diagnóstico para una recomendación más precisa en este eje.' },
        { label: 'Viabilidad', score: scorePromedio, recomendacion: 'Vuelve a generar el diagnóstico para una recomendación más precisa en este eje.' },
        { label: 'Innovación/Diferenciación', score: scorePromedio, recomendacion: 'Vuelve a generar el diagnóstico para una recomendación más precisa en este eje.' },
        { label: 'Encaje con el Público', score: scorePromedio, recomendacion: 'Vuelve a generar el diagnóstico para una recomendación más precisa en este eje.' },
        { label: 'Recursos y Capacidad', score: scorePromedio, recomendacion: 'Vuelve a generar el diagnóstico para una recomendación más precisa en este eje.' },
      ]
    }

    // Guardar el diagnóstico como cliente potencial
    try {
      const supabase = await createClient()
      await supabase.from('diagnosticos').insert({
        nombre: data.nombreRepresentante,
        empresa: data.nombreEmpresa,
        email: data.email,
        whatsapp: data.whatsapp,
        tipo_proyecto: data.nombreProyecto,
        estado_legal: data.documentoIdentidad,
        tipo_financiamiento: resultado.mecanismosSugeridos?.[0]?.nombre || 'no_definido',
        monto_objetivo: `${data.presupuesto} ${data.moneda}`,
        descripcion: data.descripcionGeneral,
        score_preparacion_convocatorias: resultado.scoreGeneral,
        plan_recomendado: resultado.scoreGeneral >= 70 ? 'completo' : 'esencial',
      })
    } catch (dbError) {
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
