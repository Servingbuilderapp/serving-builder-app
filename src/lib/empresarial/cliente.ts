/**
 * Mapa del Cliente (Camino A) — lo escribe la persona; el sistema solo promedia, ordena y avisa.
 * Sin IA y sin datos inventados. Hasta 3 grupos de clientes (la persona les pone nombre).
 * Cada grupo tiene 5 partes; cada elemento tiene texto, peso de 1 a 5, fuente y condición del dato.
 */

import type { Condicion } from '@/lib/empresarial/formulacion'

export type Parte = 'necesita' | 'duele' | 'valora' | 'decide' | 'encuentra'

export const PARTES: { clave: Parte; titulo: string; pista: string; ejemplo: string; pesoPregunta: string }[] = [
  { clave: 'necesita', titulo: 'Qué necesita', pista: 'Lo que quiere lograr o resolver.', ejemplo: 'Pan fresco todos los días sin ir a la panadería.', pesoPregunta: '¿Qué tanto lo necesita?' },
  { clave: 'duele', titulo: 'Qué le duele', pista: 'Lo que hoy le cuesta, le molesta o le hace perder.', ejemplo: 'Hace fila de 20 minutos y a veces ya no hay.', pesoPregunta: '¿Cuánto le duele?' },
  { clave: 'valora', titulo: 'Qué valora', pista: 'Lo que le importa al elegir: precio, calidad, confianza, rapidez.', ejemplo: 'Que sea del barrio y llegue caliente.', pesoPregunta: '¿Cuánto le importa?' },
  { clave: 'decide', titulo: 'Cómo decide', pista: 'Quién decide, qué mira y qué lo frena.', ejemplo: 'Decide la mamá; le piden recomendación a una vecina.', pesoPregunta: '¿Cuánto pesa esto en su decisión?' },
  { clave: 'encuentra', titulo: 'Dónde encontrarlo', pista: 'Los lugares, grupos o canales donde puedes llegar a él.', ejemplo: 'Grupo de WhatsApp del conjunto y la tienda de la esquina.', pesoPregunta: '¿Qué tan fácil es llegar ahí?' },
]
export const tituloParte = (p: string) => PARTES.find((x) => x.clave === p)?.titulo ?? p

export const MAX_GRUPOS = 3
export type NumeroGrupo = 1 | 2 | 3

export interface ItemCliente {
  id: string
  grupo: NumeroGrupo
  parte: Parte
  texto: string
  peso: string
  fuente: string
  condicion: Condicion
}

export type NombresGrupos = Record<NumeroGrupo, string>
export const nombresVacios = (): NombresGrupos => ({ 1: '', 2: '', 3: '' })
export const nombreGrupo = (nombres: NombresGrupos, g: NumeroGrupo) => nombres[g].trim() || `Grupo ${g}`

let contador = 0
export const nuevoIdCliente = () => `nuevo-${Date.now().toString(36)}-c${contador++}`

