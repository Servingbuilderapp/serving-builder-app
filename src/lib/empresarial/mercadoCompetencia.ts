/**
 * Estudio de mercado, pantalla 3: competencia, precios y canales — reglas simples, sin IA.
 * Regla de oro: no se inventan competidores, precios ni fuentes. Cada competidor lleva su fuente y
 * la fecha en que se consultó. Siempre hay alternativas: si nadie ofrece lo mismo, el cliente hoy
 * usa algo parecido, lo hace solo o no lo resuelve.
 */

import type { Condicion } from '@/lib/empresarial/formulacion'
import { num } from '@/lib/empresarial/mercadoDemanda'

export const TIPOS_COMPETIDOR = [
  { valor: 'directo', etiqueta: 'Directo (ofrece casi lo mismo)' },
  { valor: 'indirecto', etiqueta: 'Indirecto (resuelve lo mismo de otra forma)' },
  { valor: 'sustituto', etiqueta: 'Sustituto (otro producto que lo reemplaza)' },
  { valor: 'autoprovision', etiqueta: 'El cliente lo hace solo' },
  { valor: 'informal', etiqueta: 'Informal o gratuito' },
]

export const METODOS_PRECIO = [
  { valor: 'costos', etiqueta: 'Según mis costos más un margen' },
  { valor: 'competencia', etiqueta: 'Según lo que cobra la competencia' },
  { valor: 'valor', etiqueta: 'Según el valor que recibe el cliente' },
  { valor: 'suscripcion', etiqueta: 'Suscripción (pago periódico)' },
  { valor: 'uso', etiqueta: 'Según el uso' },
  { valor: 'proyecto', etiqueta: 'Por proyecto' },
  { valor: 'volumen', etiqueta: 'Por volumen' },
  { valor: 'escalonado', etiqueta: 'Por niveles' },
]

export const TIPOS_CANAL = [
  { valor: 'venta_directa', etiqueta: 'Venta directa (visitas, llamadas)' },
  { valor: 'punto_fisico', etiqueta: 'Punto físico' },
  { valor: 'tienda_en_linea', etiqueta: 'Tienda en línea' },
  { valor: 'redes_sociales', etiqueta: 'Redes sociales' },
  { valor: 'marketplace', etiqueta: 'Plataformas de venta (marketplace)' },
  { valor: 'distribuidor', etiqueta: 'Distribuidor o intermediario' },
  { valor: 'alianza', etiqueta: 'Alianzas o referidos' },
  { valor: 'venta_institucional', etiqueta: 'Venta a entidades' },
  { valor: 'suscripcion', etiqueta: 'Suscripción' },
  { valor: 'venta_consultiva', etiqueta: 'Venta consultiva (asesorando)' },
  { valor: 'otro', etiqueta: 'Otro' },
]

export interface Competidor {
  id: string
  nombre: string
  tipo: string
  ubicacion: string
  producto: string
  precio: string
  unidad_precio: string
  fortalezas: string
  debilidades: string
  fuente: string
  fecha_consulta: string
  condicion: Condicion
}

export interface Canal {
  id: string
  tipo: string
  descripcion: string
  costo_adquisicion: string
  conversion: string
  condicion: Condicion
}

export const CAMPOS_PRECIO = ['justificacion', 'disposicion_pago'] as const
export type CampoPrecio = (typeof CAMPOS_PRECIO)[number]

export interface Precio {
  precio: string
  unidad_precio: string
  costo_unitario: string
  metodo: string
  justificacion: string
  disposicion_pago: string
  condiciones: Partial<Record<CampoPrecio, Condicion>>
}

export const precioVacio = (): Precio => ({
  precio: '',
  unidad_precio: '',
  costo_unitario: '',
  metodo: '',
  justificacion: '',
  disposicion_pago: '',
  condiciones: {},
})

let contador = 0
export const nuevoIdMercado = () => `nuevo-${Date.now().toString(36)}-m${contador++}`

