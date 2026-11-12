/**
 * Ikigai del proyecto (Camino A) — la persona escribe ideas o actividades y marca cuáles de
 * cuatro preguntas cumple cada una. El sistema solo cuenta y ubica en el diagrama; no inventa nada.
 *
 *   ama       ¿Lo amas hacer?
 *   bueno     ¿Eres bueno en eso?
 *   necesita  ¿El mundo (tus clientes) lo necesita?
 *   pagan     ¿Alguien pagaría por eso?
 * Una idea que cumple las cuatro cae en el centro.
 */

import type { Condicion } from '@/lib/empresarial/formulacion'

export type Pregunta = 'ama' | 'bueno' | 'necesita' | 'pagan'

export interface GuiaPregunta {
  clave: Pregunta
  bit: number
  titulo: string
  pregunta: string
  pistas: string[]
  color: string
}

/** El orden es el de los círculos alrededor del centro: cada uno toca a sus dos vecinos. */
export const PREGUNTAS: GuiaPregunta[] = [
  {
    clave: 'ama',
    bit: 1,
    titulo: 'Lo que amas',
    pregunta: '¿Lo disfrutas tanto que lo harías aunque nadie te viera?',
    pistas: ['¿Qué haces que se te pasa el tiempo sin darte cuenta?', '¿Qué parte de tu trabajo te da más energía?'],
    color: '#E3A59B',
  },
  {
    clave: 'bueno',
    bit: 2,
    titulo: 'En lo que eres bueno',
    pregunta: '¿Lo haces mejor que la mayoría, o la gente te lo reconoce?',
    pistas: ['¿Por qué te buscan otras personas?', '¿Qué has hecho que salió bien varias veces?'],
    color: '#C9A46B',
  },
  {
    clave: 'pagan',
    bit: 8,
    titulo: 'Por lo que te pagarían',
    pregunta: '¿Hay alguien que ya pague, o diga que pagaría, por esto?',
    pistas: ['¿Quién compra algo parecido hoy?', '¿Te han hecho pedidos o te han preguntado el precio?'],
    color: '#7FB6A4',
  },
  {
    clave: 'necesita',
    bit: 4,
    titulo: 'Lo que el mundo necesita',
    pregunta: '¿Resuelve un problema real de personas o empresas?',
    pistas: ['¿A quién le haría la vida más fácil?', '¿Qué problema de tu entorno nadie atiende bien?'],
    color: '#8FA8D8',
  },
]

export interface ItemIkigai {
  id: string
  texto: string
  ama: boolean
  bueno: boolean
  necesita: boolean
  pagan: boolean
  fuente: string
  condicion: Condicion
}

let contador = 0
export const nuevoIdIkigai = () => `nuevo-${Date.now().toString(36)}-i${contador++}`

export const itemIkigaiVacio = (): ItemIkigai => ({
  id: nuevoIdIkigai(),
  texto: '',
  ama: false,
  bueno: false,
  necesita: false,
  pagan: false,
  fuente: '',
  condicion: 'estimado',
})

const t = (s: string) => s.trim()
const llenos = (items: ItemIkigai[]) => items.filter((i) => t(i.texto).length > 0)

/** Número de 4 bits con las preguntas que cumple la idea (1 ama, 2 bueno, 4 necesita, 8 pagan). */
export const mascara = (i: ItemIkigai) => (i.ama ? 1 : 0) | (i.bueno ? 2 : 0) | (i.necesita ? 4 : 0) | (i.pagan ? 8 : 0)

export const cumple = (i: ItemIkigai) => PREGUNTAS.filter((p) => i[p.clave])

export function conteoPorRegion(items: ItemIkigai[]): Record<number, number> {
  const out: Record<number, number> = {}
  for (const i of llenos(items)) {
    const m = mascara(i)
    if (m > 0) out[m] = (out[m] ?? 0) + 1
  }
  return out
}

/** Nombres de las zonas donde se cruzan los círculos. */
export const NOMBRE_REGION: Record<number, string> = {
  15: 'Ikigai: tu punto de encuentro',
  3: 'Pasión (lo amas y lo haces bien)',
  5: 'Misión (lo amas y el mundo lo necesita)',
  12: 'Vocación (el mundo lo necesita y pagan)',
  10: 'Profesión (lo haces bien y pagan)',
  7: 'Satisfacción sin sustento (falta que paguen)',
  11: 'Cómodo, pero con sensación de vacío (falta que el mundo lo necesite)',
  13: 'Emoción con incertidumbre (falta que lo hagas bien)',
  14: 'Útil y rentable, pero sin ilusión (falta que lo ames)',
}

