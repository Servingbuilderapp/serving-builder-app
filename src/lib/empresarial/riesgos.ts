/**
 * Termómetro de Riesgos (Camino A) — lo escribe la persona; el sistema solo multiplica, ordena y avisa.
 * Sin IA y sin datos inventados. Cada riesgo tiene qué tan probable es (1 a 5) y cuánto dolería (1 a 5).
 * Puntaje = probabilidad × impacto (1 a 25). Se dibuja en un mapa de calor de 5 × 5.
 */

import type { Condicion } from '@/lib/empresarial/formulacion'

export type Categoria = 'mercado' | 'operacion' | 'dinero' | 'personas' | 'leyes' | 'tecnologia' | 'entorno'
export type Respuesta = 'evitarlo' | 'reducirlo' | 'compartirlo' | 'aceptarlo'

export const CATEGORIAS: { clave: Categoria; titulo: string; pista: string; ejemplo: string }[] = [
  { clave: 'mercado', titulo: 'Mercado y clientes', pista: 'Que los clientes no compren, compren menos o se vayan.', ejemplo: 'Dos restaurantes compran la mitad de mi producción y podrían irse.' },
  { clave: 'operacion', titulo: 'Operación', pista: 'Que algo falle al producir, entregar o atender.', ejemplo: 'El horno se daña y no hay otro.' },
  { clave: 'dinero', titulo: 'Dinero', pista: 'Que falte plata, suban los costos o tarden en pagarte.', ejemplo: 'La harina sube de precio y no puedo subir el pan.' },
  { clave: 'personas', titulo: 'Personas', pista: 'Que falte alguien clave, o haya conflictos en el equipo.', ejemplo: 'Mi único panadero experto renuncia.' },
  { clave: 'leyes', titulo: 'Leyes y permisos', pista: 'Que un permiso, norma o trámite te frene o te cueste más.', ejemplo: 'No me renuevan el registro sanitario a tiempo.' },
  { clave: 'tecnologia', titulo: 'Tecnología', pista: 'Que un sistema, equipo digital o dato se pierda o falle.', ejemplo: 'Se pierde la lista de pedidos del celular.' },
  { clave: 'entorno', titulo: 'Entorno', pista: 'Que algo externo te afecte: clima, orden público, crisis económica.', ejemplo: 'Una lluvia fuerte bloquea la vía de los repartos.' },
]

export const RESPUESTAS: { clave: Respuesta; etiqueta: string; ayuda: string }[] = [
  { clave: 'evitarlo', etiqueta: 'Evitarlo', ayuda: 'Cambias algo para que no pueda pasar.' },
  { clave: 'reducirlo', etiqueta: 'Reducirlo', ayuda: 'Haces algo para que sea menos probable o duela menos.' },
  { clave: 'compartirlo', etiqueta: 'Compartirlo', ayuda: 'Lo pasas a otro: un seguro, un contrato, un socio.' },
  { clave: 'aceptarlo', etiqueta: 'Vivir con él', ayuda: 'Decides no hacer nada y asumir lo que pase.' },
]
export const etiquetaRespuesta = (r: string) => RESPUESTAS.find((x) => x.clave === r)?.etiqueta ?? r
export const tituloCategoria = (c: string) => CATEGORIAS.find((x) => x.clave === c)?.titulo ?? c

export interface ItemRiesgo {
  id: string
  categoria: Categoria
  texto: string
  probabilidad: string
  impacto: string
  respuesta: Respuesta | ''
  plan: string
  responsable: string
  fuente: string
  condicion: Condicion
}

let contador = 0
export const nuevoIdRiesgo = () => `nuevo-${Date.now().toString(36)}-r${contador++}`

export const itemRiesgoVacio = (categoria: Categoria = 'mercado'): ItemRiesgo => ({
  id: nuevoIdRiesgo(),
  categoria,
  texto: '',
  probabilidad: '3',
  impacto: '3',
  respuesta: '',
  plan: '',
  responsable: '',
  fuente: '',
  condicion: 'estimado',
})