export const competidorVacio = (): Competidor => ({
  id: nuevoIdMercado(),
  nombre: '',
  tipo: 'directo',
  ubicacion: '',
  producto: '',
  precio: '',
  unidad_precio: '',
  fortalezas: '',
  debilidades: '',
  fuente: '',
  fecha_consulta: '',
  condicion: 'aportado',
})

export const canalVacio = (): Canal => ({
  id: nuevoIdMercado(),
  tipo: 'redes_sociales',
  descripcion: '',
  costo_adquisicion: '',
  conversion: '',
  condicion: 'supuesto',
})

const t = (s: string) => s.replace(/\s+/g, ' ').trim()
const hay = (s: string) => t(s).length > 0

export type NivelAlerta = 'Informativa' | 'Preventiva' | 'Importante' | 'Crítica'
export interface Alerta {
  nivel: NivelAlerta
  texto: string
}

/** Margen por unidad: (precio − costo) / precio. Solo si hay ambos datos y el precio es mayor que cero. */
export function margen(p: Precio): number | null {
  const pr = num(p.precio)
  const co = num(p.costo_unitario)
  if (pr === null || co === null || pr <= 0) return null
  return (pr - co) / pr
}

export function alertasCompetencia(p: Precio, competidores: Competidor[], canales: Canal[]): Alerta[] {
  const a: Alerta[] = []
  const comps = competidores.filter((c) => hay(c.nombre))
  const pr = num(p.precio)
  const co = num(p.costo_unitario)

  if (pr !== null && co !== null && pr < co)
    a.push({ nivel: 'Crítica', texto: 'El precio es menor que el costo por unidad: cada venta te haría perder dinero. Sube el precio o baja el costo.' })
  if (comps.length === 0)
    a.push({ nivel: 'Importante', texto: 'No has registrado ninguna alternativa. Siempre hay alguna: otro proveedor, un sustituto, que el cliente lo haga solo o que no lo resuelva. Anótala.' })
  else if (!comps.some((c) => c.tipo === 'directo'))
    a.push({ nivel: 'Preventiva', texto: 'No registraste competencia directa. Es poco común que nadie ofrezca algo parecido; revisa que no estés ignorando a alguien relevante.' })

  const sinFuente = comps.filter((c) => c.tipo !== 'autoprovision' && (!hay(c.fuente) || !hay(c.fecha_consulta)))
  if (sinFuente.length > 0)
    a.push({ nivel: 'Importante', texto: `Falta la fuente o la fecha de consulta en: ${sinFuente.map((c) => t(c.nombre)).join('; ')}. Sin eso, el dato no se puede comprobar.` })

  const precios = comps.map((c) => num(c.precio)).filter((x): x is number => x !== null && x > 0)
  if (pr !== null && precios.length >= 2) {
    const min = Math.min(...precios)
    const max = Math.max(...precios)
    if ((pr < min || pr > max) && !hay(p.justificacion))
      a.push({ nivel: 'Importante', texto: 'Tu precio está fuera del rango de lo que cobran los demás y no explicas por qué. Cuenta qué lo justifica.' })
  }
  if (pr !== null && co === null)
    a.push({ nivel: 'Informativa', texto: 'Sin el costo por unidad no se sabe cuánto te deja cada venta. El estudio financiero te lo va a pedir.' })
  if (hay(p.disposicion_pago) && (p.condiciones.disposicion_pago ?? 'aportado') !== 'verificado')
    a.push({ nivel: 'Informativa', texto: 'Lo que la gente dice que pagaría no es lo mismo que lo que paga. Una preventa o un pedido real valen más que una opinión.' })
  if (canales.filter((c) => hay(c.descripcion)).some((c) => c.condicion === 'supuesto' || c.condicion === 'pendiente'))
    a.push({ nivel: 'Preventiva', texto: 'Algún canal está marcado como supuesto o pendiente. Pruébalo en pequeño antes de apoyar tus ventas en él.' })
  return a
}

