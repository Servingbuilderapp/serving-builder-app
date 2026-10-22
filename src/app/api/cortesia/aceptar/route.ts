import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { arrancarEstructuracion } from '@/lib/arrancarEstructuracion'

/** El cliente acepta las condiciones de su cortesía: el proyecto queda activo. */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const correo = (user?.email || '').toLowerCase().trim()
    if (!correo) return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })

    // Sin la autorización de datos personales (habeas data) no se acepta la cortesía.
    const cuerpo = await req.json().catch(() => ({}))
    if (cuerpo?.autorizaDatos !== true) {
      return NextResponse.json({ error: 'Debes autorizar el tratamiento de tus datos personales.' }, { status: 400 })
    }

    const { data: cort } = await supabaseAdmin
      .from('cortesias')
      .select('id, proyecto_id, nombre, acepto_en, comision_pct, dias, inicia_en')
      .ilike('correo', correo)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle<{ id: string; proyecto_id: string | null; nombre: string | null; acepto_en: string | null; comision_pct: number; dias: number; inicia_en: string | null }>()
    if (!cort || !cort.proyecto_id) return NextResponse.json({ error: 'No encontramos tu invitación.' }, { status: 404 })
    if (cort.acepto_en) return NextResponse.json({ success: true })

    const ip = (req.headers.get('x-forwarded-for') || 'desconocida').split(',')[0].trim()
    const ahora = new Date().toISOString()

    await supabaseAdmin
      .from('cortesias')
      .update({ acepto_en: ahora, acepto_ip: ip, estado: 'activa' })
      .eq('id', cort.id)

    await supabaseAdmin
      .from('proyectos_clientes_serving')
      .update({
        estado_actual: 'pagado',
        contrato_firmado: true,
        firma_digital: { nombre: cort.nombre, aceptado: true, fecha: ahora, ip, tipo: 'cortesia', comision_pct: cort.comision_pct, autoriza_datos_personales: true },
      })
      .eq('id', cort.proyecto_id)

    // Si ya había un documento cargado, la estructuración arranca sola.
    await arrancarEstructuracion(cort.proyecto_id, req.nextUrl.origin)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Error aceptando cortesía:', e)
    return NextResponse.json({ error: 'No se pudo guardar. Intenta de nuevo.' }, { status: 500 })
  }
}
