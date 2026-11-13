/**
 * Calculadoras del Camino A (sin IA, cuentas deterministas).
 * Solo se guardan las cifras que la persona escribe; los resultados se recalculan siempre.
 *
 * 1) Flujo de caja a 12 meses: entra lo cobrado, sale lo pagado; el saldo se arrastra mes a mes.
 * 2) Capital de trabajo: plata necesaria antes de que las ventas empiecen a sostener el negocio.
 * 3) Costo de conseguir un cliente vs lo que deja ese cliente.
 * 4) VAN y TIR de la inversión.
 */

import type { Condicion } from '@/lib/empresarial/formulacion'
import { num } from '@/lib/empresarial/mercadoDemanda'

export type TipoCalculadora = 'flujo_caja' | 'capital_trabajo' | 'costo_cliente' | 'van_tir'

const n0 = (s: string) => num(s) ?? 0
const hay = (s: string) => s.trim().length > 0
/** Como n0 pero acepta negativos (un año puede dejar pérdida). */
const nS = (s: string) => {
  const x = Number(s.trim())
  return s.trim() && Number.isFinite(x) ? x : 0
}

/* -------------------------------------------------------------------------- */
/* Flujo de caja a 12 meses                                                    */
/* -------------------------------------------------------------------------- */

export interface MesFlujo {
  ventas: string
  variables: string
  fijos: string
  inversion: string
  aportes: string
}

export interface FlujoCaja {
  cajaInicial: string
  cajaCondicion: Condicion
  /** Cuántos meses después de vender se cobra (0 = al contado). */
  mesesCobro: number
  ventasFuente: string
  ventasCondicion: Condicion
  meses: MesFlujo[]
}

export const NUM_MESES = 12

export const mesVacio = (): MesFlujo => ({ ventas: '', variables: '', fijos: '', inversion: '', aportes: '' })

export const flujoVacio = (): FlujoCaja => ({
  cajaInicial: '',
  cajaCondicion: 'aportado',
  mesesCobro: 0,
  ventasFuente: '',
  ventasCondicion: 'supuesto',
  meses: Array.from({ length: NUM_MESES }, mesVacio),
})

/** Cifras que ya están en el Financiero básico (si existen) para no pedirlas de nuevo. */
export interface PrecargaFinanciero {
  ventasMes: number | null
  variablesMes: number | null
  fijosMes: number | null
  inversion: number | null
  aportePropio: number | null
}

const txt = (n: number | null) => (n === null || !Number.isFinite(n) ? '' : String(Math.round(n * 100) / 100))

export function flujoDesdeFinanciero(p: PrecargaFinanciero): FlujoCaja {
  const base = flujoVacio()
  base.cajaInicial = txt(p.aportePropio)
  base.meses = base.meses.map((_, i) => ({
    ventas: txt(p.ventasMes),
    variables: txt(p.variablesMes),
    fijos: txt(p.fijosMes),
    inversion: i === 0 ? txt(p.inversion) : '',
    aportes: '',
  }))
  return base
}

export interface FilaFlujo {
  mes: number
  ventas: number
  cobros: number
  salidas: number
  neto: number
  saldo: number
}

export interface ResultadoFlujo {
  filas: FilaFlujo[]
  hayDatos: boolean
  /** Primer mes (1 a 12) con saldo negativo, o null. */
  primerMesNegativo: number | null
  mesMinimo: number
  saldoMinimo: number
  /** Dinero extra que haría falta para que la caja nunca quede por debajo de cero. */
  necesidadMaxima: number
  saldoFinal: number
  porCobrarAlCierre: number
  totalCobros: number
  totalSalidas: number
}

