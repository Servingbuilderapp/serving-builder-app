import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { user, supabase } = await (async () => {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      return { user, supabase }
    })()

    if (!user || user.email?.toLowerCase() !== 'servingbuilderapp@gmail.com') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { proyectoId } = await req.json()
    if (!proyectoId) {
      return NextResponse.json({ error: 'Falta el proyecto' }, { status: 400 })
    }

    const { error } = await supabase
      .from('proyectos_clientes_serving')
      .update({ estado_actual: 'pagado' })
      .eq('id', proyectoId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al actualizar' }, { status: 500 })
  }
}
