/**
 * Validación final.
 *
 * Pieza confirmada como pendiente el 9 de sep 2026 (pieza 20 del método,
 * "Verificador"): una revisión CUALITATIVA de todo el proyecto ya
 * estructurado, comparado contra lo que exige una convocatoria concreta,
 * justo antes de radicar.
 *
 * A PROPÓSITO NO DA PUNTAJE. El puntaje sobre 100 ya lo da el evaluador de
 * Motor 4 (`motorPostulacion.ts` → `prepararPaquete`). Esta pieza busca otra
 * cosa, más parecida a una lectura humana antes de enviar: vacíos genuinos
 * (la convocatoria pide algo concreto y el proyecto no lo cubre en ningún
 * lado) y párrafos que sí existen pero quedaron flojos, genéricos o poco
 * persuasivos PARA ESA CONVOCATORIA en particular — no para el proyecto en
 * general.
 *
 * Se corre sola, automáticamente, cada vez que se prepara o se vuelve a
 * preparar una postulación (la llama `prepararPostulacion` en
 * motorPostulacion.ts) — no depende de que nadie la pida aparte.
 *
 * REGLA DE ORO, igual que en el resto de los motores: nada de inventar. Si
 * el modelo no responde o el proyecto no tiene contenido, no se guarda nada
 * — nunca se reporta "todo bien" por defecto.
 */

import { callGemini } from '@/lib/gemini'
import type { ProyectoBase, FichaConvocatoria } from '@/lib/motorPostulacion'

export type TipoHallazgoValidacion = 'vacio' | 'parrafo_flojo'

export type HallazgoValidacion = {
  seccion: string
  descripcion: string
  tipo: TipoHallazgoValidacion
}

export type ResultadoValidacionFinal = {
  ok: boolean
  hallazgos?: HallazgoValidacion[]
  mensaje: string
}

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : ''
}

function interpretarJson(bruto: string): any | null {
  const limpio = texto(bruto).replace(/```json/gi, '').replace(/```/g, '')
  const inicio = limpio.indexOf('{')
  const fin = limpio.lastIndexOf('}')
  if (inicio === -1 || fin === -1 || fin <= inicio) return null
  try {
    return JSON.parse(limpio.slice(inicio, fin + 1))
  } catch {
    return null
  }
}

function construirPrompt(proyecto: ProyectoBase, convocatoria: FichaConvocatoria): string {
  return `Eres el VERIFICADOR CUALITATIVO final del sistema de Arquitectura Digital de Proyectos. Este es el último paso antes de radicar una postulación — ya existe un evaluador que puso un puntaje sobre 100; tu trabajo es otro y no llevas puntaje.

Lee el proyecto YA ESTRUCTURADO de abajo y compáralo contra lo que exige esta convocatoria concreta. Busca únicamente dos cosas:
1. VACÍOS: algo que la convocatoria pide explícitamente (en sus requisitos, línea temática, beneficiarios o términos de referencia) y que el proyecto no cubre en ningún lado.
2. PÁRRAFOS FLOJOS: contenido que sí existe pero quedó genérico, repetitivo o poco persuasivo para ESTA convocatoria en particular — no evalúes si está mal escrito en general, evalúa si convence a ESTE financiador puntual.

REGLAS QUE NO PUEDES ROMPER:
1. No inventes requisitos que la convocatoria no pidió.
2. No repitas aquí problemas de formato o de documentos por entregar — eso ya lo cubre el checklist de requisitos, que es aparte.
3. Sé exigente pero justo: si el proyecto ya cubre bien un punto, no lo reportes solo por reportar algo.
4. Máximo 15 hallazgos, priorizando los más importantes.

PROYECTO: ${proyecto.nombre}
Territorio: ${proyecto.territorio || 'no indicado'}

Árbol del proyecto:
${proyecto.arbol || 'todavía sin árbol'}

Cadena de valor:
${proyecto.cadenaValor || 'todavía sin cadena de valor'}

Dossier completo:
${proyecto.dossier || 'sin dossier'}

CONVOCATORIA A LA QUE VA A POSTULAR
- Nombre: ${convocatoria.nombre}
- Entidad: ${convocatoria.entidad || 'sin dato'}
- Beneficiarios que exige: ${convocatoria.beneficiarios || 'sin dato'}
- Territorio: ${convocatoria.territorio || 'sin dato'}
- Línea temática: ${convocatoria.lineaTematica || 'sin dato'}
- Requisitos conocidos: ${convocatoria.requisitos || 'sin dato'}
- Términos de referencia: ${convocatoria.terminosReferencia || 'sin dato'}

DEVUELVE ÚNICAMENTE UN JSON, sin explicaciones y sin marcas de código:
{
  "hallazgos": [
    { "seccion": "el área del proyecto donde está (ej. Objetivos, Presupuesto, Beneficiarios, Territorio)", "descripcion": "qué falta o qué está flojo, en una frase clara para el equipo", "tipo": "vacio|parrafo_flojo" }
  ]
}

Si de verdad no encuentras nada que reportar, devuelve "hallazgos": [].`
}

