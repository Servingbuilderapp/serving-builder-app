/**
 * Mapa de Presiones del Sector (Camino A) — lo escribe la persona; el sistema solo suma pesos y dibuja.
 * Sin IA y sin datos inventados. Cinco presiones del sector; cada elemento presiona o protege y pesa de 1 a 5.
 */

import type { Condicion } from '@/lib/empresarial/formulacion'

export type Factor = 'rivalidad' | 'entrantes' | 'sustitutos' | 'clientes' | 'proveedores'
export type Efecto = 'presiona' | 'protege'

export interface GuiaFactor {
  clave: Factor
  titulo: string
  corto: string
  pista: string
  preguntas: string[]
  ejemplo: string
  color: string
}

export const FACTORES: GuiaFactor[] = [
  {
    clave: 'rivalidad',
    titulo: 'Competidores de hoy',
    corto: 'Rivales',
    pista: 'Los que ya venden lo mismo que tú en tu zona o a tu tipo de cliente.',
    preguntas: ['¿Cuántos negocios venden algo parecido?', '¿Compiten por precio o por calidad?', '¿El mercado crece o se está llenando?'],
    ejemplo: 'Hay cuatro panaderías en dos cuadras y todas bajan precios.',
    color: '#C4604F',
  },
  {
    clave: 'entrantes',
    titulo: 'Nuevos que pueden llegar',
    corto: 'Nuevos',
    pista: 'Qué tan fácil es que alguien nuevo entre y te quite clientes.',
    preguntas: ['¿Se necesita mucho dinero o permisos para empezar?', '¿Los clientes son fieles o cambian fácil?', '¿Hay marcas grandes que podrían entrar?'],
    ejemplo: 'Con un horno pequeño cualquiera puede empezar a vender desde su casa.',
    color: '#B08D57',
  },
  {
    clave: 'sustitutos',
    titulo: 'Otras formas de resolver lo mismo',
    corto: 'Reemplazos',
    pista: 'Productos distintos al tuyo con los que el cliente puede resolver la misma necesidad.',
    preguntas: ['¿Qué más podría comprar tu cliente en vez de lo tuyo?', '¿Es más barato o más cómodo?', '¿Está creciendo ese reemplazo?'],
    ejemplo: 'Los supermercados venden pan empacado más barato.',
    color: '#7E5FB0',
  },
  {
    clave: 'clientes',
    titulo: 'Fuerza de tus clientes',
    corto: 'Clientes',
    pista: 'Cuánto pueden exigirte rebajas o condiciones los que te compran.',
    preguntas: ['¿Pocos clientes concentran tus ventas?', '¿Comparan precios fácilmente?', '¿Cambiarte de proveedor les cuesta algo?'],
    ejemplo: 'Dos restaurantes compran la mitad de mi producción y piden descuento.',
    color: '#4A6FB5',
  },
  {
    clave: 'proveedores',
    titulo: 'Fuerza de tus proveedores',
    corto: 'Proveedores',
    pista: 'Cuánto pueden subirte precios o condiciones quienes te venden insumos.',
    preguntas: ['¿Hay varios proveedores o uno solo?', '¿Cambiar de proveedor es difícil o caro?', '¿Dependes de un insumo escaso?'],
    ejemplo: 'Solo un molino de la región vende la harina que necesito.',
    color: '#3F8A76',
  },
]

export interface ItemPresion {
  id: string
  factor: Factor
  texto: string
  efecto: Efecto
  peso: string
  fuente: string
  condicion: Condicion
}

let contador = 0
export const nuevoIdPresion = () => `nuevo-${Date.now().toString(36)}-p${contador++}`

export const itemPresionVacio = (factor: Factor, efecto: Efecto = 'presiona', texto = '', fuente = '', condicion: Condicion = 'estimado'): ItemPresion => ({
  id: nuevoIdPresion(),
  factor,
  texto,
  efecto,
  peso: '3',
  fuente,
  condicion,
})

const t = (s: string) => s.trim()
const pesoDe = (i: ItemPresion) => {
  const n = Number(i.peso)
  return Number.isFinite(n) && n >= 1 && n <= 5 ? n : 3
}
const llenos = (items: ItemPresion[]) => items.filter((i) => t(i.texto).length > 0)

export interface PuntoRadar {
  clave: Factor
  titulo: string
  corto: string
  presiona: number
  protege: number
  neto: number
}