export function calcularFlujo(f: FlujoCaja): ResultadoFlujo {
  const retraso = Math.min(3, Math.max(0, Math.round(f.mesesCobro)))
  let saldo = n0(f.cajaInicial)
  const filas: FilaFlujo[] = f.meses.map((m, i) => {
    const origen = i - retraso
    const cobros = (origen >= 0 ? n0(f.meses[origen].ventas) : 0) + n0(m.aportes)
    const salidas = n0(m.variables) + n0(m.fijos) + n0(m.inversion)
    const neto = cobros - salidas
    saldo += neto
    return { mes: i + 1, ventas: n0(m.ventas), cobros, salidas, neto, saldo }
  })
  const hayDatos = f.meses.some((m) => Object.values(m).some(hay)) || hay(f.cajaInicial)
  const negativo = filas.find((x) => x.saldo < 0)
  const minimo = filas.reduce((a, b) => (b.saldo < a.saldo ? b : a), filas[0])
  const cobradoDeVentas = filas.reduce((s, x, i) => s + (i - retraso >= 0 ? n0(f.meses[i - retraso].ventas) : 0), 0)
  const ventasTotales = f.meses.reduce((s, m) => s + n0(m.ventas), 0)
  return {
    filas,
    hayDatos,
    primerMesNegativo: negativo ? negativo.mes : null,
    mesMinimo: minimo.mes,
    saldoMinimo: minimo.saldo,
    necesidadMaxima: Math.max(0, -minimo.saldo),
    saldoFinal: filas[filas.length - 1].saldo,
    porCobrarAlCierre: Math.max(0, ventasTotales - cobradoDeVentas),
    totalCobros: filas.reduce((s, x) => s + x.cobros, 0),
    totalSalidas: filas.reduce((s, x) => s + x.salidas, 0),
  }
}

export type NivelAlerta = 'Informativa' | 'Preventiva' | 'Importante' | 'Crítica'
export interface Alerta {
  nivel: NivelAlerta
  texto: string
}

export function alertasFlujo(f: FlujoCaja, r: ResultadoFlujo): Alerta[] {
  const a: Alerta[] = []
  if (!r.hayDatos) return a
  if (r.primerMesNegativo !== null)
    a.push({
      nivel: 'Crítica',
      texto: `Con estas cifras la caja se queda sin dinero en el mes ${r.primerMesNegativo}. Hace falta conseguir al menos esa plata antes, o bajar gastos, o vender y cobrar más rápido.`,
    })
  else if (r.saldoMinimo >= 0 && r.saldoMinimo < r.totalSalidas / NUM_MESES)
    a.push({ nivel: 'Importante', texto: 'La caja nunca se acaba, pero en su punto más bajo alcanza para menos de un mes de gastos. Cualquier retraso en cobros la deja en negativo.' })
  if (f.mesesCobro > 0 && r.porCobrarAlCierre > 0)
    a.push({ nivel: 'Informativa', texto: 'Parte de lo vendido en los últimos meses todavía no se ha cobrado al cierre del año. Ese dinero existe pero aún no está en caja.' })
  if (hay(f.meses[0].ventas) && (f.ventasCondicion === 'supuesto' || f.ventasCondicion === 'pendiente'))
    a.push({ nivel: 'Preventiva', texto: 'Las ventas son un supuesto. Todo el flujo depende de ellas: pruébalas con pedidos o preventas reales.' })
  const ventasDesdeMes1 = n0(f.meses[0].ventas) > 0 && f.meses[0].ventas === f.meses[NUM_MESES - 1].ventas
  if (ventasDesdeMes1 && f.mesesCobro === 0)
    a.push({ nivel: 'Preventiva', texto: 'Vendes lo mismo desde el primer mes y cobras al instante. Casi ningún negocio arranca así: revisa si los primeros meses son más lentos.' })
  if (f.meses.every((m) => !hay(m.fijos)) && f.meses.some((m) => hay(m.ventas)))
    a.push({ nivel: 'Preventiva', texto: 'No registraste costos fijos. Casi todo negocio tiene alguno (personal, arriendo, internet, contabilidad).' })
  if (f.meses.every((m) => !hay(m.ventas)) && f.meses.some((m) => hay(m.fijos) || hay(m.inversion)))
    a.push({ nivel: 'Informativa', texto: 'Aún no registraste ventas. El flujo muestra solo cuánto dinero consumiría el negocio sin vender.' })
  return a
}

/* -------------------------------------------------------------------------- */
/* Capital de trabajo                                                          */
/* -------------------------------------------------------------------------- */

export type CampoCapital = 'fijosMes' | 'variablesMes' | 'diasInventario' | 'diasCobro' | 'diasPago' | 'mesesSinVentas' | 'mesesReserva'

export interface CapitalTrabajo {
  fijosMes: string
  variablesMes: string
  diasInventario: string
  diasCobro: string
  diasPago: string
  mesesSinVentas: string
  mesesReserva: string
  condiciones: Record<CampoCapital, Condicion>
  nota: string
}

