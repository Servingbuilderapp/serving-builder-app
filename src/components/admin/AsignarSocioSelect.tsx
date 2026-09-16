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
 * Marca de qué socio es un proyecto (o lo deja sin socio si socioId viene
 * vacío). Es lo que separa, de verdad, los proyectos de un socio de los
 * de otro y de los de Serving — no basta con la etiqueta canal_origen,
 * que solo dice "es de marca blanca", no de cuál.
 */
export async function POST(req: Request) {
  try {
    if (!(await esEquipoServing())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { proyectoId, socioId } = await req.json()
    if (!proyectoId) {
      return NextResponse.json({ error: 'Falta el proyecto' }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('proyectos_clientes_serving')
      .update({ socio_id: socioId || null })
      .eq('id', proyectoId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al asignar el socio'
    return NextResponse.json({ error: mensaje }, { status: 500 })
  }
}
