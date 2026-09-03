import { NextResponse } from 'next/server'
import { after } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { arrancarEstructuracion } from '@/lib/arrancarEstructuracion'

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

    // Aprobar el pago es lo que pone el proyecto en marcha. Si el cliente ya
    // había cargado su documento en la contratación, la estructuración arranca
    // aquí mismo, sin que nadie tenga que apretar nada. Si todavía no hay
    // documento, no pasa nada: arrancará sola cuando el cliente lo suba.
    const origen = new URL(req.url).origin
    after(async () => {
      await arrancarEstructuracion(String(proyectoId), origen)
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al actualizar'
    return NextResponse.json({ error: mensaje }, { status: 500 })
  }
}
