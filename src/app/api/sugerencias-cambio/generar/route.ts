import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { motorAutorizado } from '@/lib/candadoMotores'
import { callGemini } from '@/lib/gemini'

/**
 * DOCUMENTO DE SUGERENCIAS DE CAMBIO.
 *
 * Después del diagnóstico, a cada cliente se le entrega una lista de ajustes YA REDACTADOS para
 * que los corrija o los acepte (no solo se le dice «debes cambiar esto»). Se hace una sola vez
 * por proyecto: si ya existen sugerencias, no vuelve a llamar a la IA.
 *
 * La IA solo trabaja con lo que el cliente ya dijo (diagnóstico y, si existe, lo ya estructurado).
 * Donde falta un dato que solo el cliente sabe, deja un hueco marcado [COMPLETAR: ...] en vez de inventarlo.
 */

export const maxDuration = 120

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const TEMAS = ['Problema', 'Objetivos', 'Solución y actividades', 'Presupuesto', 'Cronograma', 'Coherencia general'] as const

const PROMPT = `Eres parte del sistema de Arquitectura Digital de Proyectos. Eres el aliado del cliente: tu trabajo es mejorar su proyecto antes de estructurarlo, para que un analista pueda defenderlo ante una convocatoria.

Recibes lo que el cliente dijo en su diagnóstico y, si existe, lo que ya está estructurado de su proyecto. Revisa estos seis temas, en este orden: ${TEMAS.join(', ')}.
Para CADA tema donde veas algo que mejorar, escribe una sugerencia con:
- "tema": uno de los seis nombres exactos.
- "hallazgo": en una o dos frases sencillas, qué falla o qué falta (por ejemplo: el problema es muy general, los objetivos no se pueden medir, el presupuesto no cuadra con las actividades, el cronograma no alcanza para lo prometido).
- "propuesta": el texto YA REDACTADO, en primera persona como si lo escribiera el cliente, listo para que lo corrija (máximo 120 palabras).

Reglas:
- Usa SOLO lo que dicen las fuentes. Nunca inventes cifras, nombres, fechas, lugares ni montos.
- Si para mejorar falta un dato que solo el cliente sabe, déjalo escrito así: [COMPLETAR: qué dato falta].
- Revisa la coherencia: que el problema, los objetivos, las soluciones, el presupuesto y el cronograma cuenten la misma historia.
- Si un tema ya está bien, no lo incluyas. Si nada se puede mejorar, devuelve una lista vacía.
- Lenguaje simple, sin jerga.

Responde ÚNICAMENTE con un JSON válido, sin texto antes ni después:
{ "sugerencias": [ { "tema": "...", "hallazgo": "...", "propuesta": "..." } ] }`

export async function POST(req: NextRequest) {
  try {
    const { id_proyecto } = (await req.json().catch(() => ({}))) as { id_proyecto?: string }
    if (!id_proyecto) return NextResponse.json({ error: 'Falta id_proyecto' }, { status: 400 })
    if (!(await motorAutorizado(req, id_proyecto))) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    // Una sola vez por proyecto.
    const { count: yaHay, error: errorLeer } = await supabase
      .from('sugerencias_cambio')
      .select('id', { count: 'exact', head: true })
      .eq('id_proyecto', id_proyecto)
    if (errorLeer) {
      return NextResponse.json({ error: 'Falta crear la tabla sugerencias_cambio en Supabase.', detalle: errorLeer.message }, { status: 500 })
    }
    if ((yaHay || 0) > 0) return NextResponse.json({ ok: true, creadas: 0, mensaje: 'Ya estaban preparadas.' })

    const { data: proyecto } = await supabase
      .from('proyectos_clientes_serving')
      .select('nombre_iniciativa, correo_cliente')
      .eq('id', id_proyecto)
      .maybeSingle<{ nombre_iniciativa: string | null; correo_cliente: string | null }>()
    const correo = String(proyecto?.correo_cliente || '').trim()

    // Fuente 1: el diagnóstico (sin datos personales).
    let bloqueDiag = ''
    if (correo) {
      const { data: diag } = await supabase
        .from('diagnosticos')
        .select('datos_formulario, resultado_completo')
        .ilike('email', correo)
        .not('datos_formulario', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      const datos = diag?.datos_formulario
      if (datos && typeof datos === 'object') {
        bloqueDiag += Object.entries(datos as Record<string, unknown>)
          .filter(([k, v]) => !/documento|identidad|correo|email|tel[eé]fono|whats|contrase|password/i.test(k) && ((typeof v === 'string' && v.trim()) || typeof v === 'number'))
          .map(([k, v]) => `- ${k}: ${String(v).trim().slice(0, 1500)}`)
          .join('\n')
          .slice(0, 6000)
      }
      const analisis = diag?.resultado_completo as { justificacionNivel?: string; resumen?: string } | null
      const lecturaIA = [analisis?.justificacionNivel, analisis?.resumen].filter(Boolean).join('\n')
      if (lecturaIA) bloqueDiag += `\n\nLectura del diagnóstico:\n${String(lecturaIA).slice(0, 2500)}`
    }

    // Fuente 2: lo que ya esté estructurado del proyecto (si el motor ya corrió).
    const { data: contenido } = await supabase.from('contenido_pasos_proyecto').select('id_paso, contenido').eq('id_proyecto', id_proyecto)
    const estructurado = (contenido || [])
      .map((c) => String(c.contenido || '').slice(0, 1800))
      .join('\n---\n')
      .slice(0, 20000)

    if (!bloqueDiag && !estructurado) {
      return NextResponse.json({ ok: true, creadas: 0, mensaje: 'Todavía no hay información del proyecto para revisar.' })
    }

    const texto = `${PROMPT}\n\nPROYECTO: ${proyecto?.nombre_iniciativa || 'sin nombre'}\n\nDIAGNÓSTICO DEL CLIENTE:\n${bloqueDiag || '(vacío)'}\n\nLO YA ESTRUCTURADO:\n${estructurado || '(todavía nada)'}`
    const bruto = await callGemini(texto)
    const json = bruto.match(/\{[\s\S]*\}/)?.[0]
    if (!json) return NextResponse.json({ error: 'La IA no devolvió un formato válido. Intenta de nuevo.' }, { status: 502 })
    const lista = ((JSON.parse(json) as { sugerencias?: { tema?: string; hallazgo?: string; propuesta?: string }[] }).sugerencias || [])
      .filter((s) => s.tema && s.hallazgo && s.propuesta && (TEMAS as readonly string[]).includes(String(s.tema)))
      .slice(0, 6)

    if (lista.length === 0) {
      // Nada que mejorar: se deja una marca para no volver a gastar IA.
      await supabase.from('sugerencias_cambio').insert({
        id_proyecto,
        orden: 0,
        tema: 'Coherencia general',
        hallazgo: 'Revisamos tu proyecto y por ahora no vemos cambios que sugerir.',
        propuesta: '',
        estado: 'descartada',
      })
      return NextResponse.json({ ok: true, creadas: 0 })
    }

    const filas = lista.map((s, i) => ({
      id_proyecto,
      orden: i + 1,
      tema: String(s.tema),
      hallazgo: String(s.hallazgo),
      propuesta: String(s.propuesta),
      estado: 'pendiente',
    }))
    const { error } = await supabase.from('sugerencias_cambio').insert(filas)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, creadas: filas.length })
  } catch (e) {
    console.error('[sugerencias-cambio/generar]', e)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
