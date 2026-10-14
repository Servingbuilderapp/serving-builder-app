/**
 * Lector de BOLETINES desde Gmail.
 *
 * Hermano de gmailAlertas.ts. Aquel lee las Alertas de Google (un correo = una
 * lista de enlaces). Este lee los boletines a los que está suscrita la
 * bandeja de servingbuilderapp@gmail.com (un correo = un boletín que puede
 * hablar de varias convocatorias).
 *
 * Usa las mismas tres variables de Vercel que ya existen:
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
 *
 * Solo lectura: el permiso es gmail.readonly, así que nada de esto puede
 * enviar, borrar ni mover correos.
 */

const REMITENTE_ALERTAS = 'googlealerts-noreply@google.com'

type CabeceraGmail = { name: string; value: string }

type ParteGmail = {
  mimeType?: string
  body?: { data?: string }
  parts?: ParteGmail[]
}

async function obtenerTokenAcceso(): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Falta configurar GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET o GOOGLE_REFRESH_TOKEN en el servidor',
    )
  }

  const respuesta = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!respuesta.ok) {
    const detalle = await respuesta.text()
    throw new Error(`No se pudo renovar el permiso de Gmail: ${detalle}`)
  }

  const datos = await respuesta.json()
  return datos.access_token as string
}

export type CorreoBoletin = {
  idMensaje: string
  asunto: string
  remitente: string
  fecha: string
  /** Texto del boletín ya limpio, con cada enlace escrito como "texto (url)". */
  texto: string
  enlaces: number
}

/** Gmail manda el correo partido en piezas; esto busca la versión en html. */
function extraerHtml(payload: ParteGmail | undefined): string {
  if (!payload) return ''

  if (payload.mimeType === 'text/html' && payload.body?.data) {
    return decodificarBase64Url(payload.body.data)
  }

  for (const parte of payload.parts || []) {
    const html = extraerHtml(parte)
    if (html) return html
  }

  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return decodificarBase64Url(payload.body.data)
  }

  return ''
}

function decodificarBase64Url(data: string): string {
  const normal = data.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(normal, 'base64').toString('utf-8')
}

const ENLACES_DE_RUIDO =
  /unsubscribe|darse de baja|cancelar suscri|preferences|manage|facebook\.com|twitter\.com|x\.com|instagram\.com|linkedin\.com|youtube\.com|\.(png|jpg|jpeg|gif|svg)(\?|$)/i

/**
 * Convierte el html del boletín en texto corto y legible para Gemini:
 * quita estilos y scripts, deja cada enlace como "texto (url)" y descarta
 * los enlaces de ruido (darse de baja, redes sociales, imágenes).
 */
function htmlATexto(html: string): { texto: string; enlaces: number } {
  let enlaces = 0

  let t = html
    .replace(/<(script|style|head)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_m, url: string, interior: string) => {
      const texto = interior.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      if (!/^https?:\/\//i.test(url) || ENLACES_DE_RUIDO.test(url) || ENLACES_DE_RUIDO.test(texto)) {
        return ` ${texto} `
      }
      enlaces++
      return ` ${texto} (${url}) `
    })
    .replace(/<br\s*\/?>|<\/(p|div|tr|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')

  t = t
    .split('\n')
    .map((linea) => linea.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')

  return { texto: t, enlaces }
}

/**
 * Trae los boletines recientes de la bandeja (todo lo que NO sea una Alerta
 * de Google ni un correo propio), del más nuevo al más viejo.
 *
 * `idsYaProcesados` permite saltarse los que ya se leyeron SIN descargar su
 * contenido: así cada corrida solo gasta tiempo en lo nuevo.
 */
export async function listarBoletines(
  yaProcesados: (ids: string[]) => Promise<Set<string>>,
  maxNuevos = 12,
  saltar = 0,
): Promise<{ revisados: number; nuevos: CorreoBoletin[]; pendientes: number }> {
  const token = await obtenerTokenAcceso()

  const consulta = encodeURIComponent(
    `in:inbox newer_than:30d -from:${REMITENTE_ALERTAS} -from:me -from:vercel.com -from:github.com -from:supabase.com -from:supabase.io -from:accounts.google.com -from:no-reply@accounts.google.com -from:mail-noreply@google.com -category:social`,
  )
  const listado = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${consulta}&maxResults=200`,
    { headers: { Authorization: `Bearer ${token}` } },
  )

  if (!listado.ok) {
    throw new Error(`No se pudo listar los correos de Gmail: ${await listado.text()}`)
  }

  const listadoJson = await listado.json()
  const ids: string[] = (listadoJson.messages || []).map((m: { id: string }) => m.id)
  if (ids.length === 0) return { revisados: 0, nuevos: [], pendientes: 0 }

  const vistos = await yaProcesados(ids)
  const porLeer = ids.filter((id) => !vistos.has(id))
  const loteActual = porLeer.slice(saltar, saltar + maxNuevos)

  const nuevos: CorreoBoletin[] = []
  for (const id of loteActual) {
    const detalle = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    if (!detalle.ok) {
      console.error(`[Centinela Boletines] No se pudo leer el correo ${id}:`, await detalle.text())
      continue
    }

    const mensaje = await detalle.json()
    const cabeceras: CabeceraGmail[] = mensaje.payload?.headers || []
    const asunto = cabeceras.find((c) => c.name === 'Subject')?.value || '(sin asunto)'
    const remitente = cabeceras.find((c) => c.name === 'From')?.value || ''
    const fecha = cabeceras.find((c) => c.name === 'Date')?.value || ''

    const { texto, enlaces } = htmlATexto(extraerHtml(mensaje.payload))
    nuevos.push({ idMensaje: mensaje.id, asunto, remitente, fecha, texto, enlaces })
  }

  return { revisados: ids.length, nuevos, pendientes: Math.max(0, porLeer.length - saltar - loteActual.length) }
}
