/**
 * Tablero de Metas (Camino A) — lo escribe la persona; el sistema solo promedia, ordena y avisa.
 * Sin IA y sin datos inventados. Tres horizontes: primeros 3 meses, a 6 meses y a 12 meses.
 * Cada horizonte tiene 5 partes; cada elemento tiene texto, peso de 1 a 5, fuente y condición del dato.
 */

import type { Condicion } from '@/lib/empresarial/formulacion'
import type { NumeroGrupo } from '@/lib/empresarial/cliente'

export type ParteMeta = 'meta' | 'medida' | 'punto' | 'paso' | 'freno'

export const HORIZONTES: { grupo: NumeroGrupo; nombre: string }[] = [
  { grupo: 1, nombre: 'Primeros 3 meses' },
  { grupo: 2, nombre: 'A 6 meses' },
  { grupo: 3, nombre: 'A 12 meses' },
]
export const nombreHorizonte = (g: NumeroGrupo) => HORIZONTES.find((h) => h.grupo === g)?.nombre ?? `Horizonte ${g}`

export const PARTES_META: { clave: ParteMeta; titulo: string; pista: string; ejemplo: string; pesoPregunta: string }[] = [
  { clave: 'meta', titulo: 'Qué quieres lograr', pista: 'Una cosa concreta que quieres tener lista en este plazo.', ejemplo: 'Tener 30 clientes que compren cada semana.', pesoPregunta: '¿Qué tan importante es?' },
  { clave: 'medida', titulo: 'Cómo vas a medirlo', pista: 'El número con el que sabrás si lo lograste. Escribe una medida por cada meta, en el mismo orden.', ejemplo: '30 clientes con al menos una compra por semana.', pesoPregunta: '¿Qué tan fácil es medirlo?' },
  { clave: 'punto', titulo: 'De dónde partes', pista: 'Cómo estás hoy frente a esa meta, con un número si lo tienes.', ejemplo: 'Hoy tengo 12 clientes.', pesoPregunta: '¿Qué tan seguro es ese dato de hoy?' },
  { clave: 'paso', titulo: 'Qué haces primero', pista: 'La primera acción concreta que vas a hacer para empezar.', ejemplo: 'Visitar 10 vecinos esta semana con una muestra.', pesoPregunta: '¿Qué tan listo estás para hacerlo?' },
  { clave: 'freno', titulo: 'Qué te puede frenar', pista: 'Lo que podría impedirte llegar: falta de plata, tiempo, permisos, personas.', ejemplo: 'Solo puedo hornear 40 panes por día.', pesoPregunta: '¿Qué tan fuerte es el freno?' },
]
export const tituloParteMeta = (p: string) => PARTES_META.find((x) => x.clave === p)?.titulo ?? p

export interface ItemMeta {
  id: string
  grupo: NumeroGrupo
  parte: ParteMeta
  texto: string
  peso: string
  fuente: string
  condicion: Condicion
}

let contador = 0
export const nuevoIdMeta = () => `nuevo-${Date.now().toString(36)}-m${contador++}`

export const itemMetaVacio = (grupo: NumeroGrupo, parte: ParteMeta): ItemMeta => ({
  id: nuevoIdMeta(),
  grupo,
  parte,
  texto: '',
  peso: '3',
  fuente: '',
  condicion: 'estimado',
})

const t = (s: string) => s.trim()
const num = (s: string) => {
  const n = Number(s)
  return Number.isFinite(n) && n >= 1 && n <= 5 ? n : 3
}
export const llenosMeta = (items: ItemMeta[]) => items.filter((i) => t(i.texto).length > 0)
const deParte = (items: ItemMeta[], g: NumeroGrupo, p: ParteMeta) => llenosMeta(items).filter((i) => i.grupo === g && i.parte === p)
const media = (xs: ItemMeta[]) => (xs.length === 0 ? 0 : xs.reduce((s, i) => s + num(i.peso), 0) / xs.length)

export const gruposUsadosMeta = (items: ItemMeta[]): NumeroGrupo[] =>
  ([1, 2, 3] as NumeroGrupo[]).filter((g) => llenosMeta(items).some((i) => i.grupo === g))

