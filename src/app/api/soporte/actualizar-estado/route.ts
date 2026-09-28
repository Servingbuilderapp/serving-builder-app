import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ESTADOS_VALIDOS = ['Abierto', 'En Proceso', 'Resuelto']

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.email?.toLowerCase() !== 'servingbuilderapp@gmail.com') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { quejaId, estado } = await req.json()
    if (!quejaId || !ESTADOS_VALIDOS.includes(estado)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const { error } = await supabase
      .from('quejas_fallos_ia')
      .update({ estado })
      .eq('id', quejaId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error actualizando queja:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
