/**
 * Financiero básico (Camino A) — motor de cálculo determinístico, sin IA.
 * Todo se calcula con las cifras que la persona escribe; nada se inventa. Los resultados no se
 * guardan: se recalculan siempre, así no se desactualizan.
 *
 *   margen por unidad       = precio − costo variable
 *   utilidad mensual        = unidades × margen − costos fijos mensuales
 *   punto de equilibrio     = costos fijos ÷ margen por unidad   (unidades al mes)
 *   meses de recuperación   = inversión inicial ÷ utilidad mensual (solo si la utilidad es positiva)
 */

import type { Condicion } from '@/lib/empresarial/formulacion'
import { num } from '@/lib/empresarial/mercadoDemanda'

export type TipoItem = 'inversion' | 'costo_fijo'

export const CATEGORIAS_INVERSION = [
  { valor: 'equipos', etiqueta: 'Equipos y maquinaria' },
  { valor: 'tecnologia', etiqueta: 'Tecnología y software' },
  { valor: 'adecuaciones', etiqueta: 'Adecuaciones del lugar' },
  { valor: 'inventario', etiqueta: 'Primer inventario o materiales' },
  { valor: 'preoperativos', etiqueta: 'Trámites y gastos antes de empezar' },
  { valor: 'otro', etiqueta: 'Otro' },
]

export const CATEGORIAS_COSTO_FIJO = [
  { valor: 'personal', etiqueta: 'Personal' },
  { valor: 'arriendo', etiqueta: 'Arriendo y servicios' },
  { valor: 'tecnologia', etiqueta: 'Tecnología y licencias' },
  { valor: 'comercial', etiqueta: 'Publicidad y ventas' },
  { valor: 'administrativo', etiqueta: 'Administración y contabilidad' },
  { valor: 'otro', etiqueta: 'Otro' },
]

export interface ItemFinanciero {
  id: string
  tipo: TipoItem
  concepto: string
  categoria: string
  valor: string
  fuente: string
  condicion: Condicion
}

export interface Financiero {
  precio_unitario: string
  costo_variable_unitario: string
  unidades_mes: string
  unidades_fuente: string
  unidades_condicion: Condicion
  aporte_propio: string
}

export const financieroVacio = (): Financiero => ({
  precio_unitario: '',
  costo_variable_unitario: '',
  unidades_mes: '',
  unidades_fuente: '',
  unidades_condicion: 'supuesto',
  aporte_propio: '',
})

let contador = 0
export const nuevoIdFin = () => `nuevo-${Date.now().toString(36)}-f${contador++}`

export const itemVacio = (tipo: TipoItem): ItemFinanciero => ({
  id: nuevoIdFin(),
  tipo,
  concepto: '',
  categoria: 'otro',
  valor: '',
  fuente: '',
  condicion: 'estimado',
})

const t = (s: string) => s.replace(/\s+/g, ' ').trim()
const hay = (s: string) => t(s).length > 0

const suma = (items: ItemFinanciero[], tipo: TipoItem) =>
  items.filter((i) => i.tipo === tipo && hay(i.concepto)).reduce((acc, i) => acc + (num(i.valor) ?? 0), 0)

export interface Resultado {
  inversion: number
  fijosMes: number
  margenUnidad: number | null
  ingresosMes: number | null
  variablesMes: number | null
  utilidadMes: number | null
  equilibrioUnidades: number | null
  mesesRecuperacion: number | null
  faltaAporte: number | null
}

export function calcular(f: Financiero, items: ItemFinanciero[]): Resultado {
  const precio = num(f.precio_unitario)
  const costo = num(f.costo_variable_unitario)
  const unidades = num(f.unidades_mes)
  const inversion = suma(items, 'inversion')
  const fijosMes = suma(items, 'costo_fijo')
  const margenUnidad = precio !== null && costo !== null ? precio - costo : null
  const ingresosMes = precio !== null && unidades !== null ? precio * unidades : null
  const variablesMes = costo !== null && unidades !== null ? costo * unidades : null
  const utilidadMes = ingresosMes !== null && variablesMes !== null ? ingresosMes - variablesMes - fijosMes : null
  const equilibrioUnidades = margenUnidad !== null && margenUnidad > 0 && fijosMes > 0 ? fijosMes / margenUnidad : null
  const mesesRecuperacion = utilidadMes !== null && utilidadMes > 0 && inversion > 0 ? inversion / utilidadMes : null
  const aporte = num(f.aporte_propio)
  const faltaAporte = inversion > 0 && aporte !== null ? Math.max(0, inversion - aporte) : null
  return { inversion, fijosMes, margenUnidad, ingresosMes, variablesMes, utilidadMes, equilibrioUnidades, mesesRecuperacion, faltaAporte }
}

/** Utilidad mensual con otras unidades y otro precio (para el ejercicio de sensibilidad). */
export function utilidadCon(f: Financiero, items: ItemFinanciero[], factorUnidades: number, factorPrecio: number): number | null {
  const precio = num(f.precio_unitario)
  const costo = num(f.costo_variable_unitario)
  const unidades = num(f.unidades_mes)
  if (precio === null || costo === null || unidades === null) return null
  return unidades * factorUnidades * (precio * factorPrecio - costo) - suma(items, 'costo_fijo')
}

export const formatoMeses = (m: number | null) => {
  if (m === null) return '—'
  if (m < 1) return 'menos de 1 mes'
  const r = Math.round(m * 10) / 10
  return r >= 24 ? `${Math.round(r)} meses (≈ ${Math.round((r / 12) * 10) / 10} años)` : `${r} meses`
}