export interface ResultadoMeta {
  grupo: NumeroGrupo
  /** 0 a 100. Mitad de "Cómo vas a medirlo" y mitad de "De dónde partes". Si una está vacía, esa mitad vale cero. */
  claras: number
  /** 0 a 100. Promedio de "Qué haces primero". */
  listas: number
  /** 0 a 100. Cuanto más fuertes los frenos, más baja. Si no escribiste frenos, vale cero (no se sabe). */
  despejado: number
  total: number
}

export function resultadoMeta(items: ItemMeta[], g: NumeroGrupo): ResultadoMeta {
  const claras = ((media(deParte(items, g, 'medida')) + media(deParte(items, g, 'punto'))) / 10) * 100
  const listas = (media(deParte(items, g, 'paso')) / 5) * 100
  const frenos = deParte(items, g, 'freno')
  const despejado = frenos.length === 0 ? 0 : ((6 - media(frenos)) / 5) * 100
  const total = llenosMeta(items).filter((i) => i.grupo === g).length
  return { grupo: g, claras: Math.round(claras), listas: Math.round(listas), despejado: Math.round(despejado), total }
}

export const resultadosMeta = (items: ItemMeta[]): ResultadoMeta[] => gruposUsadosMeta(items).map((g) => resultadoMeta(items, g))

export interface Lectura {
  titulo: string
  texto: string
}

export function lecturaMeta(items: ItemMeta[]): Lectura[] {
  const r = resultadosMeta(items)
  if (r.length === 0) return []
  const out: Lectura[] = []
  const clara = [...r].sort((a, b) => b.claras - a.claras)[0]
  out.push({ titulo: 'La meta mejor definida', texto: `${nombreHorizonte(clara.grupo)} (${clara.claras} de 100).` })
  const lista = [...r].sort((a, b) => b.listas - a.listas)[0]
  out.push({
    titulo: 'Donde estás más listo para arrancar',
    texto: lista.listas === 0 ? 'Aún no escribiste el primer paso de ningún plazo.' : `${nombreHorizonte(lista.grupo)} (${lista.listas} de 100).`,
  })
  const firmes = r.filter((x) => x.claras >= 60 && x.listas >= 60 && x.despejado >= 60)
  out.push({
    titulo: 'Plazo firme',
    texto: firmes.length > 0 ? `${firmes.map((x) => nombreHorizonte(x.grupo)).join(', ')}: la meta es clara, sabes por dónde empezar y el camino está despejado.` : 'Ningún plazo junta las tres cosas todavía. Mira cuál barra está más baja y empieza por ahí.',
  })
  return out
}

export type NivelAlerta = 'Informativa' | 'Preventiva' | 'Importante'
export interface Alerta {
  nivel: NivelAlerta
  texto: string
}

const plural = (n: number, uno: string, varios: string) => (n === 1 ? uno : varios)

