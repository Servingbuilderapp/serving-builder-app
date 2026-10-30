import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { motorAutorizado } from '@/lib/candadoMotores'
import { obtenerTokenAcceso } from '@/lib/gmailBoletines'
import { callGemini } from '@/lib/gemini'

/**
 * CENTINELA — CONCILIAR LAS FUENTES CON EL BUZÓN.
 *
 * El problema: la lista de fuentes (166) solo cambiaba de estado cuando alguien lo marcaba a mano.
 * Aunque el buzón ya recibiera cientos de boletines, la pantalla seguía diciendo «Falta suscribir».
 *
 * Esta ruta mira de quién llegan los correos del buzón (últimos 60 días) y los cruza con la lista:
 *   1. Por correo exacto del remitente o por el sitio web de la fuente.
 *   2. Por el nombre de la fuente dentro del nombre del remitente.
 *   3. Lo que no cuadre, se lo pide a Gemini UNA vez (en una sola llamada para todos).
 * Las fuentes encontradas pasan solas a «Llegando al buzón», con la fecha del primer correo.
 *
 * Además deja un informe (se ve en la pantalla del Centinela):
 *   - boletines que están cayendo en SPAM (el Centinela no los lee desde ahí),
 *   - remitentes que llegan pero no están en la lista de fuentes,
 *   - fuentes que deberían mandar boletín y todavía no llega nada.
 *
 * Solo lee los encabezados (quién y cuándo), nunca el contenido. Permiso de Gmail: solo lectura.
 * Prueba sin cambiar nada: /api/centinela/conciliar-fuentes?probar=1
 */

export const maxDuration = 300

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const MAX_INBOX = 800
const MAX_SPAM = 300
const NO_TOCAR = ['descartada', 'no_aplica']
const PLATAFORMAS = new Set([
  'mailchimp', 'sendgrid', 'substack', 'mailerlite', 'constantcontact', 'hubspot', 'hubspotemail', 'gmail', 'googlemail', 'outlook', 'hotmail', 'yahoo',
  'list-manage', 'mcsv', 'rsgsv', 'amazonses', 'sparkpostmail', 'beehiiv', 'convertkit', 'mailgun', 'brevo', 'sendinblue', 'wordpress', 'medium',
  'google', 'linkedin', 'facebook', 'twitter', 'klaviyo', 'campaign-archive', 'cmail19', 'cmail20', 'createsend', 'mailjet', 'zoho', 'eventbrite',
  'mlsend', 'emailsys', 'e-mail', 'email', 'mail', 'newsletter', 'ccsend', 'icpbounce', 'sailthru', 'marketo', 'mktomail', 'salesforce', 'exacttarget', 'pardot',
])

type Fuente = {
  id: string
  nombre: string
  nivel: number
  estado: string
  url: string | null
  url_newsletter: string | null
  correo_remitente: string | null
  primer_correo_en: string | null
}
type Remitente = { correo: string; nombres: Set<string>; total: number; primero: number; ultimo: number }

const sinTildes = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const limpio = (t: string) => sinTildes(t).replace(/[^a-z0-9ñ ]+/g, ' ').replace(/\s+/g, ' ').trim()

function raizDeDominio(texto: string | null | undefined): string | null {
  if (!texto) return null
  let host = texto.trim().toLowerCase()
  if (host.includes('@')) host = host.split('@').pop() || ''
  host = host.replace(/^https?:\/\//, '').split(/[/?#]/)[0].replace(/^www\./, '')
  const partes = host.split('.').filter(Boolean)
  if (partes.length < 2) return null
  let i = partes.length - 2
  if (partes.length >= 3 && partes[partes.length - 1].length === 2 && ['co', 'com', 'org', 'gov', 'ac', 'edu', 'net'].includes(partes[partes.length - 2])) i = partes.length - 3
  const raiz = partes[i]
  return PLATAFORMAS.has(raiz) ? null : raiz
}

function leerRemitente(valor: string): { correo: string; nombre: string } {
  const m = valor.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/)
  if (m) return { nombre: m[1].trim(), correo: m[2].trim().toLowerCase() }
  return { nombre: '', correo: valor.trim().toLowerCase() }
}

