import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { PrecargaFinanciero, TipoCalculadora } from '@/lib/empresarial/calculadoras'

const aNumero = (x: unknown) => (x === null || x === undefined || x === '' || !Number.isFinite(Number(x)) ? null : Number(x))

export interface ContextoCalculadora {
  proyecto: { id: string; nombre: string; moneda: string | null } | null
  guardado: unknown | null
  precarga: PrecargaFinanciero | null
}

/** Lee, con la sesión de la persona, el proyecto, lo ya guardado y las cifras del Financiero básico. */
export async function cargarContexto(proyectoId: string | undefined, tipo: TipoCalculadora): Promise<ContextoCalculadora> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/empresarial')
  if (!proyectoId) return { proyecto: null, guardado: null, precarga: null }

  const { data: proyecto } = await supabase.from('sfpe_proyectos').select('id, nombre, moneda').eq('id', proyectoId).maybeSingle()
  if (!proyecto) return { proyecto: null, guardado: null, precarga: null }

  const { data: fila } = await supabase.from('sfpe_calculadoras').select('datos').eq('proyecto_id', proyecto.id).eq('tipo', tipo).maybeSingle()
  const { data: g } = await supabase.from('sfpe_financiero').select('precio_unitario, costo_variable_unitario, unidades_mes, aporte_propio').eq('proyecto_id', proyecto.id).maybeSingle()
  const { data: items } = await supabase.from('sfpe_financiero_items').select('tipo, valor, concepto').eq('proyecto_id', proyecto.id)

  let precarga: PrecargaFinanciero | null = null
  if (g || (items && items.length > 0)) {
    const precio = aNumero(g?.precio_unitario)
    const costo = aNumero(g?.costo_variable_unitario)
    const unid = aNumero(g?.unidades_mes)
    const suma = (t: string) => (items ?? []).filter((i) => i.tipo === t && String(i.concepto ?? '').trim()).reduce((a, i) => a + (aNumero(i.valor) ?? 0), 0)
    precarga = {
      ventasMes: precio !== null && unid !== null ? precio * unid : null,
      variablesMes: costo !== null && unid !== null ? costo * unid : null,
      fijosMes: suma('costo_fijo') || null,
      inversion: suma('inversion') || null,
      aportePropio: aNumero(g?.aporte_propio),
    }
  }
  return {
    proyecto: { id: proyecto.id as string, nombre: proyecto.nombre as string, moneda: proyecto.moneda as string | null },
    guardado: fila?.datos ?? null,
    precarga,
  }
}
