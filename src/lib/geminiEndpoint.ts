/**
 * Dirección a la que la plataforma le pide texto a Gemini.
 *
 * Por defecto usa Google AI Studio, con la llave GEMINI_API_KEY que ya existe
 * (se paga con el saldo de prepago de AI Studio).
 *
 * Si en Vercel existe la variable GEMINI_VERTEX_KEY, usa en su lugar Vertex AI
 * de Google Cloud. Ese camino se cobra a la cuenta de facturación normal
 * (pospago: gasta el saldo y los créditos de la cuenta, sin recargas).
 *
 * Volver al camino anterior es borrar esa variable en Vercel y redesplegar:
 * no hay que tocar código.
 */
export function urlGemini(modelo: string, apiKeyAIStudio: string): string {
  const llaveVertex = process.env.GEMINI_VERTEX_KEY
  if (llaveVertex) {
    // Las llaves atadas a una cuenta de servicio (empiezan con "AQ.") exigen la
    // direccion larga: con proyecto y ubicacion.
    const proyecto = process.env.GEMINI_VERTEX_PROJECT || 'gen-lang-client-0157169840'
    return `https://aiplatform.googleapis.com/v1/projects/${proyecto}/locations/global/publishers/google/models/${modelo}:generateContent?key=${llaveVertex}`
  }
  return `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKeyAIStudio}`
}
