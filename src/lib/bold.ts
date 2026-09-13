import crypto from 'crypto'

/**
 * BOLD — Botón de pagos.
 * =======================
 *
 * Único sitio con la lógica para cobrar automático con Bold (tarjeta, PSE,
 * Nequi, etc.) en cualquier parte de la plataforma. Hoy solo lo usa
 * Academia (`/api/academia/bold/iniciar` y `/api/webhooks/bold`); cuando se
 * conecte a membresías, estructuración o réplicas, se reutiliza este mismo
 * archivo — no hay que repetir la firma ni la verificación del webhook.
 *
 * VARIABLES DE ENTORNO (en Vercel, igual que GEMINI_API_KEY):
 *   BOLD_API_KEY     — la "llave de identidad". No es secreta: viaja en el
 *                       botón, del lado del navegador.
 *   BOLD_SECRET_KEY  — la "llave secreta". Nunca se manda al navegador. Solo
 *                       se usa aquí, en el servidor, para firmar el cobro y
 *                       para verificar que un webhook viene de verdad de Bold.
 *
 * Para probar antes de cobrar de verdad: pon ahí las llaves de PRUEBA que
 * Bold entrega en su panel. El día que todo funcione bien probando, se
 * reemplazan esas dos variables por las llaves de PRODUCCIÓN — no hay que
 * tocar ni una línea de código para hacer ese cambio.
 */

export function boldApiKey(): string {
  const key = process.env.BOLD_API_KEY
  if (!key) throw new Error('Falta configurar BOLD_API_KEY en las variables de entorno')
  return key
}

function boldSecretKey(): string {
  const key = process.env.BOLD_SECRET_KEY
  if (!key) throw new Error('Falta configurar BOLD_SECRET_KEY en las variables de entorno')
  return key
}

/**
 * Firma de integridad que exige el botón de pagos, para que nadie pueda
 * cambiar el monto a cobrar desde el navegador. Se calcula SIEMPRE en el
 * servidor, nunca en el navegador — por eso vive en un archivo que solo se
 * usa desde rutas de API.
 *
 * Fórmula exacta que exige Bold: SHA256(orderId + amount + currency + llaveSecreta)
 */
export function firmaIntegridadBold(orderId: string, amount: number, currency: 'COP' | 'USD'): string {
  const cadena = `${orderId}${amount}${currency}${boldSecretKey()}`
  return crypto.createHash('sha256').update(cadena).digest('hex')
}

export type DatosBotonBold = {
  apiKey: string
  orderId: string
  amount: number
  currency: 'COP' | 'USD'
  integritySignature: string
  description: string
  redirectionUrl: string
}

/** Arma todo lo que necesita el botón de Bold para un cobro puntual. */
export function armarBotonBold({
  orderId,
  amount,
  currency,
  description,
  redirectionUrl,
}: {
  orderId: string
  amount: number
  currency: 'COP' | 'USD'
  description: string
  redirectionUrl: string
}): DatosBotonBold {
  return {
    apiKey: boldApiKey(),
    orderId,
    amount,
    currency,
    integritySignature: firmaIntegridadBold(orderId, amount, currency),
    description,
    redirectionUrl,
  }
}

/**
 * Verifica que un webhook que llegó a /api/webhooks/bold de verdad viene de
 * Bold y no de cualquiera que le apunte a esa dirección.
 *
 * Bold firma así: toma el cuerpo crudo (el texto tal cual, sin parsear),
 * lo pasa a Base64, y calcula un HMAC-SHA256 de eso con la llave secreta.
 * El resultado debe ser IGUAL al que llega en el encabezado `x-bold-signature`.
 */
export function verificarFirmaWebhookBold(cuerpoCrudo: string, firmaRecibida: string | null): boolean {
  if (!firmaRecibida) return false
  const codificado = Buffer.from(cuerpoCrudo, 'utf-8').toString('base64')
  const calculada = crypto.createHmac('sha256', boldSecretKey()).update(codificado).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(calculada), Buffer.from(firmaRecibida))
  } catch {
    // Las cadenas tienen largos distintos — timingSafeEqual lanza error en vez
    // de devolver false. Si no miden lo mismo, ya sabemos que no coinciden.
    return false
  }
}

/**
 * Respaldo si algún webhook se pierde: le pregunta directo a Bold por el
 * estado de un pago. Usa la llave de IDENTIDAD (no la secreta).
 */
export async function consultarEstadoPagoBold(paymentId: string): Promise<{
  payment_status: 'PROCESSING' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'FAILED' | 'VOIDED' | 'NO_TRANSACTION_FOUND'
} | null> {
  try {
    const res = await fetch(`https://payments.api.bold.co/v2/payment-voucher/${paymentId}`, {
      headers: { Authorization: `x-api-key ${boldApiKey()}` },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}