const t = (s: string) => s.trim()
const num = (s: string) => {
  const n = Number(s)
  return Number.isFinite(n) && n >= 1 && n <= 5 ? n : 3
}
export const llenosRiesgo = (items: ItemRiesgo[]) => items.filter((i) => t(i.texto).length > 0)
export const puntajeRiesgo = (i: ItemRiesgo) => num(i.probabilidad) * num(i.impacto)

export type Nivel = 'Bajo' | 'Moderado' | 'Alto' | 'Crítico'
export const nivelDe = (puntaje: number): Nivel => (puntaje >= 15 ? 'Crítico' : puntaje >= 10 ? 'Alto' : puntaje >= 5 ? 'Moderado' : 'Bajo')
export const COLOR_NIVEL: Record<Nivel, string> = { Bajo: '#3F8A76', Moderado: '#C9A44A', Alto: '#D9822B', Crítico: '#C4403A' }

export interface RiesgoOrdenado {
  item: ItemRiesgo
  numero: number
  puntaje: number
  nivel: Nivel
}

/** Del más grave al más leve. El número es el que se ve dentro del mapa de calor. */
export function ordenarRiesgos(items: ItemRiesgo[]): RiesgoOrdenado[] {
  return llenosRiesgo(items)
    .map((item) => ({ item, puntaje: puntajeRiesgo(item), nivel: nivelDe(puntajeRiesgo(item)) }))
    .sort((a, b) => b.puntaje - a.puntaje)
    .map((x, i) => ({ ...x, numero: i + 1 }))
}

export interface Conteo {
  nivel: Nivel
  cantidad: number
}
export function contarPorNivel(items: ItemRiesgo[]): Conteo[] {
  const o = ordenarRiesgos(items)
  return (['Crítico', 'Alto', 'Moderado', 'Bajo'] as Nivel[]).map((nivel) => ({ nivel, cantidad: o.filter((x) => x.nivel === nivel).length }))
}

export interface Lectura {
  titulo: string
  texto: string
}

/** Dice cuál es el nivel más alto que aparece y cuál es el riesgo que más pesa. */
export function lecturaRiesgos(items: ItemRiesgo[]): Lectura[] {
  const o = ordenarRiesgos(items)
  if (o.length === 0) return []
  const top = o[0]
  const graves = o.filter((x) => x.nivel === 'Crítico' || x.nivel === 'Alto').length
  const out: Lectura[] = [{ titulo: 'El riesgo que más pesa', texto: `${top.item.texto.trim()} (${top.puntaje} de 25, nivel ${top.nivel.toLowerCase()}).` }]
  out.push({ titulo: 'Riesgos altos o críticos', texto: graves === 0 ? 'Ninguno por ahora. Revisa que no falte alguno que no quisiste ver.' : `${graves} de ${o.length}. Estos son los primeros que necesitan un plan.` })
  return out
}

export type NivelAlerta = 'Informativa' | 'Preventiva' | 'Importante'
export interface Alerta {
  nivel: NivelAlerta
  texto: string
}