export interface Revision {
  clave: string
  texto: string
  cumple: boolean
  obligatorio: boolean
  ayuda: string
}

export function revisarCompetencia(p: Precio, competidores: Competidor[], canales: Canal[]): Revision[] {
  const comps = competidores.filter((c) => hay(c.nombre))
  const cans = canales.filter((c) => hay(c.descripcion))
  return [
    { clave: 'alternativas', texto: 'Tiene al menos una alternativa que el cliente usa hoy.', cumple: comps.length > 0, obligatorio: true, ayuda: 'Puede ser un competidor, un sustituto o “el cliente lo hace solo”.' },
    { clave: 'fuentes', texto: 'Cada competidor tiene su fuente y fecha de consulta.', cumple: comps.length > 0 && comps.every((c) => c.tipo === 'autoprovision' || (hay(c.fuente) && hay(c.fecha_consulta))), obligatorio: true, ayuda: 'Una página web, una visita, una cotización, una llamada.' },
    { clave: 'precio', texto: 'Tiene el precio propuesto y su unidad.', cumple: hay(p.precio) && hay(p.unidad_precio), obligatorio: true, ayuda: 'Ejemplo: 15.000 por almuerzo, 80.000 por mes.' },
    { clave: 'justificacion', texto: 'Explica por qué ese precio.', cumple: hay(p.justificacion), obligatorio: true, ayuda: 'Costos, competencia o valor que recibe el cliente.' },
    { clave: 'canales', texto: 'Tiene al menos un canal para llegar a los clientes.', cumple: cans.length > 0, obligatorio: true, ayuda: 'Por dónde vas a conseguir tus primeros clientes.' },
    { clave: 'coherencia', texto: 'El precio no es menor que el costo.', cumple: alertasCompetencia(p, competidores, canales).every((x) => x.nivel !== 'Crítica'), obligatorio: true, ayuda: 'Revisa las alertas.' },
    { clave: 'costo', texto: 'Dice cuánto le cuesta cada unidad.', cumple: hay(p.costo_unitario), obligatorio: false, ayuda: 'Una cifra aproximada basta; se afina en el estudio financiero.' },
    { clave: 'metodo', texto: 'Dice cómo fijó el precio.', cumple: hay(p.metodo), obligatorio: false, ayuda: 'Por costos, por competencia o por valor.' },
    { clave: 'disposicion', texto: 'Cuenta qué muestra que el cliente pagaría ese precio.', cumple: hay(p.disposicion_pago), obligatorio: false, ayuda: 'Preventas, pedidos, conversaciones con clientes.' },
    { clave: 'diferencia', texto: 'Cada competidor dice en qué es fuerte y en qué es débil.', cumple: comps.length > 0 && comps.every((c) => c.tipo === 'autoprovision' || (hay(c.fortalezas) && hay(c.debilidades))), obligatorio: false, ayuda: 'De ahí sale tu diferencia.' },
    { clave: 'costo_canal', texto: 'Cada canal dice cuánto cuesta conseguir un cliente.', cumple: cans.length > 0 && cans.every((c) => hay(c.costo_adquisicion)), obligatorio: false, ayuda: 'Aproximado y marcado como estimado.' },
  ]
}

export function datosSinRespaldoCompetencia(p: Precio, competidores: Competidor[], canales: Canal[]): number {
  const campos = CAMPOS_PRECIO.filter((c) => hay(p[c]) && (p.condiciones[c] === 'supuesto' || p.condiciones[c] === 'pendiente')).length
  const m = (x: { condicion: Condicion }) => x.condicion === 'supuesto' || x.condicion === 'pendiente'
  return campos + competidores.filter((c) => hay(c.nombre) && m(c)).length + canales.filter((c) => hay(c.descripcion) && m(c)).length
}
