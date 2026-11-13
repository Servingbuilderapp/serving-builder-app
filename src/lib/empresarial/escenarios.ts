/**
 * Tablero de escenarios del Camino A (sin IA, cuentas deterministas).
 * Parte de unas cifras base y las mueve en tres escenarios: pesimista, normal y optimista.
 * Son PROYECCIONES (un negocio nuevo no tiene histórico). Solo se guardan las cifras que la persona escribe.
 * Reusa las mismas cuentas de las calculadoras: flujo de caja a 12 meses y VAN/TIR.
 */

import type { Condicion } from '@/lib/empresarial/formulacion'
import { num } from '@/lib/empresarial/mercadoDemanda'
import { NUM_MESES, calcularFlujo, calcularVan, flujoVacio, vanVacio, type Alerta, type PrecargaFinanciero } from '@/lib/empresarial/calculadoras'

export type ClaveEscenario = 'pesimista' | 'normal' | 'optimista'
export const CLAVES: ClaveEscenario[] = ['pesimista', 'normal', 'optimista']
export const NOMBRE_ESCENARIO: Record<ClaveEscenario, string> = { pesimista: 'Pesimista', normal: 'Normal', optimista: 'Optimista' }
export const COLOR_ESCENARIO: Record<ClaveEscenario, string> = { pesimista: '#B3261E', normal: '#B08D57', optimista: '#3F8A76' }

const n0 = (s: string) => num(s) ?? 0
const hay = (s: string) => s.trim().length > 0
const nS = (s: string) => {
  const x = Number(s.trim())
  return s.trim() && Number.isFinite(x) ? x : 0
}

/** Lo que cambia en cada escenario respecto a las cifras base. Los porcentajes pueden ser negativos. */
export interface Ajustes {
  ventasPct: string
  crecimientoPct: string
  costoVenderPct: string
  fijosPct: string
  inversionPct: string
  mesesCobro: string
  mesesSinVentas: string
}

export interface Escenarios {
  ventasMes: string
  variablesMes: string
  fijosMes: string
  inversion: string
  cajaInicial: string
  tasaPct: string
  numAnios: number
  baseCondicion: Condicion
  nota: string
  ajustes: Record<ClaveEscenario, Ajustes>
}

export const escenariosVacio = (): Escenarios => ({
  ventasMes: '',
  variablesMes: '',
  fijosMes: '',
  inversion: '',
  cajaInicial: '',
  tasaPct: '',
  numAnios: 5,
  baseCondicion: 'estimado',
  nota: '',
  // Puntos de partida editables (son supuestos, no datos): conviene cambiarlos según tu negocio.
  ajustes: {
    pesimista: { ventasPct: '-30', crecimientoPct: '0', costoVenderPct: '10', fijosPct: '10', inversionPct: '15', mesesCobro: '2', mesesSinVentas: '2' },
    normal: { ventasPct: '0', crecimientoPct: '1', costoVenderPct: '0', fijosPct: '0', inversionPct: '0', mesesCobro: '1', mesesSinVentas: '1' },
    optimista: { ventasPct: '20', crecimientoPct: '3', costoVenderPct: '-5', fijosPct: '0', inversionPct: '0', mesesCobro: '0', mesesSinVentas: '0' },
  },
})

const txt = (n: number | null) => (n === null || !Number.isFinite(n) ? '' : String(Math.round(n * 100) / 100))

export function escenariosDesdeFinanciero(p: PrecargaFinanciero): Escenarios {
  const e = escenariosVacio()
  e.ventasMes = txt(p.ventasMes)
  e.variablesMes = txt(p.variablesMes)
  e.fijosMes = txt(p.fijosMes)
  e.inversion = txt(p.inversion)
  e.cajaInicial = txt(p.aportePropio)
  return e
}

/** Mezcla lo guardado con los valores de arranque (por si se agregan campos después). */
export function completarEscenarios(g: Partial<Escenarios> | null): Escenarios {
  const base = escenariosVacio()
  if (!g) return base
  const ajustes = { ...base.ajustes }
  for (const k of CLAVES) ajustes[k] = { ...base.ajustes[k], ...(g.ajustes?.[k] ?? {}) }
  return { ...base, ...g, ajustes }
}

export interface FilaMes {
  mes: number
  ventas: number
  costoVender: number
  fijos: number
  operativo: number
  saldo: number
}

