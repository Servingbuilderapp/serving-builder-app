/**
 * TASA DE CAMBIO Y IVA PARA COLOMBIA.
 *
 * La tasa sale de la TRM oficial (datos abiertos de Colombia) y se renueva una
 * vez al día, a las 5 p. m. de lunes a viernes. Si esa fuente falla, se usa la tasa fija de respaldo de
 * `membresias.ts`, así el cobro nunca se queda sin precio.
 *
 * El IVA se suma al precio (no va incluido). Se calcula solo para Colombia.
 */
import { TASA_COP_POR_USD } from '@/lib/membresias'

export const IVA_COLOMBIA = 0.19

const URL_TRM = 'https://www.datos.gov.co/resource/32sa-8pi3.json?$limit=1&$order=vigenciadesde%20DESC'

let guardada: { tasa: number; fecha: string; fuente: 'trm'; ciclo: string } | null = null

/**
 * Identifica el "ciclo" de la tasa: la tasa se renueva UNA vez al día, a las 5 p. m.
 * (hora de Colombia) de lunes a viernes. Sábado y domingo no hay cambio: se sigue
 * con la del viernes. El ciclo es la fecha del último 5 p. m. hábil ya cumplido.
 */
function cicloActual(ahora: Date = new Date()): string {
  const col = new Date(ahora.getTime() - 5 * 60 * 60 * 1000) // Colombia = UTC-5, sin horario de verano
  if (col.getUTCHours() < 17) col.setUTCDate(col.getUTCDate() - 1)
  while (col.getUTCDay() === 0 || col.getUTCDay() === 6) col.setUTCDate(col.getUTCDate() - 1)
  return col.toISOString().slice(0, 10)
}

/** Día siguiente (calendario) a una fecha AAAA-MM-DD. */
function diaSiguiente(fecha: string): string {
  const d = new Date(fecha + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

export async function obtenerTasa(): Promise<{ tasa: number; fecha: string; fuente: 'trm' | 'respaldo' }> {
  const ciclo = cicloActual()
  if (guardada && guardada.ciclo === ciclo) {
    return { tasa: guardada.tasa, fecha: guardada.fecha, fuente: guardada.fuente }
  }
  try {
    const res = await fetch(URL_TRM, { signal: AbortSignal.timeout(6000), cache: 'no-store' })
    if (res.ok) {
      const filas = (await res.json()) as Array<{ valor?: string; vigenciadesde?: string }>
      const valor = Number(filas?.[0]?.valor)
      if (Number.isFinite(valor) && valor > 1000 && valor < 10000) {
        const fecha = (filas[0].vigenciadesde || '').slice(0, 10)
        // La tasa del ciclo está completa solo si la fuente ya publicó la del día siguiente al 5 p. m.
        // Si todavía no la publica, se usa la que haya y se vuelve a preguntar en 30 minutos.
        const publicada = fecha >= diaSiguiente(ciclo)
        guardada = { tasa: valor, fecha, fuente: 'trm', ciclo: publicada ? ciclo : ciclo + '#reintento:' + Math.floor(Date.now() / (30 * 60 * 1000)) }
        return { tasa: valor, fecha, fuente: 'trm' }
      }
    }
  } catch {
    // Sin conexión con la fuente: se usa la tasa de respaldo.
  }
  return { tasa: TASA_COP_POR_USD, fecha: '', fuente: 'respaldo' }
}

/** Precio en pesos de un valor en dólares: base, IVA y total (redondeados a miles de pesos en la base). */
export function precioColombia(usd: number, tasa: number): { base: number; iva: number; total: number } {
  const base = Math.round((usd * tasa) / 1000) * 1000
  const iva = Math.round(base * IVA_COLOMBIA)
  return { base, iva, total: base + iva }
}
