import { NextRequest, NextResponse } from 'next/server'
import { createClient as createClientServidor } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * Lo que hace el CLIENTE con un paso que quedó escrito pero débil
 * ("por reforzar") desde la pantalla "Lo que me piden".
 *
 *  - accion "confirmar": el cliente dice que el paso está bien como está.
 *    Solo se quita el aviso; el texto no se toca.
 *  - accion "guardar": el cliente agregó el dato que faltaba (o corrigió el
 *    texto). Se guarda su versión y se quita el aviso.
 *
 * Seguridad: se toma el proyecto de la sesión de quien llama (nunca de lo que
 * mande el navegador) y solo se permite tocar pasos que de verdad tienen aviso.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClientServidor()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 })
  }

  let cuerpo: { pasoId?: number | string; accion?: string; contenido?: string }
  try {
    cuerpo = await request.json()
  } catch {
    return NextResponse.json({ error: 'Petición mal formada' }, { status: 400 })
  }

  const pasoId = Number(cuerpo.pasoId)
  const accion = cuerpo.accion
  if (!Number.isFinite(pasoId) || (accion !== 'confirmar' && accion !== 'guardar')) {
    return NextResponse.json({ error: 'Falta el paso o la acción' }, { status: 400 })
  }

  const { data: proyecto } = await supabase
    .from('proyectos_clientes_serving')
    .select('id')
    .eq('correo_cliente', user.email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!proyecto?.id) {
    return NextResponse.json({ error: 'No encontramos tu proyecto.' }, { status: 404 })
  }

  const proyectoId = String(proyecto.id)

  const { data: fila } = await supabaseAdmin
    .from('contenido_pasos_proyecto')
    .select('id_paso, advertencia')
    .eq('id_proyecto', proyectoId)
    .eq('id_paso', pasoId)
    .maybeSingle()

  if (!fila || !String(fila.advertencia || '').trim()) {
    return NextResponse.json({ error: 'Este paso ya no tiene nada por reforzar.' }, { status: 400 })
  }

  const cambios: { advertencia: null; contenido?: string } = { advertencia: null }

  if (accion === 'guardar') {
    const texto = String(cuerpo.contenido ?? '').trim()
    if (!texto) {
      return NextResponse.json({ error: 'El texto no puede quedar vacío.' }, { status: 400 })
    }
    cambios.contenido = texto
  }

  const { error } = await supabaseAdmin
    .from('contenido_pasos_proyecto')
    .update(cambios)
    .eq('id_proyecto', proyectoId)
    .eq('id_paso', pasoId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
