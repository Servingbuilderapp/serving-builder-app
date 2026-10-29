import { NextRequest, NextResponse, after } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { motorAutorizado, cabecerasInternas } from '@/lib/candadoMotores'
import { buildEmailTemplate, sendEmail } from '@/lib/email'
import {
  palabrasDelProyecto,
  puntuarConvocatoria,
  type ConvocatoriaParaPuntaje,
} from '@/lib/puntajeRapido'

/**
 * AVISO DIARIO — UN solo correo al día por proyecto (nunca uno por convocatoria).
 *
 * Cuenta dos cosas, y solo escribe si hay algo que contar:
 *   1. Convocatorias que el cliente ya eligió y cierran en 7 días o menos, y todavía
 *      no están radicadas. Es lo que más importa: pasada la fecha, ya no se puede.
 *   2. Convocatorias NUEVAS en la biblioteca (vistas por primera vez en las últimas
 *      24 horas) que le quedan bien a su proyecto (60 puntos o más en "A tu medida").
 *
 * Se programa una vez al día en vercel.json. Se puede probar a mano con
 * /api/avisos-diarios?probar=1, que NO envía nada y solo muestra a quién le escribiría.
 */

export const maxDuration = 300

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const PUNTAJE_MINIMO = 60
const MAXIMO_NUEVAS_POR_CORREO = 5
const DIAS_AVISO_CIERRE = 7

const COLUMNAS_BIBLIOTECA_BASE =
  'id, nombre, entidad, sector, objetivo, linea_tematica, territorio, paises_elegibles, tipo_postulante, monto_maximo, moneda, contrapartida_exigida, contrapartida_detalle, requisitos_habilitantes, fecha_cierre, fuente_oficial, enlace_aplicacion, primera_vez_vista'
const COLUMNAS_BIBLIOTECA = `${COLUMNAS_BIBLIOTECA_BASE}, consorcio_obligatorio, madurez_financiable, verificada_en`

type Fila = ConvocatoriaParaPuntaje & { primera_vez_vista?: string | null }

const escapar = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function diasHasta(fecha: string): number {
  const f = new Date(fecha)
  const hoy = new Date()
  const base = Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate())
  return Math.round((Date.UTC(f.getUTCFullYear(), f.getUTCMonth(), f.getUTCDate()) - base) / 86400000)
}

