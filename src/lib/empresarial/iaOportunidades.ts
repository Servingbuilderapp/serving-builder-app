/**
 * IA (Gemini) para Oportunidades (Camino A, paso 4, parte 6).
 * Dos ayudas: (1) ideas nuevas de oportunidades y (2) completar la ficha de una oportunidad.
 *
 * Reglas fijas:
 * - La IA solo usa lo que la persona ya contó. No inventa cifras, mercados, empresas, normas ni fuentes.
 * - Lo que sugiere es una HIPÓTESIS por comprobar. Nunca cuenta como evidencia.
 * - Nada se guarda en la ficha sin que la persona lo acepte.
 */

/** Cuántas veces por día se puede pedir ayuda a la IA en un mismo proyecto (cuida el consumo). */
export const LIMITE_DIARIO_IA = 10

export const REGLAS_SIN_INVENTAR = `REGLAS OBLIGATORIAS:
- Usa ÚNICAMENTE los datos que te entrego. No inventes cifras, porcentajes, tamaños de mercado, precios, nombres de empresas, personas, normas, leyes ni estudios.
- No cites fuentes ni enlaces. Si algo requiere una fuente, di que hay que comprobarlo.
- Todo lo que propones es una hipótesis por comprobar, no un hecho.
- Escribe en español sencillo, frases cortas, sin jerga técnica.
- Si un dato no se puede deducir de lo entregado, devuelve null en vez de inventarlo.`

export interface ContextoIA {
  perfil: string | null
  pais: string | null
  hallazgos: { tipo: string; descripcion: string; gravedad: string | null }[]
  descubrimiento: { tipo: string; titulo: string; detalle: string | null; nivel: number | null }[]
  problemas: { titulo: string; descripcion: string | null; afectados: string | null; nivel_certeza: string | null }[]
  oportunidades: { nombre: string }[]
}

export interface FichaParaIA {
  nombre: string
  descripcion: string | null
  cliente_o_beneficiario: string | null
  solucion_propuesta: string | null
  valor_generado: string | null
  sector: string | null
  ubicacion: string | null
}

export const CAMPOS_FICHA_IA = ['cliente_o_beneficiario', 'solucion_propuesta', 'valor_generado', 'sector', 'ubicacion'] as const
export type CampoFichaIA = (typeof CAMPOS_FICHA_IA)[number]

export type SugerenciaFichaIA = Partial<Record<CampoFichaIA, string>>

export interface IdeaIA {
  id: string
  titulo: string
  descripcion: string
}

const linea = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim()

function textoContexto(c: ContextoIA): string {
  const partes: string[] = []
  partes.push(`Perfil del proyecto: ${c.perfil ?? 'sin definir'}. País: ${c.pais ?? 'sin definir'}.`)
  if (c.hallazgos.length)
    partes.push(
      'HALLAZGOS DEL DIAGNÓSTICO:\n' +
        c.hallazgos
          .slice(0, 25)
          .map((h) => `- (${h.tipo}${h.gravedad ? ', ' + h.gravedad : ''}) ${linea(h.descripcion).slice(0, 300)}`)
          .join('\n'),
    )
  if (c.descubrimiento.length)
    partes.push(
      'LO QUE LA PERSONA CONTÓ DE SÍ MISMA:\n' +
        c.descubrimiento
          .slice(0, 40)
          .map((d) => `- ${d.tipo}${d.nivel ? ` (nivel ${d.nivel})` : ''}: ${linea(d.titulo).slice(0, 150)}${d.detalle ? ' — ' + linea(d.detalle).slice(0, 200) : ''}`)
          .join('\n'),
    )
  if (c.problemas.length)
    partes.push(
      'PROBLEMAS QUE LA PERSONA REGISTRÓ:\n' +
        c.problemas
          .slice(0, 15)
          .map((p) => `- ${linea(p.titulo).slice(0, 150)}${p.afectados ? ' (afecta a: ' + linea(p.afectados).slice(0, 100) + ')' : ''}${p.nivel_certeza ? ' [' + p.nivel_certeza + ']' : ''}`)
          .join('\n'),
    )
  if (c.oportunidades.length)
    partes.push('OPORTUNIDADES QUE YA TIENE (no las repitas):\n' + c.oportunidades.slice(0, 30).map((o) => `- ${linea(o.nombre)}`).join('\n'))
  return partes.join('\n\n')
}

export function armarPromptIdeas(c: ContextoIA): string {
  return `Eres un asistente de Arquitectura Digital de Proyectos. Ayudas a una persona a ver posibles oportunidades de proyecto a partir de lo que ella misma contó.

${REGLAS_SIN_INVENTAR}

Propón entre 3 y 4 ideas de oportunidades NUEVAS, distintas entre sí y distintas de las que ya tiene. Cada idea debe apoyarse en algo concreto de los datos (un hallazgo, un conocimiento, un interés, un problema o un recurso) y decir en qué se apoya.

DATOS:
${textoContexto(c)}

Responde ÚNICAMENTE con un JSON válido, sin texto antes ni después:
{ "ideas": [ { "titulo": "nombre corto de la oportunidad (máx. 12 palabras)", "descripcion": "qué situación aprovecha y para quién (máx. 50 palabras)", "se_apoya_en": "qué dato de los entregados la respalda", "como_comprobar": "un primer paso barato para comprobarla" } ] }`
}

