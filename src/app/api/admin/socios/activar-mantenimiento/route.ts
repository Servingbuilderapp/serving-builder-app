import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const CORREO_ADMIN = 'servingbuilderapp@gmail.com'

async function esEquipoServing() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false
  if ((user.email || '').toLowerCase().trim() === CORREO_ADMIN) return true
  const { data: perfil } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle<{ role: string | null }>()
  return perfil?.role === 'admin'
}

/**
 * Marca que un socio ya pagó su mantenimiento mensual — es lo que
 * activa (o mantiene activo) su enlace propio para que sus clientes
 * puedan entrar.
 *
 * Extiende la fecha 30 días desde HOY o desde la fecha que ya tenía
 * (lo que sea más adelante) — así si el equipo la marca unos días antes
 * de que venza, no se pierden esos días ya pagados.
 */
export async function POST(req: Request) {
  try {
    if (!(await esEquipoServing())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { socioId } = await req.json()
    if (!socioId) {
      return NextResponse.json({ error: 'Falta el socio' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: socio, error: errorLectura } = await supabase
      .from('socios')
      .select('mantenimiento_pagado_hasta')
      .eq('id', socioId)
      .single<{ mantenimiento_pagado_hasta: string | null }>()

    if (errorLectura) throw errorLectura

    const hoy = new Date()
    const fechaActual = socio.mantenimiento_pagado_hasta ? new Date(socio.mantenimiento_pagado_hasta) : null
    const base = fechaActual && fechaActual > hoy ? fechaActual : hoy
    const nuevaFecha = new Date(base)
    nuevaFecha.setDate(nuevaFecha.getDate() + 30)

    const { error } = await supabase
      .from('socios')
      .update({ mantenimiento_pagado_hasta: nuevaFecha.toISOString().slice(0, 10) })
      .eq('id', socioId)

    if (error) throw error

    return NextResponse.json({ success: true, mantenimientoPagadoHasta: nuevaFecha.toISOString().slice(0, 10) })
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al activar el mantenimiento'
    return NextResponse.json({ error: mensaje }, { status: 500 })
  }
}
