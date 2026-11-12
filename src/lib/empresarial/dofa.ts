/**
 * Análisis DOFA (Camino A) — lo escribe la persona; el sistema solo calcula el balance.
 * Sin IA y sin datos inventados. Cada elemento lleva un peso (1 a 5) y su condición.
 *
 *   interno  = (peso de fortalezas − peso de debilidades) ÷ (suma de ambos)   → de −1 a +1
 *   externo  = (peso de oportunidades − peso de amenazas) ÷ (suma de ambos)   → de −1 a +1
 * La posición (interno, externo) cae en uno de cuatro cuadrantes del plano.
 */

import type { Condicion } from '@/lib/empresarial/formulacion'

export type Cuadrante = 'fortaleza' | 'debilidad' | 'oportunidad' | 'amenaza'
export type Cruce = 'estrategia_fo' | 'estrategia_do' | 'estrategia_fa' | 'estrategia_da'
export type TipoDofa = Cuadrante | Cruce

export interface GuiaCuadrante {
  clave: Cuadrante
  titulo: string
  letra: string
  donde: string
  pista: string
  preguntas: string[]
  ejemplo: string
  color: string
}

export const GUIAS: GuiaCuadrante[] = [
  {
    clave: 'fortaleza',
    titulo: 'Fortalezas',
    letra: 'F',
    donde: 'Dentro de ti · ayuda',
    pista: 'Lo que tienes o sabes hacer bien, y que depende de ti.',
    preguntas: ['¿Qué sabes hacer mejor que otros?', '¿Qué recursos, equipos, contactos o permisos ya tienes?', '¿Qué dicen tus clientes que les gusta de ti?'],
    ejemplo: 'Receta propia con 10 años de práctica; local ya adecuado con permiso sanitario.',
    color: '#3F8A76',
  },
  {
    clave: 'debilidad',
    titulo: 'Debilidades',
    letra: 'D',
    donde: 'Dentro de ti · perjudica',
    pista: 'Lo que te falta o haces mal, y que también depende de ti.',
    preguntas: ['¿Qué te falta para atender bien a tus clientes?', '¿Qué te ha costado o te ha salido mal?', '¿De qué dependes demasiado (una persona, un cliente, un proveedor)?'],
    ejemplo: 'Una sola persona sabe hornear; no hay capital para comprar el segundo horno.',
    color: '#C4604F',
  },
  {
    clave: 'oportunidad',
    titulo: 'Oportunidades',
    letra: 'O',
    donde: 'Afuera · ayuda',
    pista: 'Lo que pasa en el entorno y te puede favorecer. No depende de ti.',
    preguntas: ['¿Qué cambia en el mercado, la ley o la tecnología que te beneficia?', '¿Qué necesidad hoy nadie atiende bien?', '¿Qué ayudas, convocatorias o alianzas hay disponibles?'],
    ejemplo: 'Tres cafeterías nuevas en el barrio sin proveedor de pan fresco.',
    color: '#4A6FB5',
  },
  {
    clave: 'amenaza',
    titulo: 'Amenazas',
    letra: 'A',
    donde: 'Afuera · perjudica',
    pista: 'Lo que pasa en el entorno y te puede hacer daño. No depende de ti.',
    preguntas: ['¿Qué hace la competencia que te puede quitar clientes?', '¿Qué puede subir de precio o escasear (insumos, arriendos)?', '¿Qué norma o cambio económico te puede afectar?'],
    ejemplo: 'Una cadena grande abrió a dos cuadras; el precio de la harina subió.',
    color: '#B08D57',
  },
]

