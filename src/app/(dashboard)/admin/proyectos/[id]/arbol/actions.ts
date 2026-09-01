'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/* ==========================================================================
   Acciones del árbol de problemas.

   Esta pantalla es INTERNA: la usa el equipo de estructuración, no el cliente.
   Por eso cada acción vuelve a comprobar que quien la ejecuta es del equipo;
   una acción de servidor se puede llamar desde fuera, así que no basta con
   proteger la página.

   El árbol se guarda posición por posición: cada nodo se identifica por su
   tipo y su número de rama (1, 2 o 3). Así la pantalla siempre dibuja lo
   mismo en el mismo lugar y no depende del orden en que se creó.
   ========================================================================== */

const CORREO_ADMIN = 'servingbuilderapp@gmail.com'

export type TipoNodo =
  | 'CENTRAL'
  | 'CAUSA_DIRECTA'
  | 'CAUSA_INDIRECTA'
  | 'EFECTO_DIRECTO'
  | 'EFECTO_INDIRECTO'

export type NodoArbol = {
  tipo: TipoNodo
  orden: number
  descripcion: string
  evidenciaFuente: string
  evidenciaUrl: string
  evidenciaNota: string
}

export type Resultado = { ok: boolean; mensaje: string }

type FilaExistente = {
  id: string
  tipo: string
  orden: number | null
  descripcion: string
}

const clave = (tipo: string, orden: number | null) => `${tipo}:${orden ?? 1}`

