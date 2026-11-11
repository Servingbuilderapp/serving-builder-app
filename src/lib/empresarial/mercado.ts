/**
 * Estudio de mercado (Camino A, pantalla 1) — reglas simples, sin IA.
 * Esta primera pantalla responde tres preguntas:
 *   1. ¿Qué mercado es? (qué se ofrece, a qué tipo de comprador, con qué alcance)
 *   2. ¿Dónde se puede atender realmente? (territorio)
 *   3. ¿Quiénes son los clientes? (segmentos, con sus necesidades y roles)
 * Demanda, tamaño (TAM/SAM/SOM), competencia, precios y ventas son pantallas aparte.
 *
 * Regla de oro: el borrador solo COPIA lo que la persona ya escribió en Formulación.
 * No se inventa nada.
 */

import type { Condicion } from '@/lib/empresarial/formulacion'

export const CAMPOS_MERCADO = ['descripcion_mercado', 'delimitacion', 'restricciones'] as const
export type CampoMercado = (typeof CAMPOS_MERCADO)[number]

export interface Mercado {
  producto: string
  tipo_comprador: string
  naturaleza: string
  cobertura: string
  etapa_mercado: string
  sector: string
  ubicacion: string
  atencion_remota: string
  descripcion_mercado: string
  delimitacion: string
  restricciones: string
  condiciones: Partial<Record<CampoMercado, Condicion>>
}

export interface Segmento {
  id: string
  nombre: string
  descripcion: string
  necesidades: string
  capacidad_compra: string
  barreras: string
  canales: string
  roles: string[]
  condicion: Condicion
  origen: 'persona' | 'formulacion'
}

export const TIPOS_COMPRADOR = [
  { valor: 'B2C', etiqueta: 'Personas (el comprador es una persona o familia)' },
  { valor: 'B2B', etiqueta: 'Empresas (el comprador es otra empresa)' },
  { valor: 'B2G', etiqueta: 'Gobierno o entidades públicas' },
  { valor: 'B2B2C', etiqueta: 'Empresas que llegan a personas (por medio de un intermediario)' },
  { valor: 'mixto', etiqueta: 'Mezcla de varios' },
]

export const NATURALEZAS = [
  { valor: 'bienes', etiqueta: 'Productos físicos' },
  { valor: 'servicios', etiqueta: 'Servicios' },
  { valor: 'digital', etiqueta: 'Productos digitales' },
  { valor: 'profesional', etiqueta: 'Servicios profesionales' },
  { valor: 'tecnologica', etiqueta: 'Soluciones tecnológicas' },
  { valor: 'industrial', etiqueta: 'Mercado industrial o institucional' },
]

export const COBERTURAS = [
  { valor: 'local', etiqueta: 'Local (barrio o zona)' },
  { valor: 'municipal', etiqueta: 'Un municipio o ciudad' },
  { valor: 'departamental', etiqueta: 'Un departamento' },
  { valor: 'regional', etiqueta: 'Una región' },
  { valor: 'nacional', etiqueta: 'Todo el país' },
  { valor: 'internacional', etiqueta: 'Otros países' },
]

export const ETAPAS_MERCADO = [
  { valor: 'no_se', etiqueta: 'Todavía no lo sé' },
  { valor: 'emergente', etiqueta: 'Está empezando (emergente)' },
  { valor: 'crecimiento', etiqueta: 'Está creciendo' },
  { valor: 'maduro', etiqueta: 'Ya es maduro' },
  { valor: 'transformacion', etiqueta: 'Está cambiando de forma' },
  { valor: 'contraccion', etiqueta: 'Se está reduciendo' },
]

export const ATENCION_REMOTA = [
  { valor: '', etiqueta: 'Elige una…' },
  { valor: 'si', etiqueta: 'Sí, se puede atender a distancia' },
  { valor: 'parcial', etiqueta: 'En parte' },
  { valor: 'no', etiqueta: 'No, hay que estar presente' },
]

