/**
 * Estudio de mercado, pantalla 2: demanda y tamaño del mercado (TAM, SAM, SOM) — reglas simples, sin IA.
 *
 * Método de compradores: TAM = compradores potenciales × gasto anual promedio;
 * SAM = compradores del segmento y territorio que se pueden atender × gasto;
 * SOM = clientes que razonablemente se pueden captar × gasto.
 * Regla de oro: cada cifra dice de dónde sale y qué tan segura es. El SOM no se calcula con un
 * porcentaje cualquiera del TAM: se explica por capacidad, presupuesto comercial y competencia.
 */

import type { Condicion } from '@/lib/empresarial/formulacion'

export type Cifra = 'gasto' | 'tam' | 'sam' | 'som'
export const CIFRAS: Cifra[] = ['gasto', 'tam', 'sam', 'som']

export interface DatoCifra {
  /** Solo dígitos (y punto decimal en el gasto). Vacío = sin dato. */
  valor: string
  /** De dónde sale y cómo se calculó. */
  fuente: string
  condicion: Condicion
}

export const CAMPOS_DEMANDA = ['frecuencia_compra', 'estacionalidad', 'intencion_compra', 'demanda_insatisfecha'] as const
export type CampoDemanda = (typeof CAMPOS_DEMANDA)[number]

export interface Tamano {
  cifras: Record<Cifra, DatoCifra>
  capacidad_clientes: string
  frecuencia_compra: string
  estacionalidad: string
  intencion_compra: string
  demanda_insatisfecha: string
  condiciones: Partial<Record<CampoDemanda, Condicion>>
}

export const tamanoVacio = (): Tamano => ({
  cifras: {
    gasto: { valor: '', fuente: '', condicion: 'estimado' },
    tam: { valor: '', fuente: '', condicion: 'estimado' },
    sam: { valor: '', fuente: '', condicion: 'estimado' },
    som: { valor: '', fuente: '', condicion: 'supuesto' },
  },
  capacidad_clientes: '',
  frecuencia_compra: '',
  estacionalidad: '',
  intencion_compra: '',
  demanda_insatisfecha: '',
  condiciones: {},
})

const t = (s: string) => s.replace(/\s+/g, ' ').trim()
const hay = (s: string) => t(s).length > 0
export const num = (s: string): number | null => {
  const x = s.trim()
  if (!x) return null
  const n = Number(x)
  return Number.isFinite(n) && n >= 0 ? n : null
}

/** Valores en dinero por año. Solo se calculan si hay cantidad y gasto. */
export function calcularMercado(tm: Tamano) {
  const gasto = num(tm.cifras.gasto.valor)
  const en = (c: Cifra) => {
    const n = num(tm.cifras[c].valor)
    return n !== null && gasto !== null ? n * gasto : null
  }
  return { tam: en('tam'), sam: en('sam'), som: en('som') }
}

export function formatoDinero(n: number | null, moneda: string | null): string {
  if (n === null) return '—'
  const codigo = (moneda ?? '').trim().toUpperCase()
  if (/^[A-Z]{3}$/.test(codigo)) {
    try {
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency: codigo, maximumFractionDigits: 0 }).format(n)
    } catch {
      /* sigue abajo */
    }
  }
  return `${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)}${moneda ? ` ${moneda}` : ''}`
}

export const formatoNumero = (n: number | null) => (n === null ? '—' : new Intl.NumberFormat('es-CO').format(n))

/* -------------------------------------------------------------------------- */
/* Alertas y revisión                                                         */
/* -------------------------------------------------------------------------- */

export type NivelAlerta = 'Informativa' | 'Preventiva' | 'Importante' | 'Crítica'
export interface Alerta {
  nivel: NivelAlerta
  texto: string
}

const NOMBRE: Record<Cifra, string> = {
  gasto: 'el gasto anual por cliente',
  tam: 'el TAM (mercado total)',
  sam: 'el SAM (mercado que puedes atender)',
  som: 'el SOM (lo que puedes captar)',
}

