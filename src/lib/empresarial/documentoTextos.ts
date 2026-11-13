/**
 * Textos del Documento final (Camino A).
 * Dos partes por tema:
 *  1) Plantilla fija: "qué es este tema y por qué importa". Gratis, siempre igual.
 *  2) "Qué significa en tu proyecto": la escribe la IA con lo que la persona llenó, se guarda y no cambia sola.
 */
import { REGLAS_SIN_INVENTAR } from '@/lib/empresarial/iaOportunidades'

export type SeccionDocumento = 'proyecto' | 'mercado' | 'demanda' | 'competencia' | 'ikigai' | 'dofa' | 'tecnico' | 'financiero'

export const SECCIONES_CON_IA: SeccionDocumento[] = ['proyecto', 'mercado', 'demanda', 'competencia', 'ikigai', 'dofa', 'tecnico', 'financiero']

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
  demanda: {
    que: 'Esta parte calcula cuánta gente o cuántas empresas podrían comprar. Se mide en tres círculos: el mercado total (TAM), la parte que el proyecto puede atender (SAM) y la parte que de verdad podría captar al comienzo (SOM).',
    porque:
      'Sirve para saber si el negocio tiene tamaño suficiente y para no ilusionarse con cifras enormes. Lo que importa para planear ventas es el círculo pequeño (SOM), y cada número debe decir si es verificado, estimado o un supuesto por comprobar.',
  },
  competencia: {
    que: 'Esta parte muestra a quién más le compra el cliente hoy, a qué precio lo hace y por qué canales se le puede llegar. También deja escrito el precio que propone el proyecto y cómo se llegó a él.',
    porque:
      'El cliente siempre compara. Conocer a los competidores, sus fortalezas y sus debilidades ayuda a decidir en qué ser distinto, y un precio con su razón es más creíble que uno puesto al azar. Los canales dicen cuánto costaría conseguir cada cliente.',
  },
  ikigai: {
    que: 'El Ikigai cruza cuatro preguntas sobre cada idea del proyecto: si les gusta a quienes lo hacen, si lo saben hacer bien, si el mundo lo necesita y si alguien paga por ello. Las ideas que cumplen las cuatro son el centro del proyecto.',
    porque:
      'Muestra dónde el proyecto es fuerte y dónde le falta algo. Una idea que gusta y se sabe hacer pero nadie paga es un pasatiempo; una que pagan pero no se sabe hacer es un riesgo. Verlo claro ayuda a decidir qué ofrecer primero.',
  },
  dofa: {
    que: 'El DOFA ordena en cuatro cuadros lo propio del proyecto (Debilidades y Fortalezas) y lo de afuera (Amenazas y Oportunidades). Después cruza los cuadros para proponer estrategias: aprovechar lo que se tiene, corregir lo que falta y protegerse de lo que viene.',
    porque:
      'Obliga a mirar con honestidad dónde el proyecto es fuerte y dónde es vulnerable, antes de gastar dinero. Cada punto lleva un peso, así se ve cuáles pesan más. Las estrategias que salen del cruce son un buen punto de partida para el plan de trabajo.',
  },
  tecnico: {
    que: 'Esta parte describe qué se va a ofrecer, con qué características y cómo se produce o se presta, paso a paso. Dice también cuánto tiempo toma cada paso y quién lo hace.',
    porque:
      'Un proyecto se puede cumplir solo si de verdad se sabe cómo hacerlo. Poner por escrito las especificaciones y los pasos permite calcular tiempos y costos reales, y descubrir a tiempo lo que todavía no se sabe resolver.',
  },
  financiero: {
    que: 'Esta parte junta las cuentas básicas del proyecto: cuánto cuesta empezar (inversión), cuánto cuesta funcionar cada mes (costos fijos y por unidad), cuánto se vendería y cuánto quedaría de utilidad. También calcula el punto de equilibrio y en cuánto tiempo se recuperaría la inversión.',
    porque:
      'Muestra si el proyecto se sostiene con sus propias ventas. Las cuentas se hacen con las cifras que escribió la persona, así que valen lo que valgan sus fuentes: por eso cada dato dice si es verificado, estimado o un supuesto por comprobar.',
  },
}

export const TITULO_SECCION: Record<SeccionDocumento, string> = {
  proyecto: 'El proyecto',
  mercado: 'El mercado',
  demanda: 'Tamaño y demanda',
  competencia: 'Competencia, precio y canales',
  ikigai: 'Ikigai del proyecto',
  dofa: 'Análisis DOFA',
  tecnico: 'Estudio técnico',
  financiero: 'Financiero básico',
}

const GUIA: Record<SeccionDocumento, string> = {
  proyecto:
    'Explica con claridad qué problema resuelve este proyecto, a quién le sirve y qué busca lograr, y señala si algo importante quedó sin escribir (por ejemplo, objetivos que no se pueden medir o beneficiarios sin definir).',
  mercado:
    'Explica quién sería el cliente de este proyecto, qué necesita y qué lo podría frenar, y señala si algo importante quedó sin escribir (por ejemplo, segmentos sin definir o un mercado muy amplio).',
  demanda:
    'Explica qué dicen las cifras de mercado total, mercado atendible y mercado captable de ESTE proyecto, usando solo los números entregados, y señala cuáles son supuestos o estimados que faltan por comprobar. No calcules cifras nuevas.',
  competencia:
    'Explica cómo se compara el precio del proyecto con el de los competidores listados, en qué parece distinto o más débil, y qué dicen los canales sobre cómo llegar al cliente. Señala lo que falte (por ejemplo, competidores sin fuente o canales sin costo). No inventes competidores ni precios.',
  ikigai:
    'Explica qué ideas del proyecto cumplen las cuatro preguntas y cuáles solo algunas, y qué sugiere eso sobre qué ofrecer primero o qué reforzar. No inventes ideas nuevas.',
  dofa:
    'Explica qué dicen los cuatro cuadros del DOFA de ESTE proyecto: dónde está más fuerte (lo propio o lo de afuera), qué debilidades o amenazas pesan más según el peso dado, y qué estrategias de las escritas convendría atender primero. No inventes puntos ni estrategias nuevas.',
  tecnico:
    'Explica qué se va a ofrecer, cómo se produce o se presta según los pasos escritos y cuánto tarda, y señala lo que falte (por ejemplo, pasos sin responsable o duración, o especificaciones sin definir). No inventes especificaciones ni tiempos.',
  financiero:
    'Explica qué dicen las cuentas de ESTE proyecto usando solo los números entregados: cuánto cuesta empezar, si el mes cubre sus costos, el punto de equilibrio y la recuperación de la inversión. Señala cuáles cifras son supuestos o estimados por comprobar. No calcules cifras nuevas ni prometas rentabilidad.',
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
  const guia = GUIA[seccion]
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
