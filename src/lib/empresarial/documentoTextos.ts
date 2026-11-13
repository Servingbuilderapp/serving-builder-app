/**
 * Textos del Documento final (Camino A).
 * Dos partes por tema:
 *  1) Plantilla fija: "qué es este tema y por qué importa". Gratis, siempre igual.
 *  2) "Qué significa en tu proyecto": la escribe la IA con lo que la persona llenó, se guarda y no cambia sola.
 */
import { REGLAS_SIN_INVENTAR } from '@/lib/empresarial/iaOportunidades'

export type SeccionDocumento = 'proyecto' | 'mercado'

export const SECCIONES_CON_IA: SeccionDocumento[] = ['proyecto', 'mercado']

export const esSeccionDocumento = (x: unknown): x is SeccionDocumento => typeof x === 'string' && (SECCIONES_CON_IA as string[]).includes(x)

export const PLANTILLAS: Record<SeccionDocumento, { que: string; porque: string }> = {
  proyecto: {
    que: 'Esta parte cuenta, en pocas palabras, qué problema se quiere resolver, para quién y qué se quiere lograr. Es la base del documento: todo lo demás (mercado, costos, riesgos) se apoya en lo que aquí se dice.',
    porque:
      'Quien lee el documento, sea un socio, un banco o una entidad que financia, decide en estas primeras líneas si el proyecto es claro. Un problema bien descrito y objetivos que se puedan comprobar hacen que el resto del documento se entienda y se pueda creer.',
  },
  mercado: {
    que: 'Esta parte describe quiénes son las personas o empresas que comprarían o usarían lo que se ofrece, dónde están y qué necesitan. Es la mirada hacia afuera del proyecto.',
    porque:
      'Muchos proyectos fallan no por la idea, sino porque nadie lo había comprobado con los clientes reales. Dejar escrito quién compra, qué necesita y qué lo frena permite ver si la propuesta responde a algo que de verdad se busca.',
  },
}

export const TITULO_SECCION: Record<SeccionDocumento, string> = {
  proyecto: 'El proyecto',
  mercado: 'El mercado',
}

const linea = (x: unknown) => (x === null || x === undefined ? '' : String(x).replace(/\s+/g, ' ').trim())

/** Convierte pares "campo: valor" en texto, saltando lo vacío. */
export function textoDatos(pares: [string, unknown][]): string {
  return pares
    .map(([k, v]) => [k, Array.isArray(v) ? v.map(linea).filter(Boolean).join('; ') : linea(v)] as const)
    .filter(([, v]) => v)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n')
}

export function armarPromptDocumento(seccion: SeccionDocumento, nombre: string, datos: string): string {
  const guia =
    seccion === 'proyecto'
      ? 'Explica con claridad qué problema resuelve este proyecto, a quién le sirve y qué busca lograr, y señala si algo importante quedó sin escribir (por ejemplo, objetivos que no se pueden medir o beneficiarios sin definir).'
      : 'Explica quién sería el cliente de este proyecto, qué necesita y qué lo podría frenar, y señala si algo importante quedó sin escribir (por ejemplo, segmentos sin definir o un mercado muy amplio).'
  return `Eres quien redacta el Documento final de un proyecto llamado "${nombre}". Escribe la parte "Qué significa en tu proyecto" de la sección "${TITULO_SECCION[seccion]}".

${guia}

${REGLAS_SIN_INVENTAR}
- No prometas resultados ni uses frases como "tendrá éxito" o "garantiza".
- Formato: entre 2 y 3 párrafos cortos de texto corrido. Sin listas, sin títulos, sin negrillas. Máximo 170 palabras.
- Devuelve SOLO el texto, sin comillas ni introducción.

DATOS QUE LA PERSONA ESCRIBIÓ:
${datos}`
}

/** Limpia lo que devuelve la IA: quita comillas, marcas y recorta el largo. */
export function limpiarTextoIA(t: string): string {
  return t
    .replace(/```[a-z]*\n?/gi, '')
    .replace(/\*\*/g, '')
    .replace(/^["“]+|["”]+$/g, '')
    .trim()
    .slice(0, 1800)
}
