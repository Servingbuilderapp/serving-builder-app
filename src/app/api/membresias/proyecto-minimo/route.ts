import { NextResponse } from 'next/server'
import { consumirBeneficio } from '@/lib/membresiasConsumo'
import { contextoMiembro } from '@/lib/membresiasServicios'
import { generarNotaDesdeRespuestas, type IdiomaNota, type RespuestasNota } from '@/lib/motorNotaConceptoMiembro'
import { TEMAS_NOTA_CONCEPTO } from '@/lib/motorNotaConcepto'

export const maxDuration = 120

const CLAVES_OBLIGATORIAS = ['problema_central', 'poblacion_objetivo', 'solucion_propuesta'] as const
const MINIMO_CARACTERES = 30
const MAXIMO_CARACTERES = 1500

/**
 * El miembro responde las preguntas guiadas y la IA arma su Proyecto Mínimo Viable.
 * Descuenta 1 del cupo mensual SOLO si el documento se generó bien.
 */
export async function POST(req: Request) {
  try {
    const ctx = await contextoMiembro()
    if (!ctx.correo) return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })

    const cuerpo = await req.json()
    const nombreProyecto = typeof cuerpo?.nombreProyecto === 'string' ? cuerpo.nombreProyecto.trim().slice(0, 150) : ''
    const idioma: IdiomaNota = cuerpo?.idioma === 'es_en' ? 'es_en' : 'es'
    if (!nombreProyecto) return NextResponse.json({ error: 'Escribe el nombre de tu proyecto.' }, { status: 400 })

    const respuestas = {} as RespuestasNota
    for (const { clave } of TEMAS_NOTA_CONCEPTO) {
      const v = cuerpo?.respuestas?.[clave]
      respuestas[clave] = typeof v === 'string' ? v.trim().slice(0, MAXIMO_CARACTERES) : ''
    }
    for (const clave of CLAVES_OBLIGATORIAS) {
      if (respuestas[clave].length < MINIMO_CARACTERES) {
        return NextResponse.json(
          { error: 'Cuéntanos un poco más en el problema, la población y la solución (al menos una o dos frases cada una).' },
          { status: 400 },
        )
      }
    }

    if (!ctx.esEquipo) {
      const revision = await consumirBeneficio(ctx.servicio, ctx.correo, 'proyecto_minimo', null, true)
      if (!revision.ok) return NextResponse.json({ error: revision.mensaje }, { status: 409 })
    }

    const resultado = await generarNotaDesdeRespuestas(nombreProyecto, respuestas, idioma)
    if (!resultado.ok || !resultado.documento) return NextResponse.json({ error: resultado.mensaje }, { status: 422 })
    const documento = resultado.documento
      .replace('# Nota de Concepto', '# Proyecto Mínimo Viable')
      .replace('# Concept Note', '# Minimum Viable Project')

    if (ctx.esEquipo) {
      return NextResponse.json({ success: true, documento, faltantes: resultado.faltantes || [], restante: null, prueba: true })
    }

    const consumo = await consumirBeneficio(ctx.servicio, ctx.correo, 'proyecto_minimo', `pmv:${nombreProyecto}`)
    if (!consumo.ok) return NextResponse.json({ error: consumo.mensaje }, { status: 409 })

    const { error } = await ctx.servicio.from('membresias_proyectos_minimos').insert({
      membresia_id: consumo.membresiaId,
      correo_cliente: ctx.correo,
      nombre_proyecto: nombreProyecto,
      idioma,
      respuestas,
      documento,
    })
    if (error) console.error('No se pudo guardar el proyecto mínimo viable:', error)

    return NextResponse.json({ success: true, documento, faltantes: resultado.faltantes || [], restante: consumo.restante })
  } catch (error: unknown) {
    console.error('Error generando proyecto mínimo viable:', error)
    return NextResponse.json({ error: 'No se pudo generar el proyecto. Intenta de nuevo.' }, { status: 500 })
  }
}