export function nombreRegion(m: number): string {
  if (NOMBRE_REGION[m]) return NOMBRE_REGION[m]
  const piezas = PREGUNTAS.filter((p) => m & p.bit).map((p) => p.titulo.toLowerCase())
  return piezas.length === 1 ? `Solo cumple: ${piezas[0]}` : `Cumple: ${piezas.join(' y ')}`
}

export function faltaPara(i: ItemIkigai): string[] {
  return PREGUNTAS.filter((p) => !i[p.clave]).map((p) => p.titulo.toLowerCase())
}

export interface Lectura {
  texto: string
}

export function lectura(items: ItemIkigai[]): Lectura | null {
  const xs = llenos(items).filter((i) => mascara(i) > 0)
  if (xs.length === 0) return null
  const centro = xs.filter((i) => mascara(i) === 15).length
  if (centro > 0) return { texto: `Tienes ${centro} idea${centro === 1 ? '' : 's'} que cumple${centro === 1 ? '' : 'n'} las cuatro preguntas. Es el mejor punto de partida para tu proyecto; compruébala con clientes reales antes de invertir.` }
  const casi = xs.filter((i) => PREGUNTAS.filter((p) => i[p.clave]).length === 3)
  if (casi.length > 0) {
    const f = faltaPara(casi[0])[0]
    return { texto: `Ninguna idea cumple las cuatro, pero ${casi.length} cumple${casi.length === 1 ? '' : 'n'} tres. Revisa qué les falta (por ejemplo: ${f}) y mira si se puede resolver.` }
  }
  return { texto: 'Ninguna idea cumple todavía tres de las cuatro preguntas. Amplía la lista o cambia el enfoque de las ideas que tienes.' }
}

export type NivelAlerta = 'Informativa' | 'Preventiva' | 'Importante' | 'Crítica'
export interface Alerta {
  nivel: NivelAlerta
  texto: string
}

export function alertasIkigai(items: ItemIkigai[]): Alerta[] {
  const out: Alerta[] = []
  const xs = llenos(items)
  if (xs.length === 0) return out
  if (!xs.some((i) => mascara(i) === 15)) out.push({ nivel: 'Informativa', texto: 'Ninguna idea cae todavía en el centro. No es un fracaso: significa que aún hay que ajustar o buscar otra idea.' })
  const sinPrueba = xs.filter((i) => (i.necesita || i.pagan) && !t(i.fuente)).length
  if (sinPrueba > 0) out.push({ nivel: 'Preventiva', texto: `${sinPrueba} idea${sinPrueba === 1 ? '' : 's'} dice${sinPrueba === 1 ? '' : 'n'} que el mundo lo necesita o que pagarían, pero no dice de dónde lo sabes. Eso es lo más fácil de equivocarse: respáldalo con un cliente, un pedido o un dato.` })
  const soloGusto = xs.filter((i) => (i.ama || i.bueno) && !i.necesita && !i.pagan).length
  if (xs.length >= 3 && soloGusto === xs.length) out.push({ nivel: 'Importante', texto: 'Todas tus ideas hablan de lo que te gusta o sabes hacer, ninguna de lo que el mercado necesita o paga. Pregúntate: ¿quién lo compraría?' })
  const sinSupuesto = xs.filter((i) => i.pagan && i.condicion === 'supuesto').length
  if (sinSupuesto > 0) out.push({ nivel: 'Informativa', texto: `${sinSupuesto} idea${sinSupuesto === 1 ? '' : 's'} supone que pagarían. Mientras sea un supuesto, trátalo como una hipótesis por comprobar.` })
  return out
}

export interface Revision {
  clave: string
  texto: string
  cumple: boolean
  obligatorio: boolean
  ayuda: string
}

export function revisarIkigai(items: ItemIkigai[]): Revision[] {
  const xs = llenos(items)
  return [
    { clave: 'tres', texto: 'Escribiste al menos tres ideas.', cumple: xs.length >= 3, obligatorio: true, ayuda: 'Con una sola idea no hay con qué comparar.' },
    { clave: 'cuatro', texto: 'Cada una de las cuatro preguntas la cumple al menos una idea.', cumple: PREGUNTAS.every((p) => xs.some((i) => i[p.clave])), obligatorio: true, ayuda: 'Marca las preguntas que de verdad cumple cada idea.' },
    { clave: 'centro', texto: 'Al menos una idea cumple las cuatro preguntas.', cumple: xs.some((i) => mascara(i) === 15), obligatorio: false, ayuda: 'Es tu punto de encuentro. Si no existe, ajusta una idea.' },
    { clave: 'fuente', texto: 'Cada idea que dice “lo necesitan” o “pagarían” dice de dónde lo sabes.', cumple: xs.filter((i) => i.necesita || i.pagan).every((i) => t(i.fuente)), obligatorio: false, ayuda: 'Un cliente, un pedido, un dato.' },
  ]
}
