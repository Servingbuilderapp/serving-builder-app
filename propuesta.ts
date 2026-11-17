/**
 * Propuesta de Valor (Camino A) — la escribe la persona; el sistema solo promedia, ordena y avisa.
 * Sin IA y sin datos inventados. Usa los mismos grupos de clientes del Mapa del Cliente (hasta 3).
 * Cada grupo tiene 5 partes; cada elemento tiene texto, peso de 1 a 5, fuente y condición del dato.
 * Se cruza con el Mapa del Cliente: lo que a ese grupo le duele vs. lo que tú alivias.
 */

import type { Condicion } from '@/lib/empresarial/formulacion'
import { MAX_GRUPOS, type NumeroGrupo } from '@/lib/empresarial/cliente'

export type ParteProp = 'alivia' | 'gana' | 'ofreces' | 'diferencia' | 'prueba'

export const PARTES_PROP: { clave: ParteProp; titulo: string; pista: string; ejemplo: string; pesoPregunta: string }[] = [
  { clave: 'alivia', titulo: 'Qué dolor le alivias', pista: 'Lo que hoy le cuesta o le molesta y tú le quitas.', ejemplo: 'Ya no hace fila: el pan le llega a la puerta.', pesoPregunta: '¿Cuánto se lo alivias?' },
  { clave: 'gana', titulo: 'Qué ganancia le das', pista: 'Lo bueno que obtiene con lo tuyo: tiempo, plata, tranquilidad, estatus.', ejemplo: 'Se ahorra 20 minutos cada mañana.', pesoPregunta: '¿Cuánto valor le da?' },
  { clave: 'ofreces', titulo: 'Qué le ofreces', pista: 'El producto o servicio concreto con el que lo logras.', ejemplo: 'Suscripción semanal de pan artesanal con entrega a domicilio.', pesoPregunta: '¿Qué tan listo está? (1 es solo idea, 5 ya lo vendes)' },
  { clave: 'diferencia', titulo: 'Por qué a ti y no a otro', pista: 'Lo que te hace distinto de las otras opciones que él tiene.', ejemplo: 'Hornea a las 5 a. m. y entrega antes de las 7.', pesoPregunta: '¿Qué tan difícil es que te copien?' },
  { clave: 'prueba', titulo: 'Qué prueba tienes', pista: 'Lo que muestra que sí cumples: clientes, resultados, pruebas, referencias.', ejemplo: '12 vecinos ya compran cada semana.', pesoPregunta: '¿Qué tan fuerte es la prueba?' },
]
export const tituloParteProp = (p: string) => PARTES_PROP.find((x) => x.clave === p)?.titulo ?? p

export { MAX_GRUPOS }

export interface ItemProp {
  id: string
  grupo: NumeroGrupo
  parte: ParteProp
  texto: string
  peso: string
  fuente: string
  condicion: Condicion
}

let contador = 0
export const nuevoIdProp = () => `nuevo-${Date.now().toString(36)}-p${contador++}`

export const itemPropVacio = (grupo: NumeroGrupo, parte: ParteProp): ItemProp => ({
  id: nuevoIdProp(),
  grupo,
  parte,
  texto: '',
  peso: '3',
  fuente: '',
  condicion: 'estimado',
})

/** Lo que la persona ya escribió en su Mapa del Cliente (solo lectura aquí). */
export interface MapaGrupo {
  grupo: NumeroGrupo
  nombre: string
  necesita: { texto: string; peso: number }[]
  duele: { texto: string; peso: number }[]
  /** 0 a 100, igual que en el Mapa del Cliente. */
  fuerza: number
}

const t = (s: string) => s.trim()
const num = (s: string) => {
  const n = Number(s)
  return Number.isFinite(n) && n >= 1 && n <= 5 ? n : 3
}
export const llenosProp = (items: ItemProp[]) => items.filter((i) => t(i.texto).length > 0)
const deParte = (items: ItemProp[], g: NumeroGrupo, p: ParteProp) => llenosProp(items).filter((i) => i.grupo === g && i.parte === p)
const media = (xs: ItemProp[]) => (xs.length === 0 ? 0 : xs.reduce((s, i) => s + num(i.peso), 0) / xs.length)

