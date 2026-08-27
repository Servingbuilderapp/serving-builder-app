export async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined');
  }

  const MAX_INTENTOS = 4
  let ultimoError: Error | null = null

  for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
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
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const mensaje = error.error?.message || response.statusText;
        // 503 = modelo saturado, 429 = demasiadas solicitudes — ambos son temporales, vale la pena reintentar
        const esTemporal = response.status === 503 || response.status === 429;
        if (esTemporal && intento < MAX_INTENTOS) {
          ultimoError = new Error(`Gemini API error: ${mensaje}`);
          await new Promise(resolve => setTimeout(resolve, intento * 2000)); // espera progresiva: 2s, 4s, 6s
          continue;
        }
        throw new Error(`Gemini API error: ${mensaje}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (err: any) {
      ultimoError = err
      if (intento < MAX_INTENTOS) {
        await new Promise(resolve => setTimeout(resolve, intento * 2000));
        continue;
      }
    }
  }

  throw ultimoError || new Error('Gemini API error: no se pudo completar la solicitud')
}
