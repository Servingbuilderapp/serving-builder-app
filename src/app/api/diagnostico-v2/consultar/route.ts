import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * El cliente vuelve a ver su diagnóstico: manda el código de su enlace y su correo.
 * Solo se devuelve el resultado si el correo coincide con el del diagnóstico.
 */
export async function POST(req: Request) {
  try {
    const { codigo, email } = await req.json()
    const codigoLimpio = String(codigo || '').trim()
    const correo = String(email || '').trim().toLowerCase()

    if (!codigoLimpio || !correo) {
      return NextResponse.json({ error: 'Escribe tu correo para abrir el diagnóstico.' }, { status: 400 })
    }

    const { data } = await supabaseAdmin
      .from('diagnosticos')
      .select('email, tipo_proyecto, resultado_completo')
      .eq('codigo_acceso', codigoLimpio)
      .maybeSingle()

    // Mismo mensaje si el código no existe o si el correo no coincide.
    const correoGuardado = String(data?.email || '').trim().toLowerCase()
    if (!data || !data.resultado_completo || correoGuardado !== correo) {
      return NextResponse.json(
        { error: 'No encontramos un diagnóstico con ese correo. Revisa que sea el mismo que usaste.' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      resultado: data.resultado_completo,
      nombreProyecto: data.tipo_proyecto || '',
    })
  } catch (error) {
    console.error('Error en /api/diagnostico-v2/consultar:', error)
    return NextResponse.json({ error: 'No se pudo abrir el diagnóstico. Intenta de nuevo.' }, { status: 500 })
  }
}
