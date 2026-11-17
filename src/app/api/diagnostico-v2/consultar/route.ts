import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Si hay que volver a generar el diagnóstico, la IA puede tardar; se le da el mismo tiempo que al diagnóstico.
export const maxDuration = 120

const LISTAS_DEL_RESULTADO = ['sectoresSugeridos', 'mecanismosSugeridos', 'brechasCriticas', 'pasosRecomendados']

/** Un diagnóstico está incompleto si alguna de sus cuatro listas falta o quedó vacía. */
function resultadoIncompleto(r: Record<string, unknown> | null | undefined): boolean {
  if (!r) return true
  return LISTAS_DEL_RESULTADO.some((k) => !Array.isArray(r[k]) || (r[k] as unknown[]).length === 0)
}

/**
 * El cliente vuelve a ver su diagnóstico: manda el código de su enlace y su correo.
 * Solo se devuelve el resultado si el correo coincide con el del diagnóstico.
 * Si lo guardado quedó incompleto, se vuelve a generar con las respuestas que el cliente ya dio.
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
      .select('email, tipo_proyecto, resultado_completo, datos_formulario')
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

    // Si el diagnóstico guardado quedó incompleto, se genera de nuevo con sus mismas respuestas
    // (así la persona no tiene que volver a contestar el formulario) y se guarda el nuevo.
    let resultado = data.resultado_completo
    if (resultadoIncompleto(resultado) && data.datos_formulario) {
      try {
        const respuesta = await fetch(new URL('/api/diagnostico-v2', req.url), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data.datos_formulario, sinGuardar: true }),
        })
        if (respuesta.ok) {
          const nuevo = await respuesta.json()
          if (!resultadoIncompleto(nuevo)) {
            resultado = nuevo
            await supabaseAdmin
              .from('diagnosticos')
              .update({ resultado_completo: nuevo })
              .eq('codigo_acceso', codigoLimpio)
          }
        }
      } catch (errorRegenerar) {
        console.error('No se pudo volver a generar el diagnóstico:', errorRegenerar)
      }
    }

    return NextResponse.json({
      resultado,
      nombreProyecto: data.tipo_proyecto || '',
    })
  } catch (error) {
    console.error('Error en /api/diagnostico-v2/consultar:', error)
    return NextResponse.json({ error: 'No se pudo abrir el diagnóstico. Intenta de nuevo.' }, { status: 500 })
  }
}
