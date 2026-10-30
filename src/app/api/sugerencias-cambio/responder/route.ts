import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { motorAutorizado } from '@/lib/candadoMotores'

/** El cliente responde una sugerencia: la acepta tal cual, la edita o la deja como está. */

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { id, accion, texto } = (await req.json().catch(() => ({}))) as { id?: string; accion?: string; texto?: string }
    if (!id || !['aceptar', 'editar', 'descartar'].includes(String(accion))) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }
    const { data: fila } = await supabase.from('sugerencias_cambio').select('id, id_proyecto, propuesta').eq('id', id).maybeSingle()
    if (!fila) return NextResponse.json({ error: 'No existe' }, { status: 404 })
    if (!(await motorAutorizado(req, String(fila.id_proyecto)))) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const final = String(texto || '').trim().slice(0, 4000)
    const cambios =
      accion === 'descartar'
        ? { estado: 'descartada', texto_final: null }
        : accion === 'aceptar'
          ? { estado: 'aceptada', texto_final: String(fila.propuesta) }
          : { estado: 'editada', texto_final: final }
    if (accion === 'editar' && !final) return NextResponse.json({ error: 'El texto está vacío' }, { status: 400 })

    const { error } = await supabase
      .from('sugerencias_cambio')
      .update({ ...cambios, respondida_en: new Date().toISOString() })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
