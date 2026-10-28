import { NextRequest, NextResponse, after } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prepararReplica } from '@/lib/motorReplica'
import { motorAutorizado, cabecerasInternas } from '@/lib/candadoMotores'
import { buildEmailTemplate, sendEmail } from '@/lib/email'
import { LOTE_ABANICO, TOTAL_ABANICO } from '@/lib/abanico'
import {
  palabrasDelProyecto,
  puntuarConvocatoria,
  type ConvocatoriaParaPuntaje,
} from '@/lib/puntajeRapido'

/**
 * ABANICO — la plataforma arma sola las convocatorias, en segundo plano.
 *
 * Lo llama el webhook de Bold apenas el pago queda aprobado (llamada interna). Escoge las
 * convocatorias abiertas que mejor le quedan al proyecto (el orden de "A tu medida", sin
 * las que hoy lo dejarían fuera) y, para cada una, prepara una réplica con la IA: qué se
 * conserva, qué se adapta y qué obliga a cambiar esa convocatoria.
 *
 * ¿Por qué "por tandas"? Cada convocatoria es una llamada a la IA y una función de Vercel
 * tiene un límite de tiempo. Por eso cada pasada prepara 3 y, si faltan, se vuelve a llamar
 * a sí misma sola, hasta llegar a 12. Nadie tiene que pulsar nada: si algo se corta, la
 * siguiente pasada sigue donde iba, sin repetir lo que ya está hecho.
 *
 * Al terminar, el abanico pasa a "listo" y se le avisa al cliente por correo para que escoja.
 */

export const maxDuration = 300

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const MAX_REINTENTOS = 2

const COLUMNAS_BASE =
  'id, nombre, entidad, sector, objetivo, linea_tematica, territorio, paises_elegibles, tipo_postulante, monto_maximo, moneda, contrapartida_exigida, contrapartida_detalle, requisitos_habilitantes, fecha_cierre, fuente_oficial, enlace_aplicacion'
const COLUMNAS_CON_CONDICIONES = `${COLUMNAS_BASE}, consorcio_obligatorio, madurez_financiable, verificada_en`

async function terminar(abanicoId: string, proyectoId: string, cantidad: number, origen: string) {
  const estado = cantidad > 0 ? 'listo' : 'sin_opciones'
  await supabase
    .from('abanicos')
    .update({ estado, listo_en: new Date().toISOString() })
    .eq('id', abanicoId)

  if (cantidad === 0) return

  const { data: proyecto } = await supabase
    .from('proyectos_clientes_serving')
    .select('nombre_iniciativa, correo_cliente')
    .eq('id', proyectoId)
    .maybeSingle()
  if (!proyecto?.correo_cliente) return

  const envio = await sendEmail({
    to: String(proyecto.correo_cliente),
    subject: 'Tu abanico está listo: escoge a qué convocatorias entrar',
    html: buildEmailTemplate({
      title: 'Tu abanico está listo',
      greeting: 'Hola,',
      bodyLines: [
        `Adaptamos <strong>${proyecto.nombre_iniciativa || 'tu proyecto'}</strong> a ${cantidad} convocatorias.`,
        'Para cada una te contamos qué se conserva, qué se adapta y qué cambia. Ahora te toca escoger a cuáles quieres entrar.',
      ],
      ctaText: 'Escoger mis convocatorias',
      ctaUrl: `${origen}/mi-abanico`,
    }),
  })
  if (!envio.success) console.error('[abanico/preparar] No se pudo avisar al cliente:', envio.message)
}

