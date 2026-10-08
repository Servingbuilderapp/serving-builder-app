import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { consumirBeneficio } from '@/lib/membresiasConsumo'
import { esEquipoServing } from '@/lib/guardiaEquipo'
import { generarNotaDesdeRespuestas, type IdiomaNota, type RespuestasNota } from '@/lib/motorNotaConceptoMiembro'
import { TEMAS_NOTA_CONCEPTO } from '@/lib/motorNotaConcepto'

export const maxDuration = 120

/** Cuánto como mínimo debe escribir el miembro en las tres preguntas que sostienen la nota. */
const CLAVES_OBLIGATORIAS = ['problema_central', 'poblacion_objetivo', 'solucion_propuesta'] as const
const MINIMO_CARACTERES = 30
const MAXIMO_CARACTERES = 1500

/**
 * El miembro responde el formulario corto y la IA redacta su Nota de Concepto.
 * Descuenta 1 del cupo "Notas de concepto" SOLO si la nota se generó bien.
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })

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

    const servicio = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // El equipo de Serving prueba sin membresía: se genera la nota, sin cupo y sin guardar.
    const esEquipo = await esEquipoServing()

    // 1) Se revisa el cupo ANTES de gastar IA.
    if (!esEquipo) {
      const revision = await consumirBeneficio(servicio, user.email, 'nota_concepto', null, true)
      if (!revision.ok) return NextResponse.json({ error: revision.mensaje }, { status: 409 })
    }

    // 2) Se genera la nota.
    const nota = await generarNotaDesdeRespuestas(nombreProyecto, respuestas, idioma)
    if (!nota.ok || !nota.documento) return NextResponse.json({ error: nota.mensaje }, { status: 422 })

    if (esEquipo) {
      return NextResponse.json({ success: true, documento: nota.documento, faltantes: nota.faltantes || [], restante: null, prueba: true })
    }

    // 3) Recién ahora se descuenta, y se guarda la nota.
    const consumo = await consumirBeneficio(servicio, user.email, 'nota_concepto', `nota:${nombreProyecto}`)
    if (!consumo.ok) return NextResponse.json({ error: consumo.mensaje }, { status: 409 })

    const { error } = await servicio.from('membresias_notas_concepto').insert({
      membresia_id: consumo.membresiaId,
      correo_cliente: user.email.toLowerCase(),
      nombre_proyecto: nombreProyecto,
      idioma,
      respuestas,
      documento: nota.documento,
    })
    if (error) console.error('No se pudo guardar la nota del miembro:', error)

    return NextResponse.json({
      success: true,
      documento: nota.documento,
      faltantes: nota.faltantes || [],
      restante: consumo.restante,
    })
  } catch (error: unknown) {
    console.error('Error generando nota de concepto del miembro:', error)
    return NextResponse.json({ error: 'No se pudo generar la nota. Intenta de nuevo.' }, { status: 500 })
  }
}
