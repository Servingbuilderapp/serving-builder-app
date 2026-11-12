/**
 * Lienzo de Negocio (Camino A) — lo escribe la persona; el sistema solo ordena, cuenta y avisa.
 * Sin IA y sin datos inventados. Nueve bloques que describen cómo funciona el negocio:
 * para quién, qué ofreces, cómo llegas, cómo los conservas, cómo ganas, con qué cuentas,
 * qué haces, con quién te apoyas y qué te cuesta.
 */

import type { Condicion } from '@/lib/empresarial/formulacion'

export type Bloque = 'clientes' | 'propuesta' | 'canales' | 'relacion' | 'ingresos' | 'recursos' | 'actividades' | 'aliados' | 'costos'

export interface GuiaBloque {
  clave: Bloque
  numero: number
  titulo: string
  pista: string
  preguntas: string[]
  ejemplo: string
  color: string
}

/** Orden de trabajo (no el del dibujo): de quién compra a cuánto cuesta. */
export const BLOQUES: GuiaBloque[] = [
  {
    clave: 'clientes',
    numero: 1,
    titulo: 'Para quién es',
    pista: 'Los grupos de personas o empresas a las que les vendes o quieres vender.',
    preguntas: ['¿Quién compra o usa lo tuyo?', '¿Qué tienen en común?', '¿Cuál es el grupo más importante?'],
    ejemplo: 'Familias del barrio que compran pan a diario y oficinas que piden desayunos.',
    color: '#4A6FB5',
  },
  {
    clave: 'propuesta',
    numero: 2,
    titulo: 'Qué les ofreces',
    pista: 'El producto o servicio, y la razón por la que te eligen a ti y no a otro.',
    preguntas: ['¿Qué problema les resuelves?', '¿Qué haces mejor o distinto?', '¿Qué reciben exactamente?'],
    ejemplo: 'Pan recién horneado cada mañana, sin conservantes y con entrega a la puerta.',
    color: '#B08D57',
  },
  {
    clave: 'canales',
    numero: 3,
    titulo: 'Cómo les llegas',
    pista: 'Los medios por los que te conocen, te compran y reciben lo tuyo.',
    preguntas: ['¿Dónde te encuentran?', '¿Cómo te pagan?', '¿Cómo les entregas?'],
    ejemplo: 'Local en la esquina, pedidos por WhatsApp y entrega en moto.',
    color: '#7E5FB0',
  },
  {
    clave: 'relacion',
    numero: 4,
    titulo: 'Cómo los conservas',
    pista: 'El trato que tienes con cada cliente para que vuelva y recomiende.',
    preguntas: ['¿Les atiendes tú o es automático?', '¿Cómo los haces volver?', '¿Cómo recibes sus quejas?'],
    ejemplo: 'Trato directo, tarjeta de compras frecuentes y mensaje cuando sale el pan especial.',
    color: '#C4604F',
  },
  {
    clave: 'ingresos',
    numero: 5,
    titulo: 'Cómo ganas dinero',
    pista: 'Las formas en que te entra plata: ventas, suscripciones, comisiones, alquileres.',
    preguntas: ['¿Por qué paga el cliente?', '¿Cuánto paga y con qué frecuencia?', '¿Cuál fuente pesa más?'],
    ejemplo: 'Venta diaria en mostrador y un pedido semanal fijo de dos restaurantes.',
    color: '#3F8A76',
  },
  {
    clave: 'recursos',
    numero: 6,
    titulo: 'Con qué cuentas',
    pista: 'Lo indispensable que necesitas tener: equipos, local, personas, marca, permisos, dinero.',
    preguntas: ['¿Qué no podrías operar sin tener?', '¿Qué ya tienes y qué te falta?', '¿Qué permisos necesitas?'],
    ejemplo: 'Horno industrial, local arrendado, dos panaderos y registro sanitario.',
    color: '#A38A2E',
  },
  {
    clave: 'actividades',
    numero: 7,
    titulo: 'Qué haces cada día',
    pista: 'Las tareas más importantes que mantienen el negocio funcionando.',
    preguntas: ['¿Qué haces para producir lo que vendes?', '¿Qué haces para vender?', '¿Qué haces para entregar?'],
    ejemplo: 'Hornear de madrugada, atender el mostrador y repartir pedidos.',
    color: '#4A6FB5',
  },
  {
    clave: 'aliados',
    numero: 8,
    titulo: 'Con quién te apoyas',
    pista: 'Proveedores y socios sin los cuales sería difícil operar o crecer.',
    preguntas: ['¿Quién te vende lo esencial?', '¿Con quién te asocias?', '¿Qué haces tú y qué hace otro?'],
    ejemplo: 'Molino de la región, una moto-mensajería y una cafetería que revende.',
    color: '#7E5FB0',
  },
  {
    clave: 'costos',
    numero: 9,
    titulo: 'Qué te cuesta',
    pista: 'Los gastos más grandes para operar, fijos o variables.',
    preguntas: ['¿Qué gasto pesa más?', '¿Cuáles son fijos y cuáles cambian con las ventas?', '¿Qué costo no puedes evitar?'],
    ejemplo: 'Harina y mantequilla, arriendo, nómina y gas.',
    color: '#C4604F',
  },
]

