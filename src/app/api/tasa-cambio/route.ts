import { NextResponse } from 'next/server'
import { obtenerTasa, IVA_COLOMBIA } from '@/lib/tasaCambio'

export const dynamic = 'force-dynamic'

/** Devuelve la tasa del día (TRM) y el IVA, para mostrar el precio en pesos. */
export async function GET() {
  const t = await obtenerTasa()
  return NextResponse.json({ ...t, iva: IVA_COLOMBIA })
}
