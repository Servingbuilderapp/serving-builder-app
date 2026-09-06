import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { esEquipoServing } from '@/lib/guardiaEquipo'
import { claveDeFuente } from '@/lib/centinela'

/**
 * LAS FUENTES DEL CENTINELA DIGITAL
 *
 * POST  /api/centinela/fuentes   agrega una fuente nueva
 * PATCH /api/centinela/fuentes   cambia el estado, el nivel o los datos de una
 *
 * Solo el equipo de Serving. La tabla no tiene permiso de escritura por fila a
 * propósito: todo pasa por aquí, con la llave de servicio y este candado.
 */

function cliente() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

const NIVELES_VALIDOS = [0, 1, 2, 3, 9]
const ESTADOS_VALIDOS = [
  'pendiente',
  'suscrito',
  'confirmado',
  'sin_boletin',
  'sin_revisar',
  'no_aplica',
  'descartada',
]

/** Vacío y null son lo mismo: "no se sabe". Nunca se guarda cadena vacía. */
function texto(v: unknown): string | null {
  if (v === undefined || v === null) return null
  const s = String(v).trim()
  return s === '' ? null : s
}

export async function POST(peticion: Request) {
  if (!(await esEquipoServing())) {
    return NextResponse.json({ error: 'Solo el equipo de Serving.' }, { status: 403 })
  }

  let cuerpo: Record<string, unknown>
  try {
    cuerpo = await peticion.json()
  } catch {
    return NextResponse.json({ error: 'No se entendió lo que llegó.' }, { status: 400 })
  }

  const nombre = texto(cuerpo.nombre)
  if (!nombre) {
    return NextResponse.json({ error: 'La fuente necesita nombre.' }, { status: 400 })
  }

  const nivel = Number(cuerpo.nivel)
  if (!NIVELES_VALIDOS.includes(nivel)) {
    return NextResponse.json({ error: 'Ese nivel no existe.' }, { status: 400 })
  }

  const estado = texto(cuerpo.estado) || 'pendiente'
  if (!ESTADOS_VALIDOS.includes(estado)) {
    return NextResponse.json({ error: 'Ese estado no existe.' }, { status: 400 })
  }

  const db = cliente()

  // Si ya está guardada con ese mismo nombre, no se duplica: se avisa.
  const { data: existentes } = await db.from('centinela_fuentes').select('id, nombre')
  const clave = claveDeFuente(nombre)
  const repetida = (existentes || []).find(
    (f: { id: string; nombre: string }) => claveDeFuente(f.nombre) === clave,
  )
  if (repetida) {
    return NextResponse.json(
      { error: `"${repetida.nombre}" ya está en la lista.`, id: repetida.id },
      { status: 409 },
    )
  }

  const { data, error } = await db
    .from('centinela_fuentes')
    .insert({
      nombre,
      categoria: texto(cuerpo.categoria) || 'Agregadas a mano',
      nivel,
      estado,
      url: texto(cuerpo.url),
      url_newsletter: texto(cuerpo.url_newsletter),
      correo_remitente: texto(cuerpo.correo_remitente),
      notas: texto(cuerpo.notas),
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: data.id })
}

export async function PATCH(peticion: Request) {
  if (!(await esEquipoServing())) {
    return NextResponse.json({ error: 'Solo el equipo de Serving.' }, { status: 403 })
  }

  let cuerpo: Record<string, unknown>
  try {
    cuerpo = await peticion.json()
  } catch {
    return NextResponse.json({ error: 'No se entendió lo que llegó.' }, { status: 400 })
  }

  const id = texto(cuerpo.id)
  if (!id) {
    return NextResponse.json({ error: 'Falta decir cuál fuente.' }, { status: 400 })
  }

  const cambios: Record<string, unknown> = { actualizado_en: new Date().toISOString() }

  if (cuerpo.estado !== undefined) {
    const estado = texto(cuerpo.estado)
    if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
      return NextResponse.json({ error: 'Ese estado no existe.' }, { status: 400 })
    }
    cambios.estado = estado
    cambios.ultima_revision = new Date().toISOString()
    // El día que empieza a llegar el boletín queda registrado una sola vez:
    // es la fecha desde la cual esta fuente está de verdad en funcionamiento.
    if (estado === 'confirmado') {
      const { data: actual } = await cliente()
        .from('centinela_fuentes')
        .select('primer_correo_en')
        .eq('id', id)
        .maybeSingle<{ primer_correo_en: string | null }>()
      if (!actual?.primer_correo_en) {
        cambios.primer_correo_en = new Date().toISOString()
      }
    }
  }

  if (cuerpo.nivel !== undefined) {
    const nivel = Number(cuerpo.nivel)
    if (!NIVELES_VALIDOS.includes(nivel)) {
      return NextResponse.json({ error: 'Ese nivel no existe.' }, { status: 400 })
    }
    cambios.nivel = nivel
  }

  // Estos campos sí se pueden dejar vacíos a propósito, así que se guardan
  // aunque queden en null: es la forma de borrar un dato que estaba mal.
  for (const campo of ['url', 'url_newsletter', 'correo_remitente', 'notas', 'categoria']) {
    if (cuerpo[campo] !== undefined) cambios[campo] = texto(cuerpo[campo])
  }

  const { error } = await cliente().from('centinela_fuentes').update(cambios).eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
