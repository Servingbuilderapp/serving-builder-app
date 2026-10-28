import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { esEquipoServing } from '@/lib/guardiaEquipo'

/**
 * Decide qué proyecto muestra una pantalla del cliente.
 *
 * - Cliente normal: su proyecto más reciente (por el correo con el que entró).
 * - Equipo de Serving con ?proyecto=<id> en la dirección: ESE proyecto, en
 *   modo solo lectura, para ver exactamente lo que ve el cliente.
 *
 * Antes cada pantalla tomaba "el último proyecto a nombre de quien entra", así
 * que el equipo siempre caía en su proyecto de prueba (Ganadería).
 */

type ClienteDb = Awaited<ReturnType<typeof createClient>>

export type ProyectoVisto = {
  /** Cliente de base de datos a usar: el normal, o el de servicio si el equipo mira a otro cliente. */
  db: ClienteDb
  proyectoId: string | null
  nombreProyecto: string | null
  nombreCliente: string | null
  /** true cuando el equipo está mirando el proyecto de un cliente. */
  vistaEquipo: boolean
}

type FilaProyecto = { id: string | number; nombre_iniciativa: string | null; nombre_cliente: string | null }

export async function resolverProyectoVisto(proyectoParam?: string | null): Promise<ProyectoVisto> {
  const supabase = await createClient()

  const idPedido = (proyectoParam || '').trim()
  if (idPedido && (await esEquipoServing())) {
    const { data } = await supabaseAdmin
      .from('proyectos_clientes_serving')
      .select('id, nombre_iniciativa, nombre_cliente')
      .eq('id', idPedido)
      .maybeSingle<FilaProyecto>()
    if (data?.id) {
      return {
        db: supabaseAdmin as unknown as ClienteDb,
        proyectoId: String(data.id),
        nombreProyecto: data.nombre_iniciativa,
        nombreCliente: data.nombre_cliente,
        vistaEquipo: true,
      }
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const correo = user?.email || ''

  const { data } = await supabase
    .from('proyectos_clientes_serving')
    .select('id, nombre_iniciativa, nombre_cliente')
    .eq('correo_cliente', correo)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<FilaProyecto>()

  return {
    db: supabase,
    proyectoId: data?.id ? String(data.id) : null,
    nombreProyecto: data?.nombre_iniciativa || null,
    nombreCliente: data?.nombre_cliente || null,
    vistaEquipo: false,
  }
}