export const CRUCES: { clave: Cruce; titulo: string; pregunta: string; usa: [Cuadrante, Cuadrante]; ejemplo: string }[] = [
  { clave: 'estrategia_fo', titulo: 'Crecer (F + O)', pregunta: '¿Cómo usas tus fortalezas para aprovechar las oportunidades?', usa: ['fortaleza', 'oportunidad'], ejemplo: 'Ofrecer contrato de entrega diaria a las cafeterías nuevas con mi receta propia.' },
  { clave: 'estrategia_do', titulo: 'Corregir (D + O)', pregunta: '¿Cómo superas tus debilidades para no perder las oportunidades?', usa: ['debilidad', 'oportunidad'], ejemplo: 'Capacitar a una segunda persona para poder atender más pedidos.' },
  { clave: 'estrategia_fa', titulo: 'Protegerte (F + A)', pregunta: '¿Cómo usas tus fortalezas para reducir el daño de las amenazas?', usa: ['fortaleza', 'amenaza'], ejemplo: 'Competir por calidad y frescura, no por precio, frente a la cadena grande.' },
  { clave: 'estrategia_da', titulo: 'Resistir (D + A)', pregunta: '¿Cómo evitas que tus debilidades y las amenazas te golpeen juntas?', usa: ['debilidad', 'amenaza'], ejemplo: 'Fijar con el proveedor el precio de la harina por tres meses.' },
]

export interface ItemDofa {
  id: string
  cuadrante: TipoDofa
  texto: string
  impacto: string
  fuente: string
  condicion: Condicion
}

let contador = 0
export const nuevoIdDofa = () => `nuevo-${Date.now().toString(36)}-d${contador++}`

export const itemDofaVacio = (cuadrante: TipoDofa, texto = '', fuente = '', condicion: Condicion = 'estimado'): ItemDofa => ({
  id: nuevoIdDofa(),
  cuadrante,
  texto,
  impacto: '3',
  fuente,
  condicion,
})

const t = (s: string) => s.trim()
const peso = (i: ItemDofa) => {
  const n = Number(i.impacto)
  return Number.isFinite(n) && n >= 1 && n <= 5 ? n : 3
}
const llenos = (items: ItemDofa[], c: TipoDofa) => items.filter((i) => i.cuadrante === c && t(i.texto).length > 0)

export interface Balance {
  F: number
  D: number
  O: number
  A: number
  interno: number | null
  externo: number | null
}

export function calcularBalance(items: ItemDofa[]): Balance {
  const suma = (c: Cuadrante) => llenos(items, c).reduce((a, i) => a + peso(i), 0)
  const F = suma('fortaleza')
  const D = suma('debilidad')
  const O = suma('oportunidad')
  const A = suma('amenaza')
  return {
    F,
    D,
    O,
    A,
    interno: F + D > 0 ? (F - D) / (F + D) : null,
    externo: O + A > 0 ? (O - A) / (O + A) : null,
  }
}

export interface Lectura {
  nombre: string
  texto: string
}

export function lecturaPosicion(b: Balance): Lectura | null {
  if (b.interno === null || b.externo === null) return null
  const fuerte = b.interno >= 0
  const favorable = b.externo >= 0
  if (fuerte && favorable) return { nombre: 'Ofensiva', texto: 'Tienes fuerzas y el entorno ayuda. Es momento de crecer y aprovechar las oportunidades antes de que otros lo hagan.' }
  if (!fuerte && favorable) return { nombre: 'Reorientación', texto: 'El entorno ayuda, pero te faltan capacidades. Corrige primero tus debilidades para poder aprovechar lo que se abre.' }
  if (fuerte && !favorable) return { nombre: 'Defensiva', texto: 'Eres fuerte, pero el entorno es difícil. Usa tus fortalezas para protegerte y diferenciarte.' }
  return { nombre: 'Supervivencia', texto: 'Hay debilidades propias y un entorno adverso. Reduce riesgos, cuida la caja y avanza por etapas pequeñas.' }
}

export type NivelAlerta = 'Informativa' | 'Preventiva' | 'Importante' | 'Crítica'
export interface Alerta {
  nivel: NivelAlerta
  texto: string
}

