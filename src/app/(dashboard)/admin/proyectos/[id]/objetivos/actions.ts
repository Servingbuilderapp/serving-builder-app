'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/* ==========================================================================
   Acciones del árbol de objetivos.

   Pantalla INTERNA del equipo. Cada objetivo cuelga del nodo del árbol de
   problemas que le corresponde (columna problema_id), así que el espejo queda
   amarrado en la base de datos y no solo en la pantalla.
   ========================================================================== */

const CORREO_ADMIN = 'servingbuilderapp@gmail.com'

export type TipoObjetivo =
  | 'GENERAL'
  | 'ESPECIFICO_TECNICO'
  | 'ACTIVIDAD'
  | 'FIN_DIRECTO'
  | 'FIN_INDIRECTO'

export type ObjetivoAGuardar = {
  problemaId: string
  tipo: TipoObjetivo
  descripcion: string
}

export type Resultado = { ok: boolean; mensaje: string }

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
 * Guarda el árbol de objetivos completo.
 *
 * Un objetivo en blanco se borra: significa que ese nodo todavía no tiene su
 * espejo escrito. El nodo del árbol de problemas no se toca.
 */
export async function guardarObjetivos(
  proyectoId: string,
  objetivos: ObjetivoAGuardar[],
): Promise<Resultado> {
  if (!proyectoId) return { ok: false, mensaje: 'Falta el proyecto.' }

  const supabase = await clienteDelEquipo()
  if (!supabase) return { ok: false, mensaje: 'Esta pantalla es solo para el equipo.' }

  const { data: existentesRaw, error: errorLectura } = await supabase
    .from('objetivos_proyecto')
    .select('id, problema_id')
    .eq('proyecto_id', proyectoId)

  if (errorLectura) {
    return { ok: false, mensaje: 'No se pudieron leer los objetivos guardados.' }
  }

  const existentes = new Map<string, string>()
  for (const fila of (existentesRaw || []) as { id: string; problema_id: string }[]) {
    existentes.set(fila.problema_id, fila.id)
  }

  // El objetivo general se guarda primero: los demás cuelgan de él.
  const enOrden = [...objetivos].sort((a, b) =>
    a.tipo === 'GENERAL' ? -1 : b.tipo === 'GENERAL' ? 1 : 0,
  )

  let idGeneral: string | null = null
  const paraBorrar: string[] = []

  for (const objetivo of enOrden) {
    const texto = (objetivo.descripcion || '').trim()
    const idExistente = existentes.get(objetivo.problemaId)

    if (!texto) {
      if (idExistente) paraBorrar.push(idExistente)
      continue
    }

    const campos = {
      descripcion: texto,
      tipo: objetivo.tipo,
      padre_id: objetivo.tipo === 'GENERAL' ? null : idGeneral,
    }

    if (idExistente) {
      const { error } = await supabase
        .from('objetivos_proyecto')
        .update(campos)
        .eq('id', idExistente)
      if (error) return { ok: false, mensaje: 'No se pudo guardar un objetivo.' }
      if (objetivo.tipo === 'GENERAL') idGeneral = idExistente
    } else {
      const { data, error } = await supabase
        .from('objetivos_proyecto')
        .insert({
          proyecto_id: proyectoId,
          problema_id: objetivo.problemaId,
          ...campos,
        })
        .select('id')
        .single()
      if (error || !data) return { ok: false, mensaje: 'No se pudo crear un objetivo.' }
      if (objetivo.tipo === 'GENERAL') idGeneral = data.id as string
    }
  }

  if (paraBorrar.length > 0) {
    const { error } = await supabase.from('objetivos_proyecto').delete().in('id', paraBorrar)
    if (error) return { ok: false, mensaje: 'No se pudieron borrar los objetivos vacíos.' }
  }

  revalidatePath(`/admin/proyectos/${proyectoId}/objetivos`)
  return { ok: true, mensaje: 'Árbol de objetivos guardado.' }
}