export interface ResultadoEscenario {
  clave: ClaveEscenario
  hayDatos: boolean
  filas: FilaMes[]
  ventasAnio: number
  gananciaAnio: number
  margenPct: number | null
  /** Primer mes (1 a 12) en que las ventas cubren todos los gastos del mes. */
  mesEquilibrio: number | null
  /** Mes en que lo ganado acumulado ya cubre la inversión (dentro de los 12 meses). */
  mesRecuperacion: number | null
  mesSinPlata: number | null
  saldoMinimo: number
  mesMinimo: number
  necesidadMaxima: number
  saldoFinal: number
  van: number | null
  tir: number | null
  inversion: number
  semaforo: 'verde' | 'amarillo' | 'rojo' | 'sin_datos'
  lectura: string
}

const topar = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x))

export function calcularEscenario(e: Escenarios, clave: ClaveEscenario): ResultadoEscenario {
  const a = e.ajustes[clave]
  const ventasBase = n0(e.ventasMes)
  const razonVar = ventasBase > 0 ? n0(e.variablesMes) / ventasBase : 0
  const ventasEsc = ventasBase * (1 + nS(a.ventasPct) / 100)
  const crece = nS(a.crecimientoPct) / 100
  const razonEsc = Math.max(0, razonVar * (1 + nS(a.costoVenderPct) / 100))
  const fijosEsc = n0(e.fijosMes) * (1 + nS(a.fijosPct) / 100)
  const invEsc = n0(e.inversion) * (1 + nS(a.inversionPct) / 100)
  const retraso = topar(Math.round(nS(a.mesesCobro)), 0, 3)
  const arranque = topar(Math.round(nS(a.mesesSinVentas)), 0, 6)

  const filas: FilaMes[] = []
  let acumulado = 0
  let mesRecuperacion: number | null = null
  let mesEquilibrio: number | null = null
  const meses = []
  for (let m = 1; m <= NUM_MESES; m++) {
    const activo = m > arranque
    const ventas = activo ? Math.max(0, ventasEsc * Math.pow(1 + crece, m - arranque - 1)) : 0
    const costoVender = ventas * razonEsc
    const operativo = ventas - costoVender - fijosEsc
    acumulado += operativo
    if (mesEquilibrio === null && activo && operativo >= 0 && ventas > 0) mesEquilibrio = m
    if (mesRecuperacion === null && invEsc > 0 && acumulado - invEsc >= 0) mesRecuperacion = m
    meses.push({ ventas: txt(ventas), variables: txt(costoVender), fijos: txt(fijosEsc), inversion: m === 1 ? txt(invEsc) : '', aportes: '' })
    filas.push({ mes: m, ventas, costoVender, fijos: fijosEsc, operativo, saldo: 0 })
  }
  const flujo = { ...flujoVacio(), cajaInicial: e.cajaInicial, mesesCobro: retraso, meses }
  const rf = calcularFlujo(flujo)
  rf.filas.forEach((f, i) => (filas[i].saldo = f.saldo))

  const ventasAnio = filas.reduce((s, f) => s + f.ventas, 0)
  const gananciaAnio = filas.reduce((s, f) => s + f.operativo, 0)
  const margenPct = ventasAnio > 0 ? ((ventasAnio - filas.reduce((s, f) => s + f.costoVender, 0)) / ventasAnio) * 100 : null

  // VAN y TIR: año 1 = lo de los 12 meses; años siguientes = ritmo de los últimos 3 meses × 12.
  const ritmo = (filas.slice(-3).reduce((s, f) => s + f.operativo, 0) / 3) * 12
  const v = vanVacio()
  v.inversion = txt(invEsc)
  v.tasaPct = e.tasaPct
  v.numAnios = topar(Math.round(e.numAnios), 1, 10)
  v.flujos = v.flujos.map((_, i) => (i === 0 ? txt(gananciaAnio) : txt(ritmo)))
  const rv = calcularVan(v)

  const hayDatos = hay(e.ventasMes) || hay(e.fijosMes) || hay(e.inversion)
  const hayTasa = hay(e.tasaPct)
  const van = hayDatos && hayTasa && invEsc > 0 ? rv.van : null
  const tir = hayDatos && invEsc > 0 ? rv.tir : null

  let semaforo: ResultadoEscenario['semaforo'] = 'sin_datos'
  let lectura = 'Escribe las cifras base para ver este escenario.'
  if (hayDatos) {
    const mensual = (rf.totalSalidas / NUM_MESES) || 0
    if (rf.primerMesNegativo !== null) {
      semaforo = 'rojo'
      lectura = `Te quedas sin plata en el mes ${rf.primerMesNegativo}. Mira abajo cuánto dinero extra haría falta.`
    } else if (van !== null && van < 0) {
      semaforo = 'rojo'
      lectura = 'La caja aguanta, pero el proyecto no llega a la rentabilidad mínima que exiges (VAN negativo).'
    } else if (rf.saldoMinimo < mensual) {
      semaforo = 'amarillo'
      lectura = 'La caja aguanta, pero en su punto más bajo alcanza para menos de un mes de gastos.'
    } else if (van === null) {
      semaforo = 'amarillo'
      lectura = 'La caja aguanta. Falta la inversión o la tasa de descuento para saber si vale la pena (VAN).'
    } else {
      semaforo = 'verde'
      lectura = 'La caja aguanta y el proyecto supera la rentabilidad mínima que exiges.'
    }
  }

  return {
    clave,
    hayDatos,
    filas,
    ventasAnio,
    gananciaAnio,
    margenPct,
    mesEquilibrio,
    mesRecuperacion,
    mesSinPlata: rf.primerMesNegativo,
    saldoMinimo: rf.saldoMinimo,
    mesMinimo: rf.mesMinimo,
    necesidadMaxima: rf.necesidadMaxima,
    saldoFinal: rf.saldoFinal,
    van,
    tir,
    inversion: invEsc,
    semaforo,
    lectura,
  }
}

