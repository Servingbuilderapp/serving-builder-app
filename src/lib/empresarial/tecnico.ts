/**
 * Estudio técnico, pantalla 1: solución y proceso — reglas simples, sin IA.
 * Responde: ¿qué se entrega exactamente? ¿con qué características? ¿en qué pasos se produce o se presta?
 * Regla de oro: no se inventan valores técnicos. Si una especificación no existe todavía, se marca
 * "pendiente" o "supuesto". Capacidad, equipos, personal y proveedores son la pantalla siguiente.
 */

import type { Condicion } from '@/lib/empresarial/formulacion'
import { num } from '@/lib/empresarial/mercadoDemanda'

export const TIPOS_SOLUCION = [
  { valor: 'fisico', etiqueta: 'Producto físico' },
  { valor: 'servicio', etiqueta: 'Servicio' },
  { valor: 'software', etiqueta: 'Software o plataforma digital' },
  { valor: 'experiencia', etiqueta: 'Experiencia o evento' },
  { valor: 'mixta', etiqueta: 'Mezcla de varios' },
]

export const ESTADOS_SOLUCION = [
  { valor: 'concepto', etiqueta: 'Es solo una idea (concepto)' },
  { valor: 'prototipo', etiqueta: 'Ya hay un prototipo' },
  { valor: 'piloto', etiqueta: 'Está en prueba piloto' },
  { valor: 'validado', etiqueta: 'Ya se comprobó que funciona' },
  { valor: 'comercial', etiqueta: 'Ya se vende' },
]

/** Ejemplos de qué características describir según el tipo de solución (ayuda, no obligación). */
export const EJEMPLOS_SPEC: Record<string, string> = {
  fisico: 'Peso, tamaño, materiales, empaque, vida útil, almacenamiento.',
  servicio: 'Duración, alcance, modalidad, frecuencia, tiempo de respuesta, entregables.',
  software: 'Funciones, usuarios al mismo tiempo, disponibilidad, seguridad, integraciones.',
  experiencia: 'Duración, cupo, lugar, materiales, condiciones de seguridad.',
  mixta: 'Describe cada parte según sea producto, servicio o digital.',
}

export const CAMPOS_TECNICO = ['descripcion', 'calidad_esperada', 'restricciones'] as const
export type CampoTecnico = (typeof CAMPOS_TECNICO)[number]

export interface Tecnico {
  tipo_solucion: string
  nombre_solucion: string
  descripcion: string
  unidad_comercializacion: string
  estado_solucion: string
  calidad_esperada: string
  restricciones: string
  condiciones: Partial<Record<CampoTecnico, Condicion>>
}

export interface Especificacion {
  id: string
  caracteristica: string
  especificacion: string
  unidad: string
  criterio: string
  condicion: Condicion
}

export interface Paso {
  id: string
  nombre: string
  responsable: string
  duracion_min: string
  entrada: string
  salida: string
  recursos: string
  condicion: Condicion
}

export const tecnicoVacio = (): Tecnico => ({
  tipo_solucion: '',
  nombre_solucion: '',
  descripcion: '',
  unidad_comercializacion: '',
  estado_solucion: '',
  calidad_esperada: '',
  restricciones: '',
  condiciones: {},
})

let contador = 0
export const nuevoIdTecnico = () => `nuevo-${Date.now().toString(36)}-t${contador++}`

export const especificacionVacia = (): Especificacion => ({
  id: nuevoIdTecnico(),
  caracteristica: '',
  especificacion: '',
  unidad: '',
  criterio: '',
  condicion: 'pendiente',
})

export const pasoVacio = (): Paso => ({
  id: nuevoIdTecnico(),
  nombre: '',
  responsable: '',
  duracion_min: '',
  entrada: '',
  salida: '',
  recursos: '',
  condicion: 'estimado',
})

const t = (s: string) => s.replace(/\s+/g, ' ').trim()
const hay = (s: string) => t(s).length > 0

/** Minutos que toma una unidad pasando por todos los pasos (suma de duraciones conocidas). */
export function tiempoTotalMin(pasos: Paso[]): number {
  return pasos.reduce((acc, p) => acc + (num(p.duracion_min) ?? 0), 0)
}

export function formatoMinutos(min: number): string {
  if (min < 60) return `${Math.round(min * 10) / 10} min`
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}

export type NivelAlerta = 'Informativa' | 'Preventiva' | 'Importante' | 'Crítica'
export interface Alerta {
  nivel: NivelAlerta
  texto: string
}

