import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { motorAutorizado } from '@/lib/candadoMotores'
import { buildEmailTemplate, sendEmail } from '@/lib/email'
import { ultimoMovimientoPorProyecto, diasSinMovimiento } from '@/lib/actividadProyectos'

/**
 * AVISO DIARIO AL EQUIPO — un solo correo con los clientes que necesitan atención.
 *
 *   1. Clientes SIN MOVIMIENTO hace más de 5 días (y que no han postulado todavía).
 *   2. Clientes con una convocatoria elegida que cierra en 7 días o menos y sin radicar.
 *
 * Solo escribe si hay algo que contar. Se programa una vez al día en vercel.json.
 * Prueba sin enviar: /api/avisos-equipo?probar=1
 */

export const maxDuration = 120

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const CORREOS_DEL_EQUIPO = ['servingbuilderapp@gmail.com', 'iagif1964@gmail.com']
const DESTINO = 'servingbuilderapp@gmail.com'
const DIAS_ESTANCADO = 5
const DIAS_CIERRE = 7

const normalizar = (c: string | null | undefined) => {
  const t = String(c || '').toLowerCase().trim()
  const [usuario, dominio] = t.split('@')
  if (!usuario || !dominio) return t
  return dominio === 'gmail.com' ? `${usuario.replace(/\./g, '').split('+')[0]}@${dominio}` : t
}
const esDelEquipo = (c: string | null | undefined) => CORREOS_DEL_EQUIPO.map(normalizar).includes(normalizar(c))
const escapar = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function diasHasta(fecha: string): number {
  const f = new Date(fecha)
  const hoy = new Date()
  const base = Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate())
  return Math.round((Date.UTC(f.getUTCFullYear(), f.getUTCMonth(), f.getUTCDate()) - base) / 86400000)
}

export async function GET(req: NextRequest) {
  try {
    if (!(await motorAutorizado(req, null))) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const soloProbar = req.nextUrl.searchParams.get('probar') === '1'
    const origen = req.nextUrl.origin

    const { data: filas, error } = await supabase
      .from('proyectos_clientes_serving')
      .select('id, nombre_iniciativa, nombre_cliente, correo_cliente, estado_actual, created_at')
      .order('created_at', { ascending: false })
      .limit(500)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const proyectos = (filas || []).filter((p) => !esDelEquipo(p.correo_cliente))
    const movimiento = await ultimoMovimientoPorProyecto(
      supabase,
      proyectos.map((p) => ({ id: String(p.id), created_at: p.created_at })),
    )

    const estancados = proyectos
      .map((p) => ({ p, dias: diasSinMovimiento(movimiento.get(String(p.id))) }))
      .filter((x) => x.dias !== null && x.dias > DIAS_ESTANCADO && x.p.estado_actual !== 'postulado')
      .sort((a, b) => (b.dias || 0) - (a.dias || 0))

    // Cierres cercanos de convocatorias que el cliente ya eligió y todavía no radicó.
    const ids = proyectos.map((p) => String(p.id))
    const { data: elegidas } = ids.length
      ? await supabase
          .from('convocatorias_candidatas_proyecto')
          .select('id_proyecto, nombre, fecha_cierre')
          .in('id_proyecto', ids)
          .eq('seleccionada', true)
          .eq('eleccion_cliente', 'elegida')
          .not('fecha_cierre', 'is', null)
      : { data: [] }
    const { data: postuladas } = ids.length
      ? await supabase.from('postulaciones').select('proyecto_id, convocatoria_nombre, estado').in('proyecto_id', ids)
      : { data: [] }
    const sinTildes = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim()
    const terminadas = new Set(
      ((postuladas || []) as { proyecto_id: string; convocatoria_nombre: string | null; estado: string | null }[])
        .filter((x) => ['Radicada', 'Adjudicada', 'Rechazada', 'Descartada'].includes(String(x.estado)))
        .map((x) => `${x.proyecto_id}|${sinTildes(String(x.convocatoria_nombre || ''))}`),
    )
    const nombrePorId = new Map(proyectos.map((p) => [String(p.id), p]))
    const cierres = ((elegidas || []) as { id_proyecto: string; nombre: string | null; fecha_cierre: string }[])
      .map((c) => ({ c, dias: diasHasta(c.fecha_cierre) }))
      .filter((x) => Number.isFinite(x.dias) && x.dias >= 0 && x.dias <= DIAS_CIERRE)
      .filter((x) => !terminadas.has(`${x.c.id_proyecto}|${sinTildes(String(x.c.nombre || ''))}`))
      .sort((a, b) => a.dias - b.dias)

    const resumen = {
      estancados: estancados.map((x) => ({
        proyecto: x.p.nombre_iniciativa,
        cliente: x.p.nombre_cliente,
        correo: x.p.correo_cliente,
        dias_sin_movimiento: x.dias,
        estado: x.p.estado_actual,
      })),
      cierres: cierres.map((x) => ({
        proyecto: nombrePorId.get(String(x.c.id_proyecto))?.nombre_iniciativa,
        convocatoria: x.c.nombre,
        dias: x.dias,
      })),
    }

    if (estancados.length === 0 && cierres.length === 0) {
      return NextResponse.json({ ok: true, modo: soloProbar ? 'prueba' : 'envío real', enviado: false, mensaje: 'Nada que avisar hoy.', ...resumen })
    }

    const lineas: string[] = []
    if (cierres.length > 0) {
      lineas.push('<strong>Cierran pronto (sin radicar):</strong>')
      for (const x of cierres) {
        const proyecto = nombrePorId.get(String(x.c.id_proyecto))
        const cuando = x.dias === 0 ? 'hoy' : x.dias === 1 ? 'mañana' : `en ${x.dias} días`
        lineas.push(`• ${escapar(String(proyecto?.nombre_iniciativa || 'Proyecto'))}: ${escapar(String(x.c.nombre || 'convocatoria'))} — cierra ${cuando}`)
      }
    }
    if (estancados.length > 0) {
      lineas.push(`<strong>Sin movimiento hace más de ${DIAS_ESTANCADO} días:</strong>`)
      for (const x of estancados.slice(0, 15)) {
        lineas.push(
          `• ${escapar(String(x.p.nombre_iniciativa || 'Proyecto'))} (${escapar(String(x.p.nombre_cliente || x.p.correo_cliente || ''))}) — ${x.dias} días`,
        )
      }
      if (estancados.length > 15) lineas.push(`… y ${estancados.length - 15} más.`)
    }

    let enviado: boolean | string = 'simulado'
    if (!soloProbar) {
      const envio = await sendEmail({
        to: DESTINO,
        subject: `Clientes que necesitan atención (${estancados.length + cierres.length})`,
        html: buildEmailTemplate({
          title: 'Clientes que necesitan atención',
          greeting: 'Hola equipo,',
          bodyLines: lineas,
          ctaText: 'Abrir el seguimiento',
          ctaUrl: `${origen}/admin/proyectos`,
        }),
      })
      enviado = envio.success ? true : envio.message
    }
    return NextResponse.json({ ok: true, modo: soloProbar ? 'prueba (no se envió nada)' : 'envío real', enviado, ...resumen })
  } catch (e) {
    console.error('[avisos-equipo] Error:', e)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
