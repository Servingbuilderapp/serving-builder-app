import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { motorAutorizado } from '@/lib/candadoMotores'
import { buildEmailTemplate, sendEmail } from '@/lib/email'
import { calcularSiguientePaso } from '@/lib/siguientePaso'
import { ultimoMovimientoPorProyecto } from '@/lib/actividadProyectos'
import type { ProyectoVisto } from '@/lib/proyectoVisto'

/**
 * SEGUIMIENTO AL CLIENTE — "esto es lo que necesitamos de ti para avanzar".
 *
 * Una vez al día revisa cada proyecto y, SOLO si el cliente tiene algo pendiente que depende
 * de él (responder preguntas, subir el documento, reunir documentos, elegir convocatorias),
 * le manda un correo con lo mismo que dice su tarjeta de "siguiente paso".
 *
 * Para no molestarlo:
 *   - Espera a que el proyecto lleve al menos 1 día sin movimiento antes del primer correo.
 *   - Después, un correo cada 2 días como máximo.
 *   - Máximo 3 recordatorios por el mismo pendiente. Pasados los 3, ya no se le escribe: el
 *     equipo lo ve en el tablero de Productividad y puede escribirle por WhatsApp.
 *   - Si no hay nada que pedirle, no se le escribe.
 *   - Las convocatorias que cierran pronto las avisa /api/avisos-diarios; aquí se omiten.
 *
 * Si la tabla `seguimientos_cliente` no existe, NO envía nada (sin ella no puede acordarse de
 * lo ya enviado y repetiría correos). Se prueba sin enviar con /api/seguimiento-cliente?probar=1
 */

export const maxDuration = 300

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const DIAS_QUIETO_ANTES_DEL_PRIMERO = 1
const DIAS_ENTRE_CORREOS = 2
const MAXIMO_RECORDATORIOS = 3
const SIN_ARRANCAR = ['pendiente_pago', 'pendiente_aval', 'aval_rechazado']
const CORREOS_DEL_EQUIPO = ['servingbuilderapp@gmail.com', 'iagif1964@gmail.com']
const DIA_MS = 86400000

const normalizar = (c: string | null | undefined) => {
  const [usuario = '', dominio = ''] = String(c || '').toLowerCase().trim().split('@')
  return `${dominio === 'gmail.com' ? usuario.replace(/\./g, '').split('+')[0] : usuario}@${dominio}`
}
const esDelEquipo = (c: string | null | undefined) => CORREOS_DEL_EQUIPO.map(normalizar).includes(normalizar(c))
const escapar = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

type Proyecto = {
  id: string
  nombre_cliente: string | null
  correo_cliente: string | null
  nombre_iniciativa: string | null
  estado_actual: string | null
  created_at: string | null
}