function limpiar(texto: unknown): string {
  return typeof texto === 'string' ? texto.trim() : ''
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
 * Guarda el árbol completo y la magnitud del problema.
 *
 * Ojo: si se deja en blanco el texto de una causa o un efecto, ese nodo se
 * borra, y con él se borra el objetivo espejo que colgaba de él. La pantalla
 * lo advierte antes de guardar.
 */
export async function guardarArbol(
  proyectoId: string,
  nodos: NodoArbol[],
  lineaBase: string,
): Promise<Resultado> {
  if (!proyectoId) return { ok: false, mensaje: 'Falta el proyecto.' }

  const supabase = await clienteDelEquipo()
  if (!supabase) return { ok: false, mensaje: 'Esta pantalla es solo para el equipo.' }

  const { data: existentesRaw, error: errorLectura } = await supabase
    .from('problemas_proyecto')
    .select('id, tipo, orden, descripcion')
    .eq('proyecto_id', proyectoId)

  if (errorLectura) {
    return { ok: false, mensaje: 'No se pudo leer el árbol guardado. Intenta de nuevo.' }
  }

  const existentes = new Map<string, FilaExistente>()
  for (const fila of (existentesRaw || []) as FilaExistente[]) {
    existentes.set(clave(fila.tipo, fila.orden), fila)
  }

  // Los padres se guardan primero para poder colgar de ellos a los hijos.
  const orden: TipoNodo[] = [
    'CENTRAL',
    'CAUSA_DIRECTA',
    'EFECTO_DIRECTO',
    'CAUSA_INDIRECTA',
    'EFECTO_INDIRECTO',
  ]

  const idPorClave = new Map<string, string>()
  for (const [k, fila] of existentes) idPorClave.set(k, fila.id)

  const padreDe = (nodo: NodoArbol): string | null => {
    if (nodo.tipo === 'CENTRAL') return null
    if (nodo.tipo === 'CAUSA_DIRECTA' || nodo.tipo === 'EFECTO_DIRECTO') {
      return idPorClave.get(clave('CENTRAL', 1)) ?? null
    }
    if (nodo.tipo === 'CAUSA_INDIRECTA') {
      return idPorClave.get(clave('CAUSA_DIRECTA', nodo.orden)) ?? null
    }
    return idPorClave.get(clave('EFECTO_DIRECTO', nodo.orden)) ?? null
  }

  const paraBorrar: string[] = []

  for (const tipo of orden) {
    for (const nodo of nodos.filter((n) => n.tipo === tipo)) {
      const k = clave(nodo.tipo, nodo.orden)
      const fila = existentes.get(k)
      const texto = limpiar(nodo.descripcion)

      if (!texto) {
        if (fila) paraBorrar.push(fila.id)
        idPorClave.delete(k)
        continue
      }

      const campos = {
        descripcion: texto,
        evidencia_fuente: limpiar(nodo.evidenciaFuente) || null,
        evidencia_url: limpiar(nodo.evidenciaUrl) || null,
        evidencia_nota: limpiar(nodo.evidenciaNota) || null,
        padre_id: padreDe(nodo),
        actualizado_en: new Date().toISOString(),
      }

      if (fila) {
        const { error } = await supabase
          .from('problemas_proyecto')
          .update(campos)
          .eq('id', fila.id)
        if (error) return { ok: false, mensaje: 'No se pudo guardar un nodo del árbol.' }
        idPorClave.set(k, fila.id)
      } else {
        const { data, error } = await supabase
          .from('problemas_proyecto')
          .insert({ proyecto_id: proyectoId, tipo: nodo.tipo, orden: nodo.orden, ...campos })
          .select('id')
          .single()
        if (error || !data) return { ok: false, mensaje: 'No se pudo crear un nodo del árbol.' }
        idPorClave.set(k, data.id as string)
      }
    }
  }

  if (paraBorrar.length > 0) {
    const { error } = await supabase.from('problemas_proyecto').delete().in('id', paraBorrar)
    if (error) return { ok: false, mensaje: 'No se pudieron borrar los nodos vacíos.' }
  }

  const idCentral = idPorClave.get(clave('CENTRAL', 1))
  if (idCentral) {
    await supabase
      .from('problemas_proyecto')
      .update({ linea_base: limpiar(lineaBase) || null })
      .eq('id', idCentral)
  }

  revalidatePath(`/admin/proyectos/${proyectoId}/arbol`)
  return { ok: true, mensaje: 'Árbol guardado.' }
}

/**
 * Guarda la revisión de las 12 preguntas que recorren el árbol enlace por
 * enlace. Es una revisión interna del equipo, no la ve el cliente.
 */
export async function guardarValidacion(
  proyectoId: string,
  respuestas: Record<string, string>,
  notas: Record<string, string>,
): Promise<Resultado> {
  if (!proyectoId) return { ok: false, mensaje: 'Falta el proyecto.' }

  const supabase = await clienteDelEquipo()
  if (!supabase) return { ok: false, mensaje: 'Esta pantalla es solo para el equipo.' }

  const { error } = await supabase.from('validaciones_arbol').upsert(
    {
      proyecto_id: proyectoId,
      respuestas_json: respuestas,
      notas_json: notas,
      actualizado_en: new Date().toISOString(),
    },
    { onConflict: 'proyecto_id' },
  )

  if (error) return { ok: false, mensaje: 'No se pudo guardar la revisión.' }

  revalidatePath(`/admin/proyectos/${proyectoId}/arbol`)
  return { ok: true, mensaje: 'Revisión guardada.' }
}

/**
 * Deja escrita una pregunta para el cliente. Aparece en su panel colgada del
 * paso que se elija, que es donde el cliente ya está acostumbrado a verlas.
 */
export async function crearPregunta(
  proyectoId: string,
  pasoId: string,
  pregunta: string,
  critico: boolean,
): Promise<Resultado> {
  if (!proyectoId) return { ok: false, mensaje: 'Falta el proyecto.' }
  if (!pasoId) return { ok: false, mensaje: 'Elige a qué paso pertenece la pregunta.' }
  if (!limpiar(pregunta)) return { ok: false, mensaje: 'Escribe la pregunta.' }

  const supabase = await clienteDelEquipo()
  if (!supabase) return { ok: false, mensaje: 'Esta pantalla es solo para el equipo.' }

  const { error } = await supabase.from('preguntas_pendientes_proyecto').insert({
    id_proyecto: proyectoId,
    id_paso: pasoId,
    pregunta: limpiar(pregunta),
    critico,
  })

  if (error) return { ok: false, mensaje: 'No se pudo dejar la pregunta.' }

  revalidatePath(`/admin/proyectos/${proyectoId}/arbol`)
  return { ok: true, mensaje: 'Pregunta enviada al cliente.' }
}