export function calcularRadar(items: ItemPresion[]): PuntoRadar[] {
  const v = llenos(items)
  return FACTORES.map((f) => {
    const propios = v.filter((i) => i.factor === f.clave)
    const presiona = propios.filter((i) => i.efecto === 'presiona').reduce((a, i) => a + pesoDe(i), 0)
    const protege = propios.filter((i) => i.efecto === 'protege').reduce((a, i) => a + pesoDe(i), 0)
    return { clave: f.clave, titulo: f.titulo, corto: f.corto, presiona, protege, neto: protege - presiona }
  })
}

export interface Lectura {
  titulo: string
  texto: string
}

/** Dice dónde el sector más aprieta y dónde más te protege, según los pesos escritos. */
export function lecturaRadar(puntos: PuntoRadar[]): Lectura[] {
  const out: Lectura[] = []
  const conPresion = [...puntos].filter((p) => p.presiona > 0).sort((a, b) => b.presiona - a.presiona)
  const conProteccion = [...puntos].filter((p) => p.protege > 0).sort((a, b) => b.protege - a.protege)
  if (conPresion[0]) out.push({ titulo: 'Dónde el sector más te aprieta', texto: `${conPresion[0].titulo} (${conPresion[0].presiona} puntos de presión). Prepara un plan para este frente.` })
  if (conProteccion[0]) out.push({ titulo: 'Dónde el sector más te protege', texto: `${conProteccion[0].titulo} (${conProteccion[0].protege} puntos a tu favor). Cuídalo y apóyate en él.` })
  return out
}

export type NivelAlerta = 'Informativa' | 'Preventiva' | 'Importante'
export interface Alerta {
  nivel: NivelAlerta
  texto: string
}

export function alertasPresiones(items: ItemPresion[]): Alerta[] {
  const v = llenos(items)
  const out: Alerta[] = []
  if (v.length === 0) return out
  const vacios = FACTORES.filter((f) => !v.some((i) => i.factor === f.clave))
  if (vacios.length > 0 && vacios.length < FACTORES.length)
    out.push({ nivel: 'Informativa', texto: `No has escrito nada en: ${vacios.map((f) => f.titulo).join(', ')}. Si de verdad no te afecta, déjalo así; si no estás seguro, vale la pena revisarlo.` })
  const protege = v.filter((i) => i.efecto === 'protege').length
  const presiona = v.filter((i) => i.efecto === 'presiona').length
  if (v.length >= 4 && presiona === 0) out.push({ nivel: 'Preventiva', texto: 'Solo escribiste cosas que te protegen. Todo sector tiene presiones; revisa si falta alguna.' })
  if (v.length >= 4 && protege === 0) out.push({ nivel: 'Preventiva', texto: 'Solo escribiste presiones. Revisa si el sector también te protege en algo (pocos rivales, clientes fieles).' })
  const sinFuente = v.filter((i) => !t(i.fuente)).length
  if (sinFuente > 0) out.push({ nivel: 'Informativa', texto: `${sinFuente} elemento${sinFuente === 1 ? '' : 's'} no dice${sinFuente === 1 ? '' : 'n'} de dónde salió (un dato, una visita, una conversación). Respáldalos antes de presentar el análisis.` })
  return out
}

export interface Revision {
  clave: string
  texto: string
  cumple: boolean
  obligatorio: boolean
  ayuda: string
}

export function revisarPresiones(items: ItemPresion[]): Revision[] {
  const v = llenos(items)
  const factoresConDatos = new Set(v.map((i) => i.factor)).size
  return [
    { clave: 'alguno', texto: 'Hay al menos un elemento escrito.', cumple: v.length > 0, obligatorio: true, ayuda: 'Piensa en un competidor, un cliente o un proveedor que te condicione.' },
    { clave: 'ambos', texto: 'Hay al menos una presión y una protección.', cumple: v.some((i) => i.efecto === 'protege') && v.some((i) => i.efecto === 'presiona'), obligatorio: true, ayuda: 'Un análisis con un solo lado no sirve para decidir.' },
    { clave: 'cuatro', texto: 'Miraste al menos cuatro de las cinco presiones.', cumple: factoresConDatos >= 4, obligatorio: false, ayuda: 'Mientras más frentes revises, menos sorpresas.' },
    { clave: 'fuente', texto: 'Cada elemento dice de dónde salió.', cumple: v.length > 0 && v.every((i) => t(i.fuente)), obligatorio: false, ayuda: 'Un dato, una visita, una conversación con un cliente o proveedor.' },
  ]
}
