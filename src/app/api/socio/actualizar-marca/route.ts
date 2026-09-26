import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { obtenerSocioDeUsuario } from '@/lib/guardiaSocio'

/**
 * El socio de marca blanca actualiza SU PROPIO logo y color — nunca precios
 * ni ningún otro dato de configuración (eso lo define Serving desde
 * /admin/marca-blanca). Por eso este candado usa `obtenerSocioDeUsuario`
 * para saber de qué socio es el usuario que llama, y solo actualiza esa
 * fila — nunca recibe ni usa un socioId que venga del cliente.
 */
export async function POST(req: Request) {
  try {
    const infoSocio = await obtenerSocioDeUsuario()
    if (!infoSocio.esSocio) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { logoUrl, colorPrimario } = await req.json()

    if (logoUrl !== null && logoUrl !== undefined && typeof logoUrl !== 'string') {
      return NextResponse.json({ error: 'El logo no llegó bien' }, { status: 400 })
    }

    if (colorPrimario !== null && colorPrimario !== undefined) {
      if (typeof colorPrimario !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(colorPrimario)) {
        return NextResponse.json({ error: 'El color debe ser un código como #1D4ED8' }, { status: 400 })
      }
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('socios')
      .update({
        ...(logoUrl !== undefined ? { logo_url: logoUrl || null } : {}),
        ...(colorPrimario !== undefined ? { color_primario: colorPrimario || null } : {}),
      })
      .eq('id', infoSocio.socioId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudo guardar la marca'
    return NextResponse.json({ error: mensaje }, { status: 500 })
  }
}
