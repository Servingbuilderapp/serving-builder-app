import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { motorAutorizado } from '@/lib/candadoMotores'
import { buildEmailTemplate, sendEmail } from '@/lib/email'
import { etapaPorNivel } from '@/lib/relojProyecto'

/**
 * SEGUIMIENTO A QUIEN HIZO EL DIAGNÓSTICO Y NO CONTRATÓ.
 *
 * Tres correos como máximo por persona, nunca más:
 *   1. A los 2 días:  «Esto vimos en tu diagnóstico» y el enlace a su resultado.
 *   2. A los 7 días:  la oferta que le corresponde según la etapa de su proyecto (reloj).
 *   3. A los 14 días: cierre amable, sin insistir.
 * Cada correo dice lo mismo que el diagnóstico (etapa, fuentes y posibilidades salen de la
 * misma tabla del reloj). No se inventan porcentajes.
 *
 * Se salta a quien ya es cliente (tiene proyecto con su correo), al equipo y a quien el equipo
 * marcó para no escribirle. Para marcar a alguien que pidió que no le escriban más: en la tabla
 * seguimientos_cliente, fila proyecto_id = 'dx:<id del diagnóstico>', clave = 'diagnostico', veces = 99.
 *
 * Prueba sin enviar: /api/seguimiento-diagnostico?probar=1
 */

export const maxDuration = 300

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const DIA_MS = 86400000
const DIAS_PARA_CORREO = [2, 7, 14] // el correo número 1, 2 y 3
const MAXIMO_POR_CORRIDA = 100
const CORREOS_DEL_EQUIPO = ['servingbuilderapp@gmail.com', 'iagif1964@gmail.com']
const TELEFONO_WHATSAPP = '573123335966'

const normalizar = (c: string | null | undefined) => {
  const [usuario = '', dominio = ''] = String(c || '').toLowerCase().trim().split('@')
  return `${dominio === 'gmail.com' ? usuario.replace(/\./g, '').split('+')[0] : usuario}@${dominio}`
}
const escapar = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

type Diagnostico = {
  id: string | number
  nombre: string | null
  email: string | null
  created_at: string
  codigo_acceso: string | null
  resultado_completo: { nivelMadurez?: number } | null
}

