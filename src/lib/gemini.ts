/**
 * Modelos de Gemini que sabe usar la plataforma, en orden de preferencia.
 *
 * Todos son modelos estables. El primero es el que queremos; los siguientes
 * son el paracaidas. Google limita el uso por modelo, asi que cuando uno se
 * agota o se congestiona, los demas siguen disponibles. Antes, agotarse un
 * modelo dejaba la plataforma entera parada.
 */
export const MODELOS_GEMINI = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-2.5-flash",
];

/** Cuanto se le concede a un modelo antes de darlo por perdido. */
const TOPE_POR_MODELO_MS = 80000;

export async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined');
  }

  let ultimoError: Error | null = null

  for (const modelo of MODELOS_GEMINI) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
          signal: AbortSignal.timeout(TOPE_POR_MODELO_MS),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const mensaje = error.error?.message || response.statusText;
        // 503 = modelo saturado, 429 = cuota agotada. Los dos se resuelven
        // probando otro modelo, que tiene su propio cupo.
        const esTemporal = response.status === 503 || response.status === 429;
        if (esTemporal) {
          ultimoError = new Error(`Gemini API error (${modelo}): ${mensaje}`);
          continue;
        }
        // Cualquier otro error se repetiria igual con otro modelo.
        throw new Error(`Gemini API error: ${mensaje}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (err: any) {
      ultimoError = err
      continue;
    }
  }

  throw ultimoError || new Error('Gemini API error: no se pudo completar la solicitud')
}