export function calcularTodos(e: Escenarios): Record<ClaveEscenario, ResultadoEscenario> {
  return { pesimista: calcularEscenario(e, 'pesimista'), normal: calcularEscenario(e, 'normal'), optimista: calcularEscenario(e, 'optimista') }
}

export function alertasEscenarios(e: Escenarios, r: Record<ClaveEscenario, ResultadoEscenario>): Alerta[] {
  const a: Alerta[] = []
  if (!r.normal.hayDatos) return a
  if (!hay(e.ventasMes)) a.push({ nivel: 'Importante', texto: 'Falta cuánto esperas vender al mes. Sin ese dato los tres escenarios solo muestran gastos.' })
  if (hay(e.ventasMes) && !hay(e.variablesMes)) a.push({ nivel: 'Preventiva', texto: 'No escribiste costos por vender. Si vender te cuesta algo (materia prima, comisiones, envíos), el resultado se ve mejor de lo que es.' })
  if (!hay(e.fijosMes)) a.push({ nivel: 'Preventiva', texto: 'No escribiste costos fijos. Casi todo negocio tiene alguno (personal, arriendo, internet, contabilidad).' })
  if (!hay(e.tasaPct)) a.push({ nivel: 'Informativa', texto: 'Sin la tasa de descuento no se calcula el VAN. Es la rentabilidad mínima que exiges; si no la tienes, pregúntale a tu contador.' })
  if (r.pesimista.mesSinPlata !== null && r.normal.mesSinPlata === null)
    a.push({ nivel: 'Importante', texto: `Si pasa lo pesimista te quedas sin plata en el mes ${r.pesimista.mesSinPlata}. Conviene tener un respaldo (aporte, crédito o reserva); la tarjeta del escenario pesimista dice cuánto.` })
  if (r.normal.mesSinPlata !== null) a.push({ nivel: 'Crítica', texto: `Incluso en el escenario normal te quedas sin plata en el mes ${r.normal.mesSinPlata}. Hay que conseguir dinero antes, bajar gastos o vender y cobrar más rápido.` })
  if (r.pesimista.van !== null && r.pesimista.van < 0 && r.normal.van !== null && r.normal.van >= 0)
    a.push({ nivel: 'Preventiva', texto: 'El proyecto vale la pena en el escenario normal, pero deja de valerla en el pesimista. Mira qué ajuste del pesimista pesa más y cómo protegerte de él.' })
  if (nS(e.ajustes.optimista.ventasPct) > 50) a.push({ nivel: 'Preventiva', texto: 'El optimista supone vender más de 50 % por encima de lo normal. Es difícil de sostener: compruébalo con pedidos o preventas reales.' })
  if (nS(e.ajustes.pesimista.ventasPct) > nS(e.ajustes.normal.ventasPct) || nS(e.ajustes.normal.ventasPct) > nS(e.ajustes.optimista.ventasPct))
    a.push({ nivel: 'Importante', texto: 'Las ventas no van en orden: el pesimista debería vender menos que el normal, y el normal menos que el optimista.' })
  if (e.baseCondicion === 'supuesto' || e.baseCondicion === 'pendiente')
    a.push({ nivel: 'Preventiva', texto: 'Las cifras base son un supuesto. Todo el tablero depende de ellas: pruébalas con pedidos, cotizaciones o clientes reales.' })
  a.push({ nivel: 'Informativa', texto: 'Son proyecciones: un negocio nuevo no tiene histórico. No incluye impuestos, intereses ni inflación, y no promete resultados. Úsalo para prepararte, no para adivinar el futuro.' })
  return a
}