export function alertasTecnico(tc: Tecnico, specs: Especificacion[], pasos: Paso[]): Alerta[] {
  const a: Alerta[] = []
  const ps = pasos.filter((p) => hay(p.nombre))
  const ss = specs.filter((s) => hay(s.caracteristica))

  if (tc.estado_solucion === 'concepto')
    a.push({ nivel: 'Informativa', texto: 'Tu solución todavía es una idea. Antes de invertir, conviene hacer un prototipo o una prueba piloto pequeña.' })
  if (ps.length === 1)
    a.push({ nivel: 'Preventiva', texto: 'Tu proceso tiene un solo paso. Casi siempre hay más: preparar, hacer, revisar, entregar. Descríbelos para no olvidar ninguno.' })
  const sinResp = ps.filter((p) => !hay(p.responsable))
  if (sinResp.length > 0)
    a.push({ nivel: 'Importante', texto: `Estos pasos no tienen responsable: ${sinResp.map((p) => t(p.nombre)).join('; ')}. Un paso sin responsable se queda sin hacer.` })
  const sinTiempo = ps.filter((p) => !hay(p.duracion_min))
  if (sinTiempo.length > 0)
    a.push({ nivel: 'Importante', texto: `Estos pasos no tienen duración: ${sinTiempo.map((p) => t(p.nombre)).join('; ')}. Sin tiempos no se puede calcular cuánto puedes producir.` })
  const sinSalida = ps.filter((p) => !hay(p.salida))
  if (ps.length > 0 && sinSalida.length > 0)
    a.push({ nivel: 'Preventiva', texto: `Estos pasos no dicen qué producen o entregan: ${sinSalida.map((p) => t(p.nombre)).join('; ')}.` })
  const responsables = new Set(ps.filter((p) => hay(p.responsable)).map((p) => t(p.responsable).toLowerCase()))
  if (ps.length >= 3 && responsables.size === 1)
    a.push({ nivel: 'Preventiva', texto: 'Todo el proceso depende de una sola persona o área. Si falla o se enferma, se detiene todo.' })
  const pendientes = ss.filter((s) => s.condicion === 'pendiente' || s.condicion === 'supuesto')
  if (pendientes.length > 0)
    a.push({ nivel: 'Informativa', texto: `${pendientes.length === 1 ? 'Una especificación está' : `${pendientes.length} especificaciones están`} como supuesto o pendiente. Está bien al empezar; confírmalas con un proveedor, un prototipo o una norma antes de producir.` })
  return a
}

export interface Revision {
  clave: string
  texto: string
  cumple: boolean
  obligatorio: boolean
  ayuda: string
}

export function revisarTecnico(tc: Tecnico, specs: Especificacion[], pasos: Paso[]): Revision[] {
  const ss = specs.filter((s) => hay(s.caracteristica))
  const ps = pasos.filter((p) => hay(p.nombre))
  return [
    { clave: 'tipo', texto: 'Dice qué tipo de solución es.', cumple: hay(tc.tipo_solucion), obligatorio: true, ayuda: 'Producto, servicio, software, experiencia o mezcla.' },
    { clave: 'nombre', texto: 'Tiene el nombre de lo que se entrega.', cumple: hay(tc.nombre_solucion), obligatorio: true, ayuda: 'El nombre con el que lo reconocerán tus clientes.' },
    { clave: 'descripcion', texto: 'Describe qué es y para qué sirve.', cumple: hay(tc.descripcion), obligatorio: true, ayuda: 'En palabras simples, qué recibe el cliente.' },
    { clave: 'unidad', texto: 'Dice en qué unidad se vende.', cumple: hay(tc.unidad_comercializacion), obligatorio: true, ayuda: 'Por almuerzo, por hora, por licencia, por caja…' },
    { clave: 'estado', texto: 'Dice en qué estado está la solución.', cumple: hay(tc.estado_solucion), obligatorio: true, ayuda: 'Idea, prototipo, piloto, comprobada o ya se vende.' },
    { clave: 'specs', texto: 'Tiene al menos una característica con su especificación.', cumple: ss.some((s) => hay(s.especificacion)), obligatorio: true, ayuda: 'Por ejemplo: duración — 60 — minutos.' },
    { clave: 'pasos', texto: 'El proceso tiene al menos dos pasos.', cumple: ps.length >= 2, obligatorio: true, ayuda: 'Desde que llega lo necesario hasta que el cliente recibe.' },
    { clave: 'responsables', texto: 'Cada paso tiene responsable y duración.', cumple: ps.length > 0 && ps.every((p) => hay(p.responsable) && hay(p.duracion_min)), obligatorio: true, ayuda: 'Una duración aproximada basta; márcala como estimada.' },
    { clave: 'criterios', texto: 'Cada característica dice cómo saber que se cumple.', cumple: ss.length > 0 && ss.every((s) => hay(s.criterio)), obligatorio: false, ayuda: 'Ejemplo: “al menos 90 % de clientes satisfechos”.' },
    { clave: 'calidad', texto: 'Dice qué calidad se espera.', cumple: hay(tc.calidad_esperada), obligatorio: false, ayuda: 'El nivel mínimo que no vas a bajar.' },
    { clave: 'restricciones', texto: 'Dice qué limita la solución.', cumple: hay(tc.restricciones), obligatorio: false, ayuda: 'Permisos, normas, tecnología, materiales difíciles de conseguir.' },
    { clave: 'entradas', texto: 'Cada paso dice qué recibe y qué entrega.', cumple: ps.length > 0 && ps.every((p) => hay(p.entrada) && hay(p.salida)), obligatorio: false, ayuda: 'Así se ve dónde se puede atascar el proceso.' },
  ]
}

export function datosSinRespaldoTecnico(tc: Tecnico, specs: Especificacion[], pasos: Paso[]): number {
  const campos = CAMPOS_TECNICO.filter((c) => hay(tc[c]) && (tc.condiciones[c] === 'supuesto' || tc.condiciones[c] === 'pendiente')).length
  const m = (x: { condicion: Condicion }) => x.condicion === 'supuesto' || x.condicion === 'pendiente'
  return campos + specs.filter((s) => hay(s.caracteristica) && m(s)).length + pasos.filter((p) => hay(p.nombre) && m(p)).length
}
