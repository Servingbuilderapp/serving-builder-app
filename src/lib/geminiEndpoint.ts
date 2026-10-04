import { createSign } from 'crypto'

/**
 * Como la plataforma le habla a Gemini.
 *
 * Por defecto usa Google AI Studio, con la llave GEMINI_API_KEY que ya existe
 * (se paga con el saldo de prepago de AI Studio).
 *
 * Si en Vercel existe la variable GEMINI_VERTEX_CREDENTIALS (el archivo JSON de
 * la cuenta de servicio, pegado completo), usa en su lugar Vertex AI de Google
 * Cloud. Ese camino se cobra a la cuenta de facturacion normal.
 *
 * Volver al camino anterior es borrar esa variable en Vercel y redesplegar:
 * no hay que tocar codigo.
 */

type CuentaServicio = {
  client_email: string
  private_key: string
  project_id: string
}

function leerCuentaServicio(): CuentaServicio | null {
  const crudo = process.env.GEMINI_VERTEX_CREDENTIALS
  if (!crudo) return null
  try {
    const c = JSON.parse(crudo)
    if (!c.client_email || !c.private_key || !c.project_id) {
      throw new Error('faltan campos')
    }
    return c as CuentaServicio
  } catch {
    throw new Error(
      'GEMINI_VERTEX_CREDENTIALS no es un JSON valido de cuenta de servicio. Pegue el archivo completo, o borre la variable para volver a AI Studio.',
    )
  }
}

let tokenEnMemoria: { token: string; vence: number } | null = null

async function tokenVertex(c: CuentaServicio): Promise<string> {
  const ahora = Math.floor(Date.now() / 1000)
  if (tokenEnMemoria && tokenEnMemoria.vence - 60 > ahora) return tokenEnMemoria.token

  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url')
  const cabecera = b64({ alg: 'RS256', typ: 'JWT' })
  const cuerpo = b64({
    iss: c.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: ahora,
    exp: ahora + 3600,
  })
  const firma = createSign('RSA-SHA256')
    .update(`${cabecera}.${cuerpo}`)
    .sign(c.private_key, 'base64url')

  const respuesta = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${cabecera}.${cuerpo}.${firma}`,
    }),
  })
  const data = await respuesta.json()
  if (!respuesta.ok || !data.access_token) {
    throw new Error(`No se pudo obtener permiso de Google Cloud: ${JSON.stringify(data)}`)
  }
  tokenEnMemoria = { token: data.access_token, vence: ahora + (data.expires_in || 3600) }
  return data.access_token
}

export function urlGemini(modelo: string, apiKeyAIStudio: string): string {
  const cuenta = leerCuentaServicio()
  if (cuenta) {
    return `https://aiplatform.googleapis.com/v1/projects/${cuenta.project_id}/locations/global/publishers/google/models/${modelo}:generateContent`
  }
  return `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKeyAIStudio}`
}

/** Igual que fetch, pero si la direccion es de Vertex le agrega el permiso. */
export async function fetchGemini(url: string, init: RequestInit = {}): Promise<Response> {
  const cuenta = leerCuentaServicio()
  if (cuenta && url.startsWith('https://aiplatform.googleapis.com/')) {
    const token = await tokenVertex(cuenta)
    const headers = new Headers(init.headers)
    headers.set('Authorization', `Bearer ${token}`)
    return fetch(url, { ...init, headers })
  }
  return fetch(url, init)
}
