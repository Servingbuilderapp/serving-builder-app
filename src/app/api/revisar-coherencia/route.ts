import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { motorAutorizado } from '@/lib/candadoMotores'
import { callGemini } from '@/lib/gemini'

/**
 * REVISIÓN DE COHERENCIA — un asistente interno que lee el proyecto YA estructurado y revisa que
 * cuente una sola historia: problema → objetivos → actividades → presupuesto → cronograma.
 *
 * Cuando encuentra una incoherencia, deja una sugerencia ya redactada en «Sugerencias para
 * fortalecer tu proyecto» (el cliente la usa, la corrige o la deja). Nunca frena el proceso ni
 * cambia nada por su cuenta: el equipo solo interviene si algo se ve mal.
 *
 * Corre una vez al día y revisa pocos proyectos por vuelta, para que el gasto de IA sea predecible.
 * Un proyecto se revisa una sola vez (si la IA falla, reintenta hasta 3 días y se rinde).
 * Prueba sin gastar IA: /api/revisar-coherencia?probar=1
 */

export const maxDuration = 300

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const POR_CORRIDA = 3
const MAX_INTENTOS = 3
const HECHO = 99
const TEMAS = ['Problema', 'Objetivos', 'Solución y actividades', 'Presupuesto', 'Cronograma', 'Coherencia general'] as const

const PROMPT = `Eres un revisor de coherencia de proyectos para convocatorias y cooperación. Recibes el proyecto ya estructurado, paso por paso. Tu trabajo es encontrar lo que NO cuadra entre sus partes, para que un analista pueda defenderlo.

Revisa, en este orden:
1. Que cada objetivo responda a una causa o parte del problema planteado.
2. Que cada objetivo tenga actividades que lo hagan posible, y que cada actividad sirva a algún objetivo.
3. Que cada actividad importante tenga un rubro en el presupuesto, y que el total del presupuesto sea consistente con lo que se promete.
4. Que el cronograma alcance para las actividades (orden lógico, duraciones razonables, plazo total coherente).
5. Que las metas e indicadores sean medibles y estén conectados con los objetivos.
6. Que la población, el territorio, las cifras y los nombres sean los mismos en todos los pasos.

Para CADA incoherencia real (máximo 5, solo las más importantes) devuelve:
- "tema": uno de ${TEMAS.join(' | ')}.
- "hallazgo": en una o dos frases sencillas, qué no cuadra y dónde (menciona los pasos).
- "propuesta": el texto corregido YA REDACTADO, en primera persona como si lo escribiera el cliente, listo para usar (máximo 120 palabras).

Reglas: usa SOLO lo que dice el proyecto; no inventes cifras, nombres ni fechas. Si el arreglo necesita un dato que solo el cliente sabe, escribe [COMPLETAR: qué dato falta]. Si algo está bien, no lo menciones. Si todo es coherente, devuelve una lista vacía. Lenguaje simple.

Responde ÚNICAMENTE con un JSON válido, sin texto antes ni después:
{ "incoherencias": [ { "tema": "...", "hallazgo": "...", "propuesta": "..." } ] }`

type Proyecto = { id: string; nombre_iniciativa: string | null }

