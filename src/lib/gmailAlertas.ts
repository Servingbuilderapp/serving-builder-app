/**
 * Lector de Alertas de Google desde Gmail.
 *
 * Lee la bandeja de servingbuilderapp@gmail.com usando la API oficial de
 * Gmail. No usa la contraseña de la cuenta: usa un permiso que se autoriza
 * una sola vez (OAuth) y que después se renueva solo, cada vez que hace
 * falta, sin volver a pedir nada a nadie.
 *
 * Variables de entorno que hay que crear en Vercel para que esto funcione:
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   GOOGLE_REFRESH_TOKEN
 *
 * Las tres salen del mismo trámite de autorización (una sola vez, con la
 * cuenta servingbuilderapp@gmail.com). Sin ellas, este archivo no puede
 * hacer nada — y lo dice con un error claro, no en silencio.
 */

const REMITENTE_ALERTAS = 'googlealerts-noreply@google.com'

type CabeceraGmail = { name: string; value: string }

type ParteGmail = {
  mimeType?: string
  body?: { data?: string }
  parts?: ParteGmail[]
}

/** Cambia el permiso ya autorizado por un pase de entrada válido por una hora. */
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

export type CorreoAlerta = {
  idMensaje: string
  asunto: string
  fecha: string
  enlaces: string[]
}

/**
 * Trae los correos de Alertas de Google de la bandeja, del más nuevo al más
 * viejo. No filtra por leído/no leído a propósito: lo que decide si un
 * correo ya se tuvo en cuenta es la tabla `centinela_correos_procesados`,
 * no la bandeja de Gmail (así no importa si alguien del equipo abrió el
 * correo por curiosidad).
 */
export async function listarCorreosDeAlertas(maxCorreos = 50): Promise<CorreoAlerta[]> {
  const token = await obtenerTokenAcceso()

  const consulta = encodeURIComponent(`from:${REMITENTE_ALERTAS}`)
  const listado = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${consulta}&maxResults=${maxCorreos}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )

  if (!listado.ok) {
    throw new Error(`No se pudo listar los correos de Gmail: ${await listado.text()}`)
  }

  const listadoJson = await listado.json()
  const referencias: { id: string }[] = listadoJson.messages || []
  if (referencias.length === 0) return []

  const correos: CorreoAlerta[] = []

  for (const referencia of referencias) {
    const detalle = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${referencia.id}?format=full`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    if (!detalle.ok) {
      console.error(`[Centinela Gmail] No se pudo leer el correo ${referencia.id}:`, await detalle.text())
      continue
    }

    const mensaje = await detalle.json()
    const cabeceras: CabeceraGmail[] = mensaje.payload?.headers || []
    const asunto = cabeceras.find((c) => c.name === 'Subject')?.value || '(sin asunto)'
    const fecha = cabeceras.find((c) => c.name === 'Date')?.value || ''

    const html = extraerHtml(mensaje.payload)
    const enlaces = extraerEnlacesReales(html)

    correos.push({ idMensaje: mensaje.id, asunto, fecha, enlaces })
  }

  return correos
}

/** Gmail manda el correo partido en piezas (texto plano, html, adjuntos...); esto busca el html. */
function extraerHtml(payload: ParteGmail | undefined): string {
  if (!payload) return ''

  if (payload.mimeType === 'text/html' && payload.body?.data) {
    return decodificarBase64Url(payload.body.data)
  }

  for (const parte of payload.parts || []) {
    const html = extraerHtml(parte)
    if (html) return html
  }

  // Si el correo no trae versión en html, se usa el texto plano de respaldo.
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return decodificarBase64Url(payload.body.data)
  }

  return ''
}

function decodificarBase64Url(data: string): string {
  const normal = data.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(normal, 'base64').toString('utf-8')
}

/**
 * Google Alerts nunca manda el enlace real directo: lo envuelve en una
 * redirección propia (www.google.com/url?q=...) para contar los clics. Aquí
 * se desenvuelve para quedarse con la dirección final, que es la que le
 * sirve a Gemini para analizar la convocatoria.
 */
function extraerEnlacesReales(html: string): string[] {
  const enlaces = new Set<string>()
  const patronRedireccion = /https?:\/\/www\.google\.com\/url\?q=([^&"'<>]+)/g
  let coincidencia: RegExpExecArray | null

  while ((coincidencia = patronRedireccion.exec(html)) !== null) {
    try {
      enlaces.add(decodeURIComponent(coincidencia[1]))
    } catch {
      enlaces.add(coincidencia[1])
    }
  }

  // Respaldo, por si algún día el formato del correo cambia y ya no envuelve
  // los enlaces: se toman los enlaces sueltos que no sean del propio Google.
  if (enlaces.size === 0) {
    const patronDirecto = /href="(https?:\/\/[^"]+)"/g
    while ((coincidencia = patronDirecto.exec(html)) !== null) {
      const url = coincidencia[1]
      if (!/google\.com|gstatic\.com|googleusercontent\.com/.test(url)) {
        enlaces.add(url)
      }
    }
  }

  return [...enlaces]
}