export interface ItemLienzo {
  id: string
  bloque: Bloque
  texto: string
  fuente: string
  condicion: Condicion
}

let contador = 0
export const nuevoIdLienzo = () => `nuevo-${Date.now().toString(36)}-l${contador++}`

export const itemLienzoVacio = (bloque: Bloque, texto = '', fuente = '', condicion: Condicion = 'estimado'): ItemLienzo => ({
  id: nuevoIdLienzo(),
  bloque,
  texto,
  fuente,
  condicion,
})

const t = (s: string) => s.trim()
const llenos = (items: ItemLienzo[]) => items.filter((i) => t(i.texto).length > 0)
const cuenta = (items: ItemLienzo[], b: Bloque) => llenos(items).filter((i) => i.bloque === b).length

export const tituloBloque = (b: Bloque) => BLOQUES.find((x) => x.clave === b)?.titulo ?? b

export interface Lectura {
  titulo: string
  texto: string
}

/** Dice qué bloques ya están armados y cuáles siguen vacíos, según lo escrito. */
export function lecturaLienzo(items: ItemLienzo[]): Lectura[] {
  const out: Lectura[] = []
  const v = llenos(items)
  if (v.length === 0) return out
  const armados = BLOQUES.filter((b) => cuenta(items, b.clave) > 0)
  const vacios = BLOQUES.filter((b) => cuenta(items, b.clave) === 0)
  out.push({ titulo: 'Lo que ya tienes armado', texto: `${armados.length} de 9 bloques tienen algo escrito${armados.length < 9 ? '' : '. Tu modelo está completo en el papel'}.` })
  if (vacios.length > 0) out.push({ titulo: 'Lo que aún falta', texto: `${vacios.map((b) => b.titulo).join(', ')}.` })
  const mas = [...BLOQUES].sort((a, b) => cuenta(items, b.clave) - cuenta(items, a.clave))[0]
  if (mas && cuenta(items, mas.clave) >= 3) out.push({ titulo: 'Donde más has pensado', texto: `${mas.titulo} (${cuenta(items, mas.clave)} elementos). Revisa que los demás bloques tengan el mismo cuidado.` })
  return out
}

export type NivelAlerta = 'Informativa' | 'Preventiva' | 'Importante'
export interface Alerta {
  nivel: NivelAlerta
  texto: string
}