export const itemClienteVacio = (grupo: NumeroGrupo, parte: Parte): ItemCliente => ({
  id: nuevoIdCliente(),
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
export const llenosCliente = (items: ItemCliente[]) => items.filter((i) => t(i.texto).length > 0)
const deParte = (items: ItemCliente[], g: NumeroGrupo, p: Parte) => llenosCliente(items).filter((i) => i.grupo === g && i.parte === p)
const media = (xs: ItemCliente[]) => (xs.length === 0 ? 0 : xs.reduce((s, i) => s + num(i.peso), 0) / xs.length)

/** Grupos que tienen al menos un elemento escrito. */
export const gruposUsados = (items: ItemCliente[]): NumeroGrupo[] =>
  ([1, 2, 3] as NumeroGrupo[]).filter((g) => llenosCliente(items).some((i) => i.grupo === g))

export interface ResultadoGrupo {
  grupo: NumeroGrupo
  /** 0 a 100. Mitad viene de "Qué necesita" y mitad de "Qué le duele". Si una de las dos está vacía, esa mitad vale cero. */
  fuerza: number
  /** 0 a 100. Qué tan fácil es llegar a este grupo (promedio de lo escrito en "Dónde encontrarlo"). */
  claridad: number
  total: number
}

export function resultadoGrupo(items: ItemCliente[], g: NumeroGrupo): ResultadoGrupo {
  const fuerza = ((media(deParte(items, g, 'necesita')) + media(deParte(items, g, 'duele'))) / 10) * 100
  const claridad = (media(deParte(items, g, 'encuentra')) / 5) * 100
  const total = llenosCliente(items).filter((i) => i.grupo === g).length
  return { grupo: g, fuerza: Math.round(fuerza), claridad: Math.round(claridad), total }
}

export const resultados = (items: ItemCliente[]): ResultadoGrupo[] => gruposUsados(items).map((g) => resultadoGrupo(items, g))

export interface Lectura {
  titulo: string
  texto: string
}

export function lecturaCliente(items: ItemCliente[], nombres: NombresGrupos): Lectura[] {
  const r = resultados(items)
  if (r.length === 0) return []
  const out: Lectura[] = []
  const masFuerte = [...r].sort((a, b) => b.fuerza - a.fuerza)[0]
  out.push({ titulo: 'El grupo con la necesidad más fuerte', texto: `${nombreGrupo(nombres, masFuerte.grupo)} (${masFuerte.fuerza} de 100).` })
  const masClaro = [...r].sort((a, b) => b.claridad - a.claridad)[0]
  out.push({
    titulo: 'El grupo más fácil de encontrar',
    texto: masClaro.claridad === 0 ? 'Aún no escribiste dónde encontrar a ninguno.' : `${nombreGrupo(nombres, masClaro.grupo)} (${masClaro.claridad} de 100).`,
  })
  if (r.length > 1) {
    const buen = r.filter((x) => x.fuerza >= 60 && x.claridad >= 60)
    out.push({
      titulo: 'Por dónde empezar',
      texto: buen.length > 0 ? `${buen.map((x) => nombreGrupo(nombres, x.grupo)).join(', ')}: lo necesitan fuerte y es fácil llegar.` : 'Ninguno junta necesidad fuerte y acceso fácil todavía. Revisa qué falta en cada uno.',
    })
  }
  return out
}

export type NivelAlerta = 'Informativa' | 'Preventiva' | 'Importante'
export interface Alerta {
  nivel: NivelAlerta
  texto: string
}

export function alertasCliente(items: ItemCliente[], nombres: NombresGrupos): Alerta[] {
  const v = llenosCliente(items)
  const out: Alerta[] = []
  if (v.length === 0) return out
  for (const g of gruposUsados(items)) {
    const n = nombreGrupo(nombres, g)
    const faltan = (['necesita', 'duele', 'encuentra'] as Parte[]).filter((p) => deParte(items, g, p).length === 0)
    if (faltan.length > 0) {
      out.push({ nivel: 'Importante', texto: `En “${n}” falta: ${faltan.map((p) => tituloParte(p).toLowerCase()).join(', ')}. Sin eso no se puede medir bien este grupo.` })
    }
    const lleno = v.filter((i) => i.grupo === g)
    const duele = deParte(items, g, 'duele')
    if (duele.length > 0 && duele.every((i) => num(i.peso) <= 2)) {
      out.push({ nivel: 'Preventiva', texto: `En “${n}” nada duele mucho. Si no les duele, difícilmente pagarán por resolverlo.` })
    }
    if (lleno.length >= 3 && lleno.every((i) => !t(i.fuente))) {
      out.push({ nivel: 'Informativa', texto: `En “${n}” ninguno dice de dónde salió. Una conversación o un dato real vale más que una idea.` })
    }
  }
  const flojos = v.filter((i) => i.condicion === 'supuesto' || i.condicion === 'pendiente').length
  if (flojos > 0) out.push({ nivel: 'Informativa', texto: `${flojos} elemento${flojos === 1 ? '' : 's'} está${flojos === 1 ? '' : 'n'} como supuesto o pendiente. Compruébalo${flojos === 1 ? '' : 's'} hablando con clientes reales.` })
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

export function revisarCliente(items: ItemCliente[]): Revision[] {
  const usados = gruposUsados(items)
  const v = llenosCliente(items)
  return [
    { clave: 'grupo', texto: 'Describiste al menos un grupo de clientes.', cumple: usados.length >= 1, obligatorio: true, ayuda: 'Empieza por el cliente que más claro tengas.' },
    {
      clave: 'tres',
      texto: 'Cada grupo tiene lo que necesita, lo que le duele y dónde encontrarlo.',
      cumple: usados.length > 0 && usados.every((g) => (['necesita', 'duele', 'encuentra'] as Parte[]).every((p) => deParte(items, g, p).length > 0)),
      obligatorio: true,
      ayuda: 'Son las tres partes con las que se calculan las barras.',
    },
    { clave: 'cinco', texto: 'Cada grupo tiene las cinco partes.', cumple: usados.length > 0 && usados.every((g) => PARTES.every((p) => deParte(items, g, p.clave).length > 0)), obligatorio: false, ayuda: 'Falta alguna: qué valora o cómo decide.' },
    { clave: 'fuente', texto: 'Cada elemento dice de dónde salió.', cumple: v.length > 0 && v.every((i) => t(i.fuente)), obligatorio: false, ayuda: 'Una conversación, una encuesta, algo que viste.' },
    { clave: 'firme', texto: 'Nada queda como supuesto o pendiente.', cumple: v.length > 0 && v.every((i) => i.condicion !== 'supuesto' && i.condicion !== 'pendiente'), obligatorio: false, ayuda: 'Comprueba esos datos hablando con clientes.' },
  ]
}
