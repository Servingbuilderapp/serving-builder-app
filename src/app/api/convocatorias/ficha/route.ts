import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { esEquipoServing } from '@/lib/guardiaEquipo'
import { aLista, claveDeConvocatoria } from '@/lib/radar'

/**
 * CARGAR UNA CONVOCATORIA A MANO
 *
 * El motor encuentra muchas, pero las mejores llegan por otro lado: un
 * boletín, un correo de un aliado, una publicación en redes. Esta ruta existe
 * para que eso no se pierda en un chat.
 *
 * POST /api/convocatorias/ficha      crea o actualiza una ficha
 * PATCH /api/convocatorias/ficha     completa campos de una ficha que ya existe
 *
 * La ficha se guarda con la misma clave que usa el motor (nombre + entidad
 * normalizados), así que si el motor ya la había encontrado, no se duplica:
 * se completa la que estaba.
 */

function cliente() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

/** Pasa lo que llega del formulario a las columnas de la ficha. */
function armarFicha(c: Record<string, unknown>) {
  const texto = (k: string) => {
    const v = c[k]
    return v === undefined || v === null || v === '' ? null : String(v)
  }
  const numero = (k: string) => {
    const v = c[k]
    if (v === undefined || v === null || v === '') return null
    const n = Number(String(v).replace(/[^0-9.-]/g, ''))
    return Number.isFinite(n) ? n : null
  }
  const booleano = (k: string) => {
    const v = c[k]
    if (v === undefined || v === null || v === '') return null
    return v === true || v === 'true' || v === 'si' || v === 'sí'
  }

  const ficha: Record<string, unknown> = {
    nombre: texto('nombre'),
    entidad: texto('entidad') || '',

    // la anatomía
    paises_elegibles: aLista(texto('paises_elegibles')),
    tipo_postulante: Array.isArray(c.tipo_postulante)
      ? (c.tipo_postulante as string[])
      : aLista(texto('tipo_postulante')),
    objetivo: texto('objetivo'),
    sector: texto('sector'),
    criterios_evaluacion: texto('criterios_evaluacion'),
    monto_maximo: numero('monto_maximo'),
    moneda: texto('moneda'),
    contrapartida_exigida: booleano('contrapartida_exigida'),
    contrapartida_detalle: texto('contrapartida_detalle'),
    fecha_apertura: texto('fecha_apertura'),
    fecha_cierre: texto('fecha_cierre'),
    fecha_cierre_texto: texto('fecha_cierre_texto'),
    fecha_resultados: texto('fecha_resultados'),
    duracion_proyecto: texto('duracion_proyecto'),
    requisitos_habilitantes: texto('requisitos_habilitantes'),
    enlace_aplicacion: texto('enlace_aplicacion'),

    // calendario predictivo
    abierta_todo_el_anio: c.abierta_todo_el_anio === true || c.abierta_todo_el_anio === 'true',
    mes_apertura_tipico: numero('mes_apertura_tipico'),
    periodicidad: texto('periodicidad'),

    // lo que ya existía
    tipo_financiador: texto('tipo_financiador') || 'por_clasificar',
    ambito: texto('ambito') || 'por_definir',
    pais: texto('pais'),
    territorio: texto('territorio'),
    linea_tematica: texto('linea_tematica'),
    monto: texto('monto'),
    beneficiarios: texto('beneficiarios'),
    requisitos: texto('requisitos'),
    fuente_oficial: texto('fuente_oficial'),
    notas_equipo: texto('notas_equipo'),
  }

  // no se mandan las llaves vacías, para no pisar con null lo que el motor ya
  // había averiguado
  Object.keys(ficha).forEach((k) => {
    const v = ficha[k]
    if (v === null || (Array.isArray(v) && v.length === 0)) delete ficha[k]
  })

  return ficha
}

export async function POST(req: Request) {
  try {
    if (!(await esEquipoServing())) {
      return NextResponse.json({ error: 'Solo el equipo de Serving' }, { status: 401 })
    }

    const cuerpo = await req.json()
    if (!cuerpo?.nombre) {
      return NextResponse.json({ error: 'La convocatoria necesita al menos un nombre' }, { status: 400 })
    }

    const supabase = cliente()
    const clave = claveDeConvocatoria(String(cuerpo.nombre), String(cuerpo.entidad || ''))
    const ficha = armarFicha(cuerpo)

    const { data: existente } = await supabase
      .from('biblioteca_convocatorias')
      .select('id')
      .eq('clave', clave)
      .maybeSingle<{ id: string }>()

    if (existente) {
      const { data, error } = await supabase
        .from('biblioteca_convocatorias')
        .update({ ...ficha, actualizado_en: new Date().toISOString() })
        .eq('id', existente.id)
        .select('id, nombre, entidad')
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true, creada: false, convocatoria: data })
    }

    const { data, error } = await supabase
      .from('biblioteca_convocatorias')
      .insert({
        ...ficha,
        clave,
        origen_ficha: 'manual',
        cargada_por: String(cuerpo?.cargadaPor || 'equipo'),
      })
      .select('id, nombre, entidad')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, creada: true, convocatoria: data })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    if (!(await esEquipoServing())) {
      return NextResponse.json({ error: 'Solo el equipo de Serving' }, { status: 401 })
    }

    const cuerpo = await req.json()
    if (!cuerpo?.id) {
      return NextResponse.json({ error: 'Falta el id de la convocatoria' }, { status: 400 })
    }

    const supabase = cliente()
    const { data, error } = await supabase
      .from('biblioteca_convocatorias')
      .update({ ...armarFicha(cuerpo), actualizado_en: new Date().toISOString() })
      .eq('id', String(cuerpo.id))
      .select('id, nombre')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, convocatoria: data })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
