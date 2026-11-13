import { NextResponse } from 'next/server'
import { createClient as crearClienteServicio } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { callGemini } from '@/lib/gemini'
import { LIMITE_DIARIO_IA } from '@/lib/empresarial/iaOportunidades'
import { armarPromptDocumento, esSeccionDocumento, limpiarTextoIA, textoDatos, type SeccionDocumento } from '@/lib/empresarial/documentoTextos'

import { CRUCES, GUIAS, calcularBalance, lecturaPosicion, type ItemDofa } from '@/lib/empresarial/dofa'
import { ESTADOS_SOLUCION, TIPOS_SOLUCION, formatoMinutos, tiempoTotalMin } from '@/lib/empresarial/tecnico'
import { etiquetaDe } from '@/lib/empresarial/mercado'
import { calcular, formatoMeses, financieroVacio, type ItemFinanciero, type TipoItem } from '@/lib/empresarial/financiero'

import { FACTORES as FACTORES_ENTORNO } from '@/lib/empresarial/entorno'
import { FACTORES as FACTORES_PRESION } from '@/lib/empresarial/presiones'
import { BLOQUES } from '@/lib/empresarial/lienzo'
import { etiquetaRespuesta, ordenarRiesgos, tituloCategoria, type ItemRiesgo } from '@/lib/empresarial/riesgos'

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
  if (seccion === 'demanda') {
    const { data: t } = await supabase.from('sfpe_mercado_tamano').select('*').eq('proyecto_id', proyectoId).maybeSingle()
    if (!t) return null
    const c = (v: unknown, cond: unknown) => (v === null || v === undefined ? '' : `${v}${cond ? ` (${cond})` : ''}`)
    return (
      textoDatos([
        ['Gasto anual por cliente', c(t.gasto_valor, t.gasto_condicion)],
        ['Mercado total TAM (número de clientes)', c(t.tam_valor, t.tam_condicion)],
        ['Mercado atendible SAM (número de clientes)', c(t.sam_valor, t.sam_condicion)],
        ['Mercado captable SOM (número de clientes)', c(t.som_valor, t.som_condicion)],
        ['Cuántos clientes puede atender', t.capacidad_clientes],
        ['Frecuencia de compra', t.frecuencia_compra],
        ['Estacionalidad', t.estacionalidad],
        ['Intención de compra', t.intencion_compra],
        ['Demanda sin atender', t.demanda_insatisfecha],
      ]) || null
    )
  }
  if (seccion === 'competencia') {
    const [{ data: p }, { data: comps }, { data: canales }] = await Promise.all([
      supabase.from('sfpe_mercado_precio').select('*').eq('proyecto_id', proyectoId).maybeSingle(),
      supabase.from('sfpe_mercado_competidores').select('nombre, producto, precio, unidad_precio, fortalezas, debilidades, fuente, condicion').eq('proyecto_id', proyectoId),
      supabase.from('sfpe_mercado_canales').select('tipo, descripcion, costo_adquisicion, condicion').eq('proyecto_id', proyectoId),
    ])
    const compTxt = (comps ?? []).map((x) =>
      [x.nombre, x.producto, x.precio != null && `precio ${x.precio}${x.unidad_precio ? ` ${x.unidad_precio}` : ''}`, x.fortalezas && `fortalezas: ${x.fortalezas}`, x.debilidades && `debilidades: ${x.debilidades}`, `fuente: ${x.fuente || 'sin fuente'} (${x.condicion})`]
        .filter(Boolean)
        .join(' — '),
    )
    const canTxt = (canales ?? []).map((x) => [x.tipo, x.descripcion, x.costo_adquisicion != null && `costo por cliente ${x.costo_adquisicion}`, `(${x.condicion})`].filter(Boolean).join(' — '))
    return (
      textoDatos([
        ['Precio del proyecto', p?.precio != null ? `${p.precio}${p.unidad_precio ? ` ${p.unidad_precio}` : ''}` : ''],
        ['Costo por unidad', p?.costo_unitario],
        ['Cómo se fijó el precio', p?.metodo],
        ['Por qué ese precio', p?.justificacion],
        ['Disposición a pagar', p?.disposicion_pago],
        ['Competidores', compTxt],
        ['Canales', canTxt],
      ]) || null
    )
  }
  if (seccion === 'ikigai') {
    const { data: items } = await supabase.from('sfpe_ikigai_items').select('texto, ama, bueno, necesita, pagan, fuente, condicion').eq('proyecto_id', proyectoId).order('orden', { ascending: true })
    const txt = (items ?? [])
      .filter((x) => String(x.texto ?? '').trim())
      .map((x) => {
        const si = [x.ama && 'les gusta', x.bueno && 'lo saben hacer bien', x.necesita && 'el mundo lo necesita', x.pagan && 'pagan por ello'].filter(Boolean)
        return `${x.texto} — cumple: ${si.length ? si.join(', ') : 'ninguna de las cuatro'} (${x.condicion})`
      })
    return textoDatos([['Ideas del proyecto y qué preguntas cumplen', txt]]) || null
  }
  if (seccion === 'dofa') {
    const { data: items } = await supabase.from('sfpe_dofa_items').select('cuadrante, texto, impacto, fuente, condicion').eq('proyecto_id', proyectoId).order('orden', { ascending: true })
    const llenos = (items ?? []).filter((x) => String(x.texto ?? '').trim())
    if (llenos.length === 0) return null
    const itemsDofa: ItemDofa[] = llenos.map((x, i) => ({
      id: String(i),
      cuadrante: x.cuadrante,
      texto: String(x.texto).trim(),
      impacto: String(x.impacto ?? '3'),
      fuente: String(x.fuente ?? ''),
      condicion: x.condicion,
    }))
    const deCuadrante = (c: string) => itemsDofa.filter((x) => x.cuadrante === c).map((x) => `${x.texto} (peso ${x.impacto}, ${x.condicion})`)
    const lectura = lecturaPosicion(calcularBalance(itemsDofa))
    return textoDatos([
      ...GUIAS.map((g) => [g.titulo, deCuadrante(g.clave)] as [string, unknown]),
      ['Lectura de la posición', lectura ? `${lectura.nombre}: ${lectura.texto}` : ''],
      ...CRUCES.map((c) => [`Estrategias para ${c.titulo.toLowerCase()}`, deCuadrante(c.clave)] as [string, unknown]),
    ]) || null
  }
  if (seccion === 'entorno' || seccion === 'presiones') {
    const tabla = seccion === 'entorno' ? 'sfpe_entorno_items' : 'sfpe_presiones_items'
    const frentes = seccion === 'entorno' ? FACTORES_ENTORNO : FACTORES_PRESION
    const etiquetaEfecto = (e: unknown) => (e === 'ayuda' ? 'ayuda' : e === 'perjudica' ? 'perjudica' : e === 'protege' ? 'protege' : 'presiona')
    const { data: items } = await supabase.from(tabla).select('factor, texto, efecto, peso, condicion').eq('proyecto_id', proyectoId).order('orden', { ascending: true })
    const llenos = (items ?? []).filter((x) => String(x.texto ?? '').trim())
    if (llenos.length === 0) return null
    return (
      textoDatos(
        frentes.map((fa) => [
          fa.titulo,
          llenos.filter((x) => x.factor === fa.clave).map((x) => `${String(x.texto).trim()} (${etiquetaEfecto(x.efecto)}, peso ${x.peso ?? 3}, ${x.condicion})`),
        ]),
      ) || null
    )
  }
  if (seccion === 'lienzo') {
    const { data: items } = await supabase.from('sfpe_lienzo_items').select('bloque, texto, condicion').eq('proyecto_id', proyectoId).order('orden', { ascending: true })
    const llenos = (items ?? []).filter((x) => String(x.texto ?? '').trim())
    if (llenos.length === 0) return null
    return (
      textoDatos(BLOQUES.map((b) => [b.titulo, llenos.filter((x) => x.bloque === b.clave).map((x) => `${String(x.texto).trim()} (${x.condicion})`)])) || null
    )
  }
  if (seccion === 'riesgos') {
    const { data: items } = await supabase
      .from('sfpe_riesgos_items')
      .select('categoria, texto, probabilidad, impacto, respuesta, plan, responsable, condicion')
      .eq('proyecto_id', proyectoId)
      .order('orden', { ascending: true })
    const itemsRie: ItemRiesgo[] = (items ?? []).map((x, i) => ({
      id: String(i),
      categoria: x.categoria,
      texto: String(x.texto ?? '').trim(),
      probabilidad: String(x.probabilidad ?? 3),
      impacto: String(x.impacto ?? 3),
      respuesta: x.respuesta ?? '',
      plan: String(x.plan ?? '').trim(),
      responsable: String(x.responsable ?? '').trim(),
      fuente: '',
      condicion: x.condicion,
    }))
    const ord = ordenarRiesgos(itemsRie)
    if (ord.length === 0) return null
    const txt = ord.map((x) =>
      [
        `${x.numero}. ${x.item.texto} (${tituloCategoria(x.item.categoria)}; nivel ${x.nivel}, ${x.puntaje} de 25)`,
        x.item.respuesta && `piensa: ${etiquetaRespuesta(x.item.respuesta)}`,
        x.item.plan ? `plan: ${x.item.plan}` : 'sin plan',
        x.item.responsable ? `responsable: ${x.item.responsable}` : 'sin responsable',
      ]
        .filter(Boolean)
        .join(' — '),
    )
    return textoDatos([['Riesgos de mayor a menor gravedad', txt]]) || null
  }
  if (seccion === 'tecnico') {
    const [{ data: te }, { data: specs }, { data: pasos }] = await Promise.all([
      supabase.from('sfpe_tecnico').select('*').eq('proyecto_id', proyectoId).maybeSingle(),
      supabase.from('sfpe_tecnico_specs').select('caracteristica, especificacion, unidad, condicion').eq('proyecto_id', proyectoId),
      supabase.from('sfpe_tecnico_pasos').select('nombre, responsable, duracion_min, recursos, condicion').eq('proyecto_id', proyectoId),
    ])
    if (!te) return null
    const specsTxt = (specs ?? []).map((x) => `${x.caracteristica}: ${x.especificacion}${x.unidad ? ` ${x.unidad}` : ''} (${x.condicion})`)
    const pasosTxt = (pasos ?? []).map((x) =>
      [x.nombre, x.responsable && `responsable: ${x.responsable}`, x.duracion_min != null && `duración ${formatoMinutos(Number(x.duracion_min))}`, x.recursos && `recursos: ${x.recursos}`].filter(Boolean).join(' — '),
    )
    const tiempo = tiempoTotalMin((pasos ?? []).map((x) => ({ ...x, duracion_min: String(x.duracion_min ?? '') })) as never)
    return (
      textoDatos([
        ['Solución', te.nombre_solucion],
        ['Tipo', etiquetaDe(TIPOS_SOLUCION, String(te.tipo_solucion ?? ''))],
        ['Se vende por', te.unidad_comercializacion],
        ['Estado', etiquetaDe(ESTADOS_SOLUCION, String(te.estado_solucion ?? ''))],
        ['Descripción', te.descripcion],
        ['Calidad esperada', te.calidad_esperada],
        ['Restricciones', te.restricciones],
        ['Especificaciones', specsTxt],
        ['Pasos para producir o prestar', pasosTxt],
        ['Tiempo total por unidad', tiempo > 0 ? formatoMinutos(tiempo) : ''],
      ]) || null
    )
  }
  if (seccion === 'financiero') {
    const [{ data: fi }, { data: filas }] = await Promise.all([
      supabase.from('sfpe_financiero').select('*').eq('proyecto_id', proyectoId).maybeSingle(),
      supabase.from('sfpe_financiero_items').select('tipo, concepto, categoria, valor, fuente, condicion').eq('proyecto_id', proyectoId).order('orden', { ascending: true }),
    ])
    if (!fi) return null
    const s = (x: unknown) => (x === null || x === undefined ? '' : String(x).trim())
    const itemsFin: ItemFinanciero[] = (filas ?? []).map((x, i) => ({
      id: String(i),
      tipo: x.tipo as TipoItem,
      concepto: s(x.concepto),
      categoria: s(x.categoria),
      valor: s(x.valor),
      fuente: s(x.fuente),
      condicion: x.condicion,
    }))
    const r = calcular(
      { ...financieroVacio(), precio_unitario: s(fi.precio_unitario), costo_variable_unitario: s(fi.costo_variable_unitario), unidades_mes: s(fi.unidades_mes), aporte_propio: s(fi.aporte_propio) },
      itemsFin,
    )
    const detalle = (tipo: string) => itemsFin.filter((x) => x.tipo === tipo && x.concepto).map((x) => `${x.concepto}: ${x.valor} (${x.condicion})`)
    return (
      textoDatos([
        ['Precio por unidad', fi.precio_unitario],
        ['Costo por unidad', fi.costo_variable_unitario],
        ['Unidades por mes', fi.unidades_mes ? `${fi.unidades_mes}${fi.unidades_condicion ? ` (${fi.unidades_condicion})` : ''}` : ''],
        ['Aporte propio', fi.aporte_propio],
        ['Inversión inicial total', r.inversion],
        ['Detalle de la inversión', detalle('inversion')],
        ['Costos fijos por mes', r.fijosMes],
        ['Detalle de costos fijos', detalle('costo_fijo')],
        ['Ingresos por mes', r.ingresosMes],
        ['Utilidad por mes', r.utilidadMes],
        ['Punto de equilibrio (unidades al mes)', r.equilibrioUnidades === null ? '' : Math.ceil(r.equilibrioUnidades)],
        ['Recuperación de la inversión', formatoMeses(r.mesesRecuperacion)],
      ]) || null
    )
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