export type NivelAlerta = 'Informativa' | 'Preventiva' | 'Importante' | 'Crítica'
export interface Alerta {
  nivel: NivelAlerta
  texto: string
}

export interface ReferenciaMercado {
  /** SOM en dinero por año (clientes captables × gasto anual), si ya se calculó. */
  somAnual: number | null
}

export function alertasFinanciero(f: Financiero, items: ItemFinanciero[], r: Resultado, ref: ReferenciaMercado): Alerta[] {
  const a: Alerta[] = []
  const precio = num(f.precio_unitario)
  const costo = num(f.costo_variable_unitario)
  if (precio !== null && costo !== null && precio <= costo)
    a.push({ nivel: 'Crítica', texto: 'El precio es menor o igual que el costo por unidad: cada venta te deja pérdida o nada. Revisa precio y costo.' })
  if (r.utilidadMes !== null && r.utilidadMes < 0 && r.margenUnidad !== null && r.margenUnidad > 0)
    a.push({ nivel: 'Importante', texto: 'Con estas cifras pierdes dinero cada mes: las ventas no alcanzan a cubrir los costos fijos. Mira el punto de equilibrio abajo.' })
  if (precio !== null && r.fijosMes === 0)
    a.push({ nivel: 'Preventiva', texto: 'No registraste costos fijos. Casi todo proyecto tiene alguno (personal, arriendo, internet, contabilidad). Revisa que no falte ninguno.' })
  if (r.ingresosMes !== null && ref.somAnual !== null && r.ingresosMes * 12 > ref.somAnual)
    a.push({ nivel: 'Importante', texto: 'Tus ventas del año superan lo que dijiste que podías captar en el estudio de mercado (SOM). Ajusta las unidades o revisa el SOM.' })
  if (r.mesesRecuperacion !== null && r.mesesRecuperacion > 36)
    a.push({ nivel: 'Preventiva', texto: 'Recuperar la inversión tomaría más de 3 años con estas cifras. Es un plazo largo; revisa si puedes bajar la inversión o subir las ventas.' })
  const sinFuente = items.filter((i) => hay(i.concepto) && !hay(i.fuente))
  if (sinFuente.length > 0)
    a.push({ nivel: 'Informativa', texto: `${sinFuente.length === 1 ? 'Un costo no tiene' : `${sinFuente.length} costos no tienen`} fuente (cotización, factura, precio visto). Mejor respaldarlos antes de presentar el proyecto.` })
  if (hay(f.unidades_mes) && (f.unidades_condicion === 'supuesto' || f.unidades_condicion === 'pendiente'))
    a.push({ nivel: 'Preventiva', texto: 'Las ventas por mes son un supuesto. Todo el resultado depende de ellas: pruébalas con pedidos o preventas reales.' })
  return a
}

export interface Revision {
  clave: string
  texto: string
  cumple: boolean
  obligatorio: boolean
  ayuda: string
}

export function revisarFinanciero(f: Financiero, items: ItemFinanciero[], r: Resultado, alertas: Alerta[]): Revision[] {
  const con = (tipo: TipoItem) => items.filter((i) => i.tipo === tipo && hay(i.concepto) && hay(i.valor))
  return [
    { clave: 'precio', texto: 'Tiene el precio por unidad.', cumple: hay(f.precio_unitario), obligatorio: true, ayuda: 'Es el mismo del estudio de mercado.' },
    { clave: 'costo', texto: 'Tiene el costo por unidad.', cumple: hay(f.costo_variable_unitario), obligatorio: true, ayuda: 'Lo que cuesta producir o prestar una unidad (insumos, empaque, comisiones).' },
    { clave: 'unidades', texto: 'Dice cuántas unidades vende al mes y de dónde sale.', cumple: hay(f.unidades_mes) && hay(f.unidades_fuente), obligatorio: true, ayuda: 'No es un deseo: apóyate en el estudio de mercado y en tu capacidad.' },
    { clave: 'inversion', texto: 'Tiene al menos un gasto de inversión inicial.', cumple: con('inversion').length > 0, obligatorio: true, ayuda: 'Lo que hay que pagar antes de vender: equipos, adecuaciones, trámites.' },
    { clave: 'fijos', texto: 'Tiene al menos un costo fijo mensual.', cumple: con('costo_fijo').length > 0, obligatorio: true, ayuda: 'Lo que pagas cada mes venda o no venda.' },
    { clave: 'coherencia', texto: 'No hay alertas críticas.', cumple: alertas.every((x) => x.nivel !== 'Crítica'), obligatorio: true, ayuda: 'Revisa las alertas.' },
    { clave: 'fuentes', texto: 'Cada costo tiene su fuente.', cumple: items.filter((i) => hay(i.concepto)).every((i) => hay(i.fuente)) && items.some((i) => hay(i.concepto)), obligatorio: false, ayuda: 'Cotización, factura, precio visto en una tienda.' },
    { clave: 'aporte', texto: 'Dice cuánto dinero propio hay para la inversión.', cumple: hay(f.aporte_propio), obligatorio: false, ayuda: 'Sirve para ver cuánto falta financiar.' },
    { clave: 'positivo', texto: 'Con estas cifras el proyecto deja utilidad cada mes.', cumple: r.utilidadMes !== null && r.utilidadMes > 0, obligatorio: false, ayuda: 'Si no, ajusta precio, costos o ventas.' },
  ]
}