export async function GET(req: NextRequest) {
  try {
    if (!(await motorAutorizado(req, null))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const soloProbar = req.nextUrl.searchParams.get('probar') === '1'
    const origen = req.nextUrl.origin
    const hoy = new Date().toISOString().slice(0, 10)
    const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    /* ---- red de seguridad: abanicos que se quedaron a medias ---- */
    // Si una pasada de preparación se cortó, aquí se retoma sola. La preparación no repite lo ya hecho.
    if (!soloProbar) {
      const hace30min = new Date(Date.now() - 30 * 60 * 1000).toISOString()
      const { data: atascados } = await supabase
        .from('abanicos')
        .select('id')
        .in('estado', ['pagado', 'preparando'])
        .lt('pagado_en', hace30min)
      for (const a of atascados || []) {
        after(async () => {
          try {
            await fetch(`${origen}/api/abanico/preparar`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...cabecerasInternas() },
              body: JSON.stringify({ abanicoId: a.id }),
            })
          } catch (e) {
            console.error('[avisos-diarios] No se pudo retomar un abanico:', e)
          }
        })
      }
    }

    /* ---- la biblioteca abierta ---- */
    let consulta = await supabase
      .from('biblioteca_convocatorias')
      .select(COLUMNAS_BIBLIOTECA)
      .or(`fecha_cierre.is.null,fecha_cierre.gte.${hoy}`)
      .limit(2000)
    if (consulta.error) {
      consulta = (await supabase
        .from('biblioteca_convocatorias')
        .select(COLUMNAS_BIBLIOTECA_BASE)
        .or(`fecha_cierre.is.null,fecha_cierre.gte.${hoy}`)
        .limit(2000)) as unknown as typeof consulta
    }
    const biblioteca = ((consulta.data || []) as unknown as Fila[]).filter((c) => c.nombre)
    const nuevas = biblioteca.filter((c) => c.primera_vez_vista && c.primera_vez_vista >= hace24h)

    /* ---- los proyectos activos ---- */
    const { data: proyectos, error: errorProyectos } = await supabase
      .from('proyectos_clientes_serving')
      .select('id, nombre_iniciativa, correo_cliente, dossier_markdown, monto_solicitado_cop, respuestas_fase1_json')
      .eq('busqueda_convocatorias_iniciada', true)
      .not('correo_cliente', 'is', null)
      .limit(300)
    if (errorProyectos) {
      return NextResponse.json({ error: `No se pudieron leer los proyectos: ${errorProyectos.message}` }, { status: 500 })
    }

    const resultado: {
      proyecto: string
      correo: string
      cierres: number
      nuevas: number
      enviado: boolean | string
      cierres_detalle: string[]
      nuevas_detalle: string[]
    }[] = []

    for (const proyecto of proyectos || []) {
      const idProyecto = String(proyecto.id)

      /* 1. Convocatorias elegidas que cierran pronto y no están radicadas */
      const { data: elegidas } = await supabase
        .from('convocatorias_candidatas_proyecto')
        .select('nombre, fecha_cierre')
        .eq('id_proyecto', idProyecto)
        .eq('seleccionada', true)
        .eq('eleccion_cliente', 'elegida')
        .not('fecha_cierre', 'is', null)
      const { data: postuladas } = await supabase
        .from('postulaciones')
        .select('convocatoria_nombre, estado')
        .eq('proyecto_id', idProyecto)

      const sinTildes = (t: string) =>
        t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim()
      const terminadas = new Set(
        ((postuladas || []) as { convocatoria_nombre: string | null; estado: string | null }[])
          .filter((p) => ['Radicada', 'Adjudicada', 'Rechazada', 'Descartada'].includes(String(p.estado)))
          .map((p) => sinTildes(String(p.convocatoria_nombre || ''))),
      )
      const porCerrar = ((elegidas || []) as { nombre: string | null; fecha_cierre: string }[])
        .map((c) => ({ nombre: String(c.nombre || 'Una convocatoria'), dias: diasHasta(c.fecha_cierre) }))
        .filter((c) => Number.isFinite(c.dias) && c.dias >= 0 && c.dias <= DIAS_AVISO_CIERRE && !terminadas.has(sinTildes(c.nombre)))
        .sort((a, b) => a.dias - b.dias)

      /* 2. Convocatorias nuevas que le quedan bien */
      let buenas: { nombre: string; entidad: string; puntaje: number; fecha_cierre: string | null }[] = []
      if (nuevas.length > 0) {
        let textoDiagnostico = ''
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
        const textoProyecto = [proyecto.nombre_iniciativa, String(proyecto.dossier_markdown || '').slice(0, 6000), textoDiagnostico]
          .filter(Boolean)
          .join(' ')
        const perfil = {
          tipoSolicitante: String((proyecto.respuestas_fase1_json as Record<string, unknown> | null)?.q4_tipo_solicitante || '') || null,
          montoSolicitadoCop: Number(proyecto.monto_solicitado_cop || 0) || null,
        }
        const claves = palabrasDelProyecto(textoProyecto, biblioteca)
        buenas = nuevas
          .map((c) => ({ c, r: puntuarConvocatoria(c, claves, perfil) }))
          .filter((x) => x.r.puntaje >= PUNTAJE_MINIMO)
          .sort((a, b) => b.r.puntaje - a.r.puntaje)
          .slice(0, MAXIMO_NUEVAS_POR_CORREO)
          .map((x) => ({
            nombre: String(x.c.nombre),
            entidad: String(x.c.entidad || ''),
            puntaje: x.r.puntaje,
            fecha_cierre: x.c.fecha_cierre || null,
          }))
      }

      if (porCerrar.length === 0 && buenas.length === 0) continue

      /* ---- el correo (uno solo) ---- */
      const lineas: string[] = []
      if (porCerrar.length > 0) {
        lineas.push('<strong>Cierran esta semana (ya las elegiste):</strong>')
        for (const c of porCerrar) {
          const cuando = c.dias === 0 ? 'hoy' : c.dias === 1 ? 'mañana' : `en ${c.dias} días`
          lineas.push(`• ${escapar(c.nombre)} — cierra ${cuando}`)
        }
        lineas.push('Entra a revisar qué te falta: pasada la fecha, ya no se puede postular.')
      }
      if (buenas.length > 0) {
        lineas.push('<strong>Convocatorias nuevas que le quedan bien a tu proyecto:</strong>')
        for (const c of buenas) {
          lineas.push(
            `• ${escapar(c.nombre)}${c.entidad ? ` (${escapar(c.entidad)})` : ''} — ${c.puntaje} puntos` +
              (c.fecha_cierre ? `, cierra el ${new Date(c.fecha_cierre).toLocaleDateString('es-CO')}` : ''),
          )
        }
      }

      const nombreProyecto = proyecto.nombre_iniciativa || 'tu proyecto'
      const html = buildEmailTemplate({
        title: `Novedades de ${nombreProyecto}`,
        greeting: 'Hola,',
        bodyLines: lineas,
        ctaText: porCerrar.length > 0 ? 'Ver mis convocatorias' : 'Ver lo que le queda bien a mi proyecto',
        ctaUrl: `${origen}${porCerrar.length > 0 ? '/mis-convocatorias' : '/a-tu-medida'}`,
      })

      let enviado: boolean | string = 'simulado'
      if (!soloProbar) {
        const envio = await sendEmail({
          to: String(proyecto.correo_cliente),
          subject:
            porCerrar.length > 0
              ? `Cierra pronto: ${porCerrar[0].nombre}`
              : `Hay convocatorias nuevas para ${nombreProyecto}`,
          html,
        })
        enviado = envio.success ? true : envio.message
        if (!envio.success) console.error(`[avisos-diarios] No se pudo enviar el correo del proyecto ${idProyecto}:`, envio.message)
      }
      resultado.push({
        proyecto: String(nombreProyecto),
        correo: String(proyecto.correo_cliente),
        cierres: porCerrar.length,
        nuevas: buenas.length,
        enviado,
        cierres_detalle: porCerrar.map((c) => `${c.nombre} (cierra ${c.dias === 0 ? 'hoy' : c.dias === 1 ? 'mañana' : `en ${c.dias} días`})`),
        nuevas_detalle: buenas.map((c) => `${c.nombre} (${c.puntaje} puntos)`),
      })
    }

    return NextResponse.json({
      ok: true,
      modo: soloProbar ? 'prueba (no se envió nada)' : 'envío real',
      convocatorias_nuevas_ultimas_24h: nuevas.length,
      proyectos_revisados: (proyectos || []).length,
      correos: resultado,
    })
  } catch (e) {
    console.error('[avisos-diarios] Error:', e)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
