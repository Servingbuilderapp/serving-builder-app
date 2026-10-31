import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { guardarEnBiblioteca, type ConvocatoriaEncontrada } from '@/lib/bibliotecaConvocatorias'
import { esEquipoServing } from '@/lib/guardiaEquipo'

/**
 * CENTINELA — CARGADOR SIMPLE.
 *
 * El equipo pega varias líneas con «nombre + enlace oficial» (una convocatoria por
 * línea) y todas quedan en la biblioteca. NO usa IA: leer las líneas es cosa de
 * código, así que cargar no cuesta nada (máximo 500 líneas por vez, para no pasar
 * el tiempo de Vercel).
 *
 * El detalle (fechas, monto, quién puede postular) lo completa después
 * /api/centinela/leer-enlaces, que lee cada enlace oficial.
 *
 * Una convocatoria que ya existía (mismo nombre) no se duplica: solo se completan
 * sus huecos. Becas, premios y ofertas de empleo no se guardan (regla del dueño).
 *
 * POST JSON { texto }  — solo el equipo de Serving.
 */

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const MAXIMO_LINEAS = 500
const REGEX_ENLACE = /https?:\/\/[^\s<>"')\]]+/i

/** «Nombre, https://…» / «Nombre | https://…» / «https://… Nombre» → { nombre, enlace } */
function leerLinea(linea: string): { nombre: string; enlace: string } | null {
  const coincidencia = linea.match(REGEX_ENLACE)
  if (!coincidencia) return null
  const enlace = coincidencia[0].replace(/[.,;]+$/, '')
  const nombre = linea
    .replace(coincidencia[0], ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s,;|:\-–—•*·]+/, '')
    .replace(/[\s,;|:\-–—]+$/, '')
    .trim()
  if (nombre.length < 4) return null
  return { nombre, enlace }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await esEquipoServing())) {
      return NextResponse.json({ error: 'Solo el equipo de Serving' }, { status: 401 })
    }
    const { texto } = (await req.json().catch(() => ({}))) as { texto?: string }
    const lineas = String(texto || '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    if (lineas.length === 0) {
      return NextResponse.json({ error: 'Pega al menos una línea con el nombre y el enlace.' }, { status: 400 })
    }
    if (lineas.length > MAXIMO_LINEAS) {
      return NextResponse.json({ error: `Son ${lineas.length} líneas. Pega máximo ${MAXIMO_LINEAS} por vez.` }, { status: 400 })
    }

    const lista: ConvocatoriaEncontrada[] = []
    const sinEnlace: string[] = []
    for (const linea of lineas) {
      const leida = leerLinea(linea)
      if (!leida) {
        sinEnlace.push(linea.slice(0, 80))
        continue
      }
      lista.push({
        nombre: leida.nombre,
        entidad: '',
        fuente_oficial: leida.enlace,
        informacion_faltante: 'Cargada a mano con nombre y enlace; falta leer el enlace oficial.',
      })
    }

    const guardadas = lista.length > 0 ? await guardarEnBiblioteca(supabase, lista) : new Map<string, string>()

    return NextResponse.json({
      ok: true,
      lineas: lineas.length,
      guardadas: guardadas.size,
      // Becas, premios, empleos o repetidas dentro de la misma lista: la biblioteca no las cuenta.
      noGuardadas: Math.max(0, lista.length - guardadas.size),
      sinEnlace,
    })
  } catch (e) {
    console.error('[Centinela cargar-lista] Error:', e)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