async function listarRemitentes(token: string, consulta: string, tope: number): Promise<{ mapa: Map<string, Remitente>; mensajes: number }> {
  const ids: string[] = []
  let pagina: string | undefined
  while (ids.length < tope) {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(consulta)}&maxResults=500${pagina ? `&pageToken=${pagina}` : ''}`
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!r.ok) throw new Error(`No se pudo listar los correos de Gmail: ${await r.text()}`)
    const j = (await r.json()) as { messages?: { id: string }[]; nextPageToken?: string }
    ids.push(...(j.messages || []).map((m) => m.id))
    if (!j.nextPageToken) break
    pagina = j.nextPageToken
  }
  const mapa = new Map<string, Remitente>()
  const lista = ids.slice(0, tope)
  for (let i = 0; i < lista.length; i += 10) {
    await Promise.all(
      lista.slice(i, i + 10).map(async (id) => {
        try {
          const r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Date`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (!r.ok) return
          const m = (await r.json()) as { payload?: { headers?: { name: string; value: string }[] }; internalDate?: string }
          const de = m.payload?.headers?.find((h) => h.name.toLowerCase() === 'from')?.value || ''
          if (!de) return
          const { correo, nombre } = leerRemitente(de)
          if (!correo.includes('@')) return
          const fecha = Number(m.internalDate) || new Date().getTime()
          const actual = mapa.get(correo) || { correo, nombres: new Set<string>(), total: 0, primero: fecha, ultimo: fecha }
          if (nombre) actual.nombres.add(nombre)
          actual.total++
          actual.primero = Math.min(actual.primero, fecha)
          actual.ultimo = Math.max(actual.ultimo, fecha)
          mapa.set(correo, actual)
        } catch {
          /* un correo que no se deja leer no detiene al resto */
        }
      }),
    )
  }
  return { mapa, mensajes: lista.length }
}

function buscarFuente(r: Remitente, fuentes: Fuente[]): Fuente | null {
  // 1. Correo exacto.
  const exacta = fuentes.find((f) => f.correo_remitente && f.correo_remitente.trim().toLowerCase() === r.correo)
  if (exacta) return exacta
  const nombresLimpios = [...r.nombres].map(limpio).filter(Boolean)
  const textoNombre = ` ${nombresLimpios.join(' ')} ${limpio(r.correo.split('@')[0])} `
  // 2. Mismo sitio web.
  const raiz = raizDeDominio(r.correo)
  if (raiz) {
    const mismas = fuentes.filter((f) => [f.url, f.url_newsletter, f.correo_remitente].some((u) => raizDeDominio(u) === raiz))
    if (mismas.length === 1) return mismas[0]
    if (mismas.length > 1) {
      return mismas.sort((a, b) => Number(textoNombre.includes(` ${limpio(b.nombre)} `)) - Number(textoNombre.includes(` ${limpio(a.nombre)} `)))[0]
    }
  }
  // 3. El nombre de la fuente aparece como palabra completa en el nombre del remitente.
  const porNombre = fuentes
    .filter((f) => limpio(f.nombre).length >= 3 && textoNombre.includes(` ${limpio(f.nombre)} `))
    .sort((a, b) => limpio(b.nombre).length - limpio(a.nombre).length)
  return porNombre[0] || null
}

