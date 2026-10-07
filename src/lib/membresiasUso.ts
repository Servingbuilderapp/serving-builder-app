import type { SupabaseClient } from '@supabase/supabase-js'
import { CLAVES_BENEFICIO, CUPOS_POR_NIVEL, type ClaveBeneficio, type NivelMembresia } from '@/lib/membresias'

/**
 * Los beneficios se renuevan cada mes, contado desde el día en que la
 * membresía se activó (no desde el día 1 del calendario). Esto vale también
 * para el ciclo anual: paga una vez al año, pero el cupo se renueva cada mes.
 */
export function periodoMensual(fechaInicio: string | null, ahora: Date = new Date()) {
  const inicio = fechaInicio ? new Date(fechaInicio) : ahora
  let meses = (ahora.getFullYear() - inicio.getFullYear()) * 12 + (ahora.getMonth() - inicio.getMonth())
  const desde = new Date(inicio)
  desde.setMonth(inicio.getMonth() + meses)
  if (desde > ahora) {
    meses -= 1
    desde.setTime(inicio.getTime())
    desde.setMonth(inicio.getMonth() + meses)
  }
  const hasta = new Date(inicio)
  hasta.setMonth(inicio.getMonth() + meses + 1)
  return { desde, hasta }
}

export type LineaBeneficio = {
  clave: ClaveBeneficio
  usados: number
  /** null = sin límite */
  limite: number | null
  /** null = sin límite */
  restante: number | null
}

export type ResumenUso = {
  desde: Date
  hasta: Date
  lineas: LineaBeneficio[]
}

type MembresiaMinima = { id: string; nivel: string; fecha_inicio: string | null }

/** Calcula cuánto lleva gastado y cuánto le queda en el mes en curso. */
export async function resumenDeUso(servicio: SupabaseClient, membresia: MembresiaMinima): Promise<ResumenUso> {
  const { desde, hasta } = periodoMensual(membresia.fecha_inicio)
  const { data } = await servicio
    .from('membresias_consumos')
    .select('beneficio, cantidad')
    .eq('membresia_id', membresia.id)
    .gte('created_at', desde.toISOString())
    .lt('created_at', hasta.toISOString())

  const usadosPor = new Map<string, number>()
  for (const fila of data || []) {
    usadosPor.set(fila.beneficio, (usadosPor.get(fila.beneficio) || 0) + (fila.cantidad || 0))
  }

  const cupos = CUPOS_POR_NIVEL[membresia.nivel as NivelMembresia['slug']]
  const lineas: LineaBeneficio[] = CLAVES_BENEFICIO.map((clave) => {
    const limite = cupos ? cupos[clave] : 0
    const usados = usadosPor.get(clave) || 0
    return { clave, usados, limite, restante: limite === null ? null : Math.max(0, limite - usados) }
  })
  return { desde, hasta, lineas }
}
