import { NextResponse } from 'next/server'
import { createClient as crearClienteServicio } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { callGemini } from '@/lib/gemini'
import {
  CAMPOS_FICHA_IA,
  LIMITE_DIARIO_IA,
  armarPromptFicha,
  armarPromptIdeas,
  datosBaseIA,
  interpretarFicha,
  interpretarIdeas,
  leerJSON,
  type CampoFichaIA,
  type ContextoIA,
} from '@/lib/empresarial/iaOportunidades'

export const maxDuration = 120

// Tope por modelo: con 3 modelos de respaldo, ninguno puede gastarse todo el tiempo de la ruta.
const TOPE_POR_MODELO_MS = 35000

/**
 * Ayuda de IA para Oportunidades (Camino A).
 *  - accion "ideas": propone oportunidades nuevas y las deja guardadas como ideas (origen IA).
 *  - accion "ficha": propone texto para los campos vacíos de una oportunidad (no guarda nada).
 * Todo se lee con la sesión de la persona: solo se ve lo suyo. El conteo diario se anota con la llave de servicio.
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 })

    const body = (await req.json().catch(() => null)) as {
      proyecto_id?: string
      accion?: string
      oportunidad_id?: string
    } | null
    const proyectoId = body?.proyecto_id
    const accion = body?.accion
    if (!proyectoId || (accion !== 'ideas' && accion !== 'ficha')) {
      return NextResponse.json({ error: 'Solicitud incompleta.' }, { status: 400 })
    }

    const { data: proyecto } = await supabase
      .from('sfpe_proyectos')
      .select('id, perfil_confirmado, pais')
      .eq('id', proyectoId)
      .maybeSingle()
    if (!proyecto) return NextResponse.json({ error: 'No encontramos ese proyecto.' }, { status: 404 })

    // Tope diario por proyecto: cuida el consumo de la IA.
    const servicio = crearClienteServicio(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const desde = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count } = await servicio
      .from('sfpe_auditoria')
      .select('id', { count: 'exact', head: true })
      .eq('proyecto_id', proyectoId)
      .eq('accion', 'ia_oportunidades')
      .gte('creada_en', desde)
    if ((count ?? 0) >= LIMITE_DIARIO_IA) {
      return NextResponse.json(
        { error: `Llegaste al máximo de ${LIMITE_DIARIO_IA} ayudas de IA por día en este proyecto. Vuelve mañana.` },
        { status: 429 },
      )
    }

    // Contexto: solo lo que la persona ya guardó.
    const [{ data: hallazgos }, { data: descubrimiento }, { data: problemas }, { data: oportunidades }] = await Promise.all([
      supabase.from('sfpe_hallazgos').select('tipo, descripcion, gravedad').eq('proyecto_id', proyectoId).neq('estado', 'descartado'),
      supabase.from('sfpe_descubrimiento').select('tipo, titulo, detalle, nivel').eq('proyecto_id', proyectoId),
      supabase.from('sfpe_problemas').select('titulo, descripcion, afectados, nivel_certeza').eq('proyecto_id', proyectoId),
      supabase.from('sfpe_oportunidades').select('id, nombre, descripcion, cliente_o_beneficiario, solucion_propuesta, valor_generado, sector, ubicacion').eq('proyecto_id', proyectoId),
    ])
    const contexto: ContextoIA = {
      perfil: (proyecto.perfil_confirmado as string | null) ?? null,
      pais: (proyecto.pais as string | null) ?? null,
      hallazgos: hallazgos ?? [],
      descubrimiento: descubrimiento ?? [],
      problemas: problemas ?? [],
      oportunidades: (oportunidades ?? []).map((o) => ({ nombre: o.nombre as string })),
    }

    const sinDatos = contexto.hallazgos.length + contexto.descubrimiento.length + contexto.problemas.length === 0

    const anotarUso = () =>
      servicio.from('sfpe_auditoria').insert({
        proyecto_id: proyectoId,
        user_id: user.id,
        accion: 'ia_oportunidades',
        tabla: accion === 'ideas' ? 'sfpe_ideas' : 'sfpe_oportunidades',
        detalle: { accion },
      })

    /* ------------------------------ IDEAS ------------------------------ */
    if (accion === 'ideas') {
      if (sinDatos) {
        return NextResponse.json(
          { error: 'Todavía no hay información para sugerir ideas. Completa tu diagnóstico o tu descubrimiento primero.' },
          { status: 400 },
        )
      }
      const prompt = armarPromptIdeas(contexto)
      let ideas: { titulo: string; descripcion: string }[] = []
      for (let intento = 1; intento <= 2 && ideas.length === 0; intento++) {
        const texto = await callGemini(prompt, TOPE_POR_MODELO_MS)
        ideas = interpretarIdeas(leerJSON(texto), contexto.oportunidades.map((o) => o.nombre), datosBaseIA(contexto))
      }
      if (ideas.length === 0) {
        return NextResponse.json({ error: 'La IA no pudo proponer ideas ahora. Intenta de nuevo en unos minutos.' }, { status: 502 })
      }
      const { data: guardadas, error } = await supabase
        .from('sfpe_ideas')
        .insert(
          ideas.map((i) => ({
            proyecto_id: proyectoId,
            titulo: i.titulo,
            descripcion: i.descripcion,
            origen: 'ia',
            estado: 'guardada',
            autor_id: user.id,
          })),
        )
        .select('id, titulo, descripcion')
      if (error || !guardadas) {
        return NextResponse.json({ error: 'No pudimos guardar las ideas. Intenta de nuevo.' }, { status: 500 })
      }
      await anotarUso()
      return NextResponse.json({ ok: true, ideas: guardadas })
    }

    /* ------------------------------ FICHA ------------------------------ */
    const oportunidad = (oportunidades ?? []).find((o) => o.id === body?.oportunidad_id)
    if (!oportunidad) return NextResponse.json({ error: 'No encontramos esa oportunidad.' }, { status: 404 })

    const vacios = CAMPOS_FICHA_IA.filter((c) => !String(oportunidad[c] ?? '').trim()) as CampoFichaIA[]
    if (vacios.length === 0) {
      return NextResponse.json({ ok: true, sugerencias: {}, mensaje: 'La ficha ya tiene todos sus datos.' })
    }
    const ficha = {
      nombre: oportunidad.nombre as string,
      descripcion: oportunidad.descripcion as string | null,
      cliente_o_beneficiario: oportunidad.cliente_o_beneficiario as string | null,
      solucion_propuesta: oportunidad.solucion_propuesta as string | null,
      valor_generado: oportunidad.valor_generado as string | null,
      sector: oportunidad.sector as string | null,
      ubicacion: oportunidad.ubicacion as string | null,
    }
    const prompt = armarPromptFicha(contexto, ficha, vacios)
    const datosBase = datosBaseIA(contexto, ficha)
    let sugerencias = {}
    for (let intento = 1; intento <= 2 && Object.keys(sugerencias).length === 0; intento++) {
      const texto = await callGemini(prompt, TOPE_POR_MODELO_MS)
      sugerencias = interpretarFicha(leerJSON(texto), vacios, datosBase)
    }
    await anotarUso()
    return NextResponse.json({ ok: true, sugerencias })
  } catch (err: unknown) {
    console.error('Error en ia-oportunidades:', err)
    return NextResponse.json({ error: 'La IA no pudo responder ahora. Intenta de nuevo en unos minutos.' }, { status: 500 })
  }
}
