import { createClient as createAdminClient } from '@supabase/supabase-js'

/**
 * Plan y fechas de acceso del Camino A.
 * Reglas del dueño (13 nov 2026):
 *  - Un mes para hacer el documento, contado desde que la persona abre el Camino A.
 *  - Un mes más de acceso después de entregar el documento.
 *  - Después, membresía mensual: Sencillo o Completo.
 *  - Al vencer sin pagar: solo lectura (ve y descarga su documento, no edita).
 */

export type ClavePlan = 'sencillo' | 'completo'

export const PLANES: Record<ClavePlan, { nombre: string; precioCop: number; descripcion: string }> = {
  sencillo: {
    nombre: 'Sencillo',
    precioCop: 70000,
    descripcion: 'Las matrices esenciales para decidir y arrancar tu proyecto.',
  },
  completo: {
    nombre: 'Completo',
    precioCop: 170000,
    descripcion: 'Todas las matrices para operar, vender y crecer.',
  },
}

export const DIAS_POR_PAGO = 30
export const DIAS_DE_AVISO = 7

export interface FilaMembresia {
  id: string
  plan: ClavePlan | null
  inicio_en: string
  documento_entregado_en: string | null
  acceso_hasta: string
}

export interface EstadoAcceso {
  /** true = puede editar. false = solo lectura. */
  activo: boolean
  diasRestantes: number
  plan: ClavePlan | null
  /** true = todavía no ha pagado ninguna membresía (está en su mes de proyecto). */
  enPeriodoInicial: boolean
}

const MS_DIA = 24 * 60 * 60 * 1000

export function calcularAcceso(fila: Pick<FilaMembresia, 'plan' | 'acceso_hasta'>, ahora = new Date()): EstadoAcceso {
  const resta = new Date(fila.acceso_hasta).getTime() - ahora.getTime()
  return {
    activo: resta > 0,
    diasRestantes: Math.max(0, Math.ceil(resta / MS_DIA)),
    plan: fila.plan,
    enPeriodoInicial: fila.plan === null,
  }
}

/** Cliente con permiso de servidor: solo se usa en rutas y páginas del servidor. */
export function clienteAdmin() {
  return createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

/**
 * Devuelve la fila de la persona. Si es la primera vez que abre el Camino A, la crea
 * (ahí empieza a contar su mes).
 */
export async function asegurarMembresia(userId: string): Promise<FilaMembresia | null> {
  const admin = clienteAdmin()
  const columnas = 'id, plan, inicio_en, documento_entregado_en, acceso_hasta'
  const { data: existente } = await admin.from('sfpe_membresias').select(columnas).eq('user_id', userId).maybeSingle()
  if (existente) return existente as FilaMembresia

  const { data: nueva, error } = await admin.from('sfpe_membresias').insert({ user_id: userId }).select(columnas).single()
  if (error) {
    // Si dos pantallas la crean a la vez, la segunda choca con la regla de "una por persona": se vuelve a leer.
    const { data: otra } = await admin.from('sfpe_membresias').select(columnas).eq('user_id', userId).maybeSingle()
    return (otra as FilaMembresia | null) ?? null
  }
  return nueva as FilaMembresia
}

/** Nueva fecha de vencimiento al pagar: 30 días contados desde hoy, o desde el vencimiento si aún no vencía. */
export function vencimientoTrasPago(accesoHastaActual: string, ahora = new Date()): Date {
  const base = Math.max(new Date(accesoHastaActual).getTime(), ahora.getTime())
  return new Date(base + DIAS_POR_PAGO * MS_DIA)
}
