/**
 * Radar del Entorno (Camino A) — lo escribe la persona; el sistema solo suma pesos y dibuja.
 * Sin IA y sin datos inventados. Seis factores de afuera; cada elemento ayuda o perjudica y pesa de 1 a 5.
 */

import type { Condicion } from '@/lib/empresarial/formulacion'

export type Factor = 'politica' | 'economia' | 'sociedad' | 'tecnologia' | 'ambiente' | 'normas'
export type Efecto = 'ayuda' | 'perjudica'

export interface GuiaFactor {
  clave: Factor
  titulo: string
  pista: string
  preguntas: string[]
  ejemplo: string
  color: string
}

export const FACTORES: GuiaFactor[] = [
  {
    clave: 'politica',
    titulo: 'Política y gobierno',
    pista: 'Decisiones de gobiernos y entidades públicas que tocan tu negocio.',
    preguntas: ['¿Hay programas o subsidios para tu sector?', '¿Qué cambia con las autoridades de tu ciudad o región?', '¿Hay conflictos o inestabilidad que te afecten?'],
    ejemplo: 'La alcaldía abrió una línea de apoyo a panaderías de barrio.',
    color: '#7E5FB0',
  },
  {
    clave: 'economia',
    titulo: 'Economía',
    pista: 'Precios, dinero, empleo y consumo: lo que hace que la gente compre o no.',
    preguntas: ['¿Suben o bajan los precios de tus insumos?', '¿Cómo están los ingresos de tus clientes?', '¿Hay crédito disponible y a qué costo?'],
    ejemplo: 'El dólar subió y el trigo importado cuesta más.',
    color: '#B08D57',
  },
  {
    clave: 'sociedad',
    titulo: 'Sociedad y cultura',
    pista: 'Costumbres, hábitos y cambios en la gente de tu territorio.',
    preguntas: ['¿Qué está cambiando en lo que la gente consume?', '¿Cambia la edad o el tamaño de las familias?', '¿Hay modas o valores que te favorecen o te estorban?'],
    ejemplo: 'Cada vez más gente pide productos sin azúcar.',
    color: '#C4604F',
  },
  {
    clave: 'tecnologia',
    titulo: 'Tecnología',
    pista: 'Herramientas nuevas que cambian cómo se produce, se vende o se cobra.',
    preguntas: ['¿Hay herramientas que bajan tus costos?', '¿Tus clientes compran por internet o por mensajería?', '¿Qué podría dejar tu producto obsoleto?'],
    ejemplo: 'Los pedidos por WhatsApp ya son la mitad de las ventas del sector.',
    color: '#4A6FB5',
  },
  {
    clave: 'ambiente',
    titulo: 'Ambiente y clima',
    pista: 'Clima, recursos naturales y cuidado del ambiente.',
    preguntas: ['¿El clima afecta lo que produces o vendes?', '¿Hay escasez de agua, energía o materias primas?', '¿Tus clientes valoran lo sostenible?'],
    ejemplo: 'Las lluvias fuertes cortan las vías y demoran los insumos.',
    color: '#3F8A76',
  },
  {
    clave: 'normas',
    titulo: 'Leyes y normas',
    pista: 'Permisos, impuestos, reglas sanitarias o laborales que debes cumplir.',
    preguntas: ['¿Qué permisos o registros necesitas?', '¿Hay normas nuevas por venir?', '¿Qué impuestos o requisitos pesan en tu actividad?'],
    ejemplo: 'Se exige registro sanitario para vender alimentos empacados.',
    color: '#A38A2E',
  },
]

export interface ItemEntorno {
  id: string
  factor: Factor
  texto: string
  efecto: Efecto
  peso: string
  fuente: string
  condicion: Condicion
}

let contador = 0
export const nuevoIdEntorno = () => `nuevo-${Date.now().toString(36)}-e${contador++}`

export const itemEntornoVacio = (factor: Factor, efecto: Efecto = 'ayuda', texto = '', fuente = '', condicion: Condicion = 'estimado'): ItemEntorno => ({
  id: nuevoIdEntorno(),
  factor,
  texto,
  efecto,
  peso: '3',
  fuente,
  condicion,
})

const t = (s: string) => s.trim()
const pesoDe = (i: ItemEntorno) => {
  const n = Number(i.peso)
  return Number.isFinite(n) && n >= 1 && n <= 5 ? n : 3
}
const llenos = (items: ItemEntorno[]) => items.filter((i) => t(i.texto).length > 0)

export interface PuntoRadar {
  clave: Factor
  titulo: string
  ayuda: number
  perjudica: number
  neto: number
}

