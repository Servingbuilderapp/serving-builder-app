import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { motorAutorizado } from '@/lib/candadoMotores'
import { buildEmailTemplate, sendEmail } from '@/lib/email'
import { ultimoMovimientoPorProyecto, diasSinMovimiento } from '@/lib/actividadProyectos'
import { calcularSiguientePaso } from '@/lib/siguientePaso'
import type { ProyectoVisto } from '@/lib/proyectoVisto'

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
const DESTINOS = ['servingbuilderapp@gmail.com', 'iagif1964@gmail.com']
const DIAS_ESPERA_CLIENTE = 3
const SIN_ARRANCAR = ['pendiente_pago', 'pendiente_aval', 'aval_rechazado', 'cortesia_pendiente']
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

    // Quién tiene la pelota en cada proyecto parado: el cliente (hay que escribirle) o la plataforma (hay que revisar).
    const candidatos = proyectos
      .filter((p) => !SIN_ARRANCAR.includes(String(p.estado_actual || '')) && p.estado_actual !== 'postulado')
      .map((p) => ({ p, dias: diasSinMovimiento(movimiento.get(String(p.id))) }))
      .filter((x) => x.dias !== null && x.dias >= DIAS_ESPERA_CLIENTE)
      .sort((a, b) => (b.dias || 0) - (a.dias || 0))
      .slice(0, 60)
    const porEscribir: { p: (typeof proyectos)[number]; dias: number; pedido: string }[] = []
    const porRevisar: { p: (typeof proyectos)[number]; dias: number }[] = []
    for (let i = 0; i < candidatos.length; i += 5) {
      const lote = candidatos.slice(i, i + 5)
      const calculos = await Promise.all(
        lote.map(async ({ p, dias }) => {
          try {
            const vista: ProyectoVisto = {
              db: supabase as unknown as ProyectoVisto['db'],
              proyectoId: String(p.id),
              nombreProyecto: p.nombre_iniciativa,
              nombreCliente: p.nombre_cliente,
              correoCliente: p.correo_cliente,
              vistaEquipo: false,
            }
            return { p, dias: dias || 0, paso: await calcularSiguientePaso(vista) }
          } catch {
            return { p, dias: dias || 0, paso: null }
          }
        }),
      )
      for (const c of calculos) {
        if (!c.paso) continue
        if (c.paso.pideAlgo) porEscribir.push({ p: c.p, dias: c.dias, pedido: c.paso.titulo })
        else if (!c.paso.accion) porRevisar.push({ p: c.p, dias: c.dias })
      }
    }

    const resumen = {
      por_escribir_whatsapp: porEscribir.map((x) => ({ proyecto: x.p.nombre_iniciativa, cliente: x.p.nombre_cliente, dias: x.dias, pedido: x.pedido })),
      por_revisar_plataforma: porRevisar.map((x) => ({ proyecto: x.p.nombre_iniciativa, dias: x.dias })),
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

    if (estancados.length === 0 && cierres.length === 0 && porEscribir.length === 0 && porRevisar.length === 0) {
      return NextResponse.json({ ok: true, modo: soloProbar ? 'prueba' : 'envío real', enviado: false, mensaje: 'Nada que avisar hoy.', ...resumen })
    }

    const lineas: string[] = []
    if (porEscribir.length > 0) {
      lineas.push(`<strong>Falta escribirles por WhatsApp (${porEscribir.length}):</strong> el cliente lleva ${DIAS_ESPERA_CLIENTE} días o más sin hacer lo que le toca.`)
      for (const x of porEscribir.slice(0, 15)) {
        lineas.push(`• ${escapar(String(x.p.nombre_iniciativa || 'Proyecto'))} (${escapar(String(x.p.nombre_cliente || ''))}) — ${escapar(x.pedido)}, ${x.dias} días`)
      }
      if (porEscribir.length > 15) lineas.push(`… y ${porEscribir.length - 15} más.`)
    }
    if (porRevisar.length > 0) {
      lineas.push(`<strong>Falta revisar de nuestro lado (${porRevisar.length}):</strong> no esperan nada del cliente y llevan ${DIAS_ESPERA_CLIENTE} días o más quietos.`)
      for (const x of porRevisar.slice(0, 10)) {
        lineas.push(`• ${escapar(String(x.p.nombre_iniciativa || 'Proyecto'))} — ${x.dias} días`)
      }
    }
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
      const asunto = `Hoy: ${porEscribir.length} por escribir, ${porRevisar.length} por revisar, ${cierres.length} cierres cerca`
      const html = buildEmailTemplate({
        title: 'Lo que falta hacer hoy',
        greeting: 'Hola equipo,',
        bodyLines: lineas,
        ctaText: 'Abrir el tablero de Productividad',
        ctaUrl: `${origen}/admin/productividad`,
      })
      const envios = await Promise.all(DESTINOS.map((to) => sendEmail({ to, subject: asunto, html })))
      enviado = envios.every((e) => e.success) ? true : envios.map((e) => (e.success ? 'ok' : e.message)).join(' | ')
    }
    return NextResponse.json({ ok: true, modo: soloProbar ? 'prueba (no se envió nada)' : 'envío real', enviado, ...resumen })
  } catch (e) {
    console.error('[avisos-equipo] Error:', e)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
