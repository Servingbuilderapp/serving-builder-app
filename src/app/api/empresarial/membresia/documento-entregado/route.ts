import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { marcarDocumentoEntregado } from '@/lib/empresarial/membresia'

/**
 * Se llama cuando la persona imprime o guarda su Documento final como PDF.
 * Esa acción cuenta como "entregó el documento" y le regala un mes más de acceso,
 * una sola vez por persona.
 */
export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Inicia sesión' }, { status: 401 })

  await marcarDocumentoEntregado(user.id)
  return NextResponse.json({ ok: true })
}