export function alertasDofa(items: ItemDofa[]): Alerta[] {
  const out: Alerta[] = []
  for (const g of GUIAS) {
    if (llenos(items, g.clave).length === 0) {
      out.push({ nivel: 'Importante', texto: `No has escrito ninguna ${g.titulo.toLowerCase().replace(/s$/, '')}. Casi todo proyecto tiene alguna; si no la ves, pregúntale a un cliente o a un conocido que no sea de tu familia.` })
    }
  }
  const b = calcularBalance(items)
  const buenas = b.F + b.O
  const malas = b.D + b.A
  if (buenas > 0 && malas > 0 && buenas >= malas * 3) out.push({ nivel: 'Preventiva', texto: 'Tu lista es muy optimista: casi todo lo que escribiste favorece. Revisa si estás siendo realista con las debilidades y las amenazas.' })
  if (malas > 0 && buenas > 0 && malas >= buenas * 3) out.push({ nivel: 'Preventiva', texto: 'Tu lista es muy pesimista: casi todo lo que escribiste perjudica. Revisa si de verdad no tienes fortalezas ni oportunidades.' })
  const todos = items.filter((i) => ['fortaleza', 'debilidad', 'oportunidad', 'amenaza'].includes(i.cuadrante) && t(i.texto))
  if (todos.length >= 6 && new Set(todos.map((i) => peso(i))).size === 1) out.push({ nivel: 'Informativa', texto: 'Todos los elementos tienen el mismo peso. Cambia el peso de los que más importan para que el balance sea útil.' })
  const sinFuente = todos.filter((i) => !t(i.fuente)).length
  if (sinFuente > 0) out.push({ nivel: 'Informativa', texto: `${sinFuente} elemento${sinFuente === 1 ? '' : 's'} no tiene${sinFuente === 1 ? '' : 'n'} de dónde salió (un dato, un cliente, un documento). Mejor respaldarlos antes de presentar el análisis.` })
  const estr = (c: Cruce) => llenos(items, c).length
  if (llenos(items, 'debilidad').length > 0 && estr('estrategia_do') + estr('estrategia_da') === 0) out.push({ nivel: 'Preventiva', texto: 'Tienes debilidades pero ninguna estrategia para corregirlas o resistir. Escribe al menos una en "Corregir" o "Resistir".' })
  return out
}

export interface Revision {
  clave: string
  texto: string
  cumple: boolean
  obligatorio: boolean
  ayuda: string
}

export function revisarDofa(items: ItemDofa[]): Revision[] {
  const n = (c: TipoDofa) => llenos(items, c).length
  const base = items.filter((i) => ['fortaleza', 'debilidad', 'oportunidad', 'amenaza'].includes(i.cuadrante) && t(i.texto))
  const estrategias = n('estrategia_fo') + n('estrategia_do') + n('estrategia_fa') + n('estrategia_da')
  return [
    { clave: 'cuadrantes', texto: 'Hay al menos un elemento en cada uno de los cuatro cuadrantes.', cumple: GUIAS.every((g) => n(g.clave) > 0), obligatorio: true, ayuda: 'Fortalezas, debilidades, oportunidades y amenazas.' },
    { clave: 'estrategia', texto: 'Hay al menos una estrategia.', cumple: estrategias > 0, obligatorio: true, ayuda: 'Cruza lo que escribiste: ¿qué vas a hacer con esto?' },
    { clave: 'tres', texto: 'Cada cuadrante tiene al menos tres elementos.', cumple: GUIAS.every((g) => n(g.clave) >= 3), obligatorio: false, ayuda: 'Con tres por cuadrante el análisis se vuelve más confiable.' },
    { clave: 'fuente', texto: 'Cada elemento dice de dónde salió.', cumple: base.length > 0 && base.every((i) => t(i.fuente)), obligatorio: false, ayuda: 'Un dato, un cliente, un documento, una observación.' },
    { clave: 'cruces', texto: 'Hay una estrategia en cada uno de los cuatro cruces.', cumple: CRUCES.every((c) => n(c.clave) > 0), obligatorio: false, ayuda: 'Crecer, corregir, protegerte y resistir.' },
  ]
}