export function alertasRiesgos(items: ItemRiesgo[]): Alerta[] {
  const v = llenosRiesgo(items)
  const out: Alerta[] = []
  if (v.length === 0) return out
  const graves = v.filter((i) => puntajeRiesgo(i) >= 10)
  const sinPlan = graves.filter((i) => !t(i.plan) && i.respuesta !== 'aceptarlo')
  if (sinPlan.length > 0) out.push({ nivel: 'Importante', texto: `${sinPlan.length} riesgo${sinPlan.length === 1 ? '' : 's'} alto${sinPlan.length === 1 ? '' : 's'} o crítico${sinPlan.length === 1 ? '' : 's'} no tiene${sinPlan.length === 1 ? '' : 'n'} plan. Escribe qué harás, o marca “Vivir con él” si decides asumirlo.` })
  const sinDueno = graves.filter((i) => !t(i.responsable))
  if (sinDueno.length > 0) out.push({ nivel: 'Preventiva', texto: `${sinDueno.length} riesgo${sinDueno.length === 1 ? '' : 's'} alto${sinDueno.length === 1 ? '' : 's'} o crítico${sinDueno.length === 1 ? '' : 's'} no tiene${sinDueno.length === 1 ? '' : 'n'} responsable. Un riesgo sin responsable casi nunca se atiende.` })
  const asumidos = graves.filter((i) => i.respuesta === 'aceptarlo')
  if (asumidos.length > 0) out.push({ nivel: 'Preventiva', texto: `Decidiste vivir con ${asumidos.length} riesgo${asumidos.length === 1 ? '' : 's'} alto${asumidos.length === 1 ? '' : 's'} o crítico${asumidos.length === 1 ? '' : 's'}. Confirma que el negocio aguanta si ocurre.` })
  const cats = new Set(v.map((i) => i.categoria)).size
  if (v.length >= 3 && cats < 3) out.push({ nivel: 'Informativa', texto: 'Tus riesgos están en pocos temas. Revisa los otros tipos (dinero, personas, leyes, tecnología…): suelen esconder sorpresas.' })
  const todosBajos = v.length >= 4 && v.every((i) => puntajeRiesgo(i) < 10)
  if (todosBajos) out.push({ nivel: 'Preventiva', texto: 'Todos tus riesgos salen bajos o moderados. Todo negocio tiene alguno que duele de verdad; revisa si falta uno.' })
  const flojos = v.filter((i) => i.condicion === 'supuesto' || i.condicion === 'pendiente').length
  if (flojos > 0) out.push({ nivel: 'Informativa', texto: `${flojos} riesgo${flojos === 1 ? '' : 's'} está${flojos === 1 ? '' : 'n'} como supuesto o pendiente. Compruébalo${flojos === 1 ? '' : 's'}: la probabilidad y el impacto son lo que más se suele calcular mal.` })
  const sinFuente = v.filter((i) => !t(i.fuente)).length
  if (sinFuente > 0) out.push({ nivel: 'Informativa', texto: `${sinFuente} riesgo${sinFuente === 1 ? '' : 's'} no dice${sinFuente === 1 ? '' : 'n'} de dónde salió (algo que ya te pasó, una conversación, un dato del sector).` })
  return out
}

export interface Revision {
  clave: string
  texto: string
  cumple: boolean
  obligatorio: boolean
  ayuda: string
}

export function revisarRiesgos(items: ItemRiesgo[]): Revision[] {
  const v = llenosRiesgo(items)
  const graves = v.filter((i) => puntajeRiesgo(i) >= 10)
  const cats = new Set(v.map((i) => i.categoria)).size
  return [
    { clave: 'alguno', texto: 'Escribiste al menos tres riesgos.', cumple: v.length >= 3, obligatorio: true, ayuda: 'Piensa qué te quitaría el sueño: dinero, clientes, permisos, personas.' },
    { clave: 'plan', texto: 'Cada riesgo alto o crítico tiene plan o fue asumido a propósito.', cumple: graves.every((i) => t(i.plan) || i.respuesta === 'aceptarlo'), obligatorio: true, ayuda: 'Escribe qué harías para evitarlo, reducirlo o compartirlo.' },
    { clave: 'dueno', texto: 'Cada riesgo alto o crítico tiene responsable.', cumple: graves.every((i) => t(i.responsable)), obligatorio: false, ayuda: 'Una persona con nombre, aunque seas tú.' },
    { clave: 'tres', texto: 'Miraste al menos tres tipos de riesgo.', cumple: cats >= 3, obligatorio: false, ayuda: 'Mercado, dinero, personas, leyes, tecnología, entorno, operación.' },
    { clave: 'fuente', texto: 'Cada riesgo dice de dónde salió.', cumple: v.length > 0 && v.every((i) => t(i.fuente)), obligatorio: false, ayuda: 'Algo que ya te pasó, una conversación, un dato del sector.' },
  ]
}