export const capitalVacio = (): CapitalTrabajo => ({
  fijosMes: '',
  variablesMes: '',
  diasInventario: '',
  diasCobro: '',
  diasPago: '',
  mesesSinVentas: '',
  mesesReserva: '',
  condiciones: {
    fijosMes: 'estimado',
    variablesMes: 'estimado',
    diasInventario: 'supuesto',
    diasCobro: 'supuesto',
    diasPago: 'supuesto',
    mesesSinVentas: 'supuesto',
    mesesReserva: 'supuesto',
  },
  nota: '',
})

export function capitalDesdeFinanciero(p: PrecargaFinanciero): CapitalTrabajo {
  const c = capitalVacio()
  c.fijosMes = txt(p.fijosMes)
  c.variablesMes = txt(p.variablesMes)
  return c
}

export interface ResultadoCapital {
  hayDatos: boolean
  gastoMes: number
  cicloDias: number
  necesidadCiclo: number
  necesidadAntesDeVender: number
  reserva: number
  total: number
}

export function calcularCapital(c: CapitalTrabajo): ResultadoCapital {
  const fijos = n0(c.fijosMes)
  const variables = n0(c.variablesMes)
  const gastoMes = fijos + variables
  const cicloDias = n0(c.diasInventario) + n0(c.diasCobro) - n0(c.diasPago)
  const necesidadCiclo = cicloDias > 0 ? (gastoMes / 30) * cicloDias : 0
  const necesidadAntesDeVender = fijos * n0(c.mesesSinVentas)
  const reserva = gastoMes * n0(c.mesesReserva)
  const hayDatos = [c.fijosMes, c.variablesMes, c.diasInventario, c.diasCobro, c.diasPago, c.mesesSinVentas, c.mesesReserva].some(hay)
  return { hayDatos, gastoMes, cicloDias, necesidadCiclo, necesidadAntesDeVender, reserva, total: necesidadCiclo + necesidadAntesDeVender + reserva }
}

export function alertasCapital(c: CapitalTrabajo, r: ResultadoCapital): Alerta[] {
  const a: Alerta[] = []
  if (!r.hayDatos) return a
  if (!hay(c.fijosMes) && !hay(c.variablesMes))
    a.push({ nivel: 'Importante', texto: 'Faltan los costos mensuales. Sin ellos el cálculo queda en cero y no muestra la necesidad real.' })
  if (r.cicloDias < 0)
    a.push({ nivel: 'Informativa', texto: 'Tus proveedores te dan más plazo del que tú das a tus clientes y del que tardas en vender. Eso ayuda a la caja, pero confirma que el plazo de pago esté acordado y no sea una esperanza.' })
  if (r.cicloDias > 120)
    a.push({ nivel: 'Preventiva', texto: 'Pasan más de 4 meses entre que pagas y cobras. Es un ciclo largo: necesitarás bastante dinero de respaldo.' })
  if (hay(c.mesesSinVentas) && n0(c.mesesSinVentas) === 0)
    a.push({ nivel: 'Preventiva', texto: 'Dices que vendes desde el primer día. Revisa si realmente hay clientes listos o si pasará un tiempo de preparación.' })
  if (!hay(c.mesesReserva))
    a.push({ nivel: 'Informativa', texto: 'No dejaste una reserva para imprevistos. Es opcional, pero conviene pensarla.' })
  const supuestos = (Object.keys(c.condiciones) as CampoCapital[]).filter((k) => hay(c[k]) && (c.condiciones[k] === 'supuesto' || c.condiciones[k] === 'pendiente'))
  if (supuestos.length > 0)
    a.push({ nivel: 'Preventiva', texto: `${supuestos.length === 1 ? 'Un dato es un supuesto' : `${supuestos.length} datos son supuestos`} o está pendiente de validar. Compruébalos con cotizaciones, contratos o clientes reales.` })
  return a
}

/* -------------------------------------------------------------------------- */
/* Costo de conseguir un cliente vs lo que deja                                */
/* -------------------------------------------------------------------------- */

export type CampoCliente = 'gastoComercial' | 'clientesNuevos' | 'precioCompra' | 'comprasAnio' | 'aniosCliente' | 'margenPct'

