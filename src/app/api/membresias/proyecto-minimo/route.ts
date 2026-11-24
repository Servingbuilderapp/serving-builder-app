import { NextResponse } from 'next/server'

/** Retirada: el "Proyecto mínimo viable" fue reemplazado por "Mis proyectos". */
export async function POST() {
  return NextResponse.json({ error: 'Esta función ya no existe. Usa Mis proyectos.' }, { status: 410 })
}
