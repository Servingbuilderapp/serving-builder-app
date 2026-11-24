import { NextResponse } from 'next/server'
import { buscarAliado } from '@/lib/aliados'

/**
 * Dice si un código de aliado existe. Solo devuelve el porcentaje y el nombre;
 * nunca la lista de códigos.
 */
export async function GET(req: Request) {
  const codigo = new URL(req.url).searchParams.get('codigo')
  const aliado = await buscarAliado(codigo)
  if (!aliado) return NextResponse.json({ valido: false })
  return NextResponse.json({ valido: true, nombre: aliado.nombre, porcentaje: aliado.porcentaje, codigo: aliado.codigo })
}