export async function GET(req: NextRequest) {
  try {
    if (!(await motorAutorizado(req, null))) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const soloProbar = req.nextUrl.searchParams.get('probar') === '1'

    const { error: errorTabla } = await supabase.from('sugerencias_cambio').select('origen').limit(1)
    if (errorTabla) {
      return NextResponse.json(
        { error: 'Falta correr en Supabase el SQL que agrega la columna origen a sugerencias_cambio. No se revisó nada.', detalle: errorTabla.message },
        { status: 500 },
      )
    }

    const { data: filas, error } = await supabase
      .from('proyectos_clientes_serving')
      .select('id, nombre_iniciativa')
      .eq('listo_para_encaje', true)
      .order('created_at', { ascending: false })
      .limit(300)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const proyectos = (filas || []) as Proyecto[]

    const { data: marcas } = proyectos.length
      ? await supabase
          .from('seguimientos_cliente')
          .select('proyecto_id, veces')
          .eq('clave', 'coherencia')
          .in('proyecto_id', proyectos.map((p) => String(p.id)))
      : { data: [] }
    const intentos = new Map(((marcas || []) as { proyecto_id: string; veces: number }[]).map((m) => [String(m.proyecto_id), m.veces]))
    const pendientes = proyectos.filter((p) => (intentos.get(String(p.id)) || 0) < MAX_INTENTOS)

    if (soloProbar) {
      return NextResponse.json({ ok: true, modo: 'prueba (no se gastó IA)', por_revisar: pendientes.length, proximos: pendientes.slice(0, POR_CORRIDA).map((p) => p.nombre_iniciativa) })
    }

    const { data: pasos } = await supabase.from('pasos_estructuracion').select('id, nombre_paso, orden_secuencia').order('orden_secuencia', { ascending: true })
    const nombrePaso = (id: number) => pasos?.find((p) => p.id === id)?.nombre_paso || `paso ${id}`

    const resultado: { proyecto: string | null; hallazgos: number | string }[] = []
    for (const p of pendientes.slice(0, POR_CORRIDA)) {
      const id = String(p.id)
      try {
        const { data: contenido } = await supabase.from('contenido_pasos_proyecto').select('id_paso, contenido').eq('id_proyecto', id)
        const texto = (contenido || [])
          .sort((a, b) => Number(a.id_paso) - Number(b.id_paso))
          .map((c) => `--- ${nombrePaso(c.id_paso)} ---\n${String(c.contenido || '').slice(0, 2500)}`)
          .join('\n\n')
          .slice(0, 70000)
        if (texto.length < 500) {
          resultado.push({ proyecto: p.nombre_iniciativa, hallazgos: 'sin contenido suficiente todavía' })
          continue
        }

        const bruto = await callGemini(`${PROMPT}\n\nPROYECTO: ${p.nombre_iniciativa || 'sin nombre'}\n\n${texto}`)
        const json = bruto.match(/\{[\s\S]*\}/)?.[0]
        if (!json) throw new Error('La IA no devolvió un formato válido')
        const lista = ((JSON.parse(json) as { incoherencias?: { tema?: string; hallazgo?: string; propuesta?: string }[] }).incoherencias || [])
          .filter((s) => s.tema && s.hallazgo && s.propuesta && (TEMAS as readonly string[]).includes(String(s.tema)))
          .slice(0, 5)

        if (lista.length > 0) {
          const { data: ultimo } = await supabase.from('sugerencias_cambio').select('orden').eq('id_proyecto', id).order('orden', { ascending: false }).limit(1).maybeSingle()
          const base = Number(ultimo?.orden || 0)
          const { error: errorInsertar } = await supabase.from('sugerencias_cambio').insert(
            lista.map((s, i) => ({
              id_proyecto: id,
              orden: base + i + 1,
              tema: String(s.tema),
              hallazgo: String(s.hallazgo),
              propuesta: String(s.propuesta),
              estado: 'pendiente',
              origen: 'coherencia',
            })),
          )
          if (errorInsertar) throw new Error(errorInsertar.message)
        }
        await supabase.from('seguimientos_cliente').upsert({ proyecto_id: id, clave: 'coherencia', veces: HECHO, ultimo_envio: new Date().toISOString() }, { onConflict: 'proyecto_id,clave' })
        resultado.push({ proyecto: p.nombre_iniciativa, hallazgos: lista.length })
      } catch (e) {
        await supabase
          .from('seguimientos_cliente')
          .upsert({ proyecto_id: id, clave: 'coherencia', veces: (intentos.get(id) || 0) + 1, ultimo_envio: new Date().toISOString() }, { onConflict: 'proyecto_id,clave' })
        resultado.push({ proyecto: p.nombre_iniciativa, hallazgos: `falló: ${(e as Error).message}` })
      }
    }

    return NextResponse.json({ ok: true, revisados: resultado.length, quedan_por_revisar: Math.max(0, pendientes.length - resultado.length), resultado })
  } catch (e) {
    console.error('[revisar-coherencia]', e)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
