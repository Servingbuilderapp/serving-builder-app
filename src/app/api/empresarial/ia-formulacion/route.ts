import { NextResponse } from 'next/server'
import { createClient as crearClienteServicio } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { callGemini } from '@/lib/gemini'
import { LIMITE_DIARIO_IA, leerJSON } from '@/lib/empresarial/iaOportunidades'
import {
  armarPromptFormulacion,
  haySugerencias,
  interpretarFormulacion,
  type ContextoFormulacionIA,
} from '@/lib/empresarial/iaFormulacion'

export const maxDuration = 120

// Tope por modelo: con 3 modelos de respaldo, ninguno puede gastarse todo el tiempo de la ruta.
const TOPE_POR_MODELO_MS = 35000

/**
 * Ayuda de IA para la Formulación (Camino A). Solo propone texto para lo que está vacío.
 * NO guarda nada: la persona decide qué usar. El contexto se lee con la sesión de la persona
 * (lo que ya está guardado), no se confía en lo que mande el navegador.
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 })

    const body = (await req.json().catch(() => null)) as { proyecto_id?: string } | null
    const proyectoId = body?.proyecto_id
    if (!proyectoId) return NextResponse.json({ error: 'Solicitud incompleta.' }, { status: 400 })

    const { data: proyecto } = await supabase
      .from('sfpe_proyectos')
      .select('id, nombre, perfil_confirmado, pais')
      .eq('id', proyectoId)
      .maybeSingle()
    if (!proyecto) return NextResponse.json({ error: 'No encontramos ese proyecto.' }, { status: 404 })

    const { data: formulacion } = await supabase
      .from('sfpe_formulacion')
      .select('tipo_proyecto, sector, ubicacion, problema, justificacion, antecedentes, objetivo_general, alcance, exclusiones')
      .eq('proyecto_id', proyectoId)
      .maybeSingle()
    if (!formulacion || !String(formulacion.problema ?? '').trim()) {
      return NextResponse.json(
        { error: 'Primero guarda la formulación con el problema escrito. Así la IA tiene de dónde partir.' },
        { status: 400 },
      )
    }

    const { data: items } = await supabase
      .from('sfpe_formulacion_items')
      .select('tipo, texto')
      .eq('proyecto_id', proyectoId)
      .order('orden', { ascending: true })
    const deTipo = (tipo: string) => (items ?? []).filter((i) => i.tipo === tipo).map((i) => String(i.texto))

    const contexto: ContextoFormulacionIA = {
      nombre: proyecto.nombre as string,
      perfil: (proyecto.perfil_confirmado as string | null) ?? null,
      pais: (proyecto.pais as string | null) ?? null,
      tipo_proyecto: String(formulacion.tipo_proyecto ?? ''),
      sector: String(formulacion.sector ?? ''),
      ubicacion: String(formulacion.ubicacion ?? ''),
      problema: String(formulacion.problema ?? ''),
      justificacion: String(formulacion.justificacion ?? ''),
      antecedentes: String(formulacion.antecedentes ?? ''),
      objetivo_general: String(formulacion.objetivo_general ?? ''),
      alcance: String(formulacion.alcance ?? ''),
      exclusiones: String(formulacion.exclusiones ?? ''),
      beneficiarios: deTipo('beneficiario'),
      objetivos_especificos: deTipo('objetivo_especifico'),
      resultados: deTipo('resultado'),
    }

    // Tope diario por proyecto: cuida el consumo de la IA.
    const servicio = crearClienteServicio(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const desde = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count } = await servicio
      .from('sfpe_auditoria')
      .select('id', { count: 'exact', head: true })
      .eq('proyecto_id', proyectoId)
      .eq('accion', 'ia_formulacion')
      .gte('creada_en', desde)
    if ((count ?? 0) >= LIMITE_DIARIO_IA) {
      return NextResponse.json(
        { error: `Llegaste al máximo de ${LIMITE_DIARIO_IA} ayudas de IA por día en este proyecto. Vuelve mañana.` },
        { status: 429 },
      )
    }

    const prompt = armarPromptFormulacion(contexto)
    let sugerencias = interpretarFormulacion(null, contexto)
    for (let intento = 1; intento <= 2 && !haySugerencias(sugerencias); intento++) {
      const texto = await callGemini(prompt, TOPE_POR_MODELO_MS)
      sugerencias = interpretarFormulacion(leerJSON(texto), contexto)
    }

    await servicio.from('sfpe_auditoria').insert({
      proyecto_id: proyectoId,
      user_id: user.id,
      accion: 'ia_formulacion',
      tabla: 'sfpe_formulacion',
      detalle: { accion: 'sugerir' },
    })

    if (!haySugerencias(sugerencias)) {
      return NextResponse.json({
        ok: true,
        sugerencias,
        mensaje: 'La IA no tuvo qué proponer con lo que hay escrito. Completa un poco más y vuelve a intentar.',
      })
    }
    return NextResponse.json({ ok: true, sugerencias })
  } catch (err: unknown) {
    console.error('Error en ia-formulacion:', err)
    return NextResponse.json({ error: 'La IA no pudo responder ahora. Intenta de nuevo en unos minutos.' }, { status: 500 })
  }
}
