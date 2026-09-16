import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const CORREO_ADMIN = 'servingbuilderapp@gmail.com'

async function esEquipoServing() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false
  if ((user.email || '').toLowerCase().trim() === CORREO_ADMIN) return true
  const { data: perfil } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle<{ role: string | null }>()
  return perfil?.role === 'admin'
}

/**
 * Crea un socio de marca blanca (por ejemplo, el gremio que trae volumen).
 * Solo el equipo de Serving puede crearlos.
 */
export async function POST(req: Request) {
  try {
    if (!(await esEquipoServing())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { nombre, marca, contactoNombre, contactoCorreo, contactoTelefono } = await req.json()
    if (!nombre || !String(nombre).trim()) {
      return NextResponse.json({ error: 'Falta el nombre del socio' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('socios')
      .insert({
        nombre: String(nombre).trim(),
        marca: marca || null,
        contacto_nombre: contactoNombre || null,
        contacto_correo: contactoCorreo || null,
        contacto_telefono: contactoTelefono || null,
      })
      .select('id, nombre')
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, socio: data })
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al crear el socio'
    return NextResponse.json({ error: mensaje }, { status: 500 })
  }
}