export async function POST(req: NextRequest) {
  try {
    const { abanicoId, intentos = 0, esperas = 0 } = await req.json().catch(() => ({}))
    if (!abanicoId) return NextResponse.json({ error: 'Falta abanicoId' }, { status: 400 })

    const { data: abanico } = await supabase
      .from('abanicos')
      .select('id, proyecto_id, estado')
      .eq('id', abanicoId)
      .maybeSingle()
    if (!abanico) return NextResponse.json({ error: 'No se encontró el abanico' }, { status: 404 })

    if (!(await motorAutorizado(req, String(abanico.proyecto_id)))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (abanico.estado !== 'pagado' && abanico.estado !== 'preparando') {
      return NextResponse.json({ ok: true, ignorado: `El abanico está en estado ${abanico.estado}` })
    }
    if (abanico.estado === 'pagado') {
      await supabase.from('abanicos').update({ estado: 'preparando' }).eq('id', abanico.id)
    }

    const proyectoId = String(abanico.proyecto_id)
    const origen = req.nextUrl.origin

    const { data: proyecto } = await supabase
      .from('proyectos_clientes_serving')
      .select('id, nombre_iniciativa, correo_cliente, dossier_markdown, monto_solicitado_cop, respuestas_fase1_json')
      .eq('id', proyectoId)
      .maybeSingle()
    if (!proyecto) return NextResponse.json({ error: 'No se encontró el proyecto' }, { status: 404 })

    /* ---- revisión rápida: si el proyecto llegó de afuera y todavía se está leyendo, se espera ---- */
    // Un proyecto que llegó con su propio documento pasa primero por nuestra estructuración.
    // Si aún no tiene nada leído, se espera un rato (hasta ~6 min) antes de armar el abanico.
    const { count: pasosLeidos } = await supabase
      .from('contenido_pasos_proyecto')
      .select('id_paso', { count: 'exact', head: true })
      .eq('id_proyecto', proyectoId)
    const { count: nodosArbol } = await supabase
      .from('problemas_proyecto')
      .select('id', { count: 'exact', head: true })
      .eq('proyecto_id', proyectoId)
    const sinContenido = !String(proyecto.dossier_markdown || '').trim() && !(pasosLeidos || 0) && !(nodosArbol || 0)

    if (sinContenido && Number(esperas) < 4) {
      after(async () => {
        try {
          await new Promise((r) => setTimeout(r, 90_000))
          await fetch(`${origen}/api/abanico/preparar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...cabecerasInternas() },
            body: JSON.stringify({ abanicoId: abanico.id, intentos, esperas: Number(esperas) + 1 }),
          })
        } catch (e) {
          console.error('[abanico/preparar] No se pudo reintentar tras la espera:', e)
        }
      })
      return NextResponse.json({ ok: true, esperando_estructuracion: true })
    }

    /* ---- las que ya están hechas ---- */
    const { data: hechas } = await supabase.from('replicas').select('biblioteca_id').eq('abanico_id', abanico.id)
    const yaHechas = new Set(
      ((hechas || []) as { biblioteca_id: string | null }[]).map((r) => String(r.biblioteca_id)).filter((v) => v !== 'null'),
    )
    const cantidadHecha = (hechas || []).length

    if (cantidadHecha >= TOTAL_ABANICO) {
      await terminar(String(abanico.id), proyectoId, cantidadHecha, origen)
      return NextResponse.json({ ok: true, completo: true, hechas: cantidadHecha })
    }

    /* ---- cuáles le quedan mejor ---- */
    const hoy = new Date().toISOString().slice(0, 10)
    let consulta = await supabase
      .from('biblioteca_convocatorias')
      .select(COLUMNAS_CON_CONDICIONES)
      .or(`fecha_cierre.is.null,fecha_cierre.gte.${hoy}`)
      .limit(2000)
    if (consulta.error) {
      consulta = (await supabase
        .from('biblioteca_convocatorias')
        .select(COLUMNAS_BASE)
        .or(`fecha_cierre.is.null,fecha_cierre.gte.${hoy}`)
        .limit(2000)) as unknown as typeof consulta
    }
    const biblioteca = ((consulta.data || []) as unknown as ConvocatoriaParaPuntaje[]).filter((c) => c.nombre)

    let textoDiagnostico = ''
    if (proyecto.correo_cliente) {
      const { data: diag } = await supabase
        .from('diagnosticos')
        .select('datos_formulario')
        .ilike('email', String(proyecto.correo_cliente))
        .not('datos_formulario', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (diag?.datos_formulario && typeof diag.datos_formulario === 'object') {
        textoDiagnostico = Object.entries(diag.datos_formulario as Record<string, unknown>)
          .filter(([clave, valor]) => !/documento|identidad|correo|email|tel[eé]fono|whats|contrase|password/i.test(clave) && typeof valor === 'string')
          .map(([, valor]) => String(valor))
          .join(' ')
          .slice(0, 6000)
      }
    }
    const textoProyecto = [proyecto.nombre_iniciativa, String(proyecto.dossier_markdown || '').slice(0, 6000), textoDiagnostico]
      .filter(Boolean)
      .join(' ')
    const perfil = {
      tipoSolicitante: String((proyecto.respuestas_fase1_json as Record<string, unknown> | null)?.q4_tipo_solicitante || '') || null,
      montoSolicitadoCop: Number(proyecto.monto_solicitado_cop || 0) || null,
    }

    const claves = palabrasDelProyecto(textoProyecto, biblioteca)
    const candidatas = biblioteca
      .filter((c) => !yaHechas.has(String(c.id)))
      .map((c) => ({ c, r: puntuarConvocatoria(c, claves, perfil) }))
      // Las que hoy lo dejarían fuera no entran: no sirve postular donde no se puede.
      .filter((x) => x.r.elegibilidad.estado !== 'falta')
      .sort((a, b) => b.r.puntaje - a.r.puntaje)

    const porHacer = Math.min(LOTE_ABANICO, TOTAL_ABANICO - cantidadHecha)
    const elegidas = candidatas.slice(0, porHacer)

    // No quedan más convocatorias que le queden bien: el abanico queda con las que ya hay.
    if (elegidas.length === 0) {
      await terminar(String(abanico.id), proyectoId, cantidadHecha, origen)
      return NextResponse.json({ ok: true, completo: true, hechas: cantidadHecha, sin_mas_opciones: true })
    }

    /* ---- una réplica a medida por convocatoria ---- */
    let creadas = 0
    for (const { c } of elegidas) {
      const hecho = await prepararReplica(supabase, proyectoId, {
        tipo: 'otra convocatoria',
        convocatoriaId: String(c.id),
        modalidadCobro: 'abanico',
      })
      if (hecho.ok && hecho.replicaId) {
        creadas += 1
        await supabase.from('replicas').update({ abanico_id: abanico.id }).eq('id', hecho.replicaId)
      }
    }

    const total = cantidadHecha + creadas
    if (total >= TOTAL_ABANICO) {
      await terminar(String(abanico.id), proyectoId, total, origen)
      return NextResponse.json({ ok: true, completo: true, hechas: total })
    }

    // Si en toda la pasada no salió ninguna, se reintenta unas veces y luego se cierra con lo que haya.
    const siguientesIntentos = creadas === 0 ? Number(intentos) + 1 : 0
    if (siguientesIntentos > MAX_REINTENTOS) {
      await terminar(String(abanico.id), proyectoId, total, origen)
      return NextResponse.json({ ok: true, completo: true, hechas: total, cortado_por_errores: true })
    }

    // Faltan: la siguiente pasada se lanza sola.
    after(async () => {
      try {
        await fetch(`${origen}/api/abanico/preparar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...cabecerasInternas() },
          body: JSON.stringify({ abanicoId: abanico.id, intentos: siguientesIntentos }),
        })
      } catch (e) {
        console.error('[abanico/preparar] No se pudo lanzar la siguiente pasada:', e)
      }
    })

    return NextResponse.json({ ok: true, completo: false, hechas: total })
  } catch (e) {
    console.error('[abanico/preparar] Error:', e)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
