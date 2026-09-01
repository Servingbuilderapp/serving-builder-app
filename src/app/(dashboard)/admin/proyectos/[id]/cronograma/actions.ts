'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/* ==========================================================================
   Acciones del cronograma.

   Pantalla INTERNA del equipo de estructuración.

   Cada barra del cronograma es una actividad de la cadena de valor: la fila
   de la cadena (cadena_valor_id) más la posición de la actividad dentro de
   esa fila (actividad_indice).
   ========================================================================== */

const CORREO_ADMIN = 'servingbuilderapp@gmail.com'

// Tope duro de meses. La pantalla tiene su propia copia de este número:
// desde un archivo 'use server' solo se pueden exportar funciones async.
const MESES_MAXIMO = 60

export type BarraAGuardar = {
  cadenaValorId: string
  actividadIndice: number
  mesInicio: number
  mesFin: number
  entregable: string
}

export type Resultado = { ok: boolean; mensaje: string }

function limpiar(texto: unknown): string {
  return typeof texto === 'string' ? texto.trim() : ''
}

function entero(valor: unknown, porDefecto: number): number {
  const n = Math.round(Number(valor))
  return Number.isFinite(n) ? n : porDefecto
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
 * Guarda la duración del proyecto y las barras del cronograma.
 *
 * Los meses se recortan al rango del proyecto y se ordenan (si el fin queda
 * antes del inicio se iguala al inicio), porque la tabla tiene una regla que
 * lo exige y de otro modo la operación entera fallaría.
 */
export async function guardarCronograma(
  proyectoId: string,
  duracionTotalMeses: string,
  fechaInicio: string,
  notas: string,
  barras: BarraAGuardar[],
): Promise<Resultado> {
  if (!proyectoId) return { ok: false, mensaje: 'Falta el proyecto.' }

  const supabase = await clienteDelEquipo()
  if (!supabase) return { ok: false, mensaje: 'Esta pantalla es solo para el equipo.' }

  const duracion = Math.max(1, Math.min(MESES_MAXIMO, entero(duracionTotalMeses, 12)))
  const fecha = limpiar(fechaInicio)

  const { error: errorProyecto } = await supabase.from('cronograma_proyecto').upsert(
    {
      proyecto_id: proyectoId,
      duracion_total_meses: duracion,
      fecha_inicio: fecha || null,
      notas: limpiar(notas) || null,
      actualizado_en: new Date().toISOString(),
    },
    { onConflict: 'proyecto_id' },
  )

  if (errorProyecto) {
    return { ok: false, mensaje: 'No se pudo guardar la duración del proyecto.' }
  }

  /* --- Barras ------------------------------------------------------------ */

  // Las filas de la cadena de valor que llegan del navegador se comprueban
  // contra las de este proyecto: los ids no se pueden dar por buenos.
  const { data: objetivosRaw } = await supabase
    .from('objetivos_proyecto')
    .select('id')
    .eq('proyecto_id', proyectoId)

  const idsObjetivos = ((objetivosRaw || []) as { id: string }[]).map((o) => o.id)

  let idsCadenaValidos = new Set<string>()
  if (idsObjetivos.length > 0) {
    const { data: cadenaRaw } = await supabase
      .from('cadena_valor_actividades')
      .select('id')
      .in('objetivo_especifico_id', idsObjetivos)
    idsCadenaValidos = new Set(((cadenaRaw || []) as { id: string }[]).map((c) => c.id))
  }

  const filas = barras
    .filter((b) => idsCadenaValidos.has(b.cadenaValorId))
    .map((b) => {
      const inicio = Math.max(1, Math.min(duracion, entero(b.mesInicio, 1)))
      const fin = Math.max(inicio, Math.min(duracion, entero(b.mesFin, inicio)))
      return {
        proyecto_id: proyectoId,
        cadena_valor_id: b.cadenaValorId,
        actividad_indice: Math.max(0, Math.min(5, entero(b.actividadIndice, 0))),
        mes_inicio: inicio,
        mes_fin: fin,
        entregable: limpiar(b.entregable) || null,
        actualizado_en: new Date().toISOString(),
      }
    })

  if (filas.length > 0) {
    const { error } = await supabase
      .from('cronograma_actividades')
      .upsert(filas, { onConflict: 'cadena_valor_id,actividad_indice' })
    if (error) return { ok: false, mensaje: 'No se pudieron guardar las fechas de las actividades.' }
  }

  revalidatePath(`/admin/proyectos/${proyectoId}/cronograma`)

  return {
    ok: true,
    mensaje: `Cronograma guardado: ${filas.length} ${
      filas.length === 1 ? 'actividad ubicada' : 'actividades ubicadas'
    } en ${duracion} meses.`,
  }
}