export function alertasMercado(tm: Tamano): Alerta[] {
  const a: Alerta[] = []
  const v = (c: Cifra) => num(tm.cifras[c].valor)
  const tam = v('tam')
  const sam = v('sam')
  const som = v('som')
  const cap = num(tm.capacidad_clientes)

  if (tam !== null && sam !== null && sam > tam)
    a.push({ nivel: 'Crítica', texto: 'El SAM es mayor que el TAM. Lo que puedes atender no puede ser más grande que el mercado total. Revisa que ambos usen la misma unidad (clientes por año).' })
  if (sam !== null && som !== null && som > sam)
    a.push({ nivel: 'Crítica', texto: 'El SOM es mayor que el SAM. Lo que puedes captar no puede superar lo que puedes atender.' })
  if (tam !== null && som !== null && sam === null && som > tam)
    a.push({ nivel: 'Crítica', texto: 'El SOM es mayor que el TAM. Revisa las cifras.' })
  if (som !== null && cap !== null && som > cap)
    a.push({ nivel: 'Crítica', texto: 'Quieres captar más clientes de los que tu capacidad permite atender. Baja el SOM o aumenta la capacidad.' })
  if (som !== null && cap === null)
    a.push({ nivel: 'Importante', texto: 'Falta tu capacidad de atención. Sin ella no se puede saber si el SOM es realista.' })

  for (const c of CIFRAS) {
    const d = tm.cifras[c]
    if (hay(d.valor) && !hay(d.fuente))
      a.push({ nivel: 'Importante', texto: `Falta decir de dónde sale ${NOMBRE[c]}. Toda cifra necesita su fuente o su cálculo.` })
  }
  if (sam !== null && som !== null && sam > 0 && som / sam > 0.2 && !hay(tm.cifras.som.fuente))
    a.push({ nivel: 'Importante', texto: 'Esperas captar más del 20 % de lo que puedes atender y no explicas por qué. Cuenta qué lo hace posible (capacidad, presupuesto de ventas, competencia).' })
  else if (sam !== null && som !== null && sam > 0 && som / sam > 0.2)
    a.push({ nivel: 'Preventiva', texto: 'Esperas captar más del 20 % de lo que puedes atender. Asegúrate de que tu explicación lo respalde.' })

  const sinRespaldo = CIFRAS.filter((c) => hay(tm.cifras[c].valor) && (tm.cifras[c].condicion === 'supuesto' || tm.cifras[c].condicion === 'pendiente'))
  if (sinRespaldo.length > 0)
    a.push({ nivel: 'Preventiva', texto: `${sinRespaldo.length === 1 ? 'Una cifra está marcada' : `${sinRespaldo.length} cifras están marcadas`} como supuesto o pendiente. Compruébalas con fuentes, entrevistas o datos reales antes de tratarlas como hechos.` })
  if (hay(tm.intencion_compra) && (tm.condiciones.intencion_compra ?? 'aportado') !== 'verificado')
    a.push({ nivel: 'Informativa', texto: 'Una encuesta de interés no es lo mismo que ventas reales. La disposición declarada no es comportamiento real.' })
  return a
}

export interface Revision {
  clave: string
  texto: string
  cumple: boolean
  obligatorio: boolean
  ayuda: string
}

export function revisarMercadoDemanda(tm: Tamano): Revision[] {
  const completa = (c: Cifra) => hay(tm.cifras[c].valor) && hay(tm.cifras[c].fuente)
  return [
    { clave: 'gasto', texto: 'Dice cuánto gasta un cliente al año y de dónde sale ese dato.', cumple: completa('gasto'), obligatorio: true, ayuda: 'Una cifra aproximada con su explicación basta por ahora.' },
    { clave: 'tam', texto: 'Tiene el TAM con su fuente.', cumple: completa('tam'), obligatorio: true, ayuda: 'Cuántos clientes en total podrían necesitar lo que ofreces.' },
    { clave: 'sam', texto: 'Tiene el SAM con su fuente.', cumple: completa('sam'), obligatorio: true, ayuda: 'De esos, cuántos puedes atender por tu territorio, producto y forma de trabajo.' },
    { clave: 'som', texto: 'Tiene el SOM explicado.', cumple: completa('som'), obligatorio: true, ayuda: 'Cuántos puedes captar de verdad, y por qué (no un porcentaje cualquiera).' },
    { clave: 'capacidad', texto: 'Dice cuántos clientes puede atender al año.', cumple: hay(tm.capacidad_clientes), obligatorio: true, ayuda: 'Es el límite real de tu equipo, tiempo o producción.' },
    { clave: 'coherencia', texto: 'Las cifras son coherentes (SOM ≤ SAM ≤ TAM y SOM ≤ capacidad).', cumple: alertasMercado(tm).every((x) => x.nivel !== 'Crítica'), obligatorio: true, ayuda: 'Revisa las alertas de arriba.' },
    { clave: 'frecuencia', texto: 'Dice cada cuánto compra un cliente.', cumple: hay(tm.frecuencia_compra), obligatorio: false, ayuda: 'Por ejemplo: una vez al mes, dos veces al año.' },
    { clave: 'estacionalidad', texto: 'Dice si hay épocas de más o menos compra.', cumple: hay(tm.estacionalidad), obligatorio: false, ayuda: 'Por ejemplo: diciembre vende el doble.' },
    { clave: 'intencion', texto: 'Cuenta qué muestra que alguien compraría (entrevistas, pedidos, preventas).', cumple: hay(tm.intencion_compra), obligatorio: false, ayuda: 'Lo que la gente hizo vale más que lo que dijo que haría.' },
    { clave: 'insatisfecha', texto: 'Dice qué parte de la necesidad hoy nadie la atiende bien.', cumple: hay(tm.demanda_insatisfecha), obligatorio: false, ayuda: 'Es la brecha que tu proyecto puede ocupar.' },
  ]
}
