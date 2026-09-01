'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/* ==========================================================================
   Acciones de la cadena de valor.

   Pantalla INTERNA del equipo de estructuración. El cliente no llena nada
   de esto.

   Una fila de `cadena_valor_actividades` por cada objetivo específico:
   producto, unidad de medida, meta, responsable, duración y las actividades
   (que van en tareas_json). La fila cuelga del objetivo por
   objetivo_especifico_id, así que el amarre queda en la base de datos.

   Ojo con la tabla: producto_mga, unidad_medida, meta, responsable y
   duracion_meses son NOT NULL y no tienen valor por defecto. Por eso una
   fila incompleta no se guarda a medias: o está completa, o se borra.
   ========================================================================== */

const CORREO_ADMIN = 'servingbuilderapp@gmail.com'

export type FilaAGuardar = {
  objetivoId: string
  producto: string
  unidadMedida: string
  meta: string
  responsable: string
  duracionMeses: string
  rutaCritica: boolean
  actividades: string[]
}

export type Resultado = { ok: boolean; mensaje: string }

function limpiar(texto: unknown): string {
  return typeof texto === 'string' ? texto.trim() : ''
}

function aNumero(texto: string): number | null {
  const n = Number(String(texto).replace(',', '.').trim())
  return Number.isFinite(n) ? n : null
}

/** Devuelve el cliente de Supabase solo si quien llama es del equipo. */
async function clienteDelEquipo() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null
  if ((user.email || '').toLowerCase().trim() === CORREO_ADMIN) return supabase

  const { data: perfil } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle<{ role: string | null }>()

  return perfil?.role === 'admin' ? supabase : null
}

/**
 * Guarda la cadena de valor completa.
 *
 * Una fila a la que le falte algún dato obligatorio se considera todavía sin
 * llenar: si ya existía se borra, y si no existía no se crea. Nunca se
 * inventan valores para completar la fila.
 */
export async function guardarCadenaValor(
  proyectoId: string,
  filas: FilaAGuardar[],
): Promise<Resultado> {
  if (!proyectoId) return { ok: false, mensaje: 'Falta el proyecto.' }

  const supabase = await clienteDelEquipo()
  if (!supabase) return { ok: false, mensaje: 'Esta pantalla es solo para el equipo.' }

  const idsObjetivos = filas.map((f) => f.objetivoId).filter(Boolean)
  if (idsObjetivos.length === 0) {
    return { ok: false, mensaje: 'No hay objetivos específicos a los que colgarle la cadena.' }
  }

  // Se comprueba que todos los objetivos sean de ESTE proyecto: los ids
  // llegan desde el navegador y no se pueden dar por buenos.
  const { data: objetivosRaw, error: errorObjetivos } = await supabase
    .from('objetivos_proyecto')
    .select('id')
    .eq('proyecto_id', proyectoId)
    .in('id', idsObjetivos)

  if (errorObjetivos) {
    return { ok: false, mensaje: 'No se pudieron comprobar los objetivos del proyecto.' }
  }

  const objetivosDelProyecto = new Set(
    ((objetivosRaw || []) as { id: string }[]).map((o) => o.id),
  )

  const { data: existentesRaw, error: errorLectura } = await supabase
    .from('cadena_valor_actividades')
    .select('id, objetivo_especifico_id')
    .in('objetivo_especifico_id', idsObjetivos)

  if (errorLectura) {
    return { ok: false, mensaje: 'No se pudo leer la cadena de valor guardada.' }
  }

  const existentes = new Map<string, string>()
  for (const fila of (existentesRaw || []) as {
    id: string
    objetivo_especifico_id: string
  }[]) {
    existentes.set(fila.objetivo_especifico_id, fila.id)
  }

  const paraBorrar: string[] = []
  let guardadas = 0
  let incompletas = 0

  for (const fila of filas) {
    if (!objetivosDelProyecto.has(fila.objetivoId)) continue

    const producto = limpiar(fila.producto)
    const unidad = limpiar(fila.unidadMedida)
    const responsable = limpiar(fila.responsable)
    const meta = aNumero(fila.meta)
    const duracion = aNumero(fila.duracionMeses)
    const actividades = (fila.actividades || []).map(limpiar).filter((a) => a.length > 0)

    const completa =
      producto.length > 0 &&
      unidad.length > 0 &&
      responsable.length > 0 &&
      meta !== null &&
      meta > 0 &&
      duracion !== null &&
      duracion > 0 &&
      actividades.length > 0

    const idExistente = existentes.get(fila.objetivoId)

    if (!completa) {
      if (idExistente) paraBorrar.push(idExistente)
      if (
        producto || unidad || responsable || limpiar(fila.meta) ||
        limpiar(fila.duracionMeses) || actividades.length > 0
      ) {
        incompletas += 1
      }
      continue
    }

    const campos = {
      producto_mga: producto,
      unidad_medida: unidad.slice(0, 100),
      meta,
      responsable: responsable.slice(0, 255),
      duracion_meses: Math.round(duracion as number),
      ruta_critica: Boolean(fila.rutaCritica),
      tareas_json: actividades,
    }

    if (idExistente) {
      const { error } = await supabase
        .from('cadena_valor_actividades')
        .update(campos)
        .eq('id', idExistente)
      if (error) return { ok: false, mensaje: 'No se pudo guardar una fila de la cadena.' }
    } else {
      const { error } = await supabase.from('cadena_valor_actividades').insert({
        objetivo_especifico_id: fila.objetivoId,
        ...campos,
      })
      if (error) return { ok: false, mensaje: 'No se pudo crear una fila de la cadena.' }
    }
    guardadas += 1
  }

  if (paraBorrar.length > 0) {
    const { error } = await supabase
      .from('cadena_valor_actividades')
      .delete()
      .in('id', paraBorrar)
    if (error) return { ok: false, mensaje: 'No se pudieron borrar las filas vacías.' }
  }

  revalidatePath(`/admin/proyectos/${proyectoId}/cadena-valor`)

  if (incompletas > 0) {
    return {
      ok: true,
      mensaje:
        guardadas > 0
          ? `Se guardaron ${guardadas}. Quedaron ${incompletas} a medias y esas no se guardan hasta estar completas.`
          : `Ninguna quedó completa: faltan datos en ${incompletas}. Una fila se guarda solo con producto, unidad, meta, responsable, duración y al menos una actividad.`,
    }
  }

  return { ok: true, mensaje: 'Cadena de valor guardada.' }
}