export interface CostoCliente {
  gastoComercial: string
  clientesNuevos: string
  precioCompra: string
  comprasAnio: string
  aniosCliente: string
  margenPct: string
  condiciones: Record<CampoCliente, Condicion>
  nota: string
}

export const clienteVacio = (): CostoCliente => ({
  gastoComercial: '',
  clientesNuevos: '',
  precioCompra: '',
  comprasAnio: '',
  aniosCliente: '',
  margenPct: '',
  condiciones: {
    gastoComercial: 'estimado',
    clientesNuevos: 'supuesto',
    precioCompra: 'estimado',
    comprasAnio: 'supuesto',
    aniosCliente: 'supuesto',
    margenPct: 'estimado',
  },
  nota: '',
})

/** Del Financiero básico solo se puede sacar el margen (1 − costos por vender ÷ ventas). */
export function clienteDesdeFinanciero(p: PrecargaFinanciero): CostoCliente {
  const c = clienteVacio()
  if (p.ventasMes && p.ventasMes > 0 && p.variablesMes !== null) {
    const m = (1 - p.variablesMes / p.ventasMes) * 100
    if (Number.isFinite(m)) c.margenPct = txt(Math.max(0, Math.min(100, m)))
  }
  return c
}

export interface ResultadoCliente {
  hayDatos: boolean
  /** Costo de conseguir un cliente. null si falta gasto o clientes. */
  cac: number | null
  /** Lo que deja un cliente en toda su permanencia (ya restados los costos por vender). */
  valorCliente: number | null
  gananciaPorCompra: number
  /** Cuántas veces el cliente paga lo que costó conseguirlo. */
  relacion: number | null
  /** Compras necesarias para recuperar lo que costó conseguirlo. */
  comprasParaRecuperar: number | null
  /** Meses para recuperarlo (según compras al año). */
  mesesParaRecuperar: number | null
  neto: number | null
}

export function calcularCliente(c: CostoCliente): ResultadoCliente {
  const gasto = n0(c.gastoComercial)
  const nuevos = n0(c.clientesNuevos)
  const cac = nuevos > 0 && hay(c.gastoComercial) ? gasto / nuevos : null
  const margen = Math.min(100, Math.max(0, n0(c.margenPct))) / 100
  const gananciaPorCompra = n0(c.precioCompra) * margen
  const compras = n0(c.comprasAnio) * n0(c.aniosCliente)
  const valorCliente = hay(c.precioCompra) && hay(c.margenPct) && compras > 0 ? gananciaPorCompra * compras : null
  const relacion = cac !== null && cac > 0 && valorCliente !== null ? valorCliente / cac : null
  const comprasParaRecuperar = cac !== null && gananciaPorCompra > 0 ? cac / gananciaPorCompra : null
  const mesesParaRecuperar = comprasParaRecuperar !== null && n0(c.comprasAnio) > 0 ? (comprasParaRecuperar / n0(c.comprasAnio)) * 12 : null
  const hayDatos = [c.gastoComercial, c.clientesNuevos, c.precioCompra, c.comprasAnio, c.aniosCliente, c.margenPct].some(hay)
  return { hayDatos, cac, valorCliente, gananciaPorCompra, relacion, comprasParaRecuperar, mesesParaRecuperar, neto: cac !== null && valorCliente !== null ? valorCliente - cac : null }
}