export const ROLES = [
  { valor: 'cliente', etiqueta: 'Cliente', ayuda: 'Quien contrata o recibe el producto.' },
  { valor: 'comprador', etiqueta: 'Comprador', ayuda: 'Quien hace la compra.' },
  { valor: 'pagador', etiqueta: 'Pagador', ayuda: 'Quien pone el dinero.' },
  { valor: 'usuario', etiqueta: 'Usuario', ayuda: 'Quien lo usa todos los días.' },
  { valor: 'decisor', etiqueta: 'Decide la compra', ayuda: 'Quien dice “sí” o “no”.' },
  { valor: 'beneficiario', etiqueta: 'Beneficiario', ayuda: 'Quien recibe el beneficio, aunque no compre.' },
]

export const etiquetaDe = (lista: { valor: string; etiqueta: string }[], valor: string) =>
  lista.find((x) => x.valor === valor)?.etiqueta ?? valor

export const mercadoVacio = (): Mercado => ({
  producto: '',
  tipo_comprador: '',
  naturaleza: '',
  cobertura: '',
  etapa_mercado: 'no_se',
  sector: '',
  ubicacion: '',
  atencion_remota: '',
  descripcion_mercado: '',
  delimitacion: '',
  restricciones: '',
  condiciones: {},
})

let contador = 0
export const nuevoIdSegmento = () => `nuevo-${Date.now().toString(36)}-s${contador++}`

export const segmentoVacio = (): Segmento => ({
  id: nuevoIdSegmento(),
  nombre: '',
  descripcion: '',
  necesidades: '',
  capacidad_compra: '',
  barreras: '',
  canales: '',
  roles: [],
  condicion: 'aportado',
  origen: 'persona',
})

const t = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim()
const hay = (s: string) => t(s).length > 0

/* -------------------------------------------------------------------------- */
/* Borrador desde Formulación                                                 */
/* -------------------------------------------------------------------------- */

export interface FormulacionOrigen {
  sector: string | null
  ubicacion: string | null
  problema: string | null
  alcance: string | null
}

export interface BeneficiarioOrigen {
  texto: string
  condicion: Condicion
}

/** Copia (sin inventar) lo que ya está en Formulación: sector, lugar y beneficiarios. */
export function armarBorradorMercado(
  formulacion: FormulacionOrigen | null,
  beneficiarios: BeneficiarioOrigen[],
): { mercado: Mercado; segmentos: Segmento[] } {
  const m = mercadoVacio()
  const segmentos: Segmento[] = []
  if (formulacion) {
    m.sector = t(formulacion.sector)
    m.ubicacion = t(formulacion.ubicacion)
  }
  for (const b of beneficiarios) {
    if (!hay(b.texto)) continue
    const s = segmentoVacio()
    s.nombre = t(b.texto)
    s.condicion = b.condicion
    s.origen = 'formulacion'
    segmentos.push(s)
  }
  return { mercado: m, segmentos }
}

/* -------------------------------------------------------------------------- */
/* Revisión                                                                   */
/* -------------------------------------------------------------------------- */

export interface Revision {
  clave: string
  texto: string
  cumple: boolean
  obligatorio: boolean
  ayuda: string
}

const GENERICOS = ['todos', 'todo el mundo', 'todas las personas', 'toda la gente', 'público en general', 'publico en general', 'la gente', 'cualquiera', 'cualquier persona', 'el mercado']

/** Un segmento tan amplio que no sirve para decidir nada (“todos”, “público en general”). */
export function esSegmentoGenerico(nombre: string): boolean {
  const n = t(nombre).toLowerCase()
  return n.length > 0 && GENERICOS.some((g) => n === g || n === `${g}.`)
}

