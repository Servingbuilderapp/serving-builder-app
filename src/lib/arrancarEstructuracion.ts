import { after } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cabecerasInternas } from '@/lib/candadoMotores'

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
  motivo?: 'sin-documento' | 'sin-llaves' | 'sin-contrato' | 'error'
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

    // Regla fija del dueño: NINGÚN proyecto arranca sin contrato aceptado
    // (de pago, de cortesía o de marca blanca). Es la compuerta única: todos
    // los caminos que arrancan la estructuración pasan por esta función.
    const { data: contrato } = await servicio
      .from('proyectos_clientes_serving')
      .select('contrato_firmado, firma_digital')
      .eq('id', proyectoId)
      .maybeSingle<{ contrato_firmado: boolean | null; firma_digital: { aceptado?: boolean } | null }>()
    const aceptoContrato = !!contrato?.contrato_firmado || !!contrato?.firma_digital?.aceptado
    if (!aceptoContrato) return { arrancado: false, motivo: 'sin-contrato' }

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

    // Cortesía: los días de búsqueda y postulación empiezan a contar el día en
    // que el cliente sube su documento (una sola vez). Si la tabla no existe
    // todavía, no pasa nada: el motor arranca igual.
    try {
      const { data: cortesia } = await servicio
        .from('cortesias')
        .select('id, dias, inicia_en')
        .eq('proyecto_id', proyectoId)
        .maybeSingle<{ id: string; dias: number; inicia_en: string | null }>()
      if (cortesia && !cortesia.inicia_en) {
        const ahora = new Date()
        await servicio
          .from('cortesias')
          .update({
            inicia_en: ahora.toISOString(),
            vence_en: new Date(ahora.getTime() + cortesia.dias * 86400000).toISOString(),
          })
          .eq('id', cortesia.id)
      }
    } catch {
      /* informativo */
    }

    // El motor tarda minutos. Se dispara por detrás para que quien subió el
    // archivo no se quede esperando con la pantalla congelada.
    after(async () => {
      try {
        await fetch(`${origen}/api/estructurar-proyecto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...cabecerasInternas() },
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