export function armarPromptFicha(c: ContextoIA, f: FichaParaIA, vacios: CampoFichaIA[]): string {
  return `Eres un asistente de Arquitectura Digital de Proyectos. Ayudas a completar la ficha de una oportunidad, sin inventar nada.

${REGLAS_SIN_INVENTAR}

Completa SOLO los campos que se piden. Cada uno en máximo 40 palabras. Si lo entregado no alcanza para proponerlo, pon null.

OPORTUNIDAD:
Nombre: ${linea(f.nombre)}
Descripción: ${linea(f.descripcion) || '(vacía)'}
Para quién genera valor: ${linea(f.cliente_o_beneficiario) || '(vacío)'}
Solución propuesta: ${linea(f.solucion_propuesta) || '(vacía)'}
Beneficio: ${linea(f.valor_generado) || '(vacío)'}
Sector: ${linea(f.sector) || '(vacío)'}
Dónde: ${linea(f.ubicacion) || '(vacío)'}

CAMPOS QUE SE PIDEN: ${vacios.join(', ')}

OTROS DATOS DEL PROYECTO:
${textoContexto(c)}

Responde ÚNICAMENTE con un JSON válido, sin texto antes ni después, con exactamente esas claves:
{ ${vacios.map((v) => `"${v}": "texto o null"`).join(', ')} }`
}

/** Quita enlaces y recorta: la IA nunca debe dejar pasar fuentes inventadas. */
export function limpiarTextoIA(valor: unknown, maximo: number): string {
  if (typeof valor !== 'string') return ''
  return valor
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/www\.\S+/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maximo)
}

/**
 * ¿El texto trae un porcentaje o un monto de dinero que NO está en los datos de la persona?
 * Si es así, la IA lo inventó y se descarta. (Otras cifras, como "10 entrevistas", sí se permiten.)
 */
export function traeCifraInventada(texto: string, datosBase: string): boolean {
  const sinEspacios = (s: string) => s.replace(/\s+/g, '')
  const base = sinEspacios(datosBase)
  const cifras = texto.match(/\$\s?\d[\d.,]*|\d[\d.,]*\s?%/g) ?? []
  return cifras.some((c) => !base.includes(sinEspacios(c)))
}

/** Los datos que se le entregaron a la IA, como un solo texto, para comparar contra lo que respondió. */
export function datosBaseIA(c: ContextoIA, f?: FichaParaIA): string {
  return textoContexto(c) + (f ? ` ${Object.values(f).join(' ')}` : '')
}

export function leerJSON(texto: string): unknown {
  try {
    return JSON.parse(texto.replace(/```json\n?|\n?```/g, '').trim())
  } catch {
    return null
  }
}

export interface IdeaCruda {
  titulo: string
  descripcion: string
}

/** Convierte la respuesta de la IA en ideas limpias. Junta el porqué y el primer paso en la descripción. */
export function interpretarIdeas(respuesta: unknown, nombresExistentes: string[], datosBase = ''): IdeaCruda[] {
  const lista = (respuesta as { ideas?: unknown } | null)?.ideas
  if (!Array.isArray(lista)) return []
  const existentes = new Set(nombresExistentes.map((n) => linea(n).toLowerCase()))
  const vistos = new Set<string>()
  const salida: IdeaCruda[] = []
  for (const x of lista.slice(0, 6)) {
    const o = x as Record<string, unknown>
    const titulo = limpiarTextoIA(o.titulo, 140)
    const descripcion = limpiarTextoIA(o.descripcion, 400)
    if (!titulo || !descripcion) continue
    if (traeCifraInventada(`${titulo} ${descripcion} ${linea(String(o.se_apoya_en ?? ''))} ${linea(String(o.como_comprobar ?? ''))}`, datosBase)) continue
    const clave = titulo.toLowerCase()
    if (existentes.has(clave) || vistos.has(clave)) continue
    vistos.add(clave)
    const apoyo = limpiarTextoIA(o.se_apoya_en, 250)
    const comprobar = limpiarTextoIA(o.como_comprobar, 250)
    const extra = [apoyo && `Se apoya en: ${apoyo}`, comprobar && `Para comprobarla: ${comprobar}`].filter(Boolean).join('\n')
    salida.push({ titulo, descripcion: extra ? `${descripcion}\n\n${extra}` : descripcion })
    if (salida.length === 4) break
  }
  return salida
}

/** Solo devuelve los campos pedidos y que realmente vengan con texto. */
export function interpretarFicha(respuesta: unknown, pedidos: CampoFichaIA[], datosBase = ''): SugerenciaFichaIA {
  const salida: SugerenciaFichaIA = {}
  if (!respuesta || typeof respuesta !== 'object') return salida
  const o = respuesta as Record<string, unknown>
  for (const campo of pedidos) {
    const t = limpiarTextoIA(o[campo], 400)
    if (t && t.toLowerCase() !== 'null' && !traeCifraInventada(t, datosBase)) salida[campo] = t
  }
  return salida
}
