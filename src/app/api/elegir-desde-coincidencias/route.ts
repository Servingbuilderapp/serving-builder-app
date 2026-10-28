import { NextRequest, NextResponse, after } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { motorAutorizado, cabecerasInternas } from '@/lib/candadoMotores'

/**
 * El cliente elige, desde la pantalla de Coincidencias, una convocatoria de la
 * BIBLIOTECA (no una que el Motor 2 le haya traído). Hace lo mismo que
 * /api/elegir-convocatoria, pero antes crea la fila de "candidata" de ese proyecto:
 *
 *   1. Si el proyecto ya tenía esa convocatoria como candidata, la marca como elegida.
 *   2. Si no, la crea copiando la ficha de la biblioteca, ya elegida.
 *   3. Dispara el Motor 3 (análisis de encaje), igual que la elección de siempre.
 *
 * Solo el dueño del proyecto (o llamadas internas), como el resto de motores.
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const CAMPOS_BIBLIOTECA =
  'id, nombre, entidad, tipo, estado_convocatoria, fecha_cierre, fecha_cierre_texto, monto, beneficiarios, territorio, linea_tematica, requisitos, mecanismo_postulacion, terminos_referencia, fuente_oficial, alertas, informacion_faltante'

export async function POST(req: NextRequest) {
  try {
    const { id_proyecto, id_biblioteca } = await req.json()
    if (!id_proyecto || !id_biblioteca) {
      return NextResponse.json({ error: 'Falta id_proyecto o id_biblioteca' }, { status: 400 })
    }

    if (!(await motorAutorizado(req, id_proyecto))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { data: ficha, error: errorFicha } = await supabase
      .from('biblioteca_convocatorias')
      .select(CAMPOS_BIBLIOTECA)
      .eq('id', id_biblioteca)
      .maybeSingle()
    if (errorFicha || !ficha) {
      return NextResponse.json({ error: 'No encontramos esa convocatoria en la biblioteca.' }, { status: 404 })
    }

    const { data: existente } = await supabase
      .from('convocatorias_candidatas_proyecto')
      .select('id, eleccion_cliente')
      .eq('id_proyecto', id_proyecto)
      .eq('biblioteca_id', id_biblioteca)
      .limit(1)
      .maybeSingle()

    let idCandidata: string

    if (existente) {
      if (existente.eleccion_cliente === 'elegida') {
        return NextResponse.json({ ok: true, ya_elegida: true, mensaje: 'Ya habías elegido esta convocatoria.' })
      }
      const { error: errorActualizar } = await supabase
        .from('convocatorias_candidatas_proyecto')
        .update({ seleccionada: true, eleccion_cliente: 'elegida' })
        .eq('id', existente.id)
      if (errorActualizar) {
        console.error('[elegir-desde-coincidencias] No se pudo marcar como elegida:', JSON.stringify(errorActualizar))
        return NextResponse.json({ error: 'No se pudo guardar tu elección.' }, { status: 500 })
      }
      idCandidata = String(existente.id)
    } else {
      const { data: ultimoLote } = await supabase
        .from('convocatorias_candidatas_proyecto')
        .select('lote')
        .eq('id_proyecto', id_proyecto)
        .order('lote', { ascending: false })
        .limit(1)
      const lote = ultimoLote && ultimoLote.length > 0 ? Number(ultimoLote[0].lote || 0) + 1 : 1

      const { data: nueva, error: errorCrear } = await supabase
        .from('convocatorias_candidatas_proyecto')
        .insert({
          id_proyecto,
          lote,
          nombre: ficha.nombre,
          entidad: ficha.entidad,
          tipo: ficha.tipo,
          estado_convocatoria: ficha.estado_convocatoria,
          fecha_cierre: ficha.fecha_cierre_texto || ficha.fecha_cierre,
          monto: ficha.monto,
          beneficiarios: ficha.beneficiarios,
          territorio: ficha.territorio,
          linea_tematica: ficha.linea_tematica,
          requisitos: ficha.requisitos,
          mecanismo_postulacion: ficha.mecanismo_postulacion,
          terminos_referencia: ficha.terminos_referencia,
          fuente_oficial: ficha.fuente_oficial,
          alertas: ficha.alertas,
          informacion_faltante: ficha.informacion_faltante,
          biblioteca_id: id_biblioteca,
          seleccionada: true,
          eleccion_cliente: 'elegida',
          disponible_para_cliente_desde: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (errorCrear || !nueva) {
        console.error('[elegir-desde-coincidencias] No se pudo crear la candidata:', JSON.stringify(errorCrear))
        return NextResponse.json({ error: 'No se pudo guardar tu elección.' }, { status: 500 })
      }
      idCandidata = String(nueva.id)
    }

    const origen = req.nextUrl.origin
    after(async () => {
      try {
        await fetch(`${origen}/api/analizar-encaje`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...cabecerasInternas() },
          body: JSON.stringify({ id_convocatoria: idCandidata }),
        })
      } catch (e) {
        console.error('[elegir-desde-coincidencias] Error disparando el Motor 3:', e)
      }
    })

    return NextResponse.json({
      ok: true,
      mensaje: 'Listo: ya estamos analizando el encaje de esta convocatoria.',
    })
  } catch (e) {
    console.error('[elegir-desde-coincidencias] Error:', e)
    return NextResponse.json({ error: 'Error al procesar tu elección.' }, { status: 500 })
  }
}