export function calcularRadar(items: ItemEntorno[]): PuntoRadar[] {
  const v = llenos(items)
  return FACTORES.map((f) => {
    const propios = v.filter((i) => i.factor === f.clave)
    const ayuda = propios.filter((i) => i.efecto === 'ayuda').reduce((a, i) => a + pesoDe(i), 0)
    const perjudica = propios.filter((i) => i.efecto === 'perjudica').reduce((a, i) => a + pesoDe(i), 0)
    return { clave: f.clave, titulo: f.titulo, ayuda, perjudica, neto: ayuda - perjudica }
  })
}

export interface Lectura {
  titulo: string
  texto: string
}

/** Dice dónde el entorno más ayuda y dónde más perjudica, según los pesos escritos. */
export function lecturaRadar(puntos: PuntoRadar[]): Lectura[] {
  const out: Lectura[] = []
  const conAyuda = [...puntos].filter((p) => p.ayuda > 0).sort((a, b) => b.ayuda - a.ayuda)
  const conDano = [...puntos].filter((p) => p.perjudica > 0).sort((a, b) => b.perjudica - a.perjudica)
  if (conAyuda[0]) out.push({ titulo: 'Donde el entorno más te ayuda', texto: `${conAyuda[0].titulo} (${conAyuda[0].ayuda} puntos a favor). Piensa cómo aprovecharlo.` })
  if (conDano[0]) out.push({ titulo: 'Donde el entorno más te perjudica', texto: `${conDano[0].titulo} (${conDano[0].perjudica} puntos en contra). Prepara un plan para este frente.` })
  return out
}

export type NivelAlerta = 'Informativa' | 'Preventiva' | 'Importante'
export interface Alerta {
  nivel: NivelAlerta
  texto: string
}

export function alertasEntorno(items: ItemEntorno[]): Alerta[] {
  const v = llenos(items)
  const out: Alerta[] = []
  if (v.length === 0) return out
  const vacios = FACTORES.filter((f) => !v.some((i) => i.factor === f.clave))
  if (vacios.length > 0 && vacios.length < FACTORES.length)
    out.push({ nivel: 'Informativa', texto: `No has escrito nada en: ${vacios.map((f) => f.titulo).join(', ')}. Si de verdad no te afecta, déjalo así; si no estás seguro, vale la pena revisarlo.` })
  const ayuda = v.filter((i) => i.efecto === 'ayuda').length
  const dano = v.filter((i) => i.efecto === 'perjudica').length
  if (v.length >= 4 && dano === 0) out.push({ nivel: 'Preventiva', texto: 'Solo escribiste cosas que te ayudan. Casi todo negocio tiene riesgos afuera; revisa si falta alguno.' })
  if (v.length >= 4 && ayuda === 0) out.push({ nivel: 'Preventiva', texto: 'Solo escribiste cosas que te perjudican. Revisa si hay también cambios del entorno que te favorezcan.' })
  const sinFuente = v.filter((i) => !t(i.fuente)).length
  if (sinFuente > 0) out.push({ nivel: 'Informativa', texto: `${sinFuente} elemento${sinFuente === 1 ? '' : 's'} no dice${sinFuente === 1 ? '' : 'n'} de dónde salió (una noticia, una norma, un dato). Respáldalos antes de presentar el análisis.` })
  return out
}

export interface Revision {
  clave: string
  texto: string
  cumple: boolean
  obligatorio: boolean
  ayuda: string
}

export function revisarEntorno(items: ItemEntorno[]): Revision[] {
  const v = llenos(items)
  const factoresConDatos = new Set(v.map((i) => i.factor)).size
  return [
    { clave: 'alguno', texto: 'Hay al menos un elemento escrito.', cumple: v.length > 0, obligatorio: true, ayuda: 'Piensa en algo de afuera que cambie tu negocio.' },
    { clave: 'ambos', texto: 'Hay al menos una cosa que ayuda y una que perjudica.', cumple: v.some((i) => i.efecto === 'ayuda') && v.some((i) => i.efecto === 'perjudica'), obligatorio: true, ayuda: 'Un análisis con un solo lado no sirve para decidir.' },
    { clave: 'cuatro', texto: 'Miraste al menos cuatro de los seis factores.', cumple: factoresConDatos >= 4, obligatorio: false, ayuda: 'Mientras más frentes revises, menos sorpresas.' },
    { clave: 'fuente', texto: 'Cada elemento dice de dónde salió.', cumple: v.length > 0 && v.every((i) => t(i.fuente)), obligatorio: false, ayuda: 'Una noticia, una norma, un dato, una conversación.' },
  ]
}