export function revisarMercado(m: Mercado, segmentos: Segmento[]): Revision[] {
  const segs = segmentos.filter((s) => hay(s.nombre))
  const sinNecesidad = segs.filter((s) => !hay(s.necesidades))
  const genericos = segs.filter((s) => esSegmentoGenerico(s.nombre))
  const sinRoles = segs.filter((s) => s.roles.length === 0)
  const sinCompra = segs.filter((s) => !hay(s.capacidad_compra))
  const sinCanal = segs.filter((s) => !hay(s.canales))
  const cobertura = m.cobertura
  const lugarFalta = cobertura !== 'internacional' && cobertura !== 'nacional' && !hay(m.ubicacion) && !hay(m.delimitacion)
  return [
    {
      clave: 'producto',
      texto: 'Dice qué producto o servicio se ofrece.',
      cumple: hay(m.producto),
      obligatorio: true,
      ayuda: 'Escribe en una frase qué vas a vender o entregar.',
    },
    {
      clave: 'tipo_comprador',
      texto: 'Dice si el comprador es una persona, una empresa o una entidad.',
      cumple: hay(m.tipo_comprador),
      obligatorio: true,
      ayuda: 'Cambia mucho cómo se investiga y cómo se vende.',
    },
    {
      clave: 'descripcion',
      texto: 'Describe el mercado (la necesidad que atiende).',
      cumple: hay(m.descripcion_mercado),
      obligatorio: true,
      ayuda: 'Cuenta qué necesidad hay y quiénes la tienen.',
    },
    {
      clave: 'cobertura',
      texto: 'Define hasta dónde llega la atención.',
      cumple: hay(m.cobertura) && !lugarFalta,
      obligatorio: true,
      ayuda: lugarFalta ? 'Elige la cobertura y escribe el lugar o la zona.' : 'Elige si es local, regional, nacional o internacional.',
    },
    {
      clave: 'segmentos',
      texto: 'Tiene al menos un grupo de clientes definido.',
      cumple: segs.length > 0,
      obligatorio: true,
      ayuda: 'Un grupo de clientes es un conjunto de personas o empresas con necesidades parecidas.',
    },
    {
      clave: 'necesidades',
      texto: 'Cada grupo de clientes tiene su necesidad escrita.',
      cumple: segs.length > 0 && sinNecesidad.length === 0,
      obligatorio: true,
      ayuda: sinNecesidad.length ? `Falta en: ${sinNecesidad.map((s) => t(s.nombre)).join('; ')}.` : 'Escribe qué necesita cada grupo.',
    },
    {
      clave: 'genericos',
      texto: 'Ningún grupo es demasiado amplio (como “todos” o “público en general”).',
      cumple: genericos.length === 0,
      obligatorio: true,
      ayuda: 'Un grupo demasiado amplio no sirve para decidir. Acótalo por edad, lugar, tamaño de empresa, sector u hábito de compra.',
    },
    {
      clave: 'delimitacion',
      texto: 'Explica la zona que realmente se puede atender.',
      cumple: hay(m.delimitacion),
      obligatorio: false,
      ayuda: 'Distancia, transporte, permisos o canales que limitan el territorio.',
    },
    {
      clave: 'remota',
      texto: 'Dice si se puede atender a distancia.',
      cumple: hay(m.atencion_remota),
      obligatorio: false,
      ayuda: 'Si se puede a distancia, el mercado puede ser más grande que tu ciudad.',
    },
    {
      clave: 'roles',
      texto: 'Cada grupo dice quién compra, quién usa y quién paga.',
      cumple: segs.length > 0 && sinRoles.length === 0,
      obligatorio: false,
      ayuda: 'A veces quien usa no es quien paga. Márcalo en cada grupo.',
    },
    {
      clave: 'compra',
      texto: 'Cada grupo dice cuánto podría pagar o gastar.',
      cumple: segs.length > 0 && sinCompra.length === 0,
      obligatorio: false,
      ayuda: 'Una idea aproximada basta por ahora; márcala como estimada o supuesta.',
    },
    {
      clave: 'canales',
      texto: 'Cada grupo dice por dónde se le puede llegar.',
      cumple: segs.length > 0 && sinCanal.length === 0,
      obligatorio: false,
      ayuda: 'Por ejemplo: redes sociales, visitas, referidos, ferias, convocatorias.',
    },
    {
      clave: 'etapa',
      texto: 'Dice en qué etapa está el mercado.',
      cumple: m.etapa_mercado !== '' && m.etapa_mercado !== 'no_se',
      obligatorio: false,
      ayuda: 'Solo elige una si tienes algo que lo respalde. “Todavía no lo sé” es una respuesta válida.',
    },
  ]
}

/** Cuántos datos siguen sin respaldo (supuesto o pendiente). Sirve para avisar. */
export function datosSinRespaldoMercado(m: Mercado, segmentos: Segmento[]): number {
  const campos = CAMPOS_MERCADO.filter((c) => hay(m[c]) && (m.condiciones[c] === 'supuesto' || m.condiciones[c] === 'pendiente')).length
  const segs = segmentos.filter((s) => hay(s.nombre) && (s.condicion === 'supuesto' || s.condicion === 'pendiente')).length
  return campos + segs
}
