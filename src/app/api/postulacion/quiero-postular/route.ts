import { NextRequest, NextResponse, after } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { motorAutorizado } from '@/lib/candadoMotores'
import { prepararPostulacion } from '@/lib/motorPostulacion'
import { buildEmailTemplate, sendEmail } from '@/lib/email'

// Preparar la postulación hace varias consultas al modelo seguidas.
export const maxDuration = 180

/**
 * "Quiero postular": el cliente aprieta el botón en una convocatoria con encaje
 * y la plataforma sigue sola — prepara la postulación (requisitos, documentos,
 * carta, evaluación) y al equipo le llega un informe por correo.
 *
 * Regla del dueño (30 oct 2026): sin contrato aceptado no arranca nada.
 */

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const DESTINOS = ['contacto@portalarquitecturadigital.com']

// Cupo de postulaciones por semana según la modalidad (decisión del dueño, 30 oct 2026):
// Estratégica ($12.000.000) = 1, Élite ($17.000.000) = 3. Cualquier otra = 1.
// Pasado el cupo, el cliente puede pedir permiso y el equipo lo aprueba.
const CUPO_SEMANAL: Record<string, number> = { esencial: 1, completo: 3 }
const CUPO_POR_DEFECTO = 1

export async function POST(req: NextRequest) {
  try {
    const { id_proyecto, id_biblioteca, accion, id_candidata } = await req.json()
    if (!id_proyecto || (accion === 'descartar' || accion === 'esperar' || accion === 'pedir_permiso' ? !id_candidata : !id_biblioteca)) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }
    if (!(await motorAutorizado(req, id_proyecto))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // "Descartar": sale de la lista del cliente pero no se borra (queda en el historial).
    // "Esperar": se queda en la lista marcada «En espera», con respuesta del cliente.
    if (accion === 'descartar' || accion === 'esperar') {
      const { error: errorMarcar } = await supabase
        .from('convocatorias_candidatas_proyecto')
        .update({ eleccion_cliente: accion === 'descartar' ? 'no_elegida' : 'en_espera' })
        .eq('id', id_candidata)
        .eq('id_proyecto', id_proyecto)
      if (errorMarcar) return NextResponse.json({ error: 'No se pudo guardar tu respuesta.' }, { status: 500 })
      return NextResponse.json({ ok: true, mensaje: accion === 'descartar' ? 'Convocatoria descartada.' : 'Quedó en espera.' })
    }

    // «Pedir permiso»: el cliente ya usó su cupo de la semana y quiere otra.
    if (accion === 'pedir_permiso') {
      const { data: cand } = await supabase
        .from('convocatorias_candidatas_proyecto')
        .select('id, nombre, entidad')
        .eq('id', id_candidata)
        .eq('id_proyecto', id_proyecto)
        .maybeSingle<{ id: string; nombre: string | null; entidad: string | null }>()
      if (!cand) return NextResponse.json({ error: 'No encontramos esa convocatoria.' }, { status: 404 })
      const { data: proy } = await supabase
        .from('proyectos_clientes_serving')
        .select('nombre_iniciativa, nombre_cliente, correo_cliente')
        .eq('id', id_proyecto)
        .maybeSingle<{ nombre_iniciativa: string | null; nombre_cliente: string | null; correo_cliente: string | null }>()
      await supabase
        .from('convocatorias_candidatas_proyecto')
        .update({ eleccion_cliente: 'permiso_pedido' })
        .eq('id', id_candidata)
        .eq('id_proyecto', id_proyecto)
      try {
        const html = buildEmailTemplate({
          title: 'Un cliente pide permiso para otra postulación',
          greeting: 'Hola equipo,',
          bodyLines: [
            `${proy?.nombre_cliente || proy?.correo_cliente} ya usó su cupo de la semana y quiere postular también a «${cand.nombre || 'una convocatoria'}»${cand.entidad ? ` (${cand.entidad})` : ''} con su proyecto «${proy?.nombre_iniciativa || 'sin nombre'}».`,
            'Si lo apruebas, la plataforma prepara la postulación de inmediato.',
          ],
          ctaText: 'Aprobar el permiso',
          ctaUrl: `${req.nextUrl.origin}/api/postulacion/aprobar-permiso?candidata=${id_candidata}&proyecto=${id_proyecto}`,
        })
        await Promise.all(DESTINOS.map((to) => sendEmail({ to, subject: 'Permiso para otra postulación', html })))
      } catch (e) {
        console.error('[quiero-postular] No se pudo avisar el permiso:', e)
      }
      return NextResponse.json({ ok: true, mensaje: 'Pediste permiso. Te respondemos pronto.' })
    }

    // Si estaba en espera y ahora quiere postular, vuelve a ser una elegida.
    if (id_candidata) {
      await supabase
        .from('convocatorias_candidatas_proyecto')
        .update({ eleccion_cliente: 'elegida' })
        .eq('id', id_candidata)
        .eq('id_proyecto', id_proyecto)
    }

    const { data: proyecto } = await supabase
      .from('proyectos_clientes_serving')
      .select('id, nombre_iniciativa, nombre_cliente, correo_cliente, contrato_firmado, plan_pago')
      .eq('id', id_proyecto)
      .maybeSingle<{
        id: string
        nombre_iniciativa: string | null
        nombre_cliente: string | null
        correo_cliente: string | null
        contrato_firmado: boolean | null
        plan_pago: string | null
      }>()
    if (!proyecto) return NextResponse.json({ error: 'No encontramos tu proyecto.' }, { status: 404 })

    if (!proyecto.contrato_firmado) {
      return NextResponse.json(
        { error: 'Para postular primero debes aceptar tu contrato. Sin contrato no podemos continuar.' },
        { status: 403 },
      )
    }

    // Cupo de la semana: si ya lo usó, no se prepara sola; puede pedir permiso.
    const cupo = CUPO_SEMANAL[proyecto.plan_pago || ''] ?? CUPO_POR_DEFECTO
    const hace7Dias = new Date(Date.now() - 7 * 86400000).toISOString()
    const { count: usadas } = await supabase
      .from('postulaciones')
      .select('id', { count: 'exact', head: true })
      .eq('proyecto_id', id_proyecto)
      .gte('actualizada_en', hace7Dias)
    if ((usadas || 0) >= cupo) {
      return NextResponse.json(
        {
          necesita_permiso: true,
          error: `Ya usaste tu cupo de esta semana (${cupo} ${cupo === 1 ? 'postulación' : 'postulaciones'}). Puedes pedir permiso para otra.`,
        },
        { status: 409 },
      )
    }

    const { data: ficha } = await supabase
      .from('biblioteca_convocatorias')
      .select('id, nombre, entidad, fecha_cierre_texto, fuente_oficial')
      .eq('id', id_biblioteca)
      .maybeSingle<{ id: string; nombre: string | null; entidad: string | null; fecha_cierre_texto: string | null; fuente_oficial: string | null }>()
    if (!ficha) return NextResponse.json({ error: 'No encontramos esa convocatoria.' }, { status: 404 })

    const origen = req.nextUrl.origin
    after(async () => {
      let resumen = ''
      try {
        const r = await prepararPostulacion(supabase, id_proyecto, id_biblioteca)
        resumen = r.ok
          ? `Postulación preparada. Puntaje de la evaluación: ${r.puntaje ?? 's/d'}. ${r.veredicto || ''} ${r.mensaje || ''}`
          : `No se pudo preparar todavía: ${r.mensaje}`
      } catch (e) {
        resumen = `Error preparando la postulación: ${(e as Error).message}`
      }
      try {
        const html = buildEmailTemplate({
          title: 'Un cliente quiere postular',
          greeting: 'Hola equipo,',
          bodyLines: [
            `${proyecto.nombre_cliente || proyecto.correo_cliente} apretó «Quiero postular» en su proyecto «${proyecto.nombre_iniciativa || 'sin nombre'}».`,
            `Convocatoria: ${ficha.nombre || 'sin nombre'}${ficha.entidad ? ` (${ficha.entidad})` : ''}${ficha.fecha_cierre_texto ? ` — cierre: ${ficha.fecha_cierre_texto}` : ''}.`,
            `Tipo de proyecto: ${proyecto.plan_pago === 'cortesia' ? 'cortesía (comisión de éxito 10 %)' : 'plan contratado'}.`,
            resumen,
          ],
          ctaText: 'Abrir el proyecto',
          ctaUrl: `${origen}/mis-convocatorias?proyecto=${proyecto.id}`,
        })
        await Promise.all(
          DESTINOS.map((to) => sendEmail({ to, subject: `Quiere postular: ${ficha.nombre || 'convocatoria'}`, html })),
        )
      } catch (e) {
        console.error('[quiero-postular] No se pudo enviar el informe:', e)
      }
    })

    return NextResponse.json({
      ok: true,
      mensaje: 'Listo: ya estamos preparando tu postulación. Te avisamos cuando esté lista.',
    })
  } catch (e) {
    console.error('[quiero-postular] Error:', e)
    return NextResponse.json({ error: 'No se pudo procesar tu solicitud.' }, { status: 500 })
  }
}
