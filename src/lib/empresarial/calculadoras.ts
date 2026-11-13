/**
 * Calculadoras del Camino A (sin IA, cuentas deterministas).
 * Solo se guardan las cifras que la persona escribe; los resultados se recalculan siempre.
 *
 * 1) Flujo de caja a 12 meses: entra lo cobrado, sale lo pagado; el saldo se arrastra mes a mes.
 * 2) Capital de trabajo: plata necesaria antes de que las ventas empiecen a sostener el negocio.
 */

import type { Condicion } from '@/lib/empresarial/formulacion'
import { num } from '@/lib/empresarial/mercadoDemanda'

export type TipoCalculadora = 'flujo_caja' | 'capital_trabajo'

const n0 = (s: string) => num(s) ?? 0
const hay = (s: string) => s.trim().length > 0

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