export function alertasCliente(c: CostoCliente, r: ResultadoCliente): Alerta[] {
  const a: Alerta[] = []
  if (!r.hayDatos) return a
  if (r.cac === null)
    a.push({ nivel: 'Importante', texto: 'Falta el gasto en conseguir clientes o cuántos clientes nuevos trajo. Sin esos dos datos no se puede calcular cuánto cuesta cada cliente.' })
  if (r.valorCliente === null)
    a.push({ nivel: 'Importante', texto: 'Faltan datos de lo que deja cada cliente (precio, margen, compras al año o años que se queda).' })
  if (n0(c.margenPct) > 100) a.push({ nivel: 'Preventiva', texto: 'El margen no puede pasar de 100 %. Se tomó como 100 % para el cálculo.' })
  if (r.relacion !== null && r.relacion < 1)
    a.push({ nivel: 'Crítica', texto: 'Con estas cifras cada cliente deja menos de lo que costó conseguirlo. Hay que bajar el costo de conseguirlo, subir el margen o lograr que compre más veces.' })
  else if (r.relacion !== null && r.relacion < 3)
    a.push({ nivel: 'Importante', texto: 'Cada cliente deja menos de 3 veces lo que costó conseguirlo. Como referencia general, muchos negocios buscan 3 veces o más; depende del sector, así que tómalo como guía y no como regla.' })
  if (r.mesesParaRecuperar !== null && r.mesesParaRecuperar > 12)
    a.push({ nivel: 'Preventiva', texto: 'Tardas más de un año en recuperar lo gastado en cada cliente. Necesitarás dinero de respaldo mientras tanto.' })
  if (n0(c.aniosCliente) > 5) a.push({ nivel: 'Preventiva', texto: 'Supones que un cliente se queda más de 5 años. Es difícil de comprobar al inicio: valida con clientes reales antes de confiar en esa cifra.' })
  const supuestos = (Object.keys(c.condiciones) as CampoCliente[]).filter((k) => hay(c[k]) && (c.condiciones[k] === 'supuesto' || c.condiciones[k] === 'pendiente'))
  if (supuestos.length > 0)
    a.push({ nivel: 'Preventiva', texto: `${supuestos.length === 1 ? 'Un dato es un supuesto' : `${supuestos.length} datos son supuestos`} o está pendiente de validar. Compruébalos con ventas y gastos reales.` })
  return a
}

/* -------------------------------------------------------------------------- */
/* VAN y TIR                                                                   */
/* -------------------------------------------------------------------------- */

export const MAX_ANIOS = 10

export interface VanTir {
  inversion: string
  inversionCondicion: Condicion
  /** Tasa de descuento anual en %: la rentabilidad mínima que exiges. */
  tasaPct: string
  tasaCondicion: Condicion
  /** Dinero que se recupera al final (venta de equipos, etc.). Opcional. */
  rescate: string
  numAnios: number
  /** Dinero neto que queda (entra menos sale) en cada año. */
  flujos: string[]
  flujosCondicion: Condicion
  nota: string
}

export const vanVacio = (): VanTir => ({
  inversion: '',
  inversionCondicion: 'estimado',
  tasaPct: '',
  tasaCondicion: 'supuesto',
  rescate: '',
  numAnios: 5,
  flujos: Array.from({ length: MAX_ANIOS }, () => ''),
  flujosCondicion: 'supuesto',
  nota: '',
})

/** Con el Financiero: inversión y un flujo anual = (ventas − costos por vender − fijos) × 12, igual todos los años. */
export function vanDesdeFinanciero(p: PrecargaFinanciero): VanTir {
  const v = vanVacio()
  v.inversion = txt(p.inversion)
  if (p.ventasMes !== null && p.variablesMes !== null && p.fijosMes !== null) {
    const anual = (p.ventasMes - p.variablesMes - p.fijosMes) * 12
    v.flujos = v.flujos.map(() => txt(anual))
  }
  return v
}

export interface ResultadoVan {
  hayDatos: boolean
  completo: boolean
  van: number | null
  /** TIR en % anual, o null si no se puede calcular. */
  tir: number | null
  tirMotivo: string | null
  totalFlujos: number
  /** Saldo acumulado descontado, año 0 a n. */
  acumulado: number[]
  /** Año en que lo descontado recupera la inversión, o null. */
  anioRecuperacion: number | null
}

const flujosDe = (v: VanTir): number[] => {
  const n = Math.min(MAX_ANIOS, Math.max(1, Math.round(v.numAnios)))
  const f = v.flujos.slice(0, n).map(nS)
  f[n - 1] += n0(v.rescate)
  return [-n0(v.inversion), ...f]
}

const vanA = (f: number[], tasa: number) => f.reduce((s, x, t) => s + x / Math.pow(1 + tasa, t), 0)

/** TIR por bisección entre −99 % y 1000 %. Devuelve null si el signo no cambia. */
export function tirDe(f: number[]): number | null {
  let lo = -0.99
  let hi = 10
  let flo = vanA(f, lo)
  const fhi = vanA(f, hi)
  if (!Number.isFinite(flo) || !Number.isFinite(fhi) || flo * fhi > 0) return null
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    const fm = vanA(f, mid)
    if (Math.abs(fm) < 1e-7) return mid
    if (flo * fm < 0) hi = mid
    else {
      lo = mid
      flo = fm
    }
  }
  return (lo + hi) / 2
}

