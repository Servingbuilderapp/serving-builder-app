import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

/**
 * Autoguardado de notas del curso "Entendiendo la Formulación de Proyectos"
 * (el único curso en formato presentación, por ahora). Cada nota queda
 * asociada al correo de la persona que inició sesión — nunca se confía en
 * un correo que venga del formulario — al curso y al número de diapositiva.
 *
 * Para saber quién inició sesión se usa el cliente normal (con la cookie
 * de la persona). Para guardar la nota se usa la llave de service role,
 * porque `academia_notas` tiene el candado de seguridad (RLS) activado sin
 * políticas abiertas — el cliente normal no tiene permiso para escribir ahí.
 *
 * Se hace upsert: si ya existe una nota para esa diapositiva, se reemplaza.
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { curso, diapositiva, nota } = await req.json()

    if (curso !== 'estructuracion' && curso !== 'formulacion') {
      return NextResponse.json({ error: 'Curso no reconocido' }, { status: 400 })
    }
    if (typeof diapositiva !== 'number' || !Number.isFinite(diapositiva)) {
      return NextResponse.json({ error: 'Falta el número de diapositiva' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabaseAdmin
      .from('academia_notas')
      .upsert(
        {
          correo_cliente: user.email,
          curso,
          diapositiva,
          nota: typeof nota === 'string' ? nota : '',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'correo_cliente,curso,diapositiva' }
      )

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error guardando nota de Academia:', error)
    const mensaje = error instanceof Error ? error.message : 'Error al guardar la nota'
    return NextResponse.json({ error: mensaje }, { status: 500 })
  }
}
