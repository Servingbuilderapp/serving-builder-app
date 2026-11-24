import { NextResponse } from 'next/server'

/** Retirada: el miembro postula él mismo. Ya no se le pide al equipo que postule por él. */
export async function POST() {
  return NextResponse.json({ error: 'Esta función ya no existe: ahora postulas tú mismo desde la convocatoria.' }, { status: 410 })
}
