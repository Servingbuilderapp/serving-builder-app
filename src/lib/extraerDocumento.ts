/**
 * Saca el texto de un documento (PDF, Word o texto plano). Lo usan la carga manual de términos de
 * referencia y la descarga automática del Centinela.
 */

export type Extraccion = { texto: string; paginas: number | null; error: string | null }

/**
 * Saca el texto del documento. Reconoce PDF, Word y texto plano.
 *
 * OJO con los PDF escaneados: son una foto de la hoja, no traen texto. Cuando
 * pasa eso el resultado sale casi vacío y hay que decirlo, porque un texto de
 * treinta caracteres haría que el motor de encaje "lea" un pliego en blanco y
 * conteste cualquier cosa con toda seguridad.
 */
export async function extraerTexto(bytes: Buffer, nombre: string): Promise<Extraccion> {
  const minuscula = (nombre || '').toLowerCase()

  try {
    if (minuscula.endsWith('.pdf')) {
      const modulo = await import('pdf-parse')
      const pdfParse = (modulo as unknown as { default: (b: Buffer) => Promise<{ text: string; numpages?: number }> }).default
        || (modulo as unknown as (b: Buffer) => Promise<{ text: string; numpages?: number }>)
      const salida = await pdfParse(bytes)
      const texto = (salida?.text || '').trim()
      const paginas = salida?.numpages ?? null

      if (texto.length < 200) {
        return {
          texto,
          paginas,
          error:
            'El PDF casi no trae texto. Lo más probable es que sea escaneado (una foto de la hoja). ' +
            'Hay que pasarle un reconocimiento de texto o pegar el contenido a mano.',
        }
      }
      return { texto, paginas, error: null }
    }

    if (minuscula.endsWith('.docx')) {
      const mammoth = await import('mammoth')
      const salida = await mammoth.extractRawText({ buffer: bytes })
      return { texto: (salida?.value || '').trim(), paginas: null, error: null }
    }

    if (minuscula.endsWith('.txt') || minuscula.endsWith('.md')) {
      return { texto: bytes.toString('utf-8').trim(), paginas: null, error: null }
    }

    return {
      texto: '',
      paginas: null,
      error: `No sé leer archivos "${minuscula.split('.').pop()}". Sirven PDF, DOCX y TXT.`,
    }
  } catch (e) {
    return {
      texto: '',
      paginas: null,
      error: `No se pudo leer el documento: ${(e as Error).message}`,
    }
  }
}
