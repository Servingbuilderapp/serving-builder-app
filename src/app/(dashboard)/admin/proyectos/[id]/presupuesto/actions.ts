'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/* ==========================================================================
   Acciones del presupuesto.

   Pantalla INTERNA del equipo de estructuración.

   Cada ítem cuelga de una actividad de la cadena de valor: la fila de la
   cadena (cadena_valor_id) más la posición de la actividad dentro de esa
   fila (actividad_indice). Así el evaluador puede ver qué actividad
   justifica cada peso, que es lo que piden los formatos.
   ========================================================================== */

const CORREO_ADMIN = 'servingbuilderapp@gmail.com'

export const RUBROS = [
  'TALENTO_HUMANO',
  'EQUIPOS_Y_SOFTWARE',
  'MATERIALES_E_INSUMOS',
  'CAPACITACION',
  'GASTOS_DE_VIAJE',
  'OTROS',
] as const

export type Rubro = (typeof RUBROS)[number]

export const FUENTES = ['SOLICITADO', 'CONTRAPARTIDA'] as const
export type Fuente = (typeof FUENTES)[number]

export type ReglasAGuardar = {
  moneda: string
  montoMaximo: string
  contrapartidaMinimaPct: string
  imprevistosPct: string
  rubrosNoFinanciables: string
  notas: string
}

export type ItemAGuardar = {
  /** Vacío cuando el ítem se acaba de agregar en pantalla. */
  id: string
  cadenaValorId: string
  actividadIndice: number
  rubro: string
  descripcion: string
  especificaciones: string
  justificacion: string
  unidad: string
  cantidad: string
  valorUnitario: string
  fuente: string
  orden: number
}

export type Resultado = { ok: boolean; mensaje: string }

function limpiar(texto: unknown): string {
  return typeof texto === 'string' ? texto.trim() : ''
}

function aNumero(texto: string, porDefecto = 0): number {
  const n = Number(String(texto).replace(/\s/g, '').replace(',', '.'))
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
 * Guarda las reglas de plata de la convocatoria y el detalle del presupuesto.
 *
 * Un ítem sin descripción se considera vacío: si ya existía se borra, y si es
 * nuevo no se crea. Nunca se rellena un dato que el equipo no escribió.
 */
export async function guardarPresupuesto(
  proyectoId: string,
  reglas: ReglasAGuardar,
  items: ItemAGuardar[],
): Promise<Resultado> {
  if (!proyectoId) return { ok: false, mensaje: 'Falta el proyecto.' }

  const supabase = await clienteDelEquipo()
  if (!supabase) return { ok: false, mensaje: 'Esta pantalla es solo para el equipo.' }

  /* --- Reglas de la convocatoria ----------------------------------------- */

  const montoMaximoTexto = limpiar(reglas.montoMaximo)
  const filaReglas = {
    proyecto_id: proyectoId,
    moneda: (limpiar(reglas.moneda) || 'COP').slice(0, 10),
    monto_maximo: montoMaximoTexto ? aNumero(montoMaximoTexto) : null,
    contrapartida_minima_pct: aNumero(limpiar(reglas.contrapartidaMinimaPct), 0),
    imprevistos_pct: aNumero(limpiar(reglas.imprevistosPct), 0),
    rubros_no_financiables: limpiar(reglas.rubrosNoFinanciables) || null,
    notas: limpiar(reglas.notas) || null,
    actualizado_en: new Date().toISOString(),
  }

  const { error: errorReglas } = await supabase
    .from('presupuesto_proyecto')
    .upsert(filaReglas, { onConflict: 'proyecto_id' })

  if (errorReglas) {
    return { ok: false, mensaje: 'No se pudieron guardar las reglas de la convocatoria.' }
  }

  /* --- Detalle ----------------------------------------------------------- */

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

  const { data: existentesRaw, error: errorLectura } = await supabase
    .from('presupuesto_items')
    .select('id')
    .eq('proyecto_id', proyectoId)

  if (errorLectura) {
    return { ok: false, mensaje: 'No se pudo leer el presupuesto guardado.' }
  }

  const existentes = new Set(((existentesRaw || []) as { id: string }[]).map((f) => f.id))
  const sobreviven = new Set<string>()
  let guardados = 0

  for (const item of items) {
    if (!idsCadenaValidos.has(item.cadenaValorId)) continue

    const descripcion = limpiar(item.descripcion)
    if (!descripcion) continue

    const rubro = (RUBROS as readonly string[]).includes(item.rubro)
      ? (item.rubro as Rubro)
      : 'OTROS'
    const fuente = (FUENTES as readonly string[]).includes(item.fuente)
      ? (item.fuente as Fuente)
      : 'SOLICITADO'

    const campos = {
      proyecto_id: proyectoId,
      cadena_valor_id: item.cadenaValorId,
      actividad_indice: Math.max(0, Math.min(5, Math.round(item.actividadIndice || 0))),
      rubro,
      descripcion,
      especificaciones: limpiar(item.especificaciones) || null,
      justificacion: limpiar(item.justificacion) || null,
      unidad: (limpiar(item.unidad) || 'unidad').slice(0, 60),
      cantidad: Math.max(0, aNumero(item.cantidad, 0)),
      valor_unitario: Math.max(0, aNumero(item.valorUnitario, 0)),
      fuente,
      orden: Math.max(1, Math.round(item.orden || 1)),
      actualizado_en: new Date().toISOString(),
    }

    if (item.id && existentes.has(item.id)) {
      const { error } = await supabase
        .from('presupuesto_items')
        .update(campos)
        .eq('id', item.id)
        .eq('proyecto_id', proyectoId)
      if (error) return { ok: false, mensaje: 'No se pudo guardar un ítem del presupuesto.' }
      sobreviven.add(item.id)
    } else {
      const { error } = await supabase.from('presupuesto_items').insert(campos)
      if (error) return { ok: false, mensaje: 'No se pudo crear un ítem del presupuesto.' }
    }
    guardados += 1
  }

  const paraBorrar = [...existentes].filter((id) => !sobreviven.has(id))
  if (paraBorrar.length > 0) {
    const { error } = await supabase
      .from('presupuesto_items')
      .delete()
      .in('id', paraBorrar)
      .eq('proyecto_id', proyectoId)
    if (error) return { ok: false, mensaje: 'No se pudieron borrar los ítems que se quitaron.' }
  }

  revalidatePath(`/admin/proyectos/${proyectoId}/presupuesto`)

  return {
    ok: true,
    mensaje:
      guardados > 0
        ? `Presupuesto guardado: ${guardados} ${guardados === 1 ? 'ítem' : 'ítems'}.`
        : 'Se guardaron las reglas. Todavía no hay ítems escritos.',
  }
}