export async function GET(req: NextRequest) {
  try {
    if (!(await motorAutorizado(req, null))) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const soloProbar = req.nextUrl.searchParams.get('probar') === '1'
    const origen = req.nextUrl.origin

    const { error: errorTabla } = await supabase.from('seguimientos_cliente').select('proyecto_id').limit(1)
    if (errorTabla) {
      return NextResponse.json({ error: 'Falta la tabla seguimientos_cliente en Supabase. No se envió nada.', detalle: errorTabla.message }, { status: 500 })
    }

    const desde = new Date(new Date().getTime() - 30 * DIA_MS).toISOString()
    const { data: filas, error } = await supabase
      .from('diagnosticos')
      .select('id, nombre, email, created_at, codigo_acceso, resultado_completo')
      .gte('created_at', desde)
      .not('email', 'is', null)
      .order('created_at', { ascending: true })
      .limit(1000)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Quien ya es cliente no recibe esto.
    const { data: proyectos } = await supabase.from('proyectos_clientes_serving').select('correo_cliente').not('correo_cliente', 'is', null)
    const clientes = new Set((proyectos || []).map((p) => normalizar(p.correo_cliente as string)))
    const equipo = new Set(CORREOS_DEL_EQUIPO.map(normalizar))

    // Una sola persona puede haber hecho varios diagnósticos: se usa el más reciente de cada correo.
    const porCorreo = new Map<string, Diagnostico>()
    for (const d of (filas || []) as Diagnostico[]) {
      const c = normalizar(d.email)
      if (!c.includes('@') || clientes.has(c) || equipo.has(c)) continue
      porCorreo.set(c, d)
    }

    const ids = [...porCorreo.values()].map((d) => `dx:${d.id}`)
    const { data: marcas } = ids.length
      ? await supabase.from('seguimientos_cliente').select('proyecto_id, veces, ultimo_envio').eq('clave', 'diagnostico').in('proyecto_id', ids)
      : { data: [] }
    const memoria = new Map(((marcas || []) as { proyecto_id: string; veces: number; ultimo_envio: string | null }[]).map((m) => [m.proyecto_id, m]))

    const ahora = new Date().getTime()
    const resultado: { correo: string; correo_numero: number; enviado: boolean | string }[] = []

    for (const d of porCorreo.values()) {
      if (resultado.length >= MAXIMO_POR_CORRIDA) break
      const clave = `dx:${d.id}`
      const previo = memoria.get(clave)
      const veces = previo?.veces || 0
      if (veces >= DIAS_PARA_CORREO.length) continue
      const edadDias = (ahora - new Date(d.created_at).getTime()) / DIA_MS
      if (edadDias < DIAS_PARA_CORREO[veces]) continue
      // Nunca dos correos seguidos en menos de 3 días.
      if (previo?.ultimo_envio && ahora - new Date(previo.ultimo_envio).getTime() < 3 * DIA_MS) continue

      const numero = veces + 1
      const etapa = etapaPorNivel(d.resultado_completo?.nivelMadurez)
      const primerNombre = String(d.nombre || '').trim().split(/\s+/)[0]
      const saludo = primerNombre ? `Hola ${escapar(primerNombre)},` : 'Hola,'
      const enlaceResultado = d.codigo_acceso ? `${origen}/diagnostico/resultado/${d.codigo_acceso}` : `${origen}/diagnostico`
      const bajar = 'Si prefieres no recibir más mensajes, responde este correo con la palabra BAJA y no te escribimos más.'

      let asunto = ''
      let titulo = ''
      let lineas: string[] = []
      let boton = ''
      let enlace = enlaceResultado

      if (numero === 1) {
        asunto = etapa ? `Tu proyecto está en etapa de ${etapa.nombre.toLowerCase()}` : 'Tu diagnóstico quedó listo'
        titulo = 'Esto vimos en tu diagnóstico'
        lineas = etapa
          ? [
              `Tu proyecto está en la etapa de <strong>${escapar(etapa.nombre)}</strong>: ${escapar(etapa.descripcion)}`,
              `En esta etapa, el dinero suele venir de: ${escapar(etapa.fuentes.join(', '))}.`,
              'Tu resultado completo sigue guardado: puedes volver a verlo cuando quieras.',
            ]
          : ['Tu resultado completo sigue guardado: puedes volver a verlo cuando quieras.']
        boton = 'Ver mi resultado'
      } else if (numero === 2) {
        titulo = 'El siguiente paso para tu proyecto'
        if (etapa && etapa.nivel === 1) {
          asunto = 'Por dónde empezar con tu proyecto'
          lineas = [
            escapar(etapa.recomendacion),
            'Si quieres avanzar con nosotros, lo más sensato en tu etapa es una membresía o la Academia, para fortalecer el proyecto antes de postular.',
          ]
          boton = 'Ver membresías'
          enlace = `${origen}/membresia`
        } else {
          asunto = 'Tu proyecto ya puede aspirar a una convocatoria'
          lineas = [
            etapa ? escapar(etapa.recomendacion) : 'Con una buena estructuración, tu proyecto puede postularse a convocatorias que le encajen.',
            'Nosotros lo estructuramos, buscamos las convocatorias que le quedan bien y lo dejamos listo para postular.',
          ]
          boton = 'Quiero estructurar mi proyecto'
          enlace = `${origen}/contratar`
        }
      } else {
        asunto = 'Tu resultado sigue disponible'
        titulo = 'No vamos a insistir más'
        lineas = [
          'Este es nuestro último mensaje sobre tu diagnóstico. Tu resultado queda guardado y la puerta sigue abierta.',
          `Si tienes dudas o quieres hablar con una persona, escríbenos al WhatsApp ${TELEFONO_WHATSAPP.replace(/^57/, '')}.`,
        ]
        boton = 'Ver mi resultado'
      }

      const html = buildEmailTemplate({
        title: titulo,
        greeting: saludo,
        bodyLines: [...lineas, `<span style="font-size:12px;color:#777">${bajar}</span>`],
        ctaText: boton,
        ctaUrl: enlace,
      })

      let enviado: boolean | string = 'simulado'
      if (!soloProbar) {
        // Se anota ANTES de enviar: es preferible perder un correo que repetirlo.
        const { error: errorGuardar } = await supabase
          .from('seguimientos_cliente')
          .upsert({ proyecto_id: clave, clave: 'diagnostico', veces: numero, ultimo_envio: new Date().toISOString() }, { onConflict: 'proyecto_id,clave' })
        if (errorGuardar) {
          enviado = `no se envió: no se pudo anotar (${errorGuardar.message})`
        } else {
          const envio = await sendEmail({ to: String(d.email), subject: asunto, html })
          enviado = envio.success ? true : envio.message
        }
      }
      resultado.push({ correo: String(d.email), correo_numero: numero, enviado })
    }

    return NextResponse.json({
      ok: true,
      modo: soloProbar ? 'prueba (no se envió nada)' : 'envío real',
      personas_revisadas: porCorreo.size,
      correos: resultado,
    })
  } catch (e) {
    console.error('[seguimiento-diagnostico]', e)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