export const gruposUsadosProp = (items: ItemProp[]): NumeroGrupo[] =>
  ([1, 2, 3] as NumeroGrupo[]).filter((g) => llenosProp(items).some((i) => i.grupo === g))

export interface ResultadoProp {
  grupo: NumeroGrupo
  /** 0 a 100. Mitad de "Qué dolor le alivias" y mitad de "Qué ganancia le das". Si una está vacía, esa mitad vale cero. */
  resuelve: number
  /** 0 a 100. Promedio de "Por qué a ti y no a otro". */
  distinta: number
  /** 0 a 100. Promedio de "Qué prueba tienes". */
  respaldo: number
  total: number
}

export function resultadoProp(items: ItemProp[], g: NumeroGrupo): ResultadoProp {
  const resuelve = ((media(deParte(items, g, 'alivia')) + media(deParte(items, g, 'gana'))) / 10) * 100
  const distinta = (media(deParte(items, g, 'diferencia')) / 5) * 100
  const respaldo = (media(deParte(items, g, 'prueba')) / 5) * 100
  const total = llenosProp(items).filter((i) => i.grupo === g).length
  return { grupo: g, resuelve: Math.round(resuelve), distinta: Math.round(distinta), respaldo: Math.round(respaldo), total }
}

export const resultadosProp = (items: ItemProp[]): ResultadoProp[] => gruposUsadosProp(items).map((g) => resultadoProp(items, g))

export const nombreDeGrupo = (mapa: MapaGrupo[], g: NumeroGrupo) => mapa.find((m) => m.grupo === g)?.nombre.trim() || `Grupo ${g}`

export interface Lectura {
  titulo: string
  texto: string
}

export function lecturaProp(items: ItemProp[], mapa: MapaGrupo[]): Lectura[] {
  const r = resultadosProp(items)
  if (r.length === 0) return []
  const out: Lectura[] = []
  const mejor = [...r].sort((a, b) => b.resuelve - a.resuelve)[0]
  out.push({ titulo: 'Donde más resuelves', texto: `${nombreDeGrupo(mapa, mejor.grupo)} (${mejor.resuelve} de 100).` })
  const mas = [...r].sort((a, b) => b.respaldo - a.respaldo)[0]
  out.push({
    titulo: 'La propuesta mejor respaldada',
    texto: mas.respaldo === 0 ? 'Aún no escribiste pruebas para ningún grupo.' : `${nombreDeGrupo(mapa, mas.grupo)} (${mas.respaldo} de 100).`,
  })
  const firmes = r.filter((x) => x.resuelve >= 60 && x.distinta >= 60 && x.respaldo >= 60)
  out.push({
    titulo: 'Propuesta firme',
    texto: firmes.length > 0 ? `${firmes.map((x) => nombreDeGrupo(mapa, x.grupo)).join(', ')}: resuelves bien, te distingues y lo puedes probar.` : 'Ningún grupo junta las tres cosas todavía. Mira cuál barra está más baja y empieza por ahí.',
  })
  return out
}

export type NivelAlerta = 'Informativa' | 'Preventiva' | 'Importante'
export interface Alerta {
  nivel: NivelAlerta
  texto: string
}

