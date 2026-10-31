import { NextRequest, NextResponse, after } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { esEquipoServing } from '@/lib/guardiaEquipo'
import { prepararPostulacion } from '@/lib/motorPostulacion'

// Preparar la postulación hace varias consultas al modelo seguidas.
export const maxDuration = 180

/**
 * El equipo aprueba el permiso que un cliente pidió para postular a una convocatoria
 * más allá de su cupo semanal. Se abre desde el botón del correo de aviso.
 *
 * GET /api/postulacion/aprobar-permiso?candidata=...&proyecto=...
 * Solo el equipo de Serving (con sesión iniciada).
 */

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

function pagina(titulo: string, texto: string, estado = 200) {
  const html = `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${titulo}</title><body style="font-family:system-ui;background:#54142B;color:#F3E7DC;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0"><div style="max-width:420px;padding:24px;text-align:center"><h1 style="font-size:20px">${titulo}</h1><p style="line-height:1.5">${texto}</p></div></body></html>`
  return new NextResponse(html, { status: estado, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

export async function GET(req: NextRequest) {
  try {
    if (!(await esEquipoServing())) {
      return pagina('Inicia sesión', 'Para aprobar este permiso entra primero a la plataforma con tu cuenta del equipo y vuelve a abrir el botón del correo.', 401)
    }
    const candidata = req.nextUrl.searchParams.get('candidata')
    const proyecto = req.nextUrl.searchParams.get('proyecto')
    if (!candidata || !proyecto) return pagina('Faltan datos', 'El enlace está incompleto.', 400)

    const { data: cand } = await supabase
      .from('convocatorias_candidatas_proyecto')
      .select('id, nombre, biblioteca_id, eleccion_cliente')
      .eq('id', candidata)
      .eq('id_proyecto', proyecto)
      .maybeSingle<{ id: string; nombre: string | null; biblioteca_id: string | null; eleccion_cliente: string | null }>()
    if (!cand || !cand.biblioteca_id) return pagina('No encontrada', 'No encontramos esa convocatoria en el proyecto.', 404)
    if (cand.eleccion_cliente === 'elegida') return pagina('Ya estaba aprobado', 'Este permiso ya se había aprobado antes.')

    await supabase
      .from('convocatorias_candidatas_proyecto')
      .update({ eleccion_cliente: 'elegida' })
      .eq('id', cand.id)

    const bibliotecaId = cand.biblioteca_id
    after(async () => {
      try {
        await prepararPostulacion(supabase, proyecto, bibliotecaId)
      } catch (e) {
        console.error('[aprobar-permiso] Error preparando la postulación:', e)
      }
    })

    return pagina('Permiso aprobado', `Listo. La plataforma ya está preparando la postulación a «${(cand.nombre || 'la convocatoria').replace(/[<>&]/g, '')}». Puedes cerrar esta ventana.`)
  } catch (e) {
    console.error('[aprobar-permiso] Error:', e)
    return pagina('Algo falló', 'No se pudo aprobar el permiso. Intenta de nuevo.', 500)
  }
}