/** Avisos de coherencia: un modelo de negocio es una cadena y cada eslabón debe apoyarse en el anterior. */
export function alertasLienzo(items: ItemLienzo[]): Alerta[] {
  const v = llenos(items)
  const out: Alerta[] = []
  if (v.length === 0) return out
  const n = (b: Bloque) => cuenta(items, b)

  if (n('propuesta') > 0 && n('clientes') === 0)
    out.push({ nivel: 'Importante', texto: 'Escribiste qué ofreces pero no para quién. Sin un cliente claro la oferta no se puede comprobar.' })
  if (n('clientes') > 0 && n('propuesta') === 0)
    out.push({ nivel: 'Importante', texto: 'Sabes para quién es, pero falta lo que les ofreces y por qué te elegirían.' })
  if (n('ingresos') > 0 && n('costos') === 0)
    out.push({ nivel: 'Importante', texto: 'Escribiste cómo ganas dinero pero no qué te cuesta. Sin los costos no se sabe si el negocio deja.' })
  if (n('costos') > 0 && n('ingresos') === 0)
    out.push({ nivel: 'Importante', texto: 'Escribiste los costos pero no cómo te entra el dinero.' })
  if (n('clientes') > 0 && n('canales') === 0)
    out.push({ nivel: 'Preventiva', texto: 'Tienes clientes pero no dijiste cómo les llegas ni cómo te compran.' })
  if (n('propuesta') > 0 && n('recursos') === 0 && n('actividades') === 0)
    out.push({ nivel: 'Preventiva', texto: 'Ofreces algo pero no dijiste con qué lo harás ni qué tareas lo hacen posible.' })
  if (n('relacion') === 0 && n('clientes') > 0)
    out.push({ nivel: 'Informativa', texto: 'No dijiste cómo conservas a los clientes. Conseguir uno nuevo casi siempre cuesta más que mantener uno.' })

  const flojos = v.filter((i) => i.condicion === 'supuesto' || i.condicion === 'pendiente').length
  if (flojos > 0) out.push({ nivel: 'Informativa', texto: `${flojos} elemento${flojos === 1 ? ' está' : 's están'} como supuesto o pendiente. Compruébalo${flojos === 1 ? '' : 's'} antes de presentar el modelo como hecho.` })
  const sinFuente = v.filter((i) => !t(i.fuente)).length
  if (sinFuente > 0) out.push({ nivel: 'Informativa', texto: `${sinFuente} elemento${sinFuente === 1 ? '' : 's'} no dice${sinFuente === 1 ? '' : 'n'} de dónde salió (una venta real, una conversación, un precio de lista). Respáldalos antes de presentar el modelo.` })
  return out
}

export interface Revision {
  clave: string
  texto: string
  cumple: boolean
  obligatorio: boolean
  ayuda: string
}

export function revisarLienzo(items: ItemLienzo[]): Revision[] {
  const v = llenos(items)
  const n = (b: Bloque) => cuenta(items, b)
  const armados = BLOQUES.filter((b) => n(b.clave) > 0).length
  return [
    { clave: 'cliente', texto: 'Dijiste para quién es el negocio.', cumple: n('clientes') > 0, obligatorio: true, ayuda: 'Describe al menos un grupo de clientes.' },
    { clave: 'oferta', texto: 'Dijiste qué ofreces.', cumple: n('propuesta') > 0, obligatorio: true, ayuda: 'Qué problema resuelves y qué recibe el cliente.' },
    { clave: 'ingreso', texto: 'Dijiste cómo ganas dinero.', cumple: n('ingresos') > 0, obligatorio: true, ayuda: 'Por qué paga el cliente y cuánto.' },
    { clave: 'costo', texto: 'Dijiste qué te cuesta operar.', cumple: n('costos') > 0, obligatorio: true, ayuda: 'Anota al menos los dos gastos más grandes.' },
    { clave: 'siete', texto: 'Llenaste al menos siete de los nueve bloques.', cumple: armados >= 7, obligatorio: false, ayuda: 'Mientras más bloques revises, menos sorpresas.' },
    { clave: 'fuente', texto: 'Cada elemento dice de dónde salió.', cumple: v.length > 0 && v.every((i) => t(i.fuente)), obligatorio: false, ayuda: 'Una venta, una conversación con un cliente, un precio de proveedor.' },
  ]
}