export function alertasProp(items: ItemProp[], mapa: MapaGrupo[]): Alerta[] {
  const v = llenosProp(items)
  const out: Alerta[] = []
  if (v.length === 0) return out
  if (mapa.length === 0) {
    out.push({ nivel: 'Importante', texto: 'Aún no hiciste el Mapa del Cliente. Sin saber qué le duele a tu cliente, no se puede ver si tu propuesta le sirve.' })
  }
  for (const g of gruposUsadosProp(items)) {
    const n = nombreDeGrupo(mapa, g)
    const faltan = (['alivia', 'gana', 'diferencia'] as ParteProp[]).filter((p) => deParte(items, g, p).length === 0)
    if (faltan.length > 0) {
      out.push({ nivel: 'Importante', texto: `En “${n}” falta: ${faltan.map((p) => tituloParteProp(p).toLowerCase()).join(', ')}. Sin eso no se puede medir bien esta propuesta.` })
    }
    const m = mapa.find((x) => x.grupo === g)
    if (mapa.length > 0 && !m) {
      out.push({ nivel: 'Preventiva', texto: `“${n}” no está en tu Mapa del Cliente. Descríbelo allá para comprobar que tu propuesta le sirve.` })
    }
    if (m) {
      const r = resultadoProp(items, g)
      if (m.fuerza >= 60 && r.resuelve < 50) {
        out.push({ nivel: 'Importante', texto: `A “${n}” le duele fuerte (${m.fuerza} de 100 en tu Mapa) pero lo que alivias y le das pesa poco (${r.resuelve} de 100). Revisa si tu propuesta toca lo que de verdad le duele.` })
      }
      const fuertes = m.duele.filter((d) => d.peso >= 4).length
      const alivios = deParte(items, g, 'alivia').length
      if (fuertes > alivios) {
        out.push({ nivel: 'Preventiva', texto: `En tu Mapa, a “${n}” le duelen ${fuertes} cosa${fuertes === 1 ? '' : 's'} con fuerza y tú escribiste ${alivios} alivio${alivios === 1 ? '' : 's'}. Mira cuáles dolores no estás tocando.` })
      }
    }
    const resp = deParte(items, g, 'prueba')
    if (resp.length === 0) {
      out.push({ nivel: 'Preventiva', texto: `En “${n}” no escribiste ninguna prueba. Una propuesta sin prueba es solo una promesa.` })
    } else if (resp.every((i) => num(i.peso) <= 2)) {
      out.push({ nivel: 'Preventiva', texto: `En “${n}” las pruebas son débiles. Busca una conversación, un cliente o un resultado real.` })
    }
    const dif = deParte(items, g, 'diferencia')
    if (dif.length > 0 && dif.every((i) => num(i.peso) <= 2)) {
      out.push({ nivel: 'Preventiva', texto: `En “${n}” lo que te distingue es fácil de copiar. Pregúntate qué te cuesta menos hacer a ti que a otros.` })
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

export function revisarProp(items: ItemProp[]): Revision[] {
  const usados = gruposUsadosProp(items)
  const v = llenosProp(items)
  return [
    { clave: 'grupo', texto: 'Escribiste la propuesta para al menos un grupo de clientes.', cumple: usados.length >= 1, obligatorio: true, ayuda: 'Empieza por el cliente que más claro tengas.' },
    {
      clave: 'tres',
      texto: 'Cada grupo tiene el dolor que alivias, la ganancia que das y por qué a ti.',
      cumple: usados.length > 0 && usados.every((g) => (['alivia', 'gana', 'diferencia'] as ParteProp[]).every((p) => deParte(items, g, p).length > 0)),
      obligatorio: true,
      ayuda: 'Son las partes con las que se calculan las barras.',
    },
    { clave: 'prueba', texto: 'Cada grupo tiene al menos una prueba.', cumple: usados.length > 0 && usados.every((g) => deParte(items, g, 'prueba').length > 0), obligatorio: false, ayuda: 'Un cliente, un resultado, una referencia.' },
    { clave: 'cinco', texto: 'Cada grupo tiene las cinco partes.', cumple: usados.length > 0 && usados.every((g) => PARTES_PROP.every((p) => deParte(items, g, p.clave).length > 0)), obligatorio: false, ayuda: 'Falta alguna: qué le ofreces o la prueba.' },
    { clave: 'fuente', texto: 'Cada elemento dice de dónde salió.', cumple: v.length > 0 && v.every((i) => t(i.fuente)), obligatorio: false, ayuda: 'Una conversación, una encuesta, algo que viste.' },
    { clave: 'firme', texto: 'Nada queda como supuesto o pendiente.', cumple: v.length > 0 && v.every((i) => i.condicion !== 'supuesto' && i.condicion !== 'pendiente'), obligatorio: false, ayuda: 'Comprueba esos datos hablando con clientes.' },
  ]
}