/**
 * Corre la validación cualitativa final para un proyecto frente a una
 * convocatoria concreta, y guarda el resultado. Pensada para llamarse desde
 * `prepararPostulacion`, en el mismo momento en que se prepara o se vuelve a
 * preparar esa postulación — nunca sola, siempre en el contexto de una
 * convocatoria específica (sin convocatoria no hay contra qué validar).
 */
export async function correrValidacionFinal(
  supabase: any,
  proyectoId: string,
  postulacionId: string | null,
  proyecto: ProyectoBase,
  convocatoria: FichaConvocatoria,
): Promise<ResultadoValidacionFinal> {
  if (!proyecto.arbol && !proyecto.dossier) {
    return { ok: false, mensaje: 'El proyecto todavía no tiene contenido estructurado para validar.' }
  }

  let datos: any = null
  try {
    datos = interpretarJson(await callGemini(construirPrompt(proyecto, convocatoria)))
  } catch (error) {
    console.error('[Validación final] No se pudo consultar el modelo:', error)
    return { ok: false, mensaje: 'No se pudo consultar el modelo para la validación final.' }
  }
  if (!datos) return { ok: false, mensaje: 'El modelo no devolvió un resultado interpretable.' }

  const hallazgos: HallazgoValidacion[] = (Array.isArray(datos.hallazgos) ? datos.hallazgos : [])
    .slice(0, 15)
    .map((h: any) => ({
      seccion: texto(h?.seccion) || 'General',
      descripcion: texto(h?.descripcion),
      tipo: h?.tipo === 'parrafo_flojo' ? 'parrafo_flojo' : 'vacio',
    }))
    .filter((h: HallazgoValidacion) => h.descripcion.length > 3)

  const { data: anterior } = await supabase
    .from('validaciones_finales')
    .select('id, corrida')
    .eq('proyecto_id', proyectoId)
    .eq('postulacion_id', postulacionId)
    .order('corrida', { ascending: false })
    .limit(1)
    .maybeSingle()

  const corrida = anterior ? (anterior.corrida || 1) + 1 : 1

  const { error } = await supabase.from('validaciones_finales').insert({
    proyecto_id: proyectoId,
    postulacion_id: postulacionId,
    convocatoria_nombre: convocatoria.nombre,
    corrida,
    hallazgos_json: hallazgos,
  })

  if (error) {
    console.error('[Validación final] No se pudo guardar:', error)
    return { ok: false, mensaje: 'No se pudo guardar la validación final.' }
  }

  return {
    ok: true,
    hallazgos,
    mensaje:
      hallazgos.length === 0
        ? 'Validación final: sin hallazgos.'
        : `Validación final: ${hallazgos.length} punto(s) para revisar antes de radicar.`,
  }
}
