import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Marca de qué canal viene un proyecto: 'directo' (el normal, por el
 * website) o 'marca_blanca' (Serving lo opera por dentro, para vender
 * bajo la marca de un socio más adelante).
 *
 * Por ahora esto es solo una etiqueta manual que pone el equipo desde
 * /admin/proyectos, para poder ver esos proyectos aparte en
 * /admin/marca-blanca. La separación real de datos por socio (que cada
 * socio solo pueda ver los suyos) es un paso aparte, todavía no
 * construido — ver `marca-blanca-socio-volumen-2026-09-13.md`.
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.email?.toLowerCase() !== 'servingbuilderapp@gmail.com') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { proyectoId, canal } = await req.json()
    if (!proyectoId || !canal) {
      return NextResponse.json({ error: 'Falta el proyecto o el canal' }, { status: 400 })
    }
    if (canal !== 'directo' && canal !== 'marca_blanca') {
      return NextResponse.json({ error: 'Canal no reconocido' }, { status: 400 })
    }

    const { error } = await supabase
      .from('proyectos_clientes_serving')
      .update({ canal_origen: canal })
      .eq('id', proyectoId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al actualizar'
    return NextResponse.json({ error: mensaje }, { status: 500 })
  }
}
