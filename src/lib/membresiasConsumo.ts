import type { SupabaseClient } from '@supabase/supabase-js'
import { ETIQUETA_BENEFICIO, type ClaveBeneficio } from '@/lib/membresias'
import { resumenDeUso } from '@/lib/membresiasUso'

export type ResultadoConsumo =
  | { ok: true; restante: number | null; membresiaId: string }
  | { ok: false; motivo: 'sin_membresia' | 'vencida' | 'no_incluido' | 'sin_cupo' | 'error'; mensaje: string }

type FilaMembresia = { id: string; nivel: string; estado: string; fecha_inicio: string | null; fecha_proximo_pago: string | null }

/** Busca la membresía activa y vigente de un cliente por su correo. */
export async function membresiaVigente(servicio: SupabaseClient, correo: string) {
  const { data } = await servicio
    .from('membresias_clientes')
    .select('id, nivel, estado, fecha_inicio, fecha_proximo_pago')
    .ilike('correo_cliente', correo.trim())
    .eq('estado', 'activa')
    .order('created_at', { ascending: false })
  const filas = (data || []) as FilaMembresia[]
  const vigente = filas.find((m) => !m.fecha_proximo_pago || new Date(m.fecha_proximo_pago).getTime() >= Date.now())
  return { vigente, hayActivaVencida: filas.length > 0 && !vigente }
}

/**
 * ÚNICA puerta para gastar un beneficio de membresía.
 * Revisa que haya membresía activa y vigente, que el nivel incluya el beneficio
 * y que quede cupo en el mes. Si todo está bien, descuenta 1 y lo deja anotado.
 * Todo lo que gaste un beneficio (una herramienta, el equipo a mano) debe pasar por aquí.
 */
export async function consumirBeneficio(
  servicio: SupabaseClient,
  correo: string,
  beneficio: ClaveBeneficio,
  nota?: string | null,
  /** true = solo revisa que haya cupo, sin descontar nada (para no gastar IA si no hay cupo). */
  soloRevisar = false,
): Promise<ResultadoConsumo> {
  const { vigente, hayActivaVencida } = await membresiaVigente(servicio, correo)
  if (!vigente) {
    return hayActivaVencida
      ? { ok: false, motivo: 'vencida', mensaje: 'Tu membresía ya venció. Renueva el pago para seguir usando tus beneficios.' }
      : { ok: false, motivo: 'sin_membresia', mensaje: 'No encontramos una membresía activa con este correo.' }
  }

  const resumen = await resumenDeUso(servicio, vigente)
  const linea = resumen.lineas.find((l) => l.clave === beneficio)
  if (!linea || linea.limite === 0) {
    return { ok: false, motivo: 'no_incluido', mensaje: `${ETIQUETA_BENEFICIO[beneficio]} no está incluido en tu nivel.` }
  }
  if (linea.restante !== null && linea.restante <= 0) {
    return { ok: false, motivo: 'sin_cupo', mensaje: `Ya usaste todo el cupo de este mes en ${ETIQUETA_BENEFICIO[beneficio]}. Se renueva el ${resumen.hasta.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}.` }
  }

  if (soloRevisar) {
    return { ok: true, restante: linea.restante, membresiaId: vigente.id }
  }

  const { error } = await servicio.from('membresias_consumos').insert({
    membresia_id: vigente.id,
    beneficio,
    cantidad: 1,
    nota: nota ? nota.slice(0, 200) : null,
  })
  if (error) return { ok: false, motivo: 'error', mensaje: 'No se pudo registrar el uso. Intenta de nuevo.' }

  return { ok: true, restante: linea.restante === null ? null : linea.restante - 1, membresiaId: vigente.id }
}