export async function GET(req: NextRequest) {
  try {
    if (!(await motorAutorizado(req, null))) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const soloProbar = req.nextUrl.searchParams.get('probar') === '1'

    const { data: filas, error } = await supabase.from('centinela_fuentes').select('id, nombre, nivel, estado, url, url_newsletter, correo_remitente, primer_correo_en')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const fuentes = (filas || []) as Fuente[]

    const token = await obtenerTokenAcceso()
    const base = '-from:me -category:social -from:vercel.com -from:github.com -from:supabase.com -from:supabase.io -from:accounts.google.com -from:googlealerts-noreply@google.com'
    const inbox = await listarRemitentes(token, `in:inbox newer_than:60d ${base}`, MAX_INBOX)
    const spam = await listarRemitentes(token, `in:spam newer_than:60d`, MAX_SPAM)

    // ---- cruce ----
    const encontrada = new Map<string, { fuente: Fuente; primero: number; correo: string; total: number }>() // por id de fuente
    const sinFuente: Remitente[] = []
    const asignar = (r: Remitente, f: Fuente) => {
      const previo = encontrada.get(f.id)
      encontrada.set(f.id, { fuente: f, primero: Math.min(previo?.primero ?? r.primero, r.primero), correo: previo?.correo ?? r.correo, total: (previo?.total || 0) + r.total })
    }
    for (const r of inbox.mapa.values()) {
      const f = buscarFuente(r, fuentes)
      if (f) asignar(r, f)
      else sinFuente.push(r)
    }

    // ---- lo que no cuadró: una sola llamada a Gemini ----
    let porIA = 0
    const dudosos = sinFuente.sort((a, b) => b.total - a.total).slice(0, 150)
    if (dudosos.length > 0 && !soloProbar) {
      try {
        const nombres = fuentes.map((f) => f.nombre)
        const prompt = `Tienes una lista de remitentes de boletines de correo y una lista de FUENTES de convocatorias de financiación. Para cada remitente, di a cuál fuente de la lista corresponde (la misma organización que lo envía), o null si no corresponde claramente a ninguna. No adivines: ante la duda, null.

FUENTES:
${nombres.join('\n')}

REMITENTES (formato: correo | nombre que muestra):
${dudosos.map((r) => `${r.correo} | ${[...r.nombres].slice(0, 2).join(' / ')}`).join('\n')}

Responde ÚNICAMENTE con un JSON válido: [ { "correo": "...", "fuente": "nombre EXACTO de la lista o null" } ]`
        const bruto = await callGemini(prompt)
        const json = bruto.match(/\[[\s\S]*\]/)?.[0]
        const respuesta = json ? (JSON.parse(json) as { correo?: string; fuente?: string | null }[]) : []
        for (const x of respuesta) {
          if (!x.correo || !x.fuente) continue
          const r = dudosos.find((d) => d.correo === String(x.correo).toLowerCase())
          const f = fuentes.find((u) => limpio(u.nombre) === limpio(String(x.fuente)))
          if (r && f) {
            asignar(r, f)
            sinFuente.splice(sinFuente.indexOf(r), 1)
            porIA++
          }
        }
      } catch (e) {
        console.error('[conciliar-fuentes] Gemini no pudo ayudar con los dudosos:', (e as Error).message)
      }
    }

    // ---- spam: boletines de fuentes conocidas que están cayendo ahí ----
    const enSpam: { fuente: string; correo: string; total: number }[] = []
    for (const r of spam.mapa.values()) {
      const f = buscarFuente(r, fuentes)
      if (f) enSpam.push({ fuente: f.nombre, correo: r.correo, total: r.total })
    }

    // ---- aplicar cambios ----
    const ahora = new Date().toISOString()
    const nuevasConfirmadas: string[] = []
    let yaEstaban = 0
    for (const { fuente, primero, correo } of encontrada.values()) {
      if (NO_TOCAR.includes(fuente.estado)) continue
      if (fuente.estado === 'confirmado') {
        yaEstaban++
        continue
      }
      nuevasConfirmadas.push(fuente.nombre)
      if (soloProbar) continue
      await supabase
        .from('centinela_fuentes')
        .update({
          estado: 'confirmado',
          ultima_revision: ahora,
          actualizado_en: ahora,
          primer_correo_en: fuente.primer_correo_en || new Date(primero).toISOString(),
          correo_remitente: fuente.correo_remitente || correo,
        })
        .eq('id', fuente.id)
    }

    const sinLlegar = fuentes.filter((f) => f.nivel === 1 && ['pendiente', 'suscrito'].includes(f.estado) && !encontrada.has(f.id))
    const informe = {
      actualizado: ahora,
      correos_revisados: inbox.mensajes,
      remitentes_distintos: inbox.mapa.size,
      fuentes_confirmadas_ahora: nuevasConfirmadas.length,
      fuentes_ya_confirmadas: yaEstaban,
      cruzadas_con_ia: porIA,
      en_spam: enSpam.sort((a, b) => b.total - a.total).slice(0, 40),
      sin_fuente: sinFuente.sort((a, b) => b.total - a.total).slice(0, 40).map((r) => ({ correo: r.correo, nombre: [...r.nombres][0] || '', total: r.total })),
      sin_llegar: sinLlegar.length,
      sin_llegar_nombres: sinLlegar.slice(0, 60).map((f) => `${f.nombre}${f.estado === 'suscrito' ? ' (ya la marcaron suscrita)' : ''}`),
    }
    if (!soloProbar) {
      const { error: errorInforme } = await supabase.from('resumen_equipo').upsert({ id: 'centinela', actualizado: ahora, datos: informe })
      if (errorInforme) console.error('[conciliar-fuentes] No se pudo guardar el informe:', errorInforme.message)
    }

    return NextResponse.json({ ok: true, modo: soloProbar ? 'prueba (no se cambió nada)' : 'aplicado', ...informe, nuevas_confirmadas: nuevasConfirmadas })
  } catch (e) {
    console.error('[conciliar-fuentes]', e)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