export function calcularVan(v: VanTir): ResultadoVan {
  const f = flujosDe(v)
  const n = f.length - 1
  const tasa = n0(v.tasaPct) / 100
  const hayDatos = hay(v.inversion) || v.flujos.slice(0, n).some(hay)
  const completo = n0(v.inversion) > 0 && v.flujos.slice(0, n).some((x) => nS(x) !== 0) && hay(v.tasaPct)
  const acumulado: number[] = []
  let ac = 0
  f.forEach((x, t) => {
    ac += x / Math.pow(1 + tasa, t)
    acumulado.push(ac)
  })
  const rec = acumulado.findIndex((x, t) => t > 0 && x >= 0)
  const hayPositivo = f.slice(1).some((x) => x > 0)
  const hayNegativo = f.some((x) => x < 0)
  let tir: number | null = null
  let tirMotivo: string | null = null
  if (!hayDatos) tirMotivo = null
  else if (!hayPositivo || !hayNegativo) tirMotivo = 'La TIR necesita al menos una salida de dinero (la inversión) y al menos un año con dinero que entra.'
  else {
    tir = tirDe(f)
    if (tir === null) tirMotivo = 'Con estas cifras la TIR no se puede calcular de forma confiable.'
  }
  return {
    hayDatos,
    completo,
    van: hayDatos && hay(v.tasaPct) ? vanA(f, tasa) : null,
    tir: tir === null ? null : tir * 100,
    tirMotivo,
    totalFlujos: f.slice(1).reduce((s, x) => s + x, 0),
    acumulado,
    anioRecuperacion: rec >= 0 ? rec : null,
  }
}

export function alertasVan(v: VanTir, r: ResultadoVan): Alerta[] {
  const a: Alerta[] = []
  if (!r.hayDatos) return a
  const n = Math.min(MAX_ANIOS, Math.max(1, Math.round(v.numAnios)))
  if (!hay(v.inversion) || n0(v.inversion) <= 0) a.push({ nivel: 'Importante', texto: 'Falta la inversión inicial. Sin ella no se puede calcular el VAN ni la TIR.' })
  if (!hay(v.tasaPct)) a.push({ nivel: 'Importante', texto: 'Falta la tasa de descuento. Es la rentabilidad mínima que exiges; si no la tienes, pregúntale a tu contador o usa la que pide la convocatoria.' })
  if (r.van !== null && r.van < 0) a.push({ nivel: 'Crítica', texto: 'El VAN es negativo: con estas cifras el proyecto no llega a la rentabilidad mínima que exiges. Revisa ingresos, costos, plazo o inversión.' })
  if (r.van !== null && r.tir !== null && r.van >= 0 && r.tir > 100) a.push({ nivel: 'Preventiva', texto: 'La TIR da muy alta (más de 100 %). Suele indicar flujos demasiado optimistas o inversión muy pequeña: revísalos.' })
  if (r.tirMotivo) a.push({ nivel: 'Informativa', texto: r.tirMotivo })
  if (r.van !== null && r.van >= 0 && r.anioRecuperacion === null) a.push({ nivel: 'Informativa', texto: 'El dinero invertido no se recupera dentro del plazo analizado.' })
  const distintos = new Set(v.flujos.slice(0, n).map((x) => nS(x)))
  if (n >= 3 && distintos.size === 1 && nS(v.flujos[0]) > 0)
    a.push({ nivel: 'Preventiva', texto: 'Todos los años tienen el mismo dinero neto. Casi ningún negocio arranca así: normalmente los primeros años son más bajos.' })
  if (v.flujos.slice(0, n).some((x) => hay(x)) && (v.flujosCondicion === 'supuesto' || v.flujosCondicion === 'pendiente'))
    a.push({ nivel: 'Preventiva', texto: 'Los flujos de cada año son un supuesto. El VAN y la TIR dependen totalmente de ellos: pruébalos con ventas reales.' })
  if (hay(v.tasaPct) && (v.tasaCondicion === 'pendiente'))
    a.push({ nivel: 'Preventiva', texto: 'La tasa de descuento está pendiente de definir.' })
  a.push({ nivel: 'Informativa', texto: 'No incluye impuestos, intereses ni inflación. Úsalo como guía y valídalo con tu contador o con las reglas de la convocatoria.' })
  return a
}
