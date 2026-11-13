import { NextResponse } from 'next/server'
import { createClient as crearClienteServicio } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { callGemini } from '@/lib/gemini'
import { LIMITE_DIARIO_IA } from '@/lib/empresarial/iaOportunidades'
import { armarPromptDocumento, esSeccionDocumento, limpiarTextoIA, textoDatos, type SeccionDocumento } from '@/lib/empresarial/documentoTextos'

export const maxDuration = 120

const TOPE_POR_MODELO_MS = 35000

/**
 * Escribe y GUARDA el texto "Qué significa en tu proyecto" de una sección del Documento final.
 * Lee los datos con la sesión de la persona (no confía en lo que mande el navegador).
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 })

    const body = (await req.json().catch(() => null)) as { proyecto_id?: string; seccion?: string } | null
    const proyectoId = body?.proyecto_id
    const seccion = body?.seccion
    if (!proyectoId || !esSeccionDocumento(seccion)) return NextResponse.json({ error: 'Solicitud incompleta.' }, { status: 400 })

    const { data: proyecto } = await supabase.from('sfpe_proyectos').select('id, nombre').eq('id', proyectoId).maybeSingle()
    if (!proyecto) return NextResponse.json({ error: 'No encontramos ese proyecto.' }, { status: 404 })

    const datos = await datosDeSeccion(supabase, proyectoId, seccion)
    if (!datos) {
      return NextResponse.json({ error: 'Primero completa esta parte del camino. Así la IA tiene de dónde partir.' }, { status: 400 })
    }

    // Tope diario por proyecto: cuida el consumo de la IA.
    const servicio = crearClienteServicio(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const desde = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count } = await servicio
      .from('sfpe_auditoria')
      .select('id', { count: 'exact', head: true })
      .eq('proyecto_id', proyectoId)
      .eq('accion', 'ia_documento')
      .gte('creada_en', desde)
    if ((count ?? 0) >= LIMITE_DIARIO_IA) {
      return NextResponse.json({ error: `Llegaste al máximo de ${LIMITE_DIARIO_IA} textos de IA por día en este proyecto. Vuelve mañana.` }, { status: 429 })
    }

    const respuesta = await callGemini(armarPromptDocumento(seccion, proyecto.nombre as string, datos), TOPE_POR_MODELO_MS)
    const texto = limpiarTextoIA(respuesta ?? '')
    if (texto.length < 40) {
      return NextResponse.json({ error: 'La IA no pudo redactar con lo que hay escrito. Completa un poco más y vuelve a intentar.' }, { status: 422 })
    }

    // Se guarda con la sesión de la persona: la política de seguridad exige que pueda editar el proyecto.
    const { error: errGuardar } = await supabase
      .from('sfpe_documento_textos')
      .upsert({ proyecto_id: proyectoId, seccion, texto, actualizado_en: new Date().toISOString() }, { onConflict: 'proyecto_id,seccion' })
    if (errGuardar) {
      console.error('No se pudo guardar el texto del documento:', errGuardar)
      return NextResponse.json({ error: 'No se pudo guardar el texto. Intenta de nuevo.' }, { status: 500 })
    }

    await servicio.from('sfpe_auditoria').insert({
      proyecto_id: proyectoId,
      user_id: user.id,
      accion: 'ia_documento',
      tabla: 'sfpe_documento_textos',
      detalle: { seccion },
    })

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error('Error en ia-documento:', err)
    return NextResponse.json({ error: 'La IA no pudo responder ahora. Intenta de nuevo en unos minutos.' }, { status: 500 })
  }
}

type Cliente = Awaited<ReturnType<typeof createClient>>

/** Reúne lo que la persona llenó en la sección. Devuelve null si no hay nada con qué trabajar. */
async function datosDeSeccion(supabase: Cliente, proyectoId: string, seccion: SeccionDocumento): Promise<string | null> {
  if (seccion === 'proyecto') {
    const { data: f } = await supabase.from('sfpe_formulacion').select('*').eq('proyecto_id', proyectoId).maybeSingle()
    if (!f || !String(f.problema ?? '').trim()) return null
    const { data: items } = await supabase.from('sfpe_formulacion_items').select('tipo, texto').eq('proyecto_id', proyectoId).order('orden', { ascending: true })
    const deTipo = (t: string) => (items ?? []).filter((i) => i.tipo === t).map((i) => String(i.texto))
    return textoDatos([
      ['Tipo de proyecto', f.tipo_proyecto],
      ['Sector', f.sector],
      ['Ubicación', f.ubicacion],
      ['Duración en meses', f.duracion_meses],
      ['Problema', f.problema],
      ['Por qué vale la pena', f.justificacion],
      ['Antecedentes', f.antecedentes],
      ['Objetivo general', f.objetivo_general],
      ['Objetivos específicos', deTipo('objetivo_especifico')],
      ['Quiénes se benefician', deTipo('beneficiario')],
      ['Resultados esperados', deTipo('resultado')],
      ['Alcance', f.alcance],
      ['Lo que no incluye', f.exclusiones],
    ])
  }
  const { data: m } = await supabase.from('sfpe_mercado').select('*').eq('proyecto_id', proyectoId).maybeSingle()
  if (!m) return null
  const { data: segs } = await supabase.from('sfpe_mercado_segmentos').select('nombre, descripcion, necesidades, capacidad_compra, barreras').eq('proyecto_id', proyectoId)
  const segTxt = (segs ?? []).map((x) => [x.nombre, x.descripcion, x.necesidades && `necesita: ${x.necesidades}`, x.capacidad_compra && `capacidad de compra: ${x.capacidad_compra}`, x.barreras && `barreras: ${x.barreras}`].filter(Boolean).join(' — '))
  const texto = textoDatos([
    ['Producto o servicio', m.producto],
    ['Quién compra', m.tipo_comprador],
    ['Naturaleza', m.naturaleza],
    ['Cobertura', m.cobertura],
    ['Etapa del mercado', m.etapa_mercado],
    ['Ubicación', m.ubicacion],
    ['Descripción del mercado', m.descripcion_mercado],
    ['Delimitación', m.delimitacion],
    ['Restricciones', m.restricciones],
    ['Segmentos de clientes', segTxt],
  ])
  return texto || null
}
