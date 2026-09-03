import { after } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const BUCKET = 'documentos-proyectos'

/** Los únicos formatos que el Motor 1 sabe leer. */
function tipoDeArchivo(nombre: string): 'pdf' | 'imagen' | 'word' | null {
  const extension = nombre.split('.').pop()?.toLowerCase() || ''
  if (extension === 'pdf') return 'pdf'
  if (['jpg', 'jpeg', 'png'].includes(extension)) return 'imagen'
  if (['doc', 'docx'].includes(extension)) return 'word'
  return null
}

/**
 * Suma días hábiles a una fecha, saltándose sábados y domingos.
 * Es el plazo que Serving se compromete a cumplir: cinco días hábiles contados
 * desde el día cero.
 */
export function sumarDiasHabiles(desde: Date, dias: number): Date {
  const fecha = new Date(desde)
  let faltan = dias
  while (faltan > 0) {
    fecha.setDate(fecha.getDate() + 1)
    const dia = fecha.getDay()
    if (dia !== 0 && dia !== 6) faltan -= 1
  }
  return fecha
}

export type ResultadoArranque = {
  arrancado: boolean
  motivo?: 'sin-documento' | 'sin-llaves' | 'error'
  documento?: string
}

/**
 * Enciende la cadena completa de motores para un proyecto.
 *
 * Esta es la chispa que faltaba. De aquí en adelante todo corre solo: el Motor
 * 1 escribe el proyecto, y cuando queda completo dispara al Motor 2 (búsqueda
 * de convocatorias), que a su vez dispara al Motor 3 (encaje). Nadie tiene que
 * apretar nada, ni estar pendiente, ni volver de vacaciones a empujarlo.
 *
 * Se llama desde dos sitios:
 *   1. Cuando el cliente sube su documento en «Lo que me piden».
 *   2. Cuando el equipo aprueba el pago, por si el documento ya estaba cargado
 *      desde la contratación y el cliente no va a subir nada nuevo.
 *
 * Además marca el DÍA CERO la primera vez: la fecha desde la que corren los
 * cinco días hábiles de entrega.
 */
export async function arrancarEstructuracion(
  proyectoId: string,
  origen: string,
): Promise<ResultadoArranque> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const llave = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !llave) return { arrancado: false, motivo: 'sin-llaves' }

  try {
    const servicio = createClient(url, llave)

    // El documento con el que se arranca es el último que subió el cliente y
    // que el motor pueda leer.
    const { data: archivos } = await servicio.storage
      .from(BUCKET)
      .list(proyectoId, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })

    const documento = (archivos || [])
      .filter((a) => a.name && a.name !== '.emptyFolderPlaceholder')
      .map((a) => ({ nombre: a.name, tipo: tipoDeArchivo(a.name) }))
      .find((a) => a.tipo !== null)

    if (!documento || !documento.tipo) return { arrancado: false, motivo: 'sin-documento' }

    // Día cero: se marca una sola vez, la primera vez que hay con qué arrancar.
    // Si las columnas todavía no existen en la base, no pasa nada: el motor
    // arranca igual y el plazo se guarda cuando se corra el SQL.
    try {
      const { data: proyecto } = await servicio
        .from('proyectos_clientes_serving')
        .select('fecha_dia_cero')
        .eq('id', proyectoId)
        .maybeSingle<{ fecha_dia_cero: string | null }>()

      if (proyecto && !proyecto.fecha_dia_cero) {
        const ahora = new Date()
        await servicio
          .from('proyectos_clientes_serving')
          .update({
            fecha_dia_cero: ahora.toISOString(),
            fecha_limite_entrega: sumarDiasHabiles(ahora, 5).toISOString(),
          })
          .eq('id', proyectoId)
      }
    } catch {
      /* el plazo es informativo: no puede impedir que el proyecto arranque */
    }

    // El motor tarda minutos. Se dispara por detrás para que quien subió el
    // archivo no se quede esperando con la pantalla congelada.
    after(async () => {
      try {
        await fetch(`${origen}/api/estructurar-proyecto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_proyecto: proyectoId,
            ruta_documento: `${proyectoId}/${documento.nombre}`,
            tipo_archivo: documento.tipo,
          }),
        })
      } catch (e) {
        console.error('No se pudo disparar el Motor 1:', e)
      }
    })

    return { arrancado: true, documento: documento.nombre.replace(/^\d+-/, '') }
  } catch (e) {
    console.error('Error arrancando la estructuración:', e)
    return { arrancado: false, motivo: 'error' }
  }
}