export function alertasMeta(items: ItemMeta[]): Alerta[] {
  const v = llenosMeta(items)
  const out: Alerta[] = []
  if (v.length === 0) return out
  const usados = gruposUsadosMeta(items)
  if (!usados.includes(1)) {
    out.push({ nivel: 'Preventiva', texto: 'No escribiste nada para los primeros 3 meses. Una meta cercana te dice qué hacer ya.' })
  }
  for (const g of usados) {
    const n = nombreHorizonte(g)
    const metas = deParte(items, g, 'meta')
    const medidas = deParte(items, g, 'medida')
    const faltan = (['meta', 'medida', 'punto'] as ParteMeta[]).filter((p) => deParte(items, g, p).length === 0)
    if (faltan.length > 0) {
      out.push({ nivel: 'Importante', texto: `En “${n}” falta: ${faltan.map((p) => tituloParteMeta(p).toLowerCase()).join(', ')}. Sin eso no se puede medir bien este plazo.` })
    }
    if (metas.length > 3) {
      out.push({ nivel: 'Preventiva', texto: `En “${n}” tienes ${metas.length} metas. Con más de 3 a la vez casi nunca se cumple ninguna. Elige las que más importan.` })
    }
    if (metas.length > 0 && medidas.length > 0 && medidas.length < metas.length) {
      out.push({ nivel: 'Preventiva', texto: `En “${n}” tienes ${metas.length} metas y solo ${medidas.length} ${plural(medidas.length, 'medida', 'medidas')}. Cada meta necesita la suya.` })
    }
    const sinNumero = medidas.filter((i) => !/\d/.test(i.texto)).length
    if (sinNumero > 0) {
      out.push({ nivel: 'Preventiva', texto: `En “${n}” ${sinNumero} ${plural(sinNumero, 'medida no tiene', 'medidas no tienen')} ningún número. Una meta sin cifra no se puede revisar después.` })
    }
    const pasos = deParte(items, g, 'paso')
    const frenos = deParte(items, g, 'freno')
    if (metas.length > 0 && pasos.length === 0) {
      out.push({ nivel: 'Preventiva', texto: `En “${n}” no escribiste el primer paso. Una meta sin primer paso se queda en deseo.` })
    }
    if (frenos.length === 0) {
      out.push({ nivel: 'Informativa', texto: `En “${n}” no escribiste qué te puede frenar. Piensa en plata, tiempo, permisos y personas.` })
    } else if (frenos.some((i) => num(i.peso) >= 4) && pasos.length === 0) {
      out.push({ nivel: 'Importante', texto: `En “${n}” tienes un freno fuerte y ningún primer paso para enfrentarlo.` })
    }
    if (pasos.length > 0 && pasos.every((i) => num(i.peso) <= 2)) {
      out.push({ nivel: 'Preventiva', texto: `En “${n}” todavía no estás listo para el primer paso. Pregúntate qué te falta para poder hacerlo esta semana.` })
    }
  }
  const flojos = v.filter((i) => i.condicion === 'supuesto' || i.condicion === 'pendiente').length
  if (flojos > 0) out.push({ nivel: 'Informativa', texto: `${flojos} elemento${flojos === 1 ? '' : 's'} está${flojos === 1 ? '' : 'n'} como supuesto o pendiente. Compruébalo${flojos === 1 ? '' : 's'} antes de darlo${flojos === 1 ? '' : 's'} por hecho${flojos === 1 ? '' : 's'}.` })
  const sinFuente = v.filter((i) => !t(i.fuente)).length
  if (sinFuente > 0) out.push({ nivel: 'Informativa', texto: `${sinFuente} elemento${sinFuente === 1 ? '' : 's'} no dice${sinFuente === 1 ? '' : 'n'} de dónde salió.` })
  return out
}

export interface Revision {
  clave: string
  texto: string
  cumple: boolean
  obligatorio: boolean
  ayuda: string
}

export function revisarMeta(items: ItemMeta[]): Revision[] {
  const usados = gruposUsadosMeta(items)
  const v = llenosMeta(items)
  return [
    { clave: 'plazo', texto: 'Escribiste metas para al menos un plazo.', cumple: usados.length >= 1, obligatorio: true, ayuda: 'Empieza por los primeros 3 meses.' },
    {
      clave: 'tres',
      texto: 'Cada plazo tiene qué quieres lograr, cómo lo medirás y de dónde partes.',
      cumple: usados.length > 0 && usados.every((g) => (['meta', 'medida', 'punto'] as ParteMeta[]).every((p) => deParte(items, g, p).length > 0)),
      obligatorio: true,
      ayuda: 'Son las partes con las que se calcula la primera barra.',
    },
    { clave: 'paso', texto: 'Cada plazo tiene un primer paso.', cumple: usados.length > 0 && usados.every((g) => deParte(items, g, 'paso').length > 0), obligatorio: false, ayuda: 'Una acción que puedas hacer esta semana.' },
    { clave: 'cinco', texto: 'Cada plazo tiene las cinco partes.', cumple: usados.length > 0 && usados.every((g) => PARTES_META.every((p) => deParte(items, g, p.clave).length > 0)), obligatorio: false, ayuda: 'Falta alguna: el primer paso o lo que te puede frenar.' },
    { clave: 'fuente', texto: 'Cada elemento dice de dónde salió.', cumple: v.length > 0 && v.every((i) => t(i.fuente)), obligatorio: false, ayuda: 'Una cuenta, un registro, una conversación.' },
    { clave: 'firme', texto: 'Nada queda como supuesto o pendiente.', cumple: v.length > 0 && v.every((i) => i.condicion !== 'supuesto' && i.condicion !== 'pendiente'), obligatorio: false, ayuda: 'Comprueba esos datos con números reales.' },
  ]
}