export async function GET(req: NextRequest) {
  try {
    if (!(await motorAutorizado(req, null))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    const soloProbar = req.nextUrl.searchParams.get('probar') === '1'
    const origen = req.nextUrl.origin

    // Sin la tabla de memoria, no se envía nada.
    const { error: errorTabla } = await supabase.from('seguimientos_cliente').select('proyecto_id').limit(1)
    if (errorTabla) {
      return NextResponse.json(
        { error: 'Falta crear la tabla seguimientos_cliente en Supabase (corre el SQL que acompaña esta entrega). No se envió nada.', detalle: errorTabla.message },
        { status: 500 },
      )
    }

    const { data: filas, error } = await supabase
      .from('proyectos_clientes_serving')
      .select('id, nombre_cliente, correo_cliente, nombre_iniciativa, estado_actual, created_at')
      .not('correo_cliente', 'is', null)
      .order('created_at', { ascending: false })
      .limit(500)
    if (error) return NextResponse.json({ error: `No se pudieron leer los proyectos: ${error.message}` }, { status: 500 })

    const proyectos = ((filas || []) as Proyecto[]).filter(
      (p) => !esDelEquipo(p.correo_cliente) && !SIN_ARRANCAR.includes(String(p.estado_actual || '')) && String(p.estado_actual || '') !== 'postulado',
    )

    const ultimoMov = await ultimoMovimientoPorProyecto(
      supabase,
      proyectos.map((p) => ({ id: String(p.id), created_at: p.created_at })),
    )
    const ahora = new Date().getTime()

    // Solo se revisan los que llevan al menos un día quietos: ahorra consultas y evita escribir de más.
    const quietos = proyectos.filter((p) => {
      const mov = ultimoMov.get(String(p.id))
      return mov ? ahora - mov.getTime() >= DIAS_QUIETO_ANTES_DEL_PRIMERO * DIA_MS : true
    })

    const resultado: { proyecto: string; correo: string; paso: string; recordatorio: number; enviado: boolean | string }[] = []
    let omitidosPorLimite = 0

    for (let i = 0; i < quietos.length; i += 5) {
      const lote = quietos.slice(i, i + 5)
      const calculos = await Promise.all(
        lote.map(async (p) => {
          try {
            const vista: ProyectoVisto = {
              db: supabase as unknown as ProyectoVisto['db'],
              proyectoId: String(p.id),
              nombreProyecto: p.nombre_iniciativa,
              nombreCliente: p.nombre_cliente,
              correoCliente: p.correo_cliente,
              vistaEquipo: false,
            }
            return { p, paso: await calcularSiguientePaso(vista) }
          } catch {
            return { p, paso: null }
          }
        }),
      )

      for (const { p, paso } of calculos) {
        if (!paso || !paso.pideAlgo || !paso.accion || !paso.clave) continue
        if (paso.clave === 'cierre') continue // lo avisa /api/avisos-diarios

        const idProyecto = String(p.id)
        const { data: previo } = await supabase
          .from('seguimientos_cliente')
          .select('veces, ultimo_envio')
          .eq('proyecto_id', idProyecto)
          .eq('clave', paso.clave)
          .maybeSingle<{ veces: number; ultimo_envio: string | null }>()

        const veces = previo?.veces || 0
        if (veces >= MAXIMO_RECORDATORIOS) {
          omitidosPorLimite++
          continue
        }
        if (previo?.ultimo_envio && ahora - new Date(previo.ultimo_envio).getTime() < DIAS_ENTRE_CORREOS * DIA_MS) continue

        const nombre = String(p.nombre_iniciativa || 'tu proyecto')
        const primerNombre = String(p.nombre_cliente || '').trim().split(/\s+/)[0]
        const html = buildEmailTemplate({
          title: paso.titulo,
          greeting: primerNombre ? `Hola ${escapar(primerNombre)},` : 'Hola,',
          bodyLines: [
            `Sobre tu proyecto <strong>${escapar(nombre)}</strong>:`,
            escapar(paso.texto),
            'Si ya lo hiciste, puedes ignorar este mensaje. Y si algo no te queda claro, respóndenos y te ayudamos.',
          ],
          ctaText: paso.accion.texto,
          ctaUrl: `${origen}${paso.accion.href}`,
        })

        let enviado: boolean | string = 'simulado'
        if (!soloProbar) {
          // Se anota ANTES de enviar: si algo falla a medias, es mejor perder un recordatorio que repetirlo.
          const { error: errorGuardar } = await supabase
            .from('seguimientos_cliente')
            .upsert(
              { proyecto_id: idProyecto, clave: paso.clave, veces: veces + 1, ultimo_envio: new Date().toISOString() },
              { onConflict: 'proyecto_id,clave' },
            )
          if (errorGuardar) {
            enviado = `no se envió: no se pudo anotar (${errorGuardar.message})`
          } else {
            const envio = await sendEmail({
              to: String(p.correo_cliente),
              subject: `${nombre}: ${paso.titulo}`,
              html,
            })
            enviado = envio.success ? true : envio.message
            if (!envio.success) console.error(`[seguimiento-cliente] No se pudo enviar (${idProyecto}):`, envio.message)
          }
        }
        resultado.push({
          proyecto: nombre,
          correo: String(p.correo_cliente),
          paso: paso.titulo,
          recordatorio: veces + 1,
          enviado,
        })
      }
    }

    return NextResponse.json({
      ok: true,
      modo: soloProbar ? 'prueba (no se envió nada)' : 'envío real',
      proyectos_revisados: quietos.length,
      que_ya_llegaron_al_maximo: omitidosPorLimite,
      correos: resultado,
    })
  } catch (e) {
    console.error('[seguimiento-cliente] Error:', e)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
